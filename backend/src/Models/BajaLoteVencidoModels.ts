import conectar from '../config/db';
import { sqlNombreGenerico } from './ProductoDerivado';

// ═══════════════════════════════════════════════════════════════════════════
// REPOSITORIO (capa de consultas SQL) · mermalote
// Todas las consultas usan placeholders `?`. Ningún valor del request se
// concatena al SQL; los únicos fragmentos dinámicos son listas de `?` creadas
// a partir de arreglos validados previamente en el servicio/ruta.
// ═══════════════════════════════════════════════════════════════════════════

export type EstadoBaja = 'pendiente' | 'aprobada' | 'ejecutada' | 'anulada';
export type AccionBaja = 'cuarentena' | 'baja_merma' | 'destruccion' | 'devolucion_proveedor';

export const ESTADOS_BAJA: EstadoBaja[] = ['pendiente', 'aprobada', 'ejecutada', 'anulada'];
export const ACCIONES_BAJA: AccionBaja[] = ['cuarentena', 'baja_merma', 'destruccion', 'devolucion_proveedor'];
export const DIAS_DETECCION_PERMITIDOS = [30, 60, 90];

export interface IFiltrosDeteccion {
    dias?: number | null;            // 30 | 60 | 90 (solo para próximos a vencer)
    idProducto?: number | null;
    idProveedor?: number | null;
    idLaboratorio?: number | null;
    idSucursal?: number | null;
    busqueda?: string | null;
    limite?: number | null;
}

export interface IFiltrosBaja {
    estado?: EstadoBaja | null;
    accionTomada?: AccionBaja | null;
    idSucursal?: number | null;
    idProducto?: number | null;
    fechaDesde?: string | null;      // YYYY-MM-DD sobre fechaDeteccion
    fechaHasta?: string | null;
    pagina?: number | null;
    porPagina?: number | null;
}

export interface IFiltrosReporte {
    fechaDesde: string;              // YYYY-MM-DD sobre fechaEjecucion
    fechaHasta: string;
    idSucursal?: number | null;
    accionTomada?: AccionBaja | null;
    idProducto?: number | null;
}

export interface IRegistrarBajaInput {
    idLote: number;
    idSucursal?: number | null;
    idDevolucionProveedor?: number | null;
    cantidadAfectada: number;
    accionTomada: AccionBaja;
    fechaDeteccion?: string | null;
    motivoDetalle?: string | null;
}

export interface ILoteParaBaja {
    idLote: number;
    codigo: string;
    numeroLote: string;
    idProducto: number;
    nombreComercial: string;
    idProveedor: number;
    stock: number;
    precioCompra: number;
    estado: string;
    fechaVencimiento: string;
    diasRestantes: number;
    estaVencido: boolean;
}

export interface IDevolucionParaBaja {
    idDevolucionProveedor: number;
    estado: string;
    motivo: string;
    montoNotaCredito: number;
    numeroNotaCredito: string | null;
    subtotalLote: number;
    subtotalTotal: number;
    cantidadDevueltaLote: number;
}

export interface IBajaParaTransicion {
    idBajaVencimiento: number;
    idLote: number;
    idProducto: number;
    idUsuario: number;
    idUsuarioAutoriza: number | null;
    idDevolucionProveedor: number | null;
    cantidadAfectada: number;
    costoUnitario: number;
    accionTomada: AccionBaja;
    estado: EstadoBaja;
    stockLote: number;
    estaVencido: boolean;
}

export interface IAutorizador {
    idUsuario: number;
    nameRol: string;
    estado: number;
}

/** Ejecutor genérico: acepta el pool o una conexión dentro de una transacción. */
type Executor = any;

function num(valor: any, porDefecto = 0): number {
    const n = Number(valor);
    return Number.isFinite(n) ? n : porDefecto;
}

function idValido(valor: any): number | null {
    if (valor === undefined || valor === null || valor === '') return null;
    const n = Number(valor);
    return Number.isInteger(n) && n > 0 ? n : null;
}

