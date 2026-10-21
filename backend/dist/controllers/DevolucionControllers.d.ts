import { Request, Response } from 'express';
export declare class DevolucionControllers {
    static readonly GetDevolucionesVentaC: (req: Request, res: Response) => Promise<any>;
    static readonly GetDevolucionVentaByIdC: (req: Request, res: Response) => Promise<any>;
    static readonly AddDevolucionVentaC: (req: Request, res: Response) => Promise<any>;
    static readonly ResolverDevolucionVentaC: (req: Request, res: Response) => Promise<any>;
    static readonly GetDevolucionesProveedorC: (req: Request, res: Response) => Promise<any>;
    static readonly GetDevolucionProveedorByIdC: (req: Request, res: Response) => Promise<any>;
    static readonly AddDevolucionProveedorC: (req: Request, res: Response) => Promise<any>;
    static readonly ResolverDevolucionProveedorC: (req: Request, res: Response) => Promise<any>;
}
