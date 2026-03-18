import { Router } from "express";
import { AlumnMoodleControllers } from "../controllers/AlumMoodleControllers";
import { authenticate } from "../Middleware/auth";
const router = Router()
router.use(authenticate);
router.get(
    '/GetAlumnoMoodle',
    AlumnMoodleControllers.GetAlumnMoodleController
);


export default router;