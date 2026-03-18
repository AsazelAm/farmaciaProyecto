import { Request, Response } from "express";
export declare class CursoInscritosDocControllers {
    static readonly GetAllCursoDocControllers: (req: Request, res: Response) => Promise<void>;
    static readonly GetAlumAsisControllers: (req: Request, res: Response) => Promise<void>;
    static readonly AddAsistenAlumControllers: (req: Request, res: Response) => Promise<any>;
    static readonly UpdateAsisControllers: (req: Request, res: Response) => Promise<any>;
    static readonly UpdateFechaControllers: (req: Request, res: Response) => Promise<any>;
    static readonly GetNotaAluController: (req: Request, res: Response) => Promise<any>;
    static readonly AddNotaAluController: (req: Request, res: Response) => Promise<any>;
    static readonly UpdateNotaAluController: (req: Request, res: Response) => Promise<any>;
}
