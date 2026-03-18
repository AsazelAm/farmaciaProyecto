"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../Middleware/auth");
const CursoInscritosDocControllers_1 = require("../controllers/CursoInscritosDocControllers");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/DocenteCurs/:id', CursoInscritosDocControllers_1.CursoInscritosDocControllers.GetAllCursoDocControllers);
router.get('/AlumnAsis/:id_cal', CursoInscritosDocControllers_1.CursoInscritosDocControllers.GetAlumAsisControllers);
router.post('/AddAsisAlum', CursoInscritosDocControllers_1.CursoInscritosDocControllers.AddAsistenAlumControllers);
router.put('/UpdateAsisAlum/:id', CursoInscritosDocControllers_1.CursoInscritosDocControllers.UpdateAsisControllers);
router.put('/UpdateFecha', CursoInscritosDocControllers_1.CursoInscritosDocControllers.UpdateFechaControllers);
router.get('/GetNotas/:id_user/:id_calendario', CursoInscritosDocControllers_1.CursoInscritosDocControllers.GetNotaAluController);
router.post('/AddNotas', CursoInscritosDocControllers_1.CursoInscritosDocControllers.AddNotaAluController);
router.put('/UpdateNota/:id_nota', CursoInscritosDocControllers_1.CursoInscritosDocControllers.UpdateNotaAluController);
exports.default = router;
//# sourceMappingURL=CursoInscritosRoutes.js.map