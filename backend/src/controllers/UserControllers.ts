import { Request, Response } from "express";
import DataUser from "../Models/UserModels";
import { uploadImageGlobal } from "../Middleware/SaveImg";
import { GetDateToday } from "../lib/Time";
import { HashPassword } from "../Utils/auth";

export class UserControllers {
    static readonly  GetAllUser = async(req:Request,res:Response)=>{
        try {
            const data = await DataUser.UserAllModels();
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al obtener Usuario:", error);
            res.status(500).json({ error: "ERROR al obtener el Usuario:" });
        }
    }

    static readonly  GetAllUserId = async(req:Request,res:Response)=>{
        try {
            const {idUsuario}=req.params;
            const data = await DataUser.UserAllModelsId(idUsuario);
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al obtener Usuario:", error);
            res.status(500).json({ error: "ERROR al obtener el Usuario:" });
        }
    }

    static readonly CreateUserControllers = async(req:Request,res:Response):Promise<any>=>{
        try {
            const { ci,nombre,apellido, passwd,telefono,email, idTipoUs,idSucursal } = req.body;
            const files = req.file;
            const imgFile = files;
            const fecha=GetDateToday();
            const VE =  await DataUser.GetEmail(email);
            if(VE.exists){
                res.status(400).json({error:"El Email ya esta Registrado"});
                return;
            }
            const CEDU = await DataUser.GetCI(ci);
            if (CEDU.exists) { 
                res.status(400).json({error:"La Cedula de Identidad ya esta Registrado"});
                return; 
            }

            const NewPasswd = await HashPassword(passwd);

            const id_usuario = await DataUser.CreateUsuarioM({
                ci,
                nombre,
                apellido,
                passwd: NewPasswd,
                telefono,
                email,
                idTipoUs,
                idSucursal
            });
            if(imgFile){
                const rutaImg = await uploadImageGlobal(imgFile,String(id_usuario),fecha,'Usuario');
                await DataUser.UpdateRutaimg(rutaImg,id_usuario);
            }

            res.status(201).json({ message: "Usuario creado con éxito",id_usuario:id_usuario});
        } catch (error) {
            console.error("Error al crear usuario:", error);
            res.status(500).json({ error: "Error al crear usuario:" });
        }
    }

    static readonly DeleteUserControllers = async(req:Request,res:Response)=>{
        try {
            const {idUsuario} = req.params
            const data = await DataUser.DeleteUserId(idUsuario);
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al eliminar el usuario:", error);
            res.status(500).json({ error: "Error al eliminar el usuario:" });
        }
    }

    static readonly UpdateUserControllers = async(req:Request,res:Response)=>{
        try {
            const idUsuario=Number(req.params.idUsuario);
            const { ci,nombre,apellido,telefono,email, idTipoUs,idSucursal } = req.body;
            const files = req.file;
            const imgFile = files;
            const fecha=GetDateToday();

            const data = await DataUser.UpodateUserbyId({ci,nombre,apellido,telefono,email,idTipoUs,idSucursal,idUsuario});

            if(imgFile){
                const rutaImg= await uploadImageGlobal(imgFile,String(idUsuario),fecha,'Usuario');
                await DataUser.UpdateRutaimg(rutaImg,idUsuario)
            }
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al actualizar usuarios:", error);
            res.status(500).json({ error: "Error al actualizar usuarios:" });
        }
    }


}