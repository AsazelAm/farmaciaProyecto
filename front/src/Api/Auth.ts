import api from "../lib/Axios";
import { isAxiosError } from "axios";
import type { AuthRol, AuthUser } from "../types";


export async function ResetPasswd({formData, idUsuario}:{formData:{ passwd: string; adminPasswd: string };idUsuario:number}){
    try {
        const {data} = await api.put(`/Auth/reset-passwd/${idUsuario}`,formData)
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

export async function GetAuthRol(id:AuthRol['idTipoUs']){
    try {
        const {data} = await api.get(`/Auth/GetRols/${id}`)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}

// ── GET: Datos completos del usuario actualmente logueado ─────────────────
// Llama a /Auth/GetMe (protegida por el middleware "authenticate" en el
// backend, que identifica al usuario a partir del token JWT guardado en
// localStorage, no de ningún parámetro que mande el frontend).
export async function GetMeApi() {
    try {
        const {data} = await api.get('/Auth/GetMe')
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}