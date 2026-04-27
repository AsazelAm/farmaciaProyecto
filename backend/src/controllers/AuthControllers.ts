import { Request, Response } from "express";
import DataUsers from "../Models/UserModels";
import { CheckPassword, HashPassword } from "../Utils/auth";
import { GenerateJwt } from "../Utils/jwt";

export class AuthControllers {

    static readonly Login = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, passwd } = req.body;
        const data = await DataUsers.GetEmail(email);
        if (!data || !data.exists) {
            return res.status(400).json({ error: 'El Email no está registrado' });
        }
        const VeriCon = await DataUsers.VerifedConfirmed(email);
        if (!VeriCon.exists) {
            return res.status(400).json({ error: 'El usuario no está verificado' });
        }
        const Pass = await DataUsers.GetPasswd(email);
        const VerPass = Pass[0].passwd;
        const Correct = await CheckPassword(passwd, VerPass);
        if (!Correct) {
            return res.status(401).json({ error: 'El password es incorrecto' });
        }
        const idUser = Pass[0].id_usuario;

        const token2 = GenerateJwt(idUser);
        const IDRolArray = await DataUsers.GetIdRol(email);
        if (!IDRolArray || IDRolArray.length === 0) {
            throw new Error("Rol no encontrado");
        }
        const IDRol = IDRolArray[0].name_rol;

        res.status(200).json({ token2, IDRol });

    } catch (error) {
        console.error("Error al loguearse:", error);
        return res.status(500).json({ error: "Error al loguearse" });
    }
};
    
    static readonly ResetPasswd = async(req:Request,res:Response)=>{
        try {
            const {id_usuario} = req.params
            const {passwd} = req.body
            const NewPasswd =  await HashPassword(passwd)
            const data = await DataUsers.ResetPasswd(NewPasswd,id_usuario);
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al restablecer la contrasenha:", error);
            res.status(500).json({ error: "Error al restablecer la contrasenha" }); 
        }
    }

    static readonly GetAuthUser = async(req:Request,res:Response):Promise<any>=>{
        try {
            return res.json(req.user)
        } catch (error) {
            console.error("Error al Obtener los Usuarios Auth:", error);
            res.status(500).json({ error: "Error al Obtener los Usuarios Auth" });  
        }
    }

}