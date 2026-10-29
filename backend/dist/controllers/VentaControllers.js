"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VentaControllers = void 0;
const VentaModels_1 = __importDefault(require("../Models/VentaModels"));
class VentaControllers {
    // ── GET: Listar ventas con filtros y paginación ───────────────────────────
    static GetVentasC = async (req, res) => {
        try {
            // Extraer filtros del query params
            const filtros = {
                estado: req.query.estado,
                idCliente: req.query.idCliente ? Number(req.query.idCliente) : undefined,
                idUsuario: req.query.idUsuario ? Number(req.query.idUsuario) : undefined,
                idSucursal: req.query.idSucursal ? Number(req.query.idSucursal) : undefined,
                fechaDesde: req.query.fechaDesde,
                fechaHasta: req.query.fechaHasta,
                pagina: req.query.pagina ? Number(req.query.pagina) : 1,
                porPagina: req.query.porPagina ? Number(req.query.porPagina) : 10,
            };
            const data = await VentaModels_1.default.listar(filtros);
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error al obtener ventas:', error);
            res.status(500).json({ error: 'Error al obtener la lista de ventas' });
        }
    };
    // ── GET: Obtener detalle de una venta específica ──────────────────────────
    static GetVentaByIdC = async (req, res) => {
        try {
            const idVenta = Number(req.params.idVenta);
            const data = await VentaModels_1.default.obtenerPorId(idVenta);
            if (!data) {
                return res.status(404).json({ error: 'Venta no encontrada' });
            }
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error al obtener detalle de venta:', error);
            res.status(500).json({ error: 'Error al obtener el detalle de la venta' });
        }
    };
    // ── POST: Crear una nueva venta ────────────────────────────────────────────
    static AddVentaC = async (req, res) => {
        try {
            const datos = req.body;
            // NOTA: En un entorno real, idUsuario debería venir del token (ej. req.user.idUsuario)
            // Aquí lo tomamos del body o de una variable de entorno simulada si no usas JWT aún.
            const idUsuario = req.body.idUsuario || 1;
            // 1. Validar que venga al menos un detalle
            if (!datos.detalles || datos.detalles.length === 0) {
                return res.status(400).json({ error: 'Debe ingresar al menos un producto para registrar la venta' });
            }
            // 2. Verificar stock disponible de cada lote antes de intentar la transacción
            for (const detalle of datos.detalles) {
                const stockDisponible = await VentaModels_1.default.VerificarStockLote(detalle.idLote, detalle.cantidad);
                if (!stockDisponible) {
                    return res.status(400).json({ error: `Stock insuficiente o lote no disponible (idLote ${detalle.idLote})` });
                }
            }
            // 3. Regla FEFO: el lote despachado debe ser el de vencimiento más próximo.
            //    Si hay un lote más próximo aún disponible, la venta se detiene salvo
            //    que el cajero lo justifique explícitamente (desvío autorizado).
            const incumplimientoFEFO = await VentaModels_1.default.ValidarFEFODetalles(datos.detalles);
            if (incumplimientoFEFO) {
                if (datos.permitirDesvioFEFO === true) {
                    const motivo = (datos.motivoDesvioFEFO || 'Sin motivo declarado').toString().trim();
                    const auditoria = `[FEFO] Se despachó el lote ${incumplimientoFEFO.numeroLote} (vence en ${incumplimientoFEFO.diasRestantes} días) ` +
                        `en lugar del lote ${incumplimientoFEFO.numeroLoteFEFO} (vence en ${incumplimientoFEFO.diasRestantesFEFO} días). ` +
                        `Motivo: ${motivo}`;
                    datos.observaciones = datos.observaciones
                        ? `${datos.observaciones} | ${auditoria}`
                        : auditoria;
                }
                else {
                    return res.status(400).json({
                        error: incumplimientoFEFO.mensaje,
                        alertaFEFO: incumplimientoFEFO,
                    });
                }
            }
            // 4. Crear venta
            const idVenta = await VentaModels_1.default.crear(datos, idUsuario);
            res.status(201).json({
                message: 'Venta registrada exitosamente',
                idVenta,
            });
        }
        catch (error) {
            console.error('Error al crear venta:', error);
            // Errores de negocio lanzados desde el Model (stock, lote inactivo, etc.)
            if (error.message && (error.message.includes('Stock insuficiente') || error.message.includes('lote'))) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error al registrar la venta y sus detalles' });
        }
    };
    // ── PUT: Actualizar una venta (SOLO en estado pendiente) ──────────────────
    static UpdateVentaC = async (req, res) => {
        try {
            const idVenta = Number(req.params.idVenta);
            const datos = req.body;
            if (!datos.detalles || datos.detalles.length === 0) {
                return res.status(400).json({ error: 'Debe ingresar al menos un producto para actualizar la venta' });
            }
            // Regla FEFO también aplica a la edición de ventas pendientes.
            const incumplimientoFEFO = await VentaModels_1.default.ValidarFEFODetalles(datos.detalles);
            if (incumplimientoFEFO && datos.permitirDesvioFEFO !== true) {
                return res.status(400).json({
                    error: incumplimientoFEFO.mensaje,
                    alertaFEFO: incumplimientoFEFO,
                });
            }
            await VentaModels_1.default.actualizar(idVenta, datos);
            res.status(200).json({ message: 'Venta actualizada exitosamente' });
        }
        catch (error) {
            console.error('Error al actualizar venta:', error);
            // Si el error viene de la validación del Model (ej. "La venta no existe", "no está pendiente" o stock)
            if (error.message && (error.message.includes('estado pendiente') || error.message.includes('Stock insuficiente') || error.message.includes('no existe'))) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error al actualizar la venta' });
        }
    };
    // ── PATCH: Cambiar estado de la venta (Completar, Anular o Pendiente) ─────
    static ChangeEstadoVentaC = async (req, res) => {
        try {
            const idVenta = Number(req.params.idVenta);
            const { estado, motivo } = req.body; // Debería recibir 'completado', 'cancelado' o 'pendiente'
            const idUsuario = req.user?.idUsuario ?? req.body.idUsuario ?? undefined;
            if (estado === 'completado') {
                await VentaModels_1.default.completar(idVenta);
                return res.status(200).json({ message: 'Venta completada exitosamente' });
            }
            else if (estado === 'cancelado') {
                await VentaModels_1.default.anular(idVenta, motivo, idUsuario);
                return res.status(200).json({ message: 'Venta anulada y stock restituido exitosamente' });
            }
            else if (estado === 'pendiente') {
                await VentaModels_1.default.cambiarAPendiente(idVenta);
                return res.status(200).json({ message: 'Venta restablecida a pendiente exitosamente' });
            }
            else {
                return res.status(400).json({ error: 'Estado no válido.' });
            }
        }
        catch (error) {
            console.error(`Error al cambiar estado de la venta a ${req.body.estado}:`, error);
            if (error.message && error.message.includes('no existe')) {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error al procesar el cambio de estado de la venta' });
        }
    };
    // ── POST: Emitir recibo para una venta completada ─────────────────────────
    static EmitirReciboC = async (req, res) => {
        try {
            const idVenta = Number(req.params.idVenta);
            const recibo = await VentaModels_1.default.emitirRecibo(idVenta);
            res.status(201).json({
                message: 'Recibo emitido exitosamente',
                ...recibo,
            });
        }
        catch (error) {
            console.error('Error al emitir recibo:', error);
            if (error.message && (error.message.includes('completada') || error.message.includes('ya tiene') || error.message.includes('no existe'))) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error al emitir el recibo de la venta' });
        }
    };
    // ── GET: Lotes activos disponibles de un producto (para elegir en el POS) ─
    static GetLotesDisponiblesC = async (req, res) => {
        try {
            const idProducto = Number(req.params.idProducto);
            const data = await VentaModels_1.default.LotesDisponiblesPorProducto(idProducto);
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error al obtener lotes disponibles del producto:', error);
            res.status(500).json({ error: 'Error al obtener los lotes disponibles' });
        }
    };
    // ── GET: Alerta FEFO de un lote seleccionado en el POS ───────────────────
    // Compara el lote elegido con el lote de vencimiento más próximo del mismo
    // producto para avisar al personal cuando se está desviando la regla FEFO.
    static GetAlertaFEFOC = async (req, res) => {
        try {
            const idProducto = Number(req.params.idProducto);
            const idLote = Number(req.params.idLote);
            const data = await VentaModels_1.default.AlertaFEFO(idProducto, idLote);
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error al obtener la alerta FEFO del lote:', error);
            res.status(500).json({ error: 'Error al obtener la alerta FEFO del lote' });
        }
    };
    // ── GET: Obtener estadísticas del Dashboard ───────────────────────────────
    static GetEstadisticasC = async (req, res) => {
        try {
            const data = await VentaModels_1.default.estadisticas();
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error al obtener estadísticas de ventas:', error);
            res.status(500).json({ error: 'Error al cargar las métricas del dashboard' });
        }
    };
}
exports.VentaControllers = VentaControllers;
//# sourceMappingURL=VentaControllers.js.map