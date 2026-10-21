"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevolucionControllers = void 0;
const DevolucionModels_1 = __importDefault(require("../Models/DevolucionModels"));
class DevolucionControllers {
    // ═════════════ DEVOLUCIONES DE VENTA ═════════════
    // ── GET: Listar devoluciones de venta ─────────────────────────────────────
    static GetDevolucionesVentaC = async (req, res) => {
        try {
            const filtros = {
                estado: req.query.estado,
                idVenta: req.query.idVenta ? Number(req.query.idVenta) : undefined,
                fechaDesde: req.query.fechaDesde,
                fechaHasta: req.query.fechaHasta,
                pagina: req.query.pagina ? Number(req.query.pagina) : 1,
                porPagina: req.query.porPagina ? Number(req.query.porPagina) : 10,
            };
            const data = await DevolucionModels_1.default.listarVentas(filtros);
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error al obtener devoluciones de venta:', error);
            res.status(500).json({ error: 'Error al obtener la lista de devoluciones de venta' });
        }
    };
    // ── GET: Detalle de una devolución de venta ───────────────────────────────
    static GetDevolucionVentaByIdC = async (req, res) => {
        try {
            const id = Number(req.params.idDevolucionVenta);
            const data = await DevolucionModels_1.default.obtenerVentaPorId(id);
            if (!data) {
                return res.status(404).json({ error: 'Devolución no encontrada' });
            }
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error al obtener devolución de venta:', error);
            res.status(500).json({ error: 'Error al obtener el detalle de la devolución' });
        }
    };
    // ── POST: Registrar una devolución de venta ───────────────────────────────
    static AddDevolucionVentaC = async (req, res) => {
        try {
            const datos = req.body;
            const idUsuario = req.user?.idUsuario ?? req.body.idUsuario ?? 1;
            if (!datos.detalles || datos.detalles.length === 0) {
                return res.status(400).json({ error: 'Debe ingresar al menos un producto a devolver' });
            }
            const idDevolucionVenta = await DevolucionModels_1.default.crearVenta(datos, idUsuario);
            res.status(201).json({
                message: 'Devolución registrada exitosamente',
                idDevolucionVenta,
            });
        }
        catch (error) {
            console.error('Error al registrar devolución de venta:', error);
            if (error.message && (error.message.includes('no existe') || error.message.includes('Solo se pueden'))) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error al registrar la devolución de venta' });
        }
    };
    // ── PATCH: Resolver una devolución de venta ───────────────────────────────
    static ResolverDevolucionVentaC = async (req, res) => {
        try {
            const idDevolucionVenta = Number(req.params.idDevolucionVenta);
            const datos = req.body;
            const idUsuarioAutoriza = req.user?.idUsuario ?? req.body.idUsuario ?? 1;
            if (!['aprobada', 'rechazada', 'completada'].includes(datos.estado)) {
                return res.status(400).json({ error: 'Estado no válido.' });
            }
            await DevolucionModels_1.default.resolverVenta(idDevolucionVenta, datos, idUsuarioAutoriza);
            res.status(200).json({ message: 'Devolución resuelta exitosamente' });
        }
        catch (error) {
            console.error('Error al resolver devolución de venta:', error);
            if (error.message && (error.message.includes('no existe') || error.message.includes('ya fue resuelta') || error.message.includes('no válido'))) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error al resolver la devolución de venta' });
        }
    };
    // ═════════════ DEVOLUCIONES A PROVEEDOR ═════════════
    // ── GET: Listar devoluciones a proveedor ──────────────────────────────────
    static GetDevolucionesProveedorC = async (req, res) => {
        try {
            const filtros = {
                estado: req.query.estado,
                idCompra: req.query.idCompra ? Number(req.query.idCompra) : undefined,
                fechaDesde: req.query.fechaDesde,
                fechaHasta: req.query.fechaHasta,
                pagina: req.query.pagina ? Number(req.query.pagina) : 1,
                porPagina: req.query.porPagina ? Number(req.query.porPagina) : 10,
            };
            const data = await DevolucionModels_1.default.listarProveedores(filtros);
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error al obtener devoluciones a proveedor:', error);
            res.status(500).json({ error: 'Error al obtener la lista de devoluciones a proveedor' });
        }
    };
    // ── GET: Detalle de una devolución a proveedor ────────────────────────────
    static GetDevolucionProveedorByIdC = async (req, res) => {
        try {
            const id = Number(req.params.idDevolucionProveedor);
            const data = await DevolucionModels_1.default.obtenerProveedorPorId(id);
            if (!data) {
                return res.status(404).json({ error: 'Devolución no encontrada' });
            }
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error al obtener devolución a proveedor:', error);
            res.status(500).json({ error: 'Error al obtener el detalle de la devolución' });
        }
    };
    // ── POST: Registrar una devolución a proveedor ────────────────────────────
    static AddDevolucionProveedorC = async (req, res) => {
        try {
            const datos = req.body;
            const idUsuario = req.user?.idUsuario ?? req.body.idUsuario ?? 1;
            if (!datos.detalles || datos.detalles.length === 0) {
                return res.status(400).json({ error: 'Debe ingresar al menos un lote a devolver' });
            }
            const idDevolucionProveedor = await DevolucionModels_1.default.crearProveedor(datos, idUsuario);
            res.status(201).json({
                message: 'Devolución a proveedor registrada exitosamente',
                idDevolucionProveedor,
            });
        }
        catch (error) {
            console.error('Error al registrar devolución a proveedor:', error);
            if (error.message && (error.message.includes('no existe') || error.message.includes('Solo se pueden'))) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error al registrar la devolución a proveedor' });
        }
    };
    // ── PATCH: Resolver una devolución a proveedor ────────────────────────────
    static ResolverDevolucionProveedorC = async (req, res) => {
        try {
            const idDevolucionProveedor = Number(req.params.idDevolucionProveedor);
            const datos = req.body;
            const idUsuarioAutoriza = req.user?.idUsuario ?? req.body.idUsuario ?? 1;
            if (!['aceptada', 'rechazada', 'completada'].includes(datos.estado)) {
                return res.status(400).json({ error: 'Estado no válido.' });
            }
            await DevolucionModels_1.default.resolverProveedor(idDevolucionProveedor, datos, idUsuarioAutoriza);
            res.status(200).json({ message: 'Devolución resuelta exitosamente' });
        }
        catch (error) {
            console.error('Error al resolver devolución a proveedor:', error);
            if (error.message && (error.message.includes('no existe') || error.message.includes('ya fue resuelta') || error.message.includes('no válido'))) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error al resolver la devolución a proveedor' });
        }
    };
}
exports.DevolucionControllers = DevolucionControllers;
//# sourceMappingURL=DevolucionControllers.js.map