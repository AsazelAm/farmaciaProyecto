declare const FRECUENCIAS: readonly ["diario", "semanal", "mensual"];
export type FrecuenciaReporte = typeof FRECUENCIAS[number];
declare const DataReportes: {
    getDatos(frecuenciaValue: string, fechaInicioValue?: any, fechaFinValue?: any): Promise<{
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
        detalles: {
            idEntidad: number;
            numeroFactura: any;
            fechaCreacion: any;
            pagador: any;
            usuario: any;
            sucursal: any;
            estado: any;
            subtotal: number;
            descuentoTotal: number;
            impuestos: number;
            total: number;
        }[];
        totales: any;
    }>;
    getDatosCompra(frecuenciaValue: string, fechaInicioValue?: any, fechaFinValue?: any): Promise<{
        compras: {
            idEntidad: number;
            numeroFactura: any;
            fechaCreacion: any;
            pagador: any;
            usuario: any;
            sucursal: any;
            estado: any;
            subtotal: number;
            descuentoTotal: number;
            impuestos: number;
            total: number;
        }[];
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
        detalles: {
            idEntidad: number;
            numeroFactura: any;
            fechaCreacion: any;
            pagador: any;
            usuario: any;
            sucursal: any;
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
