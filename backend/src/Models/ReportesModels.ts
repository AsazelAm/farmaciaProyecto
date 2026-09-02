import conectar from '../config/db';

const FRECUENCIAS = ['diario', 'semanal', 'mensual'] as const;
export type FrecuenciaReporte = typeof FRECUENCIAS[number];

// ─── Utilidad interna ────────────────────────────────────────────────────────
// El driver de MariaDB devuelve SUM sobre DECIMAL como string y COUNT como
// BigInt; normalizamos todo a Number para el frontend.
function num(valor: any, porDefecto = 0): number {
    const n = Number(valor);
    return Number.isFinite(n) ? n : porDefecto;
}

// Serializa una fecha local a 'YYYY-MM-DD' para usarla en las consultas SQL.
function iso(fecha: Date): string {
    const a = String(fecha.getFullYear()).padStart(4, '0');
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${a}-${m}-${d}`;
}

// Rango por defecto según la frecuencia elegida:
//  diario  → hoy · semanal → lunes a domingo de la semana actual · mensual → mes actual.
function rangoPorDefecto(frecuencia: FrecuenciaReporte): { inicio: string; fin: string } {
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
function parsearFecha(valor: any, porDefecto: string): string {
    if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return porDefecto;
    const [y, m, d] = valor.split('-').map(Number);
    const fecha = new Date(y, m - 1, d);
    return iso(fecha) === valor ? valor : porDefecto;
}

// Expresión de agrupación SQL según la frecuencia (intenta usar índices por rango).
const GROUP_SEMANAL = `DATE_SUB(v.fechaCreacion, INTERVAL WEEKDAY(v.fechaCreacion) DAY)`;

const AGRUPAR_POR_FRECUENCIA: Record<FrecuenciaReporte, { unidad: string; etiqueta: string }> = {
    diario: {
        unidad: `DATE_FORMAT(v.fechaCreacion, '%Y-%m-%d')`,
        etiqueta: `DATE_FORMAT(v.fechaCreacion, '%d/%m/%Y')`,
    },
    semanal: {
        unidad: `DATE_FORMAT(${GROUP_SEMANAL}, '%Y-%m-%d')`,
        etiqueta: `DATE_FORMAT(${GROUP_SEMANAL}, '%d/%m/%Y')`,
    },
    mensual: {
        unidad: `DATE_FORMAT(v.fechaCreacion, '%Y-%m')`,
        etiqueta: `DATE_FORMAT(v.fechaCreacion, '%m/%Y')`,
    },
};

const DataReportes = {

    // ── Datos de ventas agrupados por periodo (diario/semanal/mensual) ────────
    // periodos y totales solo consideran ventas 'completada' (ingresos reales);
    // en el detalle se listan TODAS las ventas del rango con su estado.
    async getDatos(frecuenciaValue: string, fechaInicioValue?: any, fechaFinValue?: any) {
        const frecuencia = (FRECUENCIAS as readonly string[]).includes(frecuenciaValue)
            ? (frecuenciaValue as FrecuenciaReporte)
            : 'diario';

        const porDefecto = rangoPorDefecto(frecuencia);
        let fechaInicio = parsearFecha(fechaInicioValue, porDefecto.inicio);
        let fechaFin = parsearFecha(fechaFinValue, porDefecto.fin);

        if (fechaInicio > fechaFin) {
            const aux = fechaInicio;
            fechaInicio = fechaFin;
            fechaFin = aux;
        }

        const { unidad, etiqueta } = AGRUPAR_POR_FRECUENCIA[frecuencia];

        const conection = await conectar.getConnection();

        try {
            const [rowsPeriodos, rowsVentas] = await Promise.all([
                conection.query(`
                    SELECT ${unidad} AS unidad,
                           ${etiqueta} AS etiqueta,
                           COUNT(*) AS cantidad,
                           IFNULL(SUM(v.subtotal), 0) AS subtotal,
                           IFNULL(SUM(v.descuentoTotal), 0) AS descuentoTotal,
                           IFNULL(SUM(v.impuestos), 0) AS impuestos,
                           IFNULL(SUM(v.total), 0) AS total
                    FROM venta v
                    WHERE v.estado = 'completada'
                      AND DATE(v.fechaCreacion) BETWEEN ? AND ?
                    GROUP BY unidad, etiqueta
                    ORDER BY unidad ASC
                `, [fechaInicio, fechaFin]),

                conection.query(`
                    SELECT v.idVenta, v.fechaCreacion, v.subtotal, v.descuentoTotal,
                           v.impuestos, v.total, v.estado, v.tipoPago,
                           cl.nombre AS cliente,
                           CONCAT(u.nombre, ' ', u.apellido) AS usuario,
                           s.nombre AS sucursal,
                           (SELECT f.numeroFactura FROM factura f
                            WHERE f.idVenta = v.idVenta
                            ORDER BY f.fechaEmision ASC LIMIT 1) AS numeroFactura
                    FROM venta v
                    INNER JOIN cliente  cl ON cl.idCliente = v.idCliente
                    INNER JOIN usuario  u  ON u.idUsuario  = v.idUsuario
                    INNER JOIN sucursal s  ON s.idSucursal = v.idSucursal
                    WHERE DATE(v.fechaCreacion) BETWEEN ? AND ?
                    ORDER BY v.fechaCreacion DESC
                `, [fechaInicio, fechaFin]),
            ]);

            const periodos = (rowsPeriodos as any[]).map((p: any) => ({
                unidad: p.unidad,
                etiqueta: p.etiqueta,
                cantidad: num(p.cantidad),
                subtotal: num(p.subtotal),
                descuentoTotal: num(p.descuentoTotal),
                impuestos: num(p.impuestos),
                total: num(p.total),
            }));

            const ventas = (rowsVentas as any[]).map((v: any) => ({
                idVenta: num(v.idVenta),
                numeroFactura: v.numeroFactura ?? null,
                fechaCreacion: v.fechaCreacion,
                cliente: v.cliente ?? null,
                usuario: v.usuario ?? null,
                sucursal: v.sucursal ?? null,
                tipoPago: v.tipoPago ?? null,
                estado: v.estado,
                subtotal: num(v.subtotal),
                descuentoTotal: num(v.descuentoTotal),
                impuestos: num(v.impuestos),
                total: num(v.total),
            }));

            const reducer = (acum: any, p: any) => {
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
                ventas,
                totales: periodos.reduce(reducer, {
                    cantidad: 0,
                    subtotal: 0,
                    descuentoTotal: 0,
                    impuestos: 0,
                    total: 0,
                }),
            };
        } finally {
            conection.release();
        }
    },
};

export default DataReportes;