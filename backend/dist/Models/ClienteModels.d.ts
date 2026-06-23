declare const DataCliente: {
    GetClientM(): Promise<any>;
    AddClientM(ci: any, nombre: any, apellido: any, telefono: any, email: any): Promise<string>;
    VerificarCiM(ci: any): Promise<number>;
    VerificarCiUpdate(ci: any, idCliente: any): Promise<number>;
    VerificarEmail(email: string): Promise<number>;
    VerificarEmailUpdate(email: string, idCliente: string): Promise<number>;
    UpdateClientM(ci: any, nombre: any, apellido: any, telefono: any, email: any, idCliente: any): Promise<string>;
    DeleteClientM(idCliente: any): Promise<string>;
};
export default DataCliente;
