import api from "../lib/Axios";
import { isAxiosError } from "axios";
import { GetSchameCursoCalendario } from "../types";


/* ============================
   Tipos del payload nuevo
============================ */
export type Secciones = Partial<{
  audiencia: string;
  objetivos: string;
  prerequisitos: string;
  certificaciones: string;
  contenido: string;
  beneficios: string;
  inversion: string;
}>;

export interface BaseCursoDTO {
  nombre: string;
  codigo: string;
  duracion: number;
  precio: number | null;
  descripcion?: string | null;
}

export interface CreateCursoDTO {
  base: BaseCursoDTO;
  secciones?: Secciones;
  areas?: number[];        // ids de áreas
  propuestas?: number[];   // ids de propuesta_valor
}

export interface UpdateCursoDTO extends CreateCursoDTO {}

/* ===============================================
   Helpers: form-data si hay archivo, si no JSON
=============================================== */
function buildMultipart(
  data: CreateCursoDTO | UpdateCursoDTO,
  file?: File | null
) {
  const fd = new FormData();
  if (file) fd.append("img", file);

  // OJO: backend parsea estos campos desde strings JSON (parseJsonFields)
  fd.append("base", JSON.stringify(data.base));
  if (data.secciones)  fd.append("secciones", JSON.stringify(data.secciones));
  if (data.areas)      fd.append("areas", JSON.stringify(data.areas));
  if (data.propuestas) fd.append("propuestas", JSON.stringify(data.propuestas));
  return fd;
}


/* ============================
   API: CRUD
============================ */

/** LIST */
export async function listCursos(params?: { q?: string; page?: number; perPage?: number }) {
  try {
    const { q = "", page = 1, perPage = 200 } = params || {};
    const response = await api.get(`/Curso`, { params: { q, page, perPage } });
    
    console.log('Response completa:', response.data); // 👈 DEBUG
    
    // Maneja ambos formatos
    if (response.data?.ok && response.data?.data) {
      return response.data.data;
    }
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error en listCursos:', error); // 👈 DEBUG
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.error || "Error al listar cursos");
    }
    throw error;
  }
}

/** DETAIL */
export async function getCurso(id: number) {
  try {
    const { data } = await api.get(`/Curso/${id}`);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.error || "Error al obtener el curso");
    }
    throw error;
  }
}

/** CREATE — acepta payload nuevo o el legacy {array1..array10,img} */
export async function createCurso(
  payload:
    | CreateCursoDTO,
  file?: File | null
) {
  try {
    let body: FormData | CreateCursoDTO;
    // ¿viene legacy?
      body = file ? buildMultipart(payload, file) : payload;

    const headers = body instanceof FormData
      ? { "Content-Type": "multipart/form-data" }
      : undefined;

    const { data } = await api.post(`/Curso`, body, { headers });
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.error || "Error al crear el curso");
    }
    throw error;
  }
}

/** UPDATE */
export async function updateCurso(
  id: number,
  payload: UpdateCursoDTO,
  file?: File | null
) {
  try {
    const body = file ? buildMultipart(payload, file) : payload;

    const headers = body instanceof FormData
      ? { "Content-Type": "multipart/form-data" }
      : undefined;

    const { data } = await api.put(`/Curso/${id}`, body, { headers });
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.error || "Error al actualizar el curso");
    }
    throw error;
  }
}

/** DELETE */
export async function deleteCurso(id: number) {
  try {
    const { data } = await api.delete(`/Curso/${id}`);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.error || "Error al eliminar el curso");
    }
    throw error;
  }
}


export async function GetCursoCalendarioApi(){
    try {
        const {data} = await api.get('/Curso/GetCursoCalendario')
        const response = GetSchameCursoCalendario.safeParse(data)
        if(response.success){
            return response.data
        }
    } catch (error) {
         if(isAxiosError(error)&& error.response){
            throw new Error(error.response.data.error);

        }
    }
}




