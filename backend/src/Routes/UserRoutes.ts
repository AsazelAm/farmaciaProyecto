import { Router } from "express";
import { UserControllers } from "../controllers/UserControllers";
import { body } from "express-validator";

const router = Router()

router.get('/GetAll',
    UserControllers.GetAllUser
)

router.post('/addUser',
    body('nombre').notEmpty().withMessage('El nombree Es obligatorio'),
    body('apellido').notEmpty().withMessage('El apellido Es obligatorio'),
    body('Email').isEmail().withMessage('El Email es obligatorio'),
    body('telefono').notEmpty().withMessage("El telefono es obligatorio"),
    body('id_city').notEmpty().withMessage('La ciudad es obligatoria'),
    body('ci').notEmpty().withMessage('El carnet de identidad es obligatorio'),
    body('Passwd').isLength({min: 8}).withMessage('El password es muy corto, minimo 8 caracteres'),
    body('Passwd').custom((value,{req})=>{
        if(value !== req.body.Passwd_Confirmation){
            throw new Error ('los password no son iguales')
        }
        return true
    }),
    UserControllers.CreateUserControllers
)

router.delete('/DeleteUser/:id',
    UserControllers.DeleteUserControllers
)

router.put('/UpdateUser/:id',
    UserControllers.UpdateUserControllers
)

//Docentes
router.get('/Docente',
    UserControllers.Getdocentes
)


//Rol

router.get('/RolAll',
    UserControllers.GetRol
)
router.post('/addRol',
    UserControllers.addRolController
)
router.delete('/deleteRol/:id',
    UserControllers.DeleteRolControolers
)
router.put('/UpdateRol/:id',
    UserControllers.UpdateRolControllers
)
//alumnos
router.get('/Alumnos',
    UserControllers.GetAlumnosControllers
)

router.get('/City/:id_contry',
    UserControllers.GetCityCountryControllers
)

router.put('/UpdateStudent/:id',
    UserControllers.UpdateStudentsController
)

router.post('/addStudents',
    body('nombre').trim().notEmpty().withMessage('El nombre no debe estar vacio'),
    UserControllers.CreateStudentsControllers
)




export default router