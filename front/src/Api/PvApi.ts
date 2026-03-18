import api from "../lib/Axios";
import { isAxiosError } from "axios";
import  { CityModalidadSchema, ModCalendarioSchema, PvCalendarioSchema, pvSchema, type DeleteTypePv} from "../types";



export async function GetPvAll() {
    try {
        const {data} = await api.get('/Pv/Getall')
        console.log(data)
        const response = pvSchema.safeParse(data)
        if(response.success){
            console.log('apii',response.data)
            return response.data
            
        }
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    } 
}

export async function UpdatePvStatus({ Estado,id }: {  Estado: number ;id: number }){
    try {
        const {data} = await api.put(`/Pv/UpdateStatus/${id}`, { Status:Estado })
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}

export async function UpdatePvApi(formData: FormData) {
    try{
        const id = formData.get('id_pv');
        const { data } = await api.put(`/Pv/UpdatePv/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
    }catch(error){
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error);
        }
    }
}

export async function addPv(formData: FormData){
    try {
        const {data} = await api.post(`/Pv/AddPv`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }) 
        return data;
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}

export async function DeletePv(id:DeleteTypePv['id_pv']){
    try {
        const {data} = await api.delete(`/Pv/DeletePv/${id}`);
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}

export async function PvCalendarioAPI(){
    try {
        const {data} = await api.get('/Pv/PvCalendario')
        const response = PvCalendarioSchema.safeParse(data)
        if(response.success){
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}

export async function ModCalendarioAPI(){
    try {
        const {data} = await api.get('/Curso/ModCalendario')
        const response = ModCalendarioSchema.safeParse(data)
        if(response.success){
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}

export async function CityModalidadAPI(){
    try {
        const {data} = await api.get('/Curso/City')
        const response = CityModalidadSchema.safeParse(data)
        if(response.success){
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}