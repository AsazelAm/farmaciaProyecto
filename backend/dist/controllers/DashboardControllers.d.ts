import { Request, Response } from 'express';
export declare class DashboardControllers {
    static readonly GetDashboardC: (req: Request, res: Response) => Promise<any>;
    static readonly GetResumenC: (req: Request, res: Response) => Promise<any>;
    static readonly GetVentasPorMesesC: (req: Request, res: Response) => Promise<any>;
    static readonly GetProductosMasVendidosC: (req: Request, res: Response) => Promise<any>;
    static readonly GetVentasPorEstadoC: (req: Request, res: Response) => Promise<any>;
    static readonly GetVentasPorSucursalC: (req: Request, res: Response) => Promise<any>;
    static readonly GetVentasPorFormaPagoC: (req: Request, res: Response) => Promise<any>;
    static readonly GetStockBajoC: (req: Request, res: Response) => Promise<any>;
    static readonly GetLotesPorVencerC: (req: Request, res: Response) => Promise<any>;
    static readonly GetUltimasVentasC: (req: Request, res: Response) => Promise<any>;
}
