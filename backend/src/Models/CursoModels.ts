// src/Models/CursoModels.ts
import conectar from '../config/db';

/* =========================
   Tipos
========================= */
export type SeccionClave =
  | 'audiencia'
  | 'objetivos'
  | 'prerequisitos'
  | 'certificaciones'
  | 'beneficios'
  | 'inversion';

export type SeccionesMap = Partial<Record<SeccionClave, string>>;

export interface CursoBaseCreate {
  nombre: string;          
  codigo: string;
  duracion: number;
  precio: number | null;
  descripcion?: string | null;
  img?: string | null;
}

export interface CursoBaseUpdate extends CursoBaseCreate {
  id_curso: number;
}

export interface CursoListItem {
  id_curso: number;
  n_curso: string;
  codigo: string;
  duracion: number;
  precio: number | null;
  descripcion: string | null;  
  img: string | null;
  areas: string | null;
  propuestas: string | null;
}

export interface ListMeta {
  page: number;
  perPage: number;
  total: number;
}

export interface AddCalendarioType{
  HoraIni: string;
  HoraFin:string;
  FechaIni:string;
  FechaCreacion:string;
  Dias:string;
  id_mod:number;
  id_pv:number;
  id_curso:number;
  id_user:number;
  id_city:number;
  Estado:string;
}


export interface CursoContenido {
  id_contenido: number;
  id_curso: number;
  padre_id: number | null;
  titulo: string;
  descripcion: string | null;
  orden: number;
  nivel: number;
  creado_en: Date;
  actualizado_en: Date;
}

export interface CursoContenidoCreate {
  id_curso: number;
  padre_id?: number | null;
  titulo: string;
  descripcion?: string | null;
  orden?: number;
  nivel?: number;
}

export interface CursoContenidoUpdate {
  id_contenido: number;
  id_curso: number;
  padre_id?: number | null;
  titulo?: string;
  descripcion?: string | null;
  orden?: number;
  nivel?: number;
}
export interface CursoContenidoNode extends CursoContenido {
  hijos: CursoContenidoNode[];
}

/* =========================
   PK/FK reales (AJUSTADOS A TU BD)
========================= */
// Catálogos (PK)
const AREAS_PK = 'id_areas';          // tabla: areas
const PROPUESTA_VALOR_PK = 'id_pv';   // tabla: propuesta_valor

// Tablas puente (FK)
const AREA_CURSO_FK = 'id_area';          // tabla: area_curso
const PROPUESTA_CURSO_FK = 'id_propuesta';// tabla: propuesta_curso

/* =========================
   Helpers
========================= */
function toSeccionRows(id_curso: number, map: SeccionesMap) {
  const claves: SeccionClave[] = [
    'audiencia', 'objetivos', 'prerequisitos', 'certificaciones',
    'beneficios', 'inversion'
  ];
  const rows: any[] = [];
  let i = 1;
  for (const k of claves) {
    const v = map[k];
    if (typeof v === 'string') rows.push([id_curso, k, v, i++]);
  }
  return rows;
}

function tuples(id_curso: number, ids: number[]) {
  return ids.map(id => [id_curso, id]);
}

/* =========================
   Verificaciones
========================= */
export async function codigoExiste(codigo: string): Promise<boolean> {
  const cx = await conectar.getConnection();
  try {
    const r: any[] = await cx.query(
      `SELECT 1 FROM curso WHERE codigo=? AND Estado=1 LIMIT 1`,
      [codigo]
    );
    return r.length > 0;
  } finally { cx.release(); }
}

export async function codigoExisteEnOtro(id_curso: number, codigo: string): Promise<boolean> {
  const cx = await conectar.getConnection();
  try {
    const r: any[] = await cx.query(
      `SELECT 1 FROM curso WHERE codigo=? AND id_curso<>? AND Estado=1 LIMIT 1`,
      [codigo, id_curso]
    );
    return r.length > 0;
  } finally { cx.release(); }
}

/* =========================
   CRUD Base (tabla curso)
========================= */
export async function createCursoBase(p: CursoBaseCreate): Promise<number> {
  const cx = await conectar.getConnection();
  try {
    const rs: any = await cx.query(
      `INSERT INTO curso (n_curso, codigo, duracion, precio, descripcion, img, Estado)
       VALUES (?,?,?,?,?,?,1)`,
      [p.nombre, p.codigo, p.duracion, p.precio, p.descripcion ?? null, p.img ?? null]
    );
    return Number(rs.insertId);
  } finally { cx.release(); }
}

