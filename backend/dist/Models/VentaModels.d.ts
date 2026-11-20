export interface IVentaFiltros {
    estado?: 'pendiente' | 'completado' | 'cancelado' | 'devuelto_parcial' | 'devuelto_total';
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
    idLote?: number;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
}
export interface IVentaInput {
    idCliente: number;
    idSucursal: number;
    tipoPago?: string;
    descuentoTotal: number;
    subtotal: number;
    total: number;
    observaciones?: string;
    detalles: IDetalleVentaInput[];
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
    anular(idVenta: number, motivo?: string, idUsuario?: number): Promise<boolean>;
    actualizar(idVenta: number, datos: IVentaInput): Promise<boolean>;
    emitirRecibo(idVenta: number): Promise<{
        idRecibo: number;
        numeroRecibo: string;
    }>;
    VerificarStockLote(idLote: number, cantidad: number): Promise<{
        disponible: boolean;
        stock: number;
        estado?: undefined;
    } | {
        disponible: boolean;
        stock: number;
        estado: any;
    }>;
    AlertaFEFO(idProducto: number, idLote: number): Promise<{
        existe: boolean;
        cumpleFEFO: boolean;
        mensaje: string;
        idLote?: undefined;
        codigo?: undefined;
        numeroLote?: undefined;
        stock?: undefined;
        fechaVencimiento?: undefined;
        diasRestantes?: undefined;
        idLoteFEFO?: undefined;
        numeroLoteFEFO?: undefined;
        fechaVencimientoFEFO?: undefined;
        diasRestantesFEFO?: undefined;
        stockLoteFEFO?: undefined;
        diasDiferencia?: undefined;
    } | {
        existe: boolean;
        cumpleFEFO: boolean;
        idLote: number;
        codigo: any;
        numeroLote: any;
        stock: number;
        fechaVencimiento: any;
        diasRestantes: number;
        idLoteFEFO: number;
        numeroLoteFEFO: any;
        fechaVencimientoFEFO: any;
        diasRestantesFEFO: number;
        stockLoteFEFO: number;
        diasDiferencia: number;
        mensaje: string;
    }>;
    LotesDisponiblesPorProducto(idProducto: number): Promise<any[]>;
    ValidarFEFODetalles(detalles: {
        idLote: number;
        cantidad: number;
    }[]): Promise<{
        idLote: number;
        numeroLote: any;
        codigo: any;
        noVendible: boolean;
        mensaje: string;
        diasRestantes?: undefined;
        idLoteFEFO?: undefined;
        numeroLoteFEFO?: undefined;
        diasRestantesFEFO?: undefined;
        stockRestanteFEFO?: undefined;
        diasDiferencia?: undefined;
    } | {
        idLote: number;
        numeroLote: any;
        codigo: any;
        diasRestantes: number;
        idLoteFEFO: number;
        numeroLoteFEFO: any;
        diasRestantesFEFO: number;
        stockRestanteFEFO: number;
        diasDiferencia: number;
        mensaje: string;
        noVendible?: undefined;
    }>;
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
};
export { DataVenta };
export default DataVenta;
