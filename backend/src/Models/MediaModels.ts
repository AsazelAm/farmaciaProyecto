import conectar from "../config/db"
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

// ⭐ IMPORTANTE: La ruta debe coincidir exactamente donde guardas los archivos
// Si guardas en Uploads/img/medios/, entonces aquí va igual
const UPLOAD_DIR = path.join(__dirname, '../../Uploads/img/medios/');
const BUCKET_NAME = 'medios';

export interface MediaCreate {
  bucket: string;
  ruta: string;
  url: string;
  mime: string;
  tamano_bytes: number;
  ancho?: number | null;
  alto?: number | null;
  texto_alternativo?: string | null;
}

export interface MediaData {
  id: number;
  bucket: string;
  ruta: string;
  url: string;
  mime: string;
  tamano_bytes: number;
  ancho: number | null;
  alto: number | null;
  texto_alternativo: string | null;
  creado_en: Date;
}

/**
 * ⭐ CREAR REGISTRO DE MEDIA EN LA BASE DE DATOS
 * Devuelve el ID del media creado
 */
export async function createMedia(data: MediaCreate): Promise<number> {
  const cx = await conectar.getConnection();
  try {
    const rs: any = await cx.query(
      `INSERT INTO medios 
       (bucket, ruta, url, mime, tamano_bytes, ancho, alto, texto_alternativo)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        data.bucket,
        data.ruta,
        data.url,
        data.mime,
        data.tamano_bytes,
        data.ancho ?? null,
        data.alto ?? null,
        data.texto_alternativo ?? null,
      ]
    );
    return Number(rs.insertId);
  } finally {
    cx.release();
  }
}

/**
 * ⭐ OBTENER MEDIA POR ID
 */
export async function getMediaById(id: number): Promise<MediaData | null> {
  const cx = await conectar.getConnection();
  try {
    const rows: any[] = await cx.query(
      `SELECT * FROM medios WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  } finally {
    cx.release();
  }
}

/**
 * ⭐ LISTAR MEDIAS CON FILTROS
 */
export async function listMedias(params: {
  bucket?: string;
  page?: number;
  perPage?: number;
}): Promise<{ data: MediaData[]; meta: { page: number; perPage: number; total: number } }> {
  const cx = await conectar.getConnection();
  try {
    const { bucket, page = 1, perPage = 20 } = params;
    const offset = (page - 1) * perPage;

    let where = 'WHERE 1=1';
    const values: any[] = [];

    if (bucket) {
      where += ' AND bucket = ?';
      values.push(bucket);
    }

    const rows: any[] = await cx.query(
      `SELECT * FROM medios 
       ${where}
       ORDER BY creado_en DESC
       LIMIT ? OFFSET ?`,
      [...values, perPage, offset]
    );

    const totalRows: any[] = await cx.query(
      `SELECT COUNT(*) AS total FROM medios ${where}`,
      values
    );
    const total = Number(totalRows[0]?.total ?? 0);

    return { data: rows, meta: { page, perPage, total } };
  } finally {
    cx.release();
  }
}

/**
 * ⭐ ELIMINAR MEDIA (Por ID)
 * También elimina el archivo físico del servidor
 */
export async function deleteMedia(id: number): Promise<void> {
  const cx = await conectar.getConnection();
  try {
    // 1. Obtener la ruta del archivo antes de eliminarlo de la BD
    const media = await getMediaById(id);
    if (!media) {
      throw new Error(`Media con ID ${id} no encontrada`);
    }

    // 2. Eliminar de la base de datos
    await cx.query(`DELETE FROM medios WHERE id=?`, [id]);

    // 3. Eliminar el archivo físico del servidor
    try {
      // ⭐ CORREGIDO: Usar UPLOAD_DIR en lugar de la ruta incorrecta
      const fileName = path.basename(media.ruta); // Extrae solo el nombre del archivo
      const filePath = path.join(UPLOAD_DIR, fileName);
      
      console.log(`Intentando eliminar: ${filePath}`);
      await fs.unlink(filePath);
      console.log(`Archivo eliminado: ${filePath}`);
    } catch (fileError: any) {
      console.warn(`No se pudo eliminar el archivo físico: ${fileError.message}`);
      // No lanzamos error aquí porque el registro ya fue eliminado de la BD
    }
  } finally {
    cx.release();
  }
}

/**
 * ⭐ PROCESAR Y GUARDAR ARCHIVO
 * Recibe un buffer, lo guarda en el servidor y devuelve la información
 */
export async function saveUploadedFile(
  fileBuffer: Buffer,
  mimeType: string,
  baseUrl: string = 'http://localhost:3000'
): Promise<{
  fileName: string;
  ruta: string;
  url: string;
  ancho: number | null;
  alto: number | null;
}> {
  // Generar nombre único con timestamp
  const ext = getExtensionFromMimeType(mimeType);
  const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
  const ruta = `medios/${fileName}`; // Ruta relativa para la BD
  const filePath = path.join(UPLOAD_DIR, fileName); // Ruta absoluta en el servidor

  // Asegurar que el directorio existe
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    console.log(`Directorio asegurado: ${UPLOAD_DIR}`);
  } catch (err) {
    console.error('Error creando directorio:', err);
    throw new Error('No se pudo crear el directorio de uploads');
  }

  // Guardar el archivo
  try {
    await fs.writeFile(filePath, fileBuffer);
    console.log(`Archivo guardado: ${filePath}`);
  } catch (error) {
    console.error('Error guardando archivo:', error);
    throw new Error('No se pudo guardar el archivo');
  }

  // Obtener dimensiones de la imagen usando sharp
  let ancho: number | null = null;
  let alto: number | null = null;
  try {
    const metadata = await sharp(fileBuffer).metadata();
    ancho = metadata.width ?? null;
    alto = metadata.height ?? null;
    console.log(`Dimensiones obtenidas: ${ancho}x${alto}`);
  } catch (err) {
    console.warn('No se pudo obtener dimensiones de la imagen:', err);
  }

  // Construir URL completa
  const url = `${baseUrl}/uploads/${ruta}`;

  return {
    fileName,
    ruta, // medios/blog-123456.png
    url, // http://localhost:3000/uploads/medios/blog-123456.png
    ancho,
    alto,
  };
}

/**
 * ⭐ UTILIDAD: Obtener extensión desde MIME type
 */
function getExtensionFromMimeType(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
  };
  return mimeMap[mimeType] || 'bin';
}