export async function updateCursoBase(p: CursoBaseUpdate): Promise<void> {
  const cx = await conectar.getConnection();
  try {
    await cx.query(
      `UPDATE curso
         SET n_curso=?, codigo=?, duracion=?, precio=?, descripcion=?, img=COALESCE(?, img)
       WHERE id_curso=?`,
      [p.nombre, p.codigo, p.duracion, p.precio, p.descripcion ?? null, p.img ?? null, p.id_curso]
    );
  } finally { cx.release(); }
}

export async function deleteCursoSoft(id_curso: number): Promise<void> {
  const cx = await conectar.getConnection();
  try {
    await cx.query(`UPDATE curso SET Estado=0 WHERE id_curso=?`, [id_curso]);
  } finally { cx.release(); }
}

/* =========================
   Secciones (curso_seccion)
========================= */
export async function upsertSecciones(id_curso: number, secciones: SeccionesMap): Promise<void> {
  const rows = toSeccionRows(id_curso, secciones);
  if (!rows.length) return;

  const cx = await conectar.getConnection();
  try {
    // Usamos batch para múltiples filas
    await cx.batch(
      `INSERT INTO curso_seccion (id_curso, clave, contenido, orden)
       VALUES (?,?,?,?)
       ON DUPLICATE KEY UPDATE
         contenido = VALUES(contenido),
         orden     = VALUES(orden),
         updated_at = CURRENT_TIMESTAMP`,
      rows
    );
  } finally { cx.release(); }
}

export async function getSecciones(id_curso: number): Promise<SeccionesMap> {
  const cx = await conectar.getConnection();
  try {
    const rows: any[] = await cx.query(
      `SELECT clave, contenido
       FROM curso_seccion
       WHERE id_curso=?
       ORDER BY COALESCE(orden, 99), clave`,
      [id_curso]
    );
    const map: SeccionesMap = {};
    for (const r of rows) map[r.clave as SeccionClave] = r.contenido;
    return map;
  } finally { cx.release(); }
}

/* =========================
   Relaciones M:N (áreas, propuestas)
========================= */
export async function setAreas(id_curso: number, areaIds: number[]) {
  const cx = await conectar.getConnection();
  try {
    await cx.beginTransaction();
    await cx.query(`DELETE FROM area_curso WHERE id_curso=?`, [id_curso]);

    if (areaIds?.length) {
      const rows = tuples(id_curso, areaIds).map(([c,a]) => [c, a, new Date()]);
      await cx.batch(
        `INSERT INTO area_curso (id_curso, ${AREA_CURSO_FK}, created_at) VALUES (?,?,?)`,
        rows
      );
    }
    await cx.commit();
  } catch (e) { await cx.rollback(); throw e; }
  finally { cx.release(); }
}

export async function setPropuestas(id_curso: number, propuestaIds: number[]) {
  const cx = await conectar.getConnection();
  try {
    await cx.beginTransaction();
    await cx.query(`DELETE FROM propuesta_curso WHERE id_curso=?`, [id_curso]);

    if (propuestaIds?.length) {
      const rows = tuples(id_curso, propuestaIds).map(([c,p]) => [c, p, new Date()]);
      await cx.batch(
        `INSERT INTO propuesta_curso (id_curso, ${PROPUESTA_CURSO_FK}, created_at) VALUES (?,?,?)`,
        rows
      );
    }
    await cx.commit();
  } catch (e) { await cx.rollback(); throw e; }
  finally { cx.release(); }
}

export async function getAreasIds(id_curso: number): Promise<number[]> {
  const cx = await conectar.getConnection();
  try {
    const rows: any[] = await cx.query(
      `SELECT ${AREA_CURSO_FK} AS id FROM area_curso WHERE id_curso=?`,
      [id_curso]
    );
    return rows.map(r => Number(r.id));
  } finally { cx.release(); }
}

export async function getPropuestasIds(id_curso: number): Promise<number[]> {
  const cx = await conectar.getConnection();
  try {
    const rows: any[] = await cx.query(
      `SELECT ${PROPUESTA_CURSO_FK} AS id FROM propuesta_curso WHERE id_curso=?`,
      [id_curso]
    );
    return rows.map(r => Number(r.id));
  } finally { cx.release(); }
}

