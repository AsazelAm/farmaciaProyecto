"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardControllers = void 0;
const DashboardModels_1 = __importDefault(require("../Models/DashboardModels"));
// Valida un número entero positivo desde un query param y devuelve el default si no aplica.
function numeroQuery(valor, porDefecto) {
    const n = Number(valor);
    return Number.isInteger(n) && n > 0 ? n : porDefecto;
}
class DashboardControllers {
    // ── GET: Dashboard completo (todos los bloques en una sola llamada) ──────
    static GetDashboardC = async (req, res) => {
        try {
            const [resumen, ventasPorMeses, productosMasVendidos, porEstado, porSucursal, porFormaPago, stockBajo, lotesPorVencer, ultimasVentas] = await Promise.all([
                DashboardModels_1.default.getResumen(),
                DashboardModels_1.default.getVentasPorMeses(),
                DashboardModels_1.default.getProductosMasVendidos(),
                DashboardModels_1.default.getVentasPorEstado(),
                DashboardModels_1.default.getVentasPorSucursal(),
                DashboardModels_1.default.getVentasPorFormaPago(),
                DashboardModels_1.default.getStockBajo(),
                DashboardModels_1.default.getLotesPorVencer(),
                DashboardModels_1.default.getUltimasVentas(),
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
        }
        catch (error) {
            console.error('Error al obtener el dashboard:', error);
            res.status(500).json({ error: 'Error al cargar el dashboard' });
        }
    };
    // ── GET: Tarjetas de indicadores (KPIs) ───────────────────────────────────
    static GetResumenC = async (req, res) => {
        try {
            const data = await DashboardModels_1.default.getResumen();
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error al obtener el resumen del dashboard:', error);
            res.status(500).json({ error: 'Error al cargar los indicadores del dashboard' });
        }
    };
    // ── GET: Serie de ventas de los últimos N meses ───────────────────────────
    static GetVentasPorMesesC = async (req, res) => {
        try {
            const meses = numeroQuery(req.query.meses, 12);
            const data = await DashboardModels_1.default.getVentasPorMeses(meses);
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error al obtener las ventas por mes:', error);
            res.status(500).json({ error: 'Error al cargar el gráfico de ventas por mes' });
        }
    };
    // ── GET: Productos más vendidos ───────────────────────────────────────────
    static GetProductosMasVendidosC = async (req, res) => {
        try {
            const limite = numeroQuery(req.query.limite, 8);
            const data = await DashboardModels_1.default.getProductosMasVendidos(limite);
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error al obtener los productos más vendidos:', error);
            res.status(500).json({ error: 'Error al cargar los productos más vendidos' });
        }
    };
    // ── GET: Ventas por estado ────────────────────────────────────────────────
    static GetVentasPorEstadoC = async (req, res) => {
        try {
            const data = await DashboardModels_1.default.getVentasPorEstado();
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error al obtener las ventas por estado:', error);
            res.status(500).json({ error: 'Error al cargar el gráfico de ventas por estado' });
        }
    };
    // ── GET: Ventas por sucursal ──────────────────────────────────────────────
    static GetVentasPorSucursalC = async (req, res) => {
        try {
            const data = await DashboardModels_1.default.getVentasPorSucursal();
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error al obtener las ventas por sucursal:', error);
            res.status(500).json({ error: 'Error al cargar el gráfico de ventas por sucursal' });
        }
    };
    // ── GET: Ventas por forma de pago ─────────────────────────────────────────
    static GetVentasPorFormaPagoC = async (req, res) => {
        try {
            const data = await DashboardModels_1.default.getVentasPorFormaPago();
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error al obtener las ventas por forma de pago:', error);
            res.status(500).json({ error: 'Error al cargar el gráfico de formas de pago' });
        }
    };
    // ── GET: Productos con stock bajo ─────────────────────────────────────────
    static GetStockBajoC = async (req, res) => {
        try {
            const limite = numeroQuery(req.query.limite, 10);
            const data = await DashboardModels_1.default.getStockBajo(limite);
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error al obtener el stock bajo:', error);
            res.status(500).json({ error: 'Error al cargar los productos con stock bajo' });
        }
    };
    // ── GET: Lotes próximos a vencer ──────────────────────────────────────────
    static GetLotesPorVencerC = async (req, res) => {
        try {
            const dias = numeroQuery(req.query.dias, 30);
            const limite = numeroQuery(req.query.limite, 10);
            const data = await DashboardModels_1.default.getLotesPorVencer(dias, limite);
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error al obtener los lotes por vencer:', error);
            res.status(500).json({ error: 'Error al cargar los lotes próximos a vencer' });
        }
    };
    // ── GET: Últimas ventas registradas ───────────────────────────────────────
    static GetUltimasVentasC = async (req, res) => {
        try {
            const limite = numeroQuery(req.query.limite, 10);
            const data = await DashboardModels_1.default.getUltimasVentas(limite);
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error al obtener las últimas ventas:', error);
            res.status(500).json({ error: 'Error al cargar las últimas ventas' });
        }
    };
}
exports.DashboardControllers = DashboardControllers;
//# sourceMappingURL=DashboardControllers.js.map