"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnviarCodigoRegistro = exports.EnviarCodigoLogin = void 0;
const nodemailer_1 = require("./nodemailer");
const PlantillaCodigoLogin_1 = require("../Helpers/PlantillaCodigoLogin");
// Errores de red/SMTP que si vale la pena reintentar. Un error de
// autenticacion (EAUTH) no se reintenta porque volveria a fallar igual.
const CODIGOS_REINTENTABLES = ['ECONNECTION', 'ETIMEDOUT', 'ESOCKET', 'EDNS', 'EAI_AGAIN'];
const REINTENTOS_ENVIO = 3;
const enviarCorreo = async ({ email, nombre, codigo, subject, mensaje, nota, text }) => {
    for (let intento = 1; intento <= REINTENTOS_ENVIO; intento++) {
        try {
            await nodemailer_1.transporter.sendMail({
                from: `"Farmacia Dr Osvaldo" <${process.env.MAIL_USER}>`,
                to: email,
                subject,
                text,
                html: (0, PlantillaCodigoLogin_1.plantillaCodigoLogin)(nombre, codigo, { mensaje, nota }),
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
const EnviarCodigoLogin = async (email, nombre, codigo) => {
    await enviarCorreo({
        email,
        nombre,
        codigo,
        subject: 'Código de verificación - Inicio de sesión',
        text: `Tu código de verificación es ${codigo}. Caduca en 5 minutos.`,
    });
};
exports.EnviarCodigoLogin = EnviarCodigoLogin;
// Se usa al registrar un usuario y al cambiar su correo: en ambos casos la
// cuenta queda pendiente (confirmed = 0) hasta que se valide este codigo.
const EnviarCodigoRegistro = async (email, nombre, codigo) => {
    await enviarCorreo({
        email,
        nombre,
        codigo,
        subject: 'Verifica tu cuenta - Código de verificación',
        mensaje: 'recibiste este correo porque se registro una cuenta en el sistema. Ingresa el siguiente codigo para verificar tu correo:',
        nota: 'Si no reconoces este registro, ignora este correo. Nunca compartas este codigo con nadie.',
        text: `Tu código de verificación es ${codigo}. Caduca en 5 minutos.`,
    });
};
exports.EnviarCodigoRegistro = EnviarCodigoRegistro;
//# sourceMappingURL=mailer.js.map