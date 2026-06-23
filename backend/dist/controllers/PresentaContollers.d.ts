import { Request, Response } from "express";
export declare class PresentaControllers {
    static readonly GetPresentaC: (req: Request, res: Response) => Promise<void>;
    static readonly AddPresentaC: (req: Request, res: Response) => Promise<void>;
    static readonly UpdatePresentaC: (req: Request, res: Response) => Promise<void>;
    static readonly DeletePresentaC: (req: Request, res: Response) => Promise<void>;
}
