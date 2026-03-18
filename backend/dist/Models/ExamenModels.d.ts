declare const DataExamen: {
    GetExamen(): Promise<any>;
    VerifedCode(code: any): Promise<number>;
    AddExamenModels(Exa: any, code: any, Cur: any): Promise<string>;
    DeleteExamenModels(id: any): Promise<string>;
    UpdateExamenModels(Examen: any, codigo: any, Curso: any, id_exa: any): Promise<string>;
};
export default DataExamen;
