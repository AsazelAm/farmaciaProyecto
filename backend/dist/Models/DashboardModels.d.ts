declare const DataDashboard: {
    getResumen(): Promise<{
        kpis: {
            ventasTotales: {
                cantidad: number;
                monto: number;
            };
            ventasHoy: {
                cantidad: number;
                monto: number;
            };
            ventasMes: {
                cantidad: number;
                monto: number;
                comparativoMesAnterior: number;
            };
            ventasPendientes: number;
            ventasAnuladas: number;
            totalClientes: number;
            totalProductos: number;
            totalUsuarios: number;
            stockBajo: number;
            lotesPorVencer: number;
            lotesVencidos: number;
        };
    }>;
    getVentasPorMeses(meses?: number): Promise<any[]>;
    getProductosMasVendidos(limite?: number): Promise<{
        idProducto: number;
        codigoBarra: any;
        nombreGenerico: any;
        nombreComercial: any;
        unidades: number;
        monto: number;
    }[]>;
    getVentasPorEstado(): Promise<{
        estado: any;
        cantidad: number;
        monto: number;
    }[]>;
    getVentasPorSucursal(): Promise<{
        idSucursal: number;
        nombre: any;
        cantidad: number;
        monto: number;
    }[]>;
    getVentasPorFormaPago(): Promise<{
        tipoPago: any;
        cantidad: number;
        monto: number;
    }[]>;
    getStockBajo(limite?: number): Promise<{
        idProducto: number;
        codigoBarra: any;
        nombreGenerico: any;
        nombreComercial: any;
        stockMinimo: number;
        stockTotal: number;
    }[]>;
    getLotesPorVencer(dias?: number, limite?: number): Promise<{
        idLote: number;
        numeroLote: any;
        codigoLote: any;
        stock: number;
        fechaVencimiento: any;
        diasParaVencer: number;
        idProducto: number;
        nombreGenerico: any;
        nombreComercial: any;
        concentracion: any;
    }[]>;
    getUltimasVentas(limite?: number): Promise<{
        idVenta: number;
        fechaCreacion: any;
        subtotal: number;
        descuentoTotal: number;
        impuestos: number;
        total: number;
        estado: any;
        tipoPago: any;
        cliente: any;
        usuario: any;
        sucursal: any;
    }[]>;
};
export default DataDashboard;
