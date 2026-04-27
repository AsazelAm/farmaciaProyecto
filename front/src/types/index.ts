import { z } from "zod";

export const LoginShcema = z.object({
  email: z
    .string()
    .min(1, { message: "El Email es Obligatorio" })
    .email({ message: "Email no valido" }),
  passwd: z.string().min(8, { message: "Minimo 8 Caracteres" }),
});
//TYPE USUARIO
export const UserSchema = z.object({
  id_usuario: z.number(),
  ci: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  img: z.string().nullable(),
  telefono: z.string().nullable(),
  email: z.string().nullable(),
  ultimoAcceso: z.string().nullable().optional(),
  id_tipo_us: z.number(),
  id_sucursal: z.number(),
  nombreSucursal: z.string().optional(),
  name_rol: z.string(),
});
export const GetUserSchema = z.array(UserSchema);

const GetUsuarioSchema= z.object({
    id_usuario: z.number(),
  ci: z.string(),
  nombre: z.string(),
  name_rol:z.string(),
  apellido: z.string(),
  img: z.string().nullable(),
  passwd: z.string(),
  passwd_Confirmation: z.string(),
  telefono: z.string().nullable(),
  email: z.string().nullable(),
  ultimoAcceso: z.string().nullable(),
  id_tipo_us: z.number(),
  id_sucursal: z.number(),
});
type Admins = z.infer<typeof GetUsuarioSchema>
export type CreateAdmins = Pick<Admins,'ci'|'nombre'|'apellido'|'img'|'passwd'|'passwd_Confirmation'|'telefono'|'email'|'id_tipo_us'|'id_sucursal'>
export type deleteuser = Pick<Admins,'id_usuario'>
export type updateuser = Pick<Admins,'ci'|'nombre'|'apellido'|'img'|'telefono'|'email'|'id_tipo_us'|'id_sucursal'|'id_usuario'|'name_rol'>
//Auth get user
export const GetAuthUsers = z.object({
  id_user: z.number(),
  id_tipo_us: z.number(),
  nombre: z.string(),
});

export const GetAuthUserSchema = z.array(GetAuthUsers);

const GetUserShcemass = z.object({
  id_user: z.number(),
  nombre: z.string(),
  id_tipo_us: z.number(),
  name_rol: z.string(),
  ci: z.string().nullable(),
  F_inicio: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), { message: "Fecha inválida" })
    .transform((date) => date.split("T")[0])
    .nullable(),
  email: z.string().nullable(),
  estado: z.number().nullable(),
  passwd: z.string(),
});

type Users = z.infer<typeof GetUserShcemass>;

export type UpdateEstado = Pick<Users, "id_user" | "estado">;
export type AuthUser = Pick<Users, "email" | "passwd">;
export type AuthRol = Pick<Users, "id_tipo_us">;

//Type Tipo_us
export const tipo_usArray = z.object({
  id_tipo_us: z.number(),
  name_rol: z.string(),
});
export const TipoUsShcemas = z.array(tipo_usArray);

const GetTipo_usShcemass = z.object({
  id_tipo_us: z.number(),
  name_rol: z.string(),
});
type Tipo_usType = z.infer<typeof GetTipo_usShcemass>;
export type CreateTipo_us = Pick<Tipo_usType, "name_rol">;
export type UpdateTipo_us = Pick<Tipo_usType, "name_rol" | "id_tipo_us">;
export type DeleteTipo_us = Pick<Tipo_usType, "id_tipo_us">;

//Type SUCURSAL
export const sucursalArray = z.object({
  id_sucursal: z.number(),
  nombre: z.string(),
});
export const SucursalShcemas = z.array(sucursalArray);

const GetSucursalShcemass = z.object({
  id_sucursal: z.number(),
  nombre: z.string(),
});
type SucurType = z.infer<typeof GetSucursalShcemass>;
export type CreateSucursal = Pick<SucurType, "nombre">;
export type UpdateSucursal = Pick<SucurType, "nombre" | "id_sucursal">;
export type DeleteSucursal = Pick<SucurType, "id_sucursal">;

//type LABORATORIO
export const laboraArray = z.object({
  id_laboratorio: z.number(),
  nombre: z.string(),
  img: z.string().nullable(),
  fechaCreacion: z.string(),
});
export const LaboraShcemas = z.array(laboraArray);

