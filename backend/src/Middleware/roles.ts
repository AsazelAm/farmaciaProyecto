import { Request, Response, NextFunction } from 'express';

// Roles activos en tipous del dump dbfarmacia19-11-2026 (versión definitiva).
export type Role = 'Admin' | 'EncargadoInventario' | 'VendedorFarmaceutico';

/** Roles con permisos de escritura sobre bajas de lotes vencidos. */
export const ROLES_GESTION_BAJAS: Role[] = ['Admin', 'EncargadoInventario'];

/**
 * Middleware de autorización por rol. Debe ir DESPUÉS de `authenticate`.
 * La tabla `tipous.nameRol` del proyecto usa exactamente estos valores.
 */
export const requireRoles = (...roles: Role[]) =>
    (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ status: 'error', message: 'No Autorizado' });
            return;
        }
        if (!roles.includes(req.user.nameRol as Role)) {
            res.status(403).json({
                status: 'error',
                code: 'FORBIDDEN',
                message: `Rol "${req.user.nameRol}" sin permiso para esta operación.`,
            });
            return;
        }
        next();
    };
