// src/Routes/BlogRoute.ts
import { Router, Request, Response, NextFunction } from 'express';
import BlogControllers from '../controllers/BlogControllers';
import MediaControllers from '../controllers/MediaControllers';
import multer from 'multer';
import { authenticate } from '../Middleware/auth';

const router = Router();

// Helper para async handlers
const ah =
  (fn: (req: Request, res: Response) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res)).catch(next);

//  CONFIGURAR MULTER PARA RECIBIR ARCHIVOS EN MEMORIA
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  },
});

// ============================================
// RUTAS PÚBLICAS (sin autenticación)
// ============================================

/**
 * GET /Blog/tipos-componente
 * ESPECÍFICA: Debe ir ANTES que /:id
 * Obtener tipos de componente disponibles
 */
router.get('/tipos-componente', ah(BlogControllers.tiposComponente));

/**
 * GET /Blog
 * Listar blogs con filtros opcionales
 */
router.get('/', ah(BlogControllers.list));

/**
 * POST /Blog/:id/visita
 * ⭐ ESPECÍFICA: Debe ir ANTES que GET /:id
 * Incrementar visitas de un blog
 */
router.post('/:id/visita', ah(BlogControllers.visita));

/**
 * GET /Blog/:id
 * ⭐ GENÉRICA: Va al final de las rutas públicas
 * Obtener detalle completo de un blog (blog + bloques)
 */
router.get('/:id', ah(BlogControllers.detail));

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

router.use(authenticate);

/**
 * RUTAS DE MEDIA (protegidas)
 * ⭐ CRÍTICO: Las rutas de media van DESPUÉS de authenticate
 * y ANTES de las rutas genéricas protegidas
 */

/**
 * POST /Blog/media/upload
 * ⭐ ESPECÍFICA: Subir archivo de imagen
 * Debe ir ANTES que PUT /:id y DELETE /:id
 */
router.post('/media/upload', upload.single('file'), ah(MediaControllers.upload));

/**
 * GET /Blog/media/:id
 * ⭐ ESPECÍFICA: Obtener detalles de un media
 * Debe ir ANTES que PUT /:id y DELETE /:id
 */
router.get('/media/:id', ah(MediaControllers.detail));

/**
 * DELETE /Blog/media/:id
 * ⭐ ESPECÍFICA: Eliminar un media
 * Debe ir ANTES que DELETE /:id
 */
router.delete('/media/:id', ah(MediaControllers.delete));

/**
 * RUTAS GENÉRICAS PROTEGIDAS
 * ⭐ Van al FINAL porque tienen patrones más genéricos
 */

/**
 * POST /Blog
 * Crear un blog nuevo con sus bloques
 */
router.post('/', ah(BlogControllers.create));

/**
 * PUT /Blog/:id
 * Actualizar un blog existente
 */
router.put('/:id', ah(BlogControllers.update));

/**
 * DELETE /Blog/:id
 * Eliminar un blog por ID
 */
router.delete('/:id', ah(BlogControllers.remove));

export default router;