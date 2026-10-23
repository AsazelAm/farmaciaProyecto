import { Request, Response } from "express";
export declare class UserControllers {
    static readonly GetAllUser: (req: Request, res: Response) => Promise<void>;
    static readonly GetAllUserId: (req: Request, res: Response) => Promise<void>;
    static readonly CreateUserControllers: (req: Request, res: Response) => Promise<any>;
    static readonly DeleteUserControllers: (req: Request, res: Response) => Promise<void>;
    static readonly UpdateUserControllers: (req: Request, res: Response) => Promise<any>;
    static readonly VerificarCodigoRegistro: (req: Request, res: Response) => Promise<any>;
    static readonly ReenviarCodigoRegistro: (req: Request, res: Response) => Promise<any>;
}
