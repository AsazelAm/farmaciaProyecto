import { Router } from 'express';
import { authenticate } from '../Middleware/auth';
import { VentaControllers } from '../controllers/VentaControllers';

const router = Router();

// ── Protegemos todas las rutas con el middleware de autenticación ─────────────
router.use(authenticate);

// ── GET: estadísticas del dashboard ───────────────────────────────────────────
// OJO: Esta ruta debe ir ANTES de las rutas con /:idVenta para que Express 
// no confunda la palabra "GetEstadisticasVentas" con un ID.
router.get('/GetEstadisticasVentas',
    VentaControllers.GetEstadisticasC
);

// ── GET: lotes activos disponibles de un producto (para el selector del POS) ──
// También debe ir ANTES de las rutas con /:idVenta para no chocar con Express.
router.get('/GetLotesDisponibles/:idProducto',
    VentaControllers.GetLotesDisponiblesC
);

// ── GET: lista todas las ventas (soporta filtros y paginación por query) ──────
router.get('/GetVentas',
    VentaControllers.GetVentasC
);

// ── GET: detalle de una venta específica con sus productos/lotes ──────────────
router.get('/GetVenta/:idVenta',
    VentaControllers.GetVentaByIdC
);

// ── POST: crear una nueva venta y descontar el stock de los lotes ─────────────
router.post('/AddVenta',
    VentaControllers.AddVentaC
);

// ── PUT: actualizar una venta completa (solo si está en estado pendiente) ─────
router.put('/UpdateVenta/:idVenta',
    VentaControllers.UpdateVentaC
);

// ── PATCH: cambiar el estado de la venta (completada, anulada o pendiente) ────
router.patch('/ChangeEstadoVenta/:idVenta',
    VentaControllers.ChangeEstadoVentaC
);

// ── POST: emitir la factura de una venta ya completada ────────────────────────
router.post('/EmitirFactura/:idVenta',
    VentaControllers.EmitirFacturaC
);

export default router;