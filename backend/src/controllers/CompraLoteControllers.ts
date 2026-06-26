import { Request, Response } from 'express';
import DataCompra from '../Models/CompraLoteModels';

export class CompraLoteControllers {

    // ── GET: Listar compras con filtros y paginación ──────────────────────────
    static readonly GetComprasC = async (req: Request, res: Response): Promise<any> => {
        try {
            // Extraer filtros del query params
            const filtros = {
                estado: req.query.estado as 'pendiente' | 'completado' | 'cancelado' | undefined,
                idProveedor: req.query.idProveedor ? Number(req.query.idProveedor) : undefined,
                idSucursal: req.query.idSucursal ? Number(req.query.idSucursal) : undefined,
                fechaDesde: req.query.fechaDesde as string | undefined,
                fechaHasta: req.query.fechaHasta as string | undefined,
                pagina: req.query.pagina ? Number(req.query.pagina) : 1,
                porPagina: req.query.porPagina ? Number(req.query.porPagina) : 10,
            };

            const data = await DataCompra.listar(filtros);
            res.status(200).json(data);
        } catch (error) {
            console.error('Error al obtener compras:', error);
            res.status(500).json({ error: 'Error al obtener la lista de compras' });
        }
    };

    // ── GET: Obtener detalle de una compra específica ─────────────────────────
    static readonly GetCompraByIdC = async (req: Request, res: Response): Promise<any> => {
        try {
            const idCompra = Number(req.params.idCompra);
            const data = await DataCompra.obtenerPorId(idCompra);

            if (!data) {
                return res.status(404).json({ error: 'Compra no encontrada' });
            }

            res.status(200).json(data);
        } catch (error) {
            console.error('Error al obtener detalle de compra:', error);
            res.status(500).json({ error: 'Error al obtener el detalle de la compra' });
        }
    };

    // ── POST: Crear una nueva compra ──────────────────────────────────────────
    static readonly AddCompraC = async (req: Request, res: Response): Promise<any> => {
        try {
            const datos = req.body;
            
            // NOTA: En un entorno real, idUsuario debería venir del token (ej. req.user.idUsuario)
            // Aquí lo tomamos del body o de una variable de entorno simulada si no usas JWT aún.
            const idUsuario = req.body.idUsuario || 1; 

            // 1. Verificar si el número de factura ya existe (si es que se envió)
            if (datos.numeroFactura) {
                const facturaExiste = await DataCompra.VerificarNumeroFactura(datos.numeroFactura);
                if (facturaExiste !== 0) {
                    return res.status(400).json({ error: 'El número de factura ya está registrado' });
                }
            }

            // 2. Verificar que los códigos de los lotes no existan previamente
            if (datos.lotes && datos.lotes.length > 0) {
                for (const lote of datos.lotes) {
                    const loteExiste = await DataCompra.VerificarCodigoLote(lote.codigo);
                    if (loteExiste !== 0) {
                        return res.status(400).json({ error: `El código de lote ${lote.codigo} ya existe en el sistema` });
                    }
                }
            } else {
                return res.status(400).json({ error: 'Debe ingresar al menos un lote para crear la compra' });
            }

            // 3. Crear compra
            const idCompra = await DataCompra.crear(datos, idUsuario);

            res.status(201).json({
                message: 'Compra registrada exitosamente',
                idCompra,
            });
        } catch (error) {
            console.error('Error al crear compra:', error);
            res.status(500).json({ error: 'Error al registrar la compra y sus lotes' });
        }
    };

    // ── PUT: Actualizar una compra (SOLO en estado pendiente) ─────────────────
    static readonly UpdateCompraC = async (req: Request, res: Response): Promise<any> => {
        try {
            const idCompra = Number(req.params.idCompra);
            const datos = req.body;

            // 1. Verificar si el nuevo número de factura choca con otro existente 
            // (que no sea el de esta misma compra)
            if (datos.numeroFactura) {
                const facturaExiste = await DataCompra.VerificarNumeroFactura(datos.numeroFactura);
                // Si la lógica de VerificarNumeroFactura no excluye el ID actual, 
                // debes asegurarte de validar correctamente o actualizar el Query en el Model
                // para hacer un chequeo de update seguro. Por ahora asumimos validación general.
            }

            // 2. Ejecutar la actualización en cascada
            await DataCompra.actualizar(idCompra, datos);

            res.status(200).json({ message: 'Compra actualizada exitosamente' });
        } catch (error: any) {
            console.error('Error al actualizar compra:', error);
            // Si el error viene de la validación del Model (ej. "La compra no existe" o "No está pendiente")
            if (error.message && error.message.includes('estado pendiente')) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error al actualizar la compra' });
        }
    };

    // ── PATCH: Cambiar estado de la compra (Completar o Cancelar) ─────────────
    static readonly ChangeEstadoCompraC = async (req: Request, res: Response): Promise<any> => {
        try {
            const idCompra = Number(req.params.idCompra);
            const { estado } = req.body; // Debería recibir 'completado' o 'cancelado'

            if (estado === 'completado') {
                await DataCompra.completar(idCompra);
                return res.status(200).json({ message: 'Compra completada e inventario actualizado' });
                
            } else if (estado === 'cancelado') {
                await DataCompra.cancelar(idCompra);
                return res.status(200).json({ message: 'Compra cancelada exitosamente' });
                
            } else {
                return res.status(400).json({ error: 'Estado no válido. Use "completado" o "cancelado".' });
            }

        } catch (error) {
            console.error(`Error al cambiar estado de la compra a ${req.body.estado}:`, error);
            res.status(500).json({ error: 'Error al procesar el cambio de estado de la compra' });
        }
    };

    // ── GET: Obtener estadísticas del Dashboard ───────────────────────────────
    static readonly GetEstadisticasC = async (req: Request, res: Response): Promise<any> => {
        try {
            const data = await DataCompra.estadisticas();
            res.status(200).json(data);
        } catch (error) {
            console.error('Error al obtener estadísticas de compras:', error);
            res.status(500).json({ error: 'Error al cargar las métricas del dashboard' });
        }
    };
}