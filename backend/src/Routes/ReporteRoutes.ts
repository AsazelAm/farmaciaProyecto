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

//  GET: descargar reporte en Excel (.xlsx)
router.get('/DescargarExcel',
    ReporteControllers.DescargarExcelC
);

//  GET: descargar reporte en PDF
router.get('/DescargarPdf',
    ReporteControllers.DescargarPdfC
);

export default router;