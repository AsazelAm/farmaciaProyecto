"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataVenta = void 0;
const db_1 = __importDefault(require("../config/db"));
const ProductoDerivado_1 = require("./ProductoDerivado");
const StockModels_1 = require("./StockModels");
const DataVenta = {
    async listar(filtros) {
        const conection = await db_1.default.getConnection();
        let queryBase = `FROM venta v INNER JOIN cliente cl ON cl.idCliente=v.idCliente INNER JOIN usuario u ON u.idUsuario=v.idUsuario INNER JOIN sucursal s ON s.idSucursal=v.idSucursal WHERE 1=1`;
        const queryParams = [];
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
        const countResult = await conection.query(`SELECT COUNT(*) as total ${queryBase}`, queryParams);
        const total = Number(countResult[0].total);
        const pagina = filtros.pagina || 1;
        const porPagina = filtros.porPagina || 10;
        const offset = (pagina - 1) * porPagina;
        const queryFinal = `SELECT v.idVenta, v.fechaCreacion, v.subtotal, v.descuentoTotal, v.total, v.estado, v.tipoPago, cl.nombre AS cliente, cl.ci AS clienteNit, u.nombre AS usuario, s.nombre AS sucursal, (SELECT r.idRecibo FROM recibo r WHERE r.idVenta = v.idVenta LIMIT 1) AS idRecibo, (SELECT COUNT(*) FROM detalleventa dv WHERE dv.idVenta = v.idVenta) AS totalItems ${queryBase} ORDER BY v.fechaCreacion DESC LIMIT ? OFFSET ?`;
        queryParams.push(porPagina, offset);
        const data = await conection.query(queryFinal, queryParams);
        conection.release();
        const dataNormalizada = data.map((row) => ({ ...row, totalItems: Number(row.totalItems ?? 0) }));
        return { data: dataNormalizada, total };
    },
    async obtenerPorId(idVenta) {
        const conection = await db_1.default.getConnection();
        const ventas = await conection.query(`SELECT v.*, CONCAT_WS(' ', cl.nombre, cl.apellido) AS cliente, cl.ci AS clienteNit, cl.telefono AS clienteTelefono, u.nombre AS usuario, s.nombre AS sucursal, s.direccion AS sucursalDireccion FROM venta v INNER JOIN cliente cl ON cl.idCliente=v.idCliente INNER JOIN usuario u ON u.idUsuario=v.idUsuario INNER JOIN sucursal s ON s.idSucursal=v.idSucursal WHERE v.idVenta = ?`, [idVenta]);
        if (ventas.length === 0) {
            conection.release();
            return null;
        }
        const venta = ventas[0];
        const detalles = await conection.query(`SELECT dv.cantidad, dv.precioUnitario, dv.descuento, dv.subtotal, dv.idLote, l.numeroLote, l.codigo, l.fechaVencimiento, DATEDIFF(l.fechaVencimiento, NOW()) AS diasParaVencer, l.idProducto, pr.codigoBarra, ${(0, ProductoDerivado_1.sqlNombreGenerico)('pr')} AS nombreGenerico, pr.nombreComercial, ${(0, ProductoDerivado_1.sqlConcentracion)('pr')} AS concentracion, pr.requiereReceta, lab.nombre AS nombreLaboratorio FROM detalleventa dv INNER JOIN lote l ON l.idLote=dv.idLote INNER JOIN producto pr ON pr.idProducto=l.idProducto INNER JOIN laboratorio lab ON lab.idLaboratorio=pr.idLaboratorio WHERE dv.idVenta = ? ORDER BY l.idProducto ASC`, [idVenta]);
        const recibos = await conection.query(`SELECT idRecibo, numeroRecibo, fechaEmision, estado FROM recibo WHERE idVenta = ?`, [idVenta]);
        conection.release();
        const detallesNormalizados = detalles.map((d) => ({ ...d, diasParaVencer: Number(d.diasParaVencer ?? 0) }));
        return { ...venta, detalles: detallesNormalizados, recibo: recibos[0] || null };
    },
    async crear(datos, idUsuario) {
        const conection = await db_1.default.getConnection();
        await conection.beginTransaction();
        try {
            const insertVenta = await conection.query(`INSERT INTO venta (subtotal, descuentoTotal, total, estado, tipoPago, observaciones, idCliente, idUsuario, idSucursal) VALUES (?, ?, ?, 'pendiente', ?, ?, ?, ?, ?)`, [datos.subtotal, datos.descuentoTotal, datos.total, datos.tipoPago || null, datos.observaciones || null, datos.idCliente, idUsuario, datos.idSucursal]);
            const idVenta = Number(insertVenta.insertId);
            for (const detalle of datos.detalles) {
                let cantidadRestante = Number(detalle.cantidad);
                if (cantidadRestante <= 0)
                    throw new Error('La cantidad debe ser mayor a 0.');
                // REGLA DE NEGOCIO: jamás dispensar lotes vencidos ni en cuarentena.
                const lotesDisponibles = await conection.query(`SELECT idLote, stock, estado, fechaVencimiento FROM lote WHERE idProducto = ? AND estado = 'activo' AND fechaVencimiento > CURDATE() ORDER BY fechaVencimiento ASC, idLote ASC FOR UPDATE`, [detalle.idProducto]);
                if (lotesDisponibles.length === 0)
                    throw new Error(`No hay lotes activos disponibles para el producto #${detalle.idProducto}.`);
                let stockTotalDisponible = 0;
                for (const l of lotesDisponibles)
                    stockTotalDisponible += Number(l.stock);
                if (stockTotalDisponible < cantidadRestante)
                    throw new Error(`Stock insuficiente para el producto #${detalle.idProducto}. Disponible: ${stockTotalDisponible}, solicitado: ${cantidadRestante}.`);
                for (const lote of lotesDisponibles) {
                    if (cantidadRestante <= 0)
                        break;
                    const stockLote = Number(lote.stock);
                    const aConsumir = Math.min(stockLote, cantidadRestante);
                    await conection.query(`UPDATE lote SET stock = stock - ? WHERE idLote = ?`, [aConsumir, lote.idLote]);
                    const subtotalDetalle = (aConsumir * detalle.precioUnitario) - (detalle.descuento * (aConsumir / detalle.cantidad));
                    await conection.query(`INSERT INTO detalleventa (cantidad, precioUnitario, descuento, subtotal, idLote, idVenta) VALUES (?, ?, ?, ?, ?, ?)`, [aConsumir, detalle.precioUnitario, detalle.descuento * (aConsumir / detalle.cantidad), subtotalDetalle, lote.idLote, idVenta]);
                    cantidadRestante -= aConsumir;
                }
                await (0, StockModels_1.recalcularStockTotal)(conection, Number(detalle.idProducto));
            }
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
    async completar(idVenta) {
        const conection = await db_1.default.getConnection();
        try {
            const result = await conection.query(`UPDATE venta SET estado = 'completado' WHERE idVenta = ? AND estado = 'pendiente'`, [idVenta]);
            return result.affectedRows > 0;
        }
        finally {
            conection.release();
        }
    },
    async cambiarAPendiente(idVenta) {
        const conection = await db_1.default.getConnection();
        try {
            const result = await conection.query(`UPDATE venta SET estado = 'pendiente' WHERE idVenta = ? AND estado = 'completado'`, [idVenta]);
            return result.affectedRows > 0;
        }
        finally {
            conection.release();
        }
    },
    async anular(idVenta, motivo, idUsuario) {
        const conection = await db_1.default.getConnection();
        await conection.beginTransaction();
        try {
            const check = await conection.query(`SELECT estado FROM venta WHERE idVenta = ?`, [idVenta]);
            if (check.length === 0)
                throw new Error('La venta no existe.');
            if (check[0].estado === 'cancelado')
                throw new Error('La venta ya se encuentra cancelada.');
            const detalles = await conection.query(`SELECT dv.idLote, dv.cantidad, l.idProducto FROM detalleventa dv INNER JOIN lote l ON l.idLote = dv.idLote WHERE dv.idVenta = ?`, [idVenta]);
            for (const d of detalles) {
                await conection.query(`UPDATE lote SET stock = stock + ? WHERE idLote = ?`, [d.cantidad, d.idLote]);
            }
            const prodAfectados = [...new Set(detalles.map((x) => Number(x.idProducto)))];
            await (0, StockModels_1.recalcularStockTotales)(conection, prodAfectados);
            await conection.query(`UPDATE venta SET estado = 'cancelado', motivoCancelacion = ?, fechaCancelacion = NOW(), idUsuarioCancelacion = ? WHERE idVenta = ?`, [motivo || 'Venta anulada', idUsuario ?? null, idVenta]);
            await conection.query(`UPDATE recibo SET estado = 'anulado' WHERE idVenta = ?`, [idVenta]);
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
    async actualizar(idVenta, datos) {
        const conection = await db_1.default.getConnection();
        await conection.beginTransaction();
        try {
            const check = await conection.query(`SELECT estado FROM venta WHERE idVenta = ?`, [idVenta]);
            if (check.length === 0)
                throw new Error('La venta no existe.');
            if (check[0].estado !== 'pendiente')
                throw new Error('Solo se pueden editar ventas en estado pendiente.');
            await conection.query(`UPDATE venta SET subtotal = ?, descuentoTotal = ?, total = ?, tipoPago = ?, observaciones = ?, idCliente = ?, idSucursal = ? WHERE idVenta = ?`, [datos.subtotal, datos.descuentoTotal, datos.total, datos.tipoPago || null, datos.observaciones || null, datos.idCliente, datos.idSucursal, idVenta]);
            const detallesActuales = await conection.query(`SELECT dv.idLote, dv.cantidad, l.idProducto FROM detalleventa dv INNER JOIN lote l ON l.idLote = dv.idLote WHERE dv.idVenta = ?`, [idVenta]);
            for (const d of detallesActuales) {
                await conection.query(`UPDATE lote SET stock = stock + ? WHERE idLote = ?`, [d.cantidad, d.idLote]);
            }
            const prodAfectados = [...new Set(detallesActuales.map((x) => Number(x.idProducto)))];
            await (0, StockModels_1.recalcularStockTotales)(conection, prodAfectados);
            await conection.query(`DELETE FROM detalleventa WHERE idVenta = ?`, [idVenta]);
            for (const detalle of datos.detalles) {
                let cantidadRestante = Number(detalle.cantidad);
                if (cantidadRestante <= 0)
                    throw new Error('La cantidad debe ser mayor a 0.');
                const lotesDisponibles = await conection.query(`SELECT idLote, stock, fechaVencimiento FROM lote WHERE idProducto = ? AND estado = 'activo' AND fechaVencimiento > CURDATE() ORDER BY fechaVencimiento ASC, idLote ASC FOR UPDATE`, [detalle.idProducto]);
                if (lotesDisponibles.length === 0)
                    throw new Error(`No hay lotes activos disponibles para el producto #${detalle.idProducto}.`);
                let stockTotalDisponible = 0;
                for (const l of lotesDisponibles)
                    stockTotalDisponible += Number(l.stock);
                if (stockTotalDisponible < cantidadRestante)
                    throw new Error(`Stock insuficiente para el producto #${detalle.idProducto}. Disponible: ${stockTotalDisponible}, solicitado: ${cantidadRestante}.`);
                for (const lote of lotesDisponibles) {
                    if (cantidadRestante <= 0)
                        break;
                    const stockLote = Number(lote.stock);
                    const aConsumir = Math.min(stockLote, cantidadRestante);
                    await conection.query(`UPDATE lote SET stock = stock - ? WHERE idLote = ?`, [aConsumir, lote.idLote]);
                    const subtotalDetalle = (aConsumir * detalle.precioUnitario) - (detalle.descuento * (aConsumir / detalle.cantidad));
                    await conection.query(`INSERT INTO detalleventa (cantidad, precioUnitario, descuento, subtotal, idLote, idVenta) VALUES (?, ?, ?, ?, ?, ?)`, [aConsumir, detalle.precioUnitario, detalle.descuento * (aConsumir / detalle.cantidad), subtotalDetalle, lote.idLote, idVenta]);
                    cantidadRestante -= aConsumir;
                }
                await (0, StockModels_1.recalcularStockTotal)(conection, Number(detalle.idProducto));
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
    async emitirRecibo(idVenta) {
        const conection = await db_1.default.getConnection();
        await conection.beginTransaction();
        try {
            const check = await conection.query(`SELECT estado FROM venta WHERE idVenta = ?`, [idVenta]);
            if (check.length === 0)
                throw new Error('La venta no existe.');
            if (check[0].estado !== 'completado')
                throw new Error('Solo se puede emitir un recibo de una venta completada.');
            const reciboExistente = await conection.query(`SELECT idRecibo FROM recibo WHERE idVenta = ?`, [idVenta]);
            if (reciboExistente.length > 0)
                throw new Error('Esta venta ya tiene un recibo emitido.');
            const consecutivoFilas = await conection.query(`SELECT MAX(CAST(SUBSTRING(numeroRecibo, 3) AS UNSIGNED)) AS maxNumero FROM recibo WHERE numeroRecibo REGEXP '^R-[0-9]+$'`);
            const siguienteNumero = Number(consecutivoFilas[0]?.maxNumero ?? 0) + 1;
            const numeroRecibo = `R-${String(siguienteNumero).padStart(6, '0')}`;
            const insertRecibo = await conection.query(`INSERT INTO recibo (numeroRecibo, idVenta) VALUES (?, ?)`, [numeroRecibo, idVenta]);
            await conection.commit();
            return { idRecibo: Number(insertRecibo.insertId), numeroRecibo };
        }
        catch (error) {
            await conection.rollback();
            throw error;
        }
        finally {
            conection.release();
        }
    },
    async VerificarStockLote(idLote, cantidad) {
        const conection = await db_1.default.getConnection();
        try {
            const rows = await conection.query(`SELECT stock, estado, IF(fechaVencimiento > CURDATE(), 1, 0) AS vigente FROM lote WHERE idLote = ?`, [idLote]);
            const lote = rows[0];
            if (!lote)
                return { disponible: false, stock: 0 };
            return {
                disponible: lote.estado === 'activo' && Number(lote.vigente) === 1 && Number(lote.stock) >= cantidad,
                stock: Number(lote.stock ?? 0),
                estado: lote.estado,
            };
        }
        finally {
            conection.release();
        }
    },
    async AlertaFEFO(idProducto, idLote) {
        const conection = await db_1.default.getConnection();
        try {
            const lotes = await conection.query(`SELECT idLote, codigo, numeroLote, stock, fechaVencimiento, estado, DATEDIFF(fechaVencimiento, CURDATE()) AS diasRestantes FROM lote WHERE idLote = ? AND estado = 'activo' AND fechaVencimiento > CURDATE()`, [idLote]);
            const seleccionado = lotes[0];
            if (!seleccionado)
                return { existe: false, cumpleFEFO: false, mensaje: 'El lote no está disponible para dispensación (vencido o inactivo).' };
            const fefo = await conection.query(`SELECT idLote, codigo, numeroLote, stock, fechaVencimiento, DATEDIFF(fechaVencimiento, CURDATE()) AS diasRestantes FROM lote WHERE idProducto = ? AND estado = 'activo' AND fechaVencimiento > CURDATE() AND stock > 0 ORDER BY fechaVencimiento ASC, idLote ASC LIMIT 1`, [idProducto]);
            const loteFEFO = fefo[0] ?? null;
            const diasSeleccionado = Number(seleccionado.diasRestantes ?? 0);
            const diasFEFO = loteFEFO ? Number(loteFEFO.diasRestantes ?? 0) : diasSeleccionado;
            const cumpleFEFO = !loteFEFO || Number(loteFEFO.idLote) === Number(seleccionado.idLote);
            const diasDiferencia = diasSeleccionado - diasFEFO;
            const mensaje = cumpleFEFO ? `El lote ${seleccionado.numeroLote} cumple FEFO.` : `ALERTA FEFO: lote ${seleccionado.numeroLote} vence en ${diasSeleccionado} días vs lote ${loteFEFO.numeroLote} en ${diasFEFO} días.`;
            return { existe: true, cumpleFEFO, idLote: Number(seleccionado.idLote), codigo: seleccionado.codigo, numeroLote: seleccionado.numeroLote, stock: Number(seleccionado.stock ?? 0), fechaVencimiento: seleccionado.fechaVencimiento, diasRestantes: diasSeleccionado, idLoteFEFO: loteFEFO ? Number(loteFEFO.idLote) : null, numeroLoteFEFO: loteFEFO ? loteFEFO.numeroLote : null, fechaVencimientoFEFO: loteFEFO ? loteFEFO.fechaVencimiento : null, diasRestantesFEFO: diasFEFO, stockLoteFEFO: loteFEFO ? Number(loteFEFO.stock ?? 0) : 0, diasDiferencia, mensaje };
        }
        finally {
            conection.release();
        }
    },
    async LotesDisponiblesPorProducto(idProducto) {
        const conection = await db_1.default.getConnection();
        try {
            const lotes = await conection.query(`SELECT idLote, codigo, numeroLote, stock, fechaVencimiento, precioCompra, estado, DATEDIFF(fechaVencimiento, CURDATE()) AS diasRestantes FROM lote WHERE idProducto = ? AND estado = 'activo' AND fechaVencimiento > CURDATE() AND stock > 0 ORDER BY fechaVencimiento ASC, idLote ASC`, [idProducto]);
            return lotes.map((l) => ({ ...l, stock: Number(l.stock), diasRestantes: Number(l.diasRestantes ?? 0) }));
        }
        finally {
            conection.release();
        }
    },
    async ValidarFEFODetalles(detalles) {
        if (!detalles || detalles.length === 0)
            return null;
        const idsLote = detalles.map((d) => Number(d.idLote)).filter((id) => id > 0);
        if (idsLote.length === 0)
            return null;
        const conection = await db_1.default.getConnection();
        try {
            const filas = await conection.query(`SELECT l.idLote, l.idProducto, l.codigo, l.numeroLote, l.stock, l.fechaVencimiento, DATEDIFF(l.fechaVencimiento, CURDATE()) AS diasRestantes, IF(l.estado = 'activo' AND l.fechaVencimiento > CURDATE(), 1, 0) AS esVendible FROM lote l WHERE l.idLote IN (${idsLote.map(() => '?').join(', ')})`, idsLote);
            const lotes = filas;
            if (lotes.length === 0)
                return null;
            const idsProducto = [...new Set(lotes.map((l) => Number(l.idProducto)))];
            const fEFOPorProducto = new Map();
            for (const idProducto of idsProducto) {
                const res = await conection.query(`SELECT idLote, codigo, numeroLote, stock, fechaVencimiento, DATEDIFF(fechaVencimiento, CURDATE()) AS diasRestantes FROM lote WHERE idProducto = ? AND estado = 'activo' AND stock > 0 ORDER BY fechaVencimiento ASC, idLote ASC LIMIT 1`, [idProducto]);
                const loteFEFO = res[0];
                if (loteFEFO)
                    fEFOPorProducto.set(idProducto, loteFEFO);
            }
            const asignadoPorLote = new Map();
            detalles.forEach((d) => {
                const id = Number(d.idLote);
                asignadoPorLote.set(id, (asignadoPorLote.get(id) ?? 0) + Number(d.cantidad ?? 0));
            });
            for (const lote of lotes) {
                if (Number(lote.esVendible) !== 1) {
                    return {
                        idLote: Number(lote.idLote),
                        numeroLote: lote.numeroLote,
                        codigo: lote.codigo,
                        noVendible: true,
                        mensaje: `El lote ${lote.numeroLote} no se puede dispensar: está vencido o no está activo.`,
                    };
                }
                const loteFEFO = fEFOPorProducto.get(Number(lote.idProducto));
                if (!loteFEFO)
                    continue;
                if (Number(loteFEFO.idLote) === Number(lote.idLote))
                    continue;
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
                    mensaje: `El lote ${lote.numeroLote} (vence en ${diasSeleccionado} días) no cumple la regla FEFO: el lote ${loteFEFO.numeroLote} (vence en ${diasFEFO} días) debe despacharse primero y aún tiene ${restanteFEFO} unidades disponibles.`
                };
            }
            return null;
        }
        finally {
            conection.release();
        }
    },
    async estadisticas() {
        const conection = await db_1.default.getConnection();
        try {
            const porEstado = await conection.query(`SELECT estado, COUNT(*) as cantidad, COALESCE(SUM(total),0) as monto FROM venta GROUP BY estado`);
            const totalMes = await conection.query(`SELECT COALESCE(SUM(total),0) as total FROM venta WHERE MONTH(fechaCreacion)=MONTH(CURDATE()) AND YEAR(fechaCreacion)=YEAR(CURDATE()) AND estado='completado'`);
            const totalMesAnterior = await conection.query(`SELECT COALESCE(SUM(total),0) as total FROM venta WHERE MONTH(fechaCreacion)=MONTH(CURDATE() - INTERVAL 1 MONTH) AND YEAR(fechaCreacion)=YEAR(CURDATE() - INTERVAL 1 MONTH) AND estado='completado'`);
            const porSucursal = await conection.query(`SELECT s.nombre, COUNT(*) as cantidad, COALESCE(SUM(v.total),0) as monto FROM venta v INNER JOIN sucursal s ON s.idSucursal=v.idSucursal WHERE v.estado <> 'cancelado' GROUP BY s.idSucursal, s.nombre ORDER BY monto DESC`);
            const masVendidos = await conection.query(`SELECT pr.nombreComercial AS nombreGenerico, SUM(dv.cantidad) as unidadesVendidas, COALESCE(SUM(dv.subtotal),0) as monto FROM detalleventa dv INNER JOIN lote l ON l.idLote=dv.idLote INNER JOIN producto pr ON pr.idProducto=l.idProducto INNER JOIN venta v ON v.idVenta=dv.idVenta WHERE v.estado='completado' GROUP BY pr.idProducto, pr.nombreComercial ORDER BY unidadesVendidas DESC LIMIT 5`);
            return {
                porEstado: porEstado.map((e) => ({
                    estado: e.estado,
                    cantidad: Number(e.cantidad ?? 0),
                    monto: Number(e.monto ?? 0),
                })),
                totalMes: Number(totalMes[0]?.total ?? 0),
                totalMesAnterior: Number(totalMesAnterior[0]?.total ?? 0),
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
    }
};
exports.DataVenta = DataVenta;
exports.default = DataVenta;
//# sourceMappingURL=VentaModels.js.map