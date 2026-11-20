import { Request, Response } from 'express';
export declare class BajaLoteVencidoControllers {
    static readonly GetLotesVencidosC: (req: Request, res: Response) => Promise<any>;
    static readonly GetProximosAVencerC: (req: Request, res: Response) => Promise<any>;
    static readonly GetBajasC: (req: Request, res: Response) => Promise<any>;
    static readonly GetBajaByIdC: (req: Request, res: Response) => Promise<any>;
    static readonly AddBajaC: (req: Request, res: Response) => Promise<any>;
    static readonly AprobarBajaC: (req: Request, res: Response) => Promise<any>;
    static readonly EjecutarBajaC: (req: Request, res: Response) => Promise<any>;
    static readonly AnularBajaC: (req: Request, res: Response) => Promise<any>;
    static readonly AjustarPerdidaC: (req: Request, res: Response) => Promise<any>;
    static readonly GetReportePerdidasC: (req: Request, res: Response) => Promise<any>;
}
