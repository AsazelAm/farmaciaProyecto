export type EstadoBaja = 'pendiente' | 'aprobada' | 'ejecutada' | 'anulada';
export type AccionBaja = 'cuarentena' | 'baja_merma' | 'destruccion' | 'devolucion_proveedor';
export declare const ESTADOS_BAJA: EstadoBaja[];
export declare const ACCIONES_BAJA: AccionBaja[];
export declare const DIAS_DETECCION_PERMITIDOS: number[];
export interface IFiltrosDeteccion {
    dias?: number | null;
    idProducto?: number | null;
    idProveedor?: number | null;
    idLaboratorio?: number | null;
    idSucursal?: number | null;
    busqueda?: string | null;
    limite?: number | null;
}
export interface IFiltrosBaja {
    estado?: EstadoBaja | null;
    accionTomada?: AccionBaja | null;
    idSucursal?: number | null;
    idProducto?: number | null;
    fechaDesde?: string | null;
    fechaHasta?: string | null;
    pagina?: number | null;
    porPagina?: number | null;
}
export interface IFiltrosReporte {
    fechaDesde: string;
    fechaHasta: string;
    idSucursal?: number | null;
    accionTomada?: AccionBaja | null;
    idProducto?: number | null;
}
export interface IRegistrarBajaInput {
    idLote: number;
    idSucursal?: number | null;
    idDevolucionProveedor?: number | null;
    cantidadAfectada: number;
    accionTomada: AccionBaja;
    fechaDeteccion?: string | null;
    motivoDetalle?: string | null;
}
export interface ILoteParaBaja {
    idLote: number;
    codigo: string;
    numeroLote: string;
    idProducto: number;
    nombreComercial: string;
    idProveedor: number;
    stock: number;
    precioCompra: number;
    estado: string;
    fechaVencimiento: string;
    diasRestantes: number;
    estaVencido: boolean;
}
export interface IDevolucionParaBaja {
    idDevolucionProveedor: number;
    estado: string;
    motivo: string;
    montoNotaCredito: number;
    numeroNotaCredito: string | null;
    subtotalLote: number;
    subtotalTotal: number;
    cantidadDevueltaLote: number;
}
export interface IBajaParaTransicion {
    idBajaVencimiento: number;
    idLote: number;
    idProducto: number;
    idUsuario: number;
    idUsuarioAutoriza: number | null;
    idDevolucionProveedor: number | null;
    cantidadAfectada: number;
    costoUnitario: number;
    accionTomada: AccionBaja;
    estado: EstadoBaja;
    stockLote: number;
    estaVencido: boolean;
}
export interface IAutorizador {
    idUsuario: number;
    nameRol: string;
    estado: number;
}
/** Ejecutor genérico: acepta el pool o una conexión dentro de una transacción. */
type Executor = any;
declare const DataBajaLoteVencido: {
    listarLotesVencidos(filtros?: IFiltrosDeteccion): Promise<any[]>;
    listarProximosAVencer(filtros?: IFiltrosDeteccion): Promise<any[]>;
    obtenerLoteParaBaja(idLote: number): Promise<ILoteParaBaja | null>;
    obtenerDevolucionParaBaja(idDevolucionProveedor: number, idLote: number, executor?: Executor): Promise<IDevolucionParaBaja | null>;
    /** Evita abrir dos gestiones simultáneas sobre el mismo lote. */
    obtenerBajaActivaPorLote(idLote: number): Promise<any>;
    obtenerSucursal(idSucursal: number): Promise<any>;
    obtenerAutorizador(idUsuario: number): Promise<IAutorizador | null>;
    insertar(datos: IRegistrarBajaInput, idUsuario: number, costoUnitario: number, montoPerdidaEstimado: number, fechaDeteccion: string): Promise<number>;
    obtenerPorId(idBajaVencimiento: number): Promise<any>;
    listar(filtros?: IFiltrosBaja): Promise<{
        data: any[];
        total: number;
        pagina: number;
        porPagina: number;
    }>;
    obtenerParaTransicion(conn: Executor, idBajaVencimiento: number): Promise<IBajaParaTransicion | null>;
    aprobar(conn: Executor, idBajaVencimiento: number, idUsuarioAutoriza: number): Promise<boolean>;
    ejecutar(conn: Executor, idBajaVencimiento: number, montoPerdida: number): Promise<boolean>;
    anular(conn: Executor, idBajaVencimiento: number, idUsuario: number, motivo: string): Promise<boolean>;
    actualizarMontoPerdida(conn: Executor, idBajaVencimiento: number, montoPerdida: number): Promise<boolean>;
    /** Descuento seguro: falla si otro proceso consumió el stock concurrentemente. */
    descontarStock(conn: Executor, idLote: number, cantidad: number): Promise<boolean>;
    cambiarEstadoLote(conn: Executor, idLote: number, estado: string): Promise<boolean>;
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
};
export default DataBajaLoteVencido;
