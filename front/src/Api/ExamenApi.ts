import api from "../lib/Axios";
import { isAxiosError } from "axios";
import  { GetExamenArrays, type CreateExa, type DeleteExa ,type UpdateExame} from "../types";


export async function GetExamenApi() {
    try {
        const {data} = await api.get('/Examen/Get')
        const response = GetExamenArrays.safeParse(data)
        if(response.success){
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    } 
}

export async function AddExamenApi(formData:CreateExa){
    try {
        const {data} = await api.post('/Examen/AddExa',formData)
        return data
    } catch (error) {
          if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}

export async function DeleteExamenApi(id: DeleteExa["id_exa"]){
    try {
        const {data} = await api.delete(`/Examen/DeteleExa/${id}`)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}

export async function UpdateExamenApi(formData:UpdateExame) {
    try{
        const {data}=await api.put(`/Examen/UpdateExa/${formData.id_exa}`,formData);
        return data;
    }catch(error){
            if(isAxiosError(error) && error.response){
                throw new Error(error.response.data.error);
            }
    }
}
