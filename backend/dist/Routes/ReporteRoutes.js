"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../Middleware/auth");
const ReporteControllers_1 = require("../controllers/ReporteControllers");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
//  GET: datos del reporte de ventas (JSON) para previsualización
//      ?frecuencia=diario|semanal|mensual&fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD
router.get('/GetDatos', ReporteControllers_1.ReporteControllers.GetDatosReporteC);
//  GET: descargar reporte en Excel (.xlsx)
router.get('/DescargarExcel', ReporteControllers_1.ReporteControllers.DescargarExcelC);
//  GET: descargar reporte en PDF
router.get('/DescargarPdf', ReporteControllers_1.ReporteControllers.DescargarPdfC);
exports.default = router;
//# sourceMappingURL=ReporteRoutes.js.map