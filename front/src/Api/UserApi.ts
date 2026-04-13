import api from "../lib/Axios";
import { isAxiosError } from "axios";
import { GetUserSchema, type CreateAdmins,type deleteuser, type updateuser, TipoUsShcemas,SucursalShcemas} from "../types";


export async function GetUserAllApi() {
    try {
        const {data} = await api.get('/user/GetAll')
        const response = GetUserSchema.safeParse(data)
        if(response.success){
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    } 
}

export async function ResetPasswd({formData, id_usuario}:{formData:any;id_usuario:number}){
    try {
        const {data} = await api.put(`/Auth/reset-passwd/${id_usuario}`,formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function AddUser(formdata:CreateAdmins){
    try {
        const {data} = await api.post('/user/addUser',formdata)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}


export async function GetTipoUsUsuarioApi(id:CreateAdmins['id_tipo_us']) {
    try{
        const {data}=await api.get(`/user/City/${id}`);
        const response = TipoUsShcemas.safeParse(data)
        if(response.success){
            return response.data
        }
    }catch(error){
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}

export async function GetSucursalUsuarioApi(id:CreateAdmins['id_sucursal']) {
    try{
        const {data}=await api.get(`/user/Sucursal/${id}`);
        const response = SucursalShcemas.safeParse(data)
        if(response.success){
            return response.data
        }
    }catch(error){
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}

export async function DeleteuserApi(id:deleteuser['id_usuario']){
    try {
        const {data} = await api.delete(`/user/DeleteUser/${id}`);
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}

export async function UpdateUserApi(formData:updateuser){
    try {
        const {data} = await api.put(`/user/UpdateUser/${formData.id_usuario}`, formData)
        return data
    } catch (error) {
         if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}