import { Router } from 'express';
import { authenticate } from '../Middleware/auth';
import { DevolucionControllers } from '../controllers/DevolucionControllers';

const router = Router();

router.use(authenticate);

// ═════════════ DEVOLUCIONES DE VENTA ═════════════
// OJO: las rutas fijas deben ir ANTES de las que usan /:id para evitar colisiones.
router.get('/GetDevolucionesVenta', DevolucionControllers.GetDevolucionesVentaC);
router.get('/GetDevolucionVenta/:idDevolucionVenta', DevolucionControllers.GetDevolucionVentaByIdC);
router.post('/AddDevolucionVenta', DevolucionControllers.AddDevolucionVentaC);
router.patch('/ResolverDevolucionVenta/:idDevolucionVenta', DevolucionControllers.ResolverDevolucionVentaC);

// ═════════════ DEVOLUCIONES A PROVEEDOR ═════════════
router.get('/GetDevolucionesProveedor', DevolucionControllers.GetDevolucionesProveedorC);
router.get('/GetDevolucionProveedor/:idDevolucionProveedor', DevolucionControllers.GetDevolucionProveedorByIdC);
router.post('/AddDevolucionProveedor', DevolucionControllers.AddDevolucionProveedorC);
router.patch('/ResolverDevolucionProveedor/:idDevolucionProveedor', DevolucionControllers.ResolverDevolucionProveedorC);

export default router;
