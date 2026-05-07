import api from "../lib/Axios";
import { isAxiosError } from "axios";
import { ClienteShcemas, type CreateCliente, type UpdateCliente, type DeleteCliente } from "../types";

export async function GetClienteApi() {
    try{
        const {data} = await api.get('/Cliente/GetCliente');
        const response= ClienteShcemas.safeParse(data);
        if(response.success){
            return response.data;
        }
    }catch(error){
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error);
        }
    }
}

export async function AddClienteApi(formData:CreateCliente){
    try {
        const {data}= await api.post('/Cliente/AddCliente',formData);
        return data;
    } catch (error) {
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error);
        }
    }
}

export async function UpdateClienteApi(formData:UpdateCliente){
    try{
        const {data}=await api.put(`/Cliente/UpdateCliente/${formData.idCliente}`,formData);
        return data;
    }catch(error){
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error);
        }
    }
}

export async function DeleteClienteApi(idCliente:DeleteCliente['idCliente']) {
    try{
        const {data} = await api.delete(`/Cliente/DeleteCliente/${idCliente}`);
        return data;
    }catch(error){
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        }
    }
}
