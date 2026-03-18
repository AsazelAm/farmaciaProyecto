import { transporter } from "../config/nodemailer"
import { plantillaContacto } from "../Helpers/PlantillaC"

interface IEmail {
    email: string
    apellido:string
    name: string
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async ( user : IEmail ) => {

        const a = plantillaContacto(user.name,user.email,user.apellido,user.token)

        const info = await transporter.sendMail({
            from: 'COGNOS-CONTACTOS',
            to: user.email,
            subject: 'COGNOS - Confirma tu cuenta',
            text: 'COGNOS - Confirma tu cuenta',
            html: a
        })

        console.log('Mensaje enviado', info.messageId)
    }

    static sendPasswordResetToken = async ( user : IEmail ) => {
        const info = await transporter.sendMail({
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
        })

        console.log('Mensaje enviado', info.messageId)
    }
}