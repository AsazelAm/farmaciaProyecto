"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
function num(valor, porDefecto = 0) {
    const n = Number(valor);
    return Number.isFinite(n) ? n : porDefecto;
}
function fechaValida(valor) {
    if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor.trim()))
        return null;
    return valor.trim();
}
function textoValido(valor) { return typeof valor === 'string' ? valor.trim() : ''; }
const DataReporteFacturacion = {
    async getParametros() {
        const conection = await db_1.default.getConnection();
        try {
            const [estados, tipos] = await Promise.all([
                conection.query(`SELECT DISTINCT estado FROM factura ORDER BY estado ASC`),
                conection.query(`SELECT DISTINCT tipoFactura FROM factura ORDER BY tipoFactura ASC`),
            ]);
            return {
                estados: estados.map((e) => ({ value: e.estado, label: e.estado })),
                tiposFactura: tipos.map((t) => ({ value: t.tipoFactura, label: t.tipoFactura })),
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
        if (fechaInicio) {
            where += ` AND DATE(f.fechaEmision) >= ?`;
            params.push(fechaInicio);
        }
        if (fechaFin) {
            where += ` AND DATE(f.fechaEmision) <= ?`;
            params.push(fechaFin);
        }
        const estado = textoValido(filtros.estado);
        if (estado !== '') {
            where += ` AND f.estado = ?`;
            params.push(estado);
        }
        const tipoFactura = textoValido(filtros.tipoFactura);
        if (tipoFactura !== '') {
            where += ` AND f.tipoFactura = ?`;
            params.push(tipoFactura);
        }
        const busqueda = textoValido(filtros.busqueda);
        if (busqueda !== '') {
            const like = `%${busqueda}%`;
            where += ` AND (f.numeroFactura LIKE ? OR f.nitCliente LIKE ? OR f.razonSocial LIKE ?)`;
            params.push(like, like, like);
        }
        const rows = await conection.query(`SELECT
                f.idFactura,
                f.numeroFactura,
                DATE_FORMAT(f.fechaEmision, '%Y-%m-%d %H:%i') AS fechaEmision,
                f.tipoFactura,
                f.nitCliente,
                f.razonSocial,
                f.subtotal,
                f.descuento,
                f.impuesto,
                f.total,
                f.estado,
                DATE_FORMAT(f.fechaAnulacion, '%Y-%m-%d %H:%i') AS fechaAnulacion,
                f.motivoAnulacion,
                f.idVenta,
                v.idUsuario,
                TRIM(CONCAT(u.nombre, ' ', u.apellido)) AS usuarioEmisor,
                v.idUsuarioCancelacion,
                TRIM(CONCAT(a.nombre, ' ', a.apellido)) AS usuarioAnulacion,
                c.email AS emailCliente
            FROM factura f
            INNER JOIN venta v ON v.idVenta = f.idVenta
            LEFT JOIN usuario u ON u.idUsuario = v.idUsuario
            LEFT JOIN usuario a ON a.idUsuario = v.idUsuarioCancelacion
            LEFT JOIN cliente c ON c.idCliente = v.idCliente
            WHERE 1=1 ${where}
            ORDER BY f.fechaEmision DESC`, params);
        conection.release();
        const detalles = rows.map((r) => ({
            idFactura: num(r.idFactura),
            numeroFactura: r.numeroFactura ?? '',
            fechaEmision: r.fechaEmision,
            tipoFactura: r.tipoFactura ?? '',
            nitCliente: r.nitCliente ?? '',
            razonSocial: r.razonSocial ?? '',
            emailCliente: r.emailCliente ?? null,
            subtotal: num(r.subtotal),
            descuento: num(r.descuento),
            impuesto: num(r.impuesto),
            total: num(r.total),
            estado: r.estado ?? '',
            fechaAnulacion: r.fechaAnulacion ?? null,
            motivoAnulacion: r.motivoAnulacion ?? null,
            idVenta: num(r.idVenta),
            usuarioEmisor: r.usuarioEmisor ?? 'Sin usuario',
            usuarioAnulacion: r.usuarioAnulacion ?? null,
        }));
        const totalFacturas = detalles.length;
        const emitidas = detalles.filter((d) => d.estado.toLowerCase() === 'emitida' || d.estado.toLowerCase() === 'vigente');
        const anuladas = detalles.filter((d) => d.estado.toLowerCase() === 'anulada');
        const porEstadoMap = new Map();
        detalles.forEach((d) => {
            const actual = porEstadoMap.get(d.estado) ?? { estado: d.estado, facturas: 0, total: 0 };
            actual.facturas += 1;
            actual.total += d.total;
            porEstadoMap.set(d.estado, actual);
        });
        const porTipoMap = new Map();
        detalles.forEach((d) => {
            const actual = porTipoMap.get(d.tipoFactura) ?? { tipo: d.tipoFactura, facturas: 0, total: 0 };
            actual.facturas += 1;
            actual.total += d.total;
            porTipoMap.set(d.tipoFactura, actual);
        });
        const motivosMap = new Map();
        anuladas.forEach((d) => {
            const m = d.motivoAnulacion ?? 'Sin motivo';
            const actual = motivosMap.get(m) ?? { motivo: m, facturas: 0 };
            actual.facturas += 1;
            motivosMap.set(m, actual);
        });
        return {
            parametros: { fechaInicio, fechaFin, estado: estado || null, tipoFactura: tipoFactura || null, busqueda: busqueda || null },
            detalles,
            resumen: {
                totalFacturas,
                facturasEmitidas: emitidas.length,
                facturasAnuladas: anuladas.length,
                porcentajeAnuladas: totalFacturas > 0 ? (anuladas.length / totalFacturas) * 100 : 0,
                montoTotal: detalles.reduce((a, d) => a + d.total, 0),
                montoEmitido: emitidas.reduce((a, d) => a + d.total, 0),
                montoAnulado: anuladas.reduce((a, d) => a + d.total, 0),
                subtotalTotal: detalles.reduce((a, d) => a + d.subtotal, 0),
                descuentoTotal: detalles.reduce((a, d) => a + d.descuento, 0),
                impuestoTotal: detalles.reduce((a, d) => a + d.impuesto, 0),
                porEstado: [...porEstadoMap.values()].sort((a, b) => b.facturas - a.facturas),
                porTipo: [...porTipoMap.values()].sort((a, b) => b.facturas - a.facturas),
                motivosAnulacion: [...motivosMap.values()].sort((a, b) => b.facturas - a.facturas),
            },
        };
    },
};
exports.default = DataReporteFacturacion;
//# sourceMappingURL=ReporteFacturacionModels.js.map