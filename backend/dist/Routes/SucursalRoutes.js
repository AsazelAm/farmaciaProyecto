"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../Middleware/auth");
const SucursalControllers_1 = require("../controllers/SucursalControllers");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/GetSucursal', SucursalControllers_1.SucursalControllers.GetSucursalC);
exports.default = router;
//# sourceMappingURL=SucursalRoutes.js.map