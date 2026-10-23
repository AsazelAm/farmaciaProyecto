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
  confirmed: z.number().nullable(),
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

//Type Principio Activo
export const principioActivoArray = z.object({
  idPrincipioActivo: z.number(),
  nombre: z.string(),
  descripcion: z.string().nullable().optional(),
  fechaCreacion: z.string().optional(),
});
export const PrincipioActivoShcemas = z.array(principioActivoArray);

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
  idTipoProd:          z.number().nullable(),
  idPresentacion:      z.number(),
  nombreLaboratorio:   z.string().optional(),
  nombreTipoProd:      z.string().nullable().optional(),
  nombrePresentacion:  z.string().optional(),
  principiosActivos:   z.array(z.object({
    idPrincipioActivo: z.number(),
    nombre:            z.string(),
    concentracion:     z.string().nullable(),
  })).optional(),
  tiposProducto:       z.array(z.object({
    idTipoProd: z.number(),
    nombre:     z.string(),
  })).optional(),
});
export const ProductoShcemass = z.array(ProductoArray);

// ── Entradas para el alta/edición de producto ─────────────────────────────────
export interface ProductoPrincipioInput {
  idPrincipioActivo?: number;
  nombre?:            string;
  concentracion?:     string | null;
}

export interface ProductoTipoInput {
  idTipoProd?: number;
  nombre?:     string;
}

export type CreateProducto = {
  codigoBarra:         string;
  nombreComercial:     string;
  descripcion:         string;
  precio:              number;
  requiereReceta:      number;
  contraindicaciones:  string;
  viaAdministracion:   string;
  stockMinimo:         number;
  idLaboratorio:       number;
  nombreLaboratorio?:  string;
  idPresentacion:      number;
  nombrePresentacion?: string;
  principiosActivos:   ProductoPrincipioInput[];
  tiposProducto:       ProductoTipoInput[];
  img?:                FileList | null;
};

export type UpdateProducto = {
  idProducto:          number;
  codigoBarra:         string;
  nombreGenerico:      string;
  nombreComercial:     string | null;
  concentracion:       string | null;
  descripcion:         string | null;
  precio:              number;
  requiereReceta:      number;
  contraindicaciones:  string | null;
  viaAdministracion:   string | null;
  stockMinimo:         number;
  idLaboratorio:       number;
  idTipoProd:          number | null;
  idPresentacion:      number;
  img:                 string | null;
  fechaCreacion?:      string;
  nombreLaboratorio?:  string;
  nombreTipoProd?:     string | null;
  nombrePresentacion?: string;
  principiosActivos?:  ProductoPrincipioInput[];
  tiposProducto?:      ProductoTipoInput[];
  newImg?:             FileList | null;
};

export type DeleteProducto = Pick<z.infer<typeof ProductoArray>, 'idProducto'>;


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
  estado: z.enum(['pendiente', 'parcial', 'completado', 'cancelado', 'rechazado', 'devuelto_parcial', 'devuelto_total']),
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
  estado: z.enum(['pendiente', 'parcial', 'completado', 'cancelado', 'rechazado', 'devuelto_parcial', 'devuelto_total']).optional(),
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
  estado: z.enum(['pendiente', 'activo', 'vencido', 'cancelado', 'cuarentena', 'devuelto']),
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
  estado: z.enum(['pendiente', 'activo', 'vencido', 'cancelado', 'cuarentena', 'devuelto']).optional(),
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
  fechaModificacion: z.string().optional(), // OJO: coincide con el typo de la tabla/model
  subtotal: z.union([z.number(), z.string()]).transform(Number),
  descuentoTotal: z.union([z.number(), z.string()]).transform(Number),
  impuestos: z.union([z.number(), z.string()]).transform(Number),
  total: z.union([z.number(), z.string()]).transform(Number),
  estado: z.enum(['pendiente', 'completado', 'cancelado', 'devuelto_parcial', 'devuelto_total']),
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
  permitirDesvioFEFO: z.boolean().optional(),
  motivoDesvioFEFO: z.string().optional(),
  detalles: z.array(DetalleVentaInputSchema).min(1, 'Debe agregar al menos un producto'),
  idUsuario: z.number().optional(), // Opcional si el backend lo toma del token
});

export type IDetalleVentaInput = z.infer<typeof DetalleVentaInputSchema>;
export type CreateVentaType = z.infer<typeof CreateVentaSchema>;
export type UpdateVentaType = CreateVentaType; // La estructura de update es la misma en tu controlador

// 5. Schema para cambio de estado (Completar / Anular / Volver a pendiente)
export const ChangeEstadoVentaSchema = z.object({
  estado: z.enum(['pendiente', 'completado', 'cancelado']),
  motivo: z.string().optional(), // Solo se usa cuando estado === 'cancelado'
});

export type ChangeEstadoVentaType = z.infer<typeof ChangeEstadoVentaSchema>;

// 6. Schema para emitir factura
export const FacturaInputSchema = z.object({
  tipoFactura: z.string().min(1, 'Debe especificar el tipo de factura'),
  nitCliente: z.string().optional(),
  razonSocial: z.string().optional(),
});

export type IFacturaInput = z.infer<typeof FacturaInputSchema>;

// 6.1 Schema para datos de facturación previos de un cliente (histórico)
export const DatosFacturacionClienteSchema = z.array(
  z.object({
    nitCliente: z.string().nullable(),
    razonSocial: z.string().nullable(),
    ultimaVez: z.string(),
  })
);

export type DatosFacturacionClienteType = z.infer<
  typeof DatosFacturacionClienteSchema
>[number];

