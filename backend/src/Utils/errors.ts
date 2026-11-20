/** Error de dominio con código HTTP y código de negocio estable para el front. */
export class AppError extends Error {
    readonly status: number;
    readonly code: string;

    constructor(message: string, status = 409, code = 'BUSINESS_RULE') {
        super(message);
        this.name = 'AppError';
        this.status = status;
        this.code = code;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export const badRequest = (message: string): AppError => new AppError(message, 400, 'VALIDATION_ERROR');
export const forbidden = (message: string): AppError => new AppError(message, 403, 'FORBIDDEN');
export const notFound = (message: string): AppError => new AppError(message, 404, 'NOT_FOUND');
export const conflict = (message: string): AppError => new AppError(message, 409, 'CONFLICT');
