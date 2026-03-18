import { Request, Response } from "express";
import DataADM from "../Models/ADMModels";


export class ADMControllers {
    static readonly  GetModalidades = async(req:Request,res:Response)=>{
        try {
            const data = await DataADM.GetModalidades();
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al obtener modalidad:", error);
            res.status(500).json({ error: "Error al obtener modalidad:" });
        }
    }

    static readonly AddModalidad = async (req:Request, res:Response)=>{
        try {
            const {modalidad} = req.body
            const data = await DataADM.AddModalidadSchema(modalidad);
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al registrar una nueva modalidad:", error);
            res.status(500).json({ error: "Error al registrar una nueva modalidad:" });
        }
    }
    static readonly DeleteModalidad = async(req:Request,res:Response)=>{
        try {
            const {id} = req.params
            const data = await DataADM.DeleteModalidad(id);
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al eliminar la modalidad:", error);
            res.status(500).json({ error: "Error al eliminar la modalidad:" }); 
        }
    }
    static readonly UpdateModControllers = async(req:Request,res:Response)=>{
        try {
            const {id} = req.params
            const {modalidad} = req.body
            const data = await DataADM.UpdateModalidad(modalidad,id);
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al eliminar la modalidad:", error);
            res.status(500).json({ error: "Error al eliminar la modalidad:" }); 
        }
    }
    static readonly GetAreasControllers = async(req:Request,res:Response)=>{
        try {
            const data = await DataADM.GetAreasDeConocimineto();
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al obtener areas de conocimiento:", error);
            res.status(500).json({ error: "Error al obtener areas de conocimiento:" }); 
        }
    }
    static readonly DeleteAreasControllers = async(req:Request,res:Response)=>{
        try {
            const {id} = req.params
            const data = await DataADM.DeleteAreas(id);
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al eliminar el area:", error);
            res.status(500).json({ error: "Error al eliminar el area:" }); 
        }
    }
    static readonly addAreaControllers = async(req:Request,res:Response)=>{
        try {
            const {n_area} = req.body
            const data = await DataADM.AddAreasModels(n_area)
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al agregar el area:", error);
            res.status(500).json({ error: "Error al agregar el area:" }); 
        }
    }
    static readonly UpdateAreasControllers = async (req:Request,res:Response)=>{
        try {
            const {id} = req.params
            const {n_area} = req.body
            const data = await DataADM.UpdateAreasModels(id,n_area);
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al actualizar area:", error);
            res.status(500).json({ error: "Error al actualizar area:" }); 
        }
    }
    static readonly  GetModalidadCalendario = async(req:Request,res:Response)=>{
        try {
            const data = await DataADM.GetModalidades();
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al obtener modalidad:", error);
            res.status(500).json({ error: "Error al obtener modalidad:" });
        }
    }   
     static readonly  GetEmpresaControllers = async(req:Request,res:Response)=>{
        try {
            const data = await DataADM.GetEmpresaAll();
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al obtener modalidad:", error);
            res.status(500).json({ error: "Error al obtener modalidad:" });
        }
    }  

    static readonly GetCountryControllers = async (req:Request,res:Response)=>{
        try {
            const data =await DataADM.GetCountryModels();
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al actualizar el Pais:", error);
            res.status(500).json({ error: "Error al actualizar el rol:" }); 
        }
    }
}
