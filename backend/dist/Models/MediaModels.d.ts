export interface MediaCreate {
    bucket: string;
    ruta: string;
    url: string;
    mime: string;
    tamano_bytes: number;
    ancho?: number | null;
    alto?: number | null;
    texto_alternativo?: string | null;
}
export interface MediaData {
    id: number;
    bucket: string;
    ruta: string;
    url: string;
    mime: string;
    tamano_bytes: number;
    ancho: number | null;
    alto: number | null;
    texto_alternativo: string | null;
    creado_en: Date;
}
/**
 * ⭐ CREAR REGISTRO DE MEDIA EN LA BASE DE DATOS
 * Devuelve el ID del media creado
 */
export declare function createMedia(data: MediaCreate): Promise<number>;
/**
 * ⭐ OBTENER MEDIA POR ID
 */
export declare function getMediaById(id: number): Promise<MediaData | null>;
/**
 * ⭐ LISTAR MEDIAS CON FILTROS
 */
export declare function listMedias(params: {
    bucket?: string;
    page?: number;
    perPage?: number;
}): Promise<{
    data: MediaData[];
    meta: {
        page: number;
        perPage: number;
        total: number;
    };
}>;
/**
 * ⭐ ELIMINAR MEDIA (Por ID)
 * También elimina el archivo físico del servidor
 */
export declare function deleteMedia(id: number): Promise<void>;
/**
 * ⭐ PROCESAR Y GUARDAR ARCHIVO
 * Recibe un buffer, lo guarda en el servidor y devuelve la información
 */
export declare function saveUploadedFile(fileBuffer: Buffer, mimeType: string, baseUrl?: string): Promise<{
    fileName: string;
    ruta: string;
    url: string;
    ancho: number | null;
    alto: number | null;
}>;
