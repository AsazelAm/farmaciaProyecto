"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoteControllers = void 0;
const LoteModels_1 = __importDefault(require("../Models/LoteModels"));
class LoteControllers {
    // ── GET: Listar lotes con filtros y paginación ─────────────────────────────
    static GetLotesC = async (req, res) => {
        try {
            const filtros = {
                estado: req.query.estado,
                idProducto: req.query.idProducto ? Number(req.query.idProducto) : undefined,
                idProveedor: req.query.idProveedor ? Number(req.query.idProveedor) : undefined,
                soloProximosVencer: req.query.soloProximosVencer === 'true',
                busqueda: req.query.busqueda,
                pagina: req.query.pagina ? Number(req.query.pagina) : 1,
                porPagina: req.query.porPagina ? Number(req.query.porPagina) : 10,
            };
            const data = await LoteModels_1.default.listar(filtros);
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error al obtener lotes:', error);
            res.status(500).json({ error: 'Error al obtener la lista de lotes' });
        }
    };
    // ── GET: Obtener un lote por ID ─────────────────────────────────────────────
    static GetLoteByIdC = async (req, res) => {
        try {
            const idLote = Number(req.params.idLote);
            const data = await LoteModels_1.default.obtenerPorId(idLote);
            if (!data) {
                return res.status(404).json({ error: 'Lote no encontrado' });
            }
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error al obtener detalle de lote:', error);
            res.status(500).json({ error: 'Error al obtener el detalle del lote' });
        }
    };
}
exports.LoteControllers = LoteControllers;
//# sourceMappingURL=LoteControllers.js.map