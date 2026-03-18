import api from "../lib/Axios";
import { isAxiosError } from "axios";
import { GetDocCursInsc ,GetAlumAsis,GetNotasAlum, type CreateAsistencia,type UpdateAsisAlum, type CreateNotaAl, type UpdateNotaAl} from "../types";


interface UpdateFecha{
    fecha_antigua: string;
    fecha_nueva: string;
    id_calendario: number;
}

export async function GetDocenteCursoApi(id:number){
    try{
        const {data}=await api.get(`/CursoDocente/DocenteCurs/${id}`)
        const response =GetDocCursInsc.safeParse(data);
        if(response.success){
            return response.data
        }
    }catch(error){
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        }
    }
}

export async function GetNotasAlumApi(id_user: number, id_calendario: number) {
    try {
        const { data } = await api.get(`/CursoDocente/GetNotas/${id_user}/${id_calendario}`);
        const response = GetNotasAlum.safeParse(data);
        console.log(" Respuesta de notas:", response);
        if (response.success) {
            return response.data;
        }
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
    }
}
export async function GetAlumnosInscApi(id_cal:number) {
    try {
        const {data} = await api.get(`/CursoDocente/AlumnAsis/${id_cal}`)
        const response =GetAlumAsis.safeParse(data);
        console.log("datos:",response);
        if(response.success){
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        }
    }
}

export async function AddAlumnAsistenApi(formData:CreateAsistencia ){
    try{
        const {data} = await api.post('/CursoDocente/AddAsisAlum',formData)
        return data
    }catch(error){
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        }
    }
}

export async function AddNotasAluApi(formData: CreateNotaAl) {
    try {
        console.log(" Enviando nota:", formData);
        const { data } = await api.post('/CursoDocente/AddNotas', formData);
        console.log(" Respuesta del servidor:", data);
        return data;
    } catch (error) {
        console.error("Error en AddNotasAluApi:", error);
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
    }
}
export async function UpdateAlumnAsistenApi(formData:UpdateAsisAlum){
    try{
        const {data}=await api.put(`/CursoDocente/UpdateAsisAlum/${formData.id_asistencia}`,formData);
        return data;
    }catch(error){
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error);
        }
    }
}

export async function UpdateNotasAlumApi(formData: UpdateNotaAl) {
    try {
        console.log("Actualizando nota:", formData);
        const { data } = await api.put(`/CursoDocente/UpdateNota/${formData.id_nota}`, formData);
        console.log("Respuesta del servidor:", data);
        return data;
    } catch (error) {
        console.error("Error en UpdateNotasAlumApi:", error);
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
    }
}
export async function UpdateFechaApi(formData:UpdateFecha) {
    try{
        const {data}= await api.put('/CursoDocente/UpdateFecha',formData);
        return data;
    }catch(error){  
        if(isAxiosError (error) && error.response){
            throw new Error(error.response.data.error);
        }
    }
}
