import { Request, Response } from 'express';
export declare class ReporteControllers {
    static readonly GetDatosReporteC: (req: Request, res: Response) => Promise<any>;
    static readonly DescargarExcelC: (req: Request, res: Response) => Promise<any>;
    static readonly DescargarPdfC: (req: Request, res: Response) => Promise<any>;
}
