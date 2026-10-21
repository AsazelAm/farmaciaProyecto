export interface ICompraFiltros {
    estado?: 'pendiente' | 'parcial' | 'completado' | 'cancelado' | 'rechazado' | 'devuelto_parcial' | 'devuelto_total';
    idProveedor?: number;
    idSucursal?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    pagina?: number;
    porPagina?: number;
}
export interface ILoteInput {
    idProducto: number;
    codigo: string;
    numeroLote: string;
    stock: number;
    precioCompra: number;
    descuento: number;
    fechaVencimiento: string;
    fechaFabricacion?: string | null;
}
export interface ICompraInput {
    numeroFactura?: string;
    idProveedor: number;
    idSucursal: number;
    fechaEntrega?: string;
    descuento: number;
    impuesto: number;
    subtotal: number;
    total: number;
    observaciones?: string;
    lotes: ILoteInput[];
}
declare const DataCompra: {
    listar(filtros: ICompraFiltros): Promise<{
        data: any[];
        total: number;
    }>;
    obtenerPorId(idCompra: number): Promise<any>;
    crear(datos: ICompraInput, idUsuario: number): Promise<number>;
    completar(idCompra: number): Promise<boolean>;
    cambiarAPendiente(idCompra: number): Promise<boolean>;
    cancelar(idCompra: number, motivo?: string, idUsuario?: number): Promise<boolean>;
    estadisticas(): Promise<{
        porEstado: {
            estado: any;
            cantidad: number;
            monto: number;
        }[];
        totalMes: number;
        totalMesAnterior: number;
        porProveedor: {
            nombre: any;
            cantidad: number;
            monto: number;
        }[];
        lotesProximosVencer: number;
    }>;
    VerificarNumeroFactura(numeroFactura: string): Promise<number>;
    VerificarCodigoLote(codigo: string): Promise<number>;
    actualizar(idCompra: number, datos: ICompraInput): Promise<boolean>;
};
export default DataCompra;
