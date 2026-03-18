// src/Models/BlogModels.ts
import conectar from '../config/db';

/* ============================================
   TIPOS
============================================ */
export interface BlogBase {
  slug: string;
  titulo: string;
  subtitulo?: string | null;
  pagina_slug: string;
  resumen?: string | null;
  estado: 'borrador' | 'publicado' | 'archivado';
  publicado_en?: Date | null;
  id_media_portada?: number | null;
  creado_por?: number | null;
}

export interface BlogCreate extends BlogBase {}

export interface BlogUpdate extends Partial<BlogBase> {
  id: number;
}

export interface BloqueData {
  id_tipo_componente: number;
  posicion: number;
  contenido_json: any; // JSON object
  id_media?: number | null;
  activo?: boolean;
}

export interface BlogListItem {
  id: number;
  slug: string;
  titulo: string;
  subtitulo: string | null;
  estado: string;
  visitas: number;
  publicado_en: Date | null;
  creado_en: Date;
  portada_url: string | null;
  creador_nombre: string | null;
}

/* ============================================
   CRUD BASE - BLOGS
============================================ */

/** Crear blog base (sin bloques) */
export async function createBlogBase(data: BlogCreate): Promise<number> {
  const cx = await conectar.getConnection();
  try {
    const rs: any = await cx.query(
      `INSERT INTO blogs 
       (slug, titulo, subtitulo, pagina_slug, resumen, estado, publicado_en, id_media_portada, creado_por)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        data.slug,
        data.titulo,
        data.subtitulo ?? null,
        data.pagina_slug,
        data.resumen ?? null,
        data.estado,
        data.publicado_en ?? null,
        data.id_media_portada ?? null,
        data.creado_por ?? null,
      ]
    );
    return Number(rs.insertId);
  } finally {
    cx.release();
  }
}

/** Actualizar blog base */
export async function updateBlogBase(data: BlogUpdate): Promise<void> {
  const cx = await conectar.getConnection();
  try {
    const fields: string[] = [];
    const values: any[] = [];

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

    if (fields.length === 0) return;

    values.push(data.id);
    await cx.query(`UPDATE blogs SET ${fields.join(', ')} WHERE id=?`, values);
  } finally {
    cx.release();
  }
}

/** Eliminar blog (CASCADE eliminará bloques) */
export async function deleteBlog(id: number): Promise<void> {
  const cx = await conectar.getConnection(); // Asumiendo que 'conectar' es tu pool de conexiones
  try {
    const result: any = await cx.query(
      `UPDATE blogs SET estado = 'eliminado' WHERE id = ?`, 
      [id]
    );

    // Opcional: Verificar si se afectó alguna fila
    if (result.affectedRows === 0) {
        // Podrías lanzar un error si el blog no se encontró
        // throw new Error(`Blog con ID ${id} no encontrado.`);
    }

  } catch (error) {
    // Es buena práctica re-lanzar el error para que el controlador lo maneje
    throw error;
  } finally {
    // Asegúrate de liberar la conexión, ¡esto es vital!
    cx.release();
  }
}

/** Obtener blog por ID con info completa */
export async function getBlogById(id: number) {
  const cx = await conectar.getConnection();
  try {
    const rows: any[] = await cx.query(
      `SELECT 
        b.*,
        m.url AS portada_url,
        u.nombre AS creador_nombre
       FROM blogs b
       LEFT JOIN medios m ON m.id = b.id_media_portada
       LEFT JOIN user u ON u.id_user = b.creado_por
       WHERE b.id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  } finally {
    cx.release();
  }
}

/** Listar blogs con filtros */
export async function listBlogs(params: {
  q?: string;
  estado?: string;
  pagina_slug?: string;
  page?: number;
  perPage?: number;
}) {
  const cx = await conectar.getConnection();
  try {
    const { q = '', estado, pagina_slug, page = 1, perPage = 20 } = params;
    const offset = (page - 1) * perPage;

    let where ="WHERE b.estado != 'eliminado'";
    const values: any[] = [];

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

    const rows: any[] = await cx.query(
      `SELECT 
        b.id, b.slug, b.titulo, b.subtitulo, b.estado, b.visitas, 
        b.publicado_en, b.creado_en,
        m.url AS portada_url,
        u.nombre AS creador_nombre
       FROM blogs b
       LEFT JOIN medios m ON m.id = b.id_media_portada
       LEFT JOIN user u ON u.id_user = b.creado_por
       ${where}
       ORDER BY b.creado_en DESC
       LIMIT ? OFFSET ?`,
      [...values, perPage, offset]
    );

    // 💡 PASO CLAVE: Mapear las filas para convertir BigInt a String
    const processedRows = rows.map((row: any) => ({
      ...row,
      // `id` (BIGINT) se convierte a String para la serialización a JSON
      id: String(row.id), 
      // `id_media_portada` también puede ser BIGINT y debe convertirse si existe
      id_media_portada: row.id_media_portada ? String(row.id_media_portada) : row.id_media_portada,
    }));

    const totalRows: any[] = await cx.query(
      `SELECT COUNT(*) AS total FROM blogs b ${where}`,
      values
    );
    const total = Number(totalRows[0]?.total ?? 0);

    // Devolvemos los resultados ya procesados
    return { data: processedRows as BlogListItem[], meta: { page, perPage, total } };
  } finally {
    cx.release();
  }
}
/* ============================================
   BLOQUES
============================================ */

/** Crear bloques en batch */
export async function createBloques(id_blog: number, bloques: BloqueData[]): Promise<void> {
  if (!bloques || bloques.length === 0) return;

  const cx = await conectar.getConnection();
  try {
    const rows = bloques.map((b) => [
      id_blog,
      b.id_tipo_componente,
      b.posicion,
      JSON.stringify(b.contenido_json),
      b.id_media ?? null,
      b.activo !== false ? 1 : 0,
    ]);

    await cx.batch(
      `INSERT INTO bloques_blog 
       (id_blog, id_tipo_componente, posicion, contenido_json, id_media, activo)
       VALUES (?,?,?,?,?,?)`,
      rows
    );
  } finally {
    cx.release();
  }
}

/** Reemplazar todos los bloques de un blog */
export async function replaceBloques(id_blog: number, bloques: BloqueData[]): Promise<void> {
  const cx = await conectar.getConnection();
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

      await cx.batch(
        `INSERT INTO bloques_blog 
         (id_blog, id_tipo_componente, posicion, contenido_json, id_media, activo)
         VALUES (?,?,?,?,?,?)`,
        rows
      );
    }

    await cx.commit();
  } catch (e) {
    await cx.rollback();
    throw e;
  } finally {
    cx.release();
  }
}

