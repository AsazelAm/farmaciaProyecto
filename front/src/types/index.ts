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
  idUsuario: z.number(),
  ci: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  img: z.string().nullable(),
  telefono: z.string().nullable(),
  email: z.string(),
  ultimoAcceso: z.string().nullable().optional(),
  idTipoUs: z.number(),
  idSucursal: z.number(),
  nombreSucursal: z.string().optional(),
  nameRol: z.string(),
});
export const GetUserSchema = z.array(UserSchema);

const GetUsuarioSchema= z.object({
    idUsuario: z.number(),
  ci: z.string(),
  nombre: z.string(),
  nameRol:z.string(),
  apellido: z.string(),
  img: z.string().nullable(),
  passwd: z.string(),
  passwd_Confirmation: z.string(),
  telefono: z.string().nullable(),
  email: z.string(),
  ultimoAcceso: z.string().nullable(),
  idTipoUs: z.number(),
  idSucursal: z.number(),
  nombreSucursal: z.string().optional(),
});
type Admins = z.infer<typeof GetUsuarioSchema>
export type CreateAdmins = Pick<Admins,'ci'|'nombre'|'apellido'|'img'|'passwd'|'passwd_Confirmation'|'telefono'|'email'|'idTipoUs'|'idSucursal'>
export type deleteuser = Pick<Admins,'idUsuario'>
export type updateuser = Pick<
  Admins,
  'ci' | 'nombre' | 'apellido' | 'img' | 'telefono' | 'email' |
  'idTipoUs' | 'idSucursal' | 'idUsuario' | 'nameRol'
> & { nombreSucursal?: string };
//Auth get user
export const GetAuthUsers = z.object({
  idUsuario: z.number(),
  idTipoUs: z.number(),
  nombre: z.string(),
});

export const GetAuthUserSchema = z.array(GetAuthUsers);

