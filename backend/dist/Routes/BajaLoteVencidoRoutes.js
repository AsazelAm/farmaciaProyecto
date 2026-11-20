"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../Middleware/auth");
const roles_1 = require("../Middleware/roles");
const validation_1 = require("../Middleware/validation");
const BajaLoteVencidoControllers_1 = require("../controllers/BajaLoteVencidoControllers");
const BajaLoteVencidoModels_1 = require("../Models/BajaLoteVencidoModels");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const idParam = (nombre) => (0, express_validator_1.param)(nombre).isInt({ min: 1 }).withMessage(`${nombre} debe ser un entero positivo.`).toInt();
const idOpcional = (nombre) => (0, express_validator_1.query)(nombre).optional().isInt({ min: 1 }).withMessage(`${nombre} debe ser un entero positivo.`).toInt();
const fechaOpcional = (nombre) => (0, express_validator_1.query)(nombre).optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage(`${nombre} debe tener formato YYYY-MM-DD.`);
// ── Detección ──────────────────────────────────────────────────────────────
// Rutas fijas ANTES que '/GetBaja/:idBaja' para evitar colisiones de Express.
router.get('/GetLotesVencidos', [idOpcional('idProducto'), idOpcional('idProveedor'), idOpcional('idLaboratorio'), idOpcional('idSucursal'), idOpcional('limite')], validation_1.handleInputErrors, BajaLoteVencidoControllers_1.BajaLoteVencidoControllers.GetLotesVencidosC);
router.get('/GetProximosAVencer', [
    (0, express_validator_1.query)('dias').optional().isIn(BajaLoteVencidoModels_1.DIAS_DETECCION_PERMITIDOS).withMessage('dias debe ser 30, 60 o 90.').toInt(),
    idOpcional('idProducto'), idOpcional('idProveedor'), idOpcional('idLaboratorio'), idOpcional('limite'),
], validation_1.handleInputErrors, BajaLoteVencidoControllers_1.BajaLoteVencidoControllers.GetProximosAVencerC);
// ── Consultas de bajas y reporte ──────────────────────────────────────────
router.get('/GetBajas', [
    (0, express_validator_1.query)('estado').optional().isIn(BajaLoteVencidoModels_1.ESTADOS_BAJA).withMessage('Estado de baja no válido.'),
    (0, express_validator_1.query)('accionTomada').optional().isIn(BajaLoteVencidoModels_1.ACCIONES_BAJA).withMessage('Acción de baja no válida.'),
    idOpcional('idSucursal'), idOpcional('idProducto'), idOpcional('pagina'), idOpcional('porPagina'),
    fechaOpcional('fechaDesde'), fechaOpcional('fechaHasta'),
], validation_1.handleInputErrors, BajaLoteVencidoControllers_1.BajaLoteVencidoControllers.GetBajasC);
router.get('/ReportePerdidas', [
    fechaOpcional('fechaDesde'), fechaOpcional('fechaHasta'),
    idOpcional('idSucursal'), idOpcional('idProducto'),
    (0, express_validator_1.query)('accionTomada').optional().isIn(BajaLoteVencidoModels_1.ACCIONES_BAJA).withMessage('Acción de baja no válida.'),
], validation_1.handleInputErrors, BajaLoteVencidoControllers_1.BajaLoteVencidoControllers.GetReportePerdidasC);
router.get('/GetBaja/:idBaja', [idParam('idBaja')], validation_1.handleInputErrors, BajaLoteVencidoControllers_1.BajaLoteVencidoControllers.GetBajaByIdC);
// ── Escritura: requiere rol de gestión ────────────────────────────────────
router.post('/AddBaja', (0, roles_1.requireRoles)('Admin', 'EncargadoInventario'), [
    (0, express_validator_1.body)('idLote').isInt({ min: 1 }).withMessage('idLote debe ser un entero positivo.').toInt(),
    (0, express_validator_1.body)('cantidadAfectada').isInt({ min: 1 }).withMessage('cantidadAfectada debe ser mayor a 0.').toInt(),
    (0, express_validator_1.body)('accionTomada').isIn(BajaLoteVencidoModels_1.ACCIONES_BAJA).withMessage('accionTomada no válida.'),
    (0, express_validator_1.body)('idSucursal').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
    (0, express_validator_1.body)('idDevolucionProveedor').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
    (0, express_validator_1.body)('fechaDeteccion').optional({ nullable: true }).isISO8601().withMessage('fechaDeteccion no válida.'),
    (0, express_validator_1.body)('motivoDetalle').optional({ nullable: true }).isString().isLength({ max: 2000 }),
], validation_1.handleInputErrors, BajaLoteVencidoControllers_1.BajaLoteVencidoControllers.AddBajaC);
router.patch('/AprobarBaja/:idBaja', (0, roles_1.requireRoles)('Admin', 'EncargadoInventario'), [idParam('idBaja'), (0, express_validator_1.body)('idUsuarioAutoriza').isInt({ min: 1 }).withMessage('idUsuarioAutoriza es obligatorio.').toInt()], validation_1.handleInputErrors, BajaLoteVencidoControllers_1.BajaLoteVencidoControllers.AprobarBajaC);
router.patch('/EjecutarBaja/:idBaja', (0, roles_1.requireRoles)('Admin', 'EncargadoInventario'), [idParam('idBaja'), (0, express_validator_1.body)('idUsuarioAutoriza').isInt({ min: 1 }).withMessage('idUsuarioAutoriza es obligatorio.').toInt()], validation_1.handleInputErrors, BajaLoteVencidoControllers_1.BajaLoteVencidoControllers.EjecutarBajaC);
router.patch('/AnularBaja/:idBaja', (0, roles_1.requireRoles)('Admin', 'EncargadoInventario'), [idParam('idBaja'), (0, express_validator_1.body)('motivo').optional().isString().isLength({ max: 500 })], validation_1.handleInputErrors, BajaLoteVencidoControllers_1.BajaLoteVencidoControllers.AnularBajaC);
router.patch('/AjustarPerdida/:idBaja', (0, roles_1.requireRoles)('Admin'), [idParam('idBaja')], validation_1.handleInputErrors, BajaLoteVencidoControllers_1.BajaLoteVencidoControllers.AjustarPerdidaC);
exports.default = router;
//# sourceMappingURL=BajaLoteVencidoRoutes.js.map