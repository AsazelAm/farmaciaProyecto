"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const AuthControllers_1 = require("../controllers/AuthControllers");
const limits_1 = require("../config/limits");
const validation_1 = require("../Middleware/validation");
const auth_1 = require("../Middleware/auth");
const router = (0, express_1.Router)();
router.post('/login', limits_1.limiter, (0, express_validator_1.body)('email').isEmail().withMessage('El Email no es valido'), (0, express_validator_1.body)('passwd').notEmpty().withMessage('El Password es obligatorio'), validation_1.handleInputErrors, AuthControllers_1.AuthControllers.Login);
// Valida el codigo de 6 digitos enviado al correo y entrega el JWT
router.post('/verificar-codigo', limits_1.limiterOtp, (0, express_validator_1.body)('email').isEmail().withMessage('El Email no es valido'), (0, express_validator_1.body)('codigo').isLength({ min: 6, max: 6 }).isNumeric().withMessage('El codigo debe tener 6 digitos'), validation_1.handleInputErrors, AuthControllers_1.AuthControllers.VerificarCodigo);
// Genera y reenvia un nuevo codigo de verificacion al correo
router.post('/reenviar-codigo', limits_1.limiterOtp, (0, express_validator_1.body)('email').isEmail().withMessage('El Email no es valido'), validation_1.handleInputErrors, AuthControllers_1.AuthControllers.ReenviarCodigo);
router.put('/reset-passwd/:idUsuario', auth_1.authenticate, (0, express_validator_1.body)('passwd').notEmpty().withMessage('El Password es obligatorio'), (0, express_validator_1.body)('adminPasswd').notEmpty().withMessage('Debes confirmar tu contraseña actual'), validation_1.handleInputErrors, AuthControllers_1.AuthControllers.ResetPasswd);
router.get('/GetUsers', auth_1.authenticate, AuthControllers_1.AuthControllers.GetAuthUser);
// Devuelve los datos completos (nombre, apellido, idSucursal, nameRol, etc.)
// del usuario actualmente logueado, identificado por el token JWT.
router.get('/GetMe', auth_1.authenticate, AuthControllers_1.AuthControllers.GetMe);
exports.default = router;
//# sourceMappingURL=AuthRoutes.js.map