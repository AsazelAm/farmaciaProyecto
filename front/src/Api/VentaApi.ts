import api from "../lib/Axios";
import { isAxiosError } from "axios";
import {
  VentaListSchema,
  VentaSchema,
  VentaEstadisticasSchema,
  LotesDisponiblesSchema,
  AlertaFEFOSchema,
  type CreateVentaType,
  type UpdateVentaType,
  type IVentaFiltros,
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

// ── POST: Emitir Recibo de una Venta Completada ───────────────────────────────
export async function EmitirReciboApi(idVenta: number) {
  try {
    const { data } = await api.post(`/Venta/EmitirRecibo/${idVenta}`);
    return data; // { message, idRecibo, numeroRecibo }
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al emitir el recibo');
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

// ── GET: Recibo en PDF (devuelve el archivo como Blob) ───────────────────────
export async function GetReciboPdfApi(idVenta: number): Promise<Blob> {
  try {
    const { data } = await api.get(`/Venta/ReciboPdf/${idVenta}`, { responseType: "blob" });
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      // Con responseType "blob", incluso el error JSON llega como Blob: hay que leerlo
      let mensaje = "Error al generar el recibo PDF";
      if (error.response.data instanceof Blob) {
        try {
          mensaje = JSON.parse(await error.response.data.text()).error || mensaje;
        } catch { /* se queda el mensaje por defecto */ }
      }
      throw new Error(mensaje);
    }
    throw error;
  }
}

// ── Descarga el PDF en el navegador ──────────────────────────────────────────
export async function DescargarReciboPdfApi(idVenta: number) {
  const blob = await GetReciboPdfApi(idVenta);
  const url = URL.createObjectURL(blob);          // URL temporal en memoria
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `recibo-venta-${String(idVenta).padStart(5, "0")}.pdf`;
  // Si el navegador ignora "download", que abra una pestaña nueva en lugar de
  // reemplazar la vista actual (evita que el POS quede en blanco).
  enlace.target = "_blank";
  enlace.rel = "noopener";
  document.body.appendChild(enlace);
  enlace.click();                                  // dispara la descarga
  // No quitamos el enlace ni liberamos la URL de inmediato: algunos
  // navegadores cancelan la descarga si el ancla desaparece al instante.
  setTimeout(() => {
    enlace.remove();
    URL.revokeObjectURL(url);
  }, 1000);
}