declare const DataPrincipioActivo: {
    GetPrincipioActivoM(): Promise<any>;
    FindOrCreatePrincipioM(nombre: string): Promise<number>;
};
export default DataPrincipioActivo;
