import api from "../lib/Axios";
import { isAxiosError } from "axios";
import { TipoProdShcemas, type CreateTipoProd, type UpdateTipoProd, type DeleteTipoProd} from "../types";

export async function GetTipoProdApi(){
    try{
        const {data}=await api.get('/TipoProd/GetTipoProd');
        const response= TipoProdShcemas.safeParse(data);
        if(response.success){
            return response.data
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
        const {data} =await api.put(`/TipoProd/UpdateTipoPro/${formdata.id_tipo_prod}`,formdata);
        return data;
    }catch(error){
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error);
        }
    }
}

export async function DeleteTipoProdApi(id_tipo_prod:DeleteTipoProd['id_tipo_prod']){
    try{
        const {data} = await api.delete(`/TipoProd/DeleteTipoProd/${id_tipo_prod}`);
        return data;
    }catch(error){
        if(isAxiosError(error)&& error.response)
            throw new Error(error.response.data.error)
    }
}