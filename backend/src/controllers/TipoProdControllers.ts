import { Request,Response } from "express";
import DataTipoProd from "../Models/TipoProdModels";

export class TipoProdControllers{
    static readonly GetTipoProdC = async(req:Request,res:Response)=>{
        try{
            const data = await DataTipoProd.GetTipoProdM();
            res.status(200).json(data);
        }catch(error){
            console.error("Error al obtener el tipo de prodcto: ",error);
            res.status(500).json({error:"ERROR al obtener el tipo del Producto"});
        }
    }

    static readonly AddTipoProdC = async(req:Request,res:Response)=>{
        try{
            const {nombre}=req.body;
            const data = await DataTipoProd.AddTipoProdM(nombre);
            res.status(200).json(data);
        }catch(error){
            console.error("Error al agregar un tipo de Producto: ",error);
            res.status(500).json({error:"ERROR al Agregar un Tipo Proyecto"});
        }
    }

    static readonly UpdateTipoProdC = async(req:Request,res:Response)=>{
        try {
            const {idTipoProd}=req.params;
            const {nombre}=req.body;
            const data = await DataTipoProd.UpdateTipoProdM(nombre,idTipoProd);
            res.status(200).json(data);
        } catch (error) {
            console.error("Error al Actualizar Tipo de Producto: ",error);
            res.status(500).json({error: "ERROR al actualizar el Tipo Producto"});
        }
        
    }

    static readonly DeleteTipoProdC = async(req:Request,res:Response)=>{
        try{
            const {idTipoProd}=req.params;
            const data = await DataTipoProd.DeleteTipoProdM(idTipoProd);
            res.status(200).json(data);
        }catch(error){
            console.error("Error al Eliminar Tipo Producto: ",error);
            res.status(500).json({error: "ERROR al eliminar al Tipo Producto"});
        }
    }
}