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


//type Lote
export const LoteArray = z.object({
    idLote: z.number(),
    codigo:z.string(),
    numeroLote:z.string(),
    stock:z.number(),
    fechaVencimiento:z.string(),
    precioCompra:z.number(),
    fechaIngreso:z.string(),
    fechaCreacion:z.string(),
    fechaModificacion:z.string(),
    fechaFabricacion:z.string(),
    estado:z.number(),
    idProducto:z.number(),
    idProveedor:z.number(),
});


// ========================================================================
// TYPES: COMPRA, DETALLE COMPRA Y LOTES (MÓDULO DE COMPRAS)
// ========================================================================

// 1. Schema para DetalleCompra (Lo que devuelve el backend al consultar una compra)
export const DetalleCompraSchema = z.object({
  cantidad: z.number(),
  precioUnitario: z.union([z.number(), z.string()]).transform(Number),
  descuento: z.union([z.number(), z.string()]).transform(Number),
  subtotal: z.union([z.number(), z.string()]).transform(Number),
  estadoDetalle: z.enum(['activo', 'anulado']).optional(),
  // Campos extraídos del JOIN con Lote y Producto
  idLote: z.number().optional(),
  numeroLote: z.string().optional(),
  codigo: z.string().optional(),
  fechaVencimiento: z.string().optional(),
  fechaFabricacion: z.string().nullable().optional(),
  diasParaVencer: z.number().optional(),
  stock: z.number().optional(),
  precioCompra: z.union([z.number(), z.string()]).transform(Number).optional(),
  estadoLote: z.string().optional(),
  codigoBarra: z.string().optional(),
  concentracion: z.string().nullable().optional(),
  nombreGenerico: z.string().optional(),
  nombreComercial: z.string().nullable().optional(),
  nombreLaboratorio: z.string().optional(),
});

export type DetalleCompraType = z.infer<typeof DetalleCompraSchema>;

// 2. Schema para la Compra (Lectura)
export const CompraSchema = z.object({
  idCompra: z.number(),
  numeroFactura: z.string().nullable(),
  fechaCreacion: z.string(),
  fechaEntrega: z.string().nullable().optional(),
  subtotal: z.union([z.number(), z.string()]).transform(Number),
  descuento: z.union([z.number(), z.string()]).transform(Number),
  impuesto: z.union([z.number(), z.string()]).transform(Number),
  total: z.union([z.number(), z.string()]).transform(Number),
  estado: z.enum(['pendiente', 'completado', 'cancelado']),
  observaciones: z.string().nullable().optional(),
  fechaModificacion: z.string().optional(),
  // Campos del JOIN
  proveedor: z.string().optional(),
  proveedorTelefono: z.string().nullable().optional(),
  proveedorContacto: z.string().nullable().optional(),
  usuario: z.string().optional(),
  usuarioRol: z.string().optional(),
  sucursal: z.string().optional(),
  sucursalDireccion: z.string().nullable().optional(),
  totalLotes: z.number().optional(),
  // Detalles (solo viene cuando pedimos por ID)
  detalles: z.array(DetalleCompraSchema).optional(),
});

export const CompraListSchema = z.array(CompraSchema);
export type CompraType = z.infer<typeof CompraSchema>;

// 3. Schemas para Creación/Actualización (Inputs)
export const LoteInputSchema = z.object({
  idProducto: z.number(),
  codigo: z.string(),
  numeroLote: z.string(),
  stock: z.number().min(1, 'El stock debe ser mayor a 0'),
  precioCompra: z.number().min(0.01, 'El precio debe ser válido'),
  descuento: z.number().default(0),
  fechaVencimiento: z.string(),
  fechaFabricacion: z.string().nullable().optional(),
});

export const CreateCompraSchema = z.object({
  numeroFactura: z.string().optional(),
  idProveedor: z.number(),
  idSucursal: z.number(),
  fechaEntrega: z.string().optional(),
  descuento: z.number(),
  impuesto: z.number(),
  subtotal: z.number(),
  total: z.number(),
  observaciones: z.string().optional(),
  lotes: z.array(LoteInputSchema).min(1, 'Debe agregar al menos un lote'),
  idUsuario: z.number().optional(), // Opcional si el backend lo toma del token
});

export type ILoteInput = z.infer<typeof LoteInputSchema>;
export type CreateCompraType = z.infer<typeof CreateCompraSchema>;
export type UpdateCompraType = CreateCompraType; // La estructura de update es la misma en tu controlador

