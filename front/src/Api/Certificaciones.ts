import api from "../lib/Axios";
import { isAxiosError } from "axios";
import  { GetSchemaCertificacion, type CreateCert, type DeleteCert, type UpdateCert} from "../types";


export async function GetCertificacionApi() {
    try {
        const {data} = await api.get('/Certificacion/Get')
        const response = GetSchemaCertificacion.safeParse(data)
        if(response.success){
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    } 
}

export async function AddCertificacion(formData:CreateCert){
    try {
        const {data} = await api.post('/Certificacion/AddCert',formData)
        return data
    } catch (error) {
          if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}

export async function DeleteCert(id: DeleteCert['id_cert']){
    try {
        const {data} = await api.delete(`/Certificacion/DeleteCert/${id}`);
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}

export async function UpdateCertiApi(formData:UpdateCert){
    try{
        const {data}= await api.put(`/Certificacion/UpdateCerti/${formData.id_cert}`,formData);
        return data;
    }catch(error){
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error);
        }
    }
}

