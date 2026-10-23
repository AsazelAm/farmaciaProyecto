import conectar from '../config/db';
import { sqlNombreGenerico, sqlConcentracion } from './ProductoDerivado';

// ═══════════════════════════════════════════════════════════════════════════
// REPORTE DE DEVOLUCIONES DE CLIENTES Y ANÁLISIS DE CAUSAS
// ---------------------------------------------------------------------------
// Fuente de datos:
//   · devolucionventa           → cabecera (motivo, estado, monto, venta, usuario)
//   · detalledevolucionventa    → líneas (producto, lote, cantidad, destino, subtotal)
//   · venta / factura / cliente → referencia comercial (venta, factura, cliente)
//   · lote / producto / laboratorio / tipoproducto → datos del artículo devuelto
//
// Reglas de análisis:
//   · El monto devuelto se toma del subtotal de cada línea devuelta.
//   · Los indicadores por motivo / destino / producto / usuario se agrupan
//     sobre las líneas filtradas y se ordenan por monto descendente.
//   · Se distingue el usuario que REGISTRA la devolución (dv.idUsuario) del
//     cajero/vendedor que realizó la VENTA (venta.idUsuario).
// ═══════════════════════════════════════════════════════════════════════════

export type MotivoDevVenta =
    | 'error_dispensacion' | 'reaccion_adversa' | 'producto_danado'
    | 'producto_vencido' | 'receta_invalida' | 'arrepentimiento' | 'otro';

export type DestinoDevVenta = 'reingreso_stock' | 'merma' | 'cuarentena';

export const MOTIVOS_DEVOLUCION: Record<MotivoDevVenta, string> = {
    error_dispensacion: 'Error de dispensación',
    reaccion_adversa: 'Reacción adversa',
    producto_danado: 'Producto dañado',
    producto_vencido: 'Producto vencido',
    receta_invalida: 'Receta inválida',
    arrepentimiento: 'Arrepentimiento',
    otro: 'Otro',
};

export const DESTINOS_DEVOLUCION: Record<string, string> = {
    reingreso_stock: 'Reingreso a stock',
    cuarentena: 'Cuarentena',
    merma: 'Merma',
    sin_definir: 'Sin definir',
};

export const ESTADOS_DEVOLUCION: Record<string, string> = {
    solicitada: 'Solicitada',
    aprobada: 'Aprobada',
    rechazada: 'Rechazada',
    completada: 'Completada',
};

export interface IFiltrosDevoluciones {
    fechaInicio?: string | null;
    fechaFin?: string | null;
    motivo?: string | null;
    estado?: string | null;
    idUsuario?: number | null;
    idCliente?: number | null;
    idLaboratorio?: number | null;
    idTipoProducto?: number | null;
    producto?: string | null;
    cliente?: string | null;
    busqueda?: string | null;
}

function num(valor: any, porDefecto = 0): number {
    const n = Number(valor);
    return Number.isFinite(n) ? n : porDefecto;
}

function idValido(valor: any): number | null {
    if (valor === undefined || valor === null || valor === '') return null;
    const n = Number(valor);
    return Number.isInteger(n) && n > 0 ? n : null;
}

function fechaValida(valor: any): string | null {
    if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor.trim())) return null;
    return valor.trim();
}

function motivoValido(valor: any): string | null {
    return typeof valor === 'string' && Object.prototype.hasOwnProperty.call(MOTIVOS_DEVOLUCION, valor)
        ? valor
        : null;
}

function estadoValido(valor: any): string | null {
    return typeof valor === 'string' && Object.prototype.hasOwnProperty.call(ESTADOS_DEVOLUCION, valor)
        ? valor
        : null;
}

function textoValido(valor: any): string {
    return typeof valor === 'string' ? valor.trim() : '';
}

function etiquetaMotivo(motivo: string): string {
    return MOTIVOS_DEVOLUCION[motivo as MotivoDevVenta] ?? motivo ?? 'Sin motivo';
}

function etiquetaDestino(destino: string | null): string {
    const clave = destino || 'sin_definir';
    return DESTINOS_DEVOLUCION[clave] ?? clave;
}

