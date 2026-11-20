import { Request, Response } from 'express';
import BajaLoteVencidoService, { responderErrorBaja } from '../Services/BajaLoteVencidoService';
import {
    AccionBaja,
    EstadoBaja,
    IFiltrosBaja,
    IFiltrosDeteccion,
    IFiltrosReporte,
    IRegistrarBajaInput,
} from '../Models/BajaLoteVencidoModels';

function idQuery(valor: any): number | undefined {
    if (valor === undefined || valor === null || valor === '') return undefined;
    const n = Number(valor);
    return Number.isInteger(n) && n > 0 ? n : undefined;
}

function fechaHoy(): string {
    return new Date().toISOString().slice(0, 10);
}

function fechaHaceDias(dias: number): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - dias);
    return fecha.toISOString().slice(0, 10);
}

/** Los vendedores solo ven los datos de su sucursal. */
function sucursalDelRequest(req: Request): number | undefined {
    if (req.user?.nameRol === 'VendedorFarmaceutico') return req.user.idSucursal;
    return idQuery(req.query.idSucursal);
}

export class BajaLoteVencidoControllers {

    // ── GET: lotes vencidos pendientes de gestionar ─────────────────────────
    static readonly GetLotesVencidosC = async (req: Request, res: Response): Promise<any> => {
        try {
            const filtros: IFiltrosDeteccion = {
                idProducto: idQuery(req.query.idProducto),
                idProveedor: idQuery(req.query.idProveedor),
                idLaboratorio: idQuery(req.query.idLaboratorio),
                idSucursal: sucursalDelRequest(req),
                busqueda: typeof req.query.busqueda === 'string' ? req.query.busqueda : undefined,
                limite: idQuery(req.query.limite),
            };
            return res.status(200).json(await BajaLoteVencidoService.listarVencidos(filtros));
        } catch (error) {
            return responderErrorBaja(res, error);
        }
    };

    // ── GET: lotes próximos a vencer (días = 30 | 60 | 90) ──────────────────
    static readonly GetProximosAVencerC = async (req: Request, res: Response): Promise<any> => {
        try {
            const filtros: IFiltrosDeteccion = {
                dias: idQuery(req.query.dias) ?? 30,
                idProducto: idQuery(req.query.idProducto),
                idProveedor: idQuery(req.query.idProveedor),
                idLaboratorio: idQuery(req.query.idLaboratorio),
                busqueda: typeof req.query.busqueda === 'string' ? req.query.busqueda : undefined,
                limite: idQuery(req.query.limite),
            };
            return res.status(200).json(await BajaLoteVencidoService.listarProximosAVencer(filtros));
        } catch (error) {
            return responderErrorBaja(res, error);
        }
    };

    // ── GET: listado de bajas ────────────────────────────────────────────────
    static readonly GetBajasC = async (req: Request, res: Response): Promise<any> => {
        try {
            const filtros: IFiltrosBaja = {
                estado: req.query.estado as EstadoBaja | undefined,
                accionTomada: req.query.accionTomada as AccionBaja | undefined,
                idSucursal: sucursalDelRequest(req),
                idProducto: idQuery(req.query.idProducto),
                fechaDesde: typeof req.query.fechaDesde === 'string' ? req.query.fechaDesde : undefined,
                fechaHasta: typeof req.query.fechaHasta === 'string' ? req.query.fechaHasta : undefined,
                pagina: idQuery(req.query.pagina),
                porPagina: idQuery(req.query.porPagina),
            };
            return res.status(200).json(await BajaLoteVencidoService.listar(filtros));
        } catch (error) {
            return responderErrorBaja(res, error);
        }
    };

    // ── GET: detalle de una baja ─────────────────────────────────────────────
    static readonly GetBajaByIdC = async (req: Request, res: Response): Promise<any> => {
        try {
            const baja = await BajaLoteVencidoService.obtenerPorId(Number(req.params.idBaja));
            return res.status(200).json(baja);
        } catch (error) {
            return responderErrorBaja(res, error);
        }
    };

    // ── POST: registrar baja (queda en 'pendiente') ──────────────────────────
    static readonly AddBajaC = async (req: Request, res: Response): Promise<any> => {
        try {
            const datos: IRegistrarBajaInput = {
                idLote: Number(req.body.idLote),
                idSucursal: req.body.idSucursal ? Number(req.body.idSucursal) : null,
                idDevolucionProveedor: req.body.idDevolucionProveedor
                    ? Number(req.body.idDevolucionProveedor)
                    : null,
                cantidadAfectada: Number(req.body.cantidadAfectada),
                accionTomada: req.body.accionTomada as AccionBaja,
                fechaDeteccion: req.body.fechaDeteccion ?? null,
                motivoDetalle: req.body.motivoDetalle ?? null,
            };
            const baja = await BajaLoteVencidoService.registrar(datos, req.user!.idUsuario);
            return res.status(201).json(baja);
        } catch (error) {
            return responderErrorBaja(res, error);
        }
    };

    // ── PATCH: aprobar ───────────────────────────────────────────────────────
    static readonly AprobarBajaC = async (req: Request, res: Response): Promise<any> => {
        try {
            const baja = await BajaLoteVencidoService.aprobar(
                Number(req.params.idBaja),
                Number(req.body.idUsuarioAutoriza),
            );
            return res.status(200).json(baja);
        } catch (error) {
            return responderErrorBaja(res, error);
        }
    };

    // ── PATCH: ejecutar (descuenta stock de forma segura) ────────────────────
    static readonly EjecutarBajaC = async (req: Request, res: Response): Promise<any> => {
        try {
            const baja = await BajaLoteVencidoService.ejecutar(
                Number(req.params.idBaja),
                Number(req.body.idUsuarioAutoriza),
            );
            return res.status(200).json(baja);
        } catch (error) {
            return responderErrorBaja(res, error);
        }
    };

    // ── PATCH: anular antes de la ejecución definitiva ───────────────────────
    static readonly AnularBajaC = async (req: Request, res: Response): Promise<any> => {
        try {
            const baja = await BajaLoteVencidoService.anular(
                Number(req.params.idBaja),
                req.user!.idUsuario,
                typeof req.body.motivo === 'string' ? req.body.motivo : undefined,
            );
            return res.status(200).json(baja);
        } catch (error) {
            return responderErrorBaja(res, error);
        }
    };

    // ── PATCH: recalcular pérdida al recibir nota de crédito ─────────────────
    static readonly AjustarPerdidaC = async (req: Request, res: Response): Promise<any> => {
        try {
            const baja = await BajaLoteVencidoService.ajustarPerdida(
                Number(req.params.idBaja),
                req.user?.nameRol,
            );
            return res.status(200).json(baja);
        } catch (error) {
            return responderErrorBaja(res, error);
        }
    };

    // ── GET: reporte de mermas/pérdidas por fecha y sucursal ─────────────────
    static readonly GetReportePerdidasC = async (req: Request, res: Response): Promise<any> => {
        try {
            const filtros: IFiltrosReporte = {
                fechaDesde: typeof req.query.fechaDesde === 'string' ? req.query.fechaDesde : fechaHaceDias(30),
                fechaHasta: typeof req.query.fechaHasta === 'string' ? req.query.fechaHasta : fechaHoy(),
                idSucursal: sucursalDelRequest(req),
                accionTomada: req.query.accionTomada as AccionBaja | undefined,
                idProducto: idQuery(req.query.idProducto),
            };
            return res.status(200).json(await BajaLoteVencidoService.reportePerdidas(filtros));
        } catch (error) {
            return responderErrorBaja(res, error);
        }
    };
}
