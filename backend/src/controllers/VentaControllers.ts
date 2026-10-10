import { Request, Response } from 'express';
import DataVenta from '../Models/VentaModels';

export class VentaControllers {

    // ── GET: Listar ventas con filtros y paginación ───────────────────────────
    static readonly GetVentasC = async (req: Request, res: Response): Promise<any> => {
        try {
            // Extraer filtros del query params
            const filtros = {
                estado: req.query.estado as 'pendiente' | 'completado' | 'cancelado' | undefined,
                idCliente: req.query.idCliente ? Number(req.query.idCliente) : undefined,
                idUsuario: req.query.idUsuario ? Number(req.query.idUsuario) : undefined,
                idSucursal: req.query.idSucursal ? Number(req.query.idSucursal) : undefined,
                fechaDesde: req.query.fechaDesde as string | undefined,
                fechaHasta: req.query.fechaHasta as string | undefined,
                pagina: req.query.pagina ? Number(req.query.pagina) : 1,
                porPagina: req.query.porPagina ? Number(req.query.porPagina) : 10,
            };

            const data = await DataVenta.listar(filtros);
            res.status(200).json(data);
        } catch (error) {
            console.error('Error al obtener ventas:', error);
            res.status(500).json({ error: 'Error al obtener la lista de ventas' });
        }
    };

    // ── GET: Obtener detalle de una venta específica ──────────────────────────
    static readonly GetVentaByIdC = async (req: Request, res: Response): Promise<any> => {
        try {
            const idVenta = Number(req.params.idVenta);
            const data = await DataVenta.obtenerPorId(idVenta);

            if (!data) {
                return res.status(404).json({ error: 'Venta no encontrada' });
            }

            res.status(200).json(data);
        } catch (error) {
            console.error('Error al obtener detalle de venta:', error);
            res.status(500).json({ error: 'Error al obtener el detalle de la venta' });
        }
    };

    // ── POST: Crear una nueva venta ────────────────────────────────────────────
    static readonly AddVentaC = async (req: Request, res: Response): Promise<any> => {
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
                const stockDisponible = await DataVenta.VerificarStockLote(detalle.idLote, detalle.cantidad);
                if (!stockDisponible) {
                    return res.status(400).json({ error: `Stock insuficiente o lote no disponible (idLote ${detalle.idLote})` });
                }
            }

            // 3. Crear venta
            const idVenta = await DataVenta.crear(datos, idUsuario);

            res.status(201).json({
                message: 'Venta registrada exitosamente',
                idVenta,
            });
        } catch (error: any) {
            console.error('Error al crear venta:', error);
            // Errores de negocio lanzados desde el Model (stock, lote inactivo, etc.)
            if (error.message && (error.message.includes('Stock insuficiente') || error.message.includes('lote'))) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error al registrar la venta y sus detalles' });
        }
    };

    // ── PUT: Actualizar una venta (SOLO en estado pendiente) ──────────────────
    static readonly UpdateVentaC = async (req: Request, res: Response): Promise<any> => {
        try {
            const idVenta = Number(req.params.idVenta);
            const datos = req.body;

            if (!datos.detalles || datos.detalles.length === 0) {
                return res.status(400).json({ error: 'Debe ingresar al menos un producto para actualizar la venta' });
            }

            await DataVenta.actualizar(idVenta, datos);

            res.status(200).json({ message: 'Venta actualizada exitosamente' });
        } catch (error: any) {
            console.error('Error al actualizar venta:', error);
            // Si el error viene de la validación del Model (ej. "La venta no existe", "no está pendiente" o stock)
            if (error.message && (error.message.includes('estado pendiente') || error.message.includes('Stock insuficiente') || error.message.includes('no existe'))) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error al actualizar la venta' });
        }
    };

    // ── PATCH: Cambiar estado de la venta (Completar, Anular o Pendiente) ─────
    static readonly ChangeEstadoVentaC = async (req: Request, res: Response): Promise<any> => {
        try {
            const idVenta = Number(req.params.idVenta);
            const { estado, motivo } = req.body; // Debería recibir 'completado', 'cancelado' o 'pendiente'

            if (estado === 'completado') {
                await DataVenta.completar(idVenta);
                return res.status(200).json({ message: 'Venta completada exitosamente' });
            } else if (estado === 'cancelado') {
                await DataVenta.anular(idVenta, motivo);
                return res.status(200).json({ message: 'Venta anulada y stock restituido exitosamente' });
            } else if (estado === 'pendiente') {
                await DataVenta.cambiarAPendiente(idVenta);
                return res.status(200).json({ message: 'Venta restablecida a pendiente exitosamente' });
            } else {
                return res.status(400).json({ error: 'Estado no válido.' });
            }

        } catch (error: any) {
            console.error(`Error al cambiar estado de la venta a ${req.body.estado}:`, error);
            if (error.message && error.message.includes('no existe')) {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error al procesar el cambio de estado de la venta' });
        }
    };

    // ── POST: Emitir factura para una venta completada ────────────────────────
    static readonly EmitirFacturaC = async (req: Request, res: Response): Promise<any> => {
        try {
            const idVenta = Number(req.params.idVenta);
            const datosFactura = req.body;

            if (!datosFactura.tipoFactura) {
                return res.status(400).json({ error: 'Debe especificar el tipo de factura' });
            }

            const idFactura = await DataVenta.emitirFactura(idVenta, datosFactura);

            res.status(201).json({
                message: 'Factura emitida exitosamente',
                idFactura,
            });
        } catch (error: any) {
            console.error('Error al emitir factura:', error);
            if (error.message && (error.message.includes('completada') || error.message.includes('ya tiene') || error.message.includes('no existe'))) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error al emitir la factura de la venta' });
        }
    };

    // ── GET: Lotes activos disponibles de un producto (para elegir en el POS) ─
    static readonly GetLotesDisponiblesC = async (req: Request, res: Response): Promise<any> => {
        try {
            const idProducto = Number(req.params.idProducto);
            const data = await DataVenta.LotesDisponiblesPorProducto(idProducto);
            res.status(200).json(data);
        } catch (error) {
            console.error('Error al obtener lotes disponibles del producto:', error);
            res.status(500).json({ error: 'Error al obtener los lotes disponibles' });
        }
    };

    // ── GET: Datos de facturación (NIT/razón social) previos de un cliente ────
    static readonly GetDatosFacturacionClienteC = async (req: Request, res: Response): Promise<any> => {
        try {
            const idCliente = Number(req.params.idCliente);
            const data = await DataVenta.obtenerDatosFacturacionPorCliente(idCliente);
            res.status(200).json(data);
        } catch (error) {
            console.error('Error al obtener los datos de facturación del cliente:', error);
            res.status(500).json({ error: 'Error al obtener los datos de facturación del cliente' });
        }
    };

    // ── GET: Obtener estadísticas del Dashboard ───────────────────────────────
    static readonly GetEstadisticasC = async (req: Request, res: Response): Promise<any> => {
        try {
            const data = await DataVenta.estadisticas();
            res.status(200).json(data);
        } catch (error) {
            console.error('Error al obtener estadísticas de ventas:', error);
            res.status(500).json({ error: 'Error al cargar las métricas del dashboard' });
        }
    };
}