import api from "../lib/Axios";
import { isAxiosError } from "axios";
import { LaboraShcemas, type DeletLabora} from "../types";

export async function GetLaboratorioApi(){
    try{
        const {data}=await api.get('/Laboratorio/GetLab');
        const response= LaboraShcemas.safeParse(data);
        if(response.success){
            return response.data;
        }
    }catch(error){
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error);
        }
    }
};

export async function AddLaboraApi(formData:FormData) {
    try{
        const {data} = await api.post('/Laboratorio/AddLab',formData,{
            headers:{
                'Content-Type':'multipart/form-data'
            }
        });
        return data;
    }catch(error){
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error)
        }
    }
}

export async function UpdateLaboraApi(formData: FormData,id_laboratorio:number){
    try {
        const {data}=await api.put(`/Laboratorio/UpdateLab/${id_laboratorio}`,formData,{
            headers:{
                'Content-Type':'multipart/form-data'
            }
        });
        return data;
    } catch (error) {
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error);
        }
    }
}

export async function DeleteLaboraApi(id_laboratorio:DeletLabora['id_laboratorio']){
    try{
        const {data} = await api.delete(`/Laboratorio/DeleteLab/${id_laboratorio}`);
        return data;
    }catch(error){
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error)
        }
    }
}