import api from "../lib/Axios";
import { isAxiosError } from "axios";
import { GetCursoMoodleSchema ,GetAlumnoMoodleSchema} from "../types"


export async function GetCursoMoodleApi(){
    try {
        const { data } = await api.get('CursosMoodle/GetCursoMoodle');
        const response = GetCursoMoodleSchema.safeParse(data);
        if(response.success){
           return response.data; 
        }
        
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    } 
}

//Get Alumno Get Moodle
export async function GetAlumnoMoodleApi(){
    try {
        const { data } = await api.get('AlumnosMoodle/GetAlumnoMoodle');
        const response = GetAlumnoMoodleSchema.safeParse(data);
        if(response.success){
           return response.data; 
        }
        
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.error)
        } 
    } 
}