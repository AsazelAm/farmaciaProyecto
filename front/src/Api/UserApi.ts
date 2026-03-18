import api from "../lib/Axios";
import { isAxiosError } from "axios";
import  { GetAlumnnosChema,  GetDocenteSchema, GetUserSchema, type CreateAdmins, type CreateStudents, type deleteuser, type updateuser,type UpdateStudents, GetCiudadSchema} from "../types";


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

export async function ResetPasswd({formData, id}:{formData:any;id:number}){
    try {
        const {data} = await api.put(`/Auth/reset-passwd/${id}`,formData)
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


export async function GetCityCoutryAdminAPI(id:CreateAdmins['id_country']) {
    try{
        const {data}=await api.get(`/user/City/${id}`);
        const response = GetCiudadSchema.safeParse(data)
        if(response.success){
            return response.data
        }
    }catch(error){
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}

//alumno create
export async function CreateStudensAPI(formdata:CreateStudents){
    try {
        const {data} = await api.post('/user/addStudents',formdata)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}
//alumno Update osea actualizar
export async function UpdateStudentsApi(formData:UpdateStudents){
    try{
        const {data} = await api.put(`/user/UpdateStudent/${formData.id_user}`,formData);
        return data;
    }catch(error){
         if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}



export async function GetCityCoutryAPI(id:CreateStudents['id_country']) {
    try{
        const {data}=await api.get(`/user/City/${id}`);
        const response = GetCiudadSchema.safeParse(data)
        if(response.success){
            return response.data
        }
    }catch(error){
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}



export async function DeleteuserApi(id:deleteuser['id_user']){
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
        const {data} = await api.put(`/user/UpdateUser/${formData.id_user}`, formData)
        return data
    } catch (error) {
         if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}

export async function GetDocenteAPI(){
    try {
       const {data} = await api.get('/user/Docente')
       const response =  GetDocenteSchema.safeParse(data)
       if(response.success){
        return response.data
       }
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}

//
export async function GetAlumnosApi() {
    try {
        const {data} = await api.get('/user/Alumnos')
        const response =  GetAlumnnosChema.safeParse(data);
        if(response.success){
            return response.data
        }
    } catch (error) {
         if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}

