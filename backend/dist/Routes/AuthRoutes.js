"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const AuthControllers_1 = require("../controllers/AuthControllers");
const limits_1 = require("../config/limits");
const validation_1 = require("../Middleware/validation");
const auth_1 = require("../Middleware/auth");
const router = (0, express_1.Router)();
router.post('/login', limits_1.limiter, (0, express_validator_1.body)('Email').isEmail().withMessage('El Email no es valido'), (0, express_validator_1.body)('Passwd').notEmpty().withMessage('El Password es obligatorio'), validation_1.handleInputErrors, AuthControllers_1.AuthControllers.Login);
router.put('/reset-passwd/:id', auth_1.authenticate, AuthControllers_1.AuthControllers.ResetPasswd);
router.get('/GetUsers', auth_1.authenticate, AuthControllers_1.AuthControllers.GetAuthUser);
exports.default = router;
//# sourceMappingURL=AuthRoutes.js.map