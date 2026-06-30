import api from "../lib/Axios";
import { isAxiosError } from "axios";
import {
  CompraListSchema,
  CompraSchema,
  CompraEstadisticasSchema,
  type CreateCompraType,
  type UpdateCompraType,
  type ICompraFiltros,
} from "../types"; // Asumiendo que tu index.ts está en ../types/index.ts

// ── GET: Obtener Estadísticas ────────────────────────────────────────────────
export async function GetEstadisticasComprasApi() {
  try {
    const { data } = await api.get('/Compra/GetEstadisticasCompras');
    const response = CompraEstadisticasSchema.safeParse(data);
    if (response.success) {
      return response.data;
    }
    throw new Error("Error en la validación de datos de estadísticas");
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al obtener estadísticas');
    }
    throw error;
  }
}

// ── GET: Listar Compras (con filtros y paginación) ───────────────────────────
export async function GetComprasApi(filtros?: ICompraFiltros) {
  try {
    const { data } = await api.get('/Compra/GetCompras', { params: filtros });
    // Tu backend devuelve { data: [...], total: X }. Validamos el array interior.
    const response = CompraListSchema.safeParse(data.data);
    if (response.success) {
      return { data: response.data, total: data.total };
    }
    throw new Error("Error en la validación de datos de la lista de compras");
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al obtener las compras');
    }
    throw error;
  }
}

// ── GET: Detalle de Compra por ID ────────────────────────────────────────────
export async function GetCompraByIdApi(idCompra: number) {
  try {
    const { data } = await api.get(`/Compra/GetCompra/${idCompra}`);
    const response = CompraSchema.safeParse(data);
    if (response.success) {
      return response.data;
    }
    throw new Error("Error en la validación de datos del detalle de compra");
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al obtener el detalle de la compra');
    }
    throw error;
  }
}

// ── POST: Crear Nueva Compra ─────────────────────────────────────────────────
export async function AddCompraApi(formData: CreateCompraType) {
  try {
    const { data } = await api.post('/Compra/AddCompra', formData);
    return data; // Devuelve { message, idCompra }
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al crear la compra');
    }
    throw error;
  }
}

// ── PUT: Actualizar Compra Pendiente ─────────────────────────────────────────
export async function UpdateCompraApi(idCompra: number, formData: UpdateCompraType) {
  try {
    const { data } = await api.put(`/Compra/UpdateCompra/${idCompra}`, formData);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al actualizar la compra');
    }
    throw error;
  }
}

// ── PATCH: Cambiar Estado (Completado / Cancelado) ───────────────────────────
/*export async function ChangeEstadoCompraApi(idCompra: number, estado: 'completado' | 'cancelado') {
  try {
    const { data } = await api.patch(`/Compra/ChangeEstadoCompra/${idCompra}`, { estado });
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || `Error al cambiar el estado a ${estado}`);
    }
    throw error;
  }
}*/

//En CompraLoteApi.ts
export async function ChangeEstadoCompraApi(idCompra: number, estado: 'pendiente' | 'completado' | 'cancelado') {
  try {
    // Mandamos el estado en el body como lo espera tu controlador
    const { data } = await api.patch(`/Compra/ChangeEstadoCompra/${idCompra}`, { estado });
    return data; // { message: "..." }
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al cambiar el estado');
    }
    throw error;
  }
}