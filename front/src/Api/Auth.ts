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

export type LoginResultado =
  | { requiresCode: true; email: string }
  | { requiresCode: false; IDRol: string };

// Envia email + contraseña. Si las credenciales son correctas el backend
// responde { requiresCode: true, email } y el codigo OTP llega al correo:
// recien cuando se verifica en VerificarCodigo() se guarda el token.
export async function Login(formData: AuthUser): Promise<LoginResultado> {
    try {
        const { data } = await api.post('/Auth/login', formData);

        if (data.requiresCode) {
            return { requiresCode: true, email: data.email };
        }

        if (data.token2) {
            localStorage.setItem('AUTH_TOKEN', data.token2);
            return { requiresCode: false, IDRol: data.IDRol };
        }

        throw new Error('Respuesta invalida del servidor');
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
        throw new Error('No se pudo iniciar sesion');
    }
}

// Valida el codigo de 6 digitos. Al ser correcto el backend devuelve el JWT
// (que guardamos en localStorage) junto al rol para redirigir.
export async function VerificarCodigo({ email, codigo }: { email: string; codigo: string }) {
    try {
        const { data } = await api.post('/Auth/verificar-codigo', { email, codigo });
        if (data.token2) {
            localStorage.setItem('AUTH_TOKEN', data.token2);
            return data.IDRol as string;
        }
        throw new Error('Respuesta invalida del servidor');
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
        throw new Error('No se pudo verificar el codigo');
    }
}

// Pide al backend que genere y reenvie otro codigo al correo
export async function ReenviarCodigo(email: string) {
    try {
        const { data } = await api.post('/Auth/reenviar-codigo', { email });
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
        throw new Error('No se pudo reenviar el codigo');
    }
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