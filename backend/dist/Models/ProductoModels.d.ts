interface IProducto {
    codigoBarra: string;
    nombreComercial: string | null;
    descripcion: string | null;
    precio: number;
    img: string | null;
    requiereReceta: number;
    contraindicaciones: string | null;
    viaAdministracion: string | null;
    stockMinimo: number;
    idLaboratorio: number;
    idPresentacion: number;
}
declare const DataProducto: {
    GetProductoM(): Promise<any[]>;
    AddProductoM(prod: IProducto): Promise<number>;
    UpdateImgProductoM(ruta: string, idProducto: number | string): Promise<string>;
    UpdateProductoM(prod: IProducto, idProducto: number | string): Promise<string>;
    DeleteProductoM(idProducto: number | string): Promise<string>;
    VerificarCodigoBarraM(codigoBarra: string): Promise<number>;
    VerificarCodigoBarraUpdateM(codigoBarra: string, idProducto: number | string): Promise<number>;
    DeletePrincipiosProductoM(idProducto: number | string): Promise<string>;
    AddPrincipioProductoM(idProducto: number | string, idPrincipioActivo: number, concentracion: string | null): Promise<string>;
    DeleteTiposProductoM(idProducto: number | string): Promise<string>;
    AddTipoProductoM(idProducto: number | string, idTipoProd: number): Promise<string>;
    FindOrCreateTipoM(nombre: string): Promise<number>;
    FindOrCreateLaboratorioM(nombre: string): Promise<number>;
    FindOrCreatePresentacionM(nombre: string): Promise<number>;
};
export default DataProducto;