const SELECT_DETALLE = `
    SELECT
        dv.idDevolucionVenta,
        DATE_FORMAT(dv.fechaCreacion, '%Y-%m-%d %H:%i') AS fechaCreacion,
        DATE_FORMAT(dv.fechaResolucion, '%Y-%m-%d %H:%i') AS fechaResolucion,
        dv.tipo,
        dv.motivo,
        dv.estado,
        dv.montoReembolso,
        dv.metodoReembolso,
        dv.numeroNotaCredito,
        dv.observaciones,
        dv.idVenta,
        DATE_FORMAT(v.fechaCreacion, '%Y-%m-%d %H:%i') AS fechaVenta,
        v.estado AS estadoVenta,
        (SELECT f.numeroFactura
           FROM factura f
          WHERE f.idVenta = dv.idVenta
          ORDER BY f.idFactura DESC LIMIT 1) AS numeroFactura,
        cl.idCliente,
        cl.ci AS clienteCi,
        TRIM(CONCAT(cl.nombre, ' ', COALESCE(cl.apellido, ''))) AS cliente,
        dv.idUsuario,
        TRIM(CONCAT(u.nombre, ' ', u.apellido)) AS usuario,
        v.idUsuario AS idCajero,
        TRIM(CONCAT(caj.nombre, ' ', caj.apellido)) AS cajero,
        ddv.idLote,
        l.codigo AS codigoLote,
        l.numeroLote,
        DATE_FORMAT(l.fechaVencimiento, '%Y-%m-%d') AS fechaVencimiento,
        ddv.idProducto,
        pr.codigoBarra,
        pr.nombreComercial,
        ${sqlNombreGenerico('pr')} AS nombreGenerico,
        ${sqlConcentracion('pr')} AS concentracion,
        pres.nombre AS presentacion,
        ddv.cantidad,
        ddv.precioUnitario,
        ddv.subtotal AS montoDevuelto,
        ddv.destino,
        lab.idLaboratorio,
        lab.nombre AS laboratorio,
        (SELECT tp.idTipoProd
           FROM productotipoproducto ptp
           INNER JOIN tipoproducto tp ON tp.idTipoProd = ptp.idTipoProd
          WHERE ptp.idProducto = pr.idProducto
          ORDER BY tp.idTipoProd ASC LIMIT 1) AS idTipoProducto,
        (SELECT tp.nombre
           FROM productotipoproducto ptp
           INNER JOIN tipoproducto tp ON tp.idTipoProd = ptp.idTipoProd
          WHERE ptp.idProducto = pr.idProducto
          ORDER BY tp.idTipoProd ASC LIMIT 1) AS tipoProducto
    FROM devolucionventa dv
    INNER JOIN detalledevolucionventa ddv ON ddv.idDevolucionVenta = dv.idDevolucionVenta
    INNER JOIN venta    v   ON v.idVenta   = dv.idVenta
    INNER JOIN cliente  cl  ON cl.idCliente = v.idCliente
    INNER JOIN usuario  u   ON u.idUsuario  = dv.idUsuario
    LEFT  JOIN usuario  caj ON caj.idUsuario = v.idUsuario
    INNER JOIN lote     l   ON l.idLote    = ddv.idLote
    INNER JOIN producto pr  ON pr.idProducto = ddv.idProducto
    INNER JOIN laboratorio lab ON lab.idLaboratorio = pr.idLaboratorio
    INNER JOIN presentacion pres ON pres.idPresentacion = pr.idPresentacion
`;

