import api from "../lib/Axios";
import { isAxiosError } from "axios";
import {
  VentaListSchema,
  VentaSchema,
  VentaEstadisticasSchema,
  LotesDisponiblesSchema,
  DatosFacturacionClienteSchema,
  AlertaFEFOSchema,
  type CreateVentaType,
  type UpdateVentaType,
  type IVentaFiltros,
  type IFacturaInput,
} from "../types"; // Asumiendo que tu index.ts está en ../types/index.ts

// ── GET: Obtener Estadísticas ────────────────────────────────────────────────
export async function GetEstadisticasVentasApi() {
  try {
    const { data } = await api.get('/Venta/GetEstadisticasVentas');
    const response = VentaEstadisticasSchema.safeParse(data);
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

// ── GET: Listar Ventas (con filtros y paginación) ────────────────────────────
export async function GetVentasApi(filtros?: IVentaFiltros) {
  try {
    const { data } = await api.get('/Venta/GetVentas', { params: filtros });
    // Tu backend devuelve { data: [...], total: X }. Validamos el array interior.
    const response = VentaListSchema.safeParse(data.data);
    if (response.success) {
      return { data: response.data, total: data.total };
    }
    throw new Error("Error en la validación de datos de la lista de ventas");
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al obtener las ventas');
    }
    throw error;
  }
}

// ── GET: Detalle de Venta por ID ──────────────────────────────────────────────
export async function GetVentaByIdApi(idVenta: number) {
  try {
    const { data } = await api.get(`/Venta/GetVenta/${idVenta}`);
    const response = VentaSchema.safeParse(data);
    if (response.success) {
      return response.data;
    }
    throw new Error("Error en la validación de datos del detalle de venta");
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al obtener el detalle de la venta');
    }
    throw error;
  }
}

// ── POST: Crear Nueva Venta ───────────────────────────────────────────────────
export async function AddVentaApi(formData: CreateVentaType) {
  try {
    const { data } = await api.post('/Venta/AddVenta', formData);
    return data; // Devuelve { message, idVenta }
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      const axiosError = error as any;
      const errorFinal = new Error(axiosError.response.data?.error || 'Error al crear la venta') as Error & { alertaFEFO?: any };
      errorFinal.alertaFEFO = axiosError.response.data?.alertaFEFO;
      throw errorFinal;
    }
    throw error;
  }
}

// ── PUT: Actualizar Venta Pendiente ───────────────────────────────────────────
export async function UpdateVentaApi(idVenta: number, formData: UpdateVentaType) {
  try {
    const { data } = await api.put(`/Venta/UpdateVenta/${idVenta}`, formData);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      const axiosError = error as any;
      const errorFinal = new Error(axiosError.response.data?.error || 'Error al actualizar la venta') as Error & { alertaFEFO?: any };
      errorFinal.alertaFEFO = axiosError.response.data?.alertaFEFO;
      throw errorFinal;
    }
    throw error;
  }
}

// ── PATCH: Cambiar Estado (Pendiente / Completado / Cancelado) ─────────────────
export async function ChangeEstadoVentaApi(
  idVenta: number,
  estado: 'pendiente' | 'completado' | 'cancelado',
  motivo?: string
) {
  try {
    // Mandamos el estado (y el motivo si es anulación) en el body como lo espera tu controlador
    const { data } = await api.patch(`/Venta/ChangeEstadoVenta/${idVenta}`, { estado, motivo });
    return data; // { message: "..." }
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al cambiar el estado');
    }
    throw error;
  }
}

// ── POST: Emitir Factura de una Venta Completada ──────────────────────────────
export async function EmitirFacturaApi(idVenta: number, formData: IFacturaInput) {
  try {
    const { data } = await api.post(`/Venta/EmitirFactura/${idVenta}`, formData);
    return data; // { message, idFactura }
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al emitir la factura');
    }
    throw error;
  }
}

// ── GET: Lotes Disponibles de un Producto (selector FEFO en el POS) ──────────
export async function GetLotesDisponiblesApi(idProducto: number) {
  try {
    const { data } = await api.get(`/Venta/GetLotesDisponibles/${idProducto}`);
    const response = LotesDisponiblesSchema.safeParse(data);
    if (response.success) {
      return response.data;
    }
    throw new Error("Error en la validación de datos de lotes disponibles");
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al obtener los lotes disponibles');
    }
    throw error;
  }
}

// ── GET: Datos de facturación (NIT/razón social) usados antes por un cliente ──
export async function GetDatosFacturacionClienteApi(idCliente: number) {
  try {
    const { data } = await api.get(`/Venta/GetDatosFacturacionCliente/${idCliente}`);
    const response = DatosFacturacionClienteSchema.safeParse(data);
    if (response.success) {
      return response.data;
    }
    throw new Error("Error en la validación de los datos de facturación del cliente");
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al obtener los datos de facturación del cliente');
    }
    throw error;
  }
}

// ── GET: Alerta FEFO de un lote elegido en el POS ────────────────────────────
// Indica si el lote seleccionado cumple la regla "primero en expirar, primero
// en salir" o si existe un lote más próximo que debería despacharse antes.
export async function GetAlertaFEFOApi(idProducto: number, idLote: number) {
  try {
    const { data } = await api.get(`/Venta/GetAlertaFEFO/${idProducto}/${idLote}`);
    const response = AlertaFEFOSchema.safeParse(data);
    if (response.success) {
      return response.data;
    }
    throw new Error("Error en la validación de la alerta FEFO");
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al obtener la alerta FEFO del lote');
    }
    throw error;
  }
}