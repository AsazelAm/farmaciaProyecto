"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../Middleware/auth");
const LoteControllers_1 = require("../controllers/LoteControllers");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// ── GET: lista todos los lotes (soporta filtros y paginación por query) ─────
router.get('/GetLote', LoteControllers_1.LoteControllers.GetLotesC);
// ── GET: detalle de un lote específico ───────────────────────────────────────
router.get('/GetLote/:idLote', LoteControllers_1.LoteControllers.GetLoteByIdC);
exports.default = router;
//# sourceMappingURL=LoteRoutes.js.map