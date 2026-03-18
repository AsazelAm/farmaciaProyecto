// src/Api/CursoContenido.ts
import type { ContenidoNode } from "../Helpers/Contenido";
import api from "../lib/Axios";
import { isAxiosError } from "axios";

export interface CursoContenidoNode {
  id_contenido: number;
  id_curso: number;
  padre_id: number | null;
  titulo: string;
  descripcion: string | null;
  orden: number;
  nivel: number;
  hijos: CursoContenidoNode[];
}

export interface CursoContenidoCreateDTO {
  padre_id?: number | null;
  titulo: string;
  descripcion?: string | null;
  orden?: number;
  nivel?: number;
}

export interface CursoContenidoUpdateDTO {
  padre_id?: number | null;
  titulo?: string;
  descripcion?: string | null;
  orden?: number;
  nivel?: number;
}

/** LIST – árbol completo */
export async function listCursoContenidoApi(
  id_curso: number
): Promise<CursoContenidoNode[]> {
  try {
    const { data } = await api.get(`/Curso/${id_curso}/contenido`);
    return data?.data ?? [];
  } catch (error) {
    console.error("Error en listCursoContenidoApi:", error);
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data?.error ||
          error.response.data?.message ||
          "Error al listar el contenido"
      );
    }
    throw error;
  }
}

/** CREATE */
export async function createCursoContenidoApi(
  id_curso: number,
  payload: CursoContenidoCreateDTO
) {
  try {
    const { data } = await api.post(`/Curso/${id_curso}/contenido`, payload);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data?.error ||
          error.response.data?.message ||
          "Error al crear contenido"
      );
    }
    throw error;
  }
}

/** UPDATE */
export async function updateCursoContenidoApi(
  id_curso: number,
  id_contenido: number,
  payload: CursoContenidoUpdateDTO
) {
  try {
    const { data } = await api.put(
      `/Curso/${id_curso}/contenido/${id_contenido}`,
      payload
    );
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data?.error ||
          error.response.data?.message ||
          "Error al actualizar contenido"
      );
    }
    throw error;
  }
}

/** DELETE */
export async function deleteCursoContenidoApi(
  id_curso: number,
  id_contenido: number
) {
  try {
    const { data } = await api.delete(
      `/Curso/${id_curso}/contenido/${id_contenido}`
    );
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data?.error ||
          error.response.data?.message ||
          "Error al eliminar contenido"
      );
    }
    throw error;
  }
}
export async function deleteAllCursoContenidoApi(id_curso: number) {
  try {
    const { data } = await api.delete(`/Curso/${id_curso}/contenido`);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data?.error ||
          error.response.data?.message ||
          "Error al limpiar el contenido del curso"
      );
    }
    throw error;
  }
}

export async function createCursoContenidoBulkApi(
  id_curso: number,
  nodes: ContenidoNode[]
) {
  try {
    const { data } = await api.post(`/Curso/${id_curso}/contenido/bulk`, {
      nodes,
    });
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data?.error ||
          error.response.data?.message ||
          "Error al guardar el contenido del curso"
      );
    }
    throw error;
  }
}

