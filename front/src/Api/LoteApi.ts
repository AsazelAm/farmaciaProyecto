import api from "../lib/Axios";
import { isAxiosError } from "axios";
import {
  LoteListSchema,
  type ILoteFiltros,
} from "../types";

// ── GET: Listar lotes (con filtros y paginación) ─────────────────────────────
export async function GetLoteApi(filtros?: ILoteFiltros) {
  try {
    const { data } = await api.get('/Lote/GetLote', { params: filtros });
    // El backend devuelve { data: [...], total: X }
    const response = LoteListSchema.safeParse(data.data);
    if (response.success) {
      return { data: response.data, total: data.total };
    }
    console.warn("Zod parse warning (Lote):", response.error);
    throw new Error("Error en la validación de datos de la lista de lotes");
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al obtener los lotes');
    }
    throw error;
  }
}