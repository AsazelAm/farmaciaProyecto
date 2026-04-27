import { Router } from "express";
import { body } from "express-validator";
import { AuthControllers } from "../controllers/AuthControllers";
import { limiter } from "../config/limits";
import { handleInputErrors } from "../Middleware/validation";
import { authenticate } from "../Middleware/auth";

const router = Router()

router.post('/login',
    limiter,
    body('email').isEmail().withMessage('El Email no es valido'),
    body('passwd').notEmpty().withMessage('El Password es obligatorio'),
    handleInputErrors,
    AuthControllers.Login
)

router.put('/reset-passwd/:id_usuario',
    authenticate,
    AuthControllers.ResetPasswd
)

router.get('/GetUsers',
    authenticate,
    AuthControllers.GetAuthUser
)


export default router