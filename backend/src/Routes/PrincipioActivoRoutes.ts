import { Router } from 'express';
import { authenticate } from '../Middleware/auth';
import { PrincipioActivoControllers } from '../controllers/PrincipioActivoControllers';

const router = Router();

router.use(authenticate);

router.get('/GetPrincipioActivo',
    PrincipioActivoControllers.GetPrincipioActivoC
);

export default router;