import { Request ,Response} from "express";
import DataCliente from "../Models/ClienteModels";

export class ClienteControllers{
    static readonly GetClienteC = async(req:Request,res:Response)=>{
        try {
            const data =await DataCliente.GetClientM();
            res.status(200).json(data);
        } catch (error) {
            console.error("Error al Obtener los clientes: ",error);
            res.status(500).json({error:"ERROR al Obtener los Cliente"})
        }
    }

    static readonly AddClienteC= async(req:Request,res:Response)=>{
        try{
            const {ci,nombre,apellido,telefono,email}=req.body;

            const CiVeri= await DataCliente.VerificarCiM(ci);
            if(CiVeri !== 0){
                return res.status(400).json({error:"EL Carnet de Identidad ya existe"});
            }

            const EmailVeri= await DataCliente.VerificarEmail(email);
            if(EmailVeri !== 0){
                return res.status(400).json({error:"El email ya esta registrado en otro usuario"});
            }

            const data = await DataCliente.AddClientM(ci,nombre,apellido,telefono,email);

            res.status(200).json(data);
        }catch(error){
            console.error("Error al registrar al Cliente: ",error);
            res.status(500).json({error:"ERROR al registra al Cliente"}); 
        }
    }

    static readonly UpdateClienteC=async (req:Request,res:Response)=>{
        try{
            const {id_cliente}= req.params;
            const {ci,nombre,apellido,telefono,email}=req.body;

            const ciVeri= await DataCliente.VerificarCiUpdate(ci,id_cliente);
            if(ciVeri !==0){
                return res.status(400).json({error:"El Carnet de identidad ya esta registrado"});
            }

            const emailVeri = await DataCliente.VerificarEmailUpdate(email,id_cliente);
            if(emailVeri!== 0){
                return res.status(400).json({error:"El email ya esta registrado"});
            }

            const data = await DataCliente.UpdateClientM(ci,nombre,apellido,telefono,email,id_cliente);

            res.status(200).json(data);
        }catch(error){
            console.error("Error al Actualizar cliente: ",error);
            res.status(500).json({error:"ERROR al actualizar Cliente"});
        }
    }

    static readonly DeleteClienteC= async(req:Request,res:Response)=>{
        try{
            const {id_cliente}=req.params;
            const data = await DataCliente.DeleteClientM(id_cliente);
            res.status(200).json(data);
        }catch(error){
            console.error("Error al eliminar al Cliente: ",error);
            res.status(500).json({error:"ERROR al eliminar al cliente"});
        }
    }
}