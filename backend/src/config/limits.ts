import {rateLimit} from "express-rate-limit";

export const limiter = rateLimit({
    windowMs: 60 *  1000,
    limit: 3,
    message:{"error":"Has alcanzado el limite de intentos de login, espera un minuto antes de volver a intentarlo"}
})

// Limiter propio para las rutas de verificacion/reenvio de codigo (OTP),
// asi el limite de /login no se comparte con la pantalla de codigo.
export const limiterOtp = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    message:{"error":"Has alcanzado el limite de intentos de verificacion de codigo, espera un minuto antes de volver a intentarlo"}
})