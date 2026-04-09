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
    upload.fields([
        {name: 'img', maxCount:1}
    ]),
    LaboratorioControllers.AddLaboraC
)


router.delete('/DeteleLab/:id_lab',
    LaboratorioControllers.DeleteLaboraC
)

router.put('/UpdateLab/:id_lab',
    LaboratorioControllers.UpdateLaboraC
)

export default router;