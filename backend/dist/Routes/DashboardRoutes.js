"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../Middleware/auth");
const DashboardControllers_1 = require("../controllers/DashboardControllers");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
//  GET: dashboard completo (KPIs + gráficos + alertas más recientes en una sola llamada)
router.get('/GetDashboard', DashboardControllers_1.DashboardControllers.GetDashboardC);
//  GET: tarjetas de indicadores (ventas del día/mes, clientes, productos, alertas, etc.)
router.get('/GetResumen', DashboardControllers_1.DashboardControllers.GetResumenC);
//  GET: serie de ventas completadas de los últimos N meses (?meses=12)
router.get('/GetVentasPorMeses', DashboardControllers_1.DashboardControllers.GetVentasPorMesesC);
//  GET: top de productos más vendidos (?limite=8)
router.get('/GetProductosMasVendidos', DashboardControllers_1.DashboardControllers.GetProductosMasVendidosC);
//  GET: distribución de ventas por estado (pendiente/completado/cancelado)
router.get('/GetVentasPorEstado', DashboardControllers_1.DashboardControllers.GetVentasPorEstadoC);
//  GET: ventas completadas agrupadas por sucursal
router.get('/GetVentasPorSucursal', DashboardControllers_1.DashboardControllers.GetVentasPorSucursalC);
//  GET: ventas completadas agrupadas por forma de pago
router.get('/GetVentasPorFormaPago', DashboardControllers_1.DashboardControllers.GetVentasPorFormaPagoC);
//  GET: productos con stock por debajo del mínimo (?limite=10)
router.get('/GetStockBajo', DashboardControllers_1.DashboardControllers.GetStockBajoC);
//  GET: lotes próximos a vencer (?dias=30&limite=10)
router.get('/GetLotesPorVencer', DashboardControllers_1.DashboardControllers.GetLotesPorVencerC);
//  GET: últimas ventas registradas (?limite=10)
router.get('/GetUltimasVentas', DashboardControllers_1.DashboardControllers.GetUltimasVentasC);
exports.default = router;
//# sourceMappingURL=DashboardRoutes.js.map