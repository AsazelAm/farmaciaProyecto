import { Request,Response } from "express";
import DataTipoProd from "../Models/TipoProdModels";

export class TipoProdControllers{
    static readonly GetTipoProdC = async(req:Request,res:Response)=>{
        try{
            const data = await DataTipoProd.GetTipoProdM();
            res.status(200).json(data);
        }catch(error){
            console.error("Error al obtener el tipo de prodcto: ",error);
            res.status(500).json({error:"Error al obtener el tipo del Producto"});
        }
    }

    static readonly AddTipoProdC = async(req:Request,res:Response)=>{
        try{
            const {nombre}=req.body;
            const data = await DataTipoProd.AddTipoProdM(nombre);
            res.status(200).json(data);
        }catch(error){
            console.error("Error al agregar un tipo de Producto: ",error);
            res.status(500).json({error:"Error al Agregar un Tipo Proyecto"});
        }
    }

    static readonly UpdateTipoProdC = async(req:Request,res:Response)=>{
        try {
            const {id_tipo_prod}=req.params;
            const {nombre}=req.body;
            const data = await DataTipoProd.UpdateTipoProdM(nombre,id_tipo_prod);
            res.status(200).json(data);
        } catch (error) {
            console.error("Error al Actualizar Tipo de Producto: ",error);
            res.status(500).json({error: "Error al actualizar el Tipo Producto"});
        }
        
    }

    static readonly DeleteTipoProdC = async(req:Request,res:Response)=>{
        try{
            const {id_tipo_prod}=req.params;
            const data = await DataTipoProd.DeleteTipoProdM(id_tipo_prod);
            res.status(200).json(data);
        }catch(error){
            console.error("Error al Eliminar Tipo Producto: ",error);
            res.status(500).json({error: "Error al eliminar al Tipo Producto"});
        }
    }
}