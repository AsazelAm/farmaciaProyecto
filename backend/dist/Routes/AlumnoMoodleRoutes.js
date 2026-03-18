"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AlumMoodleControllers_1 = require("../controllers/AlumMoodleControllers");
const auth_1 = require("../Middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/GetAlumnoMoodle', AlumMoodleControllers_1.AlumnMoodleControllers.GetAlumnMoodleController);
exports.default = router;
//# sourceMappingURL=AlumnoMoodleRoutes.js.map