"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserControllers_1 = require("../controllers/UserControllers");
const multer_1 = __importDefault(require("multer"));
const express_validator_1 = require("express-validator");
const limits_1 = require("../config/limits");
const validation_1 = require("../Middleware/validation");
const router = (0, express_1.Router)();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
router.get('/GetAll', UserControllers_1.UserControllers.GetAllUser);
router.get('/GetAllId/:idUsuario', UserControllers_1.UserControllers.GetAllUserId);
router.post('/addUser', upload.single('img'), (0, express_validator_1.body)('ci').notEmpty().withMessage('El carnet de identidad es obligatorio'), (0, express_validator_1.body)('nombre').notEmpty().withMessage('El nombree Es obligatorio'), (0, express_validator_1.body)('apellido').notEmpty().withMessage('El apellido Es obligatorio'), (0, express_validator_1.body)('telefono').notEmpty().withMessage("El telefono es obligatorio"), (0, express_validator_1.body)('email').isEmail().withMessage('El Email es obligatorio'), (0, express_validator_1.body)('idTipoUs').notEmpty().withMessage('El Tipo de Usuario es Obligatorio'), (0, express_validator_1.body)('idSucursal').notEmpty().withMessage('El Sucursal el Obligatorio'), (0, express_validator_1.body)('passwd').isLength({ min: 8 }).withMessage('El password es muy corto, minimo 8 caracteres'), (0, express_validator_1.body)('passwd').custom((value, { req }) => {
    if (value !== req.body.Passwd_Confirmation) {
        throw new Error('los password no son iguales');
    }
    return true;
}), UserControllers_1.UserControllers.CreateUserControllers);
router.delete('/DeleteUser/:idUsuario', UserControllers_1.UserControllers.DeleteUserControllers);
router.put('/UpdateUser/:idUsuario', upload.single('img'), UserControllers_1.UserControllers.UpdateUserControllers);
// Valida el codigo enviado al correo tras registrar un usuario o cambiar su email.
router.post('/verificar-codigo', limits_1.limiterOtp, (0, express_validator_1.body)('email').isEmail().withMessage('El Email no es valido'), (0, express_validator_1.body)('codigo').isLength({ min: 6, max: 6 }).isNumeric().withMessage('El codigo debe tener 6 digitos'), validation_1.handleInputErrors, UserControllers_1.UserControllers.VerificarCodigoRegistro);
// Reenvia el codigo de verificacion al correo del usuario.
router.post('/reenviar-codigo', limits_1.limiterOtp, (0, express_validator_1.body)('email').isEmail().withMessage('El Email no es valido'), validation_1.handleInputErrors, UserControllers_1.UserControllers.ReenviarCodigoRegistro);
exports.default = router;
//# sourceMappingURL=UserRoutes.js.map