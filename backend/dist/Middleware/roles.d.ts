import { Request, Response, NextFunction } from 'express';
export type Role = 'Admin' | 'EncargadoInventario' | 'VendedorFarmaceutico';
/** Roles con permisos de escritura sobre bajas de lotes vencidos. */
export declare const ROLES_GESTION_BAJAS: Role[];
/**
 * Middleware de autorización por rol. Debe ir DESPUÉS de `authenticate`.
 * La tabla `tipous.nameRol` del proyecto usa exactamente estos valores.
 */
export declare const requireRoles: (...roles: Role[]) => (req: Request, res: Response, next: NextFunction) => void;
