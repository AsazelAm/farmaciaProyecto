import { Request, Response } from "express";
export declare class AuthControllers {
    static readonly Login: (req: Request, res: Response) => Promise<any>;
    static readonly VerificarCodigo: (req: Request, res: Response) => Promise<any>;
    static readonly ReenviarCodigo: (req: Request, res: Response) => Promise<any>;
    static readonly ResetPasswd: (req: Request, res: Response) => Promise<any>;
    static readonly GetAuthUser: (req: Request, res: Response) => Promise<any>;
    static readonly GetMe: (req: Request, res: Response) => Promise<any>;
}
