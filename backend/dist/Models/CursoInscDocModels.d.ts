declare const CursInsDocModels: {
    GetCursDocAll(id_user: any): Promise<any>;
    GetAlumAsis(id_calendario: any): Promise<any>;
    AddAsistencia(fechas_asis: any, id_usuario: any, id_calendario: any): Promise<number>;
    UpdateAsis(asistencia: any, fecha_asis: any, id_usuario: any, id_calendario: any, id_asist: any): Promise<string>;
    UpdateFecha(fecha_anti: any, fecha_new: any, id_calen: any): Promise<string>;
    GetNotasAlu(id_user: any, id_calendario: any): Promise<any>;
    AddNotasAlum(nota: any, id_user: any, id_calendario: any): Promise<number>;
    UpdateNotaAlum(nota: any, id_user: any, id_calendar: any, id_nota: any): Promise<string>;
};
export default CursInsDocModels;
