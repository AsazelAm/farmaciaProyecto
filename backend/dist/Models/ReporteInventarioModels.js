"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.idValido = idValido;
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
const SELECT_LOTES = `
    SELECT
        l.idLote,
        l.numeroLote,
        l.codigo,
        l.stock,
        l.precioCompra,
        DATE_FORMAT(l.fechaVencimiento, '%Y-%m-%d') AS fechaVencimiento,
        pr.idProducto,
        pr.nombreComercial,
        ${(0, ProductoDerivado_1.sqlNombreGenerico)('pr')} AS nombreGenerico,
        ${(0, ProductoDerivado_1.sqlConcentracion)('pr')} AS concentracion,
        lab.idLaboratorio,
        lab.nombre AS laboratorio,
        tp.idTipoProd,
        tp.nombre AS tipoProducto
    FROM lote l
    INNER JOIN producto pr ON pr.idProducto = l.idProducto
    INNER JOIN laboratorio lab ON lab.idLaboratorio = pr.idLaboratorio
    LEFT JOIN productotipoproducto ptp ON ptp.idProducto = pr.idProducto
    LEFT JOIN tipoproducto tp ON tp.idTipoProd = ptp.idTipoProd
`;
const DataReporteInventario = {
    async getParametros() {
        const conection = await db_1.default.getConnection();
        try {
            const [laboratorios, tipos] = await Promise.all([
                conection.query(`SELECT idLaboratorio, nombre FROM laboratorio WHERE estado = 1 ORDER BY nombre ASC`),
                conection.query(`SELECT idTipoProd, nombre FROM tipoproducto WHERE estado = 1 ORDER BY nombre ASC`),
            ]);
            return {
                laboratorios: laboratorios.map((l) => ({ idLaboratorio: num(l.idLaboratorio), nombre: l.nombre })),
                tiposProducto: tipos.map((t) => ({ idTipoProd: num(t.idTipoProd), nombre: t.nombre })),
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
        if (filtros.soloConStock !== false) {
            where += ` AND l.stock > 0`;
        }
        const idLaboratorio = idValido(filtros.idLaboratorio);
        if (idLaboratorio !== null) {
            where += ` AND pr.idLaboratorio = ?`;
            params.push(idLaboratorio);
        }
        const idTipoProducto = idValido(filtros.idTipoProducto);
        if (idTipoProducto !== null) {
            where += ` AND tp.idTipoProd = ?`;
            params.push(idTipoProducto);
        }
        const busqueda = typeof filtros.busqueda === 'string' ? filtros.busqueda.trim() : '';
        if (busqueda !== '') {
            const like = `%${busqueda}%`;
            where += ` AND (l.codigo LIKE ? OR l.numeroLote LIKE ? OR pr.nombreComercial LIKE ? OR ${(0, ProductoDerivado_1.sqlNombreGenerico)('pr')} LIKE ?)`;
            params.push(like, like, like, like);
        }
        const rows = await conection.query(`${SELECT_LOTES} WHERE 1=1 ${where} ORDER BY tp.nombre ASC, lab.nombre ASC, pr.nombreComercial ASC, l.idLote ASC`, params);
        conection.release();
        const lotes = rows.map((r) => {
            const stock = num(r.stock);
            const costo = num(r.precioCompra);
            return {
                idLote: num(r.idLote),
                codigo: r.codigo,
                numeroLote: r.numeroLote,
                stock,
                costoUnitario: costo,
                subtotal: stock * costo,
                fechaVencimiento: r.fechaVencimiento,
                producto: {
                    idProducto: num(r.idProducto),
                    nombreComercial: r.nombreComercial,
                    nombreGenerico: r.nombreGenerico,
                    concentracion: r.concentracion,
                },
                idLaboratorio: num(r.idLaboratorio),
                laboratorio: r.laboratorio,
                idTipoProducto: num(r.idTipoProd),
                tipoProducto: r.tipoProducto,
            };
        });
        const porTipo = new Map();
        const porLaboratorio = new Map();
        const porProducto = new Map();
        lotes.forEach((l) => {
            const t = porTipo.get(l.tipoProducto ?? 'Sin tipo') ?? { tipoProducto: l.tipoProducto ?? 'Sin tipo', lotes: 0, unidades: 0, valor: 0 };
            t.lotes += 1;
            t.unidades += l.stock;
            t.valor += l.subtotal;
            porTipo.set(l.tipoProducto ?? 'Sin tipo', t);
            const lb = porLaboratorio.get(l.laboratorio ?? 'Sin laboratorio') ?? { laboratorio: l.laboratorio ?? 'Sin laboratorio', lotes: 0, unidades: 0, valor: 0 };
            lb.lotes += 1;
            lb.unidades += l.stock;
            lb.valor += l.subtotal;
            porLaboratorio.set(l.laboratorio ?? 'Sin laboratorio', lb);
            const p = porProducto.get(l.producto.idProducto) ?? { idProducto: l.producto.idProducto, producto: l.producto.nombreComercial ?? l.producto.nombreGenerico ?? `Producto ${l.producto.idProducto}`, lotes: 0, unidades: 0, valor: 0 };
            p.lotes += 1;
            p.unidades += l.stock;
            p.valor += l.subtotal;
            porProducto.set(l.producto.idProducto, p);
        });
        return {
            parametros: { idLaboratorio, idTipoProducto, busqueda, soloConStock: filtros.soloConStock !== false },
            lotes,
            resumen: {
                totalLotes: lotes.length,
                totalUnidades: lotes.reduce((a, l) => a + l.stock, 0),
                valorTotal: lotes.reduce((a, l) => a + l.subtotal, 0),
                porTipoProducto: [...porTipo.values()].sort((a, b) => b.valor - a.valor),
                porLaboratorio: [...porLaboratorio.values()].sort((a, b) => b.valor - a.valor),
                porProducto: [...porProducto.values()].sort((a, b) => b.valor - a.valor),
            },
        };
    },
};
exports.default = DataReporteInventario;
//# sourceMappingURL=ReporteInventarioModels.js.map