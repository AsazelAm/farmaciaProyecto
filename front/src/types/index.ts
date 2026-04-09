
import { z } from 'zod'

export const LoginShcema = z.object({
    email: z.string().min(1, {message: 'El Email es Obligatorio'}).email({message: 'Email no valido'}),
    password: z.string().min(8,{message: "Minimo 8 Caracteres"})

});
//Schema de User 

//Auth get user 
export const GetAuthUsers  = z.object({
    id_user: z.number(),
    id_rol:z.number(),
    nombre:z.string(),
})

export const GetAuthUserSchema = z.array(GetAuthUsers);


const GetUserShcemass  = z.object({
    id_user: z.number(),
    nombre:z.string(),
    id_rol: z.number(),
    name_rol: z.string(),
    id_municipio: z.number(),
    municipio: z.string(),
    CI: z.string().nullable(),
    Sueldo: z.string().nullable(),
    TipoSueldo: z.string().nullable(),
    F_inicio: z.string().refine(date => !isNaN(Date.parse(date)), { message: "Fecha inválida" }) 
    .transform(date => date.split("T")[0]).nullable(),
    Email: z.string().nullable(),
    Estado:z.number().nullable(),
    Passwd:z.string(),
})

type Users = z.infer<typeof GetUserShcemass>


export type UpdateEstado = Pick<Users, 'id_user'|'Estado'>
export type AuthUser = Pick<Users, 'Email' | 'Passwd'>
export type AuthRol = Pick<Users, 'id_rol'>



//type LABORATORIO
export const laboraArray=z.object({
    id_laboratorio:z.number(),
    nombre:z.string(),
    Estado:z.string(),
    fecha_creacion:z.string()
})
export const GetLaboraArray= z.array(laboraArray);

const GetLaboraShcemass = z.object({
    id_laboratorio:z.number(),
    nombre:z.string(),
    Estado:z.string(),
    img:z.string(),
    fecha_creacion:z.string()
})
type laboraType = z.infer<typeof GetLaboraShcemass>
export type CreateLab=Pick<laboraType,'nombre'|'img'>
export type UpdateLabo=Pick<laboraType,'nombre'| 'img'| 'id_laboratorio'>
export type DeletLabora = Pick<laboraType,'mid_laboratorio'>
