import api from "../lib/Axios";
import { isAxiosError } from "axios";
import { TipoProdShcemas, type CreateTipoProd, type UpdateTipoProd, type DeleteTipoProd} from "../types";

export async function GetTipoProdApi(){
    try{
        const {data}=await api.get('/TipoProd/GetTipoProd');
        const response= TipoProdShcemas.safeParse(data);
        if (response.success) {
            return response.data; // Retorno exitoso
        } else {
            // SI ZOD FALLA: Imprimimos el error en consola para debug y lanzamos error
            console.error("Error de validación Zod:", response.error);
            throw new Error("Los datos recibidos del servidor no son válidos");
        }
    }catch(error){
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error);
        }
    }
}

export async function AddTipoProdApi(formData:CreateTipoProd){
    try{
        const {data}=await api.post('/TipoProd/AddTipoProd',formData);
        return data;
    }catch(error){
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error);
        }
    }
}

export async function UpdateTipoProdApi(formdata:UpdateTipoProd){
    try{
        const {data} =await api.put(`/TipoProd/UpdateTipoPro/${formdata.idTipoProd}`,formdata);
        return data;
    }catch(error){
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error);
        }
    }
}

export async function DeleteTipoProdApi(idTipoProd:DeleteTipoProd['idTipoProd']){
    try{
        const {data} = await api.delete(`/TipoProd/DeleteTipoProd/${idTipoProd}`);
        return data;
    }catch(error){
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error)
        }
    }
}