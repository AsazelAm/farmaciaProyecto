import { Router } from "express";
import { authenticate } from "../Middleware/auth";
import { TipoProdControllers } from "../controllers/TipoProdControllers";

const router= Router();
router.use(authenticate);

router.get('/GetTipoProd',
    TipoProdControllers.GetTipoProdC
)

router.post('/AddTipoProd',
    TipoProdControllers.AddTipoProdC
)

router.put('/UpdateTipoPro/:id_tipo_prod',
    TipoProdControllers.UpdateTipoProdC
)

router.delete('/DeleteTipoProd/:id_tipo_prod',
    TipoProdControllers.DeleteTipoProdC
)
export default router;