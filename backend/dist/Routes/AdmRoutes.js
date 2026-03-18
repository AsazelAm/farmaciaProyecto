"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdmControllers_1 = require("../controllers/AdmControllers");
const express_validator_1 = require("express-validator");
const auth_1 = require("../Middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/Modalidad', AdmControllers_1.ADMControllers.GetModalidades);
router.post('/AddMod', (0, express_validator_1.body)('modalidad').isEmpty().withMessage('La modalidad es obligatoria'), AdmControllers_1.ADMControllers.AddModalidad);
router.delete('/DeleteMod/:id', AdmControllers_1.ADMControllers.DeleteModalidad);
router.put('/UpdateMod/:id', AdmControllers_1.ADMControllers.UpdateModControllers);
// administracion
router.get('/GetAreas', AdmControllers_1.ADMControllers.GetAreasControllers);
router.delete('/DeleteAreas/:id', AdmControllers_1.ADMControllers.DeleteAreasControllers);
router.post('/addAreas', AdmControllers_1.ADMControllers.addAreaControllers);
router.post('/addAreas', AdmControllers_1.ADMControllers.addAreaControllers);
router.put('/UpdateAreas/:id', AdmControllers_1.ADMControllers.UpdateAreasControllers);
//modalidad Calenadrio 
router.get('/Modalidad/Calendario', AdmControllers_1.ADMControllers.GetModalidadCalendario);
//empresa
router.get('/Empresa', AdmControllers_1.ADMControllers.GetEmpresaControllers);
router.get('/Country', AdmControllers_1.ADMControllers.GetCountryControllers);
exports.default = router;
//# sourceMappingURL=AdmRoutes.js.map