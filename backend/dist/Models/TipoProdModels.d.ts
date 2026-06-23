declare const DataTipoProd: {
    GetTipoProdM(): Promise<any>;
    AddTipoProdM(nombre: any): Promise<string>;
    UpdateTipoProdM(nombre: any, idTipoProd: any): Promise<string>;
    DeleteTipoProdM(idTipoProd: any): Promise<string>;
};
export default DataTipoProd;
