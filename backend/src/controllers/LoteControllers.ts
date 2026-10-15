import { Request, Response } from 'express';
import DataLote from '../Models/LoteModels';

export class LoteControllers {

    // ── GET: Listar lotes con filtros y paginación ─────────────────────────────
    static readonly GetLotesC = async (req: Request, res: Response): Promise<any> => {
        try {
            const filtros = {
                estado: req.query.estado as 'pendiente' | 'activo' | 'vencido' | 'cancelado' | 'cuarentena' | 'devuelto' | undefined,
                idProducto: req.query.idProducto ? Number(req.query.idProducto) : undefined,
                idProveedor: req.query.idProveedor ? Number(req.query.idProveedor) : undefined,
                soloProximosVencer: req.query.soloProximosVencer === 'true',
                busqueda: req.query.busqueda as string | undefined,
                pagina: req.query.pagina ? Number(req.query.pagina) : 1,
                porPagina: req.query.porPagina ? Number(req.query.porPagina) : 10,
            };

            const data = await DataLote.listar(filtros);
            res.status(200).json(data);
        } catch (error) {
            console.error('Error al obtener lotes:', error);
            res.status(500).json({ error: 'Error al obtener la lista de lotes' });
        }
    };

    // ── GET: Obtener un lote por ID ─────────────────────────────────────────────
    static readonly GetLoteByIdC = async (req: Request, res: Response): Promise<any> => {
        try {
            const idLote = Number(req.params.idLote);
            const data = await DataLote.obtenerPorId(idLote);

            if (!data) {
                return res.status(404).json({ error: 'Lote no encontrado' });
            }

            res.status(200).json(data);
        } catch (error) {
            console.error('Error al obtener detalle de lote:', error);
            res.status(500).json({ error: 'Error al obtener el detalle del lote' });
        }
    };
}