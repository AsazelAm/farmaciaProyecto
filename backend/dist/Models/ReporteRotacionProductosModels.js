"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const ProductoDerivado_1 = require("./ProductoDerivado");
function num(valor, porDefecto = 0) {
    const n = Number(valor);
    return Number.isFinite(n) ? n : porDefecto;
}
function idValido(valor) {
    if (valor === undefined || valor === null || valor === '')
        return null;
    const n = Number(valor);
    return Number.isInteger(n) && n > 0 ? n : null;
}
function fechaValida(valor) {
    if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor.trim()))
        return null;
    return valor.trim();
}
function textoValido(valor) {
    return typeof valor === 'string' ? valor.trim() : '';
}
const DataReporteRotacionProductos = {
    async getParametros() {
        const conection = await db_1.default.getConnection();
        try {
            const [laboratorios, tiposProducto] = await Promise.all([
                conection.query(`SELECT idLaboratorio, nombre FROM laboratorio WHERE estado = 1 ORDER BY nombre ASC`),
                conection.query(`SELECT idTipoProd, nombre FROM tipoproducto WHERE estado = 1 ORDER BY nombre ASC`),
            ]);
            return {
                laboratorios: laboratorios.map((l) => ({ idLaboratorio: num(l.idLaboratorio), nombre: l.nombre })),
                tiposProducto: tiposProducto.map((t) => ({ idTipoProd: num(t.idTipoProd), nombre: t.nombre })),
            };
        }
        finally {
            conection.release();
        }
    },
    async getDatos(filtros) {
        const conection = await db_1.default.getConnection();
        const params = [];
        let where = '';
        const fechaInicio = fechaValida(filtros.fechaInicio);
        const fechaFin = fechaValida(filtros.fechaFin);
        const idLaboratorio = idValido(filtros.idLaboratorio);
        const idTipoProducto = idValido(filtros.idTipoProducto);
        const busqueda = textoValido(filtros.busqueda);
        if (idLaboratorio !== null) {
            where += ` AND pr.idLaboratorio = ?`;
            params.push(idLaboratorio);
        }
        if (idTipoProducto !== null) {
            where += ` AND EXISTS (SELECT 1 FROM productotipoproducto ptp WHERE ptp.idProducto = pr.idProducto AND ptp.idTipoProd = ?)`;
            params.push(idTipoProducto);
        }
        if (busqueda !== '') {
            const like = `%${busqueda}%`;
            where += ` AND (pr.nombreComercial LIKE ? OR pr.codigoBarra LIKE ? OR ${(0, ProductoDerivado_1.sqlNombreGenerico)('pr')} LIKE ?)`;
            params.push(like, like, like);
        }
        const subParams = [];
        let subWhere = `v.estado = 'completado'`;
        if (fechaInicio) {
            subWhere += ` AND DATE(v.fechaCreacion) >= ?`;
            subParams.push(fechaInicio);
        }
        if (fechaFin) {
            subWhere += ` AND DATE(v.fechaCreacion) <= ?`;
            subParams.push(fechaFin);
        }
        const rows = await conection.query(`SELECT
                pr.idProducto,
                pr.codigoBarra,
                pr.nombreComercial,
                ${(0, ProductoDerivado_1.sqlNombreGenerico)('pr')} AS nombreGenerico,
                ${(0, ProductoDerivado_1.sqlConcentracion)('pr')} AS concentracion,
                pres.nombre AS presentacion,
                lab.idLaboratorio,
                lab.nombre AS laboratorio,
                (SELECT tp.nombre FROM productotipoproducto ptp INNER JOIN tipoproducto tp ON tp.idTipoProd = ptp.idTipoProd WHERE ptp.idProducto = pr.idProducto ORDER BY tp.idTipoProd ASC LIMIT 1) AS tipoProducto,
                COALESCE(ventas.unidades, 0) AS unidadesVendidas,
                COALESCE(ventas.frecuencia, 0) AS frecuenciaSalida,
                COALESCE(ventas.monto, 0) AS montoVendido,
                COALESCE(stock.stockActual, 0) AS stockActual,
                COALESCE(stock.valorStock, 0) AS valorStock,
                DATE_FORMAT(stock.proximoVencimiento, '%Y-%m-%d') AS proximoVencimiento
            FROM producto pr
            INNER JOIN laboratorio lab ON lab.idLaboratorio = pr.idLaboratorio
            INNER JOIN presentacion pres ON pres.idPresentacion = pr.idPresentacion
            LEFT JOIN (
                SELECT dv.idProducto, SUM(dv.cantidad) AS unidades, COUNT(DISTINCT dv.idVenta) AS frecuencia, SUM(dv.subtotal) AS monto
                FROM detalleventa dv INNER JOIN venta v ON v.idVenta = dv.idVenta
                WHERE ${subWhere}
                GROUP BY dv.idProducto
            ) ventas ON ventas.idProducto = pr.idProducto
            LEFT JOIN (
                SELECT l.idProducto, SUM(l.stock) AS stockActual, SUM(l.stock * l.precioCompra) AS valorStock, MIN(CASE WHEN l.stock > 0 THEN l.fechaVencimiento END) AS proximoVencimiento
                FROM lote l
                GROUP BY l.idProducto
            ) stock ON stock.idProducto = pr.idProducto
            WHERE pr.estado = 1 ${where}
            ORDER BY COALESCE(ventas.monto, 0) DESC, pr.nombreComercial ASC`, [...subParams, ...params]);
        conection.release();
        const productos = rows.map((r) => ({
            idProducto: num(r.idProducto),
            codigoBarra: r.codigoBarra ?? '',
            nombreComercial: r.nombreComercial ?? '',
            nombreGenerico: r.nombreGenerico ?? null,
            concentracion: r.concentracion ?? null,
            presentacion: r.presentacion ?? null,
            idLaboratorio: num(r.idLaboratorio),
            laboratorio: r.laboratorio ?? 'Sin laboratorio',
            tipoProducto: r.tipoProducto ?? null,
            unidadesVendidas: num(r.unidadesVendidas),
            frecuenciaSalida: num(r.frecuenciaSalida),
            montoVendido: num(r.montoVendido),
            stockActual: num(r.stockActual),
            valorStock: num(r.valorStock),
            proximoVencimiento: r.proximoVencimiento ?? null,
        }));
        // Clasificación ABC por monto vendido acumulado
        const ordenados = [...productos].sort((a, b) => b.montoVendido - a.montoVendido);
        const totalMonto = ordenados.reduce((acc, p) => acc + p.montoVendido, 0);
        let acumulado = 0;
        const clasificacionMap = new Map();
        ordenados.forEach((p) => {
            acumulado += p.montoVendido;
            const porcentaje = totalMonto > 0 ? (acumulado / totalMonto) * 100 : 0;
            if (porcentaje <= 80)
                clasificacionMap.set(p.idProducto, 'A');
            else if (porcentaje <= 95)
                clasificacionMap.set(p.idProducto, 'B');
            else
                clasificacionMap.set(p.idProducto, 'C');
        });
        const detalles = productos.map((p) => ({
            ...p,
            clasificacion: clasificacionMap.get(p.idProducto) ?? 'C',
        })).filter((p) => {
            if (filtros.soloConStock && p.stockActual <= 0)
                return false;
            if (filtros.clasificacion && p.clasificacion !== filtros.clasificacion)
                return false;
            return true;
        });
        // Resumen
        const porClasificacion = ['A', 'B', 'C'].map((c) => {
            const grupo = detalles.filter((p) => p.clasificacion === c);
            return {
                clasificacion: c,
                productos: grupo.length,
                unidadesVendidas: grupo.reduce((a, p) => a + p.unidadesVendidas, 0),
                montoVendido: grupo.reduce((a, p) => a + p.montoVendido, 0),
                valorStock: grupo.reduce((a, p) => a + p.valorStock, 0),
            };
        });
        const porLaboratorioMap = new Map();
        detalles.forEach((p) => {
            const actual = porLaboratorioMap.get(p.idLaboratorio) ?? { idLaboratorio: p.idLaboratorio, laboratorio: p.laboratorio, productos: 0, montoVendido: 0, valorStock: 0 };
            actual.productos += 1;
            actual.montoVendido += p.montoVendido;
            actual.valorStock += p.valorStock;
            porLaboratorioMap.set(p.idLaboratorio, actual);
        });
        const topProductos = [...detalles]
            .sort((a, b) => b.montoVendido - a.montoVendido)
            .slice(0, 10)
            .map((p) => ({ idProducto: p.idProducto, producto: p.nombreComercial, clasificacion: p.clasificacion, unidades: p.unidadesVendidas, monto: p.montoVendido }));
        const criticos = detalles
            .filter((p) => p.clasificacion === 'C' && p.proximoVencimiento)
            .sort((a, b) => String(a.proximoVencimiento).localeCompare(String(b.proximoVencimiento)))
            .slice(0, 10)
            .map((p) => ({ idProducto: p.idProducto, producto: p.nombreComercial, stock: p.stockActual, proximoVencimiento: p.proximoVencimiento, valorStock: p.valorStock }));
        return {
            parametros: { fechaInicio, fechaFin, idLaboratorio, idTipoProducto, clasificacion: filtros.clasificacion ?? null, busqueda: busqueda || null, soloConStock: filtros.soloConStock !== false },
            detalles,
            resumen: {
                totalProductos: detalles.length,
                totalUnidadesVendidas: detalles.reduce((a, p) => a + p.unidadesVendidas, 0),
                totalMontoVendido: detalles.reduce((a, p) => a + p.montoVendido, 0),
                totalStock: detalles.reduce((a, p) => a + p.stockActual, 0),
                totalValorStock: detalles.reduce((a, p) => a + p.valorStock, 0),
                porClasificacion,
                porLaboratorio: [...porLaboratorioMap.values()].sort((a, b) => b.montoVendido - a.montoVendido),
                topProductos,
                criticos,
            },
        };
    },
};
exports.default = DataReporteRotacionProductos;
//# sourceMappingURL=ReporteRotacionProductosModels.js.map