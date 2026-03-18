import { Request, Response } from "express";
import DataAlumnoMoodle from "../Models/AlumnMoodleModels";

const convertBigIntToString = (obj: any): any => {
    if (obj === null || obj === undefined) {
        return obj;
    }
    
    // Si es BigInt, convertir a string
    if (typeof obj === 'bigint') {
        return obj.toString();
    }
    
    // Si es un array, procesar cada elemento
    if (Array.isArray(obj)) {
        return obj.map(item => convertBigIntToString(item));
    }
    
    // Si es un objeto, procesar cada propiedad
    if (typeof obj === 'object') {
        const newObj: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                newObj[key] = convertBigIntToString(obj[key]);
            }
        }
        return newObj;
    }
    
    // Para cualquier otro tipo, retornar tal cual
    return obj;
};


export class AlumnMoodleControllers {
    static readonly GetAlumnMoodleController = async (req: Request, res: Response) => {
        try {
            const data = await DataAlumnoMoodle.GetAlumnoMoodle();    
            // Convertir los datos antes de enviarlos
            const cleanData = convertBigIntToString(data);
            res.status(200).json(cleanData);
            
        } catch (error) {
            console.error("Error al obtener el AlumnoMoodle:", error);
            res.status(500).json({ error: "Error al obtener el alumnoMoodle" });
        }
    }
}