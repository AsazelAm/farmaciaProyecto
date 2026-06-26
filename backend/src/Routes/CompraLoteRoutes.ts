import { Router } from 'express';
import { authenticate } from '../Middleware/auth';
import { CompraLoteControllers } from '../controllers/CompraLoteControllers';

const router = Router();

// ── Protegemos todas las rutas con el middleware de autenticación ─────────────
router.use(authenticate);

// ── GET: estadísticas del dashboard ───────────────────────────────────────────
// OJO: Esta ruta debe ir ANTES de las rutas con /:idCompra para que Express 
// no confunda la palabra "GetEstadisticasCompras" con un ID.
router.get('/GetEstadisticasCompras',
    CompraLoteControllers.GetEstadisticasC
);

// ── GET: lista todas las compras (soporta filtros y paginación por query) ─────
router.get('/GetCompras',
    CompraLoteControllers.GetComprasC
);

// ── GET: detalle de una compra específica con sus lotes ───────────────────────
router.get('/GetCompra/:idCompra',
    CompraLoteControllers.GetCompraByIdC
);

// ── POST: crear una nueva compra y sus lotes correspondientes ─────────────────
router.post('/AddCompra',
    CompraLoteControllers.AddCompraC
);

// ── PUT: actualizar una compra completa (solo si está en estado pendiente) ────
router.put('/UpdateCompra/:idCompra',
    CompraLoteControllers.UpdateCompraC
);

// ── PATCH: cambiar el estado de la compra (completado o cancelado) ────────────
router.patch('/ChangeEstadoCompra/:idCompra',
    CompraLoteControllers.ChangeEstadoCompraC
);

export default router;