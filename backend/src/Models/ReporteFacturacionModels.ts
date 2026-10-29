import conectar from '../config/db';

export interface IFiltrosFacturacion {
    fechaInicio?: string | null;
    fechaFin?: string | null;
    estado?: string | null;
    tipoFactura?: string | null;
    busqueda?: string | null;
}

function num(valor: any, porDefecto = 0): number {
    const n = Number(valor);
    return Number.isFinite(n) ? n : porDefecto;
}
function fechaValida(valor: any): string | null {
    if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor.trim())) return null;
    return valor.trim();
}
function textoValido(valor: any): string { return typeof valor === 'string' ? valor.trim() : ''; }

const DataReporteFacturacion = {
    async getParametros() {
        const conection = await conectar.getConnection();
        try {
            const estados = await conection.query(`SELECT DISTINCT estado FROM recibo ORDER BY estado ASC`);
            return {
                estados: (estados as any[]).map((e) => ({ value: e.estado, label: e.estado })),
                tiposFactura: [],
            };
        } finally { conection.release(); }
    },
    async getDatos(filtros: IFiltrosFacturacion) {
        const conection = await conectar.getConnection();
        const params: any[] = [];
        let where = '';
        const fechaInicio = fechaValida(filtros.fechaInicio);
        const fechaFin = fechaValida(filtros.fechaFin);
        if (fechaInicio) { where += ` AND DATE(r.fechaEmision) >= ?`; params.push(fechaInicio); }
        if (fechaFin) { where += ` AND DATE(r.fechaEmision) <= ?`; params.push(fechaFin); }
        const estado = textoValido(filtros.estado);
        if (estado !== '') { where += ` AND r.estado = ?`; params.push(estado); }
        const tipoFactura = textoValido(filtros.tipoFactura);
        const busqueda = textoValido(filtros.busqueda);
        if (busqueda !== '') {
            const like = `%${busqueda}%`;
            where += ` AND (r.numeroRecibo LIKE ? OR c.ci LIKE ? OR c.nombre LIKE ? OR c.apellido LIKE ?)`;
            params.push(like, like, like, like);
        }

        const rows = await conection.query(
            `SELECT
                r.idRecibo,
                r.numeroRecibo,
                DATE_FORMAT(r.fechaEmision, '%Y-%m-%d %H:%i') AS fechaEmision,
                r.estado,
                r.idVenta,
                v.subtotal,
                v.descuentoTotal,
                v.total,
                DATE_FORMAT(v.fechaCancelacion, '%Y-%m-%d %H:%i') AS fechaAnulacion,
                v.motivoCancelacion,
                v.idUsuario,
                TRIM(CONCAT(u.nombre, ' ', u.apellido)) AS usuarioEmisor,
                v.idUsuarioCancelacion,
                TRIM(CONCAT(a.nombre, ' ', a.apellido)) AS usuarioAnulacion,
                c.ci AS nitCliente,
                TRIM(CONCAT(c.nombre, ' ', COALESCE(c.apellido, ''))) AS razonSocial,
                c.email AS emailCliente
            FROM recibo r
            INNER JOIN venta v ON v.idVenta = r.idVenta
            LEFT JOIN usuario u ON u.idUsuario = v.idUsuario
            LEFT JOIN usuario a ON a.idUsuario = v.idUsuarioCancelacion
            LEFT JOIN cliente c ON c.idCliente = v.idCliente
            WHERE 1=1 ${where}
            ORDER BY r.fechaEmision DESC`,
            params,
        );
        conection.release();

        const detalles = (rows as any[]).map((r) => {
            const anulado = r.estado === 'anulado';
            return {
                idFactura: num(r.idRecibo),
                numeroFactura: r.numeroRecibo ?? '',
                fechaEmision: r.fechaEmision,
                tipoFactura: '',
                nitCliente: r.nitCliente ?? '',
                razonSocial: r.razonSocial ?? '',
                emailCliente: r.emailCliente ?? null,
                subtotal: num(r.subtotal),
                descuento: num(r.descuentoTotal),
                impuesto: 0,
                total: num(r.total),
                estado: r.estado ?? '',
                fechaAnulacion: anulado ? (r.fechaAnulacion ?? null) : null,
                motivoAnulacion: anulado ? (r.motivoCancelacion ?? null) : null,
                idVenta: num(r.idVenta),
                usuarioEmisor: r.usuarioEmisor ?? 'Sin usuario',
                usuarioAnulacion: r.usuarioAnulacion ?? null,
            };
        });

        const totalFacturas = detalles.length;
        const emitidas = detalles.filter((d) => d.estado === 'emitido');
        const anuladas = detalles.filter((d) => d.estado === 'anulado');
        const porEstadoMap = new Map<string, { estado: string; facturas: number; total: number }>();
        detalles.forEach((d) => {
            const actual = porEstadoMap.get(d.estado) ?? { estado: d.estado, facturas: 0, total: 0 };
            actual.facturas += 1; actual.total += d.total; porEstadoMap.set(d.estado, actual);
        });
        const motivosMap = new Map<string, { motivo: string; facturas: number }>();
        anuladas.forEach((d) => {
            const m = d.motivoAnulacion ?? 'Sin motivo';
            const actual = motivosMap.get(m) ?? { motivo: m, facturas: 0 };
            actual.facturas += 1; motivosMap.set(m, actual);
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
                impuestoTotal: 0,
                porEstado: [...porEstadoMap.values()].sort((a, b) => b.facturas - a.facturas),
                porTipo: [],
                motivosAnulacion: [...motivosMap.values()].sort((a, b) => b.facturas - a.facturas),
            },
        };
    },
};

export default DataReporteFacturacion;
