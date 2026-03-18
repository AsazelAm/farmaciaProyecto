import { Router } from "express";
import { authenticate } from "../Middleware/auth";
import { HabilidadesControllers } from "../controllers/HabilidadesControllers";


const router = Router()

router.use(authenticate)

router.get('/GetHabilidades',
    HabilidadesControllers.GetHabilidades
)


export default router