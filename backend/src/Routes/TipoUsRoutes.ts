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

router.put('/UpdateTipoUs/:idTipoUs',
    TipoUsControllers.UpdateTipoUsC
)

router.delete('/DeleteTipoUs/:idTipoUs',
    TipoUsControllers.DeleteTipoUsC
)

export default router;