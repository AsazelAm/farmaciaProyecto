import { Router } from "express";
import { authenticate } from "../Middleware/auth";
import { PresentaControllers } from "../controllers/PresentaContollers";

const router= Router();
router.use(authenticate);

router.get('/GetPresenta',
    PresentaControllers.GetPresentaC
)

router.post('/AddPresenta',
    PresentaControllers.AddPresentaC
)

router.put('/UpdatePresenta/:idPresentacion',
    PresentaControllers.UpdatePresentaC
)

router.delete('/DeletePresenta/:idPresentacion',
    PresentaControllers.DeletePresentaC
)

export default router;