"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../Middleware/auth");
const multer_1 = __importDefault(require("multer"));
const LaboratorioControllers_1 = require("../controllers/LaboratorioControllers");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
router.get('/GetLab', LaboratorioControllers_1.LaboratorioControllers.GetLaboraC);
router.post('/AddLab', upload.single('img'), LaboratorioControllers_1.LaboratorioControllers.AddLaboraC);
router.delete('/DeleteLab/:idLaboratorio', LaboratorioControllers_1.LaboratorioControllers.DeleteLaboraC);
router.put('/UpdateLab/:idLaboratorio', upload.single('img'), LaboratorioControllers_1.LaboratorioControllers.UpdateLaboraC);
exports.default = router;
//# sourceMappingURL=LaboratorioRoutes.js.map