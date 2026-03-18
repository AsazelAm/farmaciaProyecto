"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../Middleware/auth");
const ExamenControllers_1 = require("../controllers/ExamenControllers");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/Get', ExamenControllers_1.ExamenControllers.GetExamen);
router.post('/AddExa', ExamenControllers_1.ExamenControllers.addExamen);
router.delete('/DeteleExa/:id', ExamenControllers_1.ExamenControllers.DeleteExamencontrollers);
router.put('/UpdateExa/:id', ExamenControllers_1.ExamenControllers.UpdateExamenControllers);
exports.default = router;
//# sourceMappingURL=ExamenRoute.js.map