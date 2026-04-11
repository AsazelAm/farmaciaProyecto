import  api from "../lib/Axios";
import {isAxiosError} from "axios";
import {TipoUsShcemas, type CreateTipo_us,type UpdateTipo_us, type DeleteTipo_us} from "../types";

export async function GetTipoUsApi(){
    try{
        const {data}= await api.get('/TipoUs/GetTipo/Us');
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
        const {data}= await api.put(`/TipoUs/UpdateTipoUs/${formData.id_tipo_us}`,formData);
        return data;
    }catch(error){
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error);
        }
    }
}

export async function DeleteTipoUsApi(id_tipo_us:DeleteTipo_us['id_tipo_us']) {
    try{
        const {data}= await api.delete(`/TipoUs/DeleteTipoUs/${id_tipo_us}`);
        return data;
    }catch(error){
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error);
        }
    }
}