declare const DataPresentacion: {
    GetPresentaM(): Promise<any>;
    AddPresentaM(nombre: any): Promise<string>;
    UpdatePresentaM(nombre: any, idPresentacion: any): Promise<string>;
    DeletePresentaM(idPresentacion: any): Promise<string>;
    ValidaNombreM(nombre: any): Promise<{
        exists: boolean;
        message: string;
    } | {
        exists: boolean;
        message?: undefined;
    }>;
    VeriUpdaNombreM(nombre: any, idPresentacion: any): Promise<number>;
};
export default DataPresentacion;
