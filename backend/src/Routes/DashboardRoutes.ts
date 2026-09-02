import { Router } from 'express';
import { authenticate } from '../Middleware/auth';
import { DashboardControllers } from '../controllers/DashboardControllers';

const router = Router();

router.use(authenticate);

//  GET: dashboard completo (KPIs + gráficos + alertas más recientes en una sola llamada)
router.get('/GetDashboard',
    DashboardControllers.GetDashboardC
);

//  GET: tarjetas de indicadores (ventas del día/mes, clientes, productos, alertas, etc.)
router.get('/GetResumen',
    DashboardControllers.GetResumenC
);

//  GET: serie de ventas completadas de los últimos N meses (?meses=12)
router.get('/GetVentasPorMeses',
    DashboardControllers.GetVentasPorMesesC
);

//  GET: top de productos más vendidos (?limite=8)
router.get('/GetProductosMasVendidos',
    DashboardControllers.GetProductosMasVendidosC
);

//  GET: distribución de ventas por estado (pendiente/completada/anulada)
router.get('/GetVentasPorEstado',
    DashboardControllers.GetVentasPorEstadoC
);

//  GET: ventas completadas agrupadas por sucursal
router.get('/GetVentasPorSucursal',
    DashboardControllers.GetVentasPorSucursalC
);

//  GET: ventas completadas agrupadas por forma de pago
router.get('/GetVentasPorFormaPago',
    DashboardControllers.GetVentasPorFormaPagoC
);

//  GET: productos con stock por debajo del mínimo (?limite=10)
router.get('/GetStockBajo',
    DashboardControllers.GetStockBajoC
);

//  GET: lotes próximos a vencer (?dias=30&limite=10)
router.get('/GetLotesPorVencer',
    DashboardControllers.GetLotesPorVencerC
);

//  GET: últimas ventas registradas (?limite=10)
router.get('/GetUltimasVentas',
    DashboardControllers.GetUltimasVentasC
);

export default router;