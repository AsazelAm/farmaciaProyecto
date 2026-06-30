import conectar from '../config/db';

// ─── Interfaces ────────────────────────────────────────────────────────────
export interface ILoteFiltros {
    estado?: 'pendiente' | 'activo' | 'vencido' | 'cancelado';
    idProducto?: number;
    idProveedor?: number;
    soloProximosVencer?: boolean; // <= 30 días
    busqueda?: string; // busca por codigo, numeroLote o nombre de producto
    pagina?: number;
    porPagina?: number;
}

const DataLote = {

    // ── GET: Listar lotes con datos de producto/proveedor y alerta de vencimiento ──
    async listar(filtros: ILoteFiltros) {
        const conection = await conectar.getConnection();

        let queryBase = `
            FROM lote l
            INNER JOIN producto  pr ON pr.idProducto  = l.idProducto
            INNER JOIN proveedor pv ON pv.idProveedor = l.idProveedor
            WHERE 1=1
        `;
        const queryParams: any[] = [];

        if (filtros.estado) {
            queryBase += ` AND l.estado = ?`;
            queryParams.push(filtros.estado);
        }
        if (filtros.idProducto) {
            queryBase += ` AND l.idProducto = ?`;
            queryParams.push(filtros.idProducto);
        }
        if (filtros.idProveedor) {
            queryBase += ` AND l.idProveedor = ?`;
            queryParams.push(filtros.idProveedor);
        }
        if (filtros.soloProximosVencer) {
            queryBase += ` AND l.fechaVencimiento <= DATE_ADD(NOW(), INTERVAL 30 DAY) AND l.estado = 'activo'`;
        }
        if (filtros.busqueda) {
            queryBase += ` AND (l.codigo LIKE ? OR l.numeroLote LIKE ? OR pr.nombreGenerico LIKE ? OR pr.nombreComercial LIKE ?)`;
            const like = `%${filtros.busqueda}%`;
            queryParams.push(like, like, like, like);
        }

        // Total para paginación
        const countResult = await conection.query(`SELECT COUNT(*) as total ${queryBase}`, queryParams);
        const total = Number(countResult[0].total);

        const pagina = filtros.pagina || 1;
        const porPagina = filtros.porPagina || 10;
        const offset = (pagina - 1) * porPagina;

        const queryFinal = `
            SELECT
                l.idLote, l.codigo, l.numeroLote, l.stock,
                l.fechaVencimiento, l.precioCompra, l.fechaIngreso,
                l.fechaCreacion, l.fechaModificacion, l.fechaFabricacion,
                l.estado, l.idProducto, l.idProveedor,
                pr.nombreGenerico, pr.nombreComercial, pr.codigoBarra,
                pv.nombre AS proveedor,
                DATEDIFF(l.fechaVencimiento, NOW()) AS diasParaVencer
            ${queryBase}
            ORDER BY l.fechaVencimiento ASC
            LIMIT ? OFFSET ?
        `;
        queryParams.push(porPagina, offset);

        const data = await conection.query(queryFinal, queryParams);
        conection.release();

        const dataNormalizada = (data as any[]).map((row: any) => ({
            ...row,
            diasParaVencer: Number(row.diasParaVencer ?? 0),
        }));

        return { data: dataNormalizada, total };
    },

    // ── GET: Obtener un lote por ID (detalle individual) ───────────────────────
    async obtenerPorId(idLote: number) {
        const conection = await conectar.getConnection();

        const result = await conection.query(`
            SELECT
                l.*,
                pr.nombreGenerico, pr.nombreComercial, pr.codigoBarra,
                pv.nombre AS proveedor,
                DATEDIFF(l.fechaVencimiento, NOW()) AS diasParaVencer
            FROM lote l
            INNER JOIN producto  pr ON pr.idProducto  = l.idProducto
            INNER JOIN proveedor pv ON pv.idProveedor = l.idProveedor
            WHERE l.idLote = ?
        `, [idLote]);

        conection.release();
        if (result.length === 0) return null;
        return { ...result[0], diasParaVencer: Number(result[0].diasParaVencer ?? 0) };
    },
};

export default DataLote;