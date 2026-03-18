import { Request, Response } from "express";
export declare class AuthControllers {
    static readonly Login: (req: Request, res: Response) => Promise<any>;
    static readonly ResetPasswd: (req: Request, res: Response) => Promise<void>;
    static readonly GetAuthUser: (req: Request, res: Response) => Promise<any>;
}
