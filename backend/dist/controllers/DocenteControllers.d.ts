import { Request, Response } from "express";
export declare class DocentesControllers {
    static readonly GetDocenteControllers: (req: Request, res: Response) => Promise<any>;
    static readonly GetDocenteByIdControllers: (req: Request, res: Response) => Promise<any>;
    static readonly AddDocentesControllers: (req: Request, res: Response) => Promise<any>;
    static readonly UpdateDocenteControllers: (req: Request, res: Response) => Promise<any>;
    static readonly DeleteDocenteControllers: (req: Request, res: Response) => Promise<any>;
    static readonly gethabilidadesDocentes: (req: Request, res: Response) => Promise<any>;
}
