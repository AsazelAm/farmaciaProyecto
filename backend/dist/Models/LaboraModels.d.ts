declare const DataLabora: {
    GetLaboraM(): Promise<any>;
    AddLaboraM(nombre: any): Promise<number>;
    UpdateRutaimg(ruta: string, idLaboratorio: number | string): Promise<string>;
    UpdateLabM(id_lab: any, nombre: any): Promise<string>;
    DeleteLabM(idLaboratorio: any): Promise<string>;
    VerificarNombreM(nombre: string): Promise<{
        exists: boolean;
        message: string;
    } | {
        exists: boolean;
        message?: undefined;
    }>;
    VerificarUpdateNombreM(nombre: any, idLaboratorio: any): Promise<number>;
};
export default DataLabora;
