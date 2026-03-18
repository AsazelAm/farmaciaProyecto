import { Request, Response } from 'express';
export declare class MediaControllers {
    /**
     * ⭐ POST /Media/upload
     * Recibe un archivo, lo guarda y crea un registro en la BD
     * El archivo viene en req.file (multer middleware)
     */
    static upload(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /Media/:id
     * Obtener información de un media específico
     */
    static detail(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /Media
     * Listar medias con filtros
     */
    static list(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * DELETE /Media/:id
     * Eliminar un media (y su archivo físico)
     */
    static delete(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export default MediaControllers;
