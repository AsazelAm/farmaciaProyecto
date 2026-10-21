export type EstadoDevVenta = 'solicitada' | 'aprobada' | 'rechazada' | 'completada';
export type EstadoDevProveedor = 'solicitada' | 'aceptada' | 'rechazada' | 'completada';
export type MotivoDevVenta = 'error_dispensacion' | 'reaccion_adversa' | 'producto_danado' | 'producto_vencido' | 'receta_invalida' | 'arrepentimiento' | 'otro';
export type MotivoDevProveedor = 'producto_danado' | 'empaque_danado' | 'vencimiento_corto' | 'producto_vencido' | 'cantidad_incorrecta' | 'reclamo_clientes' | 'otro';
export type DestinoDevVenta = 'reingreso_stock' | 'merma' | 'cuarentena';
export interface IDevolucionVentaFiltros {
    estado?: EstadoDevVenta;
    idVenta?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    pagina?: number;
    porPagina?: number;
}
export interface IDevolucionVentaDetalleInput {
    idLote: number;
    idProducto: number;
    cantidad: number;
    precioUnitario: number;
    destino: DestinoDevVenta;
}
export interface IDevolucionVentaInput {
    tipo: 'total' | 'parcial';
    motivo: MotivoDevVenta;
    metodoReembolso?: string;
    observaciones?: string;
    idVenta: number;
    detalles: IDevolucionVentaDetalleInput[];
}
export interface IResolucionVentaInput {
    estado: EstadoDevVenta;
    metodoReembolso?: string;
    numeroNotaCredito?: string;
    motivoRechazo?: string;
}
export interface IDevolucionProveedorFiltros {
    estado?: EstadoDevProveedor;
    idCompra?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    pagina?: number;
    porPagina?: number;
}
export interface IDevolucionProveedorDetalleInput {
    idLote: number;
    cantidad: number;
    precioUnitario: number;
}
export interface IDevolucionProveedorInput {
    tipo: 'total' | 'parcial';
    motivo: MotivoDevProveedor;
    observaciones?: string;
    idCompra: number;
    detalles: IDevolucionProveedorDetalleInput[];
}
export interface IResolucionProveedorInput {
    estado: EstadoDevProveedor;
    numeroNotaCredito?: string;
    motivoRechazo?: string;
}
declare const DataDevolucion: {
    listarVentas(filtros: IDevolucionVentaFiltros): Promise<{
        data: any[];
        total: number;
    }>;
    obtenerVentaPorId(idDevolucionVenta: number): Promise<any>;
    crearVenta(datos: IDevolucionVentaInput, idUsuario: number): Promise<number>;
    resolverVenta(idDevolucionVenta: number, datos: IResolucionVentaInput, idUsuarioAutoriza: number): Promise<boolean>;
    listarProveedores(filtros: IDevolucionProveedorFiltros): Promise<{
        data: any[];
        total: number;
    }>;
    obtenerProveedorPorId(idDevolucionProveedor: number): Promise<any>;
    crearProveedor(datos: IDevolucionProveedorInput, idUsuario: number): Promise<number>;
    resolverProveedor(idDevolucionProveedor: number, datos: IResolucionProveedorInput, idUsuarioAutoriza: number): Promise<boolean>;
};
export default DataDevolucion;
