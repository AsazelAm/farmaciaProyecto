"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../Middleware/auth");
const PrincipioActivoControllers_1 = require("../controllers/PrincipioActivoControllers");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/GetPrincipioActivo', PrincipioActivoControllers_1.PrincipioActivoControllers.GetPrincipioActivoC);
exports.default = router;
//# sourceMappingURL=PrincipioActivoRoutes.js.map