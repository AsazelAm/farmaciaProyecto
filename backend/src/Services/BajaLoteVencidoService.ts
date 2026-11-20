import type { PoolConnection } from 'mariadb';
import conectar from '../config/db';
import DataBajaLoteVencido, {
    ACCIONES_BAJA,
    AccionBaja,
    DIAS_DETECCION_PERMITIDOS,
    IDevolucionParaBaja,
    IFiltrosBaja,
    IFiltrosDeteccion,
    IFiltrosReporte,
    IRegistrarBajaInput,
} from '../Models/BajaLoteVencidoModels';
import { recalcularStockTotal, recalcularStockTotales } from '../Models/StockModels';
import { ROLES_GESTION_BAJAS, Role } from '../Middleware/roles';
import { AppError, badRequest, conflict, forbidden, notFound } from '../Utils/errors';

// ═══════════════════════════════════════════════════════════════════════════
// SERVICIO · reglas de negocio de bajas por vencimiento
// Capa de orquestación: valida, calcula pérdidas y coordina transacciones.
// Nunca construye SQL directamente (lo delega en el repositorio).
// ═══════════════════════════════════════════════════════════════════════════

type EstadoLote = 'pendiente' | 'activo' | 'vencido' | 'cancelado' | 'cuarentena' | 'devuelto';

function round2(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
}

function idEntero(valor: any, nombre: string): number {
    const n = Number(valor);
    if (!Number.isInteger(n) || n <= 0) throw badRequest(`${nombre} debe ser un entero positivo.`);
    return n;
}

function fechaDeteccion(valor?: string | null): string {
    if (!valor) {
        return new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) throw badRequest('fechaDeteccion no es una fecha válida.');
    return fecha.toISOString().slice(0, 19).replace('T', ' ');
}

async function enTransaccion<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
    const conn = await conectar.getConnection();
    try {
        await conn.beginTransaction();
        const resultado = await fn(conn);
        await conn.commit();
        return resultado;
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
}

/**
 * Cálculo de pérdida:
 *  · cuarentena            → 0 ( contenención, aún no hay baja contable )
 *  · baja_merma/destruccion→ 100% del costo (no hay recuperación)
 *  · devolucion_proveedor  → costo - nota de crédito PRORRATEADA
 *                            (por el peso del subtotal del lote dentro de la
 *                             devolución). Sin NC emitida se mantiene la
 *                            exposición total; `ajustarPerdida` la recalcula
 *                            cuando la NC se registra.
 */
export function calcularMontoPerdida(
    accion: AccionBaja,
    cantidad: number,
    costoUnitario: number,
    devolucion?: IDevolucionParaBaja | null,
): number {
    const costoTotal = round2(cantidad * costoUnitario);

    if (accion === 'cuarentena') return 0;
    if (accion !== 'devolucion_proveedor') return costoTotal;

    const montoNC = Number(devolucion?.montoNotaCredito ?? 0);
    const tieneNC = Boolean(devolucion?.numeroNotaCredito)
        && ['aceptada', 'completada'].includes(devolucion?.estado ?? '')
        && montoNC > 0;

    if (!tieneNC || !devolucion) return costoTotal;

    const subtotalTotal = Number(devolucion.subtotalTotal ?? 0);
    const ncProrrateada = subtotalTotal > 0
        ? montoNC * (Number(devolucion.subtotalLote ?? 0) / subtotalTotal)
        : 0;

    return round2(Math.max(costoTotal - ncProrrateada, 0));
}

/** Estado final del lote tras ejecutar la baja (nunca vuelve a ser vendible). */
function estadoLoteTrasEjecucion(
    accion: AccionBaja,
    stockRestante: number,
    estaVencido: boolean,
): EstadoLote {
    if (accion === 'cuarentena') return 'cuarentena';
    if (stockRestante <= 0) return accion === 'devolucion_proveedor' ? 'devuelto' : 'vencido';
    return estaVencido ? 'vencido' : 'activo';
}

async function validarAutorizador(idAutoriza: number, idSolicitante: number): Promise<void> {
    if (idAutoriza === idSolicitante) {
        throw conflict('El usuario autorizador debe ser distinto del usuario que registró la baja.');
    }
    const autorizador = await DataBajaLoteVencido.obtenerAutorizador(idAutoriza);
    if (!autorizador) throw notFound('Usuario autorizador no encontrado.');
    if (Number(autorizador.estado) !== 1) throw conflict('El usuario autorizador se encuentra inactivo.');
    if (!ROLES_GESTION_BAJAS.includes(autorizador.nameRol as Role)) {
        throw forbidden('El autorizador debe tener rol Admin o EncargadoInventario.');
    }
}

