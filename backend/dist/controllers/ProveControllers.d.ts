import { Request, Response } from "express";
export declare class ProveedorControllers {
    static readonly GetProveedorC: (req: Request, res: Response) => Promise<void>;
    static readonly AddProveedorC: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    static readonly UpdateProveedorC: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    static readonly DeleteProveedorC: (req: Request, res: Response) => Promise<void>;
}
