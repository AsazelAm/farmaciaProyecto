"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserControllers_1 = require("../controllers/UserControllers");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
router.get('/GetAll', UserControllers_1.UserControllers.GetAllUser);
router.post('/addUser', (0, express_validator_1.body)('nombre').notEmpty().withMessage('El nombree Es obligatorio'), (0, express_validator_1.body)('apellido').notEmpty().withMessage('El apellido Es obligatorio'), (0, express_validator_1.body)('Email').isEmail().withMessage('El Email es obligatorio'), (0, express_validator_1.body)('telefono').notEmpty().withMessage("El telefono es obligatorio"), (0, express_validator_1.body)('id_city').notEmpty().withMessage('La ciudad es obligatoria'), (0, express_validator_1.body)('ci').notEmpty().withMessage('El carnet de identidad es obligatorio'), (0, express_validator_1.body)('Passwd').isLength({ min: 8 }).withMessage('El password es muy corto, minimo 8 caracteres'), (0, express_validator_1.body)('Passwd').custom((value, { req }) => {
    if (value !== req.body.Passwd_Confirmation) {
        throw new Error('los password no son iguales');
    }
    return true;
}), UserControllers_1.UserControllers.CreateUserControllers);
router.delete('/DeleteUser/:id', UserControllers_1.UserControllers.DeleteUserControllers);
router.put('/UpdateUser/:id', UserControllers_1.UserControllers.UpdateUserControllers);
//Docentes
router.get('/Docente', UserControllers_1.UserControllers.Getdocentes);
//Rol
router.get('/RolAll', UserControllers_1.UserControllers.GetRol);
router.post('/addRol', UserControllers_1.UserControllers.addRolController);
router.delete('/deleteRol/:id', UserControllers_1.UserControllers.DeleteRolControolers);
router.put('/UpdateRol/:id', UserControllers_1.UserControllers.UpdateRolControllers);
//alumnos
router.get('/Alumnos', UserControllers_1.UserControllers.GetAlumnosControllers);
router.get('/City/:id_contry', UserControllers_1.UserControllers.GetCityCountryControllers);
router.put('/UpdateStudent/:id', UserControllers_1.UserControllers.UpdateStudentsController);
router.post('/addStudents', (0, express_validator_1.body)('nombre').trim().notEmpty().withMessage('El nombre no debe estar vacio'), UserControllers_1.UserControllers.CreateStudentsControllers);
exports.default = router;
//# sourceMappingURL=UserRoutes.js.map