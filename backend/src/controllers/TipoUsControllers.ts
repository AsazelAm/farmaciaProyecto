import { Request, Response } from "express";
import DataTipoUs from "../Models/TipoUsModels";

export class TipoUsControllers {
    static readonly GetTipoUsC=async(req:Request,res:Response)=>{
        try{
            const data = await DataTipoUs.GetTipoUsM();
            res.status(200).json(data);
        }catch(error){
            console.error("Error al obtener el Tipo del chica: ",error);
            res.status(500).json({error:"ERROR al obtener los Tipos De Usuarion"});
        }
    }

    static readonly AddTipoUsC = async(req:Request,res:Response)=>{
        try{
            const {nameRol}=req.body;
            const data= await DataTipoUs.AddTipoUsM(nameRol);
            res.status(200).json(data);
        }catch(error){
            console.error("Error al Agregar Tipo de Usuario: ",error);
            res.status(500).json({error:"ERROR al Agregar tipo De Usuario"})
        }
    }

    static readonly UpdateTipoUsC = async(req:Request,res:Response)=>{
        try{
            const {idTipoUs}=req.params;
            const {nameRol}= req.body;
            const data = await DataTipoUs.UpdateTipoUsM(nameRol,idTipoUs);
            res.status(200).json(data); 
        }catch(error){
            console.error("Error al Agregar al Tipo de Usuario");
            res.status(500).json({error:"ERROR al Agregar el tipo de Usuario"});
        }
    }

    static readonly DeleteTipoUsC = async(req:Request,res:Response)=>{
        try{
            const {idTipoUs}=req.params;
            const data = await DataTipoUs.DeleteTipoUsM(idTipoUs);
            res.status(200).json(data);
        }catch(error){
            console.error("Error al eliminar el tipo de usuario: ",error);
            res.status(500).json({error:"ERROR al eliminar el tipo de Usuario"})
        }
    }

}