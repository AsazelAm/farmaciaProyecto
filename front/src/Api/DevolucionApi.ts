import api from "../lib/Axios";
import { isAxiosError } from "axios";
import {
  DevVentaListSchema,
  DevVentaSchema,
  DevProveedorListSchema,
  DevProveedorSchema,
  type CreateDevVentaType,
  type CreateDevProveedorType,
  type ResolverDevVentaType,
  type ResolverDevProveedorType,
  type IDevVentaFiltros,
  type IDevProveedorFiltros,
} from "../types";

// ═════════════ DEVOLUCIONES DE VENTA ═════════════

// ── GET: Listar devoluciones de venta ────────────────────────────────────────
export async function GetDevolucionesVentaApi(filtros?: IDevVentaFiltros) {
  try {
    const { data } = await api.get('/Devolucion/GetDevolucionesVenta', { params: filtros });
    const response = DevVentaListSchema.safeParse(data.data);
    if (response.success) {
      return { data: response.data, total: data.total };
    }
    throw new Error("Error en la validación de datos de devoluciones de venta");
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al obtener las devoluciones de venta');
    }
    throw error;
  }
}

// ── GET: Detalle de una devolución de venta ───────────────────────────────────
export async function GetDevolucionVentaByIdApi(idDevolucionVenta: number) {
  try {
    const { data } = await api.get(`/Devolucion/GetDevolucionVenta/${idDevolucionVenta}`);
    const response = DevVentaSchema.safeParse(data);
    if (response.success) {
      return response.data;
    }
    throw new Error("Error en la validación del detalle de la devolución de venta");
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al obtener el detalle de la devolución');
    }
    throw error;
  }
}

// ── POST: Registrar una devolución de venta ───────────────────────────────────
export async function AddDevolucionVentaApi(formData: CreateDevVentaType) {
  try {
    const { data } = await api.post('/Devolucion/AddDevolucionVenta', formData);
    return data; // { message, idDevolucionVenta }
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al registrar la devolución de venta');
    }
    throw error;
  }
}

// ── PATCH: Resolver una devolución de venta ───────────────────────────────────
export async function ResolverDevolucionVentaApi(idDevolucionVenta: number, formData: ResolverDevVentaType) {
  try {
    const { data } = await api.patch(`/Devolucion/ResolverDevolucionVenta/${idDevolucionVenta}`, formData);
    return data; // { message }
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al resolver la devolución de venta');
    }
    throw error;
  }
}

// ═════════════ DEVOLUCIONES A PROVEEDOR ═════════════

// ── GET: Listar devoluciones a proveedor ──────────────────────────────────────
export async function GetDevolucionesProveedorApi(filtros?: IDevProveedorFiltros) {
  try {
    const { data } = await api.get('/Devolucion/GetDevolucionesProveedor', { params: filtros });
    const response = DevProveedorListSchema.safeParse(data.data);
    if (response.success) {
      return { data: response.data, total: data.total };
    }
    throw new Error("Error en la validación de datos de devoluciones a proveedor");
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al obtener las devoluciones a proveedor');
    }
    throw error;
  }
}

// ── GET: Detalle de una devolución a proveedor ────────────────────────────────
export async function GetDevolucionProveedorByIdApi(idDevolucionProveedor: number) {
  try {
    const { data } = await api.get(`/Devolucion/GetDevolucionProveedor/${idDevolucionProveedor}`);
    const response = DevProveedorSchema.safeParse(data);
    if (response.success) {
      return response.data;
    }
    throw new Error("Error en la validación del detalle de la devolución a proveedor");
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al obtener el detalle de la devolución');
    }
    throw error;
  }
}

// ── POST: Registrar una devolución a proveedor ────────────────────────────────
export async function AddDevolucionProveedorApi(formData: CreateDevProveedorType) {
  try {
    const { data } = await api.post('/Devolucion/AddDevolucionProveedor', formData);
    return data; // { message, idDevolucionProveedor }
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al registrar la devolución a proveedor');
    }
    throw error;
  }
}

// ── PATCH: Resolver una devolución a proveedor ────────────────────────────────
export async function ResolverDevolucionProveedorApi(idDevolucionProveedor: number, formData: ResolverDevProveedorType) {
  try {
    const { data } = await api.patch(`/Devolucion/ResolverDevolucionProveedor/${idDevolucionProveedor}`, formData);
    return data; // { message }
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al resolver la devolución a proveedor');
    }
    throw error;
  }
}
