"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../Middleware/auth");
const ClienteControllers_1 = require("../controllers/ClienteControllers");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/GetCliente', ClienteControllers_1.ClienteControllers.GetClienteC);
router.post('/AddCliente', ClienteControllers_1.ClienteControllers.AddClienteC);
router.put('/UpdateCliente/:idCliente', ClienteControllers_1.ClienteControllers.UpdateClienteC);
router.delete('/DeleteCliente/:idCliente', ClienteControllers_1.ClienteControllers.DeleteClienteC);
exports.default = router;
//# sourceMappingURL=ClienteRoutes.js.map