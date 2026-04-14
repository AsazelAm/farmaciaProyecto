import { Router } from "express";
import { UserControllers } from "../controllers/UserControllers";
import multer from "multer";
import { body } from "express-validator";

const router = Router()

const storage= multer.memoryStorage();
const upload = multer({storage});
router.get('/GetAll',
    UserControllers.GetAllUser
)

router.get('/GetAllId/:id_usuario',
    UserControllers.GetAllUserId
)

router.post('/addUser',
    upload.single('img'),
    body('ci').notEmpty().withMessage('El carnet de identidad es obligatorio'),
    body('nombre').notEmpty().withMessage('El nombree Es obligatorio'),
    body('apellido').notEmpty().withMessage('El apellido Es obligatorio'),
    body('telefono').notEmpty().withMessage("El telefono es obligatorio"),
    body('email').isEmail().withMessage('El Email es obligatorio'),
    body('id_tipo_us').notEmpty().withMessage('El Tipo de Usuario es Obligatorio'),
    body('id_tipo_sucursal').notEmpty().withMessage('El Sucursal el Obligatorio'),
    body('passwd').isLength({min: 8}).withMessage('El password es muy corto, minimo 8 caracteres'),
    body('passwd').custom((value,{req})=>{
        if(value !== req.body.Passwd_Confirmation){
            throw new Error ('los password no son iguales')
        }
        return true
    }),
    UserControllers.CreateUserControllers
)

router.delete('/DeleteUser/:id_usuario',
    UserControllers.DeleteUserControllers
)

router.put('/UpdateUser/:id_usuario',
    upload.single('img'),
    UserControllers.UpdateUserControllers
)




export default router;