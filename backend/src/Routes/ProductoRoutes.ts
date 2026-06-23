import { Router } from 'express';
import { authenticate } from '../Middleware/auth';
import multer from 'multer';
import { ProductoControllers } from '../controllers/ProductoControllers';

const router = Router();

// ── Autenticación requerida en todas las rutas ────────────────────────────────
router.use(authenticate);

// ── Multer en memoria (igual que LaboratorioRoutes) ───────────────────────────
const storage = multer.memoryStorage();
const upload  = multer({ storage });

// ── GET: lista todos los productos activos ────────────────────────────────────
router.get('/GetProducto',
    ProductoControllers.GetProductoC
);

// ── POST: crear producto (con imagen opcional) ────────────────────────────────
router.post('/AddProducto',
    upload.single('img'),
    ProductoControllers.AddProductoC
);

// ── PUT: actualizar producto (con imagen opcional) ────────────────────────────
router.put('/UpdateProducto/:idProducto',
    upload.single('img'),
    ProductoControllers.UpdateProductoC
);

// ── DELETE: desactivar producto ───────────────────────────────────────────────
router.delete('/DeleteProducto/:idProducto',
    ProductoControllers.DeleteProductoC
);

export default router;
