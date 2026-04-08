import { Request,Response } from "express";
import DataLabora from "../Models/LaboraModels";

export class LaboratorioControllers{

    static readonly GetLaboraC = async(req:Request, res:Response)=>{
        try{
            const data = await DataLabora.GetLaboraM();
            res.status(200).json(data);
        }catch(error){
            console.error("Error al obtener laboratorio: ", error);
            res.status(500).json({error:"Error al obtener Laboratorio"});
        }
    }

    static readonly AddLaboraC = async(req:Request,res:Response)=>{
        try{
            const {nombre,img}=req.body;
            const data = await DataLabora.AddLaboraM(nombre,img);
            res.status(200).json(data);
        }catch(error){
            console.error("Error al Agregar Un Laboratorio: ", error);
            res.status(500).json({error: "Error al Agregar Laboratorio"});
        }
    }

    static readonly UpdateLaboraC = async(req:Request,res:Response)=>{
        try{
            const {id_lab}=req.params;
            const {nombre, img}= req.body;
            const data =await DataLabora.UpdateLabM(nombre,img,id_lab);
            res.status(200).json(data);
        }catch(error){
            console.error("Error al actualizar laboratorio: ", error);
            res.status(500).json({error: "Error al Actulizar el Laboratorio"});
        }
    }

    static readonly DeleteLaboraC = async(req:Request,res:Response)=>{
        try{
            const {id_lab}=req.params;
            const data = await DataLabora.DeleteLabM(id_lab);
            res.status(200).json(data);
        }catch(error){
            console.error("Error al eliminar Un laboratorio: ",error);
            res.status(500).json({error:"Error al elimar el laboratorio"});
        }
    }
}