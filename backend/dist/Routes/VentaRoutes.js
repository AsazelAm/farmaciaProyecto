"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../Middleware/auth");
const VentaControllers_1 = require("../controllers/VentaControllers");
const router = (0, express_1.Router)();
// ── Protegemos todas las rutas con el middleware de autenticación ─────────────
router.use(auth_1.authenticate);
// ── GET: estadísticas del dashboard ───────────────────────────────────────────
// OJO: Esta ruta debe ir ANTES de las rutas con /:idVenta para que Express 
// no confunda la palabra "GetEstadisticasVentas" con un ID.
router.get('/GetEstadisticasVentas', VentaControllers_1.VentaControllers.GetEstadisticasC);
// ── GET: lotes activos disponibles de un producto (para el selector del POS) ──
// También debe ir ANTES de las rutas con /:idVenta para no chocar con Express.
router.get('/GetLotesDisponibles/:idProducto', VentaControllers_1.VentaControllers.GetLotesDisponiblesC);
// ── GET: lista todas las ventas (soporta filtros y paginación por query) ──────
router.get('/GetVentas', VentaControllers_1.VentaControllers.GetVentasC);
// ── GET: detalle de una venta específica con sus productos/lotes ──────────────
router.get('/GetVenta/:idVenta', VentaControllers_1.VentaControllers.GetVentaByIdC);
// ── POST: crear una nueva venta y descontar el stock de los lotes ─────────────
router.post('/AddVenta', VentaControllers_1.VentaControllers.AddVentaC);
// ── PUT: actualizar una venta completa (solo si está en estado pendiente) ─────
router.put('/UpdateVenta/:idVenta', VentaControllers_1.VentaControllers.UpdateVentaC);
// ── PATCH: cambiar el estado de la venta (completada, anulada o pendiente) ────
router.patch('/ChangeEstadoVenta/:idVenta', VentaControllers_1.VentaControllers.ChangeEstadoVentaC);
// ── POST: emitir la factura de una venta ya completada ────────────────────────
router.post('/EmitirFactura/:idVenta', VentaControllers_1.VentaControllers.EmitirFacturaC);
exports.default = router;
//# sourceMappingURL=VentaRoutes.js.map