import { Request, Response } from 'express';
export declare class VentaControllers {
    static readonly GetVentasC: (req: Request, res: Response) => Promise<any>;
    static readonly GetVentaByIdC: (req: Request, res: Response) => Promise<any>;
    static readonly AddVentaC: (req: Request, res: Response) => Promise<any>;
    static readonly UpdateVentaC: (req: Request, res: Response) => Promise<any>;
    static readonly ChangeEstadoVentaC: (req: Request, res: Response) => Promise<any>;
    static readonly EmitirReciboC: (req: Request, res: Response) => Promise<any>;
    static readonly GetLotesDisponiblesC: (req: Request, res: Response) => Promise<any>;
    static readonly GetAlertaFEFOC: (req: Request, res: Response) => Promise<any>;
    static readonly GetEstadisticasC: (req: Request, res: Response) => Promise<any>;
}
