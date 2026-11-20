"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoles = exports.ROLES_GESTION_BAJAS = void 0;
/** Roles con permisos de escritura sobre bajas de lotes vencidos. */
exports.ROLES_GESTION_BAJAS = ['Admin', 'EncargadoInventario'];
/**
 * Middleware de autorización por rol. Debe ir DESPUÉS de `authenticate`.
 * La tabla `tipous.nameRol` del proyecto usa exactamente estos valores.
 */
const requireRoles = (...roles) => (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ status: 'error', message: 'No Autorizado' });
        return;
    }
    if (!roles.includes(req.user.nameRol)) {
        res.status(403).json({
            status: 'error',
            code: 'FORBIDDEN',
            message: `Rol "${req.user.nameRol}" sin permiso para esta operación.`,
        });
        return;
    }
    next();
};
exports.requireRoles = requireRoles;
//# sourceMappingURL=roles.js.map