const DataReporteDevoluciones = {

    // ── GET: catálogos y valores válidos para los filtros ────────────────────
    async getParametros() {
        const conection = await conectar.getConnection();
        try {
            const [usuarios, clientes, laboratorios, tiposProducto] = await Promise.all([
                conection.query(`SELECT idUsuario, TRIM(CONCAT(nombre, ' ', apellido)) AS nombre FROM usuario WHERE estado = 1 ORDER BY nombre ASC`),
                conection.query(`SELECT idCliente, TRIM(CONCAT(nombre, ' ', COALESCE(apellido, ''))) AS nombre FROM cliente WHERE estado = 1 ORDER BY nombre ASC`),
                conection.query(`SELECT idLaboratorio, nombre FROM laboratorio WHERE estado = 1 ORDER BY nombre ASC`),
                conection.query(`SELECT idTipoProd, nombre FROM tipoproducto WHERE estado = 1 ORDER BY nombre ASC`),
            ]);

            return {
                motivos: Object.entries(MOTIVOS_DEVOLUCION).map(([value, label]) => ({ value, label })),
                destinos: Object.entries(DESTINOS_DEVOLUCION).map(([value, label]) => ({ value, label })),
                estados: Object.entries(ESTADOS_DEVOLUCION).map(([value, label]) => ({ value, label })),
                usuarios: (usuarios as any[]).map((u) => ({ idUsuario: num(u.idUsuario), nombre: u.nombre })),
                clientes: (clientes as any[]).map((c) => ({ idCliente: num(c.idCliente), nombre: c.nombre })),
                laboratorios: (laboratorios as any[]).map((l) => ({ idLaboratorio: num(l.idLaboratorio), nombre: l.nombre })),
                tiposProducto: (tiposProducto as any[]).map((t) => ({ idTipoProd: num(t.idTipoProd), nombre: t.nombre })),
            };
        } finally {
            conection.release();
        }
    },

    // ── GET: detalle de devoluciones y resumen analítico ─────────────────────
    async getDatos(filtros: IFiltrosDevoluciones) {
        const conection = await conectar.getConnection();

        const params: any[] = [];
        let where = '';

        const fechaInicio = fechaValida(filtros.fechaInicio);
        if (fechaInicio) {
            where += ` AND DATE(dv.fechaCreacion) >= ?`;
            params.push(fechaInicio);
        }
        const fechaFin = fechaValida(filtros.fechaFin);
        if (fechaFin) {
            where += ` AND DATE(dv.fechaCreacion) <= ?`;
            params.push(fechaFin);
        }

        const motivo = motivoValido(filtros.motivo);
        if (motivo) {
            where += ` AND dv.motivo = ?`;
            params.push(motivo);
        }
        const estado = estadoValido(filtros.estado);
        if (estado) {
            where += ` AND dv.estado = ?`;
            params.push(estado);
        }

        const idUsuario = idValido(filtros.idUsuario);
        if (idUsuario !== null) {
            where += ` AND dv.idUsuario = ?`;
            params.push(idUsuario);
        }
        const idCliente = idValido(filtros.idCliente);
        if (idCliente !== null) {
            where += ` AND cl.idCliente = ?`;
            params.push(idCliente);
        }
        const idLaboratorio = idValido(filtros.idLaboratorio);
        if (idLaboratorio !== null) {
            where += ` AND pr.idLaboratorio = ?`;
            params.push(idLaboratorio);
        }
        const idTipoProducto = idValido(filtros.idTipoProducto);
        if (idTipoProducto !== null) {
            where += ` AND EXISTS (
                SELECT 1 FROM productotipoproducto ptp
                 WHERE ptp.idProducto = pr.idProducto AND ptp.idTipoProd = ?
            )`;
            params.push(idTipoProducto);
        }

        const producto = textoValido(filtros.producto);
        if (producto !== '') {
            const like = `%${producto}%`;
            where += ` AND (pr.nombreComercial LIKE ? OR pr.codigoBarra LIKE ? OR ${sqlNombreGenerico('pr')} LIKE ? OR l.numeroLote LIKE ?)`;
            params.push(like, like, like, like);
        }

        const cliente = textoValido(filtros.cliente);
        if (cliente !== '') {
            const like = `%${cliente}%`;
            where += ` AND (cl.nombre LIKE ? OR cl.apellido LIKE ? OR cl.ci LIKE ?)`;
            params.push(like, like, like);
        }

        const busqueda = textoValido(filtros.busqueda);
        if (busqueda !== '') {
            const like = `%${busqueda}%`;
            where += ` AND (
                CAST(dv.idDevolucionVenta AS CHAR) LIKE ?
                OR CAST(dv.idVenta AS CHAR) LIKE ?
                OR (SELECT f2.numeroFactura FROM factura f2 WHERE f2.idVenta = dv.idVenta ORDER BY f2.idFactura DESC LIMIT 1) LIKE ?
                OR cl.nombre LIKE ?
                OR pr.nombreComercial LIKE ?
            )`;
            params.push(like, like, like, like, like);
        }

        const rows = await conection.query(
            `${SELECT_DETALLE}
             WHERE 1=1 ${where}
             ORDER BY dv.fechaCreacion DESC, dv.idDevolucionVenta DESC, pr.nombreComercial ASC`,
            params,
        );

        conection.release();

        const detalles = (rows as any[]).map((r) => {
            const montoDevuelto = num(r.montoDevuelto);
            return {
                idDevolucionVenta: num(r.idDevolucionVenta),
                numeroDevolucion: `DEV-${String(num(r.idDevolucionVenta)).padStart(5, '0')}`,
                fechaCreacion: r.fechaCreacion,
                fechaResolucion: r.fechaResolucion ?? null,
                tipo: r.tipo,
                motivo: r.motivo,
                motivoLabel: etiquetaMotivo(r.motivo),
                estado: r.estado,
                estadoLabel: ESTADOS_DEVOLUCION[r.estado] ?? r.estado,
                montoReembolso: num(r.montoReembolso),
                metodoReembolso: r.metodoReembolso ?? null,
                numeroNotaCredito: r.numeroNotaCredito ?? null,
                observaciones: r.observaciones ?? null,
                idVenta: num(r.idVenta),
                numeroFactura: r.numeroFactura ?? null,
                fechaVenta: r.fechaVenta ?? null,
                estadoVenta: r.estadoVenta ?? null,
                idCliente: num(r.idCliente),
                cliente: r.cliente || 'Consumidor Final',
                clienteCi: r.clienteCi ?? null,
                idUsuario: num(r.idUsuario),
                usuario: r.usuario ?? 'Sin usuario',
                idCajero: num(r.idCajero),
                cajero: r.cajero ?? null,
                idLote: num(r.idLote),
                codigoLote: r.codigoLote,
                numeroLote: r.numeroLote,
                fechaVencimiento: r.fechaVencimiento,
                idProducto: num(r.idProducto),
                codigoBarra: r.codigoBarra,
                nombreComercial: r.nombreComercial,
                nombreGenerico: r.nombreGenerico ?? null,
                concentracion: r.concentracion ?? null,
                presentacion: r.presentacion ?? null,
                cantidad: num(r.cantidad),
                precioUnitario: num(r.precioUnitario),
                montoDevuelto,
                destino: r.destino ?? 'sin_definir',
                destinoLabel: etiquetaDestino(r.destino),
                idLaboratorio: num(r.idLaboratorio),
                laboratorio: r.laboratorio,
                idTipoProducto: num(r.idTipoProducto),
                tipoProducto: r.tipoProducto ?? null,
            };
        });

        return {
            parametros: {
                fechaInicio,
                fechaFin,
                motivo,
                estado,
                idUsuario,
                idCliente,
                idLaboratorio,
                idTipoProducto,
                producto: producto || null,
                cliente: cliente || null,
                busqueda: busqueda || null,
            },
            detalles,
            resumen: construirResumen(detalles),
        };
    },
};

