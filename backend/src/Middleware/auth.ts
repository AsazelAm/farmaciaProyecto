import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from  "../config/db"
declare global {
    namespace Express {
        interface Request {
            user?: {
                id_user: number;
                id_rol:number;
                rol:string;
            };
        }
    }
}
export const authenticate = async (req: Request, res: Response, next: NextFunction):Promise<any> => {
    const bearer = req.headers.authorization;

    if (!bearer) {
        return res.status(401).json({ error: 'No Autorizado' });
    }

    const [, token] = bearer.split(' ');
    if (!token) {
        return res.status(401).json({ error: 'Token no válido' });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: number };

        if (decoded?.id) {
            const [user] = await db.query(
                'SELECT usuario.id_usuario, usuario.id_tipo_us, tipo_us.name_rol FROM usuario JOIN tipo_us ON usuario.id_tipo_us = tipo_us.id_tipo_us WHERE usuario.id_usuario = ?',[decoded.id]
            );
            if (!user) {
                return res.status(401).json({ error: 'Usuario no encontrado' });
            }

            req.user = user;
            next();
        }
    } catch (error) {
        console.error('Error al verificar el token:', error);
        return res.status(401).json({
            error: 'Token no válido',
            message: error.message,
        });
    }
};
