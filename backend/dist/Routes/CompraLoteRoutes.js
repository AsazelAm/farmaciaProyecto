"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../Middleware/auth");
const CompraLoteControllers_1 = require("../controllers/CompraLoteControllers");
const router = (0, express_1.Router)();
// ── Protegemos todas las rutas con el middleware de autenticación ─────────────
router.use(auth_1.authenticate);
// ── GET: estadísticas del dashboard ───────────────────────────────────────────
// OJO: Esta ruta debe ir ANTES de las rutas con /:idCompra para que Express 
// no confunda la palabra "GetEstadisticasCompras" con un ID.
router.get('/GetEstadisticasCompras', CompraLoteControllers_1.CompraLoteControllers.GetEstadisticasC);
// ── GET: lista todas las compras (soporta filtros y paginación por query) ─────
router.get('/GetCompras', CompraLoteControllers_1.CompraLoteControllers.GetComprasC);
// ── GET: detalle de una compra específica con sus lotes ───────────────────────
router.get('/GetCompra/:idCompra', CompraLoteControllers_1.CompraLoteControllers.GetCompraByIdC);
// ── POST: crear una nueva compra y sus lotes correspondientes ─────────────────
router.post('/AddCompra', CompraLoteControllers_1.CompraLoteControllers.AddCompraC);
// ── PUT: actualizar una compra completa (solo si está en estado pendiente) ────
router.put('/UpdateCompra/:idCompra', CompraLoteControllers_1.CompraLoteControllers.UpdateCompraC);
// ── PATCH: cambiar el estado de la compra (completado o cancelado) ────────────
router.patch('/ChangeEstadoCompra/:idCompra', CompraLoteControllers_1.CompraLoteControllers.ChangeEstadoCompraC);
exports.default = router;
//# sourceMappingURL=CompraLoteRoutes.js.map