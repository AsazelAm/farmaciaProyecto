"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const ProductoDerivado_1 = require("./ProductoDerivado");
const DataDevolucion = {
    // ═══════════════ DEVOLUCIONES DE VENTA (cliente → farmacia) ═══════════════
    // ── GET: Listar devoluciones de venta ─────────────────────────────────────
    async listarVentas(filtros) {
        const conection = await db_1.default.getConnection();
        let queryBase = `
            FROM devolucionventa dv
            INNER JOIN venta   v  ON v.idVenta  = dv.idVenta
            INNER JOIN cliente cl ON cl.idCliente = v.idCliente
            INNER JOIN usuario u  ON u.idUsuario  = dv.idUsuario
            WHERE 1=1
        `;
        const queryParams = [];
        if (filtros.estado) {
            queryBase += ` AND dv.estado = ?`;
            queryParams.push(filtros.estado);
        }
        if (filtros.idVenta) {
            queryBase += ` AND dv.idVenta = ?`;
            queryParams.push(filtros.idVenta);
        }
        if (filtros.fechaDesde) {
            queryBase += ` AND DATE(dv.fechaCreacion) >= ?`;
            queryParams.push(filtros.fechaDesde);
        }
        if (filtros.fechaHasta) {
            queryBase += ` AND DATE(dv.fechaCreacion) <= ?`;
            queryParams.push(filtros.fechaHasta);
        }
        const countResult = await conection.query(`SELECT COUNT(*) as total ${queryBase}`, queryParams);
        const total = Number(countResult[0].total);
        const pagina = filtros.pagina || 1;
        const porPagina = filtros.porPagina || 10;
        const offset = (pagina - 1) * porPagina;
        const queryFinal = `
            SELECT
                dv.idDevolucionVenta, dv.fechaCreacion, dv.fechaResolucion, dv.tipo,
                dv.motivo, dv.estado, dv.montoReembolso, dv.metodoReembolso,
                dv.numeroNotaCredito, dv.observaciones,
                dv.idVenta,
                cl.nombre AS cliente,
                CONCAT(u.nombre, ' ', u.apellido) AS usuario,
                (SELECT COUNT(*) FROM detalledevolucionventa d WHERE d.idDevolucionVenta = dv.idDevolucionVenta) AS totalItems
            ${queryBase}
            ORDER BY dv.fechaCreacion DESC
            LIMIT ? OFFSET ?
        `;
        queryParams.push(porPagina, offset);
        const data = await conection.query(queryFinal, queryParams);
        conection.release();
        const dataNormalizada = data.map((row) => ({
            ...row,
            montoReembolso: Number(row.montoReembolso ?? 0),
            totalItems: Number(row.totalItems ?? 0),
        }));
        return { data: dataNormalizada, total };
    },
    // ── GET: Detalle de una devolución de venta ───────────────────────────────
    async obtenerVentaPorId(idDevolucionVenta) {
        const conection = await db_1.default.getConnection();
        const cabecera = await conection.query(`
            SELECT
                dv.idDevolucionVenta, dv.fechaCreacion, dv.fechaResolucion, dv.fechaModificacion,
                dv.tipo, dv.motivo, dv.estado, dv.montoReembolso, dv.metodoReembolso,
                dv.numeroNotaCredito, dv.motivoRechazo, dv.observaciones,
                dv.idVenta, dv.idUsuario, dv.idUsuarioAutoriza,
                cl.nombre AS cliente, cl.ci AS clienteNit,
                CONCAT(u.nombre, ' ', u.apellido) AS usuario,
                CONCAT(a.nombre, ' ', a.apellido) AS usuarioAutoriza
            FROM devolucionventa dv
            INNER JOIN venta   v  ON v.idVenta   = dv.idVenta
            INNER JOIN cliente cl ON cl.idCliente = v.idCliente
            INNER JOIN usuario u  ON u.idUsuario  = dv.idUsuario
            LEFT  JOIN usuario a  ON a.idUsuario  = dv.idUsuarioAutoriza
            WHERE dv.idDevolucionVenta = ?
        `, [idDevolucionVenta]);
        if (cabecera.length === 0) {
            conection.release();
            return null;
        }
        const detalles = await conection.query(`
            SELECT
                ddv.idLote, ddv.idProducto, ddv.cantidad, ddv.precioUnitario,
                ddv.subtotal, ddv.destino,
                l.numeroLote, l.codigo,
                pr.nombreComercial, ${(0, ProductoDerivado_1.sqlNombreGenerico)('pr')} AS nombreGenerico
            FROM detalledevolucionventa ddv
            INNER JOIN lote     l  ON l.idLote     = ddv.idLote
            INNER JOIN producto pr ON pr.idProducto = ddv.idProducto
            WHERE ddv.idDevolucionVenta = ?
            ORDER BY ddv.idProducto ASC
        `, [idDevolucionVenta]);
        conection.release();
        return { ...cabecera[0], detalles };
    },
    // ── ADD: Registrar una devolución de venta (estado inicial 'solicitada') ──
    async crearVenta(datos, idUsuario) {
        const conection = await db_1.default.getConnection();
        await conection.beginTransaction();
        try {
            // 1. La venta debe existir y estar completada (o ya parcialmente devuelta)
            const venta = await conection.query(`
                SELECT estado FROM venta WHERE idVenta = ?
            `, [datos.idVenta]);
            if (venta.length === 0) {
                throw new Error('La venta no existe.');
            }
            if (!['completado', 'devuelto_parcial'].includes(venta[0].estado)) {
                throw new Error('Solo se pueden devolver ventas completadas.');
            }
            if (!datos.detalles || datos.detalles.length === 0) {
                throw new Error('Debe ingresar al menos un producto a devolver.');
            }
            // 2. Calcular el monto de reembolso
            const montoReembolso = datos.detalles.reduce((acc, d) => acc + Number(d.cantidad) * Number(d.precioUnitario), 0);
            // 3. Insertar cabecera
            const insert = await conection.query(`
                INSERT INTO devolucionventa
                    (tipo, motivo, estado, montoReembolso, metodoReembolso, observaciones, idVenta, idUsuario)
                VALUES (?, ?, 'solicitada', ?, ?, ?, ?, ?)
            `, [
                datos.tipo,
                datos.motivo,
                montoReembolso,
                datos.metodoReembolso || null,
                datos.observaciones || null,
                datos.idVenta,
                idUsuario,
            ]);
            const idDevolucionVenta = Number(insert.insertId);
            // 4. Insertar detalles
            for (const d of datos.detalles) {
                await conection.query(`
                    INSERT INTO detalledevolucionventa
                        (idDevolucionVenta, idLote, idProducto, cantidad, precioUnitario, subtotal, destino)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    idDevolucionVenta, d.idLote, d.idProducto, d.cantidad,
                    d.precioUnitario, Number(d.cantidad) * Number(d.precioUnitario), d.destino,
                ]);
            }
            await conection.commit();
            return idDevolucionVenta;
        }
        catch (error) {
            await conection.rollback();
            throw error;
        }
        finally {
            conection.release();
        }
    },
    // ── PATCH: Resolver una devolución de venta (aprobar / rechazar / completar)
    async resolverVenta(idDevolucionVenta, datos, idUsuarioAutoriza) {
        const conection = await db_1.default.getConnection();
        await conection.beginTransaction();
        try {
            const cab = await conection.query(`
                SELECT estado, tipo, idVenta FROM devolucionventa WHERE idDevolucionVenta = ?
            `, [idDevolucionVenta]);
            if (cab.length === 0) {
                throw new Error('La devolución no existe.');
            }
            if (['completada', 'rechazada'].includes(cab[0].estado)) {
                throw new Error('La devolución ya fue resuelta.');
            }
            if (datos.estado === 'completada') {
                // 1. Ajustar stock según el destino de cada línea
                const detalles = await conection.query(`
                    SELECT idLote, cantidad, destino FROM detalledevolucionventa
                    WHERE idDevolucionVenta = ?
                `, [idDevolucionVenta]);
                for (const d of detalles) {
                    if (d.destino === 'reingreso_stock') {
                        await conection.query(`
                            UPDATE lote SET stock = stock + ? WHERE idLote = ?
                        `, [d.cantidad, d.idLote]);
                    }
                    else if (d.destino === 'cuarentena') {
                        await conection.query(`
                            UPDATE lote SET stock = stock + ?, estado = 'cuarentena' WHERE idLote = ?
                        `, [d.cantidad, d.idLote]);
                    }
                    // 'merma': el producto no vuelve al inventario, no se ajusta stock
                }
                // 2. Actualizar el estado de la venta origen
                await conection.query(`
                    UPDATE venta SET estado = ? WHERE idVenta = ?
                `, [cab[0].tipo === 'total' ? 'devuelto_total' : 'devuelto_parcial', cab[0].idVenta]);
                // 3. Cerrar la devolución
                await conection.query(`
                    UPDATE devolucionventa SET
                        estado = 'completada',
                        metodoReembolso = COALESCE(?, metodoReembolso),
                        numeroNotaCredito = COALESCE(?, numeroNotaCredito),
                        fechaResolucion = NOW(),
                        fechaModificacion = NOW(),
                        idUsuarioAutoriza = ?
                    WHERE idDevolucionVenta = ?
                `, [datos.metodoReembolso || null, datos.numeroNotaCredito || null, idUsuarioAutoriza, idDevolucionVenta]);
            }
            else if (datos.estado === 'rechazada') {
                await conection.query(`
                    UPDATE devolucionventa SET
                        estado = 'rechazada',
                        motivoRechazo = ?,
                        fechaResolucion = NOW(),
                        fechaModificacion = NOW(),
                        idUsuarioAutoriza = ?
                    WHERE idDevolucionVenta = ?
                `, [datos.motivoRechazo || 'Devolución rechazada', idUsuarioAutoriza, idDevolucionVenta]);
            }
            else if (datos.estado === 'aprobada') {
                await conection.query(`
                    UPDATE devolucionventa SET
                        estado = 'aprobada',
                        fechaModificacion = NOW(),
                        idUsuarioAutoriza = ?
                    WHERE idDevolucionVenta = ?
                `, [idUsuarioAutoriza, idDevolucionVenta]);
            }
            else {
                throw new Error('Estado no válido para resolver la devolución.');
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
    // ═════════════ DEVOLUCIONES A PROVEEDOR (farmacia → proveedor) ═════════════
    // ── GET: Listar devoluciones a proveedor ──────────────────────────────────
    async listarProveedores(filtros) {
        const conection = await db_1.default.getConnection();
        let queryBase = `
            FROM devolucionproveedor dp
            INNER JOIN compra    c ON c.idCompra    = dp.idCompra
            INNER JOIN proveedor p ON p.idProveedor = c.idProveedor
            INNER JOIN usuario   u ON u.idUsuario   = dp.idUsuario
            WHERE 1=1
        `;
        const queryParams = [];
        if (filtros.estado) {
            queryBase += ` AND dp.estado = ?`;
            queryParams.push(filtros.estado);
        }
        if (filtros.idCompra) {
            queryBase += ` AND dp.idCompra = ?`;
            queryParams.push(filtros.idCompra);
        }
        if (filtros.fechaDesde) {
            queryBase += ` AND DATE(dp.fechaCreacion) >= ?`;
            queryParams.push(filtros.fechaDesde);
        }
        if (filtros.fechaHasta) {
            queryBase += ` AND DATE(dp.fechaCreacion) <= ?`;
            queryParams.push(filtros.fechaHasta);
        }
        const countResult = await conection.query(`SELECT COUNT(*) as total ${queryBase}`, queryParams);
        const total = Number(countResult[0].total);
        const pagina = filtros.pagina || 1;
        const porPagina = filtros.porPagina || 10;
        const offset = (pagina - 1) * porPagina;
        const queryFinal = `
            SELECT
                dp.idDevolucionProveedor, dp.fechaCreacion, dp.fechaResolucion, dp.tipo,
                dp.motivo, dp.estado, dp.montoNotaCredito, dp.numeroNotaCredito,
                dp.observaciones, dp.idCompra,
                c.numeroFactura AS compraFactura,
                p.nombre AS proveedor,
                CONCAT(u.nombre, ' ', u.apellido) AS usuario,
                (SELECT COUNT(*) FROM detalledevolucionproveedor d WHERE d.idDevolucionProveedor = dp.idDevolucionProveedor) AS totalItems
            ${queryBase}
            ORDER BY dp.fechaCreacion DESC
            LIMIT ? OFFSET ?
        `;
        queryParams.push(porPagina, offset);
        const data = await conection.query(queryFinal, queryParams);
        conection.release();
        const dataNormalizada = data.map((row) => ({
            ...row,
            montoNotaCredito: Number(row.montoNotaCredito ?? 0),
            totalItems: Number(row.totalItems ?? 0),
        }));
        return { data: dataNormalizada, total };
    },
    // ── GET: Detalle de una devolución a proveedor ────────────────────────────
    async obtenerProveedorPorId(idDevolucionProveedor) {
        const conection = await db_1.default.getConnection();
        const cabecera = await conection.query(`
            SELECT
                dp.idDevolucionProveedor, dp.fechaCreacion, dp.fechaResolucion, dp.fechaModificacion,
                dp.tipo, dp.motivo, dp.estado, dp.montoNotaCredito, dp.numeroNotaCredito,
                dp.motivoRechazo, dp.observaciones,
                dp.idCompra, dp.idUsuario, dp.idUsuarioAutoriza,
                c.numeroFactura AS compraFactura,
                p.nombre AS proveedor,
                CONCAT(u.nombre, ' ', u.apellido) AS usuario,
                CONCAT(a.nombre, ' ', a.apellido) AS usuarioAutoriza
            FROM devolucionproveedor dp
            INNER JOIN compra    c ON c.idCompra    = dp.idCompra
            INNER JOIN proveedor p ON p.idProveedor = c.idProveedor
            INNER JOIN usuario   u ON u.idUsuario   = dp.idUsuario
            LEFT  JOIN usuario   a ON a.idUsuario   = dp.idUsuarioAutoriza
            WHERE dp.idDevolucionProveedor = ?
        `, [idDevolucionProveedor]);
        if (cabecera.length === 0) {
            conection.release();
            return null;
        }
        const detalles = await conection.query(`
            SELECT
                ddp.idLote, ddp.cantidad, ddp.precioUnitario, ddp.subtotal,
                l.numeroLote, l.codigo, l.idProducto,
                pr.nombreComercial, ${(0, ProductoDerivado_1.sqlNombreGenerico)('pr')} AS nombreGenerico
            FROM detalledevolucionproveedor ddp
            INNER JOIN lote     l  ON l.idLote     = ddp.idLote
            INNER JOIN producto pr ON pr.idProducto = l.idProducto
            WHERE ddp.idDevolucionProveedor = ?
            ORDER BY l.idProducto ASC
        `, [idDevolucionProveedor]);
        conection.release();
        return { ...cabecera[0], detalles };
    },
    // ── ADD: Registrar una devolución a proveedor ─────────────────────────────
    async crearProveedor(datos, idUsuario) {
        const conection = await db_1.default.getConnection();
        await conection.beginTransaction();
        try {
            const compra = await conection.query(`
                SELECT estado FROM compra WHERE idCompra = ?
            `, [datos.idCompra]);
            if (compra.length === 0) {
                throw new Error('La compra no existe.');
            }
            if (!['completado', 'parcial', 'devuelto_parcial'].includes(compra[0].estado)) {
                throw new Error('Solo se pueden devolver compras completadas.');
            }
            if (!datos.detalles || datos.detalles.length === 0) {
                throw new Error('Debe ingresar al menos un lote a devolver.');
            }
            const montoNotaCredito = datos.detalles.reduce((acc, d) => acc + Number(d.cantidad) * Number(d.precioUnitario), 0);
            const insert = await conection.query(`
                INSERT INTO devolucionproveedor
                    (tipo, motivo, estado, montoNotaCredito, observaciones, idCompra, idUsuario)
                VALUES (?, ?, 'solicitada', ?, ?, ?, ?)
            `, [
                datos.tipo,
                datos.motivo,
                montoNotaCredito,
                datos.observaciones || null,
                datos.idCompra,
                idUsuario,
            ]);
            const idDevolucionProveedor = Number(insert.insertId);
            for (const d of datos.detalles) {
                await conection.query(`
                    INSERT INTO detalledevolucionproveedor
                        (idDevolucionProveedor, idLote, cantidad, precioUnitario, subtotal)
                    VALUES (?, ?, ?, ?, ?)
                `, [
                    idDevolucionProveedor, d.idLote, d.cantidad,
                    d.precioUnitario, Number(d.cantidad) * Number(d.precioUnitario),
                ]);
            }
            await conection.commit();
            return idDevolucionProveedor;
        }
        catch (error) {
            await conection.rollback();
            throw error;
        }
        finally {
            conection.release();
        }
    },
    // ── PATCH: Resolver una devolución a proveedor ────────────────────────────
    async resolverProveedor(idDevolucionProveedor, datos, idUsuarioAutoriza) {
        const conection = await db_1.default.getConnection();
        await conection.beginTransaction();
        try {
            const cab = await conection.query(`
                SELECT estado, tipo, idCompra FROM devolucionproveedor WHERE idDevolucionProveedor = ?
            `, [idDevolucionProveedor]);
            if (cab.length === 0) {
                throw new Error('La devolución no existe.');
            }
            if (['completada', 'rechazada'].includes(cab[0].estado)) {
                throw new Error('La devolución ya fue resuelta.');
            }
            if (datos.estado === 'completada') {
                // 1. Descontar del stock los lotes devueltos al proveedor
                const detalles = await conection.query(`
                    SELECT idLote, cantidad FROM detalledevolucionproveedor
                    WHERE idDevolucionProveedor = ?
                `, [idDevolucionProveedor]);
                for (const d of detalles) {
                    await conection.query(`
                        UPDATE lote SET stock = stock - ? WHERE idLote = ?
                    `, [d.cantidad, d.idLote]);
                    await conection.query(`
                        UPDATE lote SET estado = 'devuelto' WHERE idLote = ? AND stock <= 0
                    `, [d.idLote]);
                }
                // 2. Actualizar el estado de la compra origen
                await conection.query(`
                    UPDATE compra SET estado = ? WHERE idCompra = ?
                `, [cab[0].tipo === 'total' ? 'devuelto_total' : 'devuelto_parcial', cab[0].idCompra]);
                // 3. Cerrar la devolución
                await conection.query(`
                    UPDATE devolucionproveedor SET
                        estado = 'completada',
                        numeroNotaCredito = COALESCE(?, numeroNotaCredito),
                        fechaResolucion = NOW(),
                        fechaModificacion = NOW(),
                        idUsuarioAutoriza = ?
                    WHERE idDevolucionProveedor = ?
                `, [datos.numeroNotaCredito || null, idUsuarioAutoriza, idDevolucionProveedor]);
            }
            else if (datos.estado === 'rechazada') {
                await conection.query(`
                    UPDATE devolucionproveedor SET
                        estado = 'rechazada',
                        motivoRechazo = ?,
                        fechaResolucion = NOW(),
                        fechaModificacion = NOW(),
                        idUsuarioAutoriza = ?
                    WHERE idDevolucionProveedor = ?
                `, [datos.motivoRechazo || 'Devolución rechazada', idUsuarioAutoriza, idDevolucionProveedor]);
            }
            else if (datos.estado === 'aceptada') {
                await conection.query(`
                    UPDATE devolucionproveedor SET
                        estado = 'aceptada',
                        fechaModificacion = NOW(),
                        idUsuarioAutoriza = ?
                    WHERE idDevolucionProveedor = ?
                `, [idUsuarioAutoriza, idDevolucionProveedor]);
            }
            else {
                throw new Error('Estado no válido para resolver la devolución.');
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
};
exports.default = DataDevolucion;
//# sourceMappingURL=DevolucionModels.js.map