import { Request, Response } from 'express';
export declare class CompraLoteControllers {
    static readonly GetComprasC: (req: Request, res: Response) => Promise<any>;
    static readonly GetCompraByIdC: (req: Request, res: Response) => Promise<any>;
    static readonly AddCompraC: (req: Request, res: Response) => Promise<any>;
    static readonly UpdateCompraC: (req: Request, res: Response) => Promise<any>;
    static readonly ChangeEstadoCompraC: (req: Request, res: Response) => Promise<any>;
    static readonly GetEstadisticasC: (req: Request, res: Response) => Promise<any>;
}
