import { Request, Response } from "express";
import DataHabilidad from "../Models/HabilidadModels";


export class HabilidadesControllers {
    static readonly  GetHabilidades = async(req:Request,res:Response)=>{
        try {
            const data = await DataHabilidad.GetHabilidades();
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al obtener modalidad:", error);
            res.status(500).json({ error: "Error al obtener modalidad:" });
        }
    }
   
}