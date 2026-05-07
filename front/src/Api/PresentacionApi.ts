import api from "../lib/Axios";
import { isAxiosError } from "axios";
import {PresentaShcemas, type CreatePresenta, type UpdatePresenta, type DeletePresenta} from "../types";

export async function GetPresentaApi() {
    try {
        const {data} = await api.get('/Presentacion/GetPresenta');
        const response = PresentaShcemas.safeParse(data);
        if(response.success){
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error);
        }
        
    }
}

export async function AddPresentaApi(formdata:CreatePresenta) {
    try{
        const {data} =await api.post('/Presentacion/AddPresenta',formdata);
        return data;
    }catch(error){
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error);
        }
    }
}

export async function UpdatePresentaApi(formdata:UpdatePresenta){
    try{
        const {data}= await api.put(`/Presentacion/UpdatePresenta/${formdata.idPresentacion}`,formdata);
        return data;
    }catch(error){
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error);
        }
    }
}

export async function DeletePresentaApi(idPresentacion:DeletePresenta['idPresentacion']){
    try{
        const {data} = await api.delete(`/Presentacion/DeletePresenta/${idPresentacion}`);
        return data;
    }catch(error){
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error)
        }
    }
}