const GetUserShcemass = z.object({
  idUsuario: z.number(),
  nombre: z.string(),
  idTipoUs: z.number(),
  nameRol: z.string(),
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

export type UpdateEstado = Pick<Users, "idUsuario" | "estado">;
export type AuthUser = Pick<Users, "email" | "passwd">;
export type AuthRol = Pick<Users, "idTipoUs">;

//Type Tipo_us
export const tipo_usArray = z.object({
  idTipoUs: z.number(),
  nameRol: z.string(),
});
export const TipoUsShcemas = z.array(tipo_usArray);

const GetTipo_usShcemass = z.object({
  idTipoUs: z.number(),
  nameRol: z.string(),
});
type Tipo_usType = z.infer<typeof GetTipo_usShcemass>;
export type CreateTipo_us = Pick<Tipo_usType, "nameRol">;
export type UpdateTipo_us = Pick<Tipo_usType, "nameRol" | "idTipoUs">;
export type DeleteTipo_us = Pick<Tipo_usType, "idTipoUs">;

//Type SUCURSAL
export const sucursalArray = z.object({
  idSucursal: z.number(),
  nombre: z.string(),
});
export const SucursalShcemas = z.array(sucursalArray);

const GetSucursalShcemass = z.object({
  idSucursal: z.number(),
  nombre: z.string(),
});
type SucurType = z.infer<typeof GetSucursalShcemass>;
export type CreateSucursal = Pick<SucurType, "nombre">;
export type UpdateSucursal = Pick<SucurType, "nombre" | "idSucursal">;
export type DeleteSucursal = Pick<SucurType, "idSucursal">;

//type LABORATORIO
export const laboraArray = z.object({
  idLaboratorio: z.number(),
  nombre: z.string(),
  img: z.string().nullable(),
  fechaCreacion: z.string(),
});
export const LaboraShcemas = z.array(laboraArray);

const GetLaboraShcemass = z.object({
  idLaboratorio: z.number(),
  nombre: z.string(),
  estado: z.string(),
  img: z.string().nullable(),
  fechaCreacion: z.string(),
});
type LaboraType = z.infer<typeof GetLaboraShcemass>;
export type CreateLab = Pick<LaboraType,'nombre'> & { img: FileList | null };
export type UpdateLabo = Pick<LaboraType, "nombre" | "img" | "idLaboratorio"|"fechaCreacion">;
export type DeletLabora = Pick<LaboraType, "idLaboratorio">;

//Type Tipo Producto
export const tipoProdArray = z.object({
  idTipoProd: z.number(),
  nombre: z.string(),
  fechaCreacion: z.string(),
});
export const TipoProdShcemas = z.array(tipoProdArray);

const GetTipoProdShcemass = z.object({
  idTipoProd: z.number(),
  nombre: z.string(),
  estado: z.string(),
  fechaCreacion: z.string(),
});
type TipoProdType = z.infer<typeof GetTipoProdShcemass>;
export type CreateTipoProd = Pick<TipoProdType, "nombre">;
export type UpdateTipoProd = Pick<TipoProdType, "nombre" | "idTipoProd"|'fechaCreacion'>;
export type DeleteTipoProd = Pick<TipoProdType, "idTipoProd">;

//Type Presentacion
export const presentacionArray = z.object({
  idPresentacion: z.number(),
  nombre: z.string(),
  fechaCreacion: z.string(),
});
export const PresentaShcemas = z.array(presentacionArray);

const GetPresentaShcemass = z.object({
  idPresentacion: z.number(),
  nombre: z.string(),
  fechaCreacion: z.string(),
});
type PresentaType = z.infer<typeof GetPresentaShcemass>;
export type CreatePresenta = Pick<PresentaType, "nombre">;
export type UpdatePresenta = Pick<PresentaType, "nombre" | "idPresentacion"|"fechaCreacion">;
export type DeletePresenta = Pick<PresentaType, "idPresentacion">;

//Type Cliente
export const ClienteArray = z.object({
  idCliente: z.number(),
  ci: z.string().nullable(),
  nombre: z.string(),
  apellido: z.string().nullable(),
  telefono: z.string().nullable(),
  email: z.string().nullable(),
  fechaCreacion: z.string(),
});
export const ClienteShcemas = z.array(ClienteArray);

const GetClienteShcemass = z.object({
  idCliente: z.number().nullable(),
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
  "ci" | "nombre" | "apellido" | "telefono" | "email" | "idCliente" | "fechaCreacion"
>;
export type DeleteCliente = Pick<ClienteType, "idCliente">;

//Type Proveedor
export const ProveedorArray = z.object({
  idProveedor: z.number(),
  codigo: z.string(),
  nombre: z.string(),
  telefono: z.string().nullable(),
  email: z.string().nullable(),
  direccion: z.string().nullable(),
  contactoPrincipal: z.string().nullable(),
  fechaCreacion: z.string(),
});
export const ProveedorShcemas = z.array(ProveedorArray);

const GetProveedorShcemass = z.object({
  idProveedor: z.number(),
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
  | "contactoPrincipal"|"fechaCreacion"
  | "idProveedor"
>;
export type DeleteProveedor = Pick<ProveedorType, "idProveedor">;

//Type Producto
export const ProductoArray = z.object({
  idProducto:          z.number(),
  codigoBarra:         z.string(),
  nombreGenerico:      z.string(),
  nombreComercial:     z.string().nullable(),
  concentracion:       z.string().nullable(),
  descripcion:         z.string().nullable(),
  precio:              z.union([z.number(), z.string()]).transform(Number),
  img:                 z.string().nullable(),
  requiereReceta:      z.union([z.number(), z.boolean()]).transform(Number),
  fechaCreacion:       z.string(),
  fechaModificacion:   z.string().optional(),
  contraindicaciones:  z.string().nullable(),
  viaAdministracion:   z.string().nullable(),
  stockMinimo:         z.union([z.number(), z.string()]).transform(Number),
  estado:              z.number().optional(),
  idLaboratorio:       z.number(),
  idTipoProd:          z.number(),
  idPresentacion:      z.number(),
  nombreLaboratorio:   z.string().optional(),
  nombreTipoProd:      z.string().optional(),
  nombrePresentacion:  z.string().optional(),
});
export const ProductoShcemass = z.array(ProductoArray);

type ProductoType = z.infer<typeof ProductoArray>;

export type CreateProducto = Pick<
  ProductoType,
  | 'codigoBarra'
  | 'nombreGenerico'
  | 'nombreComercial'
  | 'concentracion'
  | 'descripcion'
  | 'precio'
  | 'requiereReceta'
  | 'contraindicaciones'
  | 'viaAdministracion'
  | 'stockMinimo'
  | 'idLaboratorio'
  | 'idTipoProd'
  | 'idPresentacion'
> & { img?: FileList | null };

export type UpdateProducto = Pick<
  ProductoType,
  | 'idProducto'
  | 'codigoBarra'
  | 'nombreGenerico'
  | 'nombreComercial'
  | 'concentracion'
  | 'descripcion'
  | 'precio'
  | 'requiereReceta'
  | 'contraindicaciones'
  | 'viaAdministracion'
  | 'stockMinimo'
  | 'idLaboratorio'
  | 'idTipoProd'
  | 'idPresentacion'
  | 'img'
  | 'fechaCreacion'
  | 'nombreLaboratorio'
  | 'nombreTipoProd'
  | 'nombrePresentacion'
> & { newImg?: FileList | null };

export type DeleteProducto = Pick<ProductoType, 'idProducto'>;
