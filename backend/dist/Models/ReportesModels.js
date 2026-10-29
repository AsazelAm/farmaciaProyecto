"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const FRECUENCIAS = ['diario', 'semanal', 'mensual'];
const CONFIGS = {
    venta: {
        tabla: 'venta',
        alias: 'v',
        estadoCompletado: 'completado',
        campoId: 'idVenta',
        colDescuento: 'descuentoTotal',
        colImpuesto: null,
        joinPagador: `INNER JOIN cliente cl ON cl.idCliente = v.idCliente`,
        campoPagador: 'cl.nombre',
        aliasPagador: 'cliente',
        campoNumero: `(SELECT r.numeroRecibo FROM recibo r
             WHERE r.idVenta = v.idVenta
             ORDER BY r.fechaEmision ASC LIMIT 1)`,
        columnaExtra: 'v.tipoPago AS tipoPago',
    },
    compra: {
        tabla: 'compra',
        alias: 'c',
        estadoCompletado: 'completado',
        campoId: 'idCompra',
        colDescuento: 'descuento',
        colImpuesto: 'impuesto',
        joinPagador: `INNER JOIN proveedor pr ON pr.idProveedor = c.idProveedor`,
        campoPagador: 'pr.nombre',
        aliasPagador: 'proveedor',
        campoNumero: 'c.numeroFactura',
    },
};
function num(valor, porDefecto = 0) {
    const n = Number(valor);
    return Number.isFinite(n) ? n : porDefecto;
}
// Serializa una fecha local a 'YYYY-MM-DD' para usarla en las consultas SQL.
function iso(fecha) {
    const a = String(fecha.getFullYear()).padStart(4, '0');
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${a}-${m}-${d}`;
}
// Rango por defecto según la frecuencia elegida:
//  diario  → hoy · semanal → lunes a domingo de la semana actual · mensual → mes actual.
function rangoPorDefecto(frecuencia) {
    const hoy = new Date();
    if (frecuencia === 'diario') {
        return { inicio: iso(hoy), fin: iso(hoy) };
    }
    if (frecuencia === 'semanal') {
        const desdeLunes = (hoy.getDay() + 6) % 7; // lunes = 0
        const lunes = new Date(hoy);
        lunes.setDate(hoy.getDate() - desdeLunes);
        const domingo = new Date(lunes);
        domingo.setDate(lunes.getDate() + 6);
        return { inicio: iso(lunes), fin: iso(domingo) };
    }
    const primero = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimo = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    return { inicio: iso(primero), fin: iso(ultimo) };
}
// Valida que sea una fecha real 'YYYY-MM-DD'; si no, devuelve el valor por defecto.
function parsearFecha(valor, porDefecto) {
    if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor))
        return porDefecto;
    const [y, m, d] = valor.split('-').map(Number);
    const fecha = new Date(y, m - 1, d);
    return iso(fecha) === valor ? valor : porDefecto;
}
// Expresión de agrupación SQL según la frecuencia (intenta usar índices por rango).
function agruparPorFrecuencia(alias) {
    const grupoSemanal = `DATE_SUB(${alias}.fechaCreacion, INTERVAL WEEKDAY(${alias}.fechaCreacion) DAY)`;
    return {
        diario: {
            unidad: `DATE_FORMAT(${alias}.fechaCreacion, '%Y-%m-%d')`,
            etiqueta: `DATE_FORMAT(${alias}.fechaCreacion, '%d/%m/%Y')`,
        },
        semanal: {
            unidad: `DATE_FORMAT(${grupoSemanal}, '%Y-%m-%d')`,
            etiqueta: `DATE_FORMAT(${grupoSemanal}, '%d/%m/%Y')`,
        },
        mensual: {
            unidad: `DATE_FORMAT(${alias}.fechaCreacion, '%Y-%m')`,
            etiqueta: `DATE_FORMAT(${alias}.fechaCreacion, '%m/%Y')`,
        },
    };
}
async function obtenerDatosEntidad(entidad, frecuenciaValue, fechaInicioValue, fechaFinValue) {
    const config = CONFIGS[entidad];
    if (!config)
        throw new Error('Entidad de reporte no válida');
    const frecuencia = FRECUENCIAS.includes(frecuenciaValue)
        ? frecuenciaValue
        : 'diario';
    const porDefecto = rangoPorDefecto(frecuencia);
    let fechaInicio = parsearFecha(fechaInicioValue, porDefecto.inicio);
    let fechaFin = parsearFecha(fechaFinValue, porDefecto.fin);
    if (fechaInicio > fechaFin) {
        const aux = fechaInicio;
        fechaInicio = fechaFin;
        fechaFin = aux;
    }
    const agrupacion = agruparPorFrecuencia(config.alias);
    const { unidad, etiqueta } = agrupacion[frecuencia];
    const conection = await db_1.default.getConnection();
    const exprImpuesto = config.colImpuesto ? `${config.alias}.${config.colImpuesto}` : '0';
    try {
        const [rowsPeriodos, rowsDetalle] = await Promise.all([
            conection.query(`
                SELECT ${unidad} AS unidad,
                       ${etiqueta} AS etiqueta,
                       COUNT(*) AS cantidad,
                       IFNULL(SUM(${config.alias}.subtotal), 0) AS subtotal,
                       IFNULL(SUM(${config.alias}.${config.colDescuento}), 0) AS descuentoTotal,
                       IFNULL(SUM(${exprImpuesto}), 0) AS impuestos,
                       IFNULL(SUM(${config.alias}.total), 0) AS total
                FROM ${config.tabla} ${config.alias}
                WHERE ${config.alias}.estado = '${config.estadoCompletado}'
                  AND DATE(${config.alias}.fechaCreacion) BETWEEN ? AND ?
                GROUP BY unidad, etiqueta
                ORDER BY unidad ASC
            `, [fechaInicio, fechaFin]),
            conection.query(`
                SELECT ${config.alias}.${config.campoId} AS idEntidad,
                       IFNULL(${config.campoNumero}, '') AS numeroFactura,
                       ${config.alias}.fechaCreacion,
                       ${config.alias}.subtotal,
                       ${config.alias}.${config.colDescuento} AS descuentoTotal,
                       ${exprImpuesto} AS impuestos,
                       ${config.alias}.total,
                       ${config.alias}.estado,
                       ${config.campoPagador} AS pagador,
                       CONCAT(u.nombre, ' ', u.apellido) AS usuario,
                       s.nombre AS sucursal
                       ${config.columnaExtra ? `, ${config.columnaExtra}` : ''}
                FROM ${config.tabla} ${config.alias}
                ${config.joinPagador}
                INNER JOIN usuario  u ON u.idUsuario  = ${config.alias}.idUsuario
                INNER JOIN sucursal s ON s.idSucursal = ${config.alias}.idSucursal
                WHERE DATE(${config.alias}.fechaCreacion) BETWEEN ? AND ?
                ORDER BY ${config.alias}.fechaCreacion DESC
            `, [fechaInicio, fechaFin]),
        ]);
        const periodos = rowsPeriodos.map((p) => ({
            unidad: p.unidad,
            etiqueta: p.etiqueta,
            cantidad: num(p.cantidad),
            subtotal: num(p.subtotal),
            descuentoTotal: num(p.descuentoTotal),
            impuestos: num(p.impuestos),
            total: num(p.total),
        }));
        const detalles = rowsDetalle.map((e) => ({
            idEntidad: num(e.idEntidad),
            numeroFactura: e.numeroFactura ?? null,
            fechaCreacion: e.fechaCreacion,
            pagador: e.pagador ?? null,
            usuario: e.usuario ?? null,
            sucursal: e.sucursal ?? null,
            estado: e.estado,
            subtotal: num(e.subtotal),
            descuentoTotal: num(e.descuentoTotal),
            impuestos: num(e.impuestos),
            total: num(e.total),
        }));
        const reducer = (acum, p) => {
            acum.cantidad += p.cantidad;
            acum.subtotal += p.subtotal;
            acum.descuentoTotal += p.descuentoTotal;
            acum.impuestos += p.impuestos;
            acum.total += p.total;
            return acum;
        };
        return {
            frecuencia,
            fechaInicio,
            fechaFin,
            periodos,
            detalles,
            totales: periodos.reduce(reducer, {
                cantidad: 0,
                subtotal: 0,
                descuentoTotal: 0,
                impuestos: 0,
                total: 0,
            }),
        };
    }
    finally {
        conection.release();
    }
}
const DataReportes = {
    // ── Datos de ventas agrupados por periodo (diario/semanal/mensual) ────────
    // periodos y totales solo consideran ventas 'completado' (ingresos reales);
    // en el detalle se listan TODAS las ventas del rango con su estado.
    async getDatos(frecuenciaValue, fechaInicioValue, fechaFinValue) {
        const datos = await obtenerDatosEntidad('venta', frecuenciaValue, fechaInicioValue, fechaFinValue);
        const ventas = datos.detalles.map((v) => ({
            idVenta: num(v.idEntidad),
            numeroFactura: v.numeroFactura,
            fechaCreacion: v.fechaCreacion,
            cliente: v.pagador,
            usuario: v.usuario,
            sucursal: v.sucursal,
            tipoPago: v.tipoPago ?? null,
            estado: v.estado,
            subtotal: num(v.subtotal),
            descuentoTotal: num(v.descuentoTotal),
            impuestos: num(v.impuestos),
            total: num(v.total),
        }));
        return {
            ...datos,
            ventas,
        };
    },
    // ── Datos de compras agrupados por periodo (diario/semanal/mensual) ───────
    async getDatosCompra(frecuenciaValue, fechaInicioValue, fechaFinValue) {
        const datos = await obtenerDatosEntidad('compra', frecuenciaValue, fechaInicioValue, fechaFinValue);
        return {
            ...datos,
            compras: datos.detalles,
        };
    },
};
exports.default = DataReportes;
//# sourceMappingURL=ReportesModels.js.map