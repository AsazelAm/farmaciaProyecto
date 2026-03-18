declare const DataCertificacion: {
    AllCertification(): Promise<any>;
    AddCerModal(n_cert: any, opcion: any, nota: any, tipo: any): Promise<string>;
    DeleteCert(id: any): Promise<string>;
    UpdateCertiModels(n_cert: any, opcion: any, nota: any, tipo: any, id_cert: any): Promise<string>;
};
export default DataCertificacion;
