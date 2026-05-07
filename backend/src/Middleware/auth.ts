import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from  "../config/db"
declare global {
    namespace Express {
        interface Request {
            user?: {
                idUsuario: number;
                idTipoUs:number;
                nameRol:string;
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
                'SELECT usuario.idUsuario, usuario.idTipoUs, tipous.nameRol FROM usuario JOIN tipous ON usuario.idTipoUs = tipous.idTipoUs WHERE usuario.idUsuario = ?',[decoded.id]
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