// 7. Schema para Filtros de Búsqueda
export const VentaFiltrosSchema = z.object({
  estado: z.enum(['pendiente', 'completado', 'cancelado', 'devuelto_parcial', 'devuelto_total']).optional(),
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

// ========================================================================
// TYPES: DASHBOARD PRINCIPAL (MÉTRICAS, GRÁFICOS Y ALERTAS)
// ========================================================================

// Valores DECIMAL/SUM llegan como string según el driver de MariaDB
const MontoLike = z.union([z.number(), z.string()]).transform(Number);

// ── Resumen de indicadores (KPIs) ────────────────────────────────────────────
export const DashboardKpisSchema = z.object({
  kpis: z.object({
    ventasTotales: z.object({
      cantidad: z.number(),
      monto: MontoLike,
    }),
    ventasHoy: z.object({
      cantidad: z.number(),
      monto: MontoLike,
    }),
    ventasMes: z.object({
      cantidad: z.number(),
      monto: MontoLike,
      comparativoMesAnterior: MontoLike,
    }),
    ventasPendientes: z.number(),
    ventasAnuladas: z.number(),
    totalClientes: z.number(),
    totalProductos: z.number(),
    totalUsuarios: z.number(),
    stockBajo: z.number(),
    lotesPorVencer: z.number(),
    lotesVencidos: z.number(),
  }),
});

export type DashboardKpisType = z.infer<typeof DashboardKpisSchema>;

// ── Serie de ventas por mes ──────────────────────────────────────────────────
export const VentaPorMesSchema = z.object({
  mes: z.string(),
  cantidad: z.number(),
  monto: MontoLike,
});
export const VentasPorMesesSchema = z.array(VentaPorMesSchema);
export type VentasPorMesesType = z.infer<typeof VentasPorMesesSchema>;

// ── Productos más vendidos ───────────────────────────────────────────────────
export const ProductoMasVendidoSchema = z.object({
  idProducto: z.number(),
  codigoBarra: z.string(),
  nombreGenerico: z.string(),
  nombreComercial: z.string().nullable(),
  unidades: z.number(),
  monto: MontoLike,
});
export const ProductosMasVendidosSchema = z.array(ProductoMasVendidoSchema);
export type ProductosMasVendidosType = z.infer<typeof ProductosMasVendidosSchema>;

// ── Ventas por estado ────────────────────────────────────────────────────────
export const VentaPorEstadoSchema = z.object({
  estado: z.string(),
  cantidad: z.number(),
  monto: MontoLike,
});
export const VentasPorEstadoSchema = z.array(VentaPorEstadoSchema);
export type VentasPorEstadoType = z.infer<typeof VentasPorEstadoSchema>;

// ── Ventas por sucursal ──────────────────────────────────────────────────────
export const VentaPorSucursalSchema = z.object({
  idSucursal: z.number(),
  nombre: z.string(),
  cantidad: z.number(),
  monto: MontoLike,
});
export const VentasPorSucursalSchema = z.array(VentaPorSucursalSchema);
export type VentasPorSucursalType = z.infer<typeof VentasPorSucursalSchema>;

// ── Ventas por forma de pago ─────────────────────────────────────────────────
export const VentaPorFormaPagoSchema = z.object({
  tipoPago: z.string(),
  cantidad: z.number(),
  monto: MontoLike,
});
export const VentasPorFormaPagoSchema = z.array(VentaPorFormaPagoSchema);
export type VentasPorFormaPagoType = z.infer<typeof VentasPorFormaPagoSchema>;

// ── Productos con stock bajo ─────────────────────────────────────────────────
export const StockBajoItemSchema = z.object({
  idProducto: z.number(),
  codigoBarra: z.string(),
  nombreGenerico: z.string(),
  nombreComercial: z.string().nullable(),
  stockMinimo: z.number(),
  stockTotal: z.number(),
});
export const StockBajoSchema = z.array(StockBajoItemSchema);
export type StockBajoType = z.infer<typeof StockBajoSchema>;

// ── Lotes próximos a vencer ──────────────────────────────────────────────────
export const LotePorVencerSchema = z.object({
  idLote: z.number(),
  numeroLote: z.string(),
  codigoLote: z.string(),
  stock: z.number(),
  fechaVencimiento: z.string(),
  diasParaVencer: z.number(),
  idProducto: z.number(),
  nombreGenerico: z.string(),
  nombreComercial: z.string().nullable(),
  concentracion: z.string().nullable(),
});
export const LotesPorVencerSchema = z.array(LotePorVencerSchema);
export type LotesPorVencerType = z.infer<typeof LotesPorVencerSchema>;

// ── Últimas ventas registradas ───────────────────────────────────────────────
export const UltimaVentaSchema = z.object({
  idVenta: z.number(),
  fechaCreacion: z.string(),
  subtotal: MontoLike,
  descuentoTotal: MontoLike,
  impuestos: MontoLike,
  total: MontoLike,
  estado: z.string(),
  tipoPago: z.string().nullable(),
  cliente: z.string().nullable(),
  usuario: z.string().nullable(),
  sucursal: z.string().nullable(),
});
export const UltimasVentasSchema = z.array(UltimaVentaSchema);
export type UltimasVentasType = z.infer<typeof UltimasVentasSchema>;

// ── Dashboard completo (respuesta de /GetDashboard) ──────────────────────────
export const DashboardSchema = z.object({
  resumen: DashboardKpisSchema,
  ventasPorMeses: VentasPorMesesSchema,
  productosMasVendidos: ProductosMasVendidosSchema,
  porEstado: VentasPorEstadoSchema,
  porSucursal: VentasPorSucursalSchema,
  porFormaPago: VentasPorFormaPagoSchema,
  stockBajo: StockBajoSchema,
  lotesPorVencer: LotesPorVencerSchema,
  ultimasVentas: UltimasVentasSchema,
});

export type DashboardType = z.infer<typeof DashboardSchema>;

// ========================================================================
// TYPES: REPORTES DE VENTAS (diario / semanal / mensual + Excel y PDF)
// ========================================================================

export const FrecuenciaReporteSchema = z.enum(["diario", "semanal", "mensual"]);
export type FrecuenciaReporte = z.infer<typeof FrecuenciaReporteSchema>;

export const MESES: Record<FrecuenciaReporte, string> = {
  diario: "Día",
  semanal: "Semana",
  mensual: "Mes",
};

// ── Fila de resumen agrupada por periodo ──────────────────────────────────────
export const ReportePeriodoSchema = z.object({
  unidad: z.string(),
  etiqueta: z.string(),
  cantidad: z.number(),
  subtotal: MontoLike,
  descuentoTotal: MontoLike,
  impuestos: MontoLike,
  total: MontoLike,
});
export const ReportePeriodosSchema = z.array(ReportePeriodoSchema);
export type ReportePeriodoType = z.infer<typeof ReportePeriodoSchema>;

// ── Venta individual del detalle del reporte ──────────────────────────────────
export const ReporteVentaDetalleSchema = z.object({
  idVenta: z.number(),
  numeroFactura: z.string().nullable(),
  fechaCreacion: z.string(),
  cliente: z.string().nullable(),
  usuario: z.string().nullable(),
  sucursal: z.string().nullable(),
  tipoPago: z.string().nullable(),
  estado: z.string(),
  subtotal: MontoLike,
  descuentoTotal: MontoLike,
  impuestos: MontoLike,
  total: MontoLike,
});
export const ReporteVentasDetalleSchema = z.array(ReporteVentaDetalleSchema);
export type ReporteVentaDetalleType = z.infer<typeof ReporteVentaDetalleSchema>;
export type ReporteVentasDetalleType = z.infer<typeof ReporteVentasDetalleSchema>;

// ── Totales del periodo (solo ventas completadas) ─────────────────────────────
export const ReporteTotalesSchema = z.object({
  cantidad: z.number(),
  subtotal: MontoLike,
  descuentoTotal: MontoLike,
  impuestos: MontoLike,
  total: MontoLike,
});
export type ReporteTotalesType = z.infer<typeof ReporteTotalesSchema>;

// ── Respuesta completa de /Reporte/GetDatos ───────────────────────────────────
export const ReporteDatosSchema = z.object({
  frecuencia: FrecuenciaReporteSchema,
  fechaInicio: z.string(),
  fechaFin: z.string(),
  periodos: ReportePeriodosSchema,
  ventas: ReporteVentasDetalleSchema,
  totales: ReporteTotalesSchema,
});
export type ReporteDatosType = z.infer<typeof ReporteDatosSchema>;

// ========================================================================
// TYPES: REPORTES DE COMPRAS (diario / semanal / mensual + Excel y PDF)
// ========================================================================

// ── Compra individual del detalle del reporte ─────────────────────────────────
export const ReporteCompraDetalleSchema = z.object({
  idEntidad: z.number(),
  numeroFactura: z.string().nullable(),
  fechaCreacion: z.string(),
  pagador: z.string().nullable(),
  usuario: z.string().nullable(),
  sucursal: z.string().nullable(),
  estado: z.string(),
  subtotal: MontoLike,
  descuentoTotal: MontoLike,
  impuestos: MontoLike,
  total: MontoLike,
});
export const ReporteComprasDetalleSchema = z.array(ReporteCompraDetalleSchema);
export type ReporteCompraDetalleType = z.infer<typeof ReporteCompraDetalleSchema>;
export type ReporteComprasDetalleType = z.infer<typeof ReporteComprasDetalleSchema>;

// ── Respuesta completa de /Reporte/GetDatosCompra ─────────────────────────────
export const ReporteCompraDatosSchema = z.object({
  frecuencia: FrecuenciaReporteSchema,
  fechaInicio: z.string(),
  fechaFin: z.string(),
  periodos: ReportePeriodosSchema,
  compras: ReporteComprasDetalleSchema,
  totales: ReporteTotalesSchema,
});
export type ReporteCompraDatosType = z.infer<typeof ReporteCompraDatosSchema>;

// ========================================================================
// TYPES: DEVOLUCIONES (VENTA AL CLIENTE Y A PROVEEDOR)
// ========================================================================

// ── Enums compartidos con los ENUM de la base de datos ────────────────────────
export const MotivoDevVentaSchema = z.enum([
  'error_dispensacion',
  'reaccion_adversa',
  'producto_danado',
  'producto_vencido',
  'receta_invalida',
  'arrepentimiento',
  'otro',
]);
export type MotivoDevVenta = z.infer<typeof MotivoDevVentaSchema>;

export const MotivoDevProveedorSchema = z.enum([
  'producto_danado',
  'empaque_danado',
  'vencimiento_corto',
  'producto_vencido',
  'cantidad_incorrecta',
  'reclamo_clientes',
  'otro',
]);
export type MotivoDevProveedor = z.infer<typeof MotivoDevProveedorSchema>;

export const EstadoDevVentaSchema = z.enum(['solicitada', 'aprobada', 'rechazada', 'completada']);
export type EstadoDevVenta = z.infer<typeof EstadoDevVentaSchema>;

export const EstadoDevProveedorSchema = z.enum(['solicitada', 'aceptada', 'rechazada', 'completada']);
export type EstadoDevProveedor = z.infer<typeof EstadoDevProveedorSchema>;

export const DestinoDevVentaSchema = z.enum(['reingreso_stock', 'merma', 'cuarentena']);
export type DestinoDevVenta = z.infer<typeof DestinoDevVentaSchema>;

// ── Devolución de venta (cliente → farmacia) ──────────────────────────────────
export const DevVentaListItemSchema = z.object({
  idDevolucionVenta: z.number(),
  fechaCreacion: z.string(),
  fechaResolucion: z.string().nullable().optional(),
  tipo: z.enum(['total', 'parcial']),
  motivo: MotivoDevVentaSchema,
  estado: EstadoDevVentaSchema,
  montoReembolso: z.union([z.number(), z.string()]).transform(Number),
  metodoReembolso: z.string().nullable().optional(),
  numeroNotaCredito: z.string().nullable().optional(),
  observaciones: z.string().nullable().optional(),
  idVenta: z.number(),
  cliente: z.string().nullable().optional(),
  usuario: z.string().nullable().optional(),
  totalItems: z.number().optional(),
});
export const DevVentaListSchema = z.array(DevVentaListItemSchema);
export type DevVentaListItemType = z.infer<typeof DevVentaListItemSchema>;

export const DevVentaDetalleItemSchema = z.object({
  idLote: z.number(),
  idProducto: z.number(),
  cantidad: z.number(),
  precioUnitario: z.union([z.number(), z.string()]).transform(Number),
  subtotal: z.union([z.number(), z.string()]).transform(Number),
  destino: DestinoDevVentaSchema.nullable(),
  numeroLote: z.string().optional(),
  codigo: z.string().optional(),
  nombreComercial: z.string().nullable().optional(),
  nombreGenerico: z.string().optional(),
});
export type DevVentaDetalleItemType = z.infer<typeof DevVentaDetalleItemSchema>;

export const DevVentaSchema = z.object({
  idDevolucionVenta: z.number(),
  fechaCreacion: z.string(),
  fechaResolucion: z.string().nullable().optional(),
  fechaModificacion: z.string().optional(),
  tipo: z.enum(['total', 'parcial']),
  motivo: MotivoDevVentaSchema,
  estado: EstadoDevVentaSchema,
  montoReembolso: z.union([z.number(), z.string()]).transform(Number),
  metodoReembolso: z.string().nullable().optional(),
  numeroNotaCredito: z.string().nullable().optional(),
  motivoRechazo: z.string().nullable().optional(),
  observaciones: z.string().nullable().optional(),
  idVenta: z.number(),
  idUsuario: z.number(),
  idUsuarioAutoriza: z.number().nullable().optional(),
  cliente: z.string().nullable().optional(),
  clienteNit: z.string().nullable().optional(),
  usuario: z.string().nullable().optional(),
  usuarioAutoriza: z.string().nullable().optional(),
  detalles: z.array(DevVentaDetalleItemSchema).optional(),
});
export type DevVentaType = z.infer<typeof DevVentaSchema>;

// ── Devolución a proveedor (farmacia → proveedor) ─────────────────────────────
export const DevProveedorListItemSchema = z.object({
  idDevolucionProveedor: z.number(),
  fechaCreacion: z.string(),
  fechaResolucion: z.string().nullable().optional(),
  tipo: z.enum(['total', 'parcial']),
  motivo: MotivoDevProveedorSchema,
  estado: EstadoDevProveedorSchema,
  montoNotaCredito: z.union([z.number(), z.string()]).transform(Number),
  numeroNotaCredito: z.string().nullable().optional(),
  observaciones: z.string().nullable().optional(),
  idCompra: z.number(),
  compraFactura: z.string().nullable().optional(),
  proveedor: z.string().nullable().optional(),
  usuario: z.string().nullable().optional(),
  totalItems: z.number().optional(),
});
export const DevProveedorListSchema = z.array(DevProveedorListItemSchema);
export type DevProveedorListItemType = z.infer<typeof DevProveedorListItemSchema>;

export const DevProveedorDetalleItemSchema = z.object({
  idLote: z.number(),
  cantidad: z.number(),
  precioUnitario: z.union([z.number(), z.string()]).transform(Number),
  subtotal: z.union([z.number(), z.string()]).transform(Number),
  numeroLote: z.string().optional(),
  codigo: z.string().optional(),
  idProducto: z.number().optional(),
  nombreComercial: z.string().nullable().optional(),
  nombreGenerico: z.string().optional(),
});
export type DevProveedorDetalleItemType = z.infer<typeof DevProveedorDetalleItemSchema>;

export const DevProveedorSchema = z.object({
  idDevolucionProveedor: z.number(),
  fechaCreacion: z.string(),
  fechaResolucion: z.string().nullable().optional(),
  fechaModificacion: z.string().optional(),
  tipo: z.enum(['total', 'parcial']),
  motivo: MotivoDevProveedorSchema,
  estado: EstadoDevProveedorSchema,
  montoNotaCredito: z.union([z.number(), z.string()]).transform(Number),
  numeroNotaCredito: z.string().nullable().optional(),
  motivoRechazo: z.string().nullable().optional(),
  observaciones: z.string().nullable().optional(),
  idCompra: z.number(),
  idUsuario: z.number(),
  idUsuarioAutoriza: z.number().nullable().optional(),
  compraFactura: z.string().nullable().optional(),
  proveedor: z.string().nullable().optional(),
  usuario: z.string().nullable().optional(),
  usuarioAutoriza: z.string().nullable().optional(),
  detalles: z.array(DevProveedorDetalleItemSchema).optional(),
});
export type DevProveedorType = z.infer<typeof DevProveedorSchema>;

// ── Inputs de creación ────────────────────────────────────────────────────────
export const CreateDevVentaDetalleSchema = z.object({
  idLote: z.number(),
  idProducto: z.number(),
  cantidad: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  precioUnitario: z.number().min(0, 'El precio debe ser válido'),
  destino: DestinoDevVentaSchema,
});

export const CreateDevVentaSchema = z.object({
  tipo: z.enum(['total', 'parcial']),
  motivo: MotivoDevVentaSchema,
  metodoReembolso: z.string().optional(),
  observaciones: z.string().optional(),
  idVenta: z.number(),
  detalles: z.array(CreateDevVentaDetalleSchema).min(1, 'Debe agregar al menos un producto'),
});
export type CreateDevVentaType = z.infer<typeof CreateDevVentaSchema>;

export const CreateDevProveedorDetalleSchema = z.object({
  idLote: z.number(),
  cantidad: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  precioUnitario: z.number().min(0, 'El precio debe ser válido'),
});

export const CreateDevProveedorSchema = z.object({
  tipo: z.enum(['total', 'parcial']),
  motivo: MotivoDevProveedorSchema,
  observaciones: z.string().optional(),
  idCompra: z.number(),
  detalles: z.array(CreateDevProveedorDetalleSchema).min(1, 'Debe agregar al menos un lote'),
});
export type CreateDevProveedorType = z.infer<typeof CreateDevProveedorSchema>;

// ── Resolución de devoluciones ────────────────────────────────────────────────
export const ResolverDevVentaSchema = z.object({
  estado: z.enum(['aprobada', 'rechazada', 'completada']),
  metodoReembolso: z.string().optional(),
  numeroNotaCredito: z.string().optional(),
  motivoRechazo: z.string().optional(),
});
export type ResolverDevVentaType = z.infer<typeof ResolverDevVentaSchema>;

export const ResolverDevProveedorSchema = z.object({
  estado: z.enum(['aceptada', 'rechazada', 'completada']),
  numeroNotaCredito: z.string().optional(),
  motivoRechazo: z.string().optional(),
});
export type ResolverDevProveedorType = z.infer<typeof ResolverDevProveedorSchema>;

// ── Filtros ───────────────────────────────────────────────────────────────────
export const DevVentaFiltrosSchema = z.object({
  estado: EstadoDevVentaSchema.optional(),
  idVenta: z.number().optional(),
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
  pagina: z.number().optional(),
  porPagina: z.number().optional(),
});
export type IDevVentaFiltros = z.infer<typeof DevVentaFiltrosSchema>;

export const DevProveedorFiltrosSchema = z.object({
  estado: EstadoDevProveedorSchema.optional(),
  idCompra: z.number().optional(),
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
  pagina: z.number().optional(),
  porPagina: z.number().optional(),
});
export type IDevProveedorFiltros = z.infer<typeof DevProveedorFiltrosSchema>;

// ========================================================================
// TYPES: REPORTE DE CONTROL DE VENCIMIENTOS Y ALERTA FEFO
// ========================================================================

// ── Niveles del semáforo de vencimiento ─────────────────────────────────────
export const NivelVencimientoSchema = z.enum(["vencido", "critico", "advertencia", "optimo"]);
export type NivelVencimiento = z.infer<typeof NivelVencimientoSchema>;

export const ETIQUETA_NIVEL: Record<NivelVencimiento, string> = {
  vencido: "Vencido",
  critico: "Crítico",
  advertencia: "Advertencia",
  optimo: "Óptimo",
};

// ── Producto normalizado dentro de la fila del reporte ───────────────────────
export const VencimientoProductoSchema = z.object({
  idProducto: z.number(),
  codigoBarra: z.string(),
  nombreComercial: z.string(),
  nombreGenerico: z.string().nullable(),
  concentracion: z.string().nullable(),
  presentacion: z.string().nullable(),
  viaAdministracion: z.string().nullable(),
  requiereReceta: z.number(),
});
export type VencimientoProductoType = z.infer<typeof VencimientoProductoSchema>;

// ── Fila del reporte: un lote con su semáforo y valor en riesgo ─────────────
export const LoteVencimientoSchema = z.object({
  idLote: z.number(),
  codigo: z.string(),
  numeroLote: z.string(),
  stock: z.number(),
  fechaVencimiento: z.string(),
  fechaIngreso: z.string().nullable(),
  fechaFabricacion: z.string().nullable(),
  estadoLote: z.string(),
  estadoLoteLabel: z.string(),
  precioCompra: z.number(),
  precioVenta: z.number(),
  valorEnRiesgo: z.number(),
  diasRestantes: z.number(),
  nivel: NivelVencimientoSchema,
  nivelLabel: z.string(),
  accion: z.string(),
  esFEFO: z.boolean(),
  idLoteFEFO: z.number(),
  requiereReceta: z.number(),
  viaAdministracion: z.string().nullable(),
  producto: VencimientoProductoSchema,
  idLaboratorio: z.number(),
  laboratorio: z.string(),
  idTipoProd: z.number(),
  tipoProducto: z.string().nullable(),
  idProveedor: z.number(),
  proveedor: z.string(),
});
export const LotesVencimientoSchema = z.array(LoteVencimientoSchema);
export type LoteVencimientoType = z.infer<typeof LoteVencimientoSchema>;
export type LotesVencimientoType = z.infer<typeof LotesVencimientoSchema>;

// ── Resumen por nivel del semáforo ───────────────────────────────────────────
export const VencimientoNivelResumenSchema = z.object({
  nivel: NivelVencimientoSchema,
  etiqueta: z.string(),
  accion: z.string(),
  lotes: z.number(),
  unidades: z.number(),
  valor: z.number(),
});
export const VencimientoPorNivelSchema = z.array(VencimientoNivelResumenSchema);
export type VencimientoPorNivelType = z.infer<typeof VencimientoPorNivelSchema>;

// ── Resumen por laboratorio ──────────────────────────────────────────────────
export const VencimientoLaboratorioSchema = z.object({
  laboratorio: z.string(),
  lotes: z.number(),
  unidades: z.number(),
  valor: z.number(),
});
export const VencimientoPorLaboratorioSchema = z.array(VencimientoLaboratorioSchema);
export type VencimientoPorLaboratorioType = z.infer<typeof VencimientoPorLaboratorioSchema>;

// ── Control FEFO por producto ────────────────────────────────────────────────
export const VencimientoControlFEFOSchema = z.object({
  idProducto: z.number(),
  producto: z.string(),
  idLoteFEFO: z.number(),
  codigoFEFO: z.string(),
  numeroLoteFEFO: z.string(),
  fechaVencimientoFEFO: z.string(),
  diasRestantesFEFO: z.number(),
  nivelFEFO: NivelVencimientoSchema,
  totalLotes: z.number(),
  stockLotesPosteriores: z.number(),
  valorLotesPosteriores: z.number(),
});
export const VencimientoControlFEFOArraySchema = z.array(VencimientoControlFEFOSchema);
export type VencimientoControlFEFOType = z.infer<typeof VencimientoControlFEFOSchema>;

// ── Resumen general ──────────────────────────────────────────────────────────
export const VencimientosResumenSchema = z.object({
  totalLotes: z.number(),
  totalUnidades: z.number(),
  valorTotal: z.number(),
  valorEnRiesgo: z.number(),
  valorCritico: z.number(),
  porNivel: VencimientoPorNivelSchema,
  porLaboratorio: VencimientoPorLaboratorioSchema,
  controlFEFO: VencimientoControlFEFOArraySchema,
});
export type VencimientosResumenType = z.infer<typeof VencimientosResumenSchema>;

// ── Parámetros aplicados a la consulta ───────────────────────────────────────
export const VencimientosParametrosSchema = z.object({
  diasMin: z.number().nullable(),
  diasMax: z.number().nullable(),
  idLaboratorio: z.number().nullable(),
  idTipoProducto: z.number().nullable(),
  idProveedor: z.number().nullable(),
  estados: z.array(z.string()),
  busqueda: z.string().nullable(),
  soloConStock: z.boolean(),
  umbrales: z.object({
    critico: z.number(),
    advertencia: z.number(),
  }),
});
export type VencimientosParametrosType = z.infer<typeof VencimientosParametrosSchema>;

// ── Respuesta completa de /Reporte/GetDatosVencimientos ─────────────────────
export const ReporteVencimientosDatosSchema = z.object({
  parametros: VencimientosParametrosSchema,
  lotes: LotesVencimientoSchema,
  resumen: VencimientosResumenSchema,
});
export type ReporteVencimientosDatosType = z.infer<typeof ReporteVencimientosDatosSchema>;

// ── Filtros que envía el frontend ────────────────────────────────────────────
export const ReporteVencimientosFiltrosSchema = z.object({
  diasMin: z.number().optional(),
  diasMax: z.number().optional(),
  idLaboratorio: z.number().optional(),
  idTipoProducto: z.number().optional(),
  idProveedor: z.number().optional(),
  estados: z.array(z.string()).optional(),
  busqueda: z.string().optional(),
  soloConStock: z.boolean().optional(),
});
export type ReporteVencimientosFiltrosType = z.infer<typeof ReporteVencimientosFiltrosSchema>;

// ── Catálogos para los filtros ───────────────────────────────────────────────
export const VencimientosParametrosCatalogoSchema = z.object({
  umbrales: z.object({
    critico: z.number(),
    advertencia: z.number(),
  }),
  laboratorios: z.array(z.object({ idLaboratorio: z.number(), nombre: z.string() })),
  tiposProducto: z.array(z.object({ idTipoProd: z.number(), nombre: z.string() })),
  proveedores: z.array(z.object({ idProveedor: z.number(), nombre: z.string() })),
});
export type VencimientosParametrosCatalogoType = z.infer<typeof VencimientosParametrosCatalogoSchema>;

// ── Alerta FEFO del POS ──────────────────────────────────────────────────────
export const AlertaFEFOSchema = z.object({
  existe: z.boolean(),
  cumpleFEFO: z.boolean(),
  idLote: z.number().optional(),
  codigo: z.string().optional(),
  numeroLote: z.string().optional(),
  stock: z.number().optional(),
  fechaVencimiento: z.string().optional(),
  diasRestantes: z.number().optional(),
  idLoteFEFO: z.number().nullable().optional(),
  numeroLoteFEFO: z.string().nullable().optional(),
  fechaVencimientoFEFO: z.string().nullable().optional(),
  diasRestantesFEFO: z.number().optional(),
  stockLoteFEFO: z.number().optional(),
  diasDiferencia: z.number().optional(),
  mensaje: z.string(),
});
export type AlertaFEFOType = z.infer<typeof AlertaFEFOSchema>;

export const InventarioProductoSchema = z.object({
  idProducto: z.number(),
  nombreComercial: z.string(),
  nombreGenerico: z.string().nullable(),
  concentracion: z.string().nullable(),
});
export type InventarioProductoType = z.infer<typeof InventarioProductoSchema>;

export const LoteInventarioSchema = z.object({
  idLote: z.number(),
  codigo: z.string(),
  numeroLote: z.string(),
  stock: z.number(),
  costoUnitario: z.number(),
  subtotal: z.number(),
  fechaVencimiento: z.string().nullable(),
  producto: InventarioProductoSchema,
  idLaboratorio: z.number(),
  laboratorio: z.string(),
  idTipoProducto: z.number(),
  tipoProducto: z.string().nullable(),
});
export const LotesInventarioSchema = z.array(LoteInventarioSchema);
export type LoteInventarioType = z.infer<typeof LoteInventarioSchema>;
export type LotesInventarioType = z.infer<typeof LotesInventarioSchema>;

export const InventarioTipoProductoResumenSchema = z.object({
  tipoProducto: z.string(),
  lotes: z.number(),
  unidades: z.number(),
  valor: z.number(),
});
export const InventarioPorTipoProductoSchema = z.array(InventarioTipoProductoResumenSchema);
export type InventarioTipoProductoResumenType = z.infer<typeof InventarioTipoProductoResumenSchema>;
export type InventarioPorTipoProductoType = z.infer<typeof InventarioPorTipoProductoSchema>;

export const InventarioLaboratorioResumenSchema = z.object({
  laboratorio: z.string(),
  lotes: z.number(),
  unidades: z.number(),
  valor: z.number(),
});
export const InventarioPorLaboratorioSchema = z.array(InventarioLaboratorioResumenSchema);
export type InventarioLaboratorioResumenType = z.infer<typeof InventarioLaboratorioResumenSchema>;
export type InventarioPorLaboratorioType = z.infer<typeof InventarioPorLaboratorioSchema>;

export const InventarioProductoResumenSchema = z.object({
  idProducto: z.number(),
  producto: z.string(),
  lotes: z.number(),
  unidades: z.number(),
  valor: z.number(),
});
export const InventarioPorProductoSchema = z.array(InventarioProductoResumenSchema);
export type InventarioProductoResumenType = z.infer<typeof InventarioProductoResumenSchema>;
export type InventarioPorProductoType = z.infer<typeof InventarioPorProductoSchema>;

export const InventarioResumenSchema = z.object({
  totalLotes: z.number(),
  totalUnidades: z.number(),
  valorTotal: z.number(),
  porTipoProducto: InventarioPorTipoProductoSchema,
  porLaboratorio: InventarioPorLaboratorioSchema,
  porProducto: InventarioPorProductoSchema,
});
export type InventarioResumenType = z.infer<typeof InventarioResumenSchema>;

export const InventarioParametrosSchema = z.object({
  idLaboratorio: z.number().nullable(),
  idTipoProducto: z.number().nullable(),
  busqueda: z.string().nullable(),
  soloConStock: z.boolean(),
});
export type InventarioParametrosType = z.infer<typeof InventarioParametrosSchema>;

export const ReporteInventarioDatosSchema = z.object({
  parametros: InventarioParametrosSchema,
  lotes: LotesInventarioSchema,
  resumen: InventarioResumenSchema,
});
export type ReporteInventarioDatosType = z.infer<typeof ReporteInventarioDatosSchema>;

export const ReporteInventarioFiltrosSchema = z.object({
  idLaboratorio: z.number().optional(),
  idTipoProducto: z.number().optional(),
  busqueda: z.string().optional(),
  soloConStock: z.boolean().optional(),
});
export type ReporteInventarioFiltrosType = z.infer<typeof ReporteInventarioFiltrosSchema>;

export const InventarioParametrosCatalogoSchema = z.object({
  laboratorios: z.array(z.object({ idLaboratorio: z.number(), nombre: z.string() })),
  tiposProducto: z.array(z.object({ idTipoProd: z.number(), nombre: z.string() })),
});
export type InventarioParametrosCatalogoType = z.infer<typeof InventarioParametrosCatalogoSchema>;

// ========================================================================
// TYPES: REPORTE DE DEVOLUCIONES DE CLIENTES Y AN�LISIS DE CAUSAS
// ========================================================================

export const DevolucionReporteMotivoSchema = z.object({
  motivo: z.string(),
  etiqueta: z.string(),
  devoluciones: z.number(),
  lineas: z.number(),
  unidades: z.number(),
  monto: z.number(),
});
export const DevolucionesReportePorMotivoSchema = z.array(DevolucionReporteMotivoSchema);
export type DevolucionReporteMotivoType = z.infer<typeof DevolucionReporteMotivoSchema>;

export const DevolucionReporteDestinoSchema = z.object({
  destino: z.string(),
  etiqueta: z.string(),
  devoluciones: z.number(),
  lineas: z.number(),
  unidades: z.number(),
  monto: z.number(),
});
export const DevolucionesReportePorDestinoSchema = z.array(DevolucionReporteDestinoSchema);
export type DevolucionReporteDestinoType = z.infer<typeof DevolucionReporteDestinoSchema>;

export const DevolucionReporteProductoSchema = z.object({
  idProducto: z.number(),
  producto: z.string(),
  unidades: z.number(),
  monto: z.number(),
});
export const DevolucionesReporteTopProductosSchema = z.array(DevolucionReporteProductoSchema);
export type DevolucionReporteProductoType = z.infer<typeof DevolucionReporteProductoSchema>;

export const DevolucionReporteUsuarioSchema = z.object({
  idUsuario: z.number(),
  usuario: z.string(),
  devoluciones: z.number(),
  unidades: z.number(),
  monto: z.number(),
});
export const DevolucionesReporteTopUsuariosSchema = z.array(DevolucionReporteUsuarioSchema);
export type DevolucionReporteUsuarioType = z.infer<typeof DevolucionReporteUsuarioSchema>;

export const DevolucionReporteLaboratorioSchema = z.object({
  idLaboratorio: z.number(),
  laboratorio: z.string(),
  unidades: z.number(),
  monto: z.number(),
});
export const DevolucionesReportePorLaboratorioSchema = z.array(DevolucionReporteLaboratorioSchema);
export type DevolucionReporteLaboratorioType = z.infer<typeof DevolucionReporteLaboratorioSchema>;

export const DevolucionesReporteResumenSchema = z.object({
  totalDevoluciones: z.number(),
  totalLineas: z.number(),
  totalUnidades: z.number(),
  montoTotalDevuelto: z.number(),
  montoPromedio: z.number(),
  porMotivo: DevolucionesReportePorMotivoSchema,
  porDestino: DevolucionesReportePorDestinoSchema,
  porLaboratorio: DevolucionesReportePorLaboratorioSchema,
  topProductos: DevolucionesReporteTopProductosSchema,
  topUsuarios: DevolucionesReporteTopUsuariosSchema,
});
export type DevolucionesReporteResumenType = z.infer<typeof DevolucionesReporteResumenSchema>;

export const DevolucionReporteParametrosSchema = z.object({
  fechaInicio: z.string().nullable(),
  fechaFin: z.string().nullable(),
  motivo: z.string().nullable(),
  estado: z.string().nullable(),
  idUsuario: z.number().nullable(),
  idCliente: z.number().nullable(),
  idLaboratorio: z.number().nullable(),
  idTipoProducto: z.number().nullable(),
  producto: z.string().nullable(),
  cliente: z.string().nullable(),
  busqueda: z.string().nullable(),
});
export type DevolucionReporteParametrosType = z.infer<typeof DevolucionReporteParametrosSchema>;

export const DevolucionReporteDetalleSchema = z.object({
  idDevolucionVenta: z.number(),
  numeroDevolucion: z.string(),
  fechaCreacion: z.string(),
  fechaResolucion: z.string().nullable(),
  tipo: z.string(),
  motivo: z.string(),
  motivoLabel: z.string(),
  estado: z.string(),
  estadoLabel: z.string(),
  montoReembolso: z.number(),
  metodoReembolso: z.string().nullable(),
  numeroNotaCredito: z.string().nullable(),
  observaciones: z.string().nullable(),
  idVenta: z.number(),
  numeroFactura: z.string().nullable(),
  fechaVenta: z.string().nullable(),
  estadoVenta: z.string().nullable(),
  idCliente: z.number(),
  cliente: z.string(),
  clienteCi: z.string().nullable(),
  idUsuario: z.number(),
  usuario: z.string(),
  idCajero: z.number(),
  cajero: z.string().nullable(),
  idLote: z.number(),
  codigoLote: z.string(),
  numeroLote: z.string(),
  fechaVencimiento: z.string(),
  idProducto: z.number(),
  codigoBarra: z.string(),
  nombreComercial: z.string(),
  nombreGenerico: z.string().nullable(),
  concentracion: z.string().nullable(),
  presentacion: z.string().nullable(),
  cantidad: z.number(),
  precioUnitario: z.number(),
  montoDevuelto: z.number(),
  destino: z.string(),
  destinoLabel: z.string(),
  idLaboratorio: z.number(),
  laboratorio: z.string(),
  idTipoProducto: z.number(),
  tipoProducto: z.string().nullable(),
});
export const DevolucionesReporteDetalleSchema = z.array(DevolucionReporteDetalleSchema);
export type DevolucionReporteDetalleType = z.infer<typeof DevolucionReporteDetalleSchema>;

export const ReporteDevolucionesDatosSchema = z.object({
  parametros: DevolucionReporteParametrosSchema,
  detalles: DevolucionesReporteDetalleSchema,
  resumen: DevolucionesReporteResumenSchema,
});
export type ReporteDevolucionesDatosType = z.infer<typeof ReporteDevolucionesDatosSchema>;

export const ReporteDevolucionesFiltrosSchema = z.object({
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  motivo: z.string().optional(),
  estado: z.string().optional(),
  idUsuario: z.number().optional(),
  idCliente: z.number().optional(),
  idLaboratorio: z.number().optional(),
  idTipoProducto: z.number().optional(),
  producto: z.string().optional(),
  cliente: z.string().optional(),
  busqueda: z.string().optional(),
});
export type ReporteDevolucionesFiltrosType = z.infer<typeof ReporteDevolucionesFiltrosSchema>;

export const DevolucionesOpcionSchema = z.object({ value: z.string(), label: z.string() });
export const DevolucionesParametrosCatalogoSchema = z.object({
  motivos: z.array(DevolucionesOpcionSchema),
  destinos: z.array(DevolucionesOpcionSchema),
  estados: z.array(DevolucionesOpcionSchema),
  usuarios: z.array(z.object({ idUsuario: z.number(), nombre: z.string() })),
  clientes: z.array(z.object({ idCliente: z.number(), nombre: z.string() })),
  laboratorios: z.array(z.object({ idLaboratorio: z.number(), nombre: z.string() })),
  tiposProducto: z.array(z.object({ idTipoProd: z.number(), nombre: z.string() })),
});
export type DevolucionesParametrosCatalogoType = z.infer<typeof DevolucionesParametrosCatalogoSchema>;

// ========================================================================
// TYPES: REPORTE DE DEVOLUCIONES A PROVEEDORES Y NOTAS DE CREDITO
// ========================================================================

export const DevolucionProveedorReporteParametrosSchema = z.object({
  fechaInicio: z.string().nullable(),
  fechaFin: z.string().nullable(),
  idProveedor: z.number().nullable(),
  idLaboratorio: z.number().nullable(),
  motivo: z.string().nullable(),
  estadoNotaCredito: z.string().nullable(),
  idUsuario: z.number().nullable(),
  producto: z.string().nullable(),
  busqueda: z.string().nullable(),
});
export type DevolucionProveedorReporteParametrosType = z.infer<typeof DevolucionProveedorReporteParametrosSchema>;

export const DevolucionProveedorReporteDetalleSchema = z.object({
  idDevolucionProveedor: z.number(),
  numeroDevolucion: z.string(),
  fechaCreacion: z.string(),
  fechaResolucion: z.string().nullable(),
  tipo: z.string(),
  motivo: z.string(),
  motivoLabel: z.string(),
  estado: z.string(),
  estadoLabel: z.string(),
  estadoNotaCredito: z.string(),
  estadoNotaCreditoLabel: z.string(),
  numeroNotaCredito: z.string().nullable(),
  montoNotaCredito: z.number(),
  observaciones: z.string().nullable(),
  idCompra: z.number(),
  numeroFacturaCompra: z.string().nullable(),
  fechaCompra: z.string().nullable(),
  fechaEntrega: z.string().nullable(),
  montoCompra: z.number(),
  idProveedor: z.number(),
  proveedor: z.string(),
  idUsuario: z.number(),
  usuario: z.string(),
  idUsuarioAutoriza: z.number().nullable(),
  usuarioAutoriza: z.string().nullable(),
  idLote: z.number(),
  codigoLote: z.string(),
  numeroLote: z.string(),
  fechaVencimiento: z.string(),
  idProducto: z.number(),
  codigoBarra: z.string(),
  nombreComercial: z.string(),
  nombreGenerico: z.string().nullable(),
  concentracion: z.string().nullable(),
  presentacion: z.string().nullable(),
  cantidad: z.number(),
  precioUnitario: z.number(),
  montoLinea: z.number(),
  idLaboratorio: z.number(),
  laboratorio: z.string(),
  idTipoProducto: z.number(),
  tipoProducto: z.string().nullable(),
});
export const DevolucionesProveedorReporteDetalleSchema = z.array(DevolucionProveedorReporteDetalleSchema);
export type DevolucionProveedorReporteDetalleType = z.infer<typeof DevolucionProveedorReporteDetalleSchema>;

export const DevolucionProveedorReporteProveedorSchema = z.object({
  idProveedor: z.number(),
  proveedor: z.string(),
  devoluciones: z.number(),
  unidades: z.number(),
  montoNC: z.number(),
});
export const DevolucionesProveedorReportePorProveedorSchema = z.array(DevolucionProveedorReporteProveedorSchema);
export type DevolucionProveedorReporteProveedorType = z.infer<typeof DevolucionProveedorReporteProveedorSchema>;

export const DevolucionProveedorReporteMotivoSchema = z.object({
  motivo: z.string(),
  etiqueta: z.string(),
  devoluciones: z.number(),
  unidades: z.number(),
  montoNC: z.number(),
});
export const DevolucionesProveedorReportePorMotivoSchema = z.array(DevolucionProveedorReporteMotivoSchema);
export type DevolucionProveedorReporteMotivoType = z.infer<typeof DevolucionProveedorReporteMotivoSchema>;

export const DevolucionProveedorReporteEstadoNCSchema = z.object({
  estado: z.string(),
  etiqueta: z.string(),
  devoluciones: z.number(),
  unidades: z.number(),
  montoNC: z.number(),
});
export const DevolucionesProveedorReportePorEstadoNCSchema = z.array(DevolucionProveedorReporteEstadoNCSchema);
export type DevolucionProveedorReporteEstadoNCType = z.infer<typeof DevolucionProveedorReporteEstadoNCSchema>;

export const DevolucionProveedorReporteLaboratorioSchema = z.object({
  idLaboratorio: z.number(),
  laboratorio: z.string(),
  devoluciones: z.number(),
  unidades: z.number(),
  montoNC: z.number(),
});
export const DevolucionesProveedorReportePorLaboratorioSchema = z.array(DevolucionProveedorReporteLaboratorioSchema);
export type DevolucionProveedorReporteLaboratorioType = z.infer<typeof DevolucionProveedorReporteLaboratorioSchema>;

export const DevolucionProveedorReporteProductoSchema = z.object({
  idProducto: z.number(),
  producto: z.string(),
  unidades: z.number(),
  monto: z.number(),
});
export const DevolucionesProveedorReporteTopProductosSchema = z.array(DevolucionProveedorReporteProductoSchema);
export type DevolucionProveedorReporteProductoType = z.infer<typeof DevolucionProveedorReporteProductoSchema>;

export const DevolucionesProveedorReporteResumenSchema = z.object({
  totalDevoluciones: z.number(),
  totalLineas: z.number(),
  totalUnidades: z.number(),
  montoTotalNC: z.number(),
  montoPromedio: z.number(),
  porProveedor: DevolucionesProveedorReportePorProveedorSchema,
  porMotivo: DevolucionesProveedorReportePorMotivoSchema,
  porEstadoNotaCredito: DevolucionesProveedorReportePorEstadoNCSchema,
  porLaboratorio: DevolucionesProveedorReportePorLaboratorioSchema,
  topProductos: DevolucionesProveedorReporteTopProductosSchema,
});
export type DevolucionesProveedorReporteResumenType = z.infer<typeof DevolucionesProveedorReporteResumenSchema>;

export const ReporteDevolucionesProveedorDatosSchema = z.object({
  parametros: DevolucionProveedorReporteParametrosSchema,
  detalles: DevolucionesProveedorReporteDetalleSchema,
  resumen: DevolucionesProveedorReporteResumenSchema,
});
export type ReporteDevolucionesProveedorDatosType = z.infer<typeof ReporteDevolucionesProveedorDatosSchema>;

export const ReporteDevolucionesProveedorFiltrosSchema = z.object({
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  idProveedor: z.number().optional(),
  idLaboratorio: z.number().optional(),
  motivo: z.string().optional(),
  estadoNotaCredito: z.string().optional(),
  idUsuario: z.number().optional(),
  producto: z.string().optional(),
  busqueda: z.string().optional(),
});
export type ReporteDevolucionesProveedorFiltrosType = z.infer<typeof ReporteDevolucionesProveedorFiltrosSchema>;

export const DevolucionesProveedorParametrosCatalogoSchema = z.object({
  motivos: z.array(DevolucionesOpcionSchema),
  estadosNotaCredito: z.array(DevolucionesOpcionSchema),
  estadosDevolucion: z.array(DevolucionesOpcionSchema),
  proveedores: z.array(z.object({ idProveedor: z.number(), nombre: z.string() })),
  laboratorios: z.array(z.object({ idLaboratorio: z.number(), nombre: z.string() })),
  usuarios: z.array(z.object({ idUsuario: z.number(), nombre: z.string() })),
});
export type DevolucionesProveedorParametrosCatalogoType = z.infer<typeof DevolucionesProveedorParametrosCatalogoSchema>;
// =========================================================================
// TYPES: REPORTE DE ROTACION Y CLASIFICACION ABC DE PRODUCTOS
// =========================================================================

export const RotacionProductosParametrosSchema = z.object({
  laboratorios: z.array(z.object({ idLaboratorio: z.number(), nombre: z.string() })),
  tiposProducto: z.array(z.object({ idTipoProd: z.number(), nombre: z.string() })),
});
export type RotacionProductosParametrosType = z.infer<typeof RotacionProductosParametrosSchema>;

export const RotacionProductosDetalleSchema = z.object({
  idProducto: z.number(),
  codigoBarra: z.string(),
  nombreComercial: z.string(),
  nombreGenerico: z.string().nullable(),
  concentracion: z.string().nullable(),
  presentacion: z.string().nullable(),
  idLaboratorio: z.number(),
  laboratorio: z.string(),
  tipoProducto: z.string().nullable(),
  unidadesVendidas: z.number(),
  frecuenciaSalida: z.number(),
  montoVendido: z.number(),
  stockActual: z.number(),
  valorStock: z.number(),
  proximoVencimiento: z.string().nullable(),
  clasificacion: z.string(),
});
export const RotacionProductosDetalleArraySchema = z.array(RotacionProductosDetalleSchema);
export type RotacionProductosDetalleType = z.infer<typeof RotacionProductosDetalleSchema>;

export const RotacionProductosResumenClasificacionSchema = z.object({
  clasificacion: z.string(),
  productos: z.number(),
  unidadesVendidas: z.number(),
  montoVendido: z.number(),
  valorStock: z.number(),
});

export const RotacionProductosResumenLaboratorioSchema = z.object({
  idLaboratorio: z.number(),
  laboratorio: z.string(),
  productos: z.number(),
  montoVendido: z.number(),
  valorStock: z.number(),
});

export const RotacionProductosTopProductoSchema = z.object({
  idProducto: z.number(),
  producto: z.string(),
  clasificacion: z.string(),
  unidades: z.number(),
  monto: z.number(),
});

export const RotacionProductosCriticoSchema = z.object({
  idProducto: z.number(),
  producto: z.string(),
  stock: z.number(),
  proximoVencimiento: z.string().nullable(),
  valorStock: z.number(),
});

export const ReporteRotacionProductosResumenSchema = z.object({
  totalProductos: z.number(),
  totalUnidadesVendidas: z.number(),
  totalMontoVendido: z.number(),
  totalStock: z.number(),
  totalValorStock: z.number(),
  porClasificacion: z.array(RotacionProductosResumenClasificacionSchema),
  porLaboratorio: z.array(RotacionProductosResumenLaboratorioSchema),
  topProductos: z.array(RotacionProductosTopProductoSchema),
  criticos: z.array(RotacionProductosCriticoSchema),
});

export const ReporteRotacionProductosDatosSchema = z.object({
  parametros: z.object({
    fechaInicio: z.string().nullable(),
    fechaFin: z.string().nullable(),
    idLaboratorio: z.number().nullable(),
    idTipoProducto: z.number().nullable(),
    clasificacion: z.string().nullable(),
    busqueda: z.string().nullable(),
    soloConStock: z.boolean(),
  }),
  detalles: RotacionProductosDetalleArraySchema,
  resumen: ReporteRotacionProductosResumenSchema,
});
export type ReporteRotacionProductosDatosType = z.infer<typeof ReporteRotacionProductosDatosSchema>;

export const ReporteRotacionProductosFiltrosSchema = z.object({
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  idLaboratorio: z.number().optional(),
  idTipoProducto: z.number().optional(),
  clasificacion: z.string().optional(),
  busqueda: z.string().optional(),
  soloConStock: z.boolean().optional(),
});
export type ReporteRotacionProductosFiltrosType = z.infer<typeof ReporteRotacionProductosFiltrosSchema>;
// =========================================================================
// TYPES: REPORTE DE FACTURACION, EMISIONES Y ANULACIONES
// =========================================================================

export const FacturacionParametrosSchema = z.object({
  estados: z.array(z.object({ value: z.string(), label: z.string() })),
  tiposFactura: z.array(z.object({ value: z.string(), label: z.string() })),
});
export type FacturacionParametrosType = z.infer<typeof FacturacionParametrosSchema>;

export const FacturacionDetalleSchema = z.object({
  idFactura: z.number(),
  numeroFactura: z.string(),
  fechaEmision: z.string(),
  tipoFactura: z.string(),
  nitCliente: z.string(),
  razonSocial: z.string(),
  emailCliente: z.string().nullable(),
  subtotal: z.number(),
  descuento: z.number(),
  impuesto: z.number(),
  total: z.number(),
  estado: z.string(),
  fechaAnulacion: z.string().nullable(),
  motivoAnulacion: z.string().nullable(),
  idVenta: z.number(),
  usuarioEmisor: z.string(),
  usuarioAnulacion: z.string().nullable(),
});
export const FacturacionDetalleArraySchema = z.array(FacturacionDetalleSchema);
export type FacturacionDetalleType = z.infer<typeof FacturacionDetalleSchema>;

export const FacturacionResumenSchema = z.object({
  totalFacturas: z.number(),
  facturasEmitidas: z.number(),
  facturasAnuladas: z.number(),
  porcentajeAnuladas: z.number(),
  montoTotal: z.number(),
  montoEmitido: z.number(),
  montoAnulado: z.number(),
  subtotalTotal: z.number(),
  descuentoTotal: z.number(),
  impuestoTotal: z.number(),
  porEstado: z.array(z.object({ estado: z.string(), facturas: z.number(), total: z.number() })),
  porTipo: z.array(z.object({ tipo: z.string(), facturas: z.number(), total: z.number() })),
  motivosAnulacion: z.array(z.object({ motivo: z.string(), facturas: z.number() })),
});

export const ReporteFacturacionDatosSchema = z.object({
  parametros: z.object({
    fechaInicio: z.string().nullable(),
    fechaFin: z.string().nullable(),
    estado: z.string().nullable(),
    tipoFactura: z.string().nullable(),
    busqueda: z.string().nullable(),
  }),
  detalles: FacturacionDetalleArraySchema,
  resumen: FacturacionResumenSchema,
});
export type ReporteFacturacionDatosType = z.infer<typeof ReporteFacturacionDatosSchema>;

export const ReporteFacturacionFiltrosSchema = z.object({
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  estado: z.string().optional(),
  tipoFactura: z.string().optional(),
  busqueda: z.string().optional(),
});
export type ReporteFacturacionFiltrosType = z.infer<typeof ReporteFacturacionFiltrosSchema>;
