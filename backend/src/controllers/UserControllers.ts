import { Request, Response } from "express";
import DataUser from "../Models/UserModels";
import { HashPassword } from "../Utils/auth";

export class UserControllers {
    static readonly  GetAllUser = async(req:Request,res:Response)=>{
        try {
            const data = await DataUser.UserAllModels();
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al obtener el Rol:", error);
            res.status(500).json({ error: "Error al obtener el Rol:" });
        }
    }
    static readonly CreateUserControllers = async(req:Request,res:Response)=>{
        try {
            const { nombre,apellido, id_rol, Passwd, ci, Email, telefono,id_city,id_country } = req.body;
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

            const NewPasswd = await HashPassword(Passwd);

            await DataUser.CreateAdmins({
                id_rol,
                nombre,
                apellido,
                ci,
                Email,
                telefono,
                id_city,
                id_country,
                Passwd: NewPasswd,
            });

            res.status(201).json({ message: "Usuario creado con éxito"});
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
            const {id} = req.params
            const {id_rol,nombre,apellido,Email,telefono,id_city} = req.body
            const data = await DataUser.UpodateUserbyId({id_rol,nombre,apellido,Email,telefono,id_city,id});
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al actualizar usuarios:", error);
            res.status(500).json({ error: "Error al actualizar usuarios:" });
        }
    }

    static readonly Getdocentes = async(req:Request,res:Response)=>{
        try {
            const data = await DataUser.GetDocentesModels()
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al actualizar usuarios:", error);
            res.status(500).json({ error: "Error al actualizar usuarios:" });
        }
    }

    //roles
    static readonly GetRol = async(req:Request,res:Response)=>{
        try {
            const data = await DataUser.RolAllModels();
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al obtener el Rol:", error);
            res.status(500).json({ error: "Error al obtener el Rol:" });
        }
    }
    static readonly addRolController  = async(req:Request,res:Response)=>{
        try {
            const {rol} = req.body
            const data = await DataUser.addRol(rol);
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al crear nuevo rol:", error);
            res.status(500).json({ error: "Error al crear nuevo rol:" });
        }
    }
    static readonly DeleteRolControolers = async (req:Request,res:Response)=>{
        try {
            const {id} = req.params
            const data = await DataUser.DeleteRol(id);
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al eliminar el rol:", error);
            res.status(500).json({ error: "Error al eliminar el rol:" });
        }
    }
    static readonly UpdateRolControllers = async (req:Request,res:Response)=>{
        try {
            const {id} = req.params
            const {rol} = req.body
            const data  = await DataUser.UpdateRolModels(id,rol);
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al actualizar el rol:", error);
            res.status(500).json({ error: "Error al actualizar el rol:" }); 
        }
    }

    static readonly GetAlumnosControllers = async (req:Request,res:Response)=>{
        try {
            const data =await DataUser.GetAlumnosModels();
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al actualizar el rol:", error);
            res.status(500).json({ error: "Error al actualizar el rol:" }); 
        }
    }


    static readonly GetCityCountryControllers= async(req:Request,res:Response)=>{
        try{
            const {id_contry}=req.params;
            const data=await DataUser.GetCityCoun(id_contry);
            res.status(200).json(data);
        }catch(error){
            console.error("Error al actualizar la Ciudad:", error);
            res.status(500).json({ error: "Error al actualizar la Ciudad:" }); 
        }
    }
    

    static readonly CreateStudentsControllers = async (req:Request,res:Response)=>{
        try {
            const {nombre,apellido,Email,telefono,ci,id_empresa,id_city,id_country} = req.body
            const data = await DataUser.createStudentsModels({nombre,apellido,Email,telefono,ci,id_empresa,id_city,id_country});
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al actualizar el rol:", error);
            res.status(500).json({ error: "Error al actualizar el rol:" }); 
        }
    }

    static readonly UpdateStudentsController = async(req:Request,res:Response)=>{
        try{
        const {id}=req.params
        const {nombre,apellido,Email,telefono,ci,id_empresa,id_city}=req.body
        const data =await DataUser.UpdateStudentsModels({
            nombre,
            apellido,
            Email,
            telefono,
            ci,
            id_empresa,
            id_city,
            id});
        
        res.status(200).json(data);
        }catch(error) {
            console.error("Error al actualizar Estudiante:", error);
            res.status(500).json({ error: "Error al actualizar al Estudiante:" });
        }
        
    }
}