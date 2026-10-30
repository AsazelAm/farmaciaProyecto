import conectar from '../config/db';
import { sqlNombreGenerico, sqlConcentracion } from './ProductoDerivado';

export interface IVentaFiltros { estado?: 'pendiente' | 'completado' | 'cancelado' | 'devuelto_parcial' | 'devuelto_total'; idCliente?: number; idUsuario?: number; idSucursal?: number; fechaDesde?: string; fechaHasta?: string; pagina?: number; porPagina?: number; }
export interface IDetalleVentaInput { idProducto: number; idLote?: number; cantidad: number; precioUnitario: number; descuento: number; }
export interface IVentaInput { idCliente: number; idSucursal: number; tipoPago?: string; descuentoTotal: number; subtotal: number; total: number; observaciones?: string; detalles: IDetalleVentaInput[]; }

const DataVenta = {
    async listar(filtros: IVentaFiltros) {
        const conection = await conectar.getConnection();
        let queryBase = `FROM venta v INNER JOIN cliente cl ON cl.idCliente=v.idCliente INNER JOIN usuario u ON u.idUsuario=v.idUsuario INNER JOIN sucursal s ON s.idSucursal=v.idSucursal WHERE 1=1`;
        const queryParams: any[] = [];
        if (filtros.estado) { queryBase += ` AND v.estado = ?`; queryParams.push(filtros.estado); }
        if (filtros.idCliente) { queryBase += ` AND v.idCliente = ?`; queryParams.push(filtros.idCliente); }
        if (filtros.idUsuario) { queryBase += ` AND v.idUsuario = ?`; queryParams.push(filtros.idUsuario); }
        if (filtros.idSucursal) { queryBase += ` AND v.idSucursal = ?`; queryParams.push(filtros.idSucursal); }
        if (filtros.fechaDesde) { queryBase += ` AND DATE(v.fechaCreacion) >= ?`; queryParams.push(filtros.fechaDesde); }
        if (filtros.fechaHasta) { queryBase += ` AND DATE(v.fechaCreacion) <= ?`; queryParams.push(filtros.fechaHasta); }
        const countResult = await conection.query(`SELECT COUNT(*) as total ${queryBase}`, queryParams);
        const total = Number((countResult as any)[0].total);
        const pagina = filtros.pagina || 1;
        const porPagina = filtros.porPagina || 10;
        const offset = (pagina - 1) * porPagina;
        const queryFinal = `SELECT v.idVenta, v.fechaCreacion, v.subtotal, v.descuentoTotal, v.total, v.estado, v.tipoPago, cl.nombre AS cliente, cl.ci AS clienteNit, u.nombre AS usuario, s.nombre AS sucursal, (SELECT r.idRecibo FROM recibo r WHERE r.idVenta = v.idVenta LIMIT 1) AS idRecibo, (SELECT COUNT(*) FROM detalleventa dv WHERE dv.idVenta = v.idVenta) AS totalItems ${queryBase} ORDER BY v.fechaCreacion DESC LIMIT ? OFFSET ?`;
        queryParams.push(porPagina, offset);
        const data = await conection.query(queryFinal, queryParams);
        conection.release();
        const dataNormalizada = (data as any[]).map((row: any) => ({ ...row, totalItems: Number(row.totalItems ?? 0) }));
        return { data: dataNormalizada, total };
    },

    async obtenerPorId(idVenta: number) {
        const conection = await conectar.getConnection();
        const ventas = await conection.query(`SELECT v.*, CONCAT_WS(' ', cl.nombre, cl.apellido) AS cliente, cl.ci AS clienteNit, cl.telefono AS clienteTelefono, u.nombre AS usuario, s.nombre AS sucursal, s.direccion AS sucursalDireccion FROM venta v INNER JOIN cliente cl ON cl.idCliente=v.idCliente INNER JOIN usuario u ON u.idUsuario=v.idUsuario INNER JOIN sucursal s ON s.idSucursal=v.idSucursal WHERE v.idVenta = ?`, [idVenta]);
        if ((ventas as any[]).length === 0) { conection.release(); return null; }
        const venta = (ventas as any[])[0];
        const detalles = await conection.query(`SELECT dv.cantidad, dv.precioUnitario, dv.descuento, dv.subtotal, dv.idLote, l.numeroLote, l.codigo, l.fechaVencimiento, DATEDIFF(l.fechaVencimiento, NOW()) AS diasParaVencer, l.idProducto, pr.codigoBarra, ${sqlNombreGenerico('pr')} AS nombreGenerico, pr.nombreComercial, ${sqlConcentracion('pr')} AS concentracion, pr.requiereReceta, lab.nombre AS nombreLaboratorio FROM detalleventa dv INNER JOIN lote l ON l.idLote=dv.idLote INNER JOIN producto pr ON pr.idProducto=l.idProducto INNER JOIN laboratorio lab ON lab.idLaboratorio=pr.idLaboratorio WHERE dv.idVenta = ? ORDER BY l.idProducto ASC`, [idVenta]);
        const recibos = await conection.query(`SELECT idRecibo, numeroRecibo, fechaEmision, estado FROM recibo WHERE idVenta = ?`, [idVenta]);
        conection.release();
        const detallesNormalizados = (detalles as any[]).map((d: any) => ({ ...d, diasParaVencer: Number(d.diasParaVencer ?? 0) }));
        return { ...venta, detalles: detallesNormalizados, recibo: (recibos as any[])[0] || null };
    },

    async crear(datos: IVentaInput, idUsuario: number) {
        const conection = await conectar.getConnection();
        await conection.beginTransaction();
        try {
            const insertVenta = await conection.query(`INSERT INTO venta (subtotal, descuentoTotal, total, estado, tipoPago, observaciones, idCliente, idUsuario, idSucursal) VALUES (?, ?, ?, 'pendiente', ?, ?, ?, ?, ?)`, [datos.subtotal, datos.descuentoTotal, datos.total, datos.tipoPago || null, datos.observaciones || null, datos.idCliente, idUsuario, datos.idSucursal]);
            const idVenta = Number((insertVenta as any).insertId);
            for (const detalle of datos.detalles) {
                let cantidadRestante = Number(detalle.cantidad);
                if (cantidadRestante <= 0) throw new Error('La cantidad debe ser mayor a 0.');
                const lotesDisponibles = await conection.query(`SELECT idLote, stock, estado, fechaVencimiento FROM lote WHERE idProducto = ? AND estado = 'activo' ORDER BY fechaVencimiento ASC, idLote ASC FOR UPDATE`, [detalle.idProducto]);
                if ((lotesDisponibles as any[]).length === 0) throw new Error(`No hay lotes activos disponibles para el producto #${detalle.idProducto}.`);
                let stockTotalDisponible = 0;
                for (const l of lotesDisponibles as any[]) stockTotalDisponible += Number(l.stock);
                if (stockTotalDisponible < cantidadRestante) throw new Error(`Stock insuficiente para el producto #${detalle.idProducto}. Disponible: ${stockTotalDisponible}, solicitado: ${cantidadRestante}.`);
                for (const lote of lotesDisponibles as any[]) {
                    if (cantidadRestante <= 0) break;
                    const stockLote = Number((lote as any).stock);
                    const aConsumir = Math.min(stockLote, cantidadRestante);
                    await conection.query(`UPDATE lote SET stock = stock - ? WHERE idLote = ?`, [aConsumir, (lote as any).idLote]);
                    const subtotalDetalle = (aConsumir * detalle.precioUnitario) - (detalle.descuento * (aConsumir / detalle.cantidad));
                    await conection.query(`INSERT INTO detalleventa (cantidad, precioUnitario, descuento, subtotal, idLote, idVenta) VALUES (?, ?, ?, ?, ?, ?)`, [aConsumir, detalle.precioUnitario, detalle.descuento * (aConsumir / detalle.cantidad), subtotalDetalle, (lote as any).idLote, idVenta]);
                    cantidadRestante -= aConsumir;
                }
                await conection.query(`UPDATE producto p SET stockTotal = (SELECT COALESCE(SUM(l.stock),0) FROM lote l WHERE l.idProducto = p.idProducto AND l.estado IN ('activo','pendiente')) WHERE p.idProducto = ?`, [detalle.idProducto]);
            }
            await conection.commit();
            return idVenta;
        } catch (error) {
            await conection.rollback();
            throw error;
        } finally {
            conection.release();
        }
    },

    async completar(idVenta: number) {
        const conection = await conectar.getConnection();
        try {
            const result = await conection.query(`UPDATE venta SET estado = 'completado' WHERE idVenta = ? AND estado = 'pendiente'`, [idVenta]);
            return (result as any).affectedRows > 0;
        } finally {
            conection.release();
        }
    },

    async cambiarAPendiente(idVenta: number) {
        const conection = await conectar.getConnection();
        try {
            const result = await conection.query(`UPDATE venta SET estado = 'pendiente' WHERE idVenta = ? AND estado = 'completado'`, [idVenta]);
            return (result as any).affectedRows > 0;
        } finally {
            conection.release();
        }
    },

    async anular(idVenta: number, motivo?: string, idUsuario?: number) {
        const conection = await conectar.getConnection();
        await conection.beginTransaction();
        try {
            const check = await conection.query(`SELECT estado FROM venta WHERE idVenta = ?`, [idVenta]);
            if ((check as any[]).length === 0) throw new Error('La venta no existe.');
            if ((check as any[])[0].estado === 'cancelado') throw new Error('La venta ya se encuentra cancelada.');
            const detalles = await conection.query(`SELECT dv.idLote, dv.cantidad, l.idProducto FROM detalleventa dv INNER JOIN lote l ON l.idLote = dv.idLote WHERE dv.idVenta = ?`, [idVenta]);
            for (const d of detalles as any[]) {
                await conection.query(`UPDATE lote SET stock = stock + ? WHERE idLote = ?`, [d.cantidad, d.idLote]);
            }
            const prodAfectados = [...new Set((detalles as any[]).map((x:any)=>x.idProducto))];
            for (const pid of prodAfectados) {
                await conection.query(`UPDATE producto p SET stockTotal = (SELECT COALESCE(SUM(l.stock),0) FROM lote l WHERE l.idProducto = p.idProducto AND l.estado IN ('activo','pendiente')) WHERE p.idProducto = ?`, [pid]);
            }
            await conection.query(`UPDATE venta SET estado = 'cancelado', motivoCancelacion = ?, fechaCancelacion = NOW(), idUsuarioCancelacion = ? WHERE idVenta = ?`, [motivo || 'Venta anulada', idUsuario ?? null, idVenta]);
            await conection.query(`UPDATE recibo SET estado = 'anulado' WHERE idVenta = ?`, [idVenta]);
            await conection.commit();
            return true;
        } catch (error) {
            await conection.rollback();
            throw error;
        } finally {
            conection.release();
        }
    },

    async actualizar(idVenta: number, datos: IVentaInput) {
        const conection = await conectar.getConnection();
        await conection.beginTransaction();
        try {
            const check = await conection.query(`SELECT estado FROM venta WHERE idVenta = ?`, [idVenta]);
            if ((check as any[]).length === 0) throw new Error('La venta no existe.');
            if ((check as any[])[0].estado !== 'pendiente') throw new Error('Solo se pueden editar ventas en estado pendiente.');
            await conection.query(`UPDATE venta SET subtotal = ?, descuentoTotal = ?, total = ?, tipoPago = ?, observaciones = ?, idCliente = ?, idSucursal = ? WHERE idVenta = ?`, [datos.subtotal, datos.descuentoTotal, datos.total, datos.tipoPago || null, datos.observaciones || null, datos.idCliente, datos.idSucursal, idVenta]);
            const detallesActuales = await conection.query(`SELECT dv.idLote, dv.cantidad, l.idProducto FROM detalleventa dv INNER JOIN lote l ON l.idLote = dv.idLote WHERE dv.idVenta = ?`, [idVenta]);
            for (const d of detallesActuales as any[]) {
                await conection.query(`UPDATE lote SET stock = stock + ? WHERE idLote = ?`, [d.cantidad, d.idLote]);
            }
            const prodAfectados = [...new Set((detallesActuales as any[]).map((x:any)=>x.idProducto))];
            for (const pid of prodAfectados) {
                await conection.query(`UPDATE producto p SET stockTotal = (SELECT COALESCE(SUM(l.stock),0) FROM lote l WHERE l.idProducto = p.idProducto AND l.estado IN ('activo','pendiente')) WHERE p.idProducto = ?`, [pid]);
            }
            await conection.query(`DELETE FROM detalleventa WHERE idVenta = ?`, [idVenta]);
            for (const detalle of datos.detalles) {
                let cantidadRestante = Number(detalle.cantidad);
                if (cantidadRestante <= 0) throw new Error('La cantidad debe ser mayor a 0.');
                const lotesDisponibles = await conection.query(`SELECT idLote, stock, fechaVencimiento FROM lote WHERE idProducto = ? AND estado = 'activo' ORDER BY fechaVencimiento ASC, idLote ASC FOR UPDATE`, [detalle.idProducto]);
                if ((lotesDisponibles as any[]).length === 0) throw new Error(`No hay lotes activos disponibles para el producto #${detalle.idProducto}.`);
                let stockTotalDisponible = 0;
                for (const l of lotesDisponibles as any[]) stockTotalDisponible += Number(l.stock);
                if (stockTotalDisponible < cantidadRestante) throw new Error(`Stock insuficiente para el producto #${detalle.idProducto}. Disponible: ${stockTotalDisponible}, solicitado: ${cantidadRestante}.`);
                for (const lote of lotesDisponibles as any[]) {
                    if (cantidadRestante <= 0) break;
                    const stockLote = Number((lote as any).stock);
                    const aConsumir = Math.min(stockLote, cantidadRestante);
                    await conection.query(`UPDATE lote SET stock = stock - ? WHERE idLote = ?`, [aConsumir, (lote as any).idLote]);
                    const subtotalDetalle = (aConsumir * detalle.precioUnitario) - (detalle.descuento * (aConsumir / detalle.cantidad));
                    await conection.query(`INSERT INTO detalleventa (cantidad, precioUnitario, descuento, subtotal, idLote, idVenta) VALUES (?, ?, ?, ?, ?, ?)`, [aConsumir, detalle.precioUnitario, detalle.descuento * (aConsumir / detalle.cantidad), subtotalDetalle, (lote as any).idLote, idVenta]);
                    cantidadRestante -= aConsumir;
                }
                await conection.query(`UPDATE producto p SET stockTotal = (SELECT COALESCE(SUM(l.stock),0) FROM lote l WHERE l.idProducto = p.idProducto AND l.estado IN ('activo','pendiente')) WHERE p.idProducto = ?`, [detalle.idProducto]);
            }
            await conection.commit();
            return true;
        } catch (error) {
            await conection.rollback();
            throw error;
        } finally {
            conection.release();
        }
    },

    async emitirRecibo(idVenta: number) {
        const conection = await conectar.getConnection();
        await conection.beginTransaction();
        try {
            const check = await conection.query(`SELECT estado FROM venta WHERE idVenta = ?`, [idVenta]);
            if ((check as any[]).length === 0) throw new Error('La venta no existe.');
            if ((check as any[])[0].estado !== 'completado') throw new Error('Solo se puede emitir un recibo de una venta completada.');
            const reciboExistente = await conection.query(`SELECT idRecibo FROM recibo WHERE idVenta = ?`, [idVenta]);
            if ((reciboExistente as any[]).length > 0) throw new Error('Esta venta ya tiene un recibo emitido.');
            const consecutivoFilas = await conection.query(`SELECT MAX(CAST(SUBSTRING(numeroRecibo, 3) AS UNSIGNED)) AS maxNumero FROM recibo WHERE numeroRecibo REGEXP '^R-[0-9]+$'`);
            const siguienteNumero = Number((consecutivoFilas as any[])[0]?.maxNumero ?? 0) + 1;
            const numeroRecibo = `R-${String(siguienteNumero).padStart(6, '0')}`;
            const insertRecibo = await conection.query(`INSERT INTO recibo (numeroRecibo, idVenta) VALUES (?, ?)`, [numeroRecibo, idVenta]);
            await conection.commit();
            return { idRecibo: Number((insertRecibo as any).insertId), numeroRecibo };
        } catch (error) {
            await conection.rollback();
            throw error;
        } finally {
            conection.release();
        }
    },

    async VerificarStockLote(idLote: number, cantidad: number) {
        const conection = await conectar.getConnection();
        try {
            const rows = await conection.query(`SELECT stock, estado FROM lote WHERE idLote = ?`, [idLote]);
            const lote = (rows as any[])[0];
            if (!lote) return { disponible: false, stock: 0 };
            return { disponible: lote.estado === 'activo' && Number(lote.stock) >= cantidad, stock: Number(lote.stock ?? 0), estado: lote.estado };
        } finally {
            conection.release();
        }
    },

    async AlertaFEFO(idProducto: number, idLote: number) {
        const conection = await conectar.getConnection();
        try {
            const lotes = await conection.query(`SELECT idLote, codigo, numeroLote, stock, fechaVencimiento, estado, DATEDIFF(fechaVencimiento, CURDATE()) AS diasRestantes FROM lote WHERE idLote = ?`, [idLote]);
            const seleccionado = (lotes as any[])[0];
            if (!seleccionado) return { existe: false, cumpleFEFO: true, mensaje: '' };
            const fefo = await conection.query(`SELECT idLote, codigo, numeroLote, stock, fechaVencimiento, DATEDIFF(fechaVencimiento, CURDATE()) AS diasRestantes FROM lote WHERE idProducto = ? AND estado = 'activo' AND stock > 0 ORDER BY fechaVencimiento ASC, idLote ASC LIMIT 1`, [idProducto]);
            const loteFEFO = (fefo as any[])[0] ?? null;
            const diasSeleccionado = Number(seleccionado.diasRestantes ?? 0);
            const diasFEFO = loteFEFO ? Number(loteFEFO.diasRestantes ?? 0) : diasSeleccionado;
            const cumpleFEFO = !loteFEFO || Number(loteFEFO.idLote) === Number(seleccionado.idLote);
            const diasDiferencia = diasSeleccionado - diasFEFO;
            const mensaje = cumpleFEFO ? `El lote ${seleccionado.numeroLote} cumple FEFO.` : `ALERTA FEFO: lote ${seleccionado.numeroLote} vence en ${diasSeleccionado} días vs lote ${loteFEFO!.numeroLote} en ${diasFEFO} días.`;
            return { existe: true, cumpleFEFO, idLote: Number(seleccionado.idLote), codigo: seleccionado.codigo, numeroLote: seleccionado.numeroLote, stock: Number(seleccionado.stock ?? 0), fechaVencimiento: seleccionado.fechaVencimiento, diasRestantes: diasSeleccionado, idLoteFEFO: loteFEFO ? Number(loteFEFO.idLote) : null, numeroLoteFEFO: loteFEFO ? loteFEFO.numeroLote : null, fechaVencimientoFEFO: loteFEFO ? loteFEFO.fechaVencimiento : null, diasRestantesFEFO: diasFEFO, stockLoteFEFO: loteFEFO ? Number(loteFEFO.stock ?? 0) : 0, diasDiferencia, mensaje };
        } finally {
            conection.release();
        }
    },

    async LotesDisponiblesPorProducto(idProducto: number) {
        const conection = await conectar.getConnection();
        try {
            const lotes = await conection.query(`SELECT idLote, codigo, numeroLote, stock, fechaVencimiento, precioCompra, estado, DATEDIFF(fechaVencimiento, CURDATE()) AS diasRestantes FROM lote WHERE idProducto = ? AND estado = 'activo' AND stock > 0 ORDER BY fechaVencimiento ASC, idLote ASC`, [idProducto]);
            return (lotes as any[]).map((l:any)=>({ ...l, stock: Number(l.stock), diasRestantes: Number(l.diasRestantes ?? 0) }));
        } finally {
            conection.release();
        }
    },

    async ValidarFEFODetalles(detalles: { idLote: number; cantidad: number }[]) {
        if (!detalles || detalles.length === 0) return null;
        const idsLote = detalles.map((d) => Number(d.idLote)).filter((id) => id > 0);
        if (idsLote.length === 0) return null;
        const conection = await conectar.getConnection();
        try {
            const filas = await conection.query(`SELECT l.idLote, l.idProducto, l.codigo, l.numeroLote, l.stock, l.fechaVencimiento, DATEDIFF(l.fechaVencimiento, CURDATE()) AS diasRestantes FROM lote l WHERE l.idLote IN (${idsLote.map(() => '?').join(', ')})`, idsLote);
            const lotes = filas as any[];
            if (lotes.length === 0) return null;
            const idsProducto = [...new Set(lotes.map((l) => Number(l.idProducto)))];
            const fEFOPorProducto = new Map<number, any>();
            for (const idProducto of idsProducto) {
                const res = await conection.query(`SELECT idLote, codigo, numeroLote, stock, fechaVencimiento, DATEDIFF(fechaVencimiento, CURDATE()) AS diasRestantes FROM lote WHERE idProducto = ? AND estado = 'activo' AND stock > 0 ORDER BY fechaVencimiento ASC, idLote ASC LIMIT 1`, [idProducto]);
                const loteFEFO = (res as any[])[0];
                if (loteFEFO) fEFOPorProducto.set(idProducto, loteFEFO);
            }
            const asignadoPorLote = new Map<number, number>();
            detalles.forEach((d) => {
                const id = Number(d.idLote);
                asignadoPorLote.set(id, (asignadoPorLote.get(id) ?? 0) + Number(d.cantidad ?? 0));
            });
            for (const lote of lotes) {
                const loteFEFO = fEFOPorProducto.get(Number(lote.idProducto));
                if (!loteFEFO) continue;
                if (Number(loteFEFO.idLote) === Number(lote.idLote)) continue;
                const asignadoAlFEFO = asignadoPorLote.get(Number(loteFEFO.idLote)) ?? 0;
                const restanteFEFO = Number(loteFEFO.stock ?? 0) - asignadoAlFEFO;
                if (restanteFEFO <= 0) continue;
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
        } finally {
            conection.release();
        }
    },

    async estadisticas() {
        const conection = await conectar.getConnection();
        try {
            const porEstado = await conection.query(`SELECT estado, COUNT(*) as cantidad, COALESCE(SUM(total),0) as monto FROM venta GROUP BY estado`);
            const totalMes = await conection.query(`SELECT COALESCE(SUM(total),0) as total FROM venta WHERE MONTH(fechaCreacion)=MONTH(CURDATE()) AND YEAR(fechaCreacion)=YEAR(CURDATE()) AND estado='completado'`);
            const totalMesAnterior = await conection.query(`SELECT COALESCE(SUM(total),0) as total FROM venta WHERE MONTH(fechaCreacion)=MONTH(CURDATE() - INTERVAL 1 MONTH) AND YEAR(fechaCreacion)=YEAR(CURDATE() - INTERVAL 1 MONTH) AND estado='completado'`);
            const porSucursal = await conection.query(`SELECT s.nombre, COUNT(*) as cantidad, COALESCE(SUM(v.total),0) as monto FROM venta v INNER JOIN sucursal s ON s.idSucursal=v.idSucursal WHERE v.estado <> 'cancelado' GROUP BY s.idSucursal, s.nombre ORDER BY monto DESC`);
            const masVendidos = await conection.query(`SELECT pr.nombreComercial AS nombreGenerico, SUM(dv.cantidad) as unidadesVendidas, COALESCE(SUM(dv.subtotal),0) as monto FROM detalleventa dv INNER JOIN lote l ON l.idLote=dv.idLote INNER JOIN producto pr ON pr.idProducto=l.idProducto INNER JOIN venta v ON v.idVenta=dv.idVenta WHERE v.estado='completado' GROUP BY pr.idProducto, pr.nombreComercial ORDER BY unidadesVendidas DESC LIMIT 5`);
            return {
                porEstado: (porEstado as any[]).map((e: any) => ({
                    estado: e.estado,
                    cantidad: Number(e.cantidad ?? 0),
                    monto: Number(e.monto ?? 0),
                })),
                totalMes: Number((totalMes as any[])[0]?.total ?? 0),
                totalMesAnterior: Number((totalMesAnterior as any[])[0]?.total ?? 0),
                porSucursal: (porSucursal as any[]).map((s: any) => ({
                    nombre: s.nombre,
                    cantidad: Number(s.cantidad ?? 0),
                    monto: Number(s.monto ?? 0),
                })),
                masVendidos: (masVendidos as any[]).map((p: any) => ({
                    nombreGenerico: p.nombreGenerico,
                    unidadesVendidas: Number(p.unidadesVendidas ?? 0),
                    monto: Number(p.monto ?? 0),
                })),
            };
        } finally {
            conection.release();
        }
    }
};

export { DataVenta };
export default DataVenta;