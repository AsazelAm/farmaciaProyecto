"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductoControllers = void 0;
const ProductoModels_1 = __importDefault(require("../Models/ProductoModels"));
const PrincipioActivoModels_1 = __importDefault(require("../Models/PrincipioActivoModels"));
const SaveImg_1 = require("../Middleware/SaveImg");
const Time_1 = require("../lib/Time");
// ── Utilidades de parseo ──────────────────────────────────────────────────────
// Los arrays llegan como JSON string (multipart) o como array nativo (json)
function parseArray(value) {
    if (Array.isArray(value))
        return value;
    if (typeof value === 'string' && value.trim()) {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        }
        catch {
            return [];
        }
    }
    return [];
}
// Devuelve el id de cada principio activo (existente o creado inline)
async function resolvePrincipios(principiosActivos) {
    const ids = [];
    for (const p of principiosActivos) {
        let id = Number(p?.idPrincipioActivo ?? 0);
        if (id > 0) {
            ids.push(id);
            continue;
        }
        const nombre = String(p?.nombre ?? '').trim();
        if (!nombre)
            throw new Error('Cada principio activo debe tener nombre o id');
        id = await PrincipioActivoModels_1.default.FindOrCreatePrincipioM(nombre);
        ids.push(id);
    }
    return ids;
}
// Devuelve los ids de los tipos (existentes o creados inline)
async function resolveTipos(tiposProducto) {
    const ids = [];
    for (const t of tiposProducto) {
        let id = Number(t?.idTipoProd ?? 0);
        if (id > 0) {
            if (!ids.includes(id))
                ids.push(id);
            continue;
        }
        const nombre = String(t?.nombre ?? '').trim();
        if (!nombre)
            throw new Error('Cada tipo de producto debe tener nombre o id');
        id = await ProductoModels_1.default.FindOrCreateTipoM(nombre);
        if (!ids.includes(id))
            ids.push(id);
    }
    return ids;
}
// Busca por id o crea el laboratorio por nombre
async function resolveLaboratorio(idLaboratorio, nombreLaboratorio) {
    const id = Number(idLaboratorio ?? 0);
    if (id > 0)
        return id;
    const nombre = String(nombreLaboratorio ?? '').trim();
    if (!nombre)
        throw new Error('Seleccione un laboratorio o escriba el nombre');
    return await ProductoModels_1.default.FindOrCreateLaboratorioM(nombre);
}
// Busca por id o crea la presentación por nombre
async function resolvePresentacion(idPresentacion, nombrePresentacion) {
    const id = Number(idPresentacion ?? 0);
    if (id > 0)
        return id;
    const nombre = String(nombrePresentacion ?? '').trim();
    if (!nombre)
        throw new Error('Seleccione una presentación o escriba el nombre');
    return await ProductoModels_1.default.FindOrCreatePresentacionM(nombre);
}
class ProductoControllers {
    static GetProductoC = async (req, res) => {
        try {
            const data = await ProductoModels_1.default.GetProductoM();
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error al obtener productos:', error);
            res.status(500).json({ error: 'Error al obtener los Productos' });
        }
    };
    // ── POST: crear un nuevo producto ─────────────────────────────────────────
    static AddProductoC = async (req, res) => {
        try {
            const { codigoBarra, nombreComercial, descripcion, precio, requiereReceta, contraindicaciones, viaAdministracion, stockMinimo, idLaboratorio, nombreLaboratorio, idPresentacion, nombrePresentacion, } = req.body;
            const tiposProducto = parseArray(req.body.tiposProducto);
            const principiosActivos = parseArray(req.body.principiosActivos);
            const imgFile = req.file;
            const fecha = (0, Time_1.GetDateToday)();
            // ── Validaciones ──────────────────────────────────────────────────
            const codExiste = await ProductoModels_1.default.VerificarCodigoBarraM(codigoBarra);
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
            const idProducto = await ProductoModels_1.default.AddProductoM({
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
                const resolvedId = id > 0 ? id : await PrincipioActivoModels_1.default.FindOrCreatePrincipioM(nombre);
                await ProductoModels_1.default.AddPrincipioProductoM(idProducto, resolvedId, p?.concentracion || null);
            }
            // ── Asociar tipos de producto ──────────────────────────────────────
            for (const idTipo of idsTipos) {
                await ProductoModels_1.default.AddTipoProductoM(idProducto, idTipo);
            }
            // ── Subir imagen si se envió ───────────────────────────────────────
            if (imgFile) {
                const rutaImg = await (0, SaveImg_1.uploadImageGlobal)(imgFile, String(idProducto), fecha, 'Producto');
                await ProductoModels_1.default.UpdateImgProductoM(rutaImg, idProducto);
            }
            res.status(200).json({
                message: 'Producto registrado exitosamente',
                idProducto,
            });
        }
        catch (error) {
            console.error('Error al agregar producto:', error);
            res.status(500).json({ error: error?.message || 'Error al registrar el Producto' });
        }
    };
    // ── PUT: actualizar un producto ────────────────────────────────────────────
    static UpdateProductoC = async (req, res) => {
        try {
            const idProducto = String(req.params.idProducto);
            const { codigoBarra, nombreComercial, descripcion, precio, requiereReceta, contraindicaciones, viaAdministracion, stockMinimo, idLaboratorio, nombreLaboratorio, idPresentacion, nombrePresentacion, } = req.body;
            const tiposProducto = parseArray(req.body.tiposProducto);
            const principiosActivos = parseArray(req.body.principiosActivos);
            const imgFile = req.file;
            const fecha = (0, Time_1.GetDateToday)();
            // ── Validaciones ──────────────────────────────────────────────────
            const codExiste = await ProductoModels_1.default.VerificarCodigoBarraUpdateM(codigoBarra, idProducto);
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
            await ProductoModels_1.default.UpdateProductoM({
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
            await ProductoModels_1.default.DeletePrincipiosProductoM(idProducto);
            for (const p of principiosActivos) {
                const id = Number(p?.idPrincipioActivo ?? 0);
                const nombre = String(p?.nombre ?? '').trim();
                const resolvedId = id > 0 ? id : await PrincipioActivoModels_1.default.FindOrCreatePrincipioM(nombre);
                await ProductoModels_1.default.AddPrincipioProductoM(idProducto, resolvedId, p?.concentracion || null);
            }
            // ── Reemplazar tipos de producto ──────────────────────────────────
            await ProductoModels_1.default.DeleteTiposProductoM(idProducto);
            for (const idTipo of idsTipos) {
                await ProductoModels_1.default.AddTipoProductoM(idProducto, idTipo);
            }
            // ── Actualizar imagen si se envió una nueva ────────────────────────
            if (imgFile) {
                const rutaImg = await (0, SaveImg_1.uploadImageGlobal)(imgFile, idProducto, fecha, 'Producto');
                await ProductoModels_1.default.UpdateImgProductoM(rutaImg, idProducto);
            }
            res.status(200).json('Producto Actualizado Exitosamente');
        }
        catch (error) {
            console.error('Error al actualizar producto:', error);
            res.status(500).json({ error: error?.message || 'Error al Actualizar el Producto' });
        }
    };
    // ── DELETE: desactivar un producto (soft delete) ──────────────────────────
    static DeleteProductoC = async (req, res) => {
        try {
            const idProducto = String(req.params.idProducto);
            const data = await ProductoModels_1.default.DeleteProductoM(idProducto);
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error al eliminar producto:', error);
            res.status(500).json({ error: 'Error al eliminar el Producto' });
        }
    };
}
exports.ProductoControllers = ProductoControllers;
//# sourceMappingURL=ProductoControllers.js.map