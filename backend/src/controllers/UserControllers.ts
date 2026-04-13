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
    static readonly CreateUserControllers = async(req:Request,res:Response):Promise<any>=>{
        try {
            const { ci,nombre,apellido, passwd,telefono,Email, id_tipo_us,id_sucursal } = req.body;
            const files = req.file;
            const imgFile = files;
            const fecha=GetDateToday();
            const VE =  await DataUser.GetEmail(Email);
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
                Email,
                id_tipo_us,
                id_sucursal
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
            const {id} = req.params
            const data = await DataUser.DeleteUserId(id);
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al eliminar el usuario:", error);
            res.status(500).json({ error: "Error al eliminar el usuario:" });
        }
    }

    static readonly UpdateUserControllers = async(req:Request,res:Response)=>{
        try {
            const id_usuario=Number(req.params.id_usuario);
            const { ci,nombre,apellido,telefono,Email, id_tipo_us,id_sucursal } = req.body;
            const files = req.file;
            const imgFile = files;
            const fecha=GetDateToday();

            const data = await DataUser.UpodateUserbyId({ci,nombre,apellido,telefono,Email,id_tipo_us,id_sucursal,id_usuario});

            if(imgFile){
                const rutaImg= await uploadImageGlobal(imgFile,String(id_usuario),fecha,'Usuario');
                await DataUser.UpdateRutaimg(rutaImg,id_usuario)
            }
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al actualizar usuarios:", error);
            res.status(500).json({ error: "Error al actualizar usuarios:" });
        }
    }


}