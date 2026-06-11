import { Request, Response} from "express";
import DataProveedor from "../Models/ProveedorModels";

export class ProveedorControllers{
    static readonly GetProveedorC = async(req:Request, res:Response)=>{
        try{
            const data = await DataProveedor.GetProveedorM();
            res.status(200).json(data);
        }catch(error){
            console.error("Error al obtener los Proveedores: ",error);
            res.status(500).json({error:"ERROR al Obtener Proveedores"})
        }
    }

    static readonly AddProveedorC = async(req:Request, res:Response)=>{
        try{
            const {codigo,nombre,telefono,email,direccion,contactoPrincipal}=req.body;
            const CodVerif= await DataProveedor.VerificarCodigo(codigo);
            if(CodVerif !== 0){
                return res.status(400).json({error:"El codigo ya esta registrado"});
            }

            const EmailVerificar = await DataProveedor.VerificarEmail(email);
            if(EmailVerificar !== 0){
                return res.status(400).json({error:"El email ya esta registrado"});
            }

            //OTRA FORMA DE HACERLO 
            const dat_a = await DataProveedor.AddProveedorM({codigo,nombre,telefono,email,direccion,contactoPrincipal});

            res.status(200).json({message:'Proveedor Agregado Exitosamente',
                data:dat_a});
        }catch(error){
            console.error("Error al registra al Proveedor:",error);
            res.status(500).json({error:"ERROR al registrar el Proveedor"});
        }
    }

    static readonly UpdateProveedorC=async(req:Request,res:Response)=>{
        try{
            const {idProveedor}=req.params;
            const {codigo,nombre,telefono,email,direccion,contactoPrincipal}=req.body;

            const codiVeri= await DataProveedor.VerificarCodigoUpdate(codigo,idProveedor);
            if(codiVeri !== 0){
                return res.status(400).json({error:"El codigo ya estaba registrado"});
            }

            const EmailVeri= await DataProveedor.VerificarEmailUpdate(email,idProveedor);
            if(EmailVeri !== 0){
                return res.status(400).json({error:"El email ya estaba registrado"});
            }

            const data = await DataProveedor.UpdateProveedorM({codigo,nombre,telefono,email,direccion,contactoPrincipal},idProveedor);

            res.status(200).json(data);
        }catch(error){  
            console.error("Error al actualizar un Proveedor: ",error);
            res.status(500).json({error:"ERROR al Actualizar Proveedor"});
        }
    }

    static readonly DeleteProveedorC= async(req:Request,res:Response)=>{
        try{
            const {idProveedor}=req.params;
            const data = await DataProveedor.DeleteProveedorM(idProveedor);
            res.status(200).json(data);
        }catch(error){
            console.error("Error al eliminar al Proveedor: ",error);
            res.status(500).json({error:"ERROR al eliminar al Proveedor"});
        }
    }
}