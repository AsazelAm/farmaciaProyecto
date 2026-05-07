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
        
            const VeriNombre = await DataLabora.VerificarNombreM(nombre);
            if(VeriNombre.exists){
                res.status(400).json({error:"El nombre del Laboratorio ya esta Registrado"});
                return ;
            }

            const id_laboratorio = await DataLabora.AddLaboraM(nombre);

            if(imgFile){
                const rutaImg =await uploadImageGlobal(imgFile, String(id_laboratorio),fecha,'Laboratorio');
                await DataLabora.UpdateRutaimg(rutaImg,id_laboratorio);
            } 
            res.status(200).json({
                message:'Laboratorio Agregado Exitosamente',
                idLaboratorio:id_laboratorio
            });
        }catch(error){
            console.error("Error al Agregar Un Laboratorio: ", error);
            res.status(500).json({error: "Error al Agregar Laboratorio"});
        }
    }

    static readonly UpdateLaboraC = async(req:Request,res:Response):Promise<any>=>{
        try{
            const {idLaboratorio}=req.params;
            const {nombre}= req.body;
            const ImgFile= req.file;
            const fecha = GetDateToday()

            const UpdaNomb = await DataLabora.VerificarUpdateNombreM(nombre,idLaboratorio);
            if(UpdaNomb !== 0){
                return res.status(400).json({error:"El nombre ya esta registrado"});
            }

            await DataLabora.UpdateLabM(idLaboratorio,nombre);

            if(ImgFile){
                const rutaImg = await uploadImageGlobal(ImgFile,String(idLaboratorio),fecha,'Laboratorio');
                await DataLabora.UpdateRutaimg(rutaImg,idLaboratorio);
            }
            res.status(200).json("Laboratorio Actualizado Exitosamente");
        }catch(error){
            console.error("Error al actualizar laboratorio: ", error);
            res.status(500).json({error: "Error al Actulizar el Laboratorio"});
        }
    }

    static readonly DeleteLaboraC = async(req:Request,res:Response)=>{
        try{
            const {idLaboratorio}=req.params;
            const data = await DataLabora.DeleteLabM(idLaboratorio);
            res.status(200).json(data);
        }catch(error){
            console.error("Error al eliminar Un laboratorio: ",error);
            res.status(500).json({error:"Error al elimar el laboratorio"});
        }
    }
}