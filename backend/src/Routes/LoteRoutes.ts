import { Router } from 'express';
import { authenticate } from '../Middleware/auth';
import { LoteControllers } from '../controllers/LoteControllers';

const router = Router();

router.use(authenticate);

// ── GET: lista todos los lotes (soporta filtros y paginación por query) ─────
router.get('/GetLote',
    LoteControllers.GetLotesC
);

// ── GET: detalle de un lote específico ───────────────────────────────────────
router.get('/GetLote/:idLote',
    LoteControllers.GetLoteByIdC
);

export default router;