import { Request, Response } from "express";
export declare class ExamenControllers {
    static readonly GetExamen: (req: Request, res: Response) => Promise<void>;
    static readonly addExamen: (req: Request, res: Response) => Promise<any>;
    static readonly DeleteExamencontrollers: (req: Request, res: Response) => Promise<void>;
    static readonly UpdateExamenControllers: (req: Request, res: Response) => Promise<any>;
}
