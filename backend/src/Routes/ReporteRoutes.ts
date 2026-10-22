import { Router } from 'express';
import { authenticate } from '../Middleware/auth';
import { ReporteControllers } from '../controllers/ReporteControllers';

const router = Router();

router.use(authenticate);

//  GET: datos del reporte de ventas (JSON) para previsualización
//      ?frecuencia=diario|semanal|mensual&fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD
router.get('/GetDatos',
    ReporteControllers.GetDatosReporteC
);

//  GET: descargar reporte de ventas en Excel (.xlsx)
router.get('/DescargarExcel',
    ReporteControllers.DescargarExcelC
);

//  GET: descargar reporte de ventas en PDF
router.get('/DescargarPdf',
    ReporteControllers.DescargarPdfC
);

//  GET: datos del reporte de compras (JSON) para previsualización
router.get('/GetDatosCompra',
    ReporteControllers.GetDatosCompraC
);

//  GET: descargar reporte de compras en Excel (.xlsx)
router.get('/DescargarExcelCompra',
    ReporteControllers.DescargarExcelCompraC
);

//  GET: descargar reporte de compras en PDF
router.get('/DescargarPdfCompra',
    ReporteControllers.DescargarPdfCompraC
);

//  GET: parámetros de los filtros del reporte de vencimientos
//      (laboratorios, tipos de producto, proveedores y umbrales del semáforo)
router.get('/GetParametrosVencimientos',
    ReporteControllers.GetParametrosVencimientosC
);

//  GET: datos del reporte de control de vencimientos y alerta FEFO (JSON)
//      ?diasMin=&diasMax=&idLaboratorio=&idTipoProducto=&idProveedor=
//      &estados=activo,cuarentena&busqueda=&soloConStock=true
router.get('/GetDatosVencimientos',
    ReporteControllers.GetDatosVencimientosC
);

//  GET: descargar reporte de control de vencimientos en Excel (.xlsx)
router.get('/DescargarExcelVencimientos',
    ReporteControllers.DescargarExcelVencimientosC
);

//  GET: descargar reporte de control de vencimientos en PDF
router.get('/DescargarPdfVencimientos',
    ReporteControllers.DescargarPdfVencimientosC
);

export default router;