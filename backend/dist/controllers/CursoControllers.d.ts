import { Request, Response } from "express";
export declare class CursoControllers {
    /** GET /Curso  -> listado paginado con filtros */
    static list(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /** GET /Curso/:id -> detalle (base + secciones + ids de áreas/propuestas) */
    static detail(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /Curso/CreateCursoApi
     * Body: { base, secciones, areas, propuestas }
     * file?: img (multer)
     */
    static create(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PUT /Curso/:id
     * Body: { base, secciones, areas, propuestas }
     * file?: img (multer)
     */
    static update(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /** DELETE /Curso/:id -> soft delete */
    static remove(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static GetCursoCalendario(req: Request, res: Response): Promise<void>;
    static readonly ModalidadCalendario: (req: Request, res: Response) => Promise<void>;
    static readonly CityModalidad: (req: Request, res: Response) => Promise<void>;
    static readonly CreateCalendarioControllers: (req: Request, res: Response) => Promise<void>;
    static readonly GetCalendarioControllers: (req: Request, res: Response) => Promise<void>;
    static readonly DeleteCalendarioControllers: (req: Request, res: Response) => Promise<void>;
    static readonly GetCursoForCalendar: (req: Request, res: Response) => Promise<void>;
    /** GET /Curso/:id/contenido -> árbol de contenido del curso */
    static listContenido(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /** GET /Curso/:id/contenido/:contenidoId -> item individual */
    static getContenido(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /** POST /Curso/:id/contenido */
    static createContenido(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /** PUT /Curso/:id/contenido/:contenidoId */
    static updateContenido(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /** DELETE /Curso/:id/contenido/:contenidoId */
    static deleteContenido(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /** DELETE /Curso/:id/contenido  -> eliminar TODO el contenido del curso */
    static deleteAllContenido(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static createContenidoBulk(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export default CursoControllers;
