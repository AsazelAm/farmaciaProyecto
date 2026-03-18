import api from "../lib/Axios";
import { isAxiosError } from "axios";
import  { GetRolSchemas, type addRol, type Rols} from "../types";


export async function GetRol() {
    try {
        const {data} = await api.get('/user/RolAll')
        const response = GetRolSchemas.safeParse(data)
        if(response.success){
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    } 
}
export async function NewRol(formData:addRol){
    try {
        const {data} = await api.post('/user/addRol',formData)
        return data
    } catch (error) {
          if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}
export async function DeleteRol(id:Rols['id_rol']){
    try {
        const {data} = await api.delete(`/user/deleteRol/${id}`);
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        }  
    }
}
export async function UpdateRolApi(formdata:Rols){
    try {
        const {data} = await api.put(`/user/UpdateRol/${formdata.id_rol}`,formdata);
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        }
    }
}