// ─── Resumen / indicadores del reporte ─────────────────────────────────────
function construirResumen(detalles: any[]) {
    const devolucionesIds = new Set<number>();

    const motivoMap = new Map<string, { motivo: string; etiqueta: string; devoluciones: Set<number>; lineas: number; unidades: number; monto: number }>();
    const destinoMap = new Map<string, { destino: string; etiqueta: string; devoluciones: Set<number>; lineas: number; unidades: number; monto: number }>();
    const productoMap = new Map<number, { idProducto: number; producto: string; unidades: number; monto: number }>();
    const usuarioMap = new Map<number, { idUsuario: number; usuario: string; devoluciones: Set<number>; unidades: number; monto: number }>();
    const laboratorioMap = new Map<number, { idLaboratorio: number; laboratorio: string; unidades: number; monto: number }>();

    detalles.forEach((d) => {
        devolucionesIds.add(d.idDevolucionVenta);

        const m = motivoMap.get(d.motivo) ?? {
            motivo: d.motivo,
            etiqueta: d.motivoLabel,
            devoluciones: new Set<number>(),
            lineas: 0,
            unidades: 0,
            monto: 0,
        };
        m.devoluciones.add(d.idDevolucionVenta);
        m.lineas += 1;
        m.unidades += d.cantidad;
        m.monto += d.montoDevuelto;
        motivoMap.set(d.motivo, m);

        const de = destinoMap.get(d.destino) ?? {
            destino: d.destino,
            etiqueta: d.destinoLabel,
            devoluciones: new Set<number>(),
            lineas: 0,
            unidades: 0,
            monto: 0,
        };
        de.devoluciones.add(d.idDevolucionVenta);
        de.lineas += 1;
        de.unidades += d.cantidad;
        de.monto += d.montoDevuelto;
        destinoMap.set(d.destino, de);

        const p = productoMap.get(d.idProducto) ?? {
            idProducto: d.idProducto,
            producto: d.nombreComercial ?? d.nombreGenerico ?? `Producto ${d.idProducto}`,
            unidades: 0,
            monto: 0,
        };
        p.unidades += d.cantidad;
        p.monto += d.montoDevuelto;
        productoMap.set(d.idProducto, p);

        const u = usuarioMap.get(d.idUsuario) ?? {
            idUsuario: d.idUsuario,
            usuario: d.usuario,
            devoluciones: new Set<number>(),
            unidades: 0,
            monto: 0,
        };
        u.devoluciones.add(d.idDevolucionVenta);
        u.unidades += d.cantidad;
        u.monto += d.montoDevuelto;
        usuarioMap.set(d.idUsuario, u);

        const lb = laboratorioMap.get(d.idLaboratorio) ?? {
            idLaboratorio: d.idLaboratorio,
            laboratorio: d.laboratorio ?? 'Sin laboratorio',
            unidades: 0,
            monto: 0,
        };
        lb.unidades += d.cantidad;
        lb.monto += d.montoDevuelto;
        laboratorioMap.set(d.idLaboratorio, lb);
    });

    const porMotivo = [...motivoMap.values()]
        .map((m) => ({
            motivo: m.motivo,
            etiqueta: m.etiqueta,
            devoluciones: m.devoluciones.size,
            lineas: m.lineas,
            unidades: m.unidades,
            monto: m.monto,
        }))
        .sort((a, b) => b.monto - a.monto);

    const porDestino = [...destinoMap.values()]
        .map((d) => ({
            destino: d.destino,
            etiqueta: d.etiqueta,
            devoluciones: d.devoluciones.size,
            lineas: d.lineas,
            unidades: d.unidades,
            monto: d.monto,
        }))
        .sort((a, b) => b.monto - a.monto);

    const topProductos = [...productoMap.values()]
        .sort((a, b) => b.monto - a.monto || b.unidades - a.unidades)
        .slice(0, 10);

    const topUsuarios = [...usuarioMap.values()]
        .map((u) => ({
            idUsuario: u.idUsuario,
            usuario: u.usuario,
            devoluciones: u.devoluciones.size,
            unidades: u.unidades,
            monto: u.monto,
        }))
        .sort((a, b) => b.monto - a.monto || b.devoluciones - a.devoluciones)
        .slice(0, 10);

    const porLaboratorio = [...laboratorioMap.values()]
        .sort((a, b) => b.monto - a.monto)
        .slice(0, 10);

    const totalUnidades = detalles.reduce((acc, d) => acc + d.cantidad, 0);
    const montoTotalDevuelto = detalles.reduce((acc, d) => acc + d.montoDevuelto, 0);
    const totalDevoluciones = devolucionesIds.size;

    return {
        totalDevoluciones,
        totalLineas: detalles.length,
        totalUnidades,
        montoTotalDevuelto,
        montoPromedio: totalDevoluciones > 0 ? montoTotalDevuelto / totalDevoluciones : 0,
        porMotivo,
        porDestino,
        porLaboratorio,
        topProductos,
        topUsuarios,
    };
}

export default DataReporteDevoluciones;
export { idValido, num };
