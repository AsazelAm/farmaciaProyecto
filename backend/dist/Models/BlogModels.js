"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBlogBase = createBlogBase;
exports.updateBlogBase = updateBlogBase;
exports.deleteBlog = deleteBlog;
exports.getBlogById = getBlogById;
exports.listBlogs = listBlogs;
exports.createBloques = createBloques;
exports.replaceBloques = replaceBloques;
exports.getBloquesByBlog = getBloquesByBlog;
exports.createBlogFull = createBlogFull;
exports.updateBlogFull = updateBlogFull;
exports.getBlogFull = getBlogFull;
exports.getTiposComponente = getTiposComponente;
exports.incrementVisitas = incrementVisitas;
// src/Models/BlogModels.ts
const db_1 = __importDefault(require("../config/db"));
/* ============================================
   CRUD BASE - BLOGS
============================================ */
/** Crear blog base (sin bloques) */
async function createBlogBase(data) {
    const cx = await db_1.default.getConnection();
    try {
        const rs = await cx.query(`INSERT INTO blogs 
       (slug, titulo, subtitulo, pagina_slug, resumen, estado, publicado_en, id_media_portada, creado_por)
       VALUES (?,?,?,?,?,?,?,?,?)`, [
            data.slug,
            data.titulo,
            data.subtitulo ?? null,
            data.pagina_slug,
            data.resumen ?? null,
            data.estado,
            data.publicado_en ?? null,
            data.id_media_portada ?? null,
            data.creado_por ?? null,
        ]);
        return Number(rs.insertId);
    }
    finally {
        cx.release();
    }
}
/** Actualizar blog base */
async function updateBlogBase(data) {
    const cx = await db_1.default.getConnection();
    try {
        const fields = [];
        const values = [];
        if (data.slug !== undefined) {
            fields.push('slug=?');
            values.push(data.slug);
        }
        if (data.titulo !== undefined) {
            fields.push('titulo=?');
            values.push(data.titulo);
        }
        if (data.subtitulo !== undefined) {
            fields.push('subtitulo=?');
            values.push(data.subtitulo);
        }
        if (data.pagina_slug !== undefined) {
            fields.push('pagina_slug=?');
            values.push(data.pagina_slug);
        }
        if (data.resumen !== undefined) {
            fields.push('resumen=?');
            values.push(data.resumen);
        }
        if (data.estado !== undefined) {
            fields.push('estado=?');
            values.push(data.estado);
        }
        if (data.publicado_en !== undefined) {
            fields.push('publicado_en=?');
            values.push(data.publicado_en);
        }
        if (data.id_media_portada !== undefined) {
            fields.push('id_media_portada=?');
            values.push(data.id_media_portada);
        }
        if (fields.length === 0)
            return;
        values.push(data.id);
        await cx.query(`UPDATE blogs SET ${fields.join(', ')} WHERE id=?`, values);
    }
    finally {
        cx.release();
    }
}
/** Eliminar blog (CASCADE eliminará bloques) */
async function deleteBlog(id) {
    const cx = await db_1.default.getConnection(); // Asumiendo que 'conectar' es tu pool de conexiones
    try {
        const result = await cx.query(`UPDATE blogs SET estado = 'eliminado' WHERE id = ?`, [id]);
        // Opcional: Verificar si se afectó alguna fila
        if (result.affectedRows === 0) {
            // Podrías lanzar un error si el blog no se encontró
            // throw new Error(`Blog con ID ${id} no encontrado.`);
        }
    }
    catch (error) {
        // Es buena práctica re-lanzar el error para que el controlador lo maneje
        throw error;
    }
    finally {
        // Asegúrate de liberar la conexión, ¡esto es vital!
        cx.release();
    }
}
/** Obtener blog por ID con info completa */
async function getBlogById(id) {
    const cx = await db_1.default.getConnection();
    try {
        const rows = await cx.query(`SELECT 
        b.*,
        m.url AS portada_url,
        u.nombre AS creador_nombre
       FROM blogs b
       LEFT JOIN medios m ON m.id = b.id_media_portada
       LEFT JOIN user u ON u.id_user = b.creado_por
       WHERE b.id = ?
       LIMIT 1`, [id]);
        return rows[0] || null;
    }
    finally {
        cx.release();
    }
}
/** Listar blogs con filtros */
async function listBlogs(params) {
    const cx = await db_1.default.getConnection();
    try {
        const { q = '', estado, pagina_slug, page = 1, perPage = 20 } = params;
        const offset = (page - 1) * perPage;
        let where = "WHERE b.estado != 'eliminado'";
        const values = [];
        if (q) {
            where += ' AND (b.titulo LIKE ? OR b.subtitulo LIKE ? OR b.resumen LIKE ?)';
            values.push(`%${q}%`, `%${q}%`, `%${q}%`);
        }
        if (estado) {
            where += ' AND b.estado = ?';
            values.push(estado);
        }
        if (pagina_slug) {
            where += ' AND b.pagina_slug = ?';
            values.push(pagina_slug);
        }
        const rows = await cx.query(`SELECT 
        b.id, b.slug, b.titulo, b.subtitulo, b.estado, b.visitas, 
        b.publicado_en, b.creado_en,
        m.url AS portada_url,
        u.nombre AS creador_nombre
       FROM blogs b
       LEFT JOIN medios m ON m.id = b.id_media_portada
       LEFT JOIN user u ON u.id_user = b.creado_por
       ${where}
       ORDER BY b.creado_en DESC
       LIMIT ? OFFSET ?`, [...values, perPage, offset]);
        // 💡 PASO CLAVE: Mapear las filas para convertir BigInt a String
        const processedRows = rows.map((row) => ({
            ...row,
            // `id` (BIGINT) se convierte a String para la serialización a JSON
            id: String(row.id),
            // `id_media_portada` también puede ser BIGINT y debe convertirse si existe
            id_media_portada: row.id_media_portada ? String(row.id_media_portada) : row.id_media_portada,
        }));
        const totalRows = await cx.query(`SELECT COUNT(*) AS total FROM blogs b ${where}`, values);
        const total = Number(totalRows[0]?.total ?? 0);
        // Devolvemos los resultados ya procesados
        return { data: processedRows, meta: { page, perPage, total } };
    }
    finally {
        cx.release();
    }
}
/* ============================================
   BLOQUES
============================================ */
/** Crear bloques en batch */
async function createBloques(id_blog, bloques) {
    if (!bloques || bloques.length === 0)
        return;
    const cx = await db_1.default.getConnection();
    try {
        const rows = bloques.map((b) => [
            id_blog,
            b.id_tipo_componente,
            b.posicion,
            JSON.stringify(b.contenido_json),
            b.id_media ?? null,
            b.activo !== false ? 1 : 0,
        ]);
        await cx.batch(`INSERT INTO bloques_blog 
       (id_blog, id_tipo_componente, posicion, contenido_json, id_media, activo)
       VALUES (?,?,?,?,?,?)`, rows);
    }
    finally {
        cx.release();
    }
}
/** Reemplazar todos los bloques de un blog */
async function replaceBloques(id_blog, bloques) {
    const cx = await db_1.default.getConnection();
    try {
        await cx.beginTransaction();
        // Eliminar bloques existentes
        await cx.query(`DELETE FROM bloques_blog WHERE id_blog=?`, [id_blog]);
        // Insertar nuevos
        if (bloques && bloques.length > 0) {
            const rows = bloques.map((b) => [
                id_blog,
                b.id_tipo_componente,
                b.posicion,
                JSON.stringify(b.contenido_json),
                b.id_media ?? null,
                b.activo !== false ? 1 : 0,
            ]);
            await cx.batch(`INSERT INTO bloques_blog 
         (id_blog, id_tipo_componente, posicion, contenido_json, id_media, activo)
         VALUES (?,?,?,?,?,?)`, rows);
        }
        await cx.commit();
    }
    catch (e) {
        await cx.rollback();
        throw e;
    }
    finally {
        cx.release();
    }
}
/** Obtener bloques de un blog */
async function getBloquesByBlog(id_blog) {
    const cx = await db_1.default.getConnection();
    try {
        const rows = await cx.query(`SELECT 
        bb.*,
        tc.nombre AS tipo_nombre,
        tc.slug AS tipo_slug,
        m.url AS media_url
       FROM bloques_blog bb
       INNER JOIN tipos_componente tc ON tc.id = bb.id_tipo_componente
       LEFT JOIN medios m ON m.id = bb.id_media
       WHERE bb.id_blog = ?
       ORDER BY bb.posicion ASC`, [id_blog]);
        return rows;
    }
    finally {
        cx.release();
    }
}
/* ============================================
   TRANSACCIONAL: CRUD COMPLETO
============================================ */
/** Crear blog + bloques */
async function createBlogFull(blogData, bloques) {
    const cx = await db_1.default.getConnection();
    try {
        await cx.beginTransaction();
        // 1. Crear blog
        const rs = await cx.query(`INSERT INTO blogs 
       (slug, titulo, subtitulo, pagina_slug, resumen, estado, publicado_en, id_media_portada, creado_por)
       VALUES (?,?,?,?,?,?,?,?,?)`, [
            blogData.slug,
            blogData.titulo,
            blogData.subtitulo ?? null,
            blogData.pagina_slug,
            blogData.resumen ?? null,
            blogData.estado,
            blogData.publicado_en ?? null,
            blogData.id_media_portada ?? null,
            blogData.creado_por ?? null,
        ]);
        const id = Number(rs.insertId);
        // 2. Insertar bloques
        if (bloques && bloques.length > 0) {
            const rows = bloques.map((b) => [
                id,
                b.id_tipo_componente,
                b.posicion,
                JSON.stringify(b.contenido_json),
                b.id_media ?? null,
                b.activo !== false ? 1 : 0,
            ]);
            await cx.batch(`INSERT INTO bloques_blog 
         (id_blog, id_tipo_componente, posicion, contenido_json, id_media, activo)
         VALUES (?,?,?,?,?,?)`, rows);
        }
        await cx.commit();
        return id;
    }
    catch (e) {
        await cx.rollback();
        throw e;
    }
    finally {
        cx.release();
    }
}
/** Actualizar blog + bloques */
async function updateBlogFull(id, blogData, bloques) {
    const cx = await db_1.default.getConnection();
    try {
        await cx.beginTransaction();
        // 1. Actualizar base
        const fields = [];
        const values = [];
        if (blogData.slug !== undefined) {
            fields.push('slug=?');
            values.push(blogData.slug);
        }
        if (blogData.titulo !== undefined) {
            fields.push('titulo=?');
            values.push(blogData.titulo);
        }
        if (blogData.subtitulo !== undefined) {
            fields.push('subtitulo=?');
            values.push(blogData.subtitulo);
        }
        if (blogData.pagina_slug !== undefined) {
            fields.push('pagina_slug=?');
            values.push(blogData.pagina_slug);
        }
        if (blogData.resumen !== undefined) {
            fields.push('resumen=?');
            values.push(blogData.resumen);
        }
        if (blogData.estado !== undefined) {
            fields.push('estado=?');
            values.push(blogData.estado);
        }
        if (blogData.publicado_en !== undefined) {
            fields.push('publicado_en=?');
            values.push(blogData.publicado_en);
        }
        if (blogData.id_media_portada !== undefined) {
            fields.push('id_media_portada=?');
            values.push(blogData.id_media_portada);
        }
        if (fields.length > 0) {
            values.push(id);
            await cx.query(`UPDATE blogs SET ${fields.join(', ')} WHERE id=?`, values);
        }
        // 2. Reemplazar bloques si se enviaron
        if (bloques !== undefined) {
            await cx.query(`DELETE FROM bloques_blog WHERE id_blog=?`, [id]);
            if (bloques.length > 0) {
                const rows = bloques.map((b) => [
                    id,
                    b.id_tipo_componente,
                    b.posicion,
                    JSON.stringify(b.contenido_json),
                    b.id_media ?? null,
                    b.activo !== false ? 1 : 0,
                ]);
                await cx.batch(`INSERT INTO bloques_blog 
           (id_blog, id_tipo_componente, posicion, contenido_json, id_media, activo)
           VALUES (?,?,?,?,?,?)`, rows);
            }
        }
        await cx.commit();
    }
    catch (e) {
        await cx.rollback();
        throw e;
    }
    finally {
        cx.release();
    }
}
/** Obtener blog completo (base + bloques) */
async function getBlogFull(id) {
    const cx = await db_1.default.getConnection();
    try {
        const blog = await getBlogById(id);
        if (!blog)
            return null;
        const bloques = await getBloquesByBlog(id);
        return { blog, bloques };
    }
    finally {
        cx.release();
    }
}
/* ============================================
   TIPOS DE COMPONENTE
============================================ */
async function getTiposComponente() {
    const cx = await db_1.default.getConnection();
    try {
        const rows = await cx.query(`SELECT * FROM tipos_componente ORDER BY nombre ASC`);
        return rows;
    }
    finally {
        cx.release();
    }
}
/* ============================================
   INCREMENTAR VISITAS
============================================ */
async function incrementVisitas(id) {
    const cx = await db_1.default.getConnection();
    try {
        await cx.query(`UPDATE blogs SET visitas = visitas + 1 WHERE id=?`, [id]);
    }
    finally {
        cx.release();
    }
}
//# sourceMappingURL=BlogModels.js.map