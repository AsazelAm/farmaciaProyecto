/** Error de dominio con código HTTP y código de negocio estable para el front. */
export declare class AppError extends Error {
    readonly status: number;
    readonly code: string;
    constructor(message: string, status?: number, code?: string);
}
export declare const badRequest: (message: string) => AppError;
export declare const forbidden: (message: string) => AppError;
export declare const notFound: (message: string) => AppError;
export declare const conflict: (message: string) => AppError;
