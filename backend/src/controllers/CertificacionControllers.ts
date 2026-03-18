import { Request, Response } from "express";
import DataCertificacion from "../Models/CertificacionModel";

export class CertificacionControllers {

    static readonly  GetCertificacionall = async(req:Request,res:Response)=>{
        try {
            const data = await DataCertificacion.AllCertification();
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al obtener Certificacion", error);
            res.status(500).json({ error: "Error al obtener  Certificacion:" });
        }
    }

    static readonly  addCertificacion = async(req:Request,res:Response)=>{
        try {
            const {n_cert,opcion,nota,tipo } = req.body
            const data = await DataCertificacion.AddCerModal(n_cert,opcion,nota,tipo);
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al agregar Certificacion:", error);
            res.status(500).json({ error: "Error al agregar Certificacion" });
        }
    }

    static readonly DeleteCertControllers = async(req:Request,res:Response)=>{
        try {
           const {id} = req.params
            const data = await DataCertificacion.DeleteCert(id);
            res.status(200).json(data)
        } catch (error) {
             console.error("Error al eliminar el certificado:", error);
            res.status(500).json({ error: "Error al eliminar el certificado" });
        }
    }

    static readonly UpdateCertiControllers = async(req:Request,res:Response)=>{
        try{
            const {id} = req.params;
            const {n_cert,opcion,nota,tipo}=req.body;
            const data =await DataCertificacion.UpdateCertiModels(n_cert,opcion,nota,tipo,id);
            res.status(200).json(data);
        }catch(error){
            console.error("Error al actualizar Cerificado:",error);
            res.status(500).json({error: "Erro al eliminar certificado"});
        }
    }
   
}