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

export async function UpdateLaboraApi(formData: FormData,idLaboratorio:number){
    try {
        const {data}=await api.put(`/Laboratorio/UpdateLab/${idLaboratorio}`,formData,{
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

export async function DeleteLaboraApi(idLaboratorio:DeletLabora['idLaboratorio']){
    try{
        const {data} = await api.delete(`/Laboratorio/DeleteLab/${idLaboratorio}`);
        return data;
    }catch(error){
        if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error)
        }
    }
}