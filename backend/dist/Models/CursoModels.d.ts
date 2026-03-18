export type SeccionClave = 'audiencia' | 'objetivos' | 'prerequisitos' | 'certificaciones' | 'beneficios' | 'inversion';
export type SeccionesMap = Partial<Record<SeccionClave, string>>;
export interface CursoBaseCreate {
    nombre: string;
    codigo: string;
    duracion: number;
    precio: number | null;
    descripcion?: string | null;
    img?: string | null;
}
export interface CursoBaseUpdate extends CursoBaseCreate {
    id_curso: number;
}
export interface CursoListItem {
    id_curso: number;
    n_curso: string;
    codigo: string;
    duracion: number;
    precio: number | null;
    descripcion: string | null;
    img: string | null;
    areas: string | null;
    propuestas: string | null;
}
export interface ListMeta {
    page: number;
    perPage: number;
    total: number;
}
export interface AddCalendarioType {
    HoraIni: string;
    HoraFin: string;
    FechaIni: string;
    FechaCreacion: string;
    Dias: string;
    id_mod: number;
    id_pv: number;
    id_curso: number;
    id_user: number;
    id_city: number;
    Estado: string;
}
export interface CursoContenido {
    id_contenido: number;
    id_curso: number;
    padre_id: number | null;
    titulo: string;
    descripcion: string | null;
    orden: number;
    nivel: number;
    creado_en: Date;
    actualizado_en: Date;
}
export interface CursoContenidoCreate {
    id_curso: number;
    padre_id?: number | null;
    titulo: string;
    descripcion?: string | null;
    orden?: number;
    nivel?: number;
}
export interface CursoContenidoUpdate {
    id_contenido: number;
    id_curso: number;
    padre_id?: number | null;
    titulo?: string;
    descripcion?: string | null;
    orden?: number;
    nivel?: number;
}
export interface CursoContenidoNode extends CursoContenido {
    hijos: CursoContenidoNode[];
}
export declare function codigoExiste(codigo: string): Promise<boolean>;
export declare function codigoExisteEnOtro(id_curso: number, codigo: string): Promise<boolean>;
export declare function createCursoBase(p: CursoBaseCreate): Promise<number>;
export declare function updateCursoBase(p: CursoBaseUpdate): Promise<void>;
export declare function deleteCursoSoft(id_curso: number): Promise<void>;
export declare function upsertSecciones(id_curso: number, secciones: SeccionesMap): Promise<void>;
export declare function getSecciones(id_curso: number): Promise<SeccionesMap>;
export declare function setAreas(id_curso: number, areaIds: number[]): Promise<void>;
export declare function setPropuestas(id_curso: number, propuestaIds: number[]): Promise<void>;
export declare function getAreasIds(id_curso: number): Promise<number[]>;
export declare function getPropuestasIds(id_curso: number): Promise<number[]>;
export declare function createCursoFull(base: CursoBaseCreate, secciones: SeccionesMap, areaIds?: number[], propuestaIds?: number[]): Promise<number>;
export declare function updateCursoFull(base: CursoBaseUpdate, secciones: SeccionesMap, areaIds?: number[], propuestaIds?: number[]): Promise<void>;
export declare function listCursosPaged(q?: string, page?: number, perPage?: number): Promise<{
    data: CursoListItem[];
    meta: ListMeta;
}>;
export declare function getCursoFull(id_curso: number): Promise<{
    base: any;
    secciones: Partial<Record<SeccionClave, string>>;
    areaIds: number[];
    propuestaIds: number[];
}>;
export declare function CursoCalendarioModels(): Promise<any>;
export declare function ModaCalendario(): Promise<any>;
export declare function CityCalendario(): Promise<any>;
export declare function AddCalendarioModels(data: AddCalendarioType): Promise<number>;
export declare function AddViewAreas(idCalendario: any, idAreas: any, idCurso: any): Promise<void>;
export declare function AddViewPropuesta(idCalendario: any, idPv: any, idCurso: any): Promise<void>;
export declare function GetCalendarioModals(): Promise<any>;
export declare function DeleteCalendarioModels(id: number): Promise<string>;
export declare function GetCursoForCalendarModels(): Promise<any>;
/**
 * Obtiene TODO el contenido de un curso en forma de árbol
 */
export declare function listCursoContenido(id_curso: number): Promise<CursoContenidoNode[]>;
/**
 * Obtener un solo ítem por id
 */
export declare function getCursoContenidoById(id_contenido: number): Promise<CursoContenido | null>;
/**
 * Crear contenido (sección, módulo, clase, etc.)
 */
export declare function createCursoContenido(data: CursoContenidoCreate): Promise<number>;
/**
 * Actualizar contenido (parcial)
 */
export declare function updateCursoContenido(data: CursoContenidoUpdate): Promise<void>;
/**
 * Eliminar un ítem de contenido (hijos se borran en cascada)
 */
export declare function deleteCursoContenido(id_curso: number, id_contenido: number): Promise<void>;
/**
 * Eliminar TODO el contenido de un curso
 */
export declare function deleteAllCursoContenido(id_curso: number): Promise<void>;
export interface CursoContenidoTreeInput {
    titulo: string;
    descripcion?: string | null;
    hijos?: CursoContenidoTreeInput[];
}
export declare function createCursoContenidoBulk(id_curso: number, nodes: CursoContenidoTreeInput[]): Promise<void>;
