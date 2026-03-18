import api from "../lib/Axios";
import { isAxiosError } from "axios";
import  { GetEmpresaSchema} from "../types";


export async function GetEmpresa() {
    try {
        const {data} = await api.get('/Administracion/Empresa')
        const response = GetEmpresaSchema.safeParse(data)
        if(response.success){
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    } 
}