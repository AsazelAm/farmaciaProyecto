import api from "../lib/Axios";
import { isAxiosError } from "axios";

// ============================================
// TIPOS PARA EL FRONTEND
// ============================================

export interface BlogFormData {
  slug: string;
  titulo: string;
  subtitulo?: string;
  pagina_slug: string;
  resumen?: string;
  estado: 'borrador' | 'publicado' | 'archivado';
  publicado_en?: string | null;
  id_media_portada?: number | null;
  creado_por?: number | null;
}

export interface BloqueFormData {
  tipo_slug: string; // Usamos el slug para mapear al id_tipo_componente
  posicion: number;
  contenido_json: any;
  id_media?: number | null;
  activo?: boolean;
}

export interface CreateBlogPayload {
  blog: BlogFormData;
  bloques: BloqueFormData[];
}

// ============================================
// FUNCIONES DE API
// ============================================


export async function createBlogApi(payload: CreateBlogPayload) {
  try {
    const { data } = await api.post('/Blog', payload);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al crear el blog');
    }
    throw new Error('Error de conexión con el servidor');
  }
}


/**
 * Obtiene la lista de blogs
 */
export async function listBlogsApi(params?: {
  q?: string;
  estado?: string;
  pagina_slug?: string;
  page?: number;
  perPage?: number;
}) {
  try {
    const { data } = await api.get('/Blog', { params });
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al listar blogs');
    }
    throw new Error('Error de conexión con el servidor');
  }
}

/**
 * Obtiene el detalle de un blog
 */
export async function getBlogDetailApi(id: number) {
  try {
    const { data } = await api.get(`/Blog/${id}`);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al obtener blog');
    }
    throw new Error('Error de conexión con el servidor');
  }
}

/**
 * Actualiza un blog existente
 */
export async function updateBlogApi(id: number, payload: CreateBlogPayload) {
  try {
    const { data } = await api.put(`/Blog/${id}`, payload);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al actualizar blog');
    }
    throw new Error('Error de conexión con el servidor');
  }
}

/**
 * Obtiene el detalle completo de un blog (blog + bloques)
 */
export async function getBlogFullApi(id: number) {
  try {
    // Llama al endpoint GET /Blog/:id que BlogControllers.ts atiende con BlogControllers.detail
    const { data } = await api.get(`/Blog/${id}`); 
    return data; // La data incluye el blog y sus bloques (componentes)
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al obtener el blog');
    }
    throw new Error('Error de conexión con el servidor');
  }
}

/**
 * Elimina un blog
 */
export async function deleteBlogApi(id: number) {
  try {
    const { data } = await api.delete(`/Blog/${id}`);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al eliminar blog');
    }
    throw new Error('Error de conexión con el servidor');
  }
}

/**
 * Obtiene los tipos de componente disponibles
 */
export async function getTiposComponenteApi() {
  try {
    const { data } = await api.get('/Blog/tipos-componente');
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error al obtener tipos');
    }
    throw new Error('Error de conexión con el servidor');
  }
}