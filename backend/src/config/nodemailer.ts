import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()
const config = () => {
    return{
        service: "gmail",
        auth:{
            type : "OAuth2",
            user : 'cognoscapacitacionit@gmail.com',
            clientId : process.env.GOOGLE_CLIENT_ID,
            clientSecret : process.env.GOOGLE_CLIENT_SECRET,
            refreshToken : process.env.GOOGLE_REFRESH_TOKEN
        }
    }
}

export const transporter = nodemailer.createTransport(config())