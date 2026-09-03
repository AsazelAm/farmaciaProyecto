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
//  GET: descargar reporte de ventas en Excel (.xlsx)
router.get('/DescargarExcel', ReporteControllers_1.ReporteControllers.DescargarExcelC);
//  GET: descargar reporte de ventas en PDF
router.get('/DescargarPdf', ReporteControllers_1.ReporteControllers.DescargarPdfC);
//  GET: datos del reporte de compras (JSON) para previsualización
router.get('/GetDatosCompra', ReporteControllers_1.ReporteControllers.GetDatosCompraC);
//  GET: descargar reporte de compras en Excel (.xlsx)
router.get('/DescargarExcelCompra', ReporteControllers_1.ReporteControllers.DescargarExcelCompraC);
//  GET: descargar reporte de compras en PDF
router.get('/DescargarPdfCompra', ReporteControllers_1.ReporteControllers.DescargarPdfCompraC);
exports.default = router;
//# sourceMappingURL=ReporteRoutes.js.map