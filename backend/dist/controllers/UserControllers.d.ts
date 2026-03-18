import { Request, Response } from "express";
export declare class UserControllers {
    static readonly GetAllUser: (req: Request, res: Response) => Promise<void>;
    static readonly CreateUserControllers: (req: Request, res: Response) => Promise<void>;
    static readonly DeleteUserControllers: (req: Request, res: Response) => Promise<void>;
    static readonly UpdateUserControllers: (req: Request, res: Response) => Promise<void>;
    static readonly Getdocentes: (req: Request, res: Response) => Promise<void>;
    static readonly GetRol: (req: Request, res: Response) => Promise<void>;
    static readonly addRolController: (req: Request, res: Response) => Promise<void>;
    static readonly DeleteRolControolers: (req: Request, res: Response) => Promise<void>;
    static readonly UpdateRolControllers: (req: Request, res: Response) => Promise<void>;
    static readonly GetAlumnosControllers: (req: Request, res: Response) => Promise<void>;
    static readonly GetCityCountryControllers: (req: Request, res: Response) => Promise<void>;
    static readonly CreateStudentsControllers: (req: Request, res: Response) => Promise<void>;
    static readonly UpdateStudentsController: (req: Request, res: Response) => Promise<void>;
}
