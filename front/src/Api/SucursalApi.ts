import  api from "../lib/Axios";
import {isAxiosError} from "axios";
import {SucursalShcemas} from "../types";

export async function GetSucursalApi(){
    try{
        const {data}= await api.get('/Sucursal/GetSucursal');
        const response = SucursalShcemas.safeParse(data);
        if(response.success){
            return response.data
        }
    }catch(error){
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error);
        }
    }
}
