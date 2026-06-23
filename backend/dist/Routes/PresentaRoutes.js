"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../Middleware/auth");
const PresentaContollers_1 = require("../controllers/PresentaContollers");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/GetPresenta', PresentaContollers_1.PresentaControllers.GetPresentaC);
router.post('/AddPresenta', PresentaContollers_1.PresentaControllers.AddPresentaC);
router.put('/UpdatePresenta/:idPresentacion', PresentaContollers_1.PresentaControllers.UpdatePresentaC);
router.delete('/DeletePresenta/:idPresentacion', PresentaContollers_1.PresentaControllers.DeletePresentaC);
exports.default = router;
//# sourceMappingURL=PresentaRoutes.js.map