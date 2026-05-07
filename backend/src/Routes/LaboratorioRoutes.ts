import { Router } from "express";
import { authenticate } from "../Middleware/auth";
import multer from "multer";
import { LaboratorioControllers } from "../controllers/LaboratorioControllers";

const router=Router();

router.use(authenticate);

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/GetLab',
    LaboratorioControllers.GetLaboraC
) 

router.post('/AddLab',
    upload.single('img'),
    LaboratorioControllers.AddLaboraC
)


router.delete('/DeleteLab/:idLaboratorio',
    LaboratorioControllers.DeleteLaboraC
)

router.put('/UpdateLab/:idLaboratorio',
    upload.single('img'),
    LaboratorioControllers.UpdateLaboraC
)

export default router;