import api from "../lib/Axios";
import { isAxiosError } from "axios";
import { GetCalendarioBySchema, GetCalendarioSchema, GetViewAreaSchema, GetViewProSchema, type UpdateCalendarioExtendedType } from "../types";


export async function CreateCalendarioAPI(formData: any) {
    try {
        const {data} = await api.post('/Curso/addCalendario',formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
           throw new Error(error.response.data.message || "Ocurrió un error en el servidor");
        } 
    } 
}

export async function GetCalendarioAPI(){
    try {
        const {data} = await api.get(`/Curso/GetCalendarios`)
        const response = GetCalendarioSchema.safeParse(data)
        if(response.success){
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        }  
    }
}

export async function DeleteCalendarioAPI(id:number){
    try {
        const {data} = await api.delete(`/Curso/DeleteCalendario/${id}`)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        }  
    }
}

export async function GetViewAreasCalendarioAPI(id:number){
    try {
        const {data} = await api.get(`/Calendario/ViewAreas/${id}`)
        const response =  GetViewAreaSchema.safeParse(data)
        if(response.success){
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}

export async function GetViewProCalendarioAPI(id:number){
    try {
        const {data} = await api.get(`/Calendario/ViewPro/${id}`)
        const response =  GetViewProSchema.safeParse(data)
        if(response.success){
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}

 export async function UpdateAddCalendar(formData:UpdateCalendarioExtendedType){
    try {
        const {data} = await api.put(`/Calendario/PutCalendar`, formData)
        return data
    } catch (error) {
       if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        }  
    }
 }
 
 export async function GetCalendarioById(id:number) {
    try {
        const {data} = await api.get(`/Calendario/ByCalendario/${id}`)
        const response = GetCalendarioBySchema.safeParse(data)
        if(response.success){
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        }  
    }
 }