"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BajaLoteVencidoControllers = void 0;
const BajaLoteVencidoService_1 = __importStar(require("../Services/BajaLoteVencidoService"));
function idQuery(valor) {
    if (valor === undefined || valor === null || valor === '')
        return undefined;
    const n = Number(valor);
    return Number.isInteger(n) && n > 0 ? n : undefined;
}
function fechaHoy() {
    return new Date().toISOString().slice(0, 10);
}
function fechaHaceDias(dias) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - dias);
    return fecha.toISOString().slice(0, 10);
}
/** Los vendedores solo ven los datos de su sucursal. */
function sucursalDelRequest(req) {
    if (req.user?.nameRol === 'VendedorFarmaceutico')
        return req.user.idSucursal;
    return idQuery(req.query.idSucursal);
}
class BajaLoteVencidoControllers {
    // ── GET: lotes vencidos pendientes de gestionar ─────────────────────────
    static GetLotesVencidosC = async (req, res) => {
        try {
            const filtros = {
                idProducto: idQuery(req.query.idProducto),
                idProveedor: idQuery(req.query.idProveedor),
                idLaboratorio: idQuery(req.query.idLaboratorio),
                idSucursal: sucursalDelRequest(req),
                busqueda: typeof req.query.busqueda === 'string' ? req.query.busqueda : undefined,
                limite: idQuery(req.query.limite),
            };
            return res.status(200).json(await BajaLoteVencidoService_1.default.listarVencidos(filtros));
        }
        catch (error) {
            return (0, BajaLoteVencidoService_1.responderErrorBaja)(res, error);
        }
    };
    // ── GET: lotes próximos a vencer (días = 30 | 60 | 90) ──────────────────
    static GetProximosAVencerC = async (req, res) => {
        try {
            const filtros = {
                dias: idQuery(req.query.dias) ?? 30,
                idProducto: idQuery(req.query.idProducto),
                idProveedor: idQuery(req.query.idProveedor),
                idLaboratorio: idQuery(req.query.idLaboratorio),
                busqueda: typeof req.query.busqueda === 'string' ? req.query.busqueda : undefined,
                limite: idQuery(req.query.limite),
            };
            return res.status(200).json(await BajaLoteVencidoService_1.default.listarProximosAVencer(filtros));
        }
        catch (error) {
            return (0, BajaLoteVencidoService_1.responderErrorBaja)(res, error);
        }
    };
    // ── GET: listado de bajas ────────────────────────────────────────────────
    static GetBajasC = async (req, res) => {
        try {
            const filtros = {
                estado: req.query.estado,
                accionTomada: req.query.accionTomada,
                idSucursal: sucursalDelRequest(req),
                idProducto: idQuery(req.query.idProducto),
                fechaDesde: typeof req.query.fechaDesde === 'string' ? req.query.fechaDesde : undefined,
                fechaHasta: typeof req.query.fechaHasta === 'string' ? req.query.fechaHasta : undefined,
                pagina: idQuery(req.query.pagina),
                porPagina: idQuery(req.query.porPagina),
            };
            return res.status(200).json(await BajaLoteVencidoService_1.default.listar(filtros));
        }
        catch (error) {
            return (0, BajaLoteVencidoService_1.responderErrorBaja)(res, error);
        }
    };
    // ── GET: detalle de una baja ─────────────────────────────────────────────
    static GetBajaByIdC = async (req, res) => {
        try {
            const baja = await BajaLoteVencidoService_1.default.obtenerPorId(Number(req.params.idBaja));
            return res.status(200).json(baja);
        }
        catch (error) {
            return (0, BajaLoteVencidoService_1.responderErrorBaja)(res, error);
        }
    };
    // ── POST: registrar baja (queda en 'pendiente') ──────────────────────────
    static AddBajaC = async (req, res) => {
        try {
            const datos = {
                idLote: Number(req.body.idLote),
                idSucursal: req.body.idSucursal ? Number(req.body.idSucursal) : null,
                idDevolucionProveedor: req.body.idDevolucionProveedor
                    ? Number(req.body.idDevolucionProveedor)
                    : null,
                cantidadAfectada: Number(req.body.cantidadAfectada),
                accionTomada: req.body.accionTomada,
                fechaDeteccion: req.body.fechaDeteccion ?? null,
                motivoDetalle: req.body.motivoDetalle ?? null,
            };
            const baja = await BajaLoteVencidoService_1.default.registrar(datos, req.user.idUsuario);
            return res.status(201).json(baja);
        }
        catch (error) {
            return (0, BajaLoteVencidoService_1.responderErrorBaja)(res, error);
        }
    };
    // ── PATCH: aprobar ───────────────────────────────────────────────────────
    static AprobarBajaC = async (req, res) => {
        try {
            const baja = await BajaLoteVencidoService_1.default.aprobar(Number(req.params.idBaja), Number(req.body.idUsuarioAutoriza));
            return res.status(200).json(baja);
        }
        catch (error) {
            return (0, BajaLoteVencidoService_1.responderErrorBaja)(res, error);
        }
    };
    // ── PATCH: ejecutar (descuenta stock de forma segura) ────────────────────
    static EjecutarBajaC = async (req, res) => {
        try {
            const baja = await BajaLoteVencidoService_1.default.ejecutar(Number(req.params.idBaja), Number(req.body.idUsuarioAutoriza));
            return res.status(200).json(baja);
        }
        catch (error) {
            return (0, BajaLoteVencidoService_1.responderErrorBaja)(res, error);
        }
    };
    // ── PATCH: anular antes de la ejecución definitiva ───────────────────────
    static AnularBajaC = async (req, res) => {
        try {
            const baja = await BajaLoteVencidoService_1.default.anular(Number(req.params.idBaja), req.user.idUsuario, typeof req.body.motivo === 'string' ? req.body.motivo : undefined);
            return res.status(200).json(baja);
        }
        catch (error) {
            return (0, BajaLoteVencidoService_1.responderErrorBaja)(res, error);
        }
    };
    // ── PATCH: recalcular pérdida al recibir nota de crédito ─────────────────
    static AjustarPerdidaC = async (req, res) => {
        try {
            const baja = await BajaLoteVencidoService_1.default.ajustarPerdida(Number(req.params.idBaja), req.user?.nameRol);
            return res.status(200).json(baja);
        }
        catch (error) {
            return (0, BajaLoteVencidoService_1.responderErrorBaja)(res, error);
        }
    };
    // ── GET: reporte de mermas/pérdidas por fecha y sucursal ─────────────────
    static GetReportePerdidasC = async (req, res) => {
        try {
            const filtros = {
                fechaDesde: typeof req.query.fechaDesde === 'string' ? req.query.fechaDesde : fechaHaceDias(30),
                fechaHasta: typeof req.query.fechaHasta === 'string' ? req.query.fechaHasta : fechaHoy(),
                idSucursal: sucursalDelRequest(req),
                accionTomada: req.query.accionTomada,
                idProducto: idQuery(req.query.idProducto),
            };
            return res.status(200).json(await BajaLoteVencidoService_1.default.reportePerdidas(filtros));
        }
        catch (error) {
            return (0, BajaLoteVencidoService_1.responderErrorBaja)(res, error);
        }
    };
}
exports.BajaLoteVencidoControllers = BajaLoteVencidoControllers;
//# sourceMappingURL=BajaLoteVencidoControllers.js.map