interface IProducto {
    codigoBarra: string;
    nombreGenerico: string;
    nombreComercial: string | null;
    concentracion: string | null;
    descripcion: string | null;
    precio: number;
    img: string | null;
    requiereReceta: number;
    contraindicaciones: string | null;
    viaAdministracion: string | null;
    stockMinimo: number;
    idLaboratorio: number;
    idTipoProd: number;
    idPresentacion: number;
}
declare const DataProducto: {
    GetProductoM(): Promise<any>;
    AddProductoM(prod: IProducto): Promise<number>;
    UpdateImgProductoM(ruta: string, idProducto: number | string): Promise<string>;
    UpdateProductoM(prod: IProducto, idProducto: number | string): Promise<string>;
    DeleteProductoM(idProducto: number | string): Promise<string>;
    VerificarCodigoBarraM(codigoBarra: string): Promise<number>;
    VerificarCodigoBarraUpdateM(codigoBarra: string, idProducto: number | string): Promise<number>;
};
export default DataProducto;
