"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const ProductoDerivado_1 = require("./ProductoDerivado");
const DataVenta = {
    // ── GET: Listar ventas con filtros dinámicos y paginación ─────────────────
    async listar(filtros) {
        const conection = await db_1.default.getConnection();
        let queryBase = `
            FROM venta v
            INNER JOIN cliente  cl ON cl.idCliente  = v.idCliente
            INNER JOIN usuario  u  ON u.idUsuario   = v.idUsuario
            INNER JOIN sucursal s  ON s.idSucursal  = v.idSucursal
            WHERE 1=1
        `;
        const queryParams = [];
        // Filtros dinámicos
        if (filtros.estado) {
            queryBase += ` AND v.estado = ?`;
            queryParams.push(filtros.estado);
        }
        if (filtros.idCliente) {
            queryBase += ` AND v.idCliente = ?`;
            queryParams.push(filtros.idCliente);
        }
        if (filtros.idUsuario) {
            queryBase += ` AND v.idUsuario = ?`;
            queryParams.push(filtros.idUsuario);
        }
        if (filtros.idSucursal) {
            queryBase += ` AND v.idSucursal = ?`;
            queryParams.push(filtros.idSucursal);
        }
        if (filtros.fechaDesde) {
            queryBase += ` AND DATE(v.fechaCreacion) >= ?`;
            queryParams.push(filtros.fechaDesde);
        }
        if (filtros.fechaHasta) {
            queryBase += ` AND DATE(v.fechaCreacion) <= ?`;
            queryParams.push(filtros.fechaHasta);
        }
        // 1. Obtener el total de registros (para la paginación)
        const countResult = await conection.query(`SELECT COUNT(*) as total ${queryBase}`, queryParams);
        const total = Number(countResult[0].total);
        // 2. Aplicar Paginación
        const pagina = filtros.pagina || 1;
        const porPagina = filtros.porPagina || 10;
        const offset = (pagina - 1) * porPagina;
        // 3. Consulta principal de datos
        const queryFinal = `
            SELECT 
                v.idVenta, v.fechaCreacion, v.subtotal, v.descuentoTotal,
                v.total, v.estado, v.tipoPago,
                cl.nombre AS cliente, cl.ci AS clienteNit,
                u.nombre  AS usuario,
                s.nombre  AS sucursal,
                (SELECT r.idRecibo FROM recibo r WHERE r.idVenta = v.idVenta LIMIT 1) AS idRecibo,
                (SELECT COUNT(*) FROM detalleventa dv WHERE dv.idVenta = v.idVenta) AS totalItems
            ${queryBase}
            ORDER BY v.fechaCreacion DESC
            LIMIT ? OFFSET ?
        `;
        queryParams.push(porPagina, offset);
        const data = await conection.query(queryFinal, queryParams);
        conection.release();
        // MySQL2 devuelve COUNT(*) como BigInt → lo normalizamos a Number
        const dataNormalizada = data.map((row) => ({
            ...row,
            totalItems: Number(row.totalItems ?? 0),
        }));
        return { data: dataNormalizada, total };
    },
    // ── GET: Obtener el detalle de una venta específica con sus productos ─────
    async obtenerPorId(idVenta) {
        const conection = await db_1.default.getConnection();
        // 1. Cabecera de la venta
        const ventas = await conection.query(`
            SELECT 
                v.idVenta, v.fechaCreacion, v.fechaModificacion, v.subtotal, v.descuentoTotal,
                v.total, v.estado, v.tipoPago, v.observaciones,
                v.idCliente, v.idUsuario, v.idSucursal,
                cl.nombre AS cliente, cl.ci AS clienteNit, cl.telefono AS clienteTelefono,
                CONCAT(u.nombre, ' ', u.apellido) AS usuario, t.nameRol AS usuarioRol,
                s.nombre AS sucursal, s.direccion AS sucursalDireccion
            FROM venta v
            INNER JOIN cliente  cl ON cl.idCliente  = v.idCliente
            INNER JOIN usuario  u  ON u.idUsuario   = v.idUsuario
            INNER JOIN tipous   t  ON t.idTipoUs    = u.idTipoUs
            INNER JOIN sucursal s  ON s.idSucursal  = v.idSucursal
            WHERE v.idVenta = ?
        `, [idVenta]);
        if (ventas.length === 0) {
            conection.release();
            return null;
        }
        const venta = ventas[0];
        // 2. Detalles (productos y lotes vendidos)
        const detalles = await conection.query(`
            SELECT 
                dv.cantidad, dv.precioUnitario, dv.descuento, dv.subtotal,
                l.idLote, l.numeroLote, l.codigo, l.fechaVencimiento,
                DATEDIFF(l.fechaVencimiento, CURDATE()) AS diasParaVencer,
                pr.idProducto, pr.codigoBarra, ${(0, ProductoDerivado_1.sqlNombreGenerico)('pr')} AS nombreGenerico, pr.nombreComercial,
                ${(0, ProductoDerivado_1.sqlConcentracion)('pr')} AS concentracion, pr.requiereReceta,
                lab.nombre AS nombreLaboratorio
            FROM detalleventa dv
            INNER JOIN lote        l   ON l.idLote        = dv.idLote
            INNER JOIN producto    pr  ON pr.idProducto   = l.idProducto
            INNER JOIN laboratorio lab ON lab.idLaboratorio = pr.idLaboratorio
            WHERE dv.idVenta = ?
            ORDER BY l.idProducto ASC;
        `, [idVenta]);
        // 3. Recibo asociado (si ya fue emitido)
        const recibos = await conection.query(`
            SELECT idRecibo, numeroRecibo, fechaEmision, estado
            FROM recibo WHERE idVenta = ?
        `, [idVenta]);
        conection.release();
        // diasParaVencer llega como BigInt en algunos drivers de MySQL2 al usar
        // DATEDIFF; lo normalizamos a Number igual que en el módulo de compras.
        const detallesNormalizados = detalles.map((d) => ({
            ...d,
            diasParaVencer: Number(d.diasParaVencer ?? 0),
        }));
        return {
            ...venta,
            detalles: detallesNormalizados,
            recibo: recibos[0] || null,
        };
    },
    // ── ADD: Crear una nueva venta (Transacción Completa) ─────────────────────
    async crear(datos, idUsuario) {
        const conection = await db_1.default.getConnection();
        // Iniciamos la transacción para proteger los datos
        await conection.beginTransaction();
        try {
            // 1. Insertar Cabecera (Venta)
            const insertVenta = await conection.query(`
                INSERT INTO venta (
                    subtotal, descuentoTotal, total, estado,
                    tipoPago, observaciones, idCliente, idUsuario, idSucursal
                ) VALUES (?, ?, ?, 'pendiente', ?, ?, ?, ?, ?)
            `, [
                datos.subtotal,
                datos.descuentoTotal,
                datos.total,
                datos.tipoPago || null,
                datos.observaciones || null,
                datos.idCliente,
                idUsuario,
                datos.idSucursal
            ]);
            const idVenta = Number(insertVenta.insertId);
            // 2. Insertar Detalles y descontar stock de cada lote
            for (const detalle of datos.detalles) {
                // a) Bloqueamos la fila del lote y verificamos stock suficiente
                //    (FOR UPDATE evita condiciones de carrera con ventas simultáneas)
                const lotes = await conection.query(`
                    SELECT stock, estado FROM lote WHERE idLote = ? FOR UPDATE
                `, [detalle.idLote]);
                if (lotes.length === 0) {
                    throw new Error(`El lote #${detalle.idLote} no existe.`);
                }
                if (lotes[0].estado !== 'activo') {
                    throw new Error(`El lote #${detalle.idLote} no está activo para la venta.`);
                }
                if (Number(lotes[0].stock) < detalle.cantidad) {
                    throw new Error(`Stock insuficiente en el lote #${detalle.idLote}. Disponible: ${lotes[0].stock}, solicitado: ${detalle.cantidad}.`);
                }
                // b) Descontar el stock del lote
                await conection.query(`
                    UPDATE lote SET stock = stock - ? WHERE idLote = ?
                `, [detalle.cantidad, detalle.idLote]);
                // c) Insertar DetalleVenta
                const subtotalDetalle = (detalle.cantidad * detalle.precioUnitario) - detalle.descuento;
                await conection.query(`
                    INSERT INTO detalleventa (
                        cantidad, precioUnitario, descuento, subtotal, idLote, idVenta, idProducto
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    detalle.cantidad,
                    detalle.precioUnitario,
                    detalle.descuento,
                    subtotalDetalle,
                    detalle.idLote,
                    idVenta,
                    detalle.idProducto
                ]);
            }
            // Confirmamos toda la transacción
            await conection.commit();
            return idVenta;
        }
        catch (error) {
            await conection.rollback();
            throw error;
        }
        finally {
            conection.release();
        }
    },
    // ── UPDATE: Confirmar/completar una venta pendiente ───────────────────────
    async completar(idVenta) {
        const conection = await db_1.default.getConnection();
        try {
            const result = await conection.query(`
                UPDATE venta SET estado = 'completado' WHERE idVenta = ? AND estado = 'pendiente'
            `, [idVenta]);
            return result.affectedRows > 0;
        }
        finally {
            conection.release();
        }
    },
    // ── UPDATE: Regresar una venta a pendiente ────────────────────────────────
    async cambiarAPendiente(idVenta) {
        const conection = await db_1.default.getConnection();
        try {
            const result = await conection.query(`
                UPDATE venta SET estado = 'pendiente' WHERE idVenta = ? AND estado = 'completado'
            `, [idVenta]);
            return result.affectedRows > 0;
        }
        finally {
            conection.release();
        }
    },
    // ── CANCEL: Anular una venta y devolver el stock a los lotes ──────────────
    async anular(idVenta, motivo, idUsuario) {
        const conection = await db_1.default.getConnection();
        await conection.beginTransaction();
        try {
            // 1. Verificar que la venta exista y no esté ya anulada
            const check = await conection.query(`
                SELECT estado FROM venta WHERE idVenta = ?
            `, [idVenta]);
            if (check.length === 0) {
                throw new Error('La venta no existe.');
            }
            if (check[0].estado === 'cancelado') {
                throw new Error('La venta ya se encuentra cancelada.');
            }
            // 2. Regresar el stock vendido a cada lote
            const detalles = await conection.query(`
                SELECT idLote, cantidad FROM detalleventa WHERE idVenta = ?
            `, [idVenta]);
            for (const d of detalles) {
                await conection.query(`
                    UPDATE lote SET stock = stock + ? WHERE idLote = ?
                `, [d.cantidad, d.idLote]);
            }
            // 3. Marcar la venta como anulada (registrando auditoría de la anulación)
            await conection.query(`
                UPDATE venta SET 
                    estado = 'cancelado',
                    motivoCancelacion = ?,
                    fechaCancelacion = NOW(),
                    idUsuarioCancelacion = ?
                WHERE idVenta = ?
            `, [motivo || 'Venta anulada', idUsuario ?? null, idVenta]);
            // 4. Si tiene recibo emitido, anularlo también
            await conection.query(`
                UPDATE recibo SET estado = 'anulado' WHERE idVenta = ?
            `, [idVenta]);
            await conection.commit();
            return true;
        }
        catch (error) {
            await conection.rollback();
            throw error;
        }
        finally {
            conection.release();
        }
    },
    // ── UPDATE: Actualizar una venta pendiente (Cabecera y Detalles) ──────────
    async actualizar(idVenta, datos) {
        const conection = await db_1.default.getConnection();
        await conection.beginTransaction();
        try {
            // 1. Verificar que la venta exista y esté ESTRICTAMENTE en estado 'pendiente'
            const check = await conection.query(`
                SELECT estado FROM venta WHERE idVenta = ?
            `, [idVenta]);
            if (check.length === 0) {
                throw new Error('La venta no existe.');
            }
            if (check[0].estado !== 'pendiente') {
                throw new Error('Solo se pueden editar ventas en estado pendiente. Si ya está completada, debes anularla.');
            }
            // 2. Actualizar la cabecera de la venta
            await conection.query(`
                UPDATE venta SET
                    subtotal = ?,
                    descuentoTotal = ?,
                    total = ?,
                    tipoPago = ?,
                    observaciones = ?,
                    idCliente = ?,
                    idSucursal = ?
                WHERE idVenta = ?
            `, [
                datos.subtotal,
                datos.descuentoTotal,
                datos.total,
                datos.tipoPago || null,
                datos.observaciones || null,
                datos.idCliente,
                datos.idSucursal,
                idVenta
            ]);
            // 3. Devolver el stock de los detalles anteriores antes de reemplazarlos
            const detallesActuales = await conection.query(`
                SELECT idLote, cantidad FROM detalleventa WHERE idVenta = ?
            `, [idVenta]);
            for (const d of detallesActuales) {
                await conection.query(`
                    UPDATE lote SET stock = stock + ? WHERE idLote = ?
                `, [d.cantidad, d.idLote]);
            }
            // 4. Eliminar los detalles anteriores
            await conection.query(`DELETE FROM detalleventa WHERE idVenta = ?`, [idVenta]);
            // 5. Insertar los nuevos detalles, verificando y descontando stock otra vez
            for (const detalle of datos.detalles) {
                const lotes = await conection.query(`
                    SELECT stock, estado FROM lote WHERE idLote = ? FOR UPDATE
                `, [detalle.idLote]);
                if (lotes.length === 0) {
                    throw new Error(`El lote #${detalle.idLote} no existe.`);
                }
                if (Number(lotes[0].stock) < detalle.cantidad) {
                    throw new Error(`Stock insuficiente en el lote #${detalle.idLote}. Disponible: ${lotes[0].stock}, solicitado: ${detalle.cantidad}.`);
                }
                await conection.query(`
                    UPDATE lote SET stock = stock - ? WHERE idLote = ?
                `, [detalle.cantidad, detalle.idLote]);
                const subtotalDetalle = (detalle.cantidad * detalle.precioUnitario) - detalle.descuento;
                await conection.query(`
                    INSERT INTO detalleventa (
                        cantidad, precioUnitario, descuento, subtotal, idLote, idVenta, idProducto
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    detalle.cantidad,
                    detalle.precioUnitario,
                    detalle.descuento,
                    subtotalDetalle,
                    detalle.idLote,
                    idVenta,
                    detalle.idProducto
                ]);
            }
            await conection.commit();
            return true;
        }
        catch (error) {
            await conection.rollback();
            throw error;
        }
        finally {
            conection.release();
        }
    },
    // ── ADD: Emitir recibo para una venta ya completada ───────────────────────
    async emitirRecibo(idVenta) {
        const conection = await db_1.default.getConnection();
        await conection.beginTransaction();
        try {
            const check = await conection.query(`
                SELECT estado FROM venta WHERE idVenta = ?
            `, [idVenta]);
            if (check.length === 0) {
                throw new Error('La venta no existe.');
            }
            if (check[0].estado !== 'completado') {
                throw new Error('Solo se puede emitir un recibo de una venta completada.');
            }
            const reciboExistente = await conection.query(`
                SELECT idRecibo FROM recibo WHERE idVenta = ?
            `, [idVenta]);
            if (reciboExistente.length > 0) {
                throw new Error('Esta venta ya tiene un recibo emitido.');
            }
            const consecutivoFilas = await conection.query(`
                SELECT MAX(CAST(SUBSTRING(numeroRecibo, 3) AS UNSIGNED)) AS maxNumero
                FROM recibo
                WHERE numeroRecibo REGEXP '^R-[0-9]+$'
            `);
            const siguienteNumero = Number(consecutivoFilas[0]?.maxNumero ?? 0) + 1;
            const numeroRecibo = `R-${String(siguienteNumero).padStart(6, '0')}`;
            const insertRecibo = await conection.query(`
                INSERT INTO recibo (numeroRecibo, idVenta) VALUES (?, ?)
            `, [numeroRecibo, idVenta]);
            await conection.commit();
            return {
                idRecibo: Number(insertRecibo.insertId),
                numeroRecibo,
            };
        }
        catch (error) {
            await conection.rollback();
            throw error;
        }
        finally {
            conection.release();
        }
    },
    // ── DASHBOARD: Estadísticas Generales ─────────────────────────────────────
    async estadisticas() {
        const conection = await db_1.default.getConnection();
        try {
            const [porEstado, totalMes, totalMesAnterior, porSucursal, masVendidos] = await Promise.all([
                conection.query(`SELECT estado, COUNT(*) AS cantidad, SUM(total) AS monto FROM venta GROUP BY estado`),
                conection.query(`
                    SELECT IFNULL(SUM(total), 0) AS totalMes FROM venta 
                    WHERE MONTH(fechaCreacion) = MONTH(NOW()) 
                    AND YEAR(fechaCreacion) = YEAR(NOW()) 
                    AND estado = 'completado'
                `),
                conection.query(`
                    SELECT IFNULL(SUM(total), 0) AS totalMesAnterior FROM venta 
                    WHERE MONTH(fechaCreacion) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH)) 
                    AND YEAR(fechaCreacion) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH)) 
                    AND estado = 'completado'
                `),
                conection.query(`
                    SELECT s.nombre, COUNT(v.idVenta) AS cantidad, SUM(v.total) AS monto 
                    FROM venta v
                    INNER JOIN sucursal s ON s.idSucursal = v.idSucursal
                    WHERE v.estado = 'completado'
                    GROUP BY v.idSucursal
                    ORDER BY monto DESC LIMIT 5
                `),
                conection.query(`
                    SELECT ${(0, ProductoDerivado_1.sqlNombreGenerico)('pr')} AS nombreGenerico, SUM(dv.cantidad) AS unidadesVendidas, SUM(dv.subtotal) AS monto
                    FROM detalleventa dv
                    INNER JOIN venta v ON v.idVenta = dv.idVenta
                    INNER JOIN lote l ON l.idLote = dv.idLote
                    INNER JOIN producto pr ON pr.idProducto = l.idProducto
                    WHERE v.estado = 'completado'
                    GROUP BY l.idProducto
                    ORDER BY unidadesVendidas DESC LIMIT 5
                `)
            ]);
            return {
                porEstado: porEstado.map((s) => ({
                    estado: s.estado,
                    cantidad: Number(s.cantidad ?? 0),
                    monto: Number(s.monto ?? 0),
                })),
                totalMes: Number(totalMes[0].totalMes),
                totalMesAnterior: Number(totalMesAnterior[0].totalMesAnterior),
                porSucursal: porSucursal.map((s) => ({
                    nombre: s.nombre,
                    cantidad: Number(s.cantidad ?? 0),
                    monto: Number(s.monto ?? 0),
                })),
                masVendidos: masVendidos.map((p) => ({
                    nombreGenerico: p.nombreGenerico,
                    unidadesVendidas: Number(p.unidadesVendidas ?? 0),
                    monto: Number(p.monto ?? 0),
                })),
            };
        }
        finally {
            conection.release();
        }
    },
    // ── UTILIDAD: Verificar stock disponible en un lote ───────────────────────
    async VerificarStockLote(idLote, cantidad) {
        const conection = await db_1.default.getConnection();
        const results = await conection.query(`
            SELECT stock FROM lote WHERE idLote = ? AND estado = 'activo';
        `, [idLote]);
        conection.release();
        if (results.length === 0)
            return false;
        return Number(results[0].stock) >= cantidad;
    },
    // ── UTILIDAD: Buscar lotes activos disponibles de un producto (FEFO) ──────
    // Ordenados por fecha de vencimiento ascendente: primero en expirar, primero en salir.
    async LotesDisponiblesPorProducto(idProducto) {
        const conection = await db_1.default.getConnection();
        const results = await conection.query(`
            SELECT idLote, numeroLote, codigo, stock, fechaVencimiento, precioCompra
            FROM lote 
            WHERE idProducto = ? AND estado = 'activo' AND stock > 0
            ORDER BY fechaVencimiento ASC
        `, [idProducto]);
        conection.release();
        return results;
    },
    // ── FEFO: Lote que debe salir primero (el de vencimiento más próximo) ─────
    async loteFEFODeProducto(idProducto) {
        const conection = await db_1.default.getConnection();
        try {
            const rows = await conection.query(`
                SELECT idLote, codigo, numeroLote, stock, fechaVencimiento,
                       DATEDIFF(fechaVencimiento, CURDATE()) AS diasRestantes
                FROM lote
                WHERE idProducto = ? AND estado = 'activo' AND stock > 0
                ORDER BY fechaVencimiento ASC, idLote ASC
                LIMIT 1
            `, [idProducto]);
            return rows[0] ?? null;
        }
        finally {
            conection.release();
        }
    },
    // ── FEFO: Alerta visual del POS para un lote seleccionado ─────────────────
    // Compara el lote elegido con el lote FEFO del mismo producto e informa
    // cuántos días de vencimiento se están dejando en el almacén.
    async AlertaFEFO(idProducto, idLote) {
        const conection = await db_1.default.getConnection();
        try {
            const [lotes] = await conection.query(`
                SELECT idLote, codigo, numeroLote, stock, fechaVencimiento, estado,
                       DATEDIFF(fechaVencimiento, CURDATE()) AS diasRestantes
                FROM lote
                WHERE idLote = ?
            `, [idLote]);
            const seleccionado = lotes[0];
            if (!seleccionado) {
                return { existe: false, cumpleFEFO: true, mensaje: '' };
            }
            const [fefo] = await conection.query(`
                SELECT idLote, codigo, numeroLote, stock, fechaVencimiento,
                       DATEDIFF(fechaVencimiento, CURDATE()) AS diasRestantes
                FROM lote
                WHERE idProducto = ? AND estado = 'activo' AND stock > 0
                ORDER BY fechaVencimiento ASC, idLote ASC
                LIMIT 1
            `, [idProducto]);
            const loteFEFO = fefo[0] ?? null;
            const diasSeleccionado = Number(seleccionado.diasRestantes ?? 0);
            const diasFEFO = loteFEFO ? Number(loteFEFO.diasRestantes ?? 0) : diasSeleccionado;
            const cumpleFEFO = !loteFEFO || Number(loteFEFO.idLote) === Number(seleccionado.idLote);
            const diasDiferencia = diasSeleccionado - diasFEFO;
            const mensaje = cumpleFEFO
                ? `El lote ${seleccionado.numeroLote} cumple la regla FEFO: es el de vencimiento más próximo (${diasSeleccionado} días).`
                : `ALERTA FEFO: el lote ${seleccionado.numeroLote} vence en ${diasSeleccionado} días, pero existe el lote ${loteFEFO.numeroLote} que vence en ${diasFEFO} días (${diasDiferencia} días antes) y debe despacharse primero.`;
            return {
                existe: true,
                cumpleFEFO,
                idLote: Number(seleccionado.idLote),
                codigo: seleccionado.codigo,
                numeroLote: seleccionado.numeroLote,
                stock: Number(seleccionado.stock ?? 0),
                fechaVencimiento: seleccionado.fechaVencimiento,
                diasRestantes: diasSeleccionado,
                idLoteFEFO: loteFEFO ? Number(loteFEFO.idLote) : null,
                numeroLoteFEFO: loteFEFO ? loteFEFO.numeroLote : null,
                fechaVencimientoFEFO: loteFEFO ? loteFEFO.fechaVencimiento : null,
                diasRestantesFEFO: diasFEFO,
                stockLoteFEFO: loteFEFO ? Number(loteFEFO.stock ?? 0) : 0,
                diasDiferencia,
                mensaje,
            };
        }
        finally {
            conection.release();
        }
    },
    // ── FEFO: Validar una venta completa contra la regla First-Expired ────────
    // Devuelve null si todo cumple FEFO; en caso contrario devuelve el primer
    // incumplimiento detectado (para bloquear la venta o exigir justificación).
    async ValidarFEFODetalles(detalles) {
        if (!detalles || detalles.length === 0)
            return null;
        const idsLote = detalles.map((d) => Number(d.idLote)).filter((id) => id > 0);
        if (idsLote.length === 0)
            return null;
        const conection = await db_1.default.getConnection();
        try {
            const filas = await conection.query(`
                SELECT l.idLote, l.idProducto, l.codigo, l.numeroLote, l.stock, l.fechaVencimiento,
                       DATEDIFF(l.fechaVencimiento, CURDATE()) AS diasRestantes,
                       (SELECT l2.idLote
                          FROM lote l2
                         WHERE l2.idProducto = l.idProducto
                           AND l2.estado = 'activo'
                           AND l2.stock > 0
                         ORDER BY l2.fechaVencimiento ASC, l2.idLote ASC LIMIT 1) AS idLoteFEFO
                FROM lote l
                WHERE l.idLote IN (${idsLote.map(() => '?').join(', ')})
            `, idsLote);
            const lotes = filas;
            if (lotes.length === 0)
                return null;
            // Stock del lote FEFO de cada producto considerado en la venta.
            const idsProducto = [...new Set(lotes.map((l) => Number(l.idProducto)))];
            const fEFOPorProducto = new Map();
            for (const idProducto of idsProducto) {
                const [res] = await conection.query(`
                    SELECT idLote, codigo, numeroLote, stock, fechaVencimiento,
                           DATEDIFF(fechaVencimiento, CURDATE()) AS diasRestantes
                    FROM lote
                    WHERE idProducto = ? AND estado = 'activo' AND stock > 0
                    ORDER BY fechaVencimiento ASC, idLote ASC
                    LIMIT 1
                `, [idProducto]);
                const loteFEFO = res[0];
                if (loteFEFO)
                    fEFOPorProducto.set(idProducto, loteFEFO);
            }
            // Unidades de la propia venta ya asignadas a cada lote.
            const asignadoPorLote = new Map();
            detalles.forEach((d) => {
                const id = Number(d.idLote);
                asignadoPorLote.set(id, (asignadoPorLote.get(id) ?? 0) + Number(d.cantidad ?? 0));
            });
            for (const lote of lotes) {
                const loteFEFO = fEFOPorProducto.get(Number(lote.idProducto));
                if (!loteFEFO)
                    continue; // el producto no tiene lotes FEFO disponibles
                if (Number(loteFEFO.idLote) === Number(lote.idLote))
                    continue; // ya es el FEFO
                // Si el lote FEFO queda sin existencias con esta misma venta,
                // no hay desvío real (se está agotando en la misma operación).
                const asignadoAlFEFO = asignadoPorLote.get(Number(loteFEFO.idLote)) ?? 0;
                const restanteFEFO = Number(loteFEFO.stock ?? 0) - asignadoAlFEFO;
                if (restanteFEFO <= 0)
                    continue;
                const diasSeleccionado = Number(lote.diasRestantes ?? 0);
                const diasFEFO = Number(loteFEFO.diasRestantes ?? 0);
                return {
                    idLote: Number(lote.idLote),
                    numeroLote: lote.numeroLote,
                    codigo: lote.codigo,
                    diasRestantes: diasSeleccionado,
                    idLoteFEFO: Number(loteFEFO.idLote),
                    numeroLoteFEFO: loteFEFO.numeroLote,
                    diasRestantesFEFO: diasFEFO,
                    stockRestanteFEFO: restanteFEFO,
                    diasDiferencia: diasSeleccionado - diasFEFO,
                    mensaje: `El lote ${lote.numeroLote} (vence en ${diasSeleccionado} días) no cumple la regla FEFO: ` +
                        `el lote ${loteFEFO.numeroLote} (vence en ${diasFEFO} días) debe despacharse primero ` +
                        `y aún tiene ${restanteFEFO} unidades disponibles.`,
                };
            }
            return null;
        }
        finally {
            conection.release();
        }
    },
};
exports.default = DataVenta;
//# sourceMappingURL=VentaModels.js.map