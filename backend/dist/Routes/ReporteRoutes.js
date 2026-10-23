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
//  GET: parámetros de los filtros del reporte de vencimientos
//      (laboratorios, tipos de producto, proveedores y umbrales del semáforo)
router.get('/GetParametrosVencimientos', ReporteControllers_1.ReporteControllers.GetParametrosVencimientosC);
//  GET: datos del reporte de control de vencimientos y alerta FEFO (JSON)
//      ?diasMin=&diasMax=&idLaboratorio=&idTipoProducto=&idProveedor=
//      &estados=activo,cuarentena&busqueda=&soloConStock=true
router.get('/GetDatosVencimientos', ReporteControllers_1.ReporteControllers.GetDatosVencimientosC);
//  GET: descargar reporte de control de vencimientos en Excel (.xlsx)
router.get('/DescargarExcelVencimientos', ReporteControllers_1.ReporteControllers.DescargarExcelVencimientosC);
//  GET: descargar reporte de control de vencimientos en PDF
router.get('/DescargarPdfVencimientos', ReporteControllers_1.ReporteControllers.DescargarPdfVencimientosC);
//  GET: parámetros del reporte de inventario actual y valorización
router.get('/GetParametrosInventario', ReporteControllers_1.ReporteControllers.GetParametrosInventarioC);
router.get('/GetDatosInventario', ReporteControllers_1.ReporteControllers.GetDatosInventarioC);
router.get('/DescargarExcelInventario', ReporteControllers_1.ReporteControllers.DescargarExcelInventarioC);
router.get('/DescargarPdfInventario', ReporteControllers_1.ReporteControllers.DescargarPdfInventarioC);
//  GET: parámetros del reporte de devoluciones de clientes
//      (motivos, destinos, estados, usuarios, clientes, laboratorios y tipos)
router.get('/GetParametrosDevoluciones', ReporteControllers_1.ReporteControllers.GetParametrosDevolucionesC);
//  GET: datos del reporte de devoluciones de clientes (JSON)
//      ?fechaInicio=&fechaFin=&motivo=&estado=&idUsuario=&idCliente=
//      &idLaboratorio=&idTipoProducto=&producto=&cliente=&busqueda=
router.get('/GetDatosDevoluciones', ReporteControllers_1.ReporteControllers.GetDatosDevolucionesC);
//  GET: descargar reporte de devoluciones en Excel (.xlsx)
router.get('/DescargarExcelDevoluciones', ReporteControllers_1.ReporteControllers.DescargarExcelDevolucionesC);
//  GET: descargar reporte de devoluciones en PDF
router.get('/DescargarPdfDevoluciones', ReporteControllers_1.ReporteControllers.DescargarPdfDevolucionesC);
//  GET: parámetros del reporte de devoluciones a proveedores y notas de crédito
router.get('/GetParametrosDevolucionesProveedor', ReporteControllers_1.ReporteControllers.GetParametrosDevolucionesProveedorC);
//  GET: datos del reporte de devoluciones a proveedores (JSON)
//      ?fechaInicio=&fechaFin=&idProveedor=&idLaboratorio=&motivo=
//      &estadoNotaCredito=&idUsuario=&producto=&busqueda=
router.get('/GetDatosDevolucionesProveedor', ReporteControllers_1.ReporteControllers.GetDatosDevolucionesProveedorC);
//  GET: descargar reporte de devoluciones a proveedores en Excel (.xlsx)
router.get('/DescargarExcelDevolucionesProveedor', ReporteControllers_1.ReporteControllers.DescargarExcelDevolucionesProveedorC);
//  GET: descargar reporte de devoluciones a proveedores en PDF
router.get('/DescargarPdfDevolucionesProveedor', ReporteControllers_1.ReporteControllers.DescargarPdfDevolucionesProveedorC);
//  GET: parámetros del reporte de rotación y clasificación ABC de productos
router.get('/GetParametrosRotacionProductos', ReporteControllers_1.ReporteControllers.GetParametrosRotacionProductosC);
//  GET: datos del reporte de rotación y clasificación ABC de productos (JSON)
router.get('/GetDatosRotacionProductos', ReporteControllers_1.ReporteControllers.GetDatosRotacionProductosC);
//  GET: descargar reporte de rotación en Excel
router.get('/DescargarExcelRotacionProductos', ReporteControllers_1.ReporteControllers.DescargarExcelRotacionProductosC);
//  GET: descargar reporte de rotación en PDF
router.get('/DescargarPdfRotacionProductos', ReporteControllers_1.ReporteControllers.DescargarPdfRotacionProductosC);
//  GET: parámetros del reporte de facturación
router.get('/GetParametrosFacturacion', ReporteControllers_1.ReporteControllers.GetParametrosFacturacionC);
//  GET: datos del reporte de facturación
router.get('/GetDatosFacturacion', ReporteControllers_1.ReporteControllers.GetDatosFacturacionC);
//  GET: descargar reporte de facturación en Excel
router.get('/DescargarExcelFacturacion', ReporteControllers_1.ReporteControllers.DescargarExcelFacturacionC);
//  GET: descargar reporte de facturación en PDF
router.get('/DescargarPdfFacturacion', ReporteControllers_1.ReporteControllers.DescargarPdfFacturacionC);
exports.default = router;
//# sourceMappingURL=ReporteRoutes.js.map