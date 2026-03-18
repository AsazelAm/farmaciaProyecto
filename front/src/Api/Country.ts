import api from "../lib/Axios";
import { isAxiosError } from "axios";
import  { GetCountrySchema} from "../types";


export async function GetCountryAPI() { //pais
    try {
        const {data} = await api.get('/Administracion/Country')
        const response =  GetCountrySchema.safeParse(data)
        if(response.success){
            return response.data
        }
    } catch (error) {
         if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    }
}