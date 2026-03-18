"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../Middleware/auth");
const DocenteControllers_1 = require("../controllers/DocenteControllers");
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// GET - Obtener todos los docentes
router.get('/GetDocente', DocenteControllers_1.DocentesControllers.GetDocenteControllers);
// GET - Obtener un docente por ID
router.get('/GetDocente/:id', DocenteControllers_1.DocentesControllers.GetDocenteByIdControllers);
// GET - Obtener habilidades de un docente
router.get('/habilidades/:id', DocenteControllers_1.DocentesControllers.gethabilidadesDocentes);
// POST - Crear nuevo docente
router.post('/AddDocentes', upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'cv', maxCount: 1 },
]), DocenteControllers_1.DocentesControllers.AddDocentesControllers);
// PUT - Actualizar docente
router.put('/UpdateDocente/:id', upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'cv', maxCount: 1 },
]), DocenteControllers_1.DocentesControllers.UpdateDocenteControllers);
// DELETE - Eliminar docente (soft delete)
router.delete('/DeleteDocentes/:id', DocenteControllers_1.DocentesControllers.DeleteDocenteControllers);
exports.default = router;
//# sourceMappingURL=DocenteRoute.js.map