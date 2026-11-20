"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conflict = exports.notFound = exports.forbidden = exports.badRequest = exports.AppError = void 0;
/** Error de dominio con código HTTP y código de negocio estable para el front. */
class AppError extends Error {
    status;
    code;
    constructor(message, status = 409, code = 'BUSINESS_RULE') {
        super(message);
        this.name = 'AppError';
        this.status = status;
        this.code = code;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
const badRequest = (message) => new AppError(message, 400, 'VALIDATION_ERROR');
exports.badRequest = badRequest;
const forbidden = (message) => new AppError(message, 403, 'FORBIDDEN');
exports.forbidden = forbidden;
const notFound = (message) => new AppError(message, 404, 'NOT_FOUND');
exports.notFound = notFound;
const conflict = (message) => new AppError(message, 409, 'CONFLICT');
exports.conflict = conflict;
//# sourceMappingURL=errors.js.map