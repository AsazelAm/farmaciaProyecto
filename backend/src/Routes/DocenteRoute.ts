import { Router } from "express";
import { authenticate } from "../Middleware/auth";
import { DocentesControllers } from "../controllers/DocenteControllers";
import multer from "multer";
import { body } from "express-validator";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

// GET - Obtener todos los docentes
router.get(
    '/GetDocente',
    authenticate,
    DocentesControllers.GetDocenteControllers
);

// GET - Obtener un docente por ID
router.get(
    '/GetDocente/:id',
    authenticate,
    DocentesControllers.GetDocenteByIdControllers
);

// GET - Obtener habilidades de un docente
router.get(
    '/habilidades/:id',
    authenticate,
    DocentesControllers.gethabilidadesDocentes
);

// POST - Crear nuevo docente
router.post(
    '/AddDocentes',
    authenticate,
    upload.fields([
        { name: 'img', maxCount: 1 },
        { name: 'cv', maxCount: 1 },
    ]),
    DocentesControllers.AddDocentesControllers
);

// PUT - Actualizar docente
router.put(
    '/UpdateDocente/:id',
    authenticate,
    upload.fields([
        { name: 'img', maxCount: 1 },
        { name: 'cv', maxCount: 1 },
    ]),
    DocentesControllers.UpdateDocenteControllers
);

// DELETE - Eliminar docente (soft delete)
router.delete(
    '/DeleteDocentes/:id',
    authenticate,
    DocentesControllers.DeleteDocenteControllers
);


//Register Docente
router.post(
    '/RegisterDocente',
    body('password').isLength({min: 8}).withMessage('El password es muy corto, minimo 6 caracteres'),
    body('password').custom((value,{req})=>{
        if(value !== req.body.confirmPassword){
                throw new Error ('los password no son iguales')
        }
        return true
    }),
    DocentesControllers.RegisterDocenteControllers
);

router.post('/Verificar/:id',
    DocentesControllers.ConfirmedDocenteControllers
)

export default router;