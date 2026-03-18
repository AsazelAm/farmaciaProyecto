import { Router } from "express";
import { authenticate } from "../Middleware/auth";
import { ExamenControllers } from "../controllers/ExamenControllers";

const router=Router();

router.use(authenticate);

router.get('/Get',
    ExamenControllers.GetExamen
) 

router.post('/AddExa',
    ExamenControllers.addExamen
)
router.delete('/DeteleExa/:id',
    ExamenControllers.DeleteExamencontrollers
)

router.put('/UpdateExa/:id',
    ExamenControllers.UpdateExamenControllers
)

export default router;