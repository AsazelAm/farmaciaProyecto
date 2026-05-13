import api from "../lib/Axios";
import {isAxiosError} from "axios";
import {ProveedorShcemas, type CreateProveedor, type UpdateProveedor, type DeleteProveedor} from "../types";

export async function GetProveedorApi(){
    try{
        const {data} = await api.get('/Proveedor/GetProveedor');
        const response = ProveedorShcemas.safeParse(data);
        if(response.success){
            return response.data;
        }
    }catch(error){
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error);
        }
    }
}

export async function addProveedorApi(formData:CreateProveedor){
    try{
        const {data} = await api.post('/Proveedor/AddProveedor',formData);
        return data;
    }catch(error){
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error);
        }
    }
}

export async function UpdateProveedorApi(formData:UpdateProveedor){
    try{
        const {data} = await api.put(`/Proveedor/UpdateProveedor/${formData.idProveedor}`,formData);
        return data;
    }catch(error){
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error);
        }
    }   
}

export async function DeleteProveedorApi(idProveedor:DeleteProveedor['idProveedor']){
    try{
        const {data} = await api.delete(`/Proveedor/DeleteProveedor/${idProveedor}`);
        return data;
    }catch(error){
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error);
        }
    }
}