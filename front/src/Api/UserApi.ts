import api from "../lib/Axios";
import { isAxiosError } from "axios";
import { GetUserSchema, type CreateAdmins,type deleteuser, TipoUsShcemas,SucursalShcemas} from "../types";


export async function GetUserAllApi() {
    try {
        const {data} = await api.get('/user/GetAll')
        const response = GetUserSchema.safeParse(data)
        if(response.success){
            return response.data
        }
        // Si el schema falla, lanzamos el error con detalle para depurar
        console.error("Zod parse error:", response.error.issues)
        throw new Error("Los datos recibidos no tienen el formato esperado")

    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    } 
}

export async function GetUserAllIdApi(id_usuario:number) {
    try {
        const {data} = await api.get(`/user/GetAllId/${id_usuario}`)
        const response = GetUserSchema.safeParse(data)
        if(response.success){
            return response.data;
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
        const {data} = await api.post('/user/addUser',formdata,{
            headers:{
                'Content-Type':'multipart/form-data'
            }
        });
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

export async function UpdateUserApi(formData:FormData,id_usuario:number){
    try {
        const {data} = await api.put(`/user/UpdateUser/${id_usuario}`, formData,{
            headers:{
                'Content-Type':'multipart/form-data'
            }
        });
        return data
    } catch (error) {
         if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}