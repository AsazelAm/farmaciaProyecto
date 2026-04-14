import { Request, Response } from "express";
import DataSucursal from "../Models/SucursalModels";

export class SucursalControllers {
    static readonly GetSucursalC=async(req:Request,res:Response)=>{
        try{
            const data = await DataSucursal.GetSucursalM();
            res.status(200).json(data);
        }catch(error){
            console.error("Error al obtener el Sucursal: ",error);
            res.status(500).json({error:"ERROR al obtener los Sucursal"});
        }
    }
}