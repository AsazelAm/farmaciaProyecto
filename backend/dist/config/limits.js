"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.limiterOtp = exports.limiter = void 0;
const express_rate_limit_1 = require("express-rate-limit");
exports.limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 1000,
    limit: 3,
    message: { "error": "Has alcanzado el limite de intentos de login, espera un minuto antes de volver a intentarlo" }
});
// Limiter propio para las rutas de verificacion/reenvio de codigo (OTP),
// asi el limite de /login no se comparte con la pantalla de codigo.
exports.limiterOtp = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 1000,
    limit: 10,
    message: { "error": "Has alcanzado el limite de intentos de verificacion de codigo, espera un minuto antes de volver a intentarlo" }
});
//# sourceMappingURL=limits.js.map