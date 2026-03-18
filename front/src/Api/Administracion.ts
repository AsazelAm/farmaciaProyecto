import api from "../lib/Axios";
import { isAxiosError } from "axios";
import  { AreasSchema, GetModalidadCalendarioSchema, GetModalidadSchema, type addAreas, type AddMod, type DeleteAreasType, type DeleteModType,type UpdateAreasType,type UpdateModType} from "../types";


export async function GetModalidad() {
    try {
        const {data} = await api.get('/Administracion/Modalidad')
        const response = GetModalidadSchema.safeParse(data)
        if(response.success){
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    } 
}
export async function AddModalidad(formData:AddMod){
    try {
        const {data} = await api.post('/Administracion/AddMod',formData)
        return data
    } catch (error) {
          if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}
export async function DeleteMod(id:DeleteModType['id_mod']){
    try {
        const {data} = await api.delete(`/Administracion/DeleteMod/${id}`);
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        }  
    }
}
export async function UpdateModApi(formdata:UpdateModType){
    try {
        const {data} = await api.put(`/Administracion/UpdateMod/${formdata.id_mod}`,formdata);
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        }
    }
}

//areas de conocimiento 

export async function GetAreasConocimiento() {
    try {
        const {data} = await api.get('/Administracion/GetAreas')
        const response = AreasSchema.safeParse(data);
        if(response.success){
            return response.data
        }
    } catch (error) {
         if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        }
    }
}

export async function DeleteAreasCono(id:DeleteAreasType['id_areas']){
    try {
        const {data} = await api.delete(`/Administracion/DeleteAreas/${id}`);
        return data
    } catch (error) {
          if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        }
    }
}

export async function addAreasApi(formData:addAreas){
    try {
        const {data} = await api.post(`/Administracion/addAreas`,formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}

export async function UpdateAreasApi(formData:UpdateAreasType){
    try {
        const {data} = await api.put(`/Administracion/UpdateAreas/${formData.id_areas}`,formData);
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        }  
    }
}

//modalidad 

export async function GetModalidadCalendarioAPI(){
    try {
        const {data} = await api.get('/Administracion/Modalidad/Calendario')
        const response = GetModalidadCalendarioSchema.safeParse(data)
        if(response.success){
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        }   
    }
}