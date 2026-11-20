export interface IReciboDetalle {
    cantidad: number;
    precioUnitario: number | string;
    descuento: number | string;
    subtotal: number | string;
    numeroLote?: string;
    codigo?: string;
    codigoBarra?: string;
    fechaVencimiento?: Date | string;
    nombreGenerico?: string;
    nombreComercial?: string | null;
    concentracion?: string | null;
    nombreLaboratorio?: string;
}
export interface IReciboVenta {
    idVenta: number;
    fechaCreacion: Date | string;
    subtotal: number | string;
    descuentoTotal: number | string;
    total: number | string;
    estado: string;
    tipoPago?: string | null;
    observaciones?: string | null;
    cliente?: string;
    clienteNit?: string | null;
    clienteTelefono?: string | null;
    usuario?: string;
    sucursal?: string;
    sucursalDireccion?: string | null;
    detalles: IReciboDetalle[];
    recibo?: {
        numeroRecibo: string;
        estado: string;
    } | null;
}
export declare function numeroALetras(valor: number): string;
export declare function construirReciboHtml(venta: IReciboVenta): string;
export declare function generarReciboPdf(venta: IReciboVenta): Promise<Buffer>;