// ─── SELECT reutilizable de detección (vencidos y próximos a vencer) ───────
// Incluye JOIN a producto, laboratorio, presentación y proveedor, y expone
// `estadoGestion` para que el front sepa si ya existe una baja activa.
const SELECT_DETECCION = `
    SELECT
        l.idLote,
        l.codigo,
        l.numeroLote,
        l.stock,
        DATE_FORMAT(l.fechaVencimiento, '%Y-%m-%d') AS fechaVencimiento,
        l.precioCompra,
        l.estado AS estadoLote,
        l.idProducto,
        l.idProveedor,
        DATEDIFF(l.fechaVencimiento, CURDATE()) AS diasRestantes,
        pr.codigoBarra,
        pr.nombreComercial,
        pr.stockTotal,
        ${sqlNombreGenerico('pr')} AS nombreGenerico,
        lab.idLaboratorio,
        lab.nombre AS laboratorio,
        pres.nombre AS presentacion,
        pv.nombre AS proveedor,
        (SELECT b.estado
           FROM mermalote b
          WHERE b.idLote = l.idLote
            AND b.estado <> 'anulada'
          ORDER BY b.idBajaVencimiento DESC
          LIMIT 1) AS estadoGestion,
        (SELECT b.idBajaVencimiento
           FROM mermalote b
          WHERE b.idLote = l.idLote
            AND b.estado <> 'anulada'
          ORDER BY b.idBajaVencimiento DESC
          LIMIT 1) AS idBajaVencimiento
    FROM lote l
    INNER JOIN producto     pr   ON pr.idProducto     = l.idProducto
    INNER JOIN laboratorio  lab  ON lab.idLaboratorio = pr.idLaboratorio
    INNER JOIN presentacion pres ON pres.idPresentacion = pr.idPresentacion
    INNER JOIN proveedor    pv   ON pv.idProveedor    = l.idProveedor
`;

const SELECT_BAJA = `
    SELECT
        b.idBajaVencimiento, b.idLote, b.idSucursal, b.idUsuario,
        b.idUsuarioAutoriza, b.idDevolucionProveedor,
        b.cantidadAfectada, b.costoUnitario, b.montoPerdida,
        b.accionTomada, b.estado,
        DATE_FORMAT(b.fechaDeteccion, '%Y-%m-%d %H:%i:%s') AS fechaDeteccion,
        DATE_FORMAT(b.fechaEjecucion, '%Y-%m-%d %H:%i:%s') AS fechaEjecucion,
        b.motivoDetalle,
        DATE_FORMAT(b.fechaCreacion, '%Y-%m-%d %H:%i:%s') AS fechaCreacion,
        DATE_FORMAT(b.fechaModificacion, '%Y-%m-%d %H:%i:%s') AS fechaModificacion,
        l.codigo AS codigoLote, l.numeroLote, l.stock AS stockActual,
        DATE_FORMAT(l.fechaVencimiento, '%Y-%m-%d') AS fechaVencimiento,
        l.precioCompra AS precioCompraActual, l.estado AS estadoLote,
        l.idProducto, pr.codigoBarra, pr.nombreComercial,
        ${sqlNombreGenerico('pr')} AS nombreGenerico,
        lab.nombre AS laboratorio,
        pres.nombre AS presentacion,
        pv.nombre AS proveedor,
        s.nombre AS sucursal,
        CONCAT_WS(' ', u.nombre, u.apellido) AS usuario,
        CONCAT_WS(' ', au.nombre, au.apellido) AS usuarioAutoriza,
        dp.estado AS estadoDevolucion,
        dp.motivo AS motivoDevolucion,
        dp.montoNotaCredito,
        dp.numeroNotaCredito,
        DATEDIFF(l.fechaVencimiento, CURDATE()) AS diasRestantes
    FROM mermalote b
    INNER JOIN lote       l    ON l.idLote       = b.idLote
    INNER JOIN producto   pr   ON pr.idProducto  = l.idProducto
    INNER JOIN laboratorio lab ON lab.idLaboratorio = pr.idLaboratorio
    INNER JOIN presentacion pres ON pres.idPresentacion = pr.idPresentacion
    INNER JOIN proveedor  pv   ON pv.idProveedor = l.idProveedor
    LEFT  JOIN sucursal   s    ON s.idSucursal   = b.idSucursal
    LEFT  JOIN usuario    u    ON u.idUsuario    = b.idUsuario
    LEFT  JOIN usuario    au   ON au.idUsuario   = b.idUsuarioAutoriza
    LEFT  JOIN devolucionproveedor dp ON dp.idDevolucionProveedor = b.idDevolucionProveedor
`;