/* =========================
   CRUD FULL (transacción)
========================= */
export async function createCursoFull(
  base: CursoBaseCreate,
  secciones: SeccionesMap,
  areaIds: number[] = [],
  propuestaIds: number[] = []
): Promise<number> {
  const cx = await conectar.getConnection();
  try {
    await cx.beginTransaction();

    // código único
    const dup: any[] = await cx.query(
      `SELECT 1 FROM curso WHERE codigo=? AND Estado=1 LIMIT 1`,
      [base.codigo]
    );
    if (dup.length) throw new Error('El código de curso ya existe');

    // curso base
    const rs: any = await cx.query(
      `INSERT INTO curso (n_curso, codigo, duracion, precio, descripcion, img, Estado)
       VALUES (?,?,?,?,?,?,1)`,
      [base.nombre, base.codigo, base.duracion, base.precio, base.descripcion ?? null, base.img ?? null]
    );
    const id = Number(rs.insertId);

    // secciones (batch)
    const secRows = toSeccionRows(id, secciones);
    if (secRows.length) {
      await cx.batch(
        `INSERT INTO curso_seccion (id_curso, clave, contenido, orden) VALUES (?,?,?,?)`,
        secRows
      );
    }

    // relaciones M:N (batch)
    if (areaIds?.length) {
      const rows = tuples(id, areaIds).map(([c,a]) => [c, a, new Date()]);
      await cx.batch(
        `INSERT INTO area_curso (id_curso, ${AREA_CURSO_FK}, created_at) VALUES (?,?,?)`,
        rows
      );
    }
    if (propuestaIds?.length) {
      const rows = tuples(id, propuestaIds).map(([c,p]) => [c, p, new Date()]);
      await cx.batch(
        `INSERT INTO propuesta_curso (id_curso, ${PROPUESTA_CURSO_FK}, created_at) VALUES (?,?,?)`,
        rows
      );
    }

    await cx.commit();
    return id;
  } catch (e) { await cx.rollback(); throw e; }
  finally { cx.release(); }
}

export async function updateCursoFull(
  base: CursoBaseUpdate,
  secciones: SeccionesMap,
  areaIds: number[] = [],
  propuestaIds: number[] = []
): Promise<void> {
  const cx = await conectar.getConnection();
  try {
    await cx.beginTransaction();

    // código único en otro curso
    const dup: any[] = await cx.query(
      `SELECT 1 FROM curso WHERE codigo=? AND id_curso<>? AND Estado=1 LIMIT 1`,
      [base.codigo, base.id_curso]
    );
    if (dup.length) throw new Error('El código ya existe en otro curso');

    // curso base
    await cx.query(
      `UPDATE curso
         SET n_curso=?, codigo=?, duracion=?, precio=?, descripcion=?, img=COALESCE(?, img)
       WHERE id_curso=?`,
      [base.nombre, base.codigo, base.duracion, base.precio, base.descripcion ?? null, base.img ?? null, base.id_curso]
    );

    // upsert secciones (batch con ON DUPLICATE)
    const secRows = toSeccionRows(base.id_curso, secciones);
    if (secRows.length) {
      await cx.batch(
        `INSERT INTO curso_seccion (id_curso, clave, contenido, orden)
         VALUES (?,?,?,?)
         ON DUPLICATE KEY UPDATE
           contenido=VALUES(contenido),
           orden=VALUES(orden),
           updated_at=CURRENT_TIMESTAMP`,
        secRows
      );
    }

    // reset y reinsert de relaciones (batch)
    await cx.query(`DELETE FROM area_curso WHERE id_curso=?`, [base.id_curso]);
    if (areaIds?.length) {
      const rows = tuples(base.id_curso, areaIds).map(([c,a]) => [c, a, new Date()]);
      await cx.batch(
        `INSERT INTO area_curso (id_curso, ${AREA_CURSO_FK}, created_at) VALUES (?,?,?)`,
        rows
      );
    }

    await cx.query(`DELETE FROM propuesta_curso WHERE id_curso=?`, [base.id_curso]);
    if (propuestaIds?.length) {
      const rows = tuples(base.id_curso, propuestaIds).map(([c,p]) => [c, p, new Date()]);
      await cx.batch(
        `INSERT INTO propuesta_curso (id_curso, ${PROPUESTA_CURSO_FK}, created_at) VALUES (?,?,?)`,
        rows
      );
    }

    await cx.commit();
  } catch (e) { await cx.rollback(); throw e; }
  finally { cx.release(); }
}

