import  api from "../lib/Axios";
import {isAxiosError} from "axios";
import {TipoUsShcemas, type CreateTipo_us,type UpdateTipo_us, type DeleteTipo_us} from "../types";

export async function GetTipoUsApi(){
    try{
        const {data}= await api.get('/TipoUs/GetTipoUs');
        const response = TipoUsShcemas.safeParse(data);
        if(response.success){
            return response.data
        }
    }catch(error){
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error);
        }
    }
}

export async function AddTipoUsApi(formData:CreateTipo_us){
    try{
        const {data}= await api.post('/TipoUs/AddTipoUs',formData);
        return data;
    }catch(error){
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error);
        }
    }
}

export async function UpdateTipoUsApi(formData:UpdateTipo_us){
    try{
        const {data}= await api.put(`/TipoUs/UpdateTipoUs/${formData.idTipoUs}`,formData);
        return data;
    }catch(error){
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error);
        }
    }
}

export async function DeleteTipoUsApi(idTipoUs:DeleteTipo_us['idTipoUs']) {
    try{
        const {data}= await api.delete(`/TipoUs/DeleteTipoUs/${idTipoUs}`);
        return data;
    }catch(error){
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error);
        }
    }
}