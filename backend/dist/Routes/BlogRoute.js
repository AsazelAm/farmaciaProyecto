"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/Routes/BlogRoute.ts
const express_1 = require("express");
const BlogControllers_1 = __importDefault(require("../controllers/BlogControllers"));
const MediaControllers_1 = __importDefault(require("../controllers/MediaControllers"));
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../Middleware/auth");
const router = (0, express_1.Router)();
// Helper para async handlers
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
// ⭐ CONFIGURAR MULTER PARA RECIBIR ARCHIVOS EN MEMORIA
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Tipo de archivo no permitido'));
        }
    },
});
// ============================================
// RUTAS PÚBLICAS (sin autenticación)
// ============================================
/**
 * GET /Blog/tipos-componente
 * ⭐ ESPECÍFICA: Debe ir ANTES que /:id
 * Obtener tipos de componente disponibles
 */
router.get('/tipos-componente', ah(BlogControllers_1.default.tiposComponente));
/**
 * GET /Blog
 * Listar blogs con filtros opcionales
 */
router.get('/', ah(BlogControllers_1.default.list));
/**
 * POST /Blog/:id/visita
 * ⭐ ESPECÍFICA: Debe ir ANTES que GET /:id
 * Incrementar visitas de un blog
 */
router.post('/:id/visita', ah(BlogControllers_1.default.visita));
/**
 * GET /Blog/:id
 * ⭐ GENÉRICA: Va al final de las rutas públicas
 * Obtener detalle completo de un blog (blog + bloques)
 */
router.get('/:id', ah(BlogControllers_1.default.detail));
// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================
router.use(auth_1.authenticate);
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
router.post('/media/upload', upload.single('file'), ah(MediaControllers_1.default.upload));
/**
 * GET /Blog/media/:id
 * ⭐ ESPECÍFICA: Obtener detalles de un media
 * Debe ir ANTES que PUT /:id y DELETE /:id
 */
router.get('/media/:id', ah(MediaControllers_1.default.detail));
/**
 * DELETE /Blog/media/:id
 * ⭐ ESPECÍFICA: Eliminar un media
 * Debe ir ANTES que DELETE /:id
 */
router.delete('/media/:id', ah(MediaControllers_1.default.delete));
/**
 * RUTAS GENÉRICAS PROTEGIDAS
 * ⭐ Van al FINAL porque tienen patrones más genéricos
 */
/**
 * POST /Blog
 * Crear un blog nuevo con sus bloques
 */
router.post('/', ah(BlogControllers_1.default.create));
/**
 * PUT /Blog/:id
 * Actualizar un blog existente
 */
router.put('/:id', ah(BlogControllers_1.default.update));
/**
 * DELETE /Blog/:id
 * Eliminar un blog por ID
 */
router.delete('/:id', ah(BlogControllers_1.default.remove));
exports.default = router;
//# sourceMappingURL=BlogRoute.js.map