// 4. Schema para Filtros de Búsqueda
export const CompraFiltrosSchema = z.object({
  estado: z.enum(['pendiente', 'completado', 'cancelado']).optional(),
  idProveedor: z.number().optional(),
  idSucursal: z.number().optional(),
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
  pagina: z.number().optional(),
  porPagina: z.number().optional(),
});

export type ICompraFiltros = z.infer<typeof CompraFiltrosSchema>;

// 5. Schema para Estadísticas del Dashboard
export const CompraEstadisticasSchema = z.object({
  porEstado: z.array(z.any()), // array de {estado, cantidad, monto}
  totalMes: z.number(),
  totalMesAnterior: z.number(),
  porProveedor: z.array(z.any()), // array de {nombre, cantidad, monto}
  lotesProximosVencer: z.number(),
});

export type CompraEstadisticasType = z.infer<typeof CompraEstadisticasSchema>;

// ========================================================================
// AGREGAR ESTO A TU types/index.ts (reemplaza el LoteArray simple existente)
// ========================================================================

// ── Schema de Lote (listado, con datos de producto y proveedor) ────────────
export const LoteListItemSchema = z.object({
  idLote: z.number(),
  codigo: z.string(),
  numeroLote: z.string(),
  stock: z.number(),
  fechaVencimiento: z.string(),
  precioCompra: z.union([z.number(), z.string()]).transform(Number),
  fechaIngreso: z.string(),
  fechaCreacion: z.string(),
  fechaModificacion: z.string(),
  fechaFabricacion: z.string().nullable(),
  estado: z.enum(['pendiente', 'activo', 'vencido', 'cancelado']),
  idProducto: z.number(),
  idProveedor: z.number(),
  // Datos del JOIN
  nombreGenerico: z.string(),
  nombreComercial: z.string().nullable(),
  codigoBarra: z.string().optional(),
  proveedor: z.string(),
  diasParaVencer: z.number(),
});

export const LoteListSchema = z.array(LoteListItemSchema);
export type LoteListItemType = z.infer<typeof LoteListItemSchema>;

// ── Filtros de búsqueda de lotes ────────────────────────────────────────────
export const LoteFiltrosSchema = z.object({
  estado: z.enum(['pendiente', 'activo', 'vencido', 'cancelado']).optional(),
  idProducto: z.number().optional(),
  idProveedor: z.number().optional(),
  soloProximosVencer: z.boolean().optional(),
  busqueda: z.string().optional(),
  pagina: z.number().optional(),
  porPagina: z.number().optional(),
});

export type ILoteFiltros = z.infer<typeof LoteFiltrosSchema>;


// ========================================================================
// TYPES: VENTA, DETALLE VENTA Y FACTURA (MÓDULO DE VENTAS)
// ========================================================================

// 1. Schema para DetalleVenta (Lo que devuelve el backend al consultar una venta)
export const DetalleVentaSchema = z.object({
  cantidad: z.number(),
  precioUnitario: z.union([z.number(), z.string()]).transform(Number),
  descuento: z.union([z.number(), z.string()]).transform(Number),
  subtotal: z.union([z.number(), z.string()]).transform(Number),
  // Campos extraídos del JOIN con Lote y Producto
  idLote: z.number().optional(),
  numeroLote: z.string().optional(),
  codigo: z.string().optional(),
  fechaVencimiento: z.string().optional(),
  diasParaVencer: z.number().optional(),
  idProducto: z.number().optional(),
  codigoBarra: z.string().optional(),
  nombreGenerico: z.string().optional(),
  nombreComercial: z.string().nullable().optional(),
  concentracion: z.string().nullable().optional(),
  requiereReceta: z.union([z.number(), z.boolean()]).optional(),
  nombreLaboratorio: z.string().optional(),
});

export type DetalleVentaType = z.infer<typeof DetalleVentaSchema>;

// 2. Schema para la Factura asociada a una venta
export const FacturaSchema = z.object({
  idFactura: z.number(),
  numeroFactura: z.string(),
  fechaEmision: z.string(),
  tipoFactura: z.string(),
  nitCliente: z.string().nullable().optional(),
  razonSocial: z.string().nullable().optional(),
  estado: z.enum(['emitida', 'anulada']),
  fechaAnulacion: z.string().nullable().optional(),
  motivoAnulacion: z.string().nullable().optional(),
});

export type FacturaType = z.infer<typeof FacturaSchema>;

