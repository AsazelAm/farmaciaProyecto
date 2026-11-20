import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../Middleware/auth';
import { requireRoles } from '../Middleware/roles';
import { handleInputErrors } from '../Middleware/validation';
import { BajaLoteVencidoControllers } from '../controllers/BajaLoteVencidoControllers';
import { ACCIONES_BAJA, DIAS_DETECCION_PERMITIDOS, ESTADOS_BAJA } from '../Models/BajaLoteVencidoModels';

const router = Router();

router.use(authenticate);

const idParam = (nombre: string) =>
    param(nombre).isInt({ min: 1 }).withMessage(`${nombre} debe ser un entero positivo.`).toInt();

const idOpcional = (nombre: string) =>
    query(nombre).optional().isInt({ min: 1 }).withMessage(`${nombre} debe ser un entero positivo.`).toInt();

const fechaOpcional = (nombre: string) =>
    query(nombre).optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage(`${nombre} debe tener formato YYYY-MM-DD.`);

// ── Detección ──────────────────────────────────────────────────────────────
// Rutas fijas ANTES que '/GetBaja/:idBaja' para evitar colisiones de Express.
router.get('/GetLotesVencidos',
    [idOpcional('idProducto'), idOpcional('idProveedor'), idOpcional('idLaboratorio'), idOpcional('idSucursal'), idOpcional('limite')],
    handleInputErrors,
    BajaLoteVencidoControllers.GetLotesVencidosC,
);

router.get('/GetProximosAVencer',
    [
        query('dias').optional().isIn(DIAS_DETECCION_PERMITIDOS).withMessage('dias debe ser 30, 60 o 90.').toInt(),
        idOpcional('idProducto'), idOpcional('idProveedor'), idOpcional('idLaboratorio'), idOpcional('limite'),
    ],
    handleInputErrors,
    BajaLoteVencidoControllers.GetProximosAVencerC,
);

// ── Consultas de bajas y reporte ──────────────────────────────────────────
router.get('/GetBajas',
    [
        query('estado').optional().isIn(ESTADOS_BAJA).withMessage('Estado de baja no válido.'),
        query('accionTomada').optional().isIn(ACCIONES_BAJA).withMessage('Acción de baja no válida.'),
        idOpcional('idSucursal'), idOpcional('idProducto'), idOpcional('pagina'), idOpcional('porPagina'),
        fechaOpcional('fechaDesde'), fechaOpcional('fechaHasta'),
    ],
    handleInputErrors,
    BajaLoteVencidoControllers.GetBajasC,
);

router.get('/ReportePerdidas',
    [
        fechaOpcional('fechaDesde'), fechaOpcional('fechaHasta'),
        idOpcional('idSucursal'), idOpcional('idProducto'),
        query('accionTomada').optional().isIn(ACCIONES_BAJA).withMessage('Acción de baja no válida.'),
    ],
    handleInputErrors,
    BajaLoteVencidoControllers.GetReportePerdidasC,
);

router.get('/GetBaja/:idBaja',
    [idParam('idBaja')],
    handleInputErrors,
    BajaLoteVencidoControllers.GetBajaByIdC,
);

// ── Escritura: requiere rol de gestión ────────────────────────────────────
router.post('/AddBaja',
    requireRoles('Admin', 'EncargadoInventario'),
    [
        body('idLote').isInt({ min: 1 }).withMessage('idLote debe ser un entero positivo.').toInt(),
        body('cantidadAfectada').isInt({ min: 1 }).withMessage('cantidadAfectada debe ser mayor a 0.').toInt(),
        body('accionTomada').isIn(ACCIONES_BAJA).withMessage('accionTomada no válida.'),
        body('idSucursal').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
        body('idDevolucionProveedor').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
        body('fechaDeteccion').optional({ nullable: true }).isISO8601().withMessage('fechaDeteccion no válida.'),
        body('motivoDetalle').optional({ nullable: true }).isString().isLength({ max: 2000 }),
    ],
    handleInputErrors,
    BajaLoteVencidoControllers.AddBajaC,
);

router.patch('/AprobarBaja/:idBaja',
    requireRoles('Admin', 'EncargadoInventario'),
    [idParam('idBaja'), body('idUsuarioAutoriza').isInt({ min: 1 }).withMessage('idUsuarioAutoriza es obligatorio.').toInt()],
    handleInputErrors,
    BajaLoteVencidoControllers.AprobarBajaC,
);

router.patch('/EjecutarBaja/:idBaja',
    requireRoles('Admin', 'EncargadoInventario'),
    [idParam('idBaja'), body('idUsuarioAutoriza').isInt({ min: 1 }).withMessage('idUsuarioAutoriza es obligatorio.').toInt()],
    handleInputErrors,
    BajaLoteVencidoControllers.EjecutarBajaC,
);

router.patch('/AnularBaja/:idBaja',
    requireRoles('Admin', 'EncargadoInventario'),
    [idParam('idBaja'), body('motivo').optional().isString().isLength({ max: 500 })],
    handleInputErrors,
    BajaLoteVencidoControllers.AnularBajaC,
);

router.patch('/AjustarPerdida/:idBaja',
    requireRoles('Admin'),
    [idParam('idBaja')],
    handleInputErrors,
    BajaLoteVencidoControllers.AjustarPerdidaC,
);

export default router;
