import { Request, Response } from "express";
export declare class LaboratorioControllers {
    static readonly GetLaboraC: (req: Request, res: Response) => Promise<void>;
    static readonly AddLaboraC: (req: Request, res: Response) => Promise<any>;
    static readonly UpdateLaboraC: (req: Request, res: Response) => Promise<any>;
    static readonly DeleteLaboraC: (req: Request, res: Response) => Promise<void>;
}
