import { Request,Response } from "express"; 
import DataPresentacion from "../Models/PresentaModels";

export class PresentaControllers{
    static readonly GetPresentaC =async(req:Request,res:Response)=>{
        try{
            const data =await DataPresentacion.GetPresentaM();
            res.status(200).json(data);
        }catch(error){
            console.error("Error al Obtener Presentacion: ",error);
            res.status(500).json({error:"ERROR al obtener la Presentacion"});
        }
    }

    static readonly AddPresentaC=async(req:Request,res:Response)=>{
        try {
            const {nombre} =req.body;
            const data = await DataPresentacion.AddPresentaM(nombre);
            res.status(200).json(data);
        } catch (error) {
            console.error("Error al Registrar Presentacion: ",error);
            res.status(500).json({error:"ERROR al registrar Presentacion"})
        }
        
    }

    static readonly UpdatePresentaC= async(req:Request,res:Response)=>{
        try{
            const {id_presentacion}=req.params;
            const {nombre}=req.body;
            const data= await DataPresentacion.UpdatePresentaM(nombre,id_presentacion);
            res.status(200).json(data);
        }catch(error){
            console.error("Error al Actualizar Presentacion: ",error);
            res.status(500).json({error:"ERROR al actualizar Presentacion"});
        }
    }

    static readonly DeletePresentaC= async(req:Request,res:Response)=>{
         try{
            const {id_presentacion}=req.params;
            const data = await DataPresentacion.DeletePresentaM(id_presentacion);
            res.status(200).json(data);
         }catch(error){
            console.error("Error al Eliminar Presentacion: ",error);
            res.status(500).json({error:"ERROR al Eliminar Presentacion"});
         }
    }
}