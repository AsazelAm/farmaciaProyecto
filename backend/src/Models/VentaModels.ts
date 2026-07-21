import conectar from '../config/db';

// ─── Interfaces Internas (puedes moverlas a types/venta.types.ts luego) ──────
export interface IVentaFiltros {
    estado?: 'pendiente' | 'completada' | 'anulada';
    idCliente?: number;
    idUsuario?: number;
    idSucursal?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    pagina?: number;
    porPagina?: number;
}

export interface IDetalleVentaInput {
    idProducto: number;
    idLote: number;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
}

export interface IVentaInput {
    idCliente: number;
    idSucursal: number;
    tipoPago?: string;
    descuentoTotal: number;
    impuestos: number;
    subtotal: number;
    total: number;
    observaciones?: string;
    detalles: IDetalleVentaInput[];
}

export interface IFacturaInput {
    tipoFactura: string;
    nitCliente?: string;
    razonSocial?: string;
}

const DataVenta = {

    // ── GET: Listar ventas con filtros dinámicos y paginación ─────────────────
    async listar(filtros: IVentaFiltros) {
        const conection = await conectar.getConnection();

        let queryBase = `
            FROM venta v
            INNER JOIN cliente  cl ON cl.idCliente  = v.idCliente
            INNER JOIN usuario  u  ON u.idUsuario   = v.idUsuario
            INNER JOIN sucursal s  ON s.idSucursal  = v.idSucursal
            WHERE 1=1
        `;
        const queryParams: any[] = [];

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
        const countResult = await conection.query(
            `SELECT COUNT(*) as total ${queryBase}`,
            queryParams
        );
        const total = Number(countResult[0].total);

        // 2. Aplicar Paginación
        const pagina = filtros.pagina || 1;
        const porPagina = filtros.porPagina || 10;
        const offset = (pagina - 1) * porPagina;

        // 3. Consulta principal de datos
        const queryFinal = `
            SELECT 
                v.idVenta, v.fechaCreacion, v.subtotal, v.descuentoTotal,
                v.impuestos, v.total, v.estado, v.tipoPago,
                cl.nombre AS cliente,
                u.nombre  AS usuario,
                s.nombre  AS sucursal,
                (SELECT idFactura FROM factura f WHERE f.idVenta = v.idVenta LIMIT 1) AS idFactura,
                (SELECT COUNT(*) FROM detalleventa dv WHERE dv.idVenta = v.idVenta) AS totalItems
            ${queryBase}
            ORDER BY v.fechaCreacion DESC
            LIMIT ? OFFSET ?
        `;
        queryParams.push(porPagina, offset);

        const data = await conection.query(queryFinal, queryParams);
        conection.release();

        // MySQL2 devuelve COUNT(*) como BigInt → lo normalizamos a Number
        const dataNormalizada = (data as any[]).map((row: any) => ({
            ...row,
            totalItems: Number(row.totalItems ?? 0),
        }));

        return { data: dataNormalizada, total };
    },

    // ── GET: Obtener el detalle de una venta específica con sus productos ─────
    async obtenerPorId(idVenta: number) {
        const conection = await conectar.getConnection();

        // 1. Cabecera de la venta
        const ventas = await conection.query(`
            SELECT 
                v.idVenta, v.fechaCreacion, v.fechaModificaion, v.subtotal, v.descuentoTotal,
                v.impuestos, v.total, v.estado, v.tipoPago, v.observaciones,
                v.idCliente, v.idUsuario, v.idSucursal,
                cl.nombre AS cliente, cl.nit AS clienteNit, cl.telefono AS clienteTelefono,
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
                pr.idProducto, pr.codigoBarra, pr.nombreGenerico, pr.nombreComercial,
                pr.concentracion, pr.requiereReceta,
                lab.nombre AS nombreLaboratorio
            FROM detalleventa dv
            INNER JOIN lote        l   ON l.idLote        = dv.idLote
            INNER JOIN producto    pr  ON pr.idProducto   = dv.idProducto
            INNER JOIN laboratorio lab ON lab.idLaboratorio = pr.idLaboratorio
            WHERE dv.idVenta = ?
            ORDER BY dv.idProducto ASC;
        `, [idVenta]);

        // 3. Factura asociada (si ya fue emitida)
        const facturas = await conection.query(`
            SELECT idFactura, numeroFactura, fechaEmision, tipoFactura, 
                   nitCliente, razonSocial, estado, fechaAnulacion, motivoAnulacion
            FROM factura WHERE idVenta = ?
        `, [idVenta]);

        conection.release();

        // diasParaVencer llega como BigInt en algunos drivers de MySQL2 al usar
        // DATEDIFF; lo normalizamos a Number igual que en el módulo de compras.
        const detallesNormalizados = (detalles as any[]).map((d: any) => ({
            ...d,
            diasParaVencer: Number(d.diasParaVencer ?? 0),
        }));

        return {
            ...venta,
            detalles: detallesNormalizados,
            factura: (facturas as any[])[0] || null,
        };
    },

    // ── ADD: Crear una nueva venta (Transacción Completa) ─────────────────────
    async crear(datos: IVentaInput, idUsuario: number) {
        const conection = await conectar.getConnection();

        // Iniciamos la transacción para proteger los datos
        await conection.beginTransaction();

        try {
            // 1. Insertar Cabecera (Venta)
            const insertVenta = await conection.query(`
                INSERT INTO venta (
                    subtotal, descuentoTotal, impuestos, total, estado,
                    tipoPago, observaciones, idCliente, idUsuario, idSucursal
                ) VALUES (?, ?, ?, ?, 'pendiente', ?, ?, ?, ?, ?)
            `, [
                datos.subtotal,
                datos.descuentoTotal,
                datos.impuestos,
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

        } catch (error) {
            await conection.rollback();
            throw error;
        } finally {
            conection.release();
        }
    },

    // ── UPDATE: Confirmar/completar una venta pendiente ───────────────────────
    async completar(idVenta: number) {
        const conection = await conectar.getConnection();

        try {
            const result = await conection.query(`
                UPDATE venta SET estado = 'completada' WHERE idVenta = ? AND estado = 'pendiente'
            `, [idVenta]);
            return result.affectedRows > 0;
        } finally {
            conection.release();
        }
    },

    // ── UPDATE: Regresar una venta a pendiente ────────────────────────────────
    async cambiarAPendiente(idVenta: number) {
        const conection = await conectar.getConnection();
        try {
            const result = await conection.query(`
                UPDATE venta SET estado = 'pendiente' WHERE idVenta = ? AND estado = 'completada'
            `, [idVenta]);
            return result.affectedRows > 0;
        } finally {
            conection.release();
        }
    },

    // ── CANCEL: Anular una venta y devolver el stock a los lotes ──────────────
    async anular(idVenta: number, motivo?: string) {
        const conection = await conectar.getConnection();
        await conection.beginTransaction();

        try {
            // 1. Verificar que la venta exista y no esté ya anulada
            const check = await conection.query(`
                SELECT estado FROM venta WHERE idVenta = ?
            `, [idVenta]);

            if (check.length === 0) {
                throw new Error('La venta no existe.');
            }
            if (check[0].estado === 'anulada') {
                throw new Error('La venta ya se encuentra anulada.');
            }

            // 2. Regresar el stock vendido a cada lote
            const detalles = await conection.query(`
                SELECT idLote, cantidad FROM detalleventa WHERE idVenta = ?
            `, [idVenta]);

            for (const d of detalles as any[]) {
                await conection.query(`
                    UPDATE lote SET stock = stock + ? WHERE idLote = ?
                `, [d.cantidad, d.idLote]);
            }

            // 3. Marcar la venta como anulada
            await conection.query(`
                UPDATE venta SET estado = 'anulada' WHERE idVenta = ?
            `, [idVenta]);

            // 4. Si tiene factura emitida, anularla también
            await conection.query(`
                UPDATE factura SET 
                    estado = 'anulada', 
                    fechaAnulacion = NOW(), 
                    motivoAnulacion = ?
                WHERE idVenta = ?
            `, [motivo || 'Venta anulada', idVenta]);

            await conection.commit();
            return true;

        } catch (error) {
            await conection.rollback();
            throw error;
        } finally {
            conection.release();
        }
    },

    // ── UPDATE: Actualizar una venta pendiente (Cabecera y Detalles) ──────────
    async actualizar(idVenta: number, datos: IVentaInput) {
        const conection = await conectar.getConnection();
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
                    impuestos = ?,
                    total = ?,
                    tipoPago = ?,
                    observaciones = ?,
                    idCliente = ?,
                    idSucursal = ?
                WHERE idVenta = ?
            `, [
                datos.subtotal,
                datos.descuentoTotal,
                datos.impuestos,
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

            for (const d of detallesActuales as any[]) {
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

        } catch (error) {
            await conection.rollback();
            throw error;
        } finally {
            conection.release();
        }
    },

    // ── ADD: Emitir factura para una venta ya completada ──────────────────────
    async emitirFactura(idVenta: number, datosFactura: IFacturaInput) {
        const conection = await conectar.getConnection();
        await conection.beginTransaction();

        try {
            // 1. Verificar que la venta exista y esté completada
            const check = await conection.query(`
                SELECT total, estado FROM venta WHERE idVenta = ?
            `, [idVenta]);

            if (check.length === 0) {
                throw new Error('La venta no existe.');
            }
            if (check[0].estado !== 'completada') {
                throw new Error('Solo se puede facturar una venta completada.');
            }

            // 2. Verificar que no tenga ya una factura vigente
            const facturaExistente = await conection.query(`
                SELECT idFactura FROM factura WHERE idVenta = ? AND estado != 'anulada'
            `, [idVenta]);

            if (facturaExistente.length > 0) {
                throw new Error('Esta venta ya tiene una factura emitida.');
            }

            // 3. Generar el número de factura correlativo
            const ultimaFactura = await conection.query(`
                SELECT numeroFactura FROM factura ORDER BY idFactura DESC LIMIT 1
            `);
            const siguienteNumero = ultimaFactura.length > 0
                ? Number(ultimaFactura[0].numeroFactura) + 1
                : 1;
            const numeroFactura = String(siguienteNumero).padStart(7, '0');

            // 4. Insertar la factura
            const total = Number(check[0].total);
            const insertFactura = await conection.query(`
                INSERT INTO factura (
                    numeroFactura, tipoFactura, nitCliente, razonSocial,
                    subtotal, descuento, impuesto, total, estado, idVenta
                ) VALUES (?, ?, ?, ?, ?, 0, 0, ?, 'emitida', ?)
            `, [
                numeroFactura,
                datosFactura.tipoFactura,
                datosFactura.nitCliente || null,
                datosFactura.razonSocial || null,
                total,
                total,
                idVenta
            ]);

            await conection.commit();
            return Number(insertFactura.insertId);

        } catch (error) {
            await conection.rollback();
            throw error;
        } finally {
            conection.release();
        }
    },

    // ── DASHBOARD: Estadísticas Generales ─────────────────────────────────────
    async estadisticas() {
        const conection = await conectar.getConnection();

        try {
            const [porEstado, totalMes, totalMesAnterior, porSucursal, masVendidos] = await Promise.all([
                conection.query(`SELECT estado, COUNT(*) AS cantidad, SUM(total) AS monto FROM venta GROUP BY estado`),
                conection.query(`
                    SELECT IFNULL(SUM(total), 0) AS totalMes FROM venta 
                    WHERE MONTH(fechaCreacion) = MONTH(NOW()) 
                    AND YEAR(fechaCreacion) = YEAR(NOW()) 
                    AND estado = 'completada'
                `),
                conection.query(`
                    SELECT IFNULL(SUM(total), 0) AS totalMesAnterior FROM venta 
                    WHERE MONTH(fechaCreacion) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH)) 
                    AND YEAR(fechaCreacion) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH)) 
                    AND estado = 'completada'
                `),
                conection.query(`
                    SELECT s.nombre, COUNT(v.idVenta) AS cantidad, SUM(v.total) AS monto 
                    FROM venta v
                    INNER JOIN sucursal s ON s.idSucursal = v.idSucursal
                    WHERE v.estado = 'completada'
                    GROUP BY v.idSucursal
                    ORDER BY monto DESC LIMIT 5
                `),
                conection.query(`
                    SELECT pr.nombreGenerico, SUM(dv.cantidad) AS unidadesVendidas, SUM(dv.subtotal) AS monto
                    FROM detalleventa dv
                    INNER JOIN venta v ON v.idVenta = dv.idVenta
                    INNER JOIN producto pr ON pr.idProducto = dv.idProducto
                    WHERE v.estado = 'completada'
                    GROUP BY dv.idProducto
                    ORDER BY unidadesVendidas DESC LIMIT 5
                `)
            ]);

            return {
                porEstado: (porEstado as any[]).map((s: any) => ({
                    estado:   s.estado,
                    cantidad: Number(s.cantidad ?? 0),
                    monto:    Number(s.monto    ?? 0),
                })),
                totalMes:         Number((totalMes as any[])[0].totalMes),
                totalMesAnterior: Number((totalMesAnterior as any[])[0].totalMesAnterior),
                porSucursal: (porSucursal as any[]).map((s: any) => ({
                    nombre:   s.nombre,
                    cantidad: Number(s.cantidad ?? 0),
                    monto:    Number(s.monto    ?? 0),
                })),
                masVendidos: (masVendidos as any[]).map((p: any) => ({
                    nombreGenerico:    p.nombreGenerico,
                    unidadesVendidas:  Number(p.unidadesVendidas ?? 0),
                    monto:             Number(p.monto ?? 0),
                })),
            };
        } finally {
            conection.release();
        }
    },

    // ── UTILIDAD: Verificar stock disponible en un lote ───────────────────────
    async VerificarStockLote(idLote: number, cantidad: number): Promise<boolean> {
        const conection = await conectar.getConnection();
        const results = await conection.query(`
            SELECT stock FROM lote WHERE idLote = ? AND estado = 'activo';
        `, [idLote]);
        conection.release();
        if (results.length === 0) return false;
        return Number(results[0].stock) >= cantidad;
    },

    // ── UTILIDAD: Buscar lotes activos disponibles de un producto (FEFO) ──────
    // Ordenados por fecha de vencimiento ascendente: primero en expirar, primero en salir.
    async LotesDisponiblesPorProducto(idProducto: number) {
        const conection = await conectar.getConnection();
        const results = await conection.query(`
            SELECT idLote, numeroLote, codigo, stock, fechaVencimiento, precioCompra
            FROM lote 
            WHERE idProducto = ? AND estado = 'activo' AND stock > 0
            ORDER BY fechaVencimiento ASC
        `, [idProducto]);
        conection.release();
        return results;
    },
};

export default DataVenta;