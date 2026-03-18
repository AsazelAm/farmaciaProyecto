export interface BlogBase {
    slug: string;
    titulo: string;
    subtitulo?: string | null;
    pagina_slug: string;
    resumen?: string | null;
    estado: 'borrador' | 'publicado' | 'archivado';
    publicado_en?: Date | null;
    id_media_portada?: number | null;
    creado_por?: number | null;
}
export interface BlogCreate extends BlogBase {
}
export interface BlogUpdate extends Partial<BlogBase> {
    id: number;
}
export interface BloqueData {
    id_tipo_componente: number;
    posicion: number;
    contenido_json: any;
    id_media?: number | null;
    activo?: boolean;
}
export interface BlogListItem {
    id: number;
    slug: string;
    titulo: string;
    subtitulo: string | null;
    estado: string;
    visitas: number;
    publicado_en: Date | null;
    creado_en: Date;
    portada_url: string | null;
    creador_nombre: string | null;
}
/** Crear blog base (sin bloques) */
export declare function createBlogBase(data: BlogCreate): Promise<number>;
/** Actualizar blog base */
export declare function updateBlogBase(data: BlogUpdate): Promise<void>;
/** Eliminar blog (CASCADE eliminará bloques) */
export declare function deleteBlog(id: number): Promise<void>;
/** Obtener blog por ID con info completa */
export declare function getBlogById(id: number): Promise<any>;
/** Listar blogs con filtros */
export declare function listBlogs(params: {
    q?: string;
    estado?: string;
    pagina_slug?: string;
    page?: number;
    perPage?: number;
}): Promise<{
    data: BlogListItem[];
    meta: {
        page: number;
        perPage: number;
        total: number;
    };
}>;
/** Crear bloques en batch */
export declare function createBloques(id_blog: number, bloques: BloqueData[]): Promise<void>;
/** Reemplazar todos los bloques de un blog */
export declare function replaceBloques(id_blog: number, bloques: BloqueData[]): Promise<void>;
/** Obtener bloques de un blog */
export declare function getBloquesByBlog(id_blog: number): Promise<any[]>;
/** Crear blog + bloques */
export declare function createBlogFull(blogData: BlogCreate, bloques: BloqueData[]): Promise<number>;
/** Actualizar blog + bloques */
export declare function updateBlogFull(id: number, blogData: Partial<BlogBase>, bloques?: BloqueData[]): Promise<void>;
/** Obtener blog completo (base + bloques) */
export declare function getBlogFull(id: number): Promise<{
    blog: any;
    bloques: any[];
}>;
export declare function getTiposComponente(): Promise<any[]>;
export declare function incrementVisitas(id: number): Promise<void>;