/* =========================
   Listado y Detalle
========================= */
// src/Models/CursoModels.ts - línea ~280

export async function listCursosPaged(
  q = '', page = 1, perPage = 10
): Promise<{ data: CursoListItem[]; meta: ListMeta }> {
  const cx = await conectar.getConnection();
  try {
    const offset = (page - 1) * perPage;
    const params: any[] = [];
    let where = `WHERE c.Estado=1`;
    if (q) {
      where += ` AND (c.n_curso LIKE ? OR c.codigo LIKE ? OR c.descripcion LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    const rows: any[] = await cx.query(
      `
      SELECT 
        c.id_curso, c.n_curso, c.codigo, c.duracion, c.precio, c.descripcion, c.img,  
        GROUP_CONCAT(DISTINCT a.n_area ORDER BY a.n_area SEPARATOR ', ')   AS areas,
        GROUP_CONCAT(DISTINCT pv.nombre ORDER BY pv.nombre SEPARATOR ', ') AS propuestas
      FROM curso c
      LEFT JOIN area_curso ac      ON ac.id_curso = c.id_curso
      LEFT JOIN areas a            ON a.${AREAS_PK} = ac.${AREA_CURSO_FK}
      LEFT JOIN propuesta_curso pc ON pc.id_curso = c.id_curso
      LEFT JOIN propuesta_valor pv ON pv.${PROPUESTA_VALOR_PK} = pc.${PROPUESTA_CURSO_FK}
      ${where}
      GROUP BY c.id_curso, c.n_curso, c.codigo, c.duracion, c.precio, c.descripcion, c.img  
      ORDER BY c.id_curso DESC
      LIMIT ? OFFSET ?
      `,
      [...params, perPage, offset]
    );

    const totalRows: any[] = await cx.query(
      `SELECT COUNT(*) AS total FROM curso c ${where}`,
      params
    );
    const total = Number(totalRows?.[0]?.total ?? 0);

    return { data: rows as CursoListItem[], meta: { page, perPage, total } };
  } finally { cx.release(); }
}
export async function getCursoFull(id_curso: number) {
  const cx = await conectar.getConnection();
  try {
    const baseRows: any[] = await cx.query(
      `SELECT id_curso, n_curso, codigo, duracion, precio, descripcion, img, Estado
       FROM curso
       WHERE id_curso=? AND Estado=1
       LIMIT 1`,
      [id_curso]
    );
    const base = baseRows[0] || null;
    if (!base) return null;

    const secciones = await getSecciones(id_curso);
    const areaIds = await getAreasIds(id_curso);
    const propuestaIds = await getPropuestasIds(id_curso);

    return { base, secciones, areaIds, propuestaIds };
  } finally { cx.release(); }
}


export async function CursoCalendarioModels() {
  const cx = await conectar.getConnection();
  try {
    const rows = await cx.query(
      ` SELECT id_curso, n_curso FROM curso WHERE Estado = 1; `
    );
    return rows
  } finally { cx.release(); }
}

export async function ModaCalendario() {
  const cx = await conectar.getConnection();
  try {
    const rows = await cx.query(
      `  Select id_mod, modalidad from modalidad where Estado = 1; `
    );
    return rows
  } finally { cx.release(); }
}

export async function CityCalendario() {
  const cx = await conectar.getConnection();
  try {
    const rows = await cx.query(
      `   SELECT id_city,  city from city where Estado = 1; `
    );
    return rows
  } finally { cx.release(); }
}

export async function AddCalendarioModels(data:AddCalendarioType){
  const cx = await conectar.getConnection();
  try {
    const Results:any = await cx.query(`
      INSERT INTO calendario(Horaini,horaFin,FechaIni,FechaCreacion,Dias,modalidad,propuesta,curso,docente,city, aprobado)VALUES(?,?,?,?,?,?,?,?,?,?,?);
      `,[
        data.HoraIni,
        data.HoraFin,
        data.FechaIni,
        data.FechaCreacion,
        data.Dias,
        data.id_mod,
        data.id_pv,
        data.id_curso,
        data.id_user,
        data.id_city,
        data.Estado
      ])
      return Number(Results.insertId);

  } finally { cx.release(); }
}

export async function AddViewAreas(idCalendario,idAreas,idCurso){
  const cx = await conectar.getConnection();
  try {
     cx.query(`
      INSERT INTO ViewCursoAreas (id_calendario,id_areas, id_curso) VALUES (?,?,?);
      `,[idCalendario,idAreas,idCurso]);
  } finally { cx.release(); }
}

export async function AddViewPropuesta(idCalendario,idPv,idCurso){
  const cx = await conectar.getConnection();
  try {
     cx.query(`
      INSERT INTO ViewCursoPro (id_calendario,id_pv, id_curso) VALUES (?,?,?);
      `,[idCalendario,idPv,idCurso]);
  } finally { cx.release(); }
}

export async function GetCalendarioModals(){
  const cx = await conectar.getConnection();
  try {
    const Results = await cx.query(`
     	  SELECT 
      calendario.id_calendario,
      calendario.propuesta as id_pv,
      calendario.FechaIni,
      curso.n_curso,
      propuesta_valor.nombre,
      modalidad.modalidad,
      calendario.docente,
      calendario.modalidad as id_mod,
      country.id_country,
      calendario.city as id_city,
      calendario.aprobado as Estado,
      calendario.Horaini,
      calendario.horaFin,
      calendario.Dias,
      calendario.curso as id_curso
      from calendario
      JOIN curso ON calendario.curso = curso.id_curso
      JOIN propuesta_valor ON calendario.propuesta  = propuesta_valor.id_pv
      JOIN modalidad ON calendario.modalidad = modalidad.id_mod
      JOIN city ON calendario.city = city.id_city
      JOIN country ON city.id_country = country.id_country
      where calendario.Estado = 1
      `);
      return Results
  } finally { cx.release(); }
}

export async function DeleteCalendarioModels(id:number){
  const cx = await conectar.getConnection();
  try {
      await cx.query(`
      UPDATE calendario set Estado = 0 where id_calendario = ?;
      `,[id]);
      return "Curso desagendado"
  } finally { cx.release(); }
}

export async function GetCursoForCalendarModels(){
  const cx = await conectar.getConnection()
  try {
      const Results = await cx.query(`
      	SELECT id_curso, n_curso FROM curso WHERE Estado = 1;
      `);
      return Results
  } finally { cx.release(); }
}


/**
 * Obtiene TODO el contenido de un curso en forma de árbol
 */
export async function listCursoContenido(
  id_curso: number
): Promise<CursoContenidoNode[]> {
  const cx = await conectar.getConnection();
  try {
    const rows: any[] = await cx.query(
      `
      SELECT 
        id_contenido,
        id_curso,
        padre_id,
        titulo,
        descripcion,
        orden,
        nivel,
        creado_en,
        actualizado_en
      FROM curso_contenido
      WHERE id_curso = ?
      ORDER BY nivel ASC, orden ASC, id_contenido ASC
      `,
      [id_curso]
    );

    const map: Record<number, CursoContenidoNode> = {};
    const roots: CursoContenidoNode[] = [];

    for (const r of rows) {
      map[r.id_contenido] = {
        id_contenido : r.id_contenido,
        id_curso     : r.id_curso,
        padre_id     : r.padre_id,
        titulo       : r.titulo,
        descripcion  : r.descripcion,
        orden        : r.orden,
        nivel        : r.nivel,
        creado_en    : r.creado_en,
        actualizado_en: r.actualizado_en,
        hijos        : [],
      };
    }

    // armar árbol
    for (const node of Object.values(map)) {
      if (node.padre_id && map[node.padre_id]) {
        map[node.padre_id].hijos.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  } finally {
    cx.release();
  }
}

/**
 * Obtener un solo ítem por id
 */
export async function getCursoContenidoById(
  id_contenido: number
): Promise<CursoContenido | null> {
  const cx = await conectar.getConnection();
  try {
    const rows: any[] = await cx.query(
      `
      SELECT 
        id_contenido,
        id_curso,
        padre_id,
        titulo,
        descripcion,
        orden,
        nivel,
        creado_en,
        actualizado_en
      FROM curso_contenido
      WHERE id_contenido = ?
      LIMIT 1
      `,
      [id_contenido]
    );
    return (rows[0] as CursoContenido) || null;
  } finally {
    cx.release();
  }
}

/**
 * Crear contenido (sección, módulo, clase, etc.)
 */
export async function createCursoContenido(
  data: CursoContenidoCreate
): Promise<number> {
  const cx = await conectar.getConnection();
  try {
    const rs: any = await cx.query(
      `
      INSERT INTO curso_contenido
        (id_curso, padre_id, titulo, descripcion, orden, nivel)
      VALUES (?,?,?,?,?,?)
      `,
      [
        data.id_curso,
        data.padre_id ?? null,
        data.titulo,
        data.descripcion ?? null,
        data.orden ?? 0,
        data.nivel ?? 0,
      ]
    );
    return Number(rs.insertId);
  } finally {
    cx.release();
  }
}

/**
 * Actualizar contenido (parcial)
 */
export async function updateCursoContenido(
  data: CursoContenidoUpdate
): Promise<void> {
  const cx = await conectar.getConnection();
  try {
    // obtener valores actuales
    const rows: any[] = await cx.query(
      `
      SELECT 
        id_curso,
        padre_id,
        titulo,
        descripcion,
        orden,
        nivel
      FROM curso_contenido
      WHERE id_contenido = ? AND id_curso = ?
      LIMIT 1
      `,
      [data.id_contenido, data.id_curso]
    );

    if (!rows.length) throw new Error('Contenido no encontrado');

    const current = rows[0];

    const padre_id    = data.padre_id !== undefined ? data.padre_id : current.padre_id;
    const titulo      = data.titulo ?? current.titulo;
    const descripcion = data.descripcion !== undefined ? data.descripcion : current.descripcion;
    const orden       = data.orden ?? current.orden;
    const nivel       = data.nivel ?? current.nivel;

    await cx.query(
      `
      UPDATE curso_contenido
         SET padre_id    = ?,
             titulo      = ?,
             descripcion = ?,
             orden       = ?,
             nivel       = ?
       WHERE id_contenido = ? AND id_curso = ?
      `,
      [
        padre_id ?? null,
        titulo,
        descripcion ?? null,
        orden,
        nivel,
        data.id_contenido,
        data.id_curso,
      ]
    );
  } finally {
    cx.release();
  }
}

/**
 * Eliminar un ítem de contenido (hijos se borran en cascada)
 */
export async function deleteCursoContenido(
  id_curso: number,
  id_contenido: number
): Promise<void> {
  const cx = await conectar.getConnection();
  try {
    await cx.query(
      `DELETE FROM curso_contenido WHERE id_contenido = ? AND id_curso = ?`,
      [id_contenido, id_curso]
    );
  } finally {
    cx.release();
  }
}

/**
 * Eliminar TODO el contenido de un curso
 */
export async function deleteAllCursoContenido(
  id_curso: number
): Promise<void> {
  const cx = await conectar.getConnection();
  try {
    await cx.query(
      `DELETE FROM curso_contenido WHERE id_curso = ?`,
      [id_curso]
    );
  } finally {
    cx.release();
  }
}

export interface CursoContenidoTreeInput {
  titulo: string;
  descripcion?: string | null;
  hijos?: CursoContenidoTreeInput[];
}

export async function createCursoContenidoBulk(
  id_curso: number,
  nodes: CursoContenidoTreeInput[]
): Promise<void> {
  const cx = await conectar.getConnection();
  try {
    await cx.beginTransaction();

    await insertContenidoTree(cx, id_curso, nodes, null, 0);

    await cx.commit();
  } catch (e) {
    await cx.rollback();
    throw e;
  } finally {
    cx.release();
  }
}

async function insertContenidoTree(
  cx: any,
  id_curso: number,
  nodes: CursoContenidoTreeInput[],
  parentId: number | null,
  nivel: number
) {
  let orden = 1;

  for (const n of nodes) {
    const rs: any = await cx.query(
      `
      INSERT INTO curso_contenido
        (id_curso, padre_id, titulo, descripcion, orden, nivel)
      VALUES (?,?,?,?,?,?)
      `,
      [
        id_curso,
        parentId,
        n.titulo,
        n.descripcion ?? null,
        orden,
        nivel,
      ]
    );

    const newId = Number(rs.insertId);

    if (n.hijos && n.hijos.length > 0) {
      await insertContenidoTree(cx, id_curso, n.hijos, newId, nivel + 1);
    }

    orden++;
  }
  cx.release();
}
