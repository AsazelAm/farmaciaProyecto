export interface IFiltrosFacturacion {
    fechaInicio?: string | null;
    fechaFin?: string | null;
    estado?: string | null;
    tipoFactura?: string | null;
    busqueda?: string | null;
}
declare const DataReporteFacturacion: {
    getParametros(): Promise<{
        estados: {
            value: any;
            label: any;
        }[];
        tiposFactura: {
            value: any;
            label: any;
        }[];
    }>;
    getDatos(filtros: IFiltrosFacturacion): Promise<{
        parametros: {
            fechaInicio: string;
            fechaFin: string;
            estado: string;
            tipoFactura: string;
            busqueda: string;
        };
        detalles: {
            idFactura: number;
            numeroFactura: any;
            fechaEmision: any;
            tipoFactura: any;
            nitCliente: any;
            razonSocial: any;
            emailCliente: any;
            subtotal: number;
            descuento: number;
            impuesto: number;
            total: number;
            estado: any;
            fechaAnulacion: any;
            motivoAnulacion: any;
            idVenta: number;
            usuarioEmisor: any;
            usuarioAnulacion: any;
        }[];
        resumen: {
            totalFacturas: number;
            facturasEmitidas: number;
            facturasAnuladas: number;
            porcentajeAnuladas: number;
            montoTotal: number;
            montoEmitido: number;
            montoAnulado: number;
            subtotalTotal: number;
            descuentoTotal: number;
            impuestoTotal: number;
            porEstado: {
                estado: string;
                facturas: number;
                total: number;
            }[];
            porTipo: {
                tipo: string;
                facturas: number;
                total: number;
            }[];
            motivosAnulacion: {
                motivo: string;
                facturas: number;
            }[];
        };
    }>;
};
export default DataReporteFacturacion;
