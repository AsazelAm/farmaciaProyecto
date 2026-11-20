"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularMontoPerdida = calcularMontoPerdida;
exports.responderErrorBaja = responderErrorBaja;
const db_1 = __importDefault(require("../config/db"));
const BajaLoteVencidoModels_1 = __importStar(require("../Models/BajaLoteVencidoModels"));
const StockModels_1 = require("../Models/StockModels");
const roles_1 = require("../Middleware/roles");
const errors_1 = require("../Utils/errors");
function round2(valor) {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
}
function idEntero(valor, nombre) {
    const n = Number(valor);
    if (!Number.isInteger(n) || n <= 0)
        throw (0, errors_1.badRequest)(`${nombre} debe ser un entero positivo.`);
    return n;
}
function fechaDeteccion(valor) {
    if (!valor) {
        return new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime()))
        throw (0, errors_1.badRequest)('fechaDeteccion no es una fecha válida.');
    return fecha.toISOString().slice(0, 19).replace('T', ' ');
}
async function enTransaccion(fn) {
    const conn = await db_1.default.getConnection();
    try {
        await conn.beginTransaction();
        const resultado = await fn(conn);
        await conn.commit();
        return resultado;
    }
    catch (error) {
        await conn.rollback();
        throw error;
    }
    finally {
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
function calcularMontoPerdida(accion, cantidad, costoUnitario, devolucion) {
    const costoTotal = round2(cantidad * costoUnitario);
    if (accion === 'cuarentena')
        return 0;
    if (accion !== 'devolucion_proveedor')
        return costoTotal;
    const montoNC = Number(devolucion?.montoNotaCredito ?? 0);
    const tieneNC = Boolean(devolucion?.numeroNotaCredito)
        && ['aceptada', 'completada'].includes(devolucion?.estado ?? '')
        && montoNC > 0;
    if (!tieneNC || !devolucion)
        return costoTotal;
    const subtotalTotal = Number(devolucion.subtotalTotal ?? 0);
    const ncProrrateada = subtotalTotal > 0
        ? montoNC * (Number(devolucion.subtotalLote ?? 0) / subtotalTotal)
        : 0;
    return round2(Math.max(costoTotal - ncProrrateada, 0));
}
/** Estado final del lote tras ejecutar la baja (nunca vuelve a ser vendible). */
function estadoLoteTrasEjecucion(accion, stockRestante, estaVencido) {
    if (accion === 'cuarentena')
        return 'cuarentena';
    if (stockRestante <= 0)
        return accion === 'devolucion_proveedor' ? 'devuelto' : 'vencido';
    return estaVencido ? 'vencido' : 'activo';
}
async function validarAutorizador(idAutoriza, idSolicitante) {
    if (idAutoriza === idSolicitante) {
        throw (0, errors_1.conflict)('El usuario autorizador debe ser distinto del usuario que registró la baja.');
    }
    const autorizador = await BajaLoteVencidoModels_1.default.obtenerAutorizador(idAutoriza);
    if (!autorizador)
        throw (0, errors_1.notFound)('Usuario autorizador no encontrado.');
    if (Number(autorizador.estado) !== 1)
        throw (0, errors_1.conflict)('El usuario autorizador se encuentra inactivo.');
    if (!roles_1.ROLES_GESTION_BAJAS.includes(autorizador.nameRol)) {
        throw (0, errors_1.forbidden)('El autorizador debe tener rol Admin o EncargadoInventario.');
    }
}
async function validarDevolucionVinculada(idDevolucionProveedor, idLote, cantidadAfectada, executor = db_1.default) {
    const dev = await BajaLoteVencidoModels_1.default.obtenerDevolucionParaBaja(idDevolucionProveedor, idLote, executor);
    if (!dev) {
        throw (0, errors_1.badRequest)('La devolución a proveedor no existe o no incluye el lote indicado.');
    }
    if (!['vencimiento_corto', 'producto_vencido'].includes(dev.motivo)) {
        throw (0, errors_1.conflict)('La devolución vinculada debe tener motivo "vencimiento_corto" o "producto_vencido".');
    }
    if (dev.estado === 'rechazada') {
        throw (0, errors_1.conflict)('No se puede vincular una devolución rechazada por el proveedor.');
    }
    if (dev.cantidadDevueltaLote <= 0) {
        throw (0, errors_1.badRequest)('La devolución no registra unidades para este lote.');
    }
    if (cantidadAfectada > dev.cantidadDevueltaLote) {
        throw (0, errors_1.conflict)(`La cantidad afectada (${cantidadAfectada}) supera las ${dev.cantidadDevueltaLote} `
            + `unidades devueltas del lote en la nota de crédito.`);
    }
    return dev;
}
const BajaLoteVencidoService = {
    // ── Detección ────────────────────────────────────────────────────────────
    async listarVencidos(filtros = {}) {
        const lotes = await BajaLoteVencidoModels_1.default.listarLotesVencidos(filtros);
        return {
            parametros: filtros,
            criterio: "fechaVencimiento <= CURDATE() y stock > 0 sin baja pendiente/aprobada",
            total: lotes.length,
            lotes,
        };
    },
    async listarProximosAVencer(filtros = {}) {
        const dias = BajaLoteVencidoModels_1.DIAS_DETECCION_PERMITIDOS.includes(Number(filtros.dias)) ? Number(filtros.dias) : 30;
        const normalizados = { ...filtros, dias };
        const lotes = await BajaLoteVencidoModels_1.default.listarProximosAVencer(normalizados);
        return {
            parametros: normalizados,
            criterio: `0 <= DATEDIFF(fechaVencimiento, CURDATE()) <= ${dias} y lote activo con stock`,
            total: lotes.length,
            lotes,
        };
    },
    // ── Registro de la baja (documento en estado 'pendiente') ────────────────
    async registrar(datos, idUsuario) {
        const idLote = idEntero(datos.idLote, 'idLote');
        const cantidad = idEntero(datos.cantidadAfectada, 'cantidadAfectada');
        if (!BajaLoteVencidoModels_1.ACCIONES_BAJA.includes(datos.accionTomada)) {
            throw (0, errors_1.badRequest)(`accionTomada debe ser uno de: ${BajaLoteVencidoModels_1.ACCIONES_BAJA.join(', ')}.`);
        }
        const lote = await BajaLoteVencidoModels_1.default.obtenerLoteParaBaja(idLote);
        if (!lote)
            throw (0, errors_1.notFound)('Lote no encontrado.');
        if (cantidad > lote.stock) {
            throw (0, errors_1.conflict)(`La cantidad afectada (${cantidad}) supera el stock del lote (${lote.stock}).`);
        }
        if (['baja_merma', 'destruccion'].includes(datos.accionTomada) && !lote.estaVencido) {
            throw (0, errors_1.conflict)('Baja por merma o destrucción solo aplica a lotes vencidos (fechaVencimiento <= CURDATE()).');
        }
        const bajaActiva = await BajaLoteVencidoModels_1.default.obtenerBajaActivaPorLote(idLote);
        if (bajaActiva) {
            throw (0, errors_1.conflict)(`El lote ya tiene la baja #${bajaActiva.idBajaVencimiento} en estado "${bajaActiva.estado}".`);
        }
        let devolucion;
        if (datos.accionTomada === 'devolucion_proveedor') {
            const idDev = idEntero(datos.idDevolucionProveedor, 'idDevolucionProveedor');
            devolucion = await validarDevolucionVinculada(idDev, idLote, cantidad);
        }
        else if (datos.idDevolucionProveedor) {
            throw (0, errors_1.badRequest)('idDevolucionProveedor solo aplica cuando accionTomada = "devolucion_proveedor".');
        }
        if (datos.idSucursal) {
            const idSucursal = idEntero(datos.idSucursal, 'idSucursal');
            const sucursal = await BajaLoteVencidoModels_1.default.obtenerSucursal(idSucursal);
            if (!sucursal)
                throw (0, errors_1.notFound)('Sucursal no encontrada.');
            if (Number(sucursal.estado) !== 1)
                throw (0, errors_1.conflict)('La sucursal se encuentra inactiva.');
            datos.idSucursal = idSucursal;
        }
        // El costo es un snapshot del precio de compra del lote: el cliente no
        // puede fijarlo. Así la pérdida siempre es auditable contra la compra.
        const costoUnitario = round2(lote.precioCompra);
        if (!Number.isFinite(costoUnitario) || costoUnitario < 0) {
            throw (0, errors_1.conflict)('El precio de compra del lote no es válido para calcular la pérdida.');
        }
        const montoEstimado = calcularMontoPerdida(datos.accionTomada, cantidad, costoUnitario, devolucion);
        const fecha = fechaDeteccion(datos.fechaDeteccion);
        const idBaja = await BajaLoteVencidoModels_1.default.insertar({ ...datos, idLote, cantidadAfectada: cantidad }, idUsuario, costoUnitario, montoEstimado, fecha);
        return BajaLoteVencidoModels_1.default.obtenerPorId(idBaja);
    },
    // ── Aprobación: pendiente → aprobada ────────────────────────────────────
    async aprobar(idBajaVencimiento, idUsuarioAutoriza) {
        const idBaja = idEntero(idBajaVencimiento, 'idBajaVencimiento');
        const idAutoriza = idEntero(idUsuarioAutoriza, 'idUsuarioAutoriza');
        await enTransaccion(async (conn) => {
            const baja = await BajaLoteVencidoModels_1.default.obtenerParaTransicion(conn, idBaja);
            if (!baja)
                throw (0, errors_1.notFound)('Baja no encontrada.');
            if (baja.estado !== 'pendiente') {
                throw (0, errors_1.conflict)(`La baja está en estado "${baja.estado}"; solo se pueden aprobar bajas pendientes.`);
            }
            await validarAutorizador(idAutoriza, baja.idUsuario);
            if (baja.accionTomada === 'devolucion_proveedor') {
                if (!baja.idDevolucionProveedor) {
                    throw (0, errors_1.conflict)('La baja de devolución no tiene una devolución vinculada.');
                }
                await validarDevolucionVinculada(baja.idDevolucionProveedor, baja.idLote, baja.cantidadAfectada, conn);
            }
            const ok = await BajaLoteVencidoModels_1.default.aprobar(conn, idBaja, idAutoriza);
            if (!ok)
                throw (0, errors_1.conflict)('La baja cambió de estado concurrentemente. Reintente la operación.');
        });
        return BajaLoteVencidoModels_1.default.obtenerPorId(idBaja);
    },
    // ── Ejecución: aprobada → ejecutada (único punto que mueve stock) ───────
    async ejecutar(idBajaVencimiento, idUsuarioAutoriza) {
        const idBaja = idEntero(idBajaVencimiento, 'idBajaVencimiento');
        const idAutoriza = idEntero(idUsuarioAutoriza, 'idUsuarioAutoriza');
        await enTransaccion(async (conn) => {
            // Bloquea la baja y el lote en un solo SELECT ... FOR UPDATE.
            const baja = await BajaLoteVencidoModels_1.default.obtenerParaTransicion(conn, idBaja);
            if (!baja)
                throw (0, errors_1.notFound)('Baja no encontrada.');
            if (baja.estado !== 'aprobada') {
                throw (0, errors_1.conflict)(`La baja está en estado "${baja.estado}"; debe estar aprobada para ejecutarse.`);
            }
            if (baja.idUsuarioAutoriza !== idAutoriza) {
                throw (0, errors_1.conflict)('El autorizador de la ejecución debe ser el mismo que aprobó la baja.');
            }
            await validarAutorizador(idAutoriza, baja.idUsuario);
            if (baja.cantidadAfectada > baja.stockLote) {
                throw (0, errors_1.conflict)(`Stock insuficiente en el lote: disponible ${baja.stockLote}, `
                    + `solicitado ${baja.cantidadAfectada}.`);
            }
            let devolucion = null;
            if (baja.accionTomada === 'devolucion_proveedor') {
                if (!baja.idDevolucionProveedor) {
                    throw (0, errors_1.conflict)('La baja de devolución no tiene una devolución vinculada.');
                }
                devolucion = await validarDevolucionVinculada(baja.idDevolucionProveedor, baja.idLote, baja.cantidadAfectada, conn);
            }
            const montoPerdida = calcularMontoPerdida(baja.accionTomada, baja.cantidadAfectada, baja.costoUnitario, devolucion);
            if (baja.accionTomada !== 'cuarentena') {
                // Cuarentena NO descuenta stock: lo aísla cambiando el estado
                // del lote. El resto de acciones sí sale físicamente del inventario.
                const descontado = await BajaLoteVencidoModels_1.default.descontarStock(conn, baja.idLote, baja.cantidadAfectada);
                if (!descontado) {
                    throw (0, errors_1.conflict)('El stock del lote cambió concurrentemente. No se ejecutó la baja.');
                }
            }
            const stockRestante = baja.accionTomada === 'cuarentena'
                ? baja.stockLote
                : baja.stockLote - baja.cantidadAfectada;
            const nuevoEstado = estadoLoteTrasEjecucion(baja.accionTomada, stockRestante, baja.estaVencido);
            await BajaLoteVencidoModels_1.default.cambiarEstadoLote(conn, baja.idLote, nuevoEstado);
            // Mismo snapshot que usa el POS: activo + fechaVencimiento > CURDATE().
            await (0, StockModels_1.recalcularStockTotal)(conn, baja.idProducto);
            const ejecutada = await BajaLoteVencidoModels_1.default.ejecutar(conn, idBaja, montoPerdida);
            if (!ejecutada)
                throw (0, errors_1.conflict)('La baja cambió de estado concurrentemente. No se ejecutó.');
        });
        return BajaLoteVencidoModels_1.default.obtenerPorId(idBaja);
    },
    // ── Anulación: pendiente/aprobada → anulada (sin tocar stock) ───────────
    async anular(idBajaVencimiento, idUsuario, motivo) {
        const idBaja = idEntero(idBajaVencimiento, 'idBajaVencimiento');
        const motivoFinal = (motivo ?? '').trim() || 'Baja anulada antes de su ejecución';
        await enTransaccion(async (conn) => {
            const baja = await BajaLoteVencidoModels_1.default.obtenerParaTransicion(conn, idBaja);
            if (!baja)
                throw (0, errors_1.notFound)('Baja no encontrada.');
            if (baja.estado === 'ejecutada') {
                throw (0, errors_1.conflict)('No se puede anular una baja ejecutada. La reversión debe registrarse '
                    + 'como un ajuste de inventario independiente.');
            }
            if (!['pendiente', 'aprobada'].includes(baja.estado)) {
                throw (0, errors_1.conflict)(`La baja ya está en estado "${baja.estado}".`);
            }
            const ok = await BajaLoteVencidoModels_1.default.anular(conn, idBaja, idUsuario, motivoFinal);
            if (!ok)
                throw (0, errors_1.conflict)('La baja cambió de estado concurrentemente.');
        });
        return BajaLoteVencidoModels_1.default.obtenerPorId(idBaja);
    },
    // ── Ajuste de pérdida cuando llega la nota de crédito ───────────────────
    // No modifica stock: solo recalcula el impacto económico neto.
    async ajustarPerdida(idBajaVencimiento, rol) {
        if (rol !== 'Admin') {
            throw (0, errors_1.forbidden)('Solo un administrador puede ajustar el monto de pérdida por nota de crédito.');
        }
        const idBaja = idEntero(idBajaVencimiento, 'idBajaVencimiento');
        await enTransaccion(async (conn) => {
            const baja = await BajaLoteVencidoModels_1.default.obtenerParaTransicion(conn, idBaja);
            if (!baja)
                throw (0, errors_1.notFound)('Baja no encontrada.');
            if (baja.estado !== 'ejecutada') {
                throw (0, errors_1.conflict)('Solo se puede ajustar la pérdida de una baja ejecutada.');
            }
            if (baja.accionTomada !== 'devolucion_proveedor' || !baja.idDevolucionProveedor) {
                throw (0, errors_1.conflict)('El ajuste por nota de crédito solo aplica a bajas por devolución al proveedor.');
            }
            const dev = await BajaLoteVencidoModels_1.default.obtenerDevolucionParaBaja(baja.idDevolucionProveedor, baja.idLote, conn);
            if (!dev)
                throw (0, errors_1.notFound)('Devolución a proveedor vinculada no encontrada.');
            const monto = calcularMontoPerdida(baja.accionTomada, baja.cantidadAfectada, baja.costoUnitario, dev);
            const ok = await BajaLoteVencidoModels_1.default.actualizarMontoPerdida(conn, idBaja, monto);
            if (!ok)
                throw (0, errors_1.conflict)('No se pudo actualizar el monto de pérdida.');
        });
        return BajaLoteVencidoModels_1.default.obtenerPorId(idBaja);
    },
    // ── Consultas ────────────────────────────────────────────────────────────
    async listar(filtros = {}) {
        return BajaLoteVencidoModels_1.default.listar(filtros);
    },
    async obtenerPorId(idBajaVencimiento) {
        const baja = await BajaLoteVencidoModels_1.default.obtenerPorId(idEntero(idBajaVencimiento, 'idBajaVencimiento'));
        if (!baja)
            throw (0, errors_1.notFound)('Baja no encontrada.');
        return baja;
    },
    async reportePerdidas(filtros) {
        return BajaLoteVencidoModels_1.default.reportePerdidas(filtros);
    },
    /** Utilidad para otros módulos: recalcular stock tras devoluciones/ventas. */
    async sincronizarStock(conn, idsProducto) {
        await (0, StockModels_1.recalcularStockTotales)(conn, idsProducto);
    },
};
/** Normaliza errores de dominio para los controladores. */
function responderErrorBaja(res, error) {
    if (error instanceof errors_1.AppError) {
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
exports.default = BajaLoteVencidoService;
//# sourceMappingURL=BajaLoteVencidoService.js.map