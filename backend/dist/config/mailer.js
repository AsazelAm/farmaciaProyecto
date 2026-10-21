"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnviarCodigoLogin = void 0;
const nodemailer_1 = require("./nodemailer");
const PlantillaCodigoLogin_1 = require("../Helpers/PlantillaCodigoLogin");
// Errores de red/SMTP que si vale la pena reintentar. Un error de
// autenticacion (EAUTH) no se reintenta porque volveria a fallar igual.
const CODIGOS_REINTENTABLES = ['ECONNECTION', 'ETIMEDOUT', 'ESOCKET', 'EDNS', 'EAI_AGAIN'];
const REINTENTOS_ENVIO = 3;
const EnviarCodigoLogin = async (email, nombre, codigo) => {
    for (let intento = 1; intento <= REINTENTOS_ENVIO; intento++) {
        try {
            await nodemailer_1.transporter.sendMail({
                from: `"Farmacia Dr Osvaldo" <${process.env.MAIL_USER}>`,
                to: email,
                subject: 'Código de verificación - Inicio de sesión',
                text: `Tu código de verificación es ${codigo}. Caduca en 5 minutos.`,
                html: (0, PlantillaCodigoLogin_1.plantillaCodigoLogin)(nombre, codigo),
            });
            return;
        }
        catch (error) {
            const reintentable = CODIGOS_REINTENTABLES.includes(error?.code);
            console.error(`Envio de codigo intento ${intento}/${REINTENTOS_ENVIO} fallo (${error?.code || 'desconocido'}):`, error?.message);
            if (!reintentable || intento === REINTENTOS_ENVIO) {
                throw new Error("No se pudo enviar el correo de verificacion");
            }
            await new Promise((resolve) => setTimeout(resolve, 1000 * intento));
        }
    }
};
exports.EnviarCodigoLogin = EnviarCodigoLogin;
//# sourceMappingURL=mailer.js.map