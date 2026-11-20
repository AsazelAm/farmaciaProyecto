import api from "../lib/Axios";
import { isAxiosError } from "axios";
import {
  BajaListSchema,
  BajaSchema,
  LotesParaBajaResponseSchema,
  ReportePerdidasDatosSchema,
  type BajaType,
  type CrearBajaType,
  type IBajaFiltros,
  type IDeteccionBajaFiltros,
  type IReportePerdidasFiltros,
} from "../types";

// ═════════════════════════════════════════════════════════════════════════════
// BAJAS DE LOTES VENCIDOS / MERMAS
// El backend expone /api/BajaLoteVencido. Los importes y el estado SIEMPRE los
// calcula el servidor; el front solo envía la intención (lote, cantidad, acción).
// ═════════════════════════════════════════════════════════════════════════════

const BASE = "/BajaLoteVencido";

/** Los errores de dominio del backend usan `message`, no `error`. */
function mensajeError(error: unknown, fallback: string): Error {
  if (isAxiosError(error) && error.response) {
    const data = error.response.data as { message?: string; error?: string } | undefined;
    return new Error(data?.message || data?.error || fallback);
  }
  return error instanceof Error ? error : new Error(fallback);
}

/** Quita los valores vacíos para que express-validator no reciba parámetros inválidos. */
function paramsLimpios(filtros?: object): Record<string, unknown> {
  const resultado: Record<string, unknown> = {};
  Object.entries(filtros ?? {}).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== "") resultado[clave] = valor;
  });
  return resultado;
}

// ── Detección ────────────────────────────────────────────────────────────────
export async function GetLotesVencidosApi(filtros?: IDeteccionBajaFiltros) {
  try {
    const { data } = await api.get(`${BASE}/GetLotesVencidos`, {
      params: paramsLimpios(filtros),
    });
    const response = LotesParaBajaResponseSchema.safeParse(data);
    if (response.success) return response.data;
    throw new Error("Error en la validación de los lotes vencidos");
  } catch (error) {
    throw mensajeError(error, "Error al obtener los lotes vencidos");
  }
}

export async function GetProximosAVencerApi(dias: 30 | 60 | 90, filtros?: IDeteccionBajaFiltros) {
  try {
    const { data } = await api.get(`${BASE}/GetProximosAVencer`, {
      params: paramsLimpios({ ...filtros, dias }),
    });
    const response = LotesParaBajaResponseSchema.safeParse(data);
    if (response.success) return response.data;
    throw new Error("Error en la validación de los próximos a vencer");
  } catch (error) {
    throw mensajeError(error, "Error al obtener los lotes próximos a vencer");
  }
}

// ── Consultas ────────────────────────────────────────────────────────────────
export async function GetBajasApi(filtros?: IBajaFiltros) {
  try {
    const { data } = await api.get(`${BASE}/GetBajas`, { params: paramsLimpios(filtros) });
    const response = BajaListSchema.safeParse(data.data);
    if (response.success) {
      return { data: response.data, total: Number(data.total), pagina: Number(data.pagina), porPagina: Number(data.porPagina) };
    }
    throw new Error("Error en la validación del listado de bajas");
  } catch (error) {
    throw mensajeError(error, "Error al obtener las bajas de lotes vencidos");
  }
}

export async function GetBajaByIdApi(idBaja: number): Promise<BajaType> {
  try {
    const { data } = await api.get(`${BASE}/GetBaja/${idBaja}`);
    const response = BajaSchema.safeParse(data);
    if (response.success) return response.data;
    throw new Error("Error en la validación del detalle de la baja");
  } catch (error) {
    throw mensajeError(error, "Error al obtener el detalle de la baja");
  }
}

export async function GetReportePerdidasApi(filtros: IReportePerdidasFiltros) {
  try {
    const { data } = await api.get(`${BASE}/ReportePerdidas`, { params: paramsLimpios(filtros) });
    const response = ReportePerdidasDatosSchema.safeParse(data);
    if (response.success) return response.data;
    throw new Error("Error en la validación del reporte de pérdidas");
  } catch (error) {
    throw mensajeError(error, "Error al obtener el reporte de pérdidas");
  }
}

// ── Escritura ────────────────────────────────────────────────────────────────
async function mutateBaja(peticion: Promise<{ data: unknown }>, fallback: string): Promise<BajaType> {
  try {
    const { data } = await peticion;
    const response = BajaSchema.safeParse(data);
    if (response.success) return response.data;
    throw new Error("Error en la validación de la respuesta de la baja");
  } catch (error) {
    throw mensajeError(error, fallback);
  }
}

export async function AddBajaApi(formData: CrearBajaType) {
  return mutateBaja(api.post(`${BASE}/AddBaja`, formData), "Error al registrar la baja");
}

export async function AprobarBajaApi(idBaja: number, idUsuarioAutoriza: number) {
  return mutateBaja(
    api.patch(`${BASE}/AprobarBaja/${idBaja}`, { idUsuarioAutoriza }),
    "Error al aprobar la baja",
  );
}

export async function EjecutarBajaApi(idBaja: number, idUsuarioAutoriza: number) {
  return mutateBaja(
    api.patch(`${BASE}/EjecutarBaja/${idBaja}`, { idUsuarioAutoriza }),
    "Error al ejecutar la baja",
  );
}

export async function AnularBajaApi(idBaja: number, motivo?: string) {
  return mutateBaja(api.patch(`${BASE}/AnularBaja/${idBaja}`, { motivo }), "Error al anular la baja");
}

export async function AjustarPerdidaApi(idBaja: number) {
  return mutateBaja(api.patch(`${BASE}/AjustarPerdida/${idBaja}`), "Error al ajustar la pérdida");
}
