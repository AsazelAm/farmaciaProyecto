"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
const authenticate = async (req, res, next) => {
    const bearer = req.headers.authorization;
    if (!bearer) {
        return res.status(401).json({ error: 'No Autorizado' });
    }
    const [, token] = bearer.split(' ');
    if (!token) {
        return res.status(401).json({ error: 'Token no válido' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decoded?.id) {
            const [user] = await db_1.default.query('SELECT user.id_user, user.id_rol, rol.name_rol  FROM user JOIN rol ON user.id_rol = rol.id_rol WHERE user.id_user = ?', [decoded.id]);
            if (!user) {
                return res.status(401).json({ error: 'Usuario no encontrado' });
            }
            req.user = user;
            next();
        }
    }
    catch (error) {
        console.error('Error al verificar el token:', error);
        return res.status(401).json({
            error: 'Token no válido',
            message: error.message,
        });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map