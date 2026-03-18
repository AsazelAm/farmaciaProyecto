"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CertificacionControllers_1 = require("../controllers/CertificacionControllers");
const router = (0, express_1.Router)();
router.get('/Get', CertificacionControllers_1.CertificacionControllers.GetCertificacionall);
router.post('/AddCert', CertificacionControllers_1.CertificacionControllers.addCertificacion);
router.delete('/DeleteCert/:id', CertificacionControllers_1.CertificacionControllers.DeleteCertControllers);
router.put('/UpdateCerti/:id', CertificacionControllers_1.CertificacionControllers.UpdateCertiControllers);
exports.default = router;
//# sourceMappingURL=CertificacionRoute.js.map