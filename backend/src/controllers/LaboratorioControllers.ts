import { Request,Response } from "express";
import DataLabora from "../Models/LaboraModels";
import { uploadImageGlobal } from "../Middleware/SaveImg";
import { GetDateToday } from "../lib/Time";

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

    static readonly AddLaboraC = async(req:Request,res:Response):Promise<any>=>{
        try{
            const files = req.file;
            const imgFile = files;
            const {nombre}=req.body;
            const fecha=GetDateToday();
            
            const id_laboratorio = await DataLabora.AddLaboraM(nombre);

            if(imgFile){
                const rutaImg =await uploadImageGlobal(imgFile, String(id_laboratorio),fecha,'Laboratorio');
                await DataLabora.UpdateRutaimg(rutaImg,id_laboratorio);
            } 
            res.status(200).json({
                message:'Laboratorio Agregado Exitosamente',
                id_laboratorio:id_laboratorio
            });
        }catch(error){
            console.error("Error al Agregar Un Laboratorio: ", error);
            res.status(500).json({error: "Error al Agregar Laboratorio"});
        }
    }

    static readonly UpdateLaboraC = async(req:Request,res:Response):Promise<any>=>{
        try{
            const {id_lab}=req.params;
            const {nombre}= req.body;
            const ImgFile= req.file;
            const fecha = GetDateToday()

            await DataLabora.UpdateLabM(id_lab,nombre);

            if(ImgFile){
                const rutaImg = await uploadImageGlobal(ImgFile,String(id_lab),fecha,'Laboratorio');
                await DataLabora.UpdateRutaimg(rutaImg,id_lab);
            }
            res.status(200).json("Laboratorio Actualizado Exitosamente");
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