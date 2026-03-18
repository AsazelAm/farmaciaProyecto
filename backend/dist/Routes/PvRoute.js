"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PvControllers_1 = require("../controllers/PvControllers");
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
const router = (0, express_1.Router)();
router.get('/Getall', PvControllers_1.PvControllers.GetAllPvControllers);
router.post('/AddPv', upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
    { name: 'cuadro', maxCount: 1 },
    { name: 'modal', maxCount: 1 },
]), PvControllers_1.PvControllers.AddPv);
router.delete('/DeletePv/:id', PvControllers_1.PvControllers.deletePv);
router.get('/PvCalendario', PvControllers_1.PvControllers.GetPvCalendario);
router.put('/UpdatePv/:id', upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
    { name: 'cuadro', maxCount: 1 },
    { name: 'modal', maxCount: 1 },
]), PvControllers_1.PvControllers.UpdatePvControllers);
router.put('/UpdateStatus/:id', PvControllers_1.PvControllers.UpdatePvEstaController);
exports.default = router;
//# sourceMappingURL=PvRoute.js.map