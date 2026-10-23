import conectar from '../config/db';
import { sqlNombreGenerico, sqlConcentracion } from './ProductoDerivado';

export const MOTIVOS_DEVOLUCION_PROVEEDOR: Record<string, string> = {
    producto_danado: 'Producto dañado',
    empaque_danado: 'Empaque dañado',
    vencimiento_corto: 'Vencimiento corto',
    producto_vencido: 'Producto vencido',
    cantidad_incorrecta: 'Cantidad incorrecta',
    reclamo_clientes: 'Reclamo de clientes',
    otro: 'Otro',
};

export const ESTADOS_DEVOLUCION_PROVEEDOR: Record<string, string> = {
    solicitada: 'Solicitada',
    aceptada: 'Aceptada',
    rechazada: 'Rechazada',
    completada: 'Completada',
};

export const ESTADOS_NOTA_CREDITO: Record<string, string> = {
    pendiente: 'Pendiente',
    emitida: 'Emitida',
    aplicada: 'Aplicada',
    reembolsada: 'Reembolsada',
};

const ESTADO_NOTA_CREDITO_SQL = `
    CASE
        WHEN dp.numeroNotaCredito IS NULL OR TRIM(dp.numeroNotaCredito) = '' THEN 'pendiente'
        WHEN dp.estado = 'completada' AND dp.montoNotaCredito > 0 THEN 'reembolsada'
        WHEN dp.estado = 'completada' THEN 'aplicada'
        ELSE 'emitida'
    END
`;

