interface UpdateCalendarioType2 {
    id_calendario: number;
    id_pv: number;
    docente: number;
    id_mod: number;
    id_city: number;
    Estado: string;
    FechaIni: string;
    FechaCreacion: string;
    Horaini: string;
    horaFin: string;
    Dias: string;
    id_curso: number;
}
declare const DataCalendario: {
    GetViewAreasModels(id: any): Promise<any>;
    GetViewProModels(id: any): Promise<any>;
    UpdateCalendarioMain(data: UpdateCalendarioType2): Promise<void>;
    DeleteOldVca(idCalendario: any): Promise<void>;
    DeleteOldVcp(idCalendario: any): Promise<void>;
    GetCalendarioById(id: any): Promise<any>;
};
export default DataCalendario;
