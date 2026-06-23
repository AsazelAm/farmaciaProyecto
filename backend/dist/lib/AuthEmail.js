"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthEmail = void 0;
const nodemailer_1 = require("../config/nodemailer");
const PlantillaC_1 = require("../Helpers/PlantillaC");
class AuthEmail {
    static sendConfirmationEmail = async (user) => {
        const a = (0, PlantillaC_1.plantillaContacto)(user.name, user.email, user.apellido, user.token);
        const info = await nodemailer_1.transporter.sendMail({
            from: 'COGNOS-CONTACTOS',
            to: user.email,
            subject: 'COGNOS - Confirma tu cuenta',
            text: 'COGNOS - Confirma tu cuenta',
            html: a
        });
        console.log('Mensaje enviado', info.messageId);
    };
    static sendPasswordResetToken = async (user) => {
        const info = await nodemailer_1.transporter.sendMail({
            from: 'UpTask <admin@uptask.com>',
            to: user.email,
            subject: 'UpTask - Reestablece tu password',
            text: 'UpTask - Reestablece tu password',
            html: `<p>Hola: ${user.name}, has solicitado reestablecer tu password.</p>
                <p>Visita el siguiente enlace:</p>
                <a href="${process.env.FRONTEND_URL}/auth/new-password">Reestablecer Password</a>
                <p>E ingresa el código: <b>${user.token}</b></p>
                <p>Este token expira en 10 minutos</p>
            `
        });
        console.log('Mensaje enviado', info.messageId);
    };
}
exports.AuthEmail = AuthEmail;
//# sourceMappingURL=AuthEmail.js.map