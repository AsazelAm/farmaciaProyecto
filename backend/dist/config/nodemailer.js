"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const node_dns_1 = __importDefault(require("node:dns"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Preferir IPv4 al resolver smtp.gmail.com: en algunas redes el DNS devuelve
// IPv6 sin ruta y el envio falla con ENOTFOUND/ETIMEDOUT.
node_dns_1.default.setDefaultResultOrder('ipv4first');
// Envio por SMTP de Gmail usando una "contraseña de aplicacion"
// (requiere verificacion en dos pasos activa en la cuenta de Google).
const config = () => {
    return {
        service: "gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    };
};
exports.transporter = nodemailer_1.default.createTransport(config());
//# sourceMappingURL=nodemailer.js.map