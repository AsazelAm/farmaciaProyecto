declare const FRECUENCIAS: readonly ["diario", "semanal", "mensual"];
export type FrecuenciaReporte = typeof FRECUENCIAS[number];
declare const DataReportes: {
    getDatos(frecuenciaValue: string, fechaInicioValue?: any, fechaFinValue?: any): Promise<{
        frecuencia: "diario" | "semanal" | "mensual";
        fechaInicio: string;
        fechaFin: string;
        periodos: {
            unidad: any;
            etiqueta: any;
            cantidad: number;
            subtotal: number;
            descuentoTotal: number;
            impuestos: number;
            total: number;
        }[];
        ventas: {
            idVenta: number;
            numeroFactura: any;
            fechaCreacion: any;
            cliente: any;
            usuario: any;
            sucursal: any;
            tipoPago: any;
            estado: any;
            subtotal: number;
            descuentoTotal: number;
            impuestos: number;
            total: number;
        }[];
        totales: any;
    }>;
};
export default DataReportes;