export interface IFiltrosDevolucionesProveedor {
    fechaInicio?: string | null;
    fechaFin?: string | null;
    idProveedor?: number | null;
    idLaboratorio?: number | null;
    motivo?: string | null;
    estadoNotaCredito?: string | null;
    idUsuario?: number | null;
    producto?: string | null;
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

function textoValido(valor: any): string {
    return typeof valor === 'string' ? valor.trim() : '';
}

function motivoValido(valor: any): string | null {
    return typeof valor === 'string' && Object.prototype.hasOwnProperty.call(MOTIVOS_DEVOLUCION_PROVEEDOR, valor)
        ? valor
        : null;
}

function estadoNotaCreditoValido(valor: any): string | null {
    return typeof valor === 'string' && Object.prototype.hasOwnProperty.call(ESTADOS_NOTA_CREDITO, valor)
        ? valor
        : null;
}

function etiquetaMotivo(motivo: string): string {
    return MOTIVOS_DEVOLUCION_PROVEEDOR[motivo] ?? motivo ?? 'Sin motivo';
}

const SELECT_DETALLE = `
    SELECT
        dp.idDevolucionProveedor,
        DATE_FORMAT(dp.fechaCreacion, '%Y-%m-%d %H:%i') AS fechaCreacion,
        DATE_FORMAT(dp.fechaResolucion, '%Y-%m-%d %H:%i') AS fechaResolucion,
        dp.tipo,
        dp.motivo,
        dp.estado,
        dp.montoNotaCredito,
        dp.numeroNotaCredito,
        dp.observaciones,
        dp.idCompra,
        DATE_FORMAT(c.fechaCreacion, '%Y-%m-%d %H:%i') AS fechaCompra,
        DATE_FORMAT(c.fechaEntrega, '%Y-%m-%d') AS fechaEntrega,
        c.numeroFactura AS numeroFacturaCompra,
        c.total AS montoCompra,
        p.idProveedor,
        p.nombre AS proveedor,
        dp.idUsuario,
        TRIM(CONCAT(u.nombre, ' ', u.apellido)) AS usuario,
        dp.idUsuarioAutoriza,
        TRIM(CONCAT(a.nombre, ' ', a.apellido)) AS usuarioAutoriza,
        ddp.idLote,
        l.codigo AS codigoLote,
        l.numeroLote,
        DATE_FORMAT(l.fechaVencimiento, '%Y-%m-%d') AS fechaVencimiento,
        pr.idProducto AS idProducto,
        pr.codigoBarra,
        pr.nombreComercial,
        ${sqlNombreGenerico('pr')} AS nombreGenerico,
        ${sqlConcentracion('pr')} AS concentracion,
        pres.nombre AS presentacion,
        ddp.cantidad,
        ddp.precioUnitario,
        ddp.subtotal AS montoLinea,
        lab.idLaboratorio,
        lab.nombre AS laboratorio,
        ${ESTADO_NOTA_CREDITO_SQL} AS estadoNotaCredito,
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
    FROM devolucionproveedor dp
    INNER JOIN detalledevolucionproveedor ddp ON ddp.idDevolucionProveedor = dp.idDevolucionProveedor
    INNER JOIN compra c ON c.idCompra = dp.idCompra
    INNER JOIN proveedor p ON p.idProveedor = c.idProveedor
    INNER JOIN usuario u ON u.idUsuario = dp.idUsuario
    LEFT JOIN usuario a ON a.idUsuario = dp.idUsuarioAutoriza
    INNER JOIN lote l ON l.idLote = ddp.idLote
    INNER JOIN producto pr ON pr.idProducto = l.idProducto
    INNER JOIN laboratorio lab ON lab.idLaboratorio = pr.idLaboratorio
    INNER JOIN presentacion pres ON pres.idPresentacion = pr.idPresentacion
`;

const DataReporteDevolucionesProveedor = {

    async getParametros() {
        const conection = await conectar.getConnection();
        try {
            const [proveedores, laboratorios, usuarios] = await Promise.all([
                conection.query(`SELECT idProveedor, nombre FROM proveedor WHERE estado = 1 ORDER BY nombre ASC`),
                conection.query(`SELECT idLaboratorio, nombre FROM laboratorio WHERE estado = 1 ORDER BY nombre ASC`),
                conection.query(`SELECT idUsuario, TRIM(CONCAT(nombre, ' ', apellido)) AS nombre FROM usuario WHERE estado = 1 ORDER BY nombre ASC`),
            ]);

            return {
                motivos: Object.entries(MOTIVOS_DEVOLUCION_PROVEEDOR).map(([value, label]) => ({ value, label })),
                estadosNotaCredito: Object.entries(ESTADOS_NOTA_CREDITO).map(([value, label]) => ({ value, label })),
                estadosDevolucion: Object.entries(ESTADOS_DEVOLUCION_PROVEEDOR).map(([value, label]) => ({ value, label })),
                proveedores: (proveedores as any[]).map((p) => ({ idProveedor: num(p.idProveedor), nombre: p.nombre })),
                laboratorios: (laboratorios as any[]).map((l) => ({ idLaboratorio: num(l.idLaboratorio), nombre: l.nombre })),
                usuarios: (usuarios as any[]).map((u) => ({ idUsuario: num(u.idUsuario), nombre: u.nombre })),
            };
        } finally {
            conection.release();
        }
    },

    async getDatos(filtros: IFiltrosDevolucionesProveedor) {
        const conection = await conectar.getConnection();

        const params: any[] = [];
        let where = '';

        const fechaInicio = fechaValida(filtros.fechaInicio);
        if (fechaInicio) {
            where += ` AND DATE(dp.fechaCreacion) >= ?`;
            params.push(fechaInicio);
        }
        const fechaFin = fechaValida(filtros.fechaFin);
        if (fechaFin) {
            where += ` AND DATE(dp.fechaCreacion) <= ?`;
            params.push(fechaFin);
        }

        const idProveedor = idValido(filtros.idProveedor);
        if (idProveedor !== null) {
            where += ` AND c.idProveedor = ?`;
            params.push(idProveedor);
        }

        const idLaboratorio = idValido(filtros.idLaboratorio);
        if (idLaboratorio !== null) {
            where += ` AND pr.idLaboratorio = ?`;
            params.push(idLaboratorio);
        }

        const motivo = motivoValido(filtros.motivo);
        if (motivo) {
            where += ` AND dp.motivo = ?`;
            params.push(motivo);
        }

        const estadoNotaCredito = estadoNotaCreditoValido(filtros.estadoNotaCredito);
        if (estadoNotaCredito) {
            where += ` AND (${ESTADO_NOTA_CREDITO_SQL}) = ?`;
            params.push(estadoNotaCredito);
        }

        const idUsuario = idValido(filtros.idUsuario);
        if (idUsuario !== null) {
            where += ` AND dp.idUsuario = ?`;
            params.push(idUsuario);
        }

        const producto = textoValido(filtros.producto);
        if (producto !== '') {
            const like = `%${producto}%`;
            where += ` AND (pr.nombreComercial LIKE ? OR pr.codigoBarra LIKE ? OR ${sqlNombreGenerico('pr')} LIKE ? OR l.numeroLote LIKE ? OR l.codigo LIKE ?)`;
            params.push(like, like, like, like, like);
        }

        const busqueda = textoValido(filtros.busqueda);
        if (busqueda !== '') {
            const like = `%${busqueda}%`;
            where += ` AND (
                CAST(dp.idDevolucionProveedor AS CHAR) LIKE ?
                OR c.numeroFactura LIKE ?
                OR p.nombre LIKE ?
                OR pr.nombreComercial LIKE ?
                OR l.numeroLote LIKE ?
            )`;
            params.push(like, like, like, like, like);
        }

        const rows = await conection.query(
            `${SELECT_DETALLE}
             WHERE 1=1 ${where}
             ORDER BY dp.fechaCreacion DESC, dp.idDevolucionProveedor DESC, pr.nombreComercial ASC`,
            params,
        );

        conection.release();

        const detalles = (rows as any[]).map((r) => {
            const motivoFila = String(r.motivo ?? 'otro');
            const estadoNota = String(r.estadoNotaCredito ?? 'pendiente');
            const estadoDev = String(r.estado ?? 'solicitada');
            return {
                idDevolucionProveedor: num(r.idDevolucionProveedor),
                numeroDevolucion: `DEV-PROV-${String(num(r.idDevolucionProveedor)).padStart(5, '0')}`,
                fechaCreacion: r.fechaCreacion,
                fechaResolucion: r.fechaResolucion ?? null,
                tipo: r.tipo,
                motivo: motivoFila,
                motivoLabel: etiquetaMotivo(motivoFila),
                estado: estadoDev,
                estadoLabel: ESTADOS_DEVOLUCION_PROVEEDOR[estadoDev] ?? estadoDev,
                estadoNotaCredito: estadoNota,
                estadoNotaCreditoLabel: ESTADOS_NOTA_CREDITO[estadoNota] ?? estadoNota,
                numeroNotaCredito: r.numeroNotaCredito ?? null,
                montoNotaCredito: num(r.montoNotaCredito),
                observaciones: r.observaciones ?? null,
                idCompra: num(r.idCompra),
                numeroFacturaCompra: r.numeroFacturaCompra ?? null,
                fechaCompra: r.fechaCompra ?? null,
                fechaEntrega: r.fechaEntrega ?? null,
                montoCompra: num(r.montoCompra),
                idProveedor: num(r.idProveedor),
                proveedor: r.proveedor ?? 'Sin proveedor',
                idUsuario: num(r.idUsuario),
                usuario: r.usuario ?? 'Sin usuario',
                idUsuarioAutoriza: r.idUsuarioAutoriza === null ? null : num(r.idUsuarioAutoriza),
                usuarioAutoriza: r.usuarioAutoriza ?? null,
                idLote: num(r.idLote),
                codigoLote: r.codigoLote ?? '',
                numeroLote: r.numeroLote ?? '',
                fechaVencimiento: r.fechaVencimiento ?? '',
                idProducto: num(r.idProducto),
                codigoBarra: r.codigoBarra ?? '',
                nombreComercial: r.nombreComercial ?? '',
                nombreGenerico: r.nombreGenerico ?? null,
                concentracion: r.concentracion ?? null,
                presentacion: r.presentacion ?? null,
                cantidad: num(r.cantidad),
                precioUnitario: num(r.precioUnitario),
                montoLinea: num(r.montoLinea),
                idLaboratorio: num(r.idLaboratorio),
                laboratorio: r.laboratorio ?? 'Sin laboratorio',
                idTipoProducto: num(r.idTipoProducto),
                tipoProducto: r.tipoProducto ?? null,
            };
        });

        return {
            parametros: {
                fechaInicio,
                fechaFin,
                idProveedor,
                idLaboratorio,
                motivo,
                estadoNotaCredito,
                idUsuario,
                producto: producto || null,
                busqueda: busqueda || null,
            },
            detalles,
            resumen: construirResumen(detalles),
        };
    },
};

function construirResumen(detalles: any[]) {
    const unicas = new Map<number, any>();
    detalles.forEach((d) => {
        if (!unicas.has(d.idDevolucionProveedor)) unicas.set(d.idDevolucionProveedor, d);
    });

    const agrupar = (
        seleccionarClave: (d: any) => string,
        construir: (clave: string, d: any) => any,
        mapear: (item: any) => any,
    ) => {
        const mapa = new Map<string, { item: any; vistos: Set<number> }>();
        detalles.forEach((d) => {
            const clave = seleccionarClave(d);
            const actual = mapa.get(clave) ?? { item: construir(clave, d), vistos: new Set<number>() };
            actual.item.unidades += d.cantidad;
            if (!actual.vistos.has(d.idDevolucionProveedor)) {
                actual.vistos.add(d.idDevolucionProveedor);
                actual.item.devoluciones += 1;
                actual.item.montoNC += d.montoNotaCredito;
            }
            mapa.set(clave, actual);
        });
        return [...mapa.values()].map((v) => mapear(v.item)).sort((a, b) => b.montoNC - a.montoNC);
    };

    const porProveedor = agrupar(
        (d) => String(d.idProveedor),
        (_clave, d) => ({ idProveedor: d.idProveedor, proveedor: d.proveedor, devoluciones: 0, unidades: 0, montoNC: 0 }),
        (i) => i,
    );

    const porMotivo = agrupar(
        (d) => d.motivo,
        (clave, d) => ({ motivo: clave, etiqueta: d.motivoLabel, devoluciones: 0, unidades: 0, montoNC: 0 }),
        (i) => i,
    );

    const porEstadoNotaCredito = agrupar(
        (d) => d.estadoNotaCredito,
        (clave, d) => ({ estado: clave, etiqueta: d.estadoNotaCreditoLabel, devoluciones: 0, unidades: 0, montoNC: 0 }),
        (i) => i,
    );

    const porLaboratorio = agrupar(
        (d) => String(d.idLaboratorio),
        (_clave, d) => ({ idLaboratorio: d.idLaboratorio, laboratorio: d.laboratorio, devoluciones: 0, unidades: 0, montoNC: 0 }),
        (i) => i,
    ).slice(0, 10);

    const productoMap = new Map<number, { idProducto: number; producto: string; unidades: number; monto: number }>();
    detalles.forEach((d) => {
        const actual = productoMap.get(d.idProducto) ?? {
            idProducto: d.idProducto,
            producto: d.nombreComercial ?? d.nombreGenerico ?? `Producto ${d.idProducto}`,
            unidades: 0,
            monto: 0,
        };
        actual.unidades += d.cantidad;
        actual.monto += d.montoLinea;
        productoMap.set(d.idProducto, actual);
    });

    const topProductos = [...productoMap.values()]
        .sort((a, b) => b.monto - a.monto || b.unidades - a.unidades)
        .slice(0, 10);

    const totalDevoluciones = unicas.size;
    const montoTotalNC = [...unicas.values()].reduce((acc, d) => acc + d.montoNotaCredito, 0);
    const totalUnidades = detalles.reduce((acc, d) => acc + d.cantidad, 0);

    return {
        totalDevoluciones,
        totalLineas: detalles.length,
        totalUnidades,
        montoTotalNC,
        montoPromedio: totalDevoluciones > 0 ? montoTotalNC / totalDevoluciones : 0,
        porProveedor,
        porMotivo,
        porEstadoNotaCredito,
        porLaboratorio,
        topProductos,
    };
}

export default DataReporteDevolucionesProveedor;
export { idValido, num };
