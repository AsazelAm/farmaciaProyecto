declare const DataADM: {
    GetModalidades(): Promise<any>;
    AddModalidadSchema(nombre: any): Promise<string>;
    DeleteModalidad(id: any): Promise<string>;
    UpdateModalidad(mod: any, id: any): Promise<string>;
    GetAreasDeConocimineto(): Promise<any>;
    DeleteAreas(id: any): Promise<string>;
    AddAreasModels(area: any): Promise<string>;
    UpdateAreasModels(id: any, area: any): Promise<string>;
    GetEmpresaAll(): Promise<any>;
    GetCountryModels(): Promise<any>;
};
export default DataADM;
