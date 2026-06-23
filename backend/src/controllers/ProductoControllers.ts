import { Request, Response } from 'express';
import DataProducto from '../Models/ProductoModels';
import { uploadImageGlobal } from '../Middleware/SaveImg';
import { GetDateToday } from '../lib/Time';

export class ProductoControllers {

    static readonly GetProductoC = async (req: Request, res: Response) => {
        try {
            const data = await DataProducto.GetProductoM();
            res.status(200).json(data);
        } catch (error) {
            console.error('Error al obtener productos:', error);
            res.status(500).json({ error: 'Error al obtener los Productos' });
        }
    };

    // ── POST: crear un nuevo producto ─────────────────────────────────────────
    static readonly AddProductoC = async (req: Request, res: Response): Promise<any> => {
        try {
            const {
                codigoBarra,
                nombreGenerico,
                nombreComercial,
                concentracion,
                descripcion,
                precio,
                requiereReceta,
                contraindicaciones,
                viaAdministracion,
                stockMinimo,
                idLaboratorio,
                idTipoProd,
                idPresentacion,
            } = req.body;

            const imgFile = req.file;
            const fecha   = GetDateToday();

            // ── Verificar código de barra único ────────────────────────────────
            const codExiste = await DataProducto.VerificarCodigoBarraM(codigoBarra);
            if (codExiste !== 0) {
                return res.status(400).json({ error: 'El código de barra ya está registrado' });
            }

            // ── Insertar producto (sin imagen aún) ────────────────────────────
            const idProducto = await DataProducto.AddProductoM({
                codigoBarra,
                nombreGenerico,
                nombreComercial:   nombreComercial   || null,
                concentracion:     concentracion     || null,
                descripcion:       descripcion       || null,
                precio:            Number(precio),
                requiereReceta:    Number(requiereReceta) || 0,
                contraindicaciones: contraindicaciones || null,
                viaAdministracion:  viaAdministracion  || null,
                stockMinimo:       Number(stockMinimo) || 0,
                idLaboratorio:     Number(idLaboratorio),
                idTipoProd:        Number(idTipoProd),
                idPresentacion:    Number(idPresentacion),
                img:               null,
            });

            // ── Subir imagen si se envió ───────────────────────────────────────
            if (imgFile) {
                const rutaImg = await uploadImageGlobal(imgFile, String(idProducto), fecha, 'Producto');
                await DataProducto.UpdateImgProductoM(rutaImg, idProducto);
            }

            res.status(200).json({
                message:    'Producto registrado exitosamente',
                idProducto,
            });
        } catch (error) {
            console.error('Error al agregar producto:', error);
            res.status(500).json({ error: 'Error al registrar el Producto' });
        }
    };

    // ── PUT: actualizar un producto ────────────────────────────────────────────
    static readonly UpdateProductoC = async (req: Request, res: Response): Promise<any> => {
        try {
            const idProducto = String(req.params.idProducto);
            const {
                codigoBarra,
                nombreGenerico,
                nombreComercial,
                concentracion,
                descripcion,
                precio,
                requiereReceta,
                contraindicaciones,
                viaAdministracion,
                stockMinimo,
                idLaboratorio,
                idTipoProd,
                idPresentacion,
            } = req.body;

            const imgFile = req.file;
            const fecha   = GetDateToday();

            // ── Verificar código de barra (sin contar el propio producto) ──────
            const codExiste = await DataProducto.VerificarCodigoBarraUpdateM(codigoBarra, idProducto);
            if (codExiste !== 0) {
                return res.status(400).json({ error: 'El código de barra ya está registrado en otro producto' });
            }

            // ── Actualizar datos principales ───────────────────────────────────
            await DataProducto.UpdateProductoM({
                codigoBarra,
                nombreGenerico,
                nombreComercial:    nombreComercial    || null,
                concentracion:      concentracion      || null,
                descripcion:        descripcion        || null,
                precio:             Number(precio),
                requiereReceta:     Number(requiereReceta) || 0,
                contraindicaciones: contraindicaciones || null,
                viaAdministracion:  viaAdministracion  || null,
                stockMinimo:        Number(stockMinimo) || 0,
                idLaboratorio:      Number(idLaboratorio),
                idTipoProd:         Number(idTipoProd),
                idPresentacion:     Number(idPresentacion),
                img:                null,
            }, idProducto);

            // ── Actualizar imagen si se envió una nueva ────────────────────────
            if (imgFile) {
                const rutaImg = await uploadImageGlobal(imgFile, idProducto, fecha, 'Producto');
                await DataProducto.UpdateImgProductoM(rutaImg, idProducto);
            }

            res.status(200).json('Producto Actualizado Exitosamente');
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            res.status(500).json({ error: 'Error al Actualizar el Producto' });
        }
    };

    // ── DELETE: desactivar un producto (soft delete) ──────────────────────────
    static readonly DeleteProductoC = async (req: Request, res: Response) => {
        try {
            const idProducto = String(req.params.idProducto);
            const data = await DataProducto.DeleteProductoM(idProducto);
            res.status(200).json(data);
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            res.status(500).json({ error: 'Error al eliminar el Producto' });
        }
    };
}