/** Obtener bloques de un blog */
export async function getBloquesByBlog(id_blog: number) {
  const cx = await conectar.getConnection();
  try {
    const rows: any[] = await cx.query(
      `SELECT 
        bb.*,
        tc.nombre AS tipo_nombre,
        tc.slug AS tipo_slug,
        m.url AS media_url
       FROM bloques_blog bb
       INNER JOIN tipos_componente tc ON tc.id = bb.id_tipo_componente
       LEFT JOIN medios m ON m.id = bb.id_media
       WHERE bb.id_blog = ?
       ORDER BY bb.posicion ASC`,
      [id_blog]
    );
    return rows;
  } finally {
    cx.release();
  }
}

/* ============================================
   TRANSACCIONAL: CRUD COMPLETO
============================================ */

/** Crear blog + bloques */
export async function createBlogFull(
  blogData: BlogCreate,
  bloques: BloqueData[]
): Promise<number> {
  const cx = await conectar.getConnection();
  try {
    await cx.beginTransaction();

    // 1. Crear blog
    const rs: any = await cx.query(
      `INSERT INTO blogs 
       (slug, titulo, subtitulo, pagina_slug, resumen, estado, publicado_en, id_media_portada, creado_por)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        blogData.slug,
        blogData.titulo,
        blogData.subtitulo ?? null,
        blogData.pagina_slug,
        blogData.resumen ?? null,
        blogData.estado,
        blogData.publicado_en ?? null,
        blogData.id_media_portada ?? null,
        blogData.creado_por ?? null,
      ]
    );
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

      await cx.batch(
        `INSERT INTO bloques_blog 
         (id_blog, id_tipo_componente, posicion, contenido_json, id_media, activo)
         VALUES (?,?,?,?,?,?)`,
        rows
      );
    }

    await cx.commit();
    return id;
  } catch (e) {
    await cx.rollback();
    throw e;
  } finally {
    cx.release();
  }
}



/** Actualizar blog + bloques */
export async function updateBlogFull(
  id: number,
  blogData: Partial<BlogBase>,
  bloques?: BloqueData[]
): Promise<void> {
  const cx = await conectar.getConnection();
  try {
    await cx.beginTransaction();

    // 1. Actualizar base
    const fields: string[] = [];
    const values: any[] = [];

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

        await cx.batch(
          `INSERT INTO bloques_blog 
           (id_blog, id_tipo_componente, posicion, contenido_json, id_media, activo)
           VALUES (?,?,?,?,?,?)`,
          rows
        );
      }
    }

    await cx.commit();
  } catch (e) {
    await cx.rollback();
    throw e;
  } finally {
    cx.release();
  }
}

/** Obtener blog completo (base + bloques) */
export async function getBlogFull(id: number) {
  const cx = await conectar.getConnection();
  try {
    const blog: any = await getBlogById(id);
    if (!blog) return null;

    const bloques = await getBloquesByBlog(id);

    return { blog, bloques };
  } finally {
    cx.release();
  }
}

/* ============================================
   TIPOS DE COMPONENTE
============================================ */
export async function getTiposComponente() {
  const cx = await conectar.getConnection();
  try {
    const rows: any[] = await cx.query(
      `SELECT * FROM tipos_componente ORDER BY nombre ASC`
    );
    return rows;
  } finally {
    cx.release();
  }
}

/* ============================================
   INCREMENTAR VISITAS
============================================ */
export async function incrementVisitas(id: number): Promise<void> {
  const cx = await conectar.getConnection();
  try {
    await cx.query(`UPDATE blogs SET visitas = visitas + 1 WHERE id=?`, [id]);
  } finally {
    cx.release();
  }
}