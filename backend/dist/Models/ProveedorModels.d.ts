interface Proveedores {
    codigo: string;
    nombre: string;
    telefono: string;
    email: string;
    direccion: string;
    contactoPrincipal: string;
}
declare const DataProveedor: {
    GetProveedorM(): Promise<any>;
    AddProveedorM(Proveedor: Proveedores): Promise<number>;
    VerificarEmail(email: string): Promise<number>;
    VerificarEmailUpdate(email: string, idProveedor: string): Promise<number>;
    VerificarCodigo(codigo: any): Promise<number>;
    VerificarCodigoUpdate(codigo: any, idProveedor: any): Promise<number>;
    UpdateProveedorM(data: Proveedores, idProveedor: any): Promise<string>;
    DeleteProveedorM(idProveedor: any): Promise<string>;
};
export default DataProveedor;
