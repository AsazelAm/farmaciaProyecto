"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CursoControllers_1 = __importDefault(require("../controllers/CursoControllers"));
const auth_1 = require("../Middleware/auth");
const multer_1 = __importDefault(require("multer"));
const express_validator_1 = require("express-validator");
const validation_1 = require("../Middleware/validation");
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// helper para envolver async handlers
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
// si mandas JSON dentro de FormData, parsea:
function parseJsonFields(req, _res, next) {
    try {
        if (typeof req.body.base === "string")
            req.body.base = JSON.parse(req.body.base);
        if (typeof req.body.secciones === "string")
            req.body.secciones = JSON.parse(req.body.secciones);
        if (typeof req.body.areas === "string")
            req.body.areas = JSON.parse(req.body.areas);
        if (typeof req.body.propuestas === "string")
            req.body.propuestas = JSON.parse(req.body.propuestas);
    }
    catch {
        /* deja que el controller valide */
    }
    next();
}
//rutas para calendario NO Baja, colocar todas las rutas que no activen el handler primero
router.get("/GetCalendarios", ah(CursoControllers_1.default.GetCalendarioControllers));
router.get("/ModCalendario", ah(CursoControllers_1.default.ModalidadCalendario));
router.get("/City", ah(CursoControllers_1.default.CityModalidad));
router.post("/addCalendario", (0, express_validator_1.body)("id_curso")
    .notEmpty()
    .withMessage("El curso es obligatorio")
    .custom((value) => {
    if (value === 0 || value === "0") {
        throw new Error("El curso no puede ser 0");
    }
    return true;
}), (0, express_validator_1.body)("id_mod")
    .notEmpty()
    .withMessage("El curso es obligatorio")
    .custom((value) => {
    if (value === 0 || value === "0") {
        throw new Error("El curso no puede ser 0");
    }
    return true;
}), validation_1.handleInputErrors, ah(CursoControllers_1.default.CreateCalendarioControllers));
router.get("/GetCursoCalendario", ah(CursoControllers_1.default.GetCursoForCalendar));
router.delete("/DeleteCalendario/:id", ah(CursoControllers_1.default.DeleteCalendarioControllers));
/* ========= REST estándar ========= */
router.get("/", ah(CursoControllers_1.default.list));
router.get("/:id", ah(CursoControllers_1.default.detail));
router.post("/", upload.single("img"), parseJsonFields, ah(CursoControllers_1.default.create));
router.put("/:id", upload.single("img"), parseJsonFields, ah(CursoControllers_1.default.update));
router.delete("/:id", ah(CursoControllers_1.default.remove));
// ====== RUTAS DE CONTENIDO DEL CURSO (curso_contenido) ======
router.get("/:id/contenido", ah(CursoControllers_1.default.listContenido));
router.get("/:id/contenido/:contenidoId", ah(CursoControllers_1.default.getContenido));
router.post("/:id/contenido", ah(CursoControllers_1.default.createContenido));
router.put("/:id/contenido/:contenidoId", ah(CursoControllers_1.default.updateContenido));
router.delete("/:id/contenido/:contenidoId", ah(CursoControllers_1.default.deleteContenido));
router.delete("/:id/contenido", ah(CursoControllers_1.default.deleteAllContenido));
exports.default = router;
//# sourceMappingURL=CursoRoute.js.map