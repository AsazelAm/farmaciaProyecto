import type { PoolConnection } from 'mariadb';
import { AccionBaja, IDevolucionParaBaja, IFiltrosBaja, IFiltrosDeteccion, IFiltrosReporte, IRegistrarBajaInput } from '../Models/BajaLoteVencidoModels';
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
export declare function calcularMontoPerdida(accion: AccionBaja, cantidad: number, costoUnitario: number, devolucion?: IDevolucionParaBaja | null): number;
declare const BajaLoteVencidoService: {
    listarVencidos(filtros?: IFiltrosDeteccion): Promise<{
        parametros: IFiltrosDeteccion;
        criterio: string;
        total: number;
        lotes: any[];
    }>;
    listarProximosAVencer(filtros?: IFiltrosDeteccion): Promise<{
        parametros: {
            dias: number;
            idProducto?: number | null;
            idProveedor?: number | null;
            idLaboratorio?: number | null;
            idSucursal?: number | null;
            busqueda?: string | null;
            limite?: number | null;
        };
        criterio: string;
        total: number;
        lotes: any[];
    }>;
    registrar(datos: IRegistrarBajaInput, idUsuario: number): Promise<any>;
    aprobar(idBajaVencimiento: number, idUsuarioAutoriza: number): Promise<any>;
    ejecutar(idBajaVencimiento: number, idUsuarioAutoriza: number): Promise<any>;
    anular(idBajaVencimiento: number, idUsuario: number, motivo?: string): Promise<any>;
    ajustarPerdida(idBajaVencimiento: number, rol: string | undefined): Promise<any>;
    listar(filtros?: IFiltrosBaja): Promise<{
        data: any[];
        total: number;
        pagina: number;
        porPagina: number;
    }>;
    obtenerPorId(idBajaVencimiento: number): Promise<any>;
    reportePerdidas(filtros: IFiltrosReporte): Promise<{
        parametros: IFiltrosReporte;
        filas: any[];
        resumen: {
            totalBajas: number;
            totalUnidades: any;
            montoPerdidaTotal: number;
            porAccion: {
                accion: AccionBaja;
                bajas: number;
                unidades: any;
                perdida: number;
            }[];
            porSucursal: {
                perdida: number;
                sucursal: string;
                bajas: number;
                unidades: number;
            }[];
        };
    }>;
    /** Utilidad para otros módulos: recalcular stock tras devoluciones/ventas. */
    sincronizarStock(conn: PoolConnection, idsProducto: number[]): Promise<void>;
};
/** Normaliza errores de dominio para los controladores. */
export declare function responderErrorBaja(res: any, error: unknown): any;
export default BajaLoteVencidoService;
