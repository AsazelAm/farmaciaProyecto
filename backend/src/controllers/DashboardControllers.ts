import { Request, Response } from 'express';
import DataDashboard from '../Models/DashboardModels';

// Valida un número entero positivo desde un query param y devuelve el default si no aplica.
function numeroQuery(valor: any, porDefecto: number): number {
    const n = Number(valor);
    return Number.isInteger(n) && n > 0 ? n : porDefecto;
}

export class DashboardControllers {

    // ── GET: Dashboard completo (todos los bloques en una sola llamada) ──────
    static readonly GetDashboardC = async (req: Request, res: Response): Promise<any> => {
        try {
            const [resumen, ventasPorMeses, productosMasVendidos, porEstado, porSucursal, porFormaPago, stockBajo, lotesPorVencer, ultimasVentas] =
                await Promise.all([
                    DataDashboard.getResumen(),
                    DataDashboard.getVentasPorMeses(),
                    DataDashboard.getProductosMasVendidos(),
                    DataDashboard.getVentasPorEstado(),
                    DataDashboard.getVentasPorSucursal(),
                    DataDashboard.getVentasPorFormaPago(),
                    DataDashboard.getStockBajo(),
                    DataDashboard.getLotesPorVencer(),
                    DataDashboard.getUltimasVentas(),
                ]);

            res.status(200).json({
                resumen,
                ventasPorMeses,
                productosMasVendidos,
                porEstado,
                porSucursal,
                porFormaPago,
                stockBajo,
                lotesPorVencer,
                ultimasVentas,
            });
        } catch (error) {
            console.error('Error al obtener el dashboard:', error);
            res.status(500).json({ error: 'Error al cargar el dashboard' });
        }
    };

    // ── GET: Tarjetas de indicadores (KPIs) ───────────────────────────────────
    static readonly GetResumenC = async (req: Request, res: Response): Promise<any> => {
        try {
            const data = await DataDashboard.getResumen();
            res.status(200).json(data);
        } catch (error) {
            console.error('Error al obtener el resumen del dashboard:', error);
            res.status(500).json({ error: 'Error al cargar los indicadores del dashboard' });
        }
    };

    // ── GET: Serie de ventas de los últimos N meses ───────────────────────────
    static readonly GetVentasPorMesesC = async (req: Request, res: Response): Promise<any> => {
        try {
            const meses = numeroQuery(req.query.meses, 12);
            const data = await DataDashboard.getVentasPorMeses(meses);
            res.status(200).json(data);
        } catch (error) {
            console.error('Error al obtener las ventas por mes:', error);
            res.status(500).json({ error: 'Error al cargar el gráfico de ventas por mes' });
        }
    };

    // ── GET: Productos más vendidos ───────────────────────────────────────────
    static readonly GetProductosMasVendidosC = async (req: Request, res: Response): Promise<any> => {
        try {
            const limite = numeroQuery(req.query.limite, 8);
            const data = await DataDashboard.getProductosMasVendidos(limite);
            res.status(200).json(data);
        } catch (error) {
            console.error('Error al obtener los productos más vendidos:', error);
            res.status(500).json({ error: 'Error al cargar los productos más vendidos' });
        }
    };

    // ── GET: Ventas por estado ────────────────────────────────────────────────
    static readonly GetVentasPorEstadoC = async (req: Request, res: Response): Promise<any> => {
        try {
            const data = await DataDashboard.getVentasPorEstado();
            res.status(200).json(data);
        } catch (error) {
            console.error('Error al obtener las ventas por estado:', error);
            res.status(500).json({ error: 'Error al cargar el gráfico de ventas por estado' });
        }
    };

    // ── GET: Ventas por sucursal ──────────────────────────────────────────────
    static readonly GetVentasPorSucursalC = async (req: Request, res: Response): Promise<any> => {
        try {
            const data = await DataDashboard.getVentasPorSucursal();
            res.status(200).json(data);
        } catch (error) {
            console.error('Error al obtener las ventas por sucursal:', error);
            res.status(500).json({ error: 'Error al cargar el gráfico de ventas por sucursal' });
        }
    };

    // ── GET: Ventas por forma de pago ─────────────────────────────────────────
    static readonly GetVentasPorFormaPagoC = async (req: Request, res: Response): Promise<any> => {
        try {
            const data = await DataDashboard.getVentasPorFormaPago();
            res.status(200).json(data);
        } catch (error) {
            console.error('Error al obtener las ventas por forma de pago:', error);
            res.status(500).json({ error: 'Error al cargar el gráfico de formas de pago' });
        }
    };

    // ── GET: Productos con stock bajo ─────────────────────────────────────────
    static readonly GetStockBajoC = async (req: Request, res: Response): Promise<any> => {
        try {
            const limite = numeroQuery(req.query.limite, 10);
            const data = await DataDashboard.getStockBajo(limite);
            res.status(200).json(data);
        } catch (error) {
            console.error('Error al obtener el stock bajo:', error);
            res.status(500).json({ error: 'Error al cargar los productos con stock bajo' });
        }
    };

    // ── GET: Lotes próximos a vencer ──────────────────────────────────────────
    static readonly GetLotesPorVencerC = async (req: Request, res: Response): Promise<any> => {
        try {
            const dias = numeroQuery(req.query.dias, 30);
            const limite = numeroQuery(req.query.limite, 10);
            const data = await DataDashboard.getLotesPorVencer(dias, limite);
            res.status(200).json(data);
        } catch (error) {
            console.error('Error al obtener los lotes por vencer:', error);
            res.status(500).json({ error: 'Error al cargar los lotes próximos a vencer' });
        }
    };

    // ── GET: Últimas ventas registradas ───────────────────────────────────────
    static readonly GetUltimasVentasC = async (req: Request, res: Response): Promise<any> => {
        try {
            const limite = numeroQuery(req.query.limite, 10);
            const data = await DataDashboard.getUltimasVentas(limite);
            res.status(200).json(data);
        } catch (error) {
            console.error('Error al obtener las últimas ventas:', error);
            res.status(500).json({ error: 'Error al cargar las últimas ventas' });
        }
    };
}