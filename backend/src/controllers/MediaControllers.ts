
import { Request, Response } from 'express';
import {
  createMedia,
  getMediaById,
  listMedias,
  deleteMedia,
  saveUploadedFile,
} from '../Models/MediaModels';

export class MediaControllers {
  /**
   * ⭐ POST /Media/upload
   * Recibe un archivo, lo guarda y crea un registro en la BD
   * El archivo viene en req.file (multer middleware)
   */
  static async upload(req: Request, res: Response) {
    try {
      // Validar que el archivo existe
      if (!req.file) {
        return res.status(400).json({
          ok: false,
          message: 'No se envió ningún archivo',
        });
      }

      // Obtener el texto alternativo opcional
      const texto_alternativo = req.body.texto_alternativo || null;

      // Validar MIME type
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          ok: false,
          message: `Tipo de archivo no permitido. Permitidos: ${allowedMimeTypes.join(', ')}`,
        });
      }

      // Obtener baseUrl (puedes obtenerlo de variables de entorno)
      const baseUrl = process.env.BASE_URL || `http://${req.get('host')}`;

      // 1. Guardar el archivo en el servidor y obtener información
      const { fileName, ruta, url, ancho, alto } = await saveUploadedFile(
        req.file.buffer,
        req.file.mimetype,
        baseUrl
      );

      // 2. Crear registro en la base de datos
      const mediaId = await createMedia({
        bucket: 'medios', // Bucket por defecto para blog
        ruta: ruta,
        url: url,
        mime: req.file.mimetype,
        tamano_bytes: req.file.size,
        ancho: ancho,
        alto: alto,
        texto_alternativo: texto_alternativo,
      });

      console.log(`✅ Archivo subido exitosamente. ID: ${mediaId}, Nombre: ${fileName}`);

      return res.status(201).json({
        ok: true,
        message: 'Archivo subido exitosamente',
        data: {
          id: mediaId,
          bucket: 'medios',
          ruta: ruta,
          url: url,
          mime: req.file.mimetype,
          tamano_bytes: req.file.size,
          ancho: ancho,
          alto: alto,
          fileName: fileName,
        },
      });
    } catch (err: any) {
      console.error('❌ Error en upload:', err);
      return res.status(500).json({
        ok: false,
        message: err.message || 'Error al subir el archivo',
      });
    }
  }

  /**
   * GET /Media/:id
   * Obtener información de un media específico
   */
  static async detail(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const media = await getMediaById(id);

      if (!media) {
        return res.status(404).json({
          ok: false,
          message: 'Media no encontrado',
        });
      }

      return res.status(200).json({
        ok: true,
        data: media,
      });
    } catch (err: any) {
      console.error('❌ Error en detail:', err);
      return res.status(500).json({
        ok: false,
        message: 'Error al obtener media',
      });
    }
  }

  /**
   * GET /Media
   * Listar medias con filtros
   */
  static async list(req: Request, res: Response) {
    try {
      const bucket = req.query.bucket as string | undefined;
      const page = Number(req.query.page ?? 1);
      const perPage = Number(req.query.perPage ?? 20);

      const result = await listMedias({ bucket, page, perPage });
      return res.status(200).json({ ok: true, ...result });
    } catch (err: any) {
      console.error('❌ Error listMedias:', err);
      return res.status(500).json({
        ok: false,
        message: 'Error al listar medias',
      });
    }
  }

  /**
   * DELETE /Media/:id
   * Eliminar un media (y su archivo físico)
   */
  static async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await deleteMedia(id);

      return res.status(200).json({
        ok: true,
        message: 'Media eliminado correctamente',
      });
    } catch (err: any) {
      console.error('❌ Error delete Media:', err);
      return res.status(500).json({
        ok: false,
        message: err.message || 'Error al eliminar media',
      });
    }
  }
}

export default MediaControllers;