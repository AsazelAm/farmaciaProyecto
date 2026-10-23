export interface IFiltrosInventario {
    idLaboratorio?: number | null;
    idTipoProducto?: number | null;
    busqueda?: string | null;
    soloConStock?: boolean;
}
declare function idValido(valor: any): number | null;
declare const DataReporteInventario: {
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
    getDatos(filtros: IFiltrosInventario): Promise<{
        parametros: {
            idLaboratorio: number;
            idTipoProducto: number;
            busqueda: string;
            soloConStock: boolean;
        };
        lotes: {
            idLote: number;
            codigo: any;
            numeroLote: any;
            stock: number;
            costoUnitario: number;
            subtotal: number;
            fechaVencimiento: any;
            producto: {
                idProducto: number;
                nombreComercial: any;
                nombreGenerico: any;
                concentracion: any;
            };
            idLaboratorio: number;
            laboratorio: any;
            idTipoProducto: number;
            tipoProducto: any;
        }[];
        resumen: {
            totalLotes: number;
            totalUnidades: number;
            valorTotal: number;
            porTipoProducto: {
                tipoProducto: string;
                lotes: number;
                unidades: number;
                valor: number;
            }[];
            porLaboratorio: {
                laboratorio: string;
                lotes: number;
                unidades: number;
                valor: number;
            }[];
            porProducto: {
                idProducto: number;
                producto: string;
                lotes: number;
                unidades: number;
                valor: number;
            }[];
        };
    }>;
};
export default DataReporteInventario;
export { idValido };
