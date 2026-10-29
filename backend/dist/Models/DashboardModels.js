"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const ProductoDerivado_1 = require("./ProductoDerivado");
// ─── Utilidad interna ────────────────────────────────────────────────────────
// El driver de MariaDB devuelve COUNT/SUM como BigInt o string según la columna
// (DECIMAL viene como string). Normalizamos todo a Number para el frontend.
function num(valor, porDefecto = 0) {
    const n = Number(valor);
    return Number.isFinite(n) ? n : porDefecto;
}
const DataDashboard = {
    // ── KPIs: Tarjetas principales del dashboard ──────────────────────────────
    async getResumen() {
        const conection = await db_1.default.getConnection();
        try {
            const [ventasTotales, // Histórico: ventas completadas
            ventasHoy, // Ventas completadas de hoy
            ventasMes, // Ventas completadas del mes actual
            ventasMesAnt, // Ventas completadas del mes anterior (para % comparativo)
            ventasPendientes, ventasAnuladas, totalClientes, totalProductos, totalUsuarios, stockBajo, // Productos cuyo stock está por debajo del mínimo
            lotesPorVencer, // Lotes a vencer en los próximos 30 días
            lotesVencidos, // Lotes ya vencidos con stock disponible
            ] = await Promise.all([
                conection.query(`
                    SELECT COUNT(*) AS cantidad, IFNULL(SUM(total), 0) AS monto
                    FROM venta WHERE estado = 'completado'
                `),
                conection.query(`
                    SELECT COUNT(*) AS cantidad, IFNULL(SUM(total), 0) AS monto
                    FROM venta
                    WHERE estado = 'completado' AND DATE(fechaCreacion) = CURDATE()
                `),
                conection.query(`
                    SELECT COUNT(*) AS cantidad, IFNULL(SUM(total), 0) AS monto
                    FROM venta
                    WHERE estado = 'completado'
                      AND MONTH(fechaCreacion) = MONTH(NOW())
                      AND YEAR(fechaCreacion) = YEAR(NOW())
                `),
                conection.query(`
                    SELECT IFNULL(SUM(total), 0) AS monto
                    FROM venta
                    WHERE estado = 'completado'
                      AND MONTH(fechaCreacion) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))
                      AND YEAR(fechaCreacion) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))
                `),
                conection.query(`SELECT COUNT(*) AS total FROM venta WHERE estado = 'pendiente'`),
                conection.query(`SELECT COUNT(*) AS total FROM venta WHERE estado = 'cancelado'`),
                conection.query(`SELECT COUNT(*) AS total FROM cliente WHERE estado = 1`),
                conection.query(`SELECT COUNT(*) AS total FROM producto WHERE estado = 1`),
                conection.query(`SELECT COUNT(*) AS total FROM usuario WHERE estado = 1`),
                conection.query(`
                    SELECT COUNT(*) AS total FROM (
                        SELECT pr.idProducto, pr.stockMinimo, IFNULL(SUM(l.stock), 0) AS stockTotal
                        FROM producto pr
                        LEFT JOIN lote l ON l.idProducto = pr.idProducto
                          AND l.estado IN ('activo', 'pendiente')
                        WHERE pr.estado = 1
                        GROUP BY pr.idProducto, pr.stockMinimo
                        HAVING stockTotal <= pr.stockMinimo
                    ) AS bajo
                `),
                conection.query(`
                    SELECT COUNT(*) AS total FROM lote
                    WHERE estado IN ('activo', 'pendiente') AND stock > 0
                      AND fechaVencimiento BETWEEN CURDATE()
                      AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
                `),
                conection.query(`
                    SELECT COUNT(*) AS total FROM lote
                    WHERE estado IN ('activo', 'pendiente') AND fechaVencimiento < CURDATE()
                `),
            ]);
            return {
                kpis: {
                    ventasTotales: {
                        cantidad: num(ventasTotales[0].cantidad),
                        monto: num(ventasTotales[0].monto),
                    },
                    ventasHoy: {
                        cantidad: num(ventasHoy[0].cantidad),
                        monto: num(ventasHoy[0].monto),
                    },
                    ventasMes: {
                        cantidad: num(ventasMes[0].cantidad),
                        monto: num(ventasMes[0].monto),
                        comparativoMesAnterior: num(ventasMesAnt[0].monto),
                    },
                    ventasPendientes: num(ventasPendientes[0].total),
                    ventasAnuladas: num(ventasAnuladas[0].total),
                    totalClientes: num(totalClientes[0].total),
                    totalProductos: num(totalProductos[0].total),
                    totalUsuarios: num(totalUsuarios[0].total),
                    stockBajo: num(stockBajo[0].total),
                    lotesPorVencer: num(lotesPorVencer[0].total),
                    lotesVencidos: num(lotesVencidos[0].total),
                },
            };
        }
        finally {
            conection.release();
        }
    },
    // ── GRAFICO: Ventas de los últimos N meses (rellena meses sin ventas) ─────
    async getVentasPorMeses(meses = 12) {
        const conection = await db_1.default.getConnection();
        try {
            const rows = await conection.query(`
                SELECT DATE_FORMAT(fechaCreacion, '%Y-%m') AS mes,
                       COUNT(*) AS cantidad,
                       IFNULL(SUM(total), 0) AS monto
                FROM venta
                WHERE estado = 'completado'
                  AND fechaCreacion >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ? MONTH), '%Y-%m-01')
                GROUP BY mes
                ORDER BY mes ASC
            `, [meses]);
            // Generamos la serie completa (los 12 meses) incluidos los que
            // no tuvieron ventas, para que el gráfico de línea quede continuo.
            const serie = [];
            const hoy = new Date();
            for (let i = meses - 1; i >= 0; i--) {
                const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
                const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
                const encontrado = rows.find((f) => f.mes === clave);
                serie.push({
                    mes: clave,
                    cantidad: num(encontrado?.cantidad),
                    monto: num(encontrado?.monto),
                });
            }
            return serie;
        }
        finally {
            conection.release();
        }
    },
    // ── GRAFICO: Productos más vendidos (por unidades) ────────────────────────
    async getProductosMasVendidos(limite = 8) {
        const conection = await db_1.default.getConnection();
        try {
            const rows = await conection.query(`
                SELECT pr.idProducto, pr.codigoBarra, ${(0, ProductoDerivado_1.sqlNombreGenerico)('pr')} AS nombreGenerico, pr.nombreComercial,
                       SUM(dv.cantidad) AS unidades,
                       SUM(dv.subtotal) AS monto
                FROM detalleventa dv
                INNER JOIN venta v     ON v.idVenta = dv.idVenta
                INNER JOIN lote l      ON l.idLote = dv.idLote
                INNER JOIN producto pr ON pr.idProducto = l.idProducto
                WHERE v.estado = 'completado'
                GROUP BY pr.idProducto, pr.codigoBarra, pr.nombreComercial
                ORDER BY unidades DESC
                LIMIT ?
            `, [limite]);
            return rows.map((p) => ({
                idProducto: num(p.idProducto),
                codigoBarra: p.codigoBarra,
                nombreGenerico: p.nombreGenerico,
                nombreComercial: p.nombreComercial,
                unidades: num(p.unidades),
                monto: num(p.monto),
            }));
        }
        finally {
            conection.release();
        }
    },
    // ── GRAFICO: Distribución de ventas por estado (torta) ────────────────────
    async getVentasPorEstado() {
        const conection = await db_1.default.getConnection();
        try {
            const rows = await conection.query(`
                SELECT estado, COUNT(*) AS cantidad, IFNULL(SUM(total), 0) AS monto
                FROM venta
                GROUP BY estado
                ORDER BY cantidad DESC
            `);
            return rows.map((r) => ({
                estado: r.estado,
                cantidad: num(r.cantidad),
                monto: num(r.monto),
            }));
        }
        finally {
            conection.release();
        }
    },
    // ── GRAFICO: Ventas por sucursal (barras) ─────────────────────────────────
    async getVentasPorSucursal() {
        const conection = await db_1.default.getConnection();
        try {
            const rows = await conection.query(`
                SELECT s.idSucursal, s.nombre,
                       COUNT(v.idVenta) AS cantidad,
                       IFNULL(SUM(v.total), 0) AS monto
                FROM venta v
                INNER JOIN sucursal s ON s.idSucursal = v.idSucursal
                WHERE v.estado = 'completado'
                GROUP BY s.idSucursal, s.nombre
                ORDER BY monto DESC
            `);
            return rows.map((r) => ({
                idSucursal: num(r.idSucursal),
                nombre: r.nombre,
                cantidad: num(r.cantidad),
                monto: num(r.monto),
            }));
        }
        finally {
            conection.release();
        }
    },
    // ── GRAFICO: Ventas por forma de pago (torta) ─────────────────────────────
    async getVentasPorFormaPago() {
        const conection = await db_1.default.getConnection();
        try {
            const rows = await conection.query(`
                SELECT IFNULL(NULLIF(tipoPago, ''), 'Sin definir') AS tipoPago,
                       COUNT(*) AS cantidad,
                       IFNULL(SUM(total), 0) AS monto
                FROM venta
                WHERE estado = 'completado'
                GROUP BY tipoPago
                ORDER BY cantidad DESC
            `);
            return rows.map((r) => ({
                tipoPago: r.tipoPago,
                cantidad: num(r.cantidad),
                monto: num(r.monto),
            }));
        }
        finally {
            conection.release();
        }
    },
    // ── ALERTA: Productos con stock por debajo del mínimo ─────────────────────
    async getStockBajo(limite = 10) {
        const conection = await db_1.default.getConnection();
        try {
            const rows = await conection.query(`
                SELECT pr.idProducto, pr.codigoBarra, ${(0, ProductoDerivado_1.sqlNombreGenerico)('pr')} AS nombreGenerico, pr.nombreComercial,
                       pr.stockMinimo,
                       IFNULL(SUM(l.stock), 0) AS stockTotal
                FROM producto pr
                LEFT JOIN lote l ON l.idProducto = pr.idProducto
                  AND l.estado IN ('activo', 'pendiente')
                WHERE pr.estado = 1
                GROUP BY pr.idProducto, pr.codigoBarra, pr.nombreComercial, pr.stockMinimo
                HAVING stockTotal <= pr.stockMinimo
                ORDER BY stockTotal ASC
                LIMIT ?
            `, [limite]);
            return rows.map((p) => ({
                idProducto: num(p.idProducto),
                codigoBarra: p.codigoBarra,
                nombreGenerico: p.nombreGenerico,
                nombreComercial: p.nombreComercial,
                stockMinimo: num(p.stockMinimo),
                stockTotal: num(p.stockTotal),
            }));
        }
        finally {
            conection.release();
        }
    },
    // ── ALERTA: Lotes próximos a vencer ───────────────────────────────────────
    async getLotesPorVencer(dias = 30, limite = 10) {
        const conection = await db_1.default.getConnection();
        try {
            const rows = await conection.query(`
                SELECT l.idLote, l.numeroLote, l.codigo AS codigoLote, l.stock,
                       l.fechaVencimiento,
                       DATEDIFF(l.fechaVencimiento, CURDATE()) AS diasParaVencer,
                       pr.idProducto, ${(0, ProductoDerivado_1.sqlNombreGenerico)('pr')} AS nombreGenerico, pr.nombreComercial, ${(0, ProductoDerivado_1.sqlConcentracion)('pr')} AS concentracion
                FROM lote l
                INNER JOIN producto pr ON pr.idProducto = l.idProducto
                WHERE l.estado IN ('activo', 'pendiente')
                  AND l.stock > 0
                  AND l.fechaVencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
                ORDER BY l.fechaVencimiento ASC
                LIMIT ?
            `, [dias, limite]);
            return rows.map((l) => ({
                idLote: num(l.idLote),
                numeroLote: l.numeroLote,
                codigoLote: l.codigoLote,
                stock: num(l.stock),
                fechaVencimiento: l.fechaVencimiento,
                diasParaVencer: num(l.diasParaVencer),
                idProducto: num(l.idProducto),
                nombreGenerico: l.nombreGenerico,
                nombreComercial: l.nombreComercial,
                concentracion: l.concentracion,
            }));
        }
        finally {
            conection.release();
        }
    },
    // ── TABLA: Últimas ventas registradas ─────────────────────────────────────
    async getUltimasVentas(limite = 10) {
        const conection = await db_1.default.getConnection();
        try {
            const rows = await conection.query(`
                SELECT v.idVenta, v.fechaCreacion, v.subtotal, v.descuentoTotal,
                       v.total, v.estado, v.tipoPago,
                       cl.nombre AS cliente,
                       CONCAT(u.nombre, ' ', u.apellido) AS usuario,
                       s.nombre AS sucursal
                FROM venta v
                INNER JOIN cliente  cl ON cl.idCliente = v.idCliente
                INNER JOIN usuario  u  ON u.idUsuario  = v.idUsuario
                INNER JOIN sucursal s  ON s.idSucursal = v.idSucursal
                ORDER BY v.fechaCreacion DESC
                LIMIT ?
            `, [limite]);
            return rows.map((v) => ({
                idVenta: num(v.idVenta),
                fechaCreacion: v.fechaCreacion,
                subtotal: num(v.subtotal),
                descuentoTotal: num(v.descuentoTotal),
                impuestos: 0,
                total: num(v.total),
                estado: v.estado,
                tipoPago: v.tipoPago,
                cliente: v.cliente,
                usuario: v.usuario,
                sucursal: v.sucursal,
            }));
        }
        finally {
            conection.release();
        }
    },
};
exports.default = DataDashboard;
//# sourceMappingURL=DashboardModels.js.map