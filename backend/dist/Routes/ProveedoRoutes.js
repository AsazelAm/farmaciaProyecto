"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../Middleware/auth");
const ProveControllers_1 = require("../controllers/ProveControllers");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/GetProveedor', ProveControllers_1.ProveedorControllers.GetProveedorC);
router.post('/AddProveedor', ProveControllers_1.ProveedorControllers.AddProveedorC);
router.put('/UpdateProveedor/:idProveedor', ProveControllers_1.ProveedorControllers.UpdateProveedorC);
router.delete('/DeleteProveedor/:idProveedor', ProveControllers_1.ProveedorControllers.DeleteProveedorC);
exports.default = router;
//# sourceMappingURL=ProveedoRoutes.js.map