"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../Middleware/auth");
const DevolucionControllers_1 = require("../controllers/DevolucionControllers");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// ═════════════ DEVOLUCIONES DE VENTA ═════════════
// OJO: las rutas fijas deben ir ANTES de las que usan /:id para evitar colisiones.
router.get('/GetDevolucionesVenta', DevolucionControllers_1.DevolucionControllers.GetDevolucionesVentaC);
router.get('/GetDevolucionVenta/:idDevolucionVenta', DevolucionControllers_1.DevolucionControllers.GetDevolucionVentaByIdC);
router.post('/AddDevolucionVenta', DevolucionControllers_1.DevolucionControllers.AddDevolucionVentaC);
router.patch('/ResolverDevolucionVenta/:idDevolucionVenta', DevolucionControllers_1.DevolucionControllers.ResolverDevolucionVentaC);
// ═════════════ DEVOLUCIONES A PROVEEDOR ═════════════
router.get('/GetDevolucionesProveedor', DevolucionControllers_1.DevolucionControllers.GetDevolucionesProveedorC);
router.get('/GetDevolucionProveedor/:idDevolucionProveedor', DevolucionControllers_1.DevolucionControllers.GetDevolucionProveedorByIdC);
router.post('/AddDevolucionProveedor', DevolucionControllers_1.DevolucionControllers.AddDevolucionProveedorC);
router.patch('/ResolverDevolucionProveedor/:idDevolucionProveedor', DevolucionControllers_1.DevolucionControllers.ResolverDevolucionProveedorC);
exports.default = router;
//# sourceMappingURL=DevolucionRoutes.js.map