import nodemailer from 'nodemailer'
import dns from 'node:dns'
import dotenv from 'dotenv'
dotenv.config()

// Preferir IPv4 al resolver smtp.gmail.com: en algunas redes el DNS devuelve
// IPv6 sin ruta y el envio falla con ENOTFOUND/ETIMEDOUT.
dns.setDefaultResultOrder('ipv4first')

// Envio por SMTP de Gmail usando una "contraseña de aplicacion"
// (requiere verificacion en dos pasos activa en la cuenta de Google).
const config = () => {
    return {
        service: "gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    }
}

export const transporter = nodemailer.createTransport(config())