function normalizarDeteccion(row: any) {
    return {
        ...row,
        stock: num(row.stock),
        precioCompra: num(row.precioCompra),
        stockTotal: num(row.stockTotal),
        diasRestantes: num(row.diasRestantes),
        idBajaVencimiento: idValido(row.idBajaVencimiento),
    };
}

function normalizarBaja(row: any) {
    return {
        ...row,
        cantidadAfectada: num(row.cantidadAfectada),
        costoUnitario: num(row.costoUnitario),
        montoPerdida: num(row.montoPerdida),
        stockActual: num(row.stockActual),
        montoNotaCredito: num(row.montoNotaCredito),
        diasRestantes: num(row.diasRestantes),
    };
}

const DataBajaLoteVencido = {

    // ── Detección: lotes VENCIDOS con stock pendiente de gestionar ───────────
    async listarLotesVencidos(filtros: IFiltrosDeteccion = {}) {
        const connection = await conectar.getConnection();
        try {
            const params: any[] = [];
            const where: string[] = [
                `l.fechaVencimiento <= CURDATE()`,
                `l.stock > 0`,
                `l.estado IN ('pendiente','activo','cuarentena')`,
                `NOT EXISTS (
                    SELECT 1 FROM mermalote b
                     WHERE b.idLote = l.idLote
                       AND b.estado IN ('pendiente','aprobada')
                 )`,
            ];

            const idProducto = idValido(filtros.idProducto);
            if (idProducto !== null) { where.push(`l.idProducto = ?`); params.push(idProducto); }
            const idProveedor = idValido(filtros.idProveedor);
            if (idProveedor !== null) { where.push(`l.idProveedor = ?`); params.push(idProveedor); }
            const idLaboratorio = idValido(filtros.idLaboratorio);
            if (idLaboratorio !== null) { where.push(`pr.idLaboratorio = ?`); params.push(idLaboratorio); }
            const idSucursal = idValido(filtros.idSucursal);
            if (idSucursal !== null) {
                // La sucursal no vive en lote; se restringe por ventas previas
                // imputadas al producto en esa sede.
                where.push(`EXISTS (
                    SELECT 1 FROM venta v
                     INNER JOIN detalleventa dv ON dv.idVenta = v.idVenta
                     INNER JOIN lote lv ON lv.idLote = dv.idLote
                     WHERE lv.idProducto = l.idProducto AND v.idSucursal = ?
                )`);
                params.push(idSucursal);
            }
            const busqueda = typeof filtros.busqueda === 'string' ? filtros.busqueda.trim() : '';
            if (busqueda !== '') {
                const like = `%${busqueda}%`;
                where.push(`(l.codigo LIKE ? OR l.numeroLote LIKE ? OR pr.nombreComercial LIKE ? OR ${sqlNombreGenerico('pr')} LIKE ?)`);
                params.push(like, like, like, like);
            }

            const limite = filtros.limite && filtros.limite > 0 ? filtros.limite : 200;
            params.push(limite);

            const rows = await connection.query(
                `${SELECT_DETECCION}
                 WHERE ${where.join(' AND ')}
                 ORDER BY l.fechaVencimiento ASC, l.idLote ASC
                 LIMIT ?`,
                params,
            );
            return (rows as any[]).map(normalizarDeteccion);
        } finally {
            connection.release();
        }
    },

    // ── Detección: lotes PRÓXIMOS A VENCER (30/60/90 días) ──────────────────
    async listarProximosAVencer(filtros: IFiltrosDeteccion = {}) {
        const connection = await conectar.getConnection();
        try {
            const params: any[] = [];
            const dias = DIAS_DETECCION_PERMITIDOS.includes(Number(filtros.dias)) ? Number(filtros.dias) : 30;
            const where: string[] = [
                `l.estado = 'activo'`,
                `l.stock > 0`,
                `DATEDIFF(l.fechaVencimiento, CURDATE()) BETWEEN 0 AND ?`,
                `NOT EXISTS (
                    SELECT 1 FROM mermalote b
                     WHERE b.idLote = l.idLote
                       AND b.estado IN ('pendiente','aprobada')
                 )`,
            ];
            params.push(dias);

            const idProducto = idValido(filtros.idProducto);
            if (idProducto !== null) { where.push(`l.idProducto = ?`); params.push(idProducto); }
            const idProveedor = idValido(filtros.idProveedor);
            if (idProveedor !== null) { where.push(`l.idProveedor = ?`); params.push(idProveedor); }
            const idLaboratorio = idValido(filtros.idLaboratorio);
            if (idLaboratorio !== null) { where.push(`pr.idLaboratorio = ?`); params.push(idLaboratorio); }
            const busqueda = typeof filtros.busqueda === 'string' ? filtros.busqueda.trim() : '';
            if (busqueda !== '') {
                const like = `%${busqueda}%`;
                where.push(`(l.codigo LIKE ? OR l.numeroLote LIKE ? OR pr.nombreComercial LIKE ? OR ${sqlNombreGenerico('pr')} LIKE ?)`);
                params.push(like, like, like, like);
            }

            const limite = filtros.limite && filtros.limite > 0 ? filtros.limite : 200;
            params.push(limite);

            const rows = await connection.query(
                `${SELECT_DETECCION}
                 WHERE ${where.join(' AND ')}
                 ORDER BY l.fechaVencimiento ASC, l.idLote ASC
                 LIMIT ?`,
                params,
            );
            return (rows as any[]).map(normalizarDeteccion);
        } finally {
            connection.release();
        }
    },

    // ── Lote a gestionar (para validaciones del registro) ───────────────────
    async obtenerLoteParaBaja(idLote: number): Promise<ILoteParaBaja | null> {
        const connection = await conectar.getConnection();
        try {
            const rows = await connection.query(`
                SELECT
                    l.idLote, l.codigo, l.numeroLote, l.stock,
                    l.precioCompra, l.estado, l.idProducto, l.idProveedor,
                    DATE_FORMAT(l.fechaVencimiento, '%Y-%m-%d') AS fechaVencimiento,
                    DATEDIFF(l.fechaVencimiento, CURDATE()) AS diasRestantes,
                    IF(l.fechaVencimiento <= CURDATE(), 1, 0) AS estaVencido,
                    pr.nombreComercial
                FROM lote l
                INNER JOIN producto pr ON pr.idProducto = l.idProducto
                WHERE l.idLote = ?
            `, [idLote]);
            if ((rows as any[]).length === 0) return null;
            const r = (rows as any[])[0];
            return {
                ...r,
                stock: num(r.stock),
                precioCompra: num(r.precioCompra),
                diasRestantes: num(r.diasRestantes),
                estaVencido: num(r.estaVencido) === 1,
            };
        } finally {
            connection.release();
        }
    },

    // ── Devolución a proveedor vinculada (validación + prorrateo de NC) ─────
    async obtenerDevolucionParaBaja(
        idDevolucionProveedor: number,
        idLote: number,
        executor: Executor = conectar,
    ): Promise<IDevolucionParaBaja | null> {
        const rows = await executor.query(`
            SELECT
                dp.idDevolucionProveedor, dp.estado, dp.motivo,
                dp.montoNotaCredito, dp.numeroNotaCredito,
                COALESCE(SUM(ddp.cantidad), 0) AS cantidadDevueltaLote,
                COALESCE(SUM(ddp.subtotal), 0) AS subtotalLote,
                COALESCE((SELECT SUM(x.subtotal)
                            FROM detalledevolucionproveedor x
                           WHERE x.idDevolucionProveedor = dp.idDevolucionProveedor), 0) AS subtotalTotal
            FROM devolucionproveedor dp
            LEFT JOIN detalledevolucionproveedor ddp
                   ON ddp.idDevolucionProveedor = dp.idDevolucionProveedor
                  AND ddp.idLote = ?
            WHERE dp.idDevolucionProveedor = ?
            GROUP BY dp.idDevolucionProveedor
        `, [idLote, idDevolucionProveedor]);
        if ((rows as any[]).length === 0) return null;
        const r = (rows as any[])[0];
        return {
            ...r,
            montoNotaCredito: num(r.montoNotaCredito),
            cantidadDevueltaLote: num(r.cantidadDevueltaLote),
            subtotalLote: num(r.subtotalLote),
            subtotalTotal: num(r.subtotalTotal),
        };
    },

    /** Evita abrir dos gestiones simultáneas sobre el mismo lote. */
    async obtenerBajaActivaPorLote(idLote: number) {
        const rows = await conectar.query(`
            SELECT idBajaVencimiento, estado
            FROM mermalote
            WHERE idLote = ? AND estado IN ('pendiente','aprobada')
            ORDER BY idBajaVencimiento DESC
            LIMIT 1
        `, [idLote]);
        return (rows as any[])[0] ?? null;
    },

    async obtenerSucursal(idSucursal: number) {
        const rows = await conectar.query(
            `SELECT idSucursal, nombre, estado FROM sucursal WHERE idSucursal = ?`,
            [idSucursal],
        );
        return (rows as any[])[0] ?? null;
    },

    async obtenerAutorizador(idUsuario: number): Promise<IAutorizador | null> {
        const rows = await conectar.query(`
            SELECT u.idUsuario, u.estado, t.nameRol
            FROM usuario u
            INNER JOIN tipous t ON t.idTipoUs = u.idTipoUs
            WHERE u.idUsuario = ?
        `, [idUsuario]);
        return (rows as any[])[0] ?? null;
    },

    // ── INSERT: registrar una baja en estado 'pendiente' ────────────────────
    async insertar(
        datos: IRegistrarBajaInput,
        idUsuario: number,
        costoUnitario: number,
        montoPerdidaEstimado: number,
        fechaDeteccion: string,
    ): Promise<number> {
        const result = await conectar.query(`
            INSERT INTO mermalote
                (idLote, idSucursal, idUsuario, idDevolucionProveedor,
                 cantidadAfectada, costoUnitario, montoPerdida,
                 accionTomada, estado, fechaDeteccion, motivoDetalle)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', ?, ?)
        `, [
            datos.idLote,
            datos.idSucursal ?? null,
            idUsuario,
            datos.idDevolucionProveedor ?? null,
            datos.cantidadAfectada,
            costoUnitario,
            montoPerdidaEstimado,
            datos.accionTomada,
            fechaDeteccion,
            datos.motivoDetalle ?? null,
        ]);
        return Number((result as any).insertId);
    },

    // ── GET: detalle de una baja ─────────────────────────────────────────────
    async obtenerPorId(idBajaVencimiento: number) {
        const rows = await conectar.query(
            `${SELECT_BAJA} WHERE b.idBajaVencimiento = ?`,
            [idBajaVencimiento],
        );
        if ((rows as any[]).length === 0) return null;
        return normalizarBaja((rows as any[])[0]);
    },

    // ── GET: listado de bajas con filtros y paginación ───────────────────────
    async listar(filtros: IFiltrosBaja = {}) {
        const connection = await conectar.getConnection();
        try {
            const params: any[] = [];
            const where: string[] = ['1=1'];

            if (filtros.estado && ESTADOS_BAJA.includes(filtros.estado)) {
                where.push(`b.estado = ?`); params.push(filtros.estado);
            }
            if (filtros.accionTomada && ACCIONES_BAJA.includes(filtros.accionTomada)) {
                where.push(`b.accionTomada = ?`); params.push(filtros.accionTomada);
            }
            const idSucursal = idValido(filtros.idSucursal);
            if (idSucursal !== null) { where.push(`b.idSucursal = ?`); params.push(idSucursal); }
            const idProducto = idValido(filtros.idProducto);
            if (idProducto !== null) { where.push(`l.idProducto = ?`); params.push(idProducto); }
            if (filtros.fechaDesde) { where.push(`DATE(b.fechaDeteccion) >= ?`); params.push(filtros.fechaDesde); }
            if (filtros.fechaHasta) { where.push(`DATE(b.fechaDeteccion) <= ?`); params.push(filtros.fechaHasta); }

            const countRows = await connection.query(
                `SELECT COUNT(*) AS total FROM mermalote b
                 INNER JOIN lote l ON l.idLote = b.idLote
                 WHERE ${where.join(' AND ')}`,
                params,
            );
            const total = num((countRows as any[])[0]?.total);

            const pagina = filtros.pagina && filtros.pagina > 0 ? filtros.pagina : 1;
            const porPagina = filtros.porPagina && filtros.porPagina > 0 ? Math.min(filtros.porPagina, 100) : 10;
            const offset = (pagina - 1) * porPagina;
            params.push(porPagina, offset);

            const rows = await connection.query(
                `${SELECT_BAJA}
                 WHERE ${where.join(' AND ')}
                 ORDER BY b.fechaDeteccion DESC, b.idBajaVencimiento DESC
                 LIMIT ? OFFSET ?`,
                params,
            );
            return { data: (rows as any[]).map(normalizarBaja), total, pagina, porPagina };
        } finally {
            connection.release();
        }
    },

    // ── SELECT ... FOR UPDATE dentro de una transición ──────────────────────
    // Bloquea en el mismo orden (baja → lote) en todos los flujos para evitar
    // deadlocks entre aprobación, ejecución y anulación concurrentes.
    async obtenerParaTransicion(conn: Executor, idBajaVencimiento: number): Promise<IBajaParaTransicion | null> {
        const rows = await conn.query(`
            SELECT
                b.idBajaVencimiento, b.idLote, b.idUsuario, b.idUsuarioAutoriza,
                b.idDevolucionProveedor,
                b.cantidadAfectada, b.costoUnitario, b.accionTomada, b.estado,
                l.idProducto,
                l.stock AS stockLote,
                IF(l.fechaVencimiento <= CURDATE(), 1, 0) AS estaVencido
            FROM mermalote b
            INNER JOIN lote l ON l.idLote = b.idLote
            WHERE b.idBajaVencimiento = ?
            FOR UPDATE
        `, [idBajaVencimiento]);
        if ((rows as any[]).length === 0) return null;
        const r = (rows as any[])[0];
        return {
            ...r,
            cantidadAfectada: num(r.cantidadAfectada),
            costoUnitario: num(r.costoUnitario),
            stockLote: num(r.stockLote),
            estaVencido: num(r.estaVencido) === 1,
        };
    },

    // ── UPDATE de transiciones de estado ────────────────────────────────────
    async aprobar(conn: Executor, idBajaVencimiento: number, idUsuarioAutoriza: number): Promise<boolean> {
        const result = await conn.query(`
            UPDATE mermalote
            SET estado = 'aprobada',
                idUsuarioAutoriza = ?,
                fechaModificacion = NOW()
            WHERE idBajaVencimiento = ? AND estado = 'pendiente'
        `, [idUsuarioAutoriza, idBajaVencimiento]);
        return Number((result as any).affectedRows) > 0;
    },

    async ejecutar(conn: Executor, idBajaVencimiento: number, montoPerdida: number): Promise<boolean> {
        const result = await conn.query(`
            UPDATE mermalote
            SET estado = 'ejecutada',
                montoPerdida = ?,
                fechaEjecucion = NOW(),
                fechaModificacion = NOW()
            WHERE idBajaVencimiento = ? AND estado = 'aprobada'
        `, [montoPerdida, idBajaVencimiento]);
        return Number((result as any).affectedRows) > 0;
    },

    async anular(conn: Executor, idBajaVencimiento: number, idUsuario: number, motivo: string): Promise<boolean> {
        const result = await conn.query(`
            UPDATE mermalote
            SET estado = 'anulada',
                idUsuarioAutoriza = COALESCE(idUsuarioAutoriza, ?),
                motivoDetalle = CONCAT(COALESCE(motivoDetalle, ''), '\\n[ANULACIÓN] ', ?),
                fechaModificacion = NOW()
            WHERE idBajaVencimiento = ? AND estado IN ('pendiente','aprobada')
        `, [idUsuario, motivo, idBajaVencimiento]);
        return Number((result as any).affectedRows) > 0;
    },

    async actualizarMontoPerdida(conn: Executor, idBajaVencimiento: number, montoPerdida: number): Promise<boolean> {
        const result = await conn.query(`
            UPDATE mermalote
            SET montoPerdida = ?, fechaModificacion = NOW()
            WHERE idBajaVencimiento = ? AND estado = 'ejecutada'
        `, [montoPerdida, idBajaVencimiento]);
        return Number((result as any).affectedRows) > 0;
    },

    // ── Movimientos de stock / estado del lote ──────────────────────────────
    /** Descuento seguro: falla si otro proceso consumió el stock concurrentemente. */
    async descontarStock(conn: Executor, idLote: number, cantidad: number): Promise<boolean> {
        const result = await conn.query(`
            UPDATE lote
            SET stock = stock - ?, fechaModificacion = NOW()
            WHERE idLote = ? AND stock >= ?
        `, [cantidad, idLote, cantidad]);
        return Number((result as any).affectedRows) > 0;
    },

    async cambiarEstadoLote(conn: Executor, idLote: number, estado: string): Promise<boolean> {
        const result = await conn.query(
            `UPDATE lote SET estado = ?, fechaModificacion = NOW() WHERE idLote = ?`,
            [estado, idLote],
        );
        return Number((result as any).affectedRows) > 0;
    },

    // ── Reporte de mermas/pérdidas por rango de fechas y sucursal ────────────
    async reportePerdidas(filtros: IFiltrosReporte) {
        const connection = await conectar.getConnection();
        try {
            const params: any[] = [filtros.fechaDesde, filtros.fechaHasta];
            const where: string[] = [
                `b.estado = 'ejecutada'`,
                `b.fechaEjecucion IS NOT NULL`,
                `DATE(b.fechaEjecucion) BETWEEN ? AND ?`,
            ];
            const idSucursal = idValido(filtros.idSucursal);
            if (idSucursal !== null) { where.push(`b.idSucursal = ?`); params.push(idSucursal); }
            if (filtros.accionTomada && ACCIONES_BAJA.includes(filtros.accionTomada)) {
                where.push(`b.accionTomada = ?`); params.push(filtros.accionTomada);
            }
            const idProducto = idValido(filtros.idProducto);
            if (idProducto !== null) { where.push(`l.idProducto = ?`); params.push(idProducto); }

            const rows = await connection.query(`
                SELECT
                    b.idBajaVencimiento,
                    DATE_FORMAT(b.fechaEjecucion, '%Y-%m-%d %H:%i:%s') AS fechaEjecucion,
                    b.accionTomada, b.estado,
                    b.cantidadAfectada, b.costoUnitario, b.montoPerdida,
                    l.codigo AS codigoLote, l.numeroLote,
                    pr.idProducto, pr.nombreComercial,
                    lab.nombre AS laboratorio,
                    s.idSucursal, s.nombre AS sucursal,
                    dp.numeroNotaCredito, dp.montoNotaCredito
                FROM mermalote b
                INNER JOIN lote         l   ON l.idLote       = b.idLote
                INNER JOIN producto     pr  ON pr.idProducto  = l.idProducto
                INNER JOIN laboratorio  lab ON lab.idLaboratorio = pr.idLaboratorio
                LEFT  JOIN sucursal     s   ON s.idSucursal   = b.idSucursal
                LEFT  JOIN devolucionproveedor dp ON dp.idDevolucionProveedor = b.idDevolucionProveedor
                WHERE ${where.join(' AND ')}
                ORDER BY b.fechaEjecucion DESC, b.idBajaVencimiento DESC
            `, params);

            const filas = (rows as any[]).map((r) => ({
                ...r,
                cantidadAfectada: num(r.cantidadAfectada),
                costoUnitario: num(r.costoUnitario),
                montoPerdida: num(r.montoPerdida),
                montoNotaCredito: num(r.montoNotaCredito),
            }));

            const resumen = {
                totalBajas: filas.length,
                totalUnidades: filas.reduce((acc, f) => acc + f.cantidadAfectada, 0),
                montoPerdidaTotal: Math.round(filas.reduce((acc, f) => acc + f.montoPerdida, 0) * 100) / 100,
                porAccion: ACCIONES_BAJA.map((accion) => {
                    const items = filas.filter((f) => f.accionTomada === accion);
                    return {
                        accion,
                        bajas: items.length,
                        unidades: items.reduce((a, f) => a + f.cantidadAfectada, 0),
                        perdida: Math.round(items.reduce((a, f) => a + f.montoPerdida, 0) * 100) / 100,
                    };
                }),
                porSucursal: Object.values(
                    filas.reduce<Record<string, { sucursal: string; bajas: number; unidades: number; perdida: number }>>((acc, f) => {
                        const clave = f.sucursal ?? 'Sin sucursal imputada';
                        const item = acc[clave] ?? { sucursal: clave, bajas: 0, unidades: 0, perdida: 0 };
                        item.bajas += 1;
                        item.unidades += f.cantidadAfectada;
                        item.perdida += f.montoPerdida;
                        acc[clave] = item;
                        return acc;
                    }, {}),
                ).map((s) => ({ ...s, perdida: Math.round(s.perdida * 100) / 100 })),
            };

            return { parametros: filtros, filas, resumen };
        } finally {
            connection.release();
        }
    },
};

export default DataBajaLoteVencido;
