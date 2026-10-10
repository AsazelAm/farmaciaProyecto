import { Request, Response } from 'express';
import DataPrincipioActivo from '../Models/PrincipioActivoModels';

export class PrincipioActivoControllers {

    static readonly GetPrincipioActivoC = async (req: Request, res: Response) => {
        try {
            const data = await DataPrincipioActivo.GetPrincipioActivoM();
            res.status(200).json(data);
        } catch (error) {
            console.error('Error al obtener los principios activos:', error);
            res.status(500).json({ error: 'Error al obtener los principios activos' });
        }
    };
}