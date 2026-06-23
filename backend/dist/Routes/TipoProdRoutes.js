"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../Middleware/auth");
const TipoProdControllers_1 = require("../controllers/TipoProdControllers");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/GetTipoProd', TipoProdControllers_1.TipoProdControllers.GetTipoProdC);
router.post('/AddTipoProd', TipoProdControllers_1.TipoProdControllers.AddTipoProdC);
router.put('/UpdateTipoPro/:idTipoProd', TipoProdControllers_1.TipoProdControllers.UpdateTipoProdC);
router.delete('/DeleteTipoProd/:idTipoProd', TipoProdControllers_1.TipoProdControllers.DeleteTipoProdC);
exports.default = router;
//# sourceMappingURL=TipoProdRoutes.js.map