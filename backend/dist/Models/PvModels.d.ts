declare const DataPv: {
    PvAll(): Promise<any>;
    AddPv(name: any, identificador: any): Promise<number>;
    UpdateImgAddpv(ruta: any, id: any): Promise<void>;
    UpdatebannerAddpv(ruta: any, id: any): Promise<void>;
    UpdatemodalAddpv(ruta: any, id: any): Promise<void>;
    UpdateCuadroAddpv(ruta: any, id: any): Promise<void>;
    DeletePv(id: any): Promise<string>;
    UpdatePvModels(nombre: any, identificador: any, id: any): Promise<string>;
    UpdatePvEstaModels(status: any, id: any): Promise<string>;
    PvCalendario(): Promise<any>;
};
export default DataPv;
