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

//  GET: parámetros del reporte de inventario actual y valorización
router.get('/GetParametrosInventario',
    ReporteControllers.GetParametrosInventarioC
);

router.get('/GetDatosInventario',
    ReporteControllers.GetDatosInventarioC
);

router.get('/DescargarExcelInventario',
    ReporteControllers.DescargarExcelInventarioC
);

router.get('/DescargarPdfInventario',
    ReporteControllers.DescargarPdfInventarioC
);

//  GET: parámetros del reporte de devoluciones de clientes
//      (motivos, destinos, estados, usuarios, clientes, laboratorios y tipos)
router.get('/GetParametrosDevoluciones',
    ReporteControllers.GetParametrosDevolucionesC
);

//  GET: datos del reporte de devoluciones de clientes (JSON)
//      ?fechaInicio=&fechaFin=&motivo=&estado=&idUsuario=&idCliente=
//      &idLaboratorio=&idTipoProducto=&producto=&cliente=&busqueda=
router.get('/GetDatosDevoluciones',
    ReporteControllers.GetDatosDevolucionesC
);

//  GET: descargar reporte de devoluciones en Excel (.xlsx)
router.get('/DescargarExcelDevoluciones',
    ReporteControllers.DescargarExcelDevolucionesC
);

//  GET: descargar reporte de devoluciones en PDF
router.get('/DescargarPdfDevoluciones',
    ReporteControllers.DescargarPdfDevolucionesC
);

//  GET: parámetros del reporte de devoluciones a proveedores y notas de crédito
router.get('/GetParametrosDevolucionesProveedor',
    ReporteControllers.GetParametrosDevolucionesProveedorC
);

//  GET: datos del reporte de devoluciones a proveedores (JSON)
//      ?fechaInicio=&fechaFin=&idProveedor=&idLaboratorio=&motivo=
//      &estadoNotaCredito=&idUsuario=&producto=&busqueda=
router.get('/GetDatosDevolucionesProveedor',
    ReporteControllers.GetDatosDevolucionesProveedorC
);

//  GET: descargar reporte de devoluciones a proveedores en Excel (.xlsx)
router.get('/DescargarExcelDevolucionesProveedor',
    ReporteControllers.DescargarExcelDevolucionesProveedorC
);

//  GET: descargar reporte de devoluciones a proveedores en PDF
router.get('/DescargarPdfDevolucionesProveedor',
    ReporteControllers.DescargarPdfDevolucionesProveedorC
);

//  GET: parámetros del reporte de rotación y clasificación ABC de productos
router.get('/GetParametrosRotacionProductos',
    ReporteControllers.GetParametrosRotacionProductosC
);

//  GET: datos del reporte de rotación y clasificación ABC de productos (JSON)
router.get('/GetDatosRotacionProductos',
    ReporteControllers.GetDatosRotacionProductosC
);

//  GET: descargar reporte de rotación en Excel
router.get('/DescargarExcelRotacionProductos',
    ReporteControllers.DescargarExcelRotacionProductosC
);

//  GET: descargar reporte de rotación en PDF
router.get('/DescargarPdfRotacionProductos',
    ReporteControllers.DescargarPdfRotacionProductosC
);

//  GET: parámetros del reporte de facturación
router.get('/GetParametrosFacturacion',
    ReporteControllers.GetParametrosFacturacionC
);

//  GET: datos del reporte de facturación
router.get('/GetDatosFacturacion',
    ReporteControllers.GetDatosFacturacionC
);

//  GET: descargar reporte de facturación en Excel
router.get('/DescargarExcelFacturacion',
    ReporteControllers.DescargarExcelFacturacionC
);

//  GET: descargar reporte de facturación en PDF
router.get('/DescargarPdfFacturacion',
    ReporteControllers.DescargarPdfFacturacionC
);

export default router;