export interface ILoteFiltros {
    estado?: 'pendiente' | 'activo' | 'vencido' | 'cancelado' | 'cuarentena' | 'devuelto';
    idProducto?: number;
    idProveedor?: number;
    soloProximosVencer?: boolean;
    busqueda?: string;
    pagina?: number;
    porPagina?: number;
}
declare const DataLote: {
    listar(filtros: ILoteFiltros): Promise<{
        data: any[];
        total: number;
    }>;
    obtenerPorId(idLote: number): Promise<any>;
};
export default DataLote;
