"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../Middleware/auth");
const TipoUsControllers_1 = require("../controllers/TipoUsControllers");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/GetTipoUs', TipoUsControllers_1.TipoUsControllers.GetTipoUsC);
router.post('/AddTipoUs', TipoUsControllers_1.TipoUsControllers.AddTipoUsC);
router.put('/UpdateTipoUs/:idTipoUs', TipoUsControllers_1.TipoUsControllers.UpdateTipoUsC);
router.delete('/DeleteTipoUs/:idTipoUs', TipoUsControllers_1.TipoUsControllers.DeleteTipoUsC);
exports.default = router;
//# sourceMappingURL=TipoUsRoutes.js.map