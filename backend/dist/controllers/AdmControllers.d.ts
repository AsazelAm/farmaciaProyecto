import { Request, Response } from "express";
export declare class ADMControllers {
    static readonly GetModalidades: (req: Request, res: Response) => Promise<void>;
    static readonly AddModalidad: (req: Request, res: Response) => Promise<void>;
    static readonly DeleteModalidad: (req: Request, res: Response) => Promise<void>;
    static readonly UpdateModControllers: (req: Request, res: Response) => Promise<void>;
    static readonly GetAreasControllers: (req: Request, res: Response) => Promise<void>;
    static readonly DeleteAreasControllers: (req: Request, res: Response) => Promise<void>;
    static readonly addAreaControllers: (req: Request, res: Response) => Promise<void>;
    static readonly UpdateAreasControllers: (req: Request, res: Response) => Promise<void>;
    static readonly GetModalidadCalendario: (req: Request, res: Response) => Promise<void>;
    static readonly GetEmpresaControllers: (req: Request, res: Response) => Promise<void>;
    static readonly GetCountryControllers: (req: Request, res: Response) => Promise<void>;
}
