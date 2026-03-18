import { Request, Response } from "express";
export declare class PvControllers {
    static readonly GetAllPvControllers: (req: Request, res: Response) => Promise<void>;
    static readonly AddPv: (req: Request, res: Response) => Promise<void>;
    static readonly deletePv: (req: Request, res: Response) => Promise<void>;
    static readonly UpdatePvControllers: (req: Request, res: Response) => Promise<void>;
    static readonly GetPvCalendario: (req: Request, res: Response) => Promise<void>;
    static readonly UpdatePvEstaController: (req: Request, res: Response) => Promise<void>;
}
