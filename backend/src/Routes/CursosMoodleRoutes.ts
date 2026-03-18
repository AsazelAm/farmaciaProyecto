import { Router } from "express";
import { CursMoodleControllers } from "../controllers/CursMoodleControllers";
import { authenticate } from "../Middleware/auth";
const router = Router()
router.use(authenticate);
router.get(
    '/GetCursoMoodle',
    CursMoodleControllers.GetCurMoodleController
);


export default router;