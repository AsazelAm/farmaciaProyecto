declare const DataTipoUs: {
    GetTipoUsM(): Promise<any>;
    AddTipoUsM(nameRol: any): Promise<string>;
    UpdateTipoUsM(nameRol: any, idTipoUs: any): Promise<string>;
    DeleteTipoUsM(idTipoUs: any): Promise<string>;
};
export default DataTipoUs;
