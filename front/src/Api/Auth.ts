import api from "../lib/Axios";
import { isAxiosError } from "axios";
import type { AuthRol, AuthUser } from "../types";


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

export async function Login(formData: AuthUser) {
    let attempts = 0; 
    const maxAttempts = 5; 

    while (attempts < maxAttempts) {
        try {
            const { data } = await api.post('/Auth/login', formData);
            if (data.token2) {
                localStorage.setItem('AUTH_TOKEN', data.token2);
                return data.IDRol;
            }
        } catch (error) {
            if (isAxiosError(error) && error.response) {
                throw new Error(error.response.data.error);
            }
        }

        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Espera 1 segundo antes del próximo intento
    }

    throw new Error('No se pudo obtener un token válido después de varios intentos.');
}


export async function GetAuthUsers() {
    try {
        const {data} = await api.get('/Auth/GetUsers')
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
    
}

export async function GetAuthRol(id:AuthRol['id_rol']){
    try {
        const {data} = await api.get(`/Auth/GetRols/${id}`)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}
