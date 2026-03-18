import { Request,Response } from "express";
import CursInsDocModels from "../Models/CursoInscDocModels";


export class CursoInscritosDocControllers{
    static readonly GetAllCursoDocControllers=async(req:Request,res:Response)=>{
        try{
            const {id}=req.params;
            const data=await CursInsDocModels.GetCursDocAll(id);
            console.log(" Datos obtenidos:", data); 
            res.status(200).json(data)
        }catch(error){
            console.error("Error al obtener los Curso Asignados al docente:",error);
            res.status(500).json({error:"Erro al obtener Curso Asignados"})
        }
    }

    static readonly GetAlumAsisControllers=async(req:Request,res:Response)=>{
        try{
            const {id_cal}=req.params;
            console.log("id del calendario",id_cal);
            const data=await CursInsDocModels.GetAlumAsis(id_cal);
            console.log("Datos Obtenidos:",data);
            res.status(200).json(data);
        }catch(error){
            console.error("Error al obtener los alumnos y asistencias:",error);
            res.status(500).json({error:"Error al obtener los alumnos y asistencias"})
        }
    }

    static readonly AddAsistenAlumControllers=async(req:Request,res:Response):Promise<any>=>{
        try{
            const {fecha_asistencia,id_user,id_calendario}=req.body;
            const data=await CursInsDocModels.AddAsistencia(fecha_asistencia,id_user,id_calendario);
            console.log("Datos Obtenidos:",data);
            res.status(200).json(data);
        }catch(error){
            console.error("Error al crear Asistencia:",error);
            res.status(500).json({error:"Error al crear Asistencia"})
        }
    }

    static readonly UpdateAsisControllers=async(req:Request,res:Response):Promise<any>=>{
        try{
            const {id}=req.params;
            const {asistencia,fecha_asistencia,id_user,id_calendario}=req.body;
            console.log("📥 Datos recibidos en Controller:", { asistencia, fecha_asistencia, id_user, id_calendario });
            const data = await CursInsDocModels.UpdateAsis(asistencia,fecha_asistencia,id_user,id_calendario,id);
            console.log("Datos Obtenidos:",data);
            res.status(200).json(data);
        }catch(error){
            console.error("Error al actualizar Asistencia:,",error);
            res.status(500).json({error:"Error al actualizar Asistencias"});
        }
    }

    static readonly UpdateFechaControllers=async(req:Request,res:Response):Promise<any>=>{
        try{
            const {fecha_antigua,fecha_nueva,id_calendario}=req.body;
            const data =await CursInsDocModels.UpdateFecha(fecha_antigua,fecha_nueva,id_calendario);
            res.status(200).json(data);
        }catch(error){
            console.error("Erro al actualizar fecha:,",error);
            res.status(500).json({error:"Error al actualizar Fecha"});
        }
    }

    static readonly GetNotaAluController = async(req: Request, res: Response): Promise<any> => {
    try {
        const { id_user, id_calendario } = req.params;
        console.log("Obteniendo notas - id_user:", id_user, "id_calendario:", id_calendario);
        
        const data = await CursInsDocModels.GetNotasAlu(id_user, id_calendario);
        console.log(" Datos Obtenidos:", data);
        res.status(200).json(data);
    } catch (error) {
        console.error("Error al mostrar las notas:", error);
        res.status(500).json({ error: "Error al mostrar las Notas" });
    }
}

static readonly AddNotaAluController = async(req: Request, res: Response): Promise<any> => {
    try {
        const { nota, id_user, id_calendario } = req.body;
        console.log("Agregando nota - datos:", { nota, id_user, id_calendario });
        
        const data = await CursInsDocModels.AddNotasAlum(nota, id_user, id_calendario);
        console.log("Nota insertada con ID:", data);
        res.status(200).json(data); 
    } catch (error) {
        console.error("Error al insertar Nota:", error);
        res.status(500).json({ error: "Error al insertar Notas" });
    }
}

static readonly UpdateNotaAluController = async(req: Request, res: Response): Promise<any> => {
    try {
        const { id_nota } = req.params;
        const { nota, id_user, id_calendario } = req.body;
        console.log(" Actualizando nota:", { id_nota, nota, id_user, id_calendario });
        
        const data = await CursInsDocModels.UpdateNotaAlum(nota, id_user, id_calendario, id_nota);
        console.log("Nota actualizada:", data);
        res.status(200).json(data);
    } catch (error) {
        console.error("Error al actualizar Nota:", error);
        res.status(500).json({ error: "Error al Actualizar Nota" });
    }
}
}

