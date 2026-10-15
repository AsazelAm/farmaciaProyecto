import { Request, Response } from 'express';
import DataDevolucion, {
    IDevolucionVentaInput,
    IDevolucionProveedorInput,
    IResolucionVentaInput,
    IResolucionProveedorInput,
} from '../Models/DevolucionModels';

export class DevolucionControllers {

    // ═════════════ DEVOLUCIONES DE VENTA ═════════════

    // ── GET: Listar devoluciones de venta ─────────────────────────────────────
    static readonly GetDevolucionesVentaC = async (req: Request, res: Response): Promise<any> => {
        try {
            const filtros = {
                estado: req.query.estado as any,
                idVenta: req.query.idVenta ? Number(req.query.idVenta) : undefined,
                fechaDesde: req.query.fechaDesde as string | undefined,
                fechaHasta: req.query.fechaHasta as string | undefined,
                pagina: req.query.pagina ? Number(req.query.pagina) : 1,
                porPagina: req.query.porPagina ? Number(req.query.porPagina) : 10,
            };

            const data = await DataDevolucion.listarVentas(filtros);
            res.status(200).json(data);
        } catch (error) {
            console.error('Error al obtener devoluciones de venta:', error);
            res.status(500).json({ error: 'Error al obtener la lista de devoluciones de venta' });
        }
    };

    // ── GET: Detalle de una devolución de venta ───────────────────────────────
    static readonly GetDevolucionVentaByIdC = async (req: Request, res: Response): Promise<any> => {
        try {
            const id = Number(req.params.idDevolucionVenta);
            const data = await DataDevolucion.obtenerVentaPorId(id);

            if (!data) {
                return res.status(404).json({ error: 'Devolución no encontrada' });
            }

            res.status(200).json(data);
        } catch (error) {
            console.error('Error al obtener devolución de venta:', error);
            res.status(500).json({ error: 'Error al obtener el detalle de la devolución' });
        }
    };

    // ── POST: Registrar una devolución de venta ───────────────────────────────
    static readonly AddDevolucionVentaC = async (req: Request, res: Response): Promise<any> => {
        try {
            const datos: IDevolucionVentaInput = req.body;
            const idUsuario = req.user?.idUsuario ?? req.body.idUsuario ?? 1;

            if (!datos.detalles || datos.detalles.length === 0) {
                return res.status(400).json({ error: 'Debe ingresar al menos un producto a devolver' });
            }

            const idDevolucionVenta = await DataDevolucion.crearVenta(datos, idUsuario);

            res.status(201).json({
                message: 'Devolución registrada exitosamente',
                idDevolucionVenta,
            });
        } catch (error: any) {
            console.error('Error al registrar devolución de venta:', error);
            if (error.message && (error.message.includes('no existe') || error.message.includes('Solo se pueden'))) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error al registrar la devolución de venta' });
        }
    };

    // ── PATCH: Resolver una devolución de venta ───────────────────────────────
    static readonly ResolverDevolucionVentaC = async (req: Request, res: Response): Promise<any> => {
        try {
            const idDevolucionVenta = Number(req.params.idDevolucionVenta);
            const datos: IResolucionVentaInput = req.body;
            const idUsuarioAutoriza = req.user?.idUsuario ?? req.body.idUsuario ?? 1;

            if (!['aprobada', 'rechazada', 'completada'].includes(datos.estado)) {
                return res.status(400).json({ error: 'Estado no válido.' });
            }

            await DataDevolucion.resolverVenta(idDevolucionVenta, datos, idUsuarioAutoriza);

            res.status(200).json({ message: 'Devolución resuelta exitosamente' });
        } catch (error: any) {
            console.error('Error al resolver devolución de venta:', error);
            if (error.message && (error.message.includes('no existe') || error.message.includes('ya fue resuelta') || error.message.includes('no válido'))) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error al resolver la devolución de venta' });
        }
    };

    // ═════════════ DEVOLUCIONES A PROVEEDOR ═════════════

    // ── GET: Listar devoluciones a proveedor ──────────────────────────────────
    static readonly GetDevolucionesProveedorC = async (req: Request, res: Response): Promise<any> => {
        try {
            const filtros = {
                estado: req.query.estado as any,
                idCompra: req.query.idCompra ? Number(req.query.idCompra) : undefined,
                fechaDesde: req.query.fechaDesde as string | undefined,
                fechaHasta: req.query.fechaHasta as string | undefined,
                pagina: req.query.pagina ? Number(req.query.pagina) : 1,
                porPagina: req.query.porPagina ? Number(req.query.porPagina) : 10,
            };

            const data = await DataDevolucion.listarProveedores(filtros);
            res.status(200).json(data);
        } catch (error) {
            console.error('Error al obtener devoluciones a proveedor:', error);
            res.status(500).json({ error: 'Error al obtener la lista de devoluciones a proveedor' });
        }
    };

    // ── GET: Detalle de una devolución a proveedor ────────────────────────────
    static readonly GetDevolucionProveedorByIdC = async (req: Request, res: Response): Promise<any> => {
        try {
            const id = Number(req.params.idDevolucionProveedor);
            const data = await DataDevolucion.obtenerProveedorPorId(id);

            if (!data) {
                return res.status(404).json({ error: 'Devolución no encontrada' });
            }

            res.status(200).json(data);
        } catch (error) {
            console.error('Error al obtener devolución a proveedor:', error);
            res.status(500).json({ error: 'Error al obtener el detalle de la devolución' });
        }
    };

    // ── POST: Registrar una devolución a proveedor ────────────────────────────
    static readonly AddDevolucionProveedorC = async (req: Request, res: Response): Promise<any> => {
        try {
            const datos: IDevolucionProveedorInput = req.body;
            const idUsuario = req.user?.idUsuario ?? req.body.idUsuario ?? 1;

            if (!datos.detalles || datos.detalles.length === 0) {
                return res.status(400).json({ error: 'Debe ingresar al menos un lote a devolver' });
            }

            const idDevolucionProveedor = await DataDevolucion.crearProveedor(datos, idUsuario);

            res.status(201).json({
                message: 'Devolución a proveedor registrada exitosamente',
                idDevolucionProveedor,
            });
        } catch (error: any) {
            console.error('Error al registrar devolución a proveedor:', error);
            if (error.message && (error.message.includes('no existe') || error.message.includes('Solo se pueden'))) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error al registrar la devolución a proveedor' });
        }
    };

    // ── PATCH: Resolver una devolución a proveedor ────────────────────────────
    static readonly ResolverDevolucionProveedorC = async (req: Request, res: Response): Promise<any> => {
        try {
            const idDevolucionProveedor = Number(req.params.idDevolucionProveedor);
            const datos: IResolucionProveedorInput = req.body;
            const idUsuarioAutoriza = req.user?.idUsuario ?? req.body.idUsuario ?? 1;

            if (!['aceptada', 'rechazada', 'completada'].includes(datos.estado)) {
                return res.status(400).json({ error: 'Estado no válido.' });
            }

            await DataDevolucion.resolverProveedor(idDevolucionProveedor, datos, idUsuarioAutoriza);

            res.status(200).json({ message: 'Devolución resuelta exitosamente' });
        } catch (error: any) {
            console.error('Error al resolver devolución a proveedor:', error);
            if (error.message && (error.message.includes('no existe') || error.message.includes('ya fue resuelta') || error.message.includes('no válido'))) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error al resolver la devolución a proveedor' });
        }
    };
}
