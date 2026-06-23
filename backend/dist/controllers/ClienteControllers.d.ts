import { Request, Response } from "express";
export declare class ClienteControllers {
    static readonly GetClienteC: (req: Request, res: Response) => Promise<void>;
    static readonly AddClienteC: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    static readonly UpdateClienteC: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    static readonly DeleteClienteC: (req: Request, res: Response) => Promise<void>;
}
