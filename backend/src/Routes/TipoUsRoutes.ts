import { Router } from "express";
import { authenticate } from "../Middleware/auth";
import { TipoUsControllers } from "../controllers/TipoUsControllers";

const router=Router();
router.use(authenticate);

router.get('/GetTipoUs',
    TipoUsControllers.GetTipoUsC
)

router.post('/AddTipoUs',
    TipoUsControllers.AddTipoUsC
)

router.put('/UpdateTipoUs/:id_tipo_us',
    TipoUsControllers.UpdateTipoUsC
)

router.delete('/DeleteTipoUs/:id_tipo_us',
    TipoUsControllers.DeleteTipoUsC
)

export default router;