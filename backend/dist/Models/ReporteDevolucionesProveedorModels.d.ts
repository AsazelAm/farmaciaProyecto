export declare const MOTIVOS_DEVOLUCION_PROVEEDOR: Record<string, string>;
export declare const ESTADOS_DEVOLUCION_PROVEEDOR: Record<string, string>;
export declare const ESTADOS_NOTA_CREDITO: Record<string, string>;
export interface IFiltrosDevolucionesProveedor {
    fechaInicio?: string | null;
    fechaFin?: string | null;
    idProveedor?: number | null;
    idLaboratorio?: number | null;
    motivo?: string | null;
    estadoNotaCredito?: string | null;
    idUsuario?: number | null;
    producto?: string | null;
    busqueda?: string | null;
}
declare function num(valor: any, porDefecto?: number): number;
declare function idValido(valor: any): number | null;
declare const DataReporteDevolucionesProveedor: {
    getParametros(): Promise<{
        motivos: {
            value: string;
            label: string;
        }[];
        estadosNotaCredito: {
            value: string;
            label: string;
        }[];
        estadosDevolucion: {
            value: string;
            label: string;
        }[];
        proveedores: {
            idProveedor: number;
            nombre: any;
        }[];
        laboratorios: {
            idLaboratorio: number;
            nombre: any;
        }[];
        usuarios: {
            idUsuario: number;
            nombre: any;
        }[];
    }>;
    getDatos(filtros: IFiltrosDevolucionesProveedor): Promise<{
        parametros: {
            fechaInicio: string;
            fechaFin: string;
            idProveedor: number;
            idLaboratorio: number;
            motivo: string;
            estadoNotaCredito: string;
            idUsuario: number;
            producto: string;
            busqueda: string;
        };
        detalles: {
            idDevolucionProveedor: number;
            numeroDevolucion: string;
            fechaCreacion: any;
            fechaResolucion: any;
            tipo: any;
            motivo: string;
            motivoLabel: string;
            estado: string;
            estadoLabel: string;
            estadoNotaCredito: string;
            estadoNotaCreditoLabel: string;
            numeroNotaCredito: any;
            montoNotaCredito: number;
            observaciones: any;
            idCompra: number;
            numeroFacturaCompra: any;
            fechaCompra: any;
            fechaEntrega: any;
            montoCompra: number;
            idProveedor: number;
            proveedor: any;
            idUsuario: number;
            usuario: any;
            idUsuarioAutoriza: number;
            usuarioAutoriza: any;
            idLote: number;
            codigoLote: any;
            numeroLote: any;
            fechaVencimiento: any;
            idProducto: number;
            codigoBarra: any;
            nombreComercial: any;
            nombreGenerico: any;
            concentracion: any;
            presentacion: any;
            cantidad: number;
            precioUnitario: number;
            montoLinea: number;
            idLaboratorio: number;
            laboratorio: any;
            idTipoProducto: number;
            tipoProducto: any;
        }[];
        resumen: {
            totalDevoluciones: number;
            totalLineas: number;
            totalUnidades: any;
            montoTotalNC: any;
            montoPromedio: number;
            porProveedor: any[];
            porMotivo: any[];
            porEstadoNotaCredito: any[];
            porLaboratorio: any[];
            topProductos: {
                idProducto: number;
                producto: string;
                unidades: number;
                monto: number;
            }[];
        };
    }>;
};
export default DataReporteDevolucionesProveedor;
export { idValido, num };
