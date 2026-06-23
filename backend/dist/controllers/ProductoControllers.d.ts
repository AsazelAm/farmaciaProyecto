import { Request, Response } from 'express';
export declare class ProductoControllers {
    static readonly GetProductoC: (req: Request, res: Response) => Promise<void>;
    static readonly AddProductoC: (req: Request, res: Response) => Promise<any>;
    static readonly UpdateProductoC: (req: Request, res: Response) => Promise<any>;
    static readonly DeleteProductoC: (req: Request, res: Response) => Promise<void>;
}
