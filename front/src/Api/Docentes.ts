import api from "../lib/Axios";
import { isAxiosError } from "axios";
import { DocentesSchema, HabilidadesSchema, HabilidadesSchema2, type AuthDocente } from "../types";

// GET - Obtener todos los docentes
export async function GetDocentes() {
    try {
        const { data } = await api.get('/Docente/GetDocente')
        const response = DocentesSchema.safeParse(data)
        if (response.success) {
            return response.data
        }
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

// GET - Obtener docente por ID
export async function GetDocenteById(id: number) {
    try {
        const { data } = await api.get(`/Docente/GetDocente/${id}`);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
        throw new Error('Error al obtener el docente');
    }
}

// GET - Obtener todas las habilidades disponibles
export async function GetHabilidades() {
    try {
        const { data } = await api.get('/Habilidad/GetHabilidades')
        const response = HabilidadesSchema.safeParse(data)
        if (response.success) {
            return response.data
        }
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

// GET - Obtener habilidades de un docente específico
export async function GethabilidadesById(id: any) {
    try {
        const { data } = await api.get(`/Docente/habilidades/${id}`);
        const response = HabilidadesSchema2.safeParse(data);
        if (response.success) {
            return response.data
        }
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

// POST - Crear docente
export async function AddDocentes(datos: { array1: any[]; array2: any[]; img: File | null; cv: File | null }) {
    try {
        const formData = new FormData();

        // Agregar array1 y array2 como JSON strings
        formData.append('array1', JSON.stringify(datos.array1));
        formData.append('array2', JSON.stringify(datos.array2));

        // Agregar archivos solo si existen
        if (datos.img) {
            formData.append('img', datos.img);
        }

        if (datos.cv) {
            formData.append('cv', datos.cv);
        }

        const { data } = await api.post(`/Docente/AddDocentes`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
        });

        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}


export async function GetCalendario(){
    try {
        
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

// PUT - Actualizar docente
export async function UpdateDocente(id: number, formData: any) {
    try {
        const form = new FormData();

        // Agregar array1 y array2 como strings JSON
        form.append('array1', JSON.stringify(formData.array1));
        form.append('array2', JSON.stringify(formData.array2));

        // Agregar archivos si existen (pueden ser File del input o null)
        if (formData.img && formData.img instanceof File) {
            form.append('img', formData.img);
        }

        if (formData.cv && formData.cv instanceof File) {
            form.append('cv', formData.cv);
        }

        const { data } = await api.put(`/Docente/UpdateDocente/${id}`, form, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
        throw new Error('Error al actualizar el docente');
    }
}

// DELETE - Eliminar docente (soft delete)
export async function DeleteDocente(id: any) {
    try {
        const { data } = await api.delete(`/Docente/DeleteDocentes/${id}`)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}


//Register Docentes
export async function RegisterDocenteAPI(FormDatos:AuthDocente){
    try {
        const { data } = await api.post(`/Docente/RegisterDocente`, FormDatos)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }   
    }
}

export async function VerificarDocenteAPI({ code, idDoc }: { code: string, idDoc: string }) {
  try {
    const { data } = await api.post(`/Docente/Verificar/${idDoc}`, { code });
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}