async function validarDevolucionVinculada(
    idDevolucionProveedor: number,
    idLote: number,
    cantidadAfectada: number,
    executor: any = conectar,
): Promise<IDevolucionParaBaja> {
    const dev = await DataBajaLoteVencido.obtenerDevolucionParaBaja(
        idDevolucionProveedor,
        idLote,
        executor,
    );
    if (!dev) {
        throw badRequest('La devolución a proveedor no existe o no incluye el lote indicado.');
    }
    if (!['vencimiento_corto', 'producto_vencido'].includes(dev.motivo)) {
        throw conflict('La devolución vinculada debe tener motivo "vencimiento_corto" o "producto_vencido".');
    }
    if (dev.estado === 'rechazada') {
        throw conflict('No se puede vincular una devolución rechazada por el proveedor.');
    }
    if (dev.cantidadDevueltaLote <= 0) {
        throw badRequest('La devolución no registra unidades para este lote.');
    }
    if (cantidadAfectada > dev.cantidadDevueltaLote) {
        throw conflict(
            `La cantidad afectada (${cantidadAfectada}) supera las ${dev.cantidadDevueltaLote} `
            + `unidades devueltas del lote en la nota de crédito.`,
        );
    }
    return dev;
}

const BajaLoteVencidoService = {

    // ── Detección ────────────────────────────────────────────────────────────
    async listarVencidos(filtros: IFiltrosDeteccion = {}) {
        const lotes = await DataBajaLoteVencido.listarLotesVencidos(filtros);
        return {
            parametros: filtros,
            criterio: "fechaVencimiento <= CURDATE() y stock > 0 sin baja pendiente/aprobada",
            total: lotes.length,
            lotes,
        };
    },

    async listarProximosAVencer(filtros: IFiltrosDeteccion = {}) {
        const dias = DIAS_DETECCION_PERMITIDOS.includes(Number(filtros.dias)) ? Number(filtros.dias) : 30;
        const normalizados = { ...filtros, dias };
        const lotes = await DataBajaLoteVencido.listarProximosAVencer(normalizados);
        return {
            parametros: normalizados,
            criterio: `0 <= DATEDIFF(fechaVencimiento, CURDATE()) <= ${dias} y lote activo con stock`,
            total: lotes.length,
            lotes,
        };
    },

    // ── Registro de la baja (documento en estado 'pendiente') ────────────────
    async registrar(datos: IRegistrarBajaInput, idUsuario: number) {
        const idLote = idEntero(datos.idLote, 'idLote');
        const cantidad = idEntero(datos.cantidadAfectada, 'cantidadAfectada');

        if (!ACCIONES_BAJA.includes(datos.accionTomada)) {
            throw badRequest(`accionTomada debe ser uno de: ${ACCIONES_BAJA.join(', ')}.`);
        }

        const lote = await DataBajaLoteVencido.obtenerLoteParaBaja(idLote);
        if (!lote) throw notFound('Lote no encontrado.');
        if (cantidad > lote.stock) {
            throw conflict(
                `La cantidad afectada (${cantidad}) supera el stock del lote (${lote.stock}).`,
            );
        }

        if (['baja_merma', 'destruccion'].includes(datos.accionTomada) && !lote.estaVencido) {
            throw conflict('Baja por merma o destrucción solo aplica a lotes vencidos (fechaVencimiento <= CURDATE()).');
        }

        const bajaActiva = await DataBajaLoteVencido.obtenerBajaActivaPorLote(idLote);
        if (bajaActiva) {
            throw conflict(`El lote ya tiene la baja #${bajaActiva.idBajaVencimiento} en estado "${bajaActiva.estado}".`);
        }

        let devolucion: IDevolucionParaBaja | null | undefined;
        if (datos.accionTomada === 'devolucion_proveedor') {
            const idDev = idEntero(datos.idDevolucionProveedor, 'idDevolucionProveedor');
            devolucion = await validarDevolucionVinculada(idDev, idLote, cantidad);
        } else if (datos.idDevolucionProveedor) {
            throw badRequest('idDevolucionProveedor solo aplica cuando accionTomada = "devolucion_proveedor".');
        }

        if (datos.idSucursal) {
            const idSucursal = idEntero(datos.idSucursal, 'idSucursal');
            const sucursal = await DataBajaLoteVencido.obtenerSucursal(idSucursal);
            if (!sucursal) throw notFound('Sucursal no encontrada.');
            if (Number(sucursal.estado) !== 1) throw conflict('La sucursal se encuentra inactiva.');
            datos.idSucursal = idSucursal;
        }

        // El costo es un snapshot del precio de compra del lote: el cliente no
        // puede fijarlo. Así la pérdida siempre es auditable contra la compra.
        const costoUnitario = round2(lote.precioCompra);
        if (!Number.isFinite(costoUnitario) || costoUnitario < 0) {
            throw conflict('El precio de compra del lote no es válido para calcular la pérdida.');
        }

        const montoEstimado = calcularMontoPerdida(datos.accionTomada, cantidad, costoUnitario, devolucion);
        const fecha = fechaDeteccion(datos.fechaDeteccion);

        const idBaja = await DataBajaLoteVencido.insertar(
            { ...datos, idLote, cantidadAfectada: cantidad },
            idUsuario,
            costoUnitario,
            montoEstimado,
            fecha,
        );
        return DataBajaLoteVencido.obtenerPorId(idBaja);
    },

    // ── Aprobación: pendiente → aprobada ────────────────────────────────────
    async aprobar(idBajaVencimiento: number, idUsuarioAutoriza: number) {
        const idBaja = idEntero(idBajaVencimiento, 'idBajaVencimiento');
        const idAutoriza = idEntero(idUsuarioAutoriza, 'idUsuarioAutoriza');

        await enTransaccion(async (conn) => {
            const baja = await DataBajaLoteVencido.obtenerParaTransicion(conn, idBaja);
            if (!baja) throw notFound('Baja no encontrada.');
            if (baja.estado !== 'pendiente') {
                throw conflict(`La baja está en estado "${baja.estado}"; solo se pueden aprobar bajas pendientes.`);
            }
            await validarAutorizador(idAutoriza, baja.idUsuario);

            if (baja.accionTomada === 'devolucion_proveedor') {
                if (!baja.idDevolucionProveedor) {
                    throw conflict('La baja de devolución no tiene una devolución vinculada.');
                }
                await validarDevolucionVinculada(
                    baja.idDevolucionProveedor,
                    baja.idLote,
                    baja.cantidadAfectada,
                    conn,
                );
            }

            const ok = await DataBajaLoteVencido.aprobar(conn, idBaja, idAutoriza);
            if (!ok) throw conflict('La baja cambió de estado concurrentemente. Reintente la operación.');
        });

        return DataBajaLoteVencido.obtenerPorId(idBaja);
    },

    // ── Ejecución: aprobada → ejecutada (único punto que mueve stock) ───────
    async ejecutar(idBajaVencimiento: number, idUsuarioAutoriza: number) {
        const idBaja = idEntero(idBajaVencimiento, 'idBajaVencimiento');
        const idAutoriza = idEntero(idUsuarioAutoriza, 'idUsuarioAutoriza');

        await enTransaccion(async (conn) => {
            // Bloquea la baja y el lote en un solo SELECT ... FOR UPDATE.
            const baja = await DataBajaLoteVencido.obtenerParaTransicion(conn, idBaja);
            if (!baja) throw notFound('Baja no encontrada.');
            if (baja.estado !== 'aprobada') {
                throw conflict(`La baja está en estado "${baja.estado}"; debe estar aprobada para ejecutarse.`);
            }
            if (baja.idUsuarioAutoriza !== idAutoriza) {
                throw conflict('El autorizador de la ejecución debe ser el mismo que aprobó la baja.');
            }
            await validarAutorizador(idAutoriza, baja.idUsuario);

            if (baja.cantidadAfectada > baja.stockLote) {
                throw conflict(
                    `Stock insuficiente en el lote: disponible ${baja.stockLote}, `
                    + `solicitado ${baja.cantidadAfectada}.`,
                );
            }

            let devolucion: IDevolucionParaBaja | null = null;
            if (baja.accionTomada === 'devolucion_proveedor') {
                if (!baja.idDevolucionProveedor) {
                    throw conflict('La baja de devolución no tiene una devolución vinculada.');
                }
                devolucion = await validarDevolucionVinculada(
                    baja.idDevolucionProveedor,
                    baja.idLote,
                    baja.cantidadAfectada,
                    conn,
                );
            }

            const montoPerdida = calcularMontoPerdida(
                baja.accionTomada,
                baja.cantidadAfectada,
                baja.costoUnitario,
                devolucion,
            );

            if (baja.accionTomada !== 'cuarentena') {
                // Cuarentena NO descuenta stock: lo aísla cambiando el estado
                // del lote. El resto de acciones sí sale físicamente del inventario.
                const descontado = await DataBajaLoteVencido.descontarStock(
                    conn,
                    baja.idLote,
                    baja.cantidadAfectada,
                );
                if (!descontado) {
                    throw conflict('El stock del lote cambió concurrentemente. No se ejecutó la baja.');
                }
            }

            const stockRestante = baja.accionTomada === 'cuarentena'
                ? baja.stockLote
                : baja.stockLote - baja.cantidadAfectada;

            const nuevoEstado = estadoLoteTrasEjecucion(
                baja.accionTomada,
                stockRestante,
                baja.estaVencido,
            );
            await DataBajaLoteVencido.cambiarEstadoLote(conn, baja.idLote, nuevoEstado);

            // Mismo snapshot que usa el POS: activo + fechaVencimiento > CURDATE().
            await recalcularStockTotal(conn, baja.idProducto);

            const ejecutada = await DataBajaLoteVencido.ejecutar(conn, idBaja, montoPerdida);
            if (!ejecutada) throw conflict('La baja cambió de estado concurrentemente. No se ejecutó.');
        });

        return DataBajaLoteVencido.obtenerPorId(idBaja);
    },

    // ── Anulación: pendiente/aprobada → anulada (sin tocar stock) ───────────
    async anular(idBajaVencimiento: number, idUsuario: number, motivo?: string) {
        const idBaja = idEntero(idBajaVencimiento, 'idBajaVencimiento');
        const motivoFinal = (motivo ?? '').trim() || 'Baja anulada antes de su ejecución';

        await enTransaccion(async (conn) => {
            const baja = await DataBajaLoteVencido.obtenerParaTransicion(conn, idBaja);
            if (!baja) throw notFound('Baja no encontrada.');
            if (baja.estado === 'ejecutada') {
                throw conflict(
                    'No se puede anular una baja ejecutada. La reversión debe registrarse '
                    + 'como un ajuste de inventario independiente.',
                );
            }
            if (!['pendiente', 'aprobada'].includes(baja.estado)) {
                throw conflict(`La baja ya está en estado "${baja.estado}".`);
            }
            const ok = await DataBajaLoteVencido.anular(conn, idBaja, idUsuario, motivoFinal);
            if (!ok) throw conflict('La baja cambió de estado concurrentemente.');
        });

        return DataBajaLoteVencido.obtenerPorId(idBaja);
    },

    // ── Ajuste de pérdida cuando llega la nota de crédito ───────────────────
    // No modifica stock: solo recalcula el impacto económico neto.
    async ajustarPerdida(idBajaVencimiento: number, rol: string | undefined) {
        if (rol !== 'Admin') {
            throw forbidden('Solo un administrador puede ajustar el monto de pérdida por nota de crédito.');
        }
        const idBaja = idEntero(idBajaVencimiento, 'idBajaVencimiento');

        await enTransaccion(async (conn) => {
            const baja = await DataBajaLoteVencido.obtenerParaTransicion(conn, idBaja);
            if (!baja) throw notFound('Baja no encontrada.');
            if (baja.estado !== 'ejecutada') {
                throw conflict('Solo se puede ajustar la pérdida de una baja ejecutada.');
            }
            if (baja.accionTomada !== 'devolucion_proveedor' || !baja.idDevolucionProveedor) {
                throw conflict('El ajuste por nota de crédito solo aplica a bajas por devolución al proveedor.');
            }

            const dev = await DataBajaLoteVencido.obtenerDevolucionParaBaja(
                baja.idDevolucionProveedor,
                baja.idLote,
                conn,
            );
            if (!dev) throw notFound('Devolución a proveedor vinculada no encontrada.');

            const monto = calcularMontoPerdida(
                baja.accionTomada,
                baja.cantidadAfectada,
                baja.costoUnitario,
                dev,
            );
            const ok = await DataBajaLoteVencido.actualizarMontoPerdida(conn, idBaja, monto);
            if (!ok) throw conflict('No se pudo actualizar el monto de pérdida.');
        });

        return DataBajaLoteVencido.obtenerPorId(idBaja);
    },

    // ── Consultas ────────────────────────────────────────────────────────────
    async listar(filtros: IFiltrosBaja = {}) {
        return DataBajaLoteVencido.listar(filtros);
    },

    async obtenerPorId(idBajaVencimiento: number) {
        const baja = await DataBajaLoteVencido.obtenerPorId(idEntero(idBajaVencimiento, 'idBajaVencimiento'));
        if (!baja) throw notFound('Baja no encontrada.');
        return baja;
    },

    async reportePerdidas(filtros: IFiltrosReporte) {
        return DataBajaLoteVencido.reportePerdidas(filtros);
    },

    /** Utilidad para otros módulos: recalcular stock tras devoluciones/ventas. */
    async sincronizarStock(conn: PoolConnection, idsProducto: number[]) {
        await recalcularStockTotales(conn, idsProducto);
    },
};

/** Normaliza errores de dominio para los controladores. */
export function responderErrorBaja(res: any, error: unknown) {
    if (error instanceof AppError) {
        return res.status(error.status).json({
            status: 'error',
            code: error.code,
            message: error.message,
        });
    }
    console.error('Error no controlado en bajas por vencimiento:', error);
    return res.status(500).json({
        status: 'error',
        code: 'INTERNAL_ERROR',
        message: 'Error interno al gestionar la baja por vencimiento.',
    });
}

export default BajaLoteVencidoService;
