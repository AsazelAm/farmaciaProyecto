export interface IFiltrosRotacionProductos {
    fechaInicio?: string | null;
    fechaFin?: string | null;
    idLaboratorio?: number | null;
    idTipoProducto?: number | null;
    clasificacion?: string | null;
    busqueda?: string | null;
    soloConStock?: boolean;
}
declare const DataReporteRotacionProductos: {
    getParametros(): Promise<{
        laboratorios: {
            idLaboratorio: number;
            nombre: any;
        }[];
        tiposProducto: {
            idTipoProd: number;
            nombre: any;
        }[];
    }>;
    getDatos(filtros: IFiltrosRotacionProductos): Promise<{
        parametros: {
            fechaInicio: string;
            fechaFin: string;
            idLaboratorio: number;
            idTipoProducto: number;
            clasificacion: string;
            busqueda: string;
            soloConStock: boolean;
        };
        detalles: {
            clasificacion: string;
            idProducto: number;
            codigoBarra: any;
            nombreComercial: any;
            nombreGenerico: any;
            concentracion: any;
            presentacion: any;
            idLaboratorio: number;
            laboratorio: any;
            tipoProducto: any;
            unidadesVendidas: number;
            frecuenciaSalida: number;
            montoVendido: number;
            stockActual: number;
            valorStock: number;
            proximoVencimiento: any;
        }[];
        resumen: {
            totalProductos: number;
            totalUnidadesVendidas: number;
            totalMontoVendido: number;
            totalStock: number;
            totalValorStock: number;
            porClasificacion: {
                clasificacion: string;
                productos: number;
                unidadesVendidas: number;
                montoVendido: number;
                valorStock: number;
            }[];
            porLaboratorio: {
                idLaboratorio: number;
                laboratorio: string;
                productos: number;
                montoVendido: number;
                valorStock: number;
            }[];
            topProductos: {
                idProducto: number;
                producto: any;
                clasificacion: string;
                unidades: number;
                monto: number;
            }[];
            criticos: {
                idProducto: number;
                producto: any;
                stock: number;
                proximoVencimiento: any;
                valorStock: number;
            }[];
        };
    }>;
};
export default DataReporteRotacionProductos;
