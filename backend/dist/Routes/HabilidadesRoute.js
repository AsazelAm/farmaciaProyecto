"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../Middleware/auth");
const HabilidadesControllers_1 = require("../controllers/HabilidadesControllers");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/GetHabilidades', HabilidadesControllers_1.HabilidadesControllers.GetHabilidades);
exports.default = router;
//# sourceMappingURL=HabilidadesRoute.js.map