const GetLaboraShcemass = z.object({
  id_laboratorio: z.number(),
  nombre: z.string(),
  estado: z.string(),
  img: z.string().nullable(),
  fechaCreacion: z.string(),
});
type LaboraType = z.infer<typeof GetLaboraShcemass>;
export type CreateLab = Pick<LaboraType,'nombre'> & { img: FileList | null };
export type UpdateLabo = Pick<LaboraType, "nombre" | "img" | "id_laboratorio"|"fechaCreacion">;
export type DeletLabora = Pick<LaboraType, "id_laboratorio">;

//Type Tipo Producto
export const tipoProdArray = z.object({
  id_tipo_prod: z.number(),
  nombre: z.string(),
  fechaCreacion: z.string(),
});
export const TipoProdShcemas = z.array(tipoProdArray);

const GetTipoProdShcemass = z.object({
  id_tipo_prod: z.number(),
  nombre: z.string(),
  Estado: z.string(),
  fechaCreacion: z.string(),
});
type TipoProdType = z.infer<typeof GetTipoProdShcemass>;
export type CreateTipoProd = Pick<TipoProdType, "nombre">;
export type UpdateTipoProd = Pick<TipoProdType, "nombre" | "id_tipo_prod"|'fechaCreacion'>;
export type DeleteTipoProd = Pick<TipoProdType, "id_tipo_prod">;

//Type Presentacion
export const presentacionArray = z.object({
  id_presentacion: z.number(),
  nombre: z.string(),
  fechaCreacion: z.string(),
});
export const PresentaShcemas = z.array(presentacionArray);

const GetPresentaShcemass = z.object({
  id_presentacion: z.number(),
  nombre: z.string(),
  fechaCreacion: z.string(),
});
type PresentaType = z.infer<typeof GetPresentaShcemass>;
export type CreatePresenta = Pick<PresentaType, "nombre">;
export type UpdatePresenta = Pick<PresentaType, "nombre" | "id_presentacion"|"fechaCreacion">;
export type DeletePresenta = Pick<PresentaType, "id_presentacion">;

//Type Cliente
export const ClienteArray = z.object({
  id_cliente: z.number(),
  ci: z.string().nullable(),
  nombre: z.string(),
  apellido: z.string().nullable(),
  telefono: z.string().nullable(),
  email: z.string().nullable(),
  fechaCreacion: z.string(),
});
export const ClienteShcemas = z.array(ClienteArray);

const GetClienteShcemass = z.object({
  id_cliente: z.number().nullable(),
  ci: z.string().nullable(),
  nombre: z.string(),
  apellido: z.string().nullable(),
  telefono: z.string().nullable(),
  email: z.string().nullable(),
  fechaCreacion: z.string(),
});
type ClienteType = z.infer<typeof GetClienteShcemass>;
export type CreateCliente = Pick<
  ClienteType,
  "ci" | "nombre" | "apellido" | "telefono" | "email"
>;
export type UpdateCliente = Pick<
  ClienteType,
  "ci" | "nombre" | "apellido" | "telefono" | "email" | "id_cliente"
>;
export type DeleteCliente = Pick<ClienteType, "id_cliente">;

//Type Proveedor
export const ProveedorArray = z.object({
  id_proveedor: z.number(),
  codigo: z.string(),
  nombre: z.string(),
  telefono: z.string().nullable(),
  email: z.string().nullable(),
  direccion: z.string().nullable(),
  contacto_principal: z.string().nullable(),
  fechaCreacion: z.string(),
});
export const ProveedorShcemas = z.array(ProveedorArray);

const GetProveedorShcemass = z.object({
  id_proveedor: z.number(),
  codigo: z.string(),
  nombre: z.string(),
  telefono: z.string().nullable(),
  email: z.string().nullable(),
  direccion: z.string().nullable(),
  contactoPrincipal: z.string().nullable(),
  fechaCreacion: z.string(),
});
type ProveedorType = z.infer<typeof GetProveedorShcemass>;
export type CreateProveedor = Pick<
  ProveedorType,
  | "codigo"
  | "nombre"
  | "telefono"
  | "email"
  | "direccion"
  | "contactoPrincipal"
>;
export type UpdateProveedor = Pick<
  ProveedorType,
  | "codigo"
  | "nombre"
  | "telefono"
  | "email"
  | "direccion"
  | "contactoPrincipal"
  | "id_proveedor"
>;
export type DeleteProveedor = Pick<ProveedorType, "id_proveedor">;
