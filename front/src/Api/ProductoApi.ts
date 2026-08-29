import api from "../lib/Axios";
import { isAxiosError } from "axios";
import { z } from "zod";
import {
  ProductoShcemass,
  type DeleteProducto,
} from "../types";

type Productos = z.infer<typeof ProductoShcemass>;

// ── GET: obtener todos los productos activos ───────────────────────────────────
export async function GetProductoApi(): Promise<Productos> {
  try {
    const { data } = await api.get("/Producto/GetProducto");
    const response = ProductoShcemass.safeParse(data);
    if (response.success) {
      return response.data;
    }
    console.warn("Zod parse warning (Producto):", response.error);
    // Si el parse falla devolvemos el array crudo para no bloquear la UI
    return data as Productos;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}

// ── POST: crear un nuevo producto (multipart/form-data para la imagen) ─────────
export async function AddProductoApi(formData: FormData) {
  try {
    const { data } = await api.post("/Producto/AddProducto", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}

// ── PUT: actualizar un producto ────────────────────────────────────────────────
export async function UpdateProductoApi(
  formData: FormData,
  idProducto: number
) {
  try {
    const { data } = await api.put(
      `/Producto/UpdateProducto/${idProducto}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}

// ── DELETE: desactivar un producto ────────────────────────────────────────────
export async function DeleteProductoApi(
  idProducto: DeleteProducto["idProducto"]
) {
  try {
    const { data } = await api.delete(
      `/Producto/DeleteProducto/${idProducto}`
    );
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}
