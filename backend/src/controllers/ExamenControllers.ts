import { Request,Response } from "express";
import DataExamen from "../Models/ExamenModels";



export class ExamenControllers{
    static readonly GetExamen =async(req:Request,res:Response)=>{
        try{
            const data =await DataExamen.GetExamen();
            res.status(200).json(data)
        }catch(error){
            console.error("Error al obtener el Curso:",error);
            res.status(500).json({error:"Error al obtener el Curso:"})
        }
    }

    static readonly addExamen =async(req:Request,res:Response):Promise<any>=>{
        try{
            const {codigo,Examen,Curso} = req.body
            const data = await DataExamen.VerifedCode(codigo)
            if(data != 0){
                 return res.status(409).json({ error: "El código ya existe" });
            }
            const data2 = await DataExamen.AddExamenModels(Examen,codigo,Curso);
            res.status(200).json(data2)
        }catch(error){
            console.error("Error al crear Examen:",error);
            res.status(500).json({error:"Error al crear Examen:"})
        }
    }
    static readonly DeleteExamencontrollers = async(req:Request,res:Response)=>{
        try {
            const {id} = req.params
            const data = await DataExamen.DeleteExamenModels(id)
            res.status(200).json(data)
        } catch (error) {
             console.error("Error al Eliminar Examen:",error);
            res.status(500).json({error:"Error al Eliminar Examen:"})
        }
    }
    static readonly UpdateExamenControllers = async(req:Request,res:Response):Promise<any>=>{
        try{
            const {id}=req.params;
            const {Examen,codigo,Curso}=req.body;
            const data = await DataExamen.VerifedCode(codigo)
            if(data !=0){
                return res.status(409).json({error:"El codigo existe"});
            }
            const data2 =await DataExamen.UpdateExamenModels(Examen,codigo,Curso,id);
            res.status(200).json(data2);
        }catch(error){
            console.log("Error al actualizar Examen:, ",error);
            res.status(500).json({error:"Error al actualizar EL examen"});
        }
    }
}