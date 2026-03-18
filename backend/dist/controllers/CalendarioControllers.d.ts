import { Request, Response } from "express";
export declare class CalendarioControllers {
    static readonly GetViewAreas: (req: Request, res: Response) => Promise<void>;
    static readonly GetViewPro: (req: Request, res: Response) => Promise<void>;
    static readonly UpCalendarControllers: (req: Request, res: Response) => Promise<void>;
    static readonly GetCalendarioBy: (req: Request, res: Response) => Promise<void>;
}
