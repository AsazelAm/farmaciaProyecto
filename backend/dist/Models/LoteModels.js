"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const DataLote = {
    // ── GET: Listar lotes con datos de producto/proveedor y alerta de vencimiento ──
    async listar(filtros) {
        const conection = await db_1.default.getConnection();
        let queryBase = `
            FROM lote l
            INNER JOIN producto  pr ON pr.idProducto  = l.idProducto
            INNER JOIN proveedor pv ON pv.idProveedor = l.idProveedor
            WHERE 1=1
        `;
        const queryParams = [];
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
        const dataNormalizada = data.map((row) => ({
            ...row,
            diasParaVencer: Number(row.diasParaVencer ?? 0),
        }));
        return { data: dataNormalizada, total };
    },
    // ── GET: Obtener un lote por ID (detalle individual) ───────────────────────
    async obtenerPorId(idLote) {
        const conection = await db_1.default.getConnection();
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
        if (result.length === 0)
            return null;
        return { ...result[0], diasParaVencer: Number(result[0].diasParaVencer ?? 0) };
    },
};
exports.default = DataLote;
//# sourceMappingURL=LoteModels.js.map