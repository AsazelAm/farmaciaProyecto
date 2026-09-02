export interface IVentaFiltros {
    estado?: 'pendiente' | 'completada' | 'anulada';
    idCliente?: number;
    idUsuario?: number;
    idSucursal?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    pagina?: number;
    porPagina?: number;
}
export interface IDetalleVentaInput {
    idProducto: number;
    idLote: number;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
}
export interface IVentaInput {
    idCliente: number;
    idSucursal: number;
    tipoPago?: string;
    descuentoTotal: number;
    impuestos: number;
    subtotal: number;
    total: number;
    observaciones?: string;
    detalles: IDetalleVentaInput[];
}
export interface IFacturaInput {
    tipoFactura: string;
    nitCliente?: string;
    razonSocial?: string;
}
declare const DataVenta: {
    listar(filtros: IVentaFiltros): Promise<{
        data: any[];
        total: number;
    }>;
    obtenerPorId(idVenta: number): Promise<any>;
    crear(datos: IVentaInput, idUsuario: number): Promise<number>;
    completar(idVenta: number): Promise<boolean>;
    cambiarAPendiente(idVenta: number): Promise<boolean>;
    anular(idVenta: number, motivo?: string): Promise<boolean>;
    actualizar(idVenta: number, datos: IVentaInput): Promise<boolean>;
    emitirFactura(idVenta: number, datosFactura: IFacturaInput): Promise<number>;
    obtenerDatosFacturacionPorCliente(idCliente: number): Promise<any>;
    estadisticas(): Promise<{
        porEstado: {
            estado: any;
            cantidad: number;
            monto: number;
        }[];
        totalMes: number;
        totalMesAnterior: number;
        porSucursal: {
            nombre: any;
            cantidad: number;
            monto: number;
        }[];
        masVendidos: {
            nombreGenerico: any;
            unidadesVendidas: number;
            monto: number;
        }[];
    }>;
    VerificarStockLote(idLote: number, cantidad: number): Promise<boolean>;
    LotesDisponiblesPorProducto(idProducto: number): Promise<any>;
};
export default DataVenta;