// 3. Schema para la Venta (Lectura)
export const VentaSchema = z.object({
  idVenta: z.number(),
  fechaCreacion: z.string(),
  fechaModificaion: z.string().optional(), // OJO: coincide con el typo de la tabla/model
  subtotal: z.union([z.number(), z.string()]).transform(Number),
  descuentoTotal: z.union([z.number(), z.string()]).transform(Number),
  impuestos: z.union([z.number(), z.string()]).transform(Number),
  total: z.union([z.number(), z.string()]).transform(Number),
  estado: z.enum(['pendiente', 'completada', 'anulada']),
  tipoPago: z.string().nullable().optional(),
  observaciones: z.string().nullable().optional(),
  // Campos del JOIN
  cliente: z.string().optional(),
  clienteNit: z.string().nullable().optional(),
  clienteTelefono: z.string().nullable().optional(),
  usuario: z.string().optional(),
  usuarioRol: z.string().optional(),
  sucursal: z.string().optional(),
  sucursalDireccion: z.string().nullable().optional(),
  // Campos calculados en listar()
  totalItems: z.number().optional(),
  idFactura: z.number().nullable().optional(),
  // Detalles y factura (solo vienen cuando pedimos por ID)
  detalles: z.array(DetalleVentaSchema).optional(),
  factura: FacturaSchema.nullable().optional(),
});

export const VentaListSchema = z.array(VentaSchema);
export type VentaType = z.infer<typeof VentaSchema>;

// 4. Schemas para Creación/Actualización (Inputs)
export const DetalleVentaInputSchema = z.object({
  idProducto: z.number(),
  idLote: z.number(),
  cantidad: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  precioUnitario: z.number().min(0.01, 'El precio debe ser válido'),
  descuento: z.number().default(0),
});

export const CreateVentaSchema = z.object({
  idCliente: z.number(),
  idSucursal: z.number(),
  tipoPago: z.string().optional(),
  descuentoTotal: z.number(),
  impuestos: z.number(),
  subtotal: z.number(),
  total: z.number(),
  observaciones: z.string().optional(),
  detalles: z.array(DetalleVentaInputSchema).min(1, 'Debe agregar al menos un producto'),
  idUsuario: z.number().optional(), // Opcional si el backend lo toma del token
});

export type IDetalleVentaInput = z.infer<typeof DetalleVentaInputSchema>;
export type CreateVentaType = z.infer<typeof CreateVentaSchema>;
export type UpdateVentaType = CreateVentaType; // La estructura de update es la misma en tu controlador

// 5. Schema para cambio de estado (Completar / Anular / Volver a pendiente)
export const ChangeEstadoVentaSchema = z.object({
  estado: z.enum(['pendiente', 'completada', 'anulada']),
  motivo: z.string().optional(), // Solo se usa cuando estado === 'anulada'
});

export type ChangeEstadoVentaType = z.infer<typeof ChangeEstadoVentaSchema>;

// 6. Schema para emitir factura
export const FacturaInputSchema = z.object({
  tipoFactura: z.string().min(1, 'Debe especificar el tipo de factura'),
  nitCliente: z.string().optional(),
  razonSocial: z.string().optional(),
});

export type IFacturaInput = z.infer<typeof FacturaInputSchema>;

// 7. Schema para Filtros de Búsqueda
export const VentaFiltrosSchema = z.object({
  estado: z.enum(['pendiente', 'completada', 'anulada']).optional(),
  idCliente: z.number().optional(),
  idUsuario: z.number().optional(),
  idSucursal: z.number().optional(),
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
  pagina: z.number().optional(),
  porPagina: z.number().optional(),
});

export type IVentaFiltros = z.infer<typeof VentaFiltrosSchema>;

// 8. Schema para Estadísticas del Dashboard
export const VentaEstadisticasSchema = z.object({
  porEstado: z.array(z.any()), // array de {estado, cantidad, monto}
  totalMes: z.number(),
  totalMesAnterior: z.number(),
  porSucursal: z.array(z.any()), // array de {nombre, cantidad, monto}
  masVendidos: z.array(z.any()), // array de {nombreGenerico, unidadesVendidas, monto}
});

export type VentaEstadisticasType = z.infer<typeof VentaEstadisticasSchema>;

// ========================================================================
// AGREGAR ESTO A TU types/index.ts (lotes disponibles para el POS)
// ========================================================================

// ── Schema de lote disponible para vender (selector FEFO en el POS) ────────
export const LoteDisponibleSchema = z.object({
  idLote: z.number(),
  numeroLote: z.string(),
  codigo: z.string(),
  stock: z.number(),
  fechaVencimiento: z.string(),
  precioCompra: z.union([z.number(), z.string()]).transform(Number),
});

export const LotesDisponiblesSchema = z.array(LoteDisponibleSchema);
export type LoteDisponibleType = z.infer<typeof LoteDisponibleSchema>;