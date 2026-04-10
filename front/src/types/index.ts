
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

//Type Tipo_us
export const tipo_usArray=z.object({
    id_tipo_us:z.number(),
    name_rol:z.string(),
})
export const GetTipo_usArray=z.array(tipo_usArray)

const GetTipo_usShcemass=z.object({
    id_tipo_us:z.number(),
    name_rol:z.string(),
})
type Tipo_usType=z.infer<typeof GetTipo_usShcemass>
export type CreateTipo_us=Pick<Tipo_usType,'name_rol'>
export type UpdateTipo_us=Pick<Tipo_usType,'name_rol'|'id_tipo_us'>
export type DeleteTipo_us=Pick<Tipo_usType,'id_tipo_us'>


//type LABORATORIO
export const laboraArray=z.object({
    id_laboratorio:z.number(),
    nombre:z.string(),
    img:z.string().nullable(),
    Estado:z.string(),
    fecha_creacion:z.string()
})
export const GetLaboraArray= z.array(laboraArray);

const GetLaboraShcemass = z.object({
    id_laboratorio:z.number(),
    nombre:z.string(),
    Estado:z.string(),
    img:z.string().nullable(),
    fecha_creacion:z.string()
})
type LaboraType = z.infer<typeof GetLaboraShcemass>
export type CreateLab=Pick<LaboraType,'nombre'|'img'>
export type UpdateLabo=Pick<LaboraType,'nombre'| 'img'| 'id_laboratorio'>
export type DeletLabora = Pick<LaboraType,'id_laboratorio'>


//Type Tipo Producto
export const tipoProdArray=z.object({
    id_tipo_prod:z.number(),
    nombre:z.string(),
    Estado:z.string(),
    fecha_creacion:z.string()
})
export const GetTipoProdArray=z.array(tipoProdArray);

const GetTipoProdShcemass =z.object({
    id_tipo_prod:z.number(),
    nombre:z.string(),
    Estado:z.string(),
    fecha_creacion:z.string()
})
type TipoProdType=z.infer<typeof GetTipoProdShcemass>
export type CreateTipoProd=Pick<TipoProdType, 'nombre'>
export type UpdateTipoProd=Pick<TipoProdType, 'nombre'|'id_tipo_prod'>
export type DeleteTipoProd=Pick<TipoProdType, 'id_tipo_prod'>


//Type Presentacion 
export const presentacionArray=z.object({
    id_presentacion:z.number(),
    nombre:z.string(),
    fecha_creacion:z.string()
})
export const GetPresentArray=z.array(presentacionArray)

const GetPresentaShcemass=z.object({
    id_presentacion:z.number(),
    nombre:z.string(),
    fecha_creacion:z.string()
})
type PresentaType =z.infer<typeof GetPresentaShcemass>
export type CreatePresenta=Pick<PresentaType,'nombre'>
export type UpdatePresenta=Pick<PresentaType,'nombre'|'id_presentacion'>
export type DeletePresenta=Pick<PresentaType,'id_presentacion'>


//Type Cliente
export const ClienteArray=z.object({
    id_cliente:z.number(),
    ci:z.string().nullable(),
    nombre:z.string(),
    apellido:z.string().nullable(),
    telefono:z.string().nullable(),
    email:z.string().nullable(),
    fecha_creacion:z.string()
})
export const GetClienteArray=z.array(ClienteArray)

const GetClienteShcemass=z.object({
    id_cliente:z.number().nullable(),
    ci:z.string().nullable(),
    nombre:z.string(),
    apellido:z.string().nullable(),
    telefono:z.string().nullable(),
    email:z.string().nullable(),
    fecha_creacion:z.string()
})
type ClienteType=z.infer<typeof GetClienteShcemass>
export type CreateCliente=Pick<ClienteType,'ci'|'nombre'|'apellido'|'telefono'|'email'>
export type UpdateCliente=Pick<ClienteType,'ci'|'nombre'|'apellido'|'telefono'|'email'|'id_cliente'>
export type DeleteCliente=Pick<ClienteType,'id_cliente'>

//Type Proveedor
export const ProveedorArray=z.object({
    id_proveedor:z.number(),
    codigo:z.string(),
    nombre:z.string(),
    telefono:z.string().nullable(),
    email:z.string().nullable(),
    direccion:z.string().nullable(),
    contacto_principal:z.string().nullable(),
    fecha_creacion:z.string()
})
export const GetProveedorArray=z.array(ProveedorArray)

const GetProveedorShcemass=z.object({
    id_proveedor:z.number(),
    codigo:z.string(),
    nombre:z.string(),
    telefono:z.string().nullable(),
    email:z.string().nullable(),
    direccion:z.string().nullable(),
    contacto_principal:z.string().nullable(),
    fecha_creacion:z.string()
})
type ProveedorType=z.infer<typeof GetProveedorShcemass>
export type CreateProveedor=Pick<ProveedorType,'codigo'|'nombre'|'telefono'|'email'|'direccion'|'contacto_principal'>
export type UpdateProveedor=Pick<ProveedorType,'codigo'|'nombre'|'telefono'|'email'|'direccion'|'contacto_principal'|'id_proveedor'>
export type DeleteProveedor=Pick<ProveedorType,'id_proveedor'>