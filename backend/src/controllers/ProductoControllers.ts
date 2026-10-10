import { Request, Response } from 'express';
import DataProducto from '../Models/ProductoModels';
import DataPrincipioActivo from '../Models/PrincipioActivoModels';
import { uploadImageGlobal } from '../Middleware/SaveImg';
import { GetDateToday } from '../lib/Time';

// ── Utilidades de parseo ──────────────────────────────────────────────────────

// Los arrays llegan como JSON string (multipart) o como array nativo (json)
function parseArray(value: any): any[] {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.trim()) {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
}

// Devuelve el id de cada principio activo (existente o creado inline)
async function resolvePrincipios(principiosActivos: any[]) {
    const ids: number[] = [];
    for (const p of principiosActivos) {
        let id = Number(p?.idPrincipioActivo ?? 0);
        if (id > 0) {
            ids.push(id);
            continue;
        }
        const nombre = String(p?.nombre ?? '').trim();
        if (!nombre) throw new Error('Cada principio activo debe tener nombre o id');
        id = await DataPrincipioActivo.FindOrCreatePrincipioM(nombre);
        ids.push(id);
    }
    return ids;
}

// Devuelve los ids de los tipos (existentes o creados inline)
async function resolveTipos(tiposProducto: any[]) {
    const ids: number[] = [];
    for (const t of tiposProducto) {
        let id = Number(t?.idTipoProd ?? 0);
        if (id > 0) {
            if (!ids.includes(id)) ids.push(id);
            continue;
        }
        const nombre = String(t?.nombre ?? '').trim();
        if (!nombre) throw new Error('Cada tipo de producto debe tener nombre o id');
        id = await DataProducto.FindOrCreateTipoM(nombre);
        if (!ids.includes(id)) ids.push(id);
    }
    return ids;
}

// Busca por id o crea el laboratorio por nombre
async function resolveLaboratorio(idLaboratorio: any, nombreLaboratorio: any) {
    const id = Number(idLaboratorio ?? 0);
    if (id > 0) return id;
    const nombre = String(nombreLaboratorio ?? '').trim();
    if (!nombre) throw new Error('Seleccione un laboratorio o escriba el nombre');
    return await DataProducto.FindOrCreateLaboratorioM(nombre);
}

