"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CursMoodleControllers_1 = require("../controllers/CursMoodleControllers");
const auth_1 = require("../Middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/GetCursoMoodle', CursMoodleControllers_1.CursMoodleControllers.GetCurMoodleController);
exports.default = router;
//# sourceMappingURL=CursosMoodleRoutes.js.map