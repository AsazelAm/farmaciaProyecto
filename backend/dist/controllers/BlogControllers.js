"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogControllers = void 0;
const BlogModels_1 = require("../Models/BlogModels");
function serializeBigInt(obj) {
    if (obj === null || obj === undefined)
        return obj;
    if (typeof obj === 'bigint') {
        return obj.toString();
    }
    if (Array.isArray(obj)) {
        return obj.map(item => serializeBigInt(item));
    }
    if (typeof obj === 'object') {
        const serialized = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                serialized[key] = serializeBigInt(obj[key]);
            }
        }
        return serialized;
    }
    return obj;
}
class BlogControllers {
    /** GET /Blog - Listar blogs */
    static async list(req, res) {
        try {
            const q = req.query.q || '';
            const estado = req.query.estado;
            const pagina_slug = req.query.pagina_slug;
            const page = Number(req.query.page ?? 1);
            const perPage = Number(req.query.perPage ?? 20);
            const result = await (0, BlogModels_1.listBlogs)({ q, estado, pagina_slug, page, perPage });
            // ⭐ Serializar antes de enviar
            const serializedResult = serializeBigInt(result);
            return res.status(200).json({ ok: true, ...serializedResult });
        }
        catch (err) {
            console.error('Error listBlogs:', err);
            return res.status(500).json({ ok: false, message: 'Error al listar blogs' });
        }
    }
    /** GET /Blog/:id - Detalle completo (blog + bloques) */
    static async detail(req, res) {
        try {
            const id = Number(req.params.id);
            const data = await (0, BlogModels_1.getBlogFull)(id);
            if (!data) {
                return res.status(404).json({ ok: false, message: 'Blog no encontrado' });
            }
            // ⭐ CRÍTICO: Serializar los datos antes de devolverlos
            const serializedData = serializeBigInt(data);
            return res.status(200).json({ ok: true, data: serializedData });
        }
        catch (err) {
            console.error('Error detail Blog:', err);
            return res.status(500).json({ ok: false, message: 'Error al obtener blog' });
        }
    }
    /** POST /Blog - Crear blog + bloques */
    static async create(req, res) {
        try {
            const { blog, bloques } = req.body;
            if (!blog || !blog.slug || !blog.titulo || !blog.pagina_slug) {
                return res.status(400).json({
                    ok: false,
                    message: 'Faltan campos requeridos: slug, titulo, pagina_slug',
                });
            }
            // Obtener todos los tipos de componente de la BD
            const tipos = await (0, BlogModels_1.getTiposComponente)();
            // Crear un mapa para buscar el ID a partir del slug
            const tipoSlugToIdMap = new Map(tipos.map((t) => [t.slug, t.id]));
            // Transformar el array de bloques
            const bloquesParaDb = (bloques || []).map((b) => {
                const tipoId = tipoSlugToIdMap.get(b.tipo_slug);
                if (!tipoId) {
                    throw new Error(`El tipo de componente con slug '${b.tipo_slug}' no es válido.`);
                }
                return {
                    ...b,
                    id_tipo_componente: tipoId,
                };
            });
            const id = await (0, BlogModels_1.createBlogFull)(blog, bloquesParaDb);
            // ⭐ Serializar el ID si es BigInt
            return res.status(201).json({
                ok: true,
                message: 'Blog creado',
                id: serializeBigInt(id)
            });
        }
        catch (err) {
            console.error('Error create Blog:', err);
            if (err.message.includes('no es válido')) {
                return res.status(400).json({ ok: false, message: err.message });
            }
            return res.status(500).json({
                ok: false,
                message: err.message || 'Error al crear blog',
            });
        }
    }
    /** PUT /Blog/:id - Actualizar blog + bloques */
    static async update(req, res) {
        try {
            const id = Number(req.params.id);
            const { blog, bloques } = req.body;
            await (0, BlogModels_1.updateBlogFull)(id, blog || {}, bloques);
            return res.status(200).json({ ok: true, message: 'Blog actualizado' });
        }
        catch (err) {
            console.error('Error update Blog:', err);
            return res.status(500).json({
                ok: false,
                message: err.message || 'Error al actualizar blog',
            });
        }
    }
    /** DELETE /Blog/:id - Eliminar blog */
    static async remove(req, res) {
        try {
            const id = Number(req.params.id);
            await (0, BlogModels_1.deleteBlog)(id);
            return res.status(200).json({ ok: true, message: 'Blog eliminado' });
        }
        catch (err) {
            console.error('Error delete Blog:', err);
            return res.status(500).json({ ok: false, message: 'Error al eliminar blog' });
        }
    }
    /** GET /Blog/tipos-componente - Obtener tipos de componente */
    static async tiposComponente(req, res) {
        try {
            const tipos = await (0, BlogModels_1.getTiposComponente)();
            // ⭐ Serializar antes de enviar
            const serializedTipos = serializeBigInt(tipos);
            return res.status(200).json({ ok: true, data: serializedTipos });
        }
        catch (err) {
            console.error('Error getTiposComponente:', err);
            return res.status(500).json({ ok: false, message: 'Error al obtener tipos' });
        }
    }
    /** POST /Blog/:id/visita - Incrementar visitas */
    static async visita(req, res) {
        try {
            const id = Number(req.params.id);
            await (0, BlogModels_1.incrementVisitas)(id);
            return res.status(200).json({ ok: true });
        }
        catch (err) {
            console.error('Error incrementVisitas:', err);
            return res.status(500).json({ ok: false });
        }
    }
}
exports.BlogControllers = BlogControllers;
exports.default = BlogControllers;
//# sourceMappingURL=BlogControllers.js.map