// Busca por id o crea la presentación por nombre
async function resolvePresentacion(idPresentacion: any, nombrePresentacion: any) {
    const id = Number(idPresentacion ?? 0);
    if (id > 0) return id;
    const nombre = String(nombrePresentacion ?? '').trim();
    if (!nombre) throw new Error('Seleccione una presentación o escriba el nombre');
    return await DataProducto.FindOrCreatePresentacionM(nombre);
}

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
                nombreComercial,
                descripcion,
                precio,
                requiereReceta,
                contraindicaciones,
                viaAdministracion,
                stockMinimo,
                idLaboratorio,
                nombreLaboratorio,
                idPresentacion,
                nombrePresentacion,
            } = req.body;

            const tiposProducto = parseArray(req.body.tiposProducto);
            const principiosActivos = parseArray(req.body.principiosActivos);

            const imgFile = req.file;
            const fecha   = GetDateToday();

            // ── Validaciones ──────────────────────────────────────────────────
            const codExiste = await DataProducto.VerificarCodigoBarraM(codigoBarra);
            if (codExiste !== 0) {
                return res.status(400).json({ error: 'El código de barra ya está registrado' });
            }

            const idLab = await resolveLaboratorio(idLaboratorio, nombreLaboratorio);
            const idPres = await resolvePresentacion(idPresentacion, nombrePresentacion);
            const idsTipos = await resolveTipos(tiposProducto);
            const idsPrincipios = await resolvePrincipios(principiosActivos);

            if (idsPrincipios.length === 0) {
                return res.status(400).json({ error: 'Debe agregar al menos un principio activo' });
            }
            if (idsTipos.length === 0) {
                return res.status(400).json({ error: 'Debe agregar al menos un tipo de producto' });
            }

            // ── Insertar producto (sin imagen aún) ────────────────────────────
            const idProducto = await DataProducto.AddProductoM({
                codigoBarra,
                nombreComercial: nombreComercial || null,
                descripcion: descripcion || null,
                precio: Number(precio),
                requiereReceta: Number(requiereReceta) || 0,
                contraindicaciones: contraindicaciones || null,
                viaAdministracion: viaAdministracion || null,
                stockMinimo: Number(stockMinimo) || 0,
                idLaboratorio: idLab,
                idPresentacion: idPres,
                img: null,
            });

            // ── Asociar principios activos (con su concentración) ─────────────
            for (const p of principiosActivos) {
                const id = Number(p?.idPrincipioActivo ?? 0);
                const nombre = String(p?.nombre ?? '').trim();
                const resolvedId = id > 0 ? id : await DataPrincipioActivo.FindOrCreatePrincipioM(nombre);
                await DataProducto.AddPrincipioProductoM(idProducto, resolvedId, p?.concentracion || null);
            }

            // ── Asociar tipos de producto ──────────────────────────────────────
            for (const idTipo of idsTipos) {
                await DataProducto.AddTipoProductoM(idProducto, idTipo);
            }

            // ── Subir imagen si se envió ───────────────────────────────────────
            if (imgFile) {
                const rutaImg = await uploadImageGlobal(imgFile, String(idProducto), fecha, 'Producto');
                await DataProducto.UpdateImgProductoM(rutaImg, idProducto);
            }

            res.status(200).json({
                message: 'Producto registrado exitosamente',
                idProducto,
            });
        } catch (error: any) {
            console.error('Error al agregar producto:', error);
            res.status(500).json({ error: error?.message || 'Error al registrar el Producto' });
        }
    };

    // ── PUT: actualizar un producto ────────────────────────────────────────────
    static readonly UpdateProductoC = async (req: Request, res: Response): Promise<any> => {
        try {
            const idProducto = String(req.params.idProducto);
            const {
                codigoBarra,
                nombreComercial,
                descripcion,
                precio,
                requiereReceta,
                contraindicaciones,
                viaAdministracion,
                stockMinimo,
                idLaboratorio,
                nombreLaboratorio,
                idPresentacion,
                nombrePresentacion,
            } = req.body;

            const tiposProducto = parseArray(req.body.tiposProducto);
            const principiosActivos = parseArray(req.body.principiosActivos);

            const imgFile = req.file;
            const fecha   = GetDateToday();

            // ── Validaciones ──────────────────────────────────────────────────
            const codExiste = await DataProducto.VerificarCodigoBarraUpdateM(codigoBarra, idProducto);
            if (codExiste !== 0) {
                return res.status(400).json({ error: 'El código de barra ya está registrado en otro producto' });
            }

            const idLab = await resolveLaboratorio(idLaboratorio, nombreLaboratorio);
            const idPres = await resolvePresentacion(idPresentacion, nombrePresentacion);
            const idsTipos = await resolveTipos(tiposProducto);

            if (principiosActivos.length === 0) {
                return res.status(400).json({ error: 'Debe agregar al menos un principio activo' });
            }
            if (idsTipos.length === 0) {
                return res.status(400).json({ error: 'Debe agregar al menos un tipo de producto' });
            }

            // ── Actualizar datos principales ───────────────────────────────────
            await DataProducto.UpdateProductoM({
                codigoBarra,
                nombreComercial: nombreComercial || null,
                descripcion: descripcion || null,
                precio: Number(precio),
                requiereReceta: Number(requiereReceta) || 0,
                contraindicaciones: contraindicaciones || null,
                viaAdministracion: viaAdministracion || null,
                stockMinimo: Number(stockMinimo) || 0,
                idLaboratorio: idLab,
                idPresentacion: idPres,
                img: null,
            }, idProducto);

            // ── Reemplazar principios activos ─────────────────────────────────
            await DataProducto.DeletePrincipiosProductoM(idProducto);
            for (const p of principiosActivos) {
                const id = Number(p?.idPrincipioActivo ?? 0);
                const nombre = String(p?.nombre ?? '').trim();
                const resolvedId = id > 0 ? id : await DataPrincipioActivo.FindOrCreatePrincipioM(nombre);
                await DataProducto.AddPrincipioProductoM(idProducto, resolvedId, p?.concentracion || null);
            }

            // ── Reemplazar tipos de producto ──────────────────────────────────
            await DataProducto.DeleteTiposProductoM(idProducto);
            for (const idTipo of idsTipos) {
                await DataProducto.AddTipoProductoM(idProducto, idTipo);
            }

            // ── Actualizar imagen si se envió una nueva ────────────────────────
            if (imgFile) {
                const rutaImg = await uploadImageGlobal(imgFile, idProducto, fecha, 'Producto');
                await DataProducto.UpdateImgProductoM(rutaImg, idProducto);
            }

            res.status(200).json('Producto Actualizado Exitosamente');
        } catch (error: any) {
            console.error('Error al actualizar producto:', error);
            res.status(500).json({ error: error?.message || 'Error al Actualizar el Producto' });
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