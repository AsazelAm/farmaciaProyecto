export declare const UMBRAL_CRITICO_DIAS = 30;
export declare const UMBRAL_ADVERTENCIA_DIAS = 90;
export type NivelVencimiento = 'vencido' | 'critico' | 'advertencia' | 'optimo';
export declare const NIVELES_VENCIMIENTO: NivelVencimiento[];
export declare const ETIQUETA_NIVEL: Record<NivelVencimiento, string>;
export declare const ACCION_POR_NIVEL: Record<NivelVencimiento, string>;
export declare const ESTADOS_LOTE: Record<string, string>;
export interface IFiltrosVencimientos {
    diasMin?: number | null;
    diasMax?: number | null;
    idLaboratorio?: number | null;
    idTipoProducto?: number | null;
    idProveedor?: number | null;
    estados?: string[];
    busqueda?: string | null;
    soloConStock?: boolean;
    limite?: number | null;
}
declare function idValido(valor: any): number | null;
declare function numeroValido(valor: any): number | null;
declare function listaEstados(valor: any): string[];
export declare function clasificarNivel(diasRestantes: number): NivelVencimiento;
declare const DataReporteVencimientos: {
    getParametros(): Promise<{
        umbrales: {
            critico: number;
            advertencia: number;
        };
        laboratorios: {
            idLaboratorio: number;
            nombre: any;
        }[];
        tiposProducto: {
            idTipoProd: number;
            nombre: any;
        }[];
        proveedores: {
            idProveedor: number;
            nombre: any;
        }[];
    }>;
    getDatos(filtros: IFiltrosVencimientos): Promise<{
        parametros: {
            diasMin: number;
            diasMax: number;
            idLaboratorio: number;
            idTipoProducto: number;
            idProveedor: number;
            estados: string[];
            busqueda: string;
            soloConStock: boolean;
            umbrales: {
                critico: number;
                advertencia: number;
            };
        };
        lotes: {
            idLote: number;
            codigo: any;
            numeroLote: any;
            stock: number;
            fechaVencimiento: any;
            fechaIngreso: any;
            fechaFabricacion: any;
            estadoLote: any;
            estadoLoteLabel: any;
            precioCompra: number;
            precioVenta: number;
            valorEnRiesgo: number;
            diasRestantes: number;
            nivel: NivelVencimiento;
            nivelLabel: string;
            accion: string;
            esFEFO: boolean;
            idLoteFEFO: number;
            requiereReceta: number;
            viaAdministracion: any;
            producto: {
                idProducto: number;
                codigoBarra: any;
                nombreComercial: any;
                nombreGenerico: any;
                concentracion: any;
                presentacion: any;
                viaAdministracion: any;
                requiereReceta: number;
            };
            idLaboratorio: number;
            laboratorio: any;
            idTipoProd: number;
            tipoProducto: any;
            idProveedor: number;
            proveedor: any;
        }[];
        resumen: {
            totalLotes: number;
            totalUnidades: any;
            valorTotal: any;
            valorEnRiesgo: any;
            valorCritico: any;
            porNivel: {
                nivel: NivelVencimiento;
                etiqueta: string;
                accion: string;
                lotes: number;
                unidades: any;
                valor: any;
            }[];
            porLaboratorio: {
                laboratorio: string;
                lotes: number;
                unidades: number;
                valor: number;
            }[];
            controlFEFO: {
                idProducto: any;
                producto: any;
                idLoteFEFO: any;
                codigoFEFO: any;
                numeroLoteFEFO: any;
                fechaVencimientoFEFO: any;
                diasRestantesFEFO: any;
                nivelFEFO: any;
                totalLotes: number;
                stockLotesPosteriores: any;
                valorLotesPosteriores: any;
            }[];
        };
    }>;
};
export default DataReporteVencimientos;
export { numeroValido, idValido, listaEstados };
