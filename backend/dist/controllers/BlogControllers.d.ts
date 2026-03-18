import { Request, Response } from 'express';
export declare class BlogControllers {
    /** GET /Blog - Listar blogs */
    static list(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /** GET /Blog/:id - Detalle completo (blog + bloques) */
    static detail(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /** POST /Blog - Crear blog + bloques */
    static create(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /** PUT /Blog/:id - Actualizar blog + bloques */
    static update(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /** DELETE /Blog/:id - Eliminar blog */
    static remove(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /** GET /Blog/tipos-componente - Obtener tipos de componente */
    static tiposComponente(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /** POST /Blog/:id/visita - Incrementar visitas */
    static visita(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export default BlogControllers;
