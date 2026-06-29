import conectar from '../config/db';

// ─── Interfaces Internas (puedes moverlas a types/compra.types.ts luego) ─────
export interface ICompraFiltros {
    estado?: 'pendiente' | 'completado' | 'cancelado';
    idProveedor?: number;
    idSucursal?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    pagina?: number;
    porPagina?: number;
}

export interface ILoteInput {
    idProducto: number;
    codigo: string;
    numeroLote: string;
    stock: number;
    precioCompra: number;
    descuento: number;
    fechaVencimiento: string;
    fechaFabricacion?: string | null;
}

export interface ICompraInput {
    numeroFactura?: string;
    idProveedor: number;
    idSucursal: number;
    fechaEntrega?: string;
    descuento: number;
    impuesto: number;
    subtotal: number;
    total: number;
    observaciones?: string;
    lotes: ILoteInput[];
}

const DataCompra = {

    // ── GET: Listar compras con filtros dinámicos y paginación ────────────────
    async listar(filtros: ICompraFiltros) {
        const conection = await conectar.getConnection();
        
        let queryBase = `
            FROM compra c
            INNER JOIN proveedor p ON p.idProveedor = c.idProveedor
            INNER JOIN usuario   u ON u.idUsuario   = c.idUsuario
            INNER JOIN sucursal  s ON s.idSucursal  = c.idSucursal
            WHERE 1=1
        `;
        const queryParams: any[] = [];

        // Filtros dinámicos
        if (filtros.estado) {
            queryBase += ` AND c.estado = ?`;
            queryParams.push(filtros.estado);
        }
        if (filtros.idProveedor) {
            queryBase += ` AND c.idProveedor = ?`;
            queryParams.push(filtros.idProveedor);
        }
        if (filtros.idSucursal) {
            queryBase += ` AND c.idSucursal = ?`;
            queryParams.push(filtros.idSucursal);
        }
        if (filtros.fechaDesde) {
            queryBase += ` AND DATE(c.fechaCreacion) >= ?`;
            queryParams.push(filtros.fechaDesde);
        }
        if (filtros.fechaHasta) {
            queryBase += ` AND DATE(c.fechaCreacion) <= ?`;
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
                c.idCompra, c.numeroFactura, c.fechaCreacion, c.fechaEntrega,
                c.subtotal, c.descuento, c.impuesto, c.total, c.estado,
                p.nombre  AS proveedor,
                u.nombre  AS usuario,
                s.nombre  AS sucursal,
                (SELECT COUNT(*) FROM detallecompra dc WHERE dc.idCompra = c.idCompra) AS totalLotes
            ${queryBase}
            ORDER BY c.fechaCreacion DESC
            LIMIT ? OFFSET ?
        `;
        queryParams.push(porPagina, offset);

        const data = await conection.query(queryFinal, queryParams);
        conection.release();

        // MySQL2 devuelve COUNT(*) como BigInt → lo normalizamos a Number
        const dataNormalizada = (data as any[]).map((row: any) => ({
            ...row,
            totalLotes: Number(row.totalLotes ?? 0),
        }));

        return { data: dataNormalizada, total };
    },

    // ── GET: Obtener el detalle de una compra específica con sus lotes ────────
    async obtenerPorId(idCompra: number) {
        const conection = await conectar.getConnection();
        
        // 1. Cabecera de la compra
        const compras = await conection.query(`
            SELECT 
                c.*, p.nombre AS proveedor, u.nombre AS usuario, s.nombre AS sucursal
            FROM compra c
            INNER JOIN proveedor p ON p.idProveedor = c.idProveedor
            INNER JOIN usuario   u ON u.idUsuario   = c.idUsuario
            INNER JOIN sucursal  s ON s.idSucursal  = c.idSucursal
            WHERE c.idCompra = ?
        `, [idCompra]);

        if (compras.length === 0) {
            conection.release();
            return null;
        }

        const compra = compras[0];

        // 2. Detalles (lotes y productos asociados)
        const detalles = await conection.query(`
            SELECT 
                dc.cantidad, dc.precioUnitario,
                dc.descuento, dc.subtotal, dc.estado as estadoDetalle,
                l.idLote, l.numeroLote, l.codigo, l.fechaVencimiento, 
                l.stock, l.precioCompra, l.estado as estadoLote,
                pr.nombreGenerico, pr.nombreComercial
            FROM detallecompra dc
            INNER JOIN lote     l  ON l.idLote      = dc.idLote
            INNER JOIN producto pr ON pr.idProducto = l.idProducto
            WHERE dc.idCompra = ?
            ORDER BY l.idLote ASC;
        `, [idCompra]);

        conection.release();
        return { ...compra, detalles };
    },

    // ── ADD: Crear una nueva compra (Transacción Completa) ────────────────────
    async crear(datos: ICompraInput, idUsuario: number) {
        const conection = await conectar.getConnection();
        
        // Iniciamos la transacción para proteger los datos
        await conection.beginTransaction();

        try {
            // 1. Insertar Cabecera (Compra)
            const insertCompra = await conection.query(`
                INSERT INTO compra (
                    numeroFactura, fechaEntrega, subtotal, descuento, 
                    impuesto, total, estado, observaciones, 
                    idProveedor, idUsuario, idSucursal
                ) VALUES (?, ?, ?, ?, ?, ?, 'pendiente', ?, ?, ?, ?)
            `, [
                datos.numeroFactura || null,
                datos.fechaEntrega || null,
                datos.subtotal,
                datos.descuento,
                datos.impuesto,
                datos.total,
                datos.observaciones || null,
                datos.idProveedor,
                idUsuario,
                datos.idSucursal
            ]);

            const idCompra = Number(insertCompra.insertId);

            // 2. Insertar Lotes y Detalles
            for (const lote of datos.lotes) {
                // a) Insertar Lote (estado 'pendiente' por defecto)
                const insertLote = await conection.query(`
                    INSERT INTO lote (
                        codigo, numeroLote, stock, fechaVencimiento, 
                        precioCompra, fechaFabricacion, estado, 
                        idProducto, idProveedor
                    ) VALUES (?, ?, ?, ?, ?, ?, 'pendiente', ?, ?)
                `, [
                    lote.codigo,
                    lote.numeroLote,
                    lote.stock,
                    lote.fechaVencimiento,
                    lote.precioCompra,
                    lote.fechaFabricacion || null,
                    lote.idProducto,
                    datos.idProveedor
                ]);

                const idLote = Number(insertLote.insertId);

                // b) Insertar DetalleCompra
                const subtotalLote = (lote.stock * lote.precioCompra) - lote.descuento;

                await conection.query(`
                    INSERT INTO detallecompra (
                        cantidad, precioUnitario, descuento, subtotal, estado, idLote, idCompra
                    ) VALUES (?, ?, ?, ?, 'activo', ?, ?)
                `, [
                    lote.stock,
                    lote.precioCompra,
                    lote.descuento,
                    subtotalLote,
                    idLote,
                    idCompra
                ]);
            }

            // Confirmamos toda la transacción
            await conection.commit();
            return idCompra;

        } catch (error) {
            await conection.rollback();
            throw error;
        } finally {
            conection.release();
        }
    },

    // ── UPDATE: Pasar a "Completado" e ingresar stock ─────────────────────────
    async completar(idCompra: number) {
        const conection = await conectar.getConnection();
        await conection.beginTransaction();

        try {
            await conection.query(`
                UPDATE compra SET estado = 'completado' WHERE idCompra = ? AND estado = 'pendiente'
            `, [idCompra]);

            await conection.query(`
                UPDATE lote SET 
                    estado = 'activo', 
                    fechaIngreso = NOW()
                WHERE idLote IN (
                    SELECT idLote FROM detallecompra WHERE idCompra = ?
                )
            `, [idCompra]);

            await conection.commit();
            return true;
        } catch (error) {
            await conection.rollback();
            throw error;
        } finally {
            conection.release();
        }
    },

    // ── CANCEL: Cancelar una compra pendiente ─────────────────────────────────
    async cancelar(idCompra: number) {
        const conection = await conectar.getConnection();
        await conection.beginTransaction();

        try {
            await conection.query(`
                UPDATE compra SET estado = 'cancelado' WHERE idCompra = ? AND estado = 'pendiente'
            `, [idCompra]);

            await conection.query(`
                UPDATE detallecompra SET estado = 'anulado' WHERE idCompra = ?
            `, [idCompra]);

            await conection.query(`
                UPDATE lote SET estado = 'cancelado' 
                WHERE idLote IN (SELECT idLote FROM detallecompra WHERE idCompra = ?)
            `, [idCompra]);

            await conection.commit();
            return true;
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
            const [porEstado, totalMes, totalMesAnterior, porProveedor, lotesVencer] = await Promise.all([
                conection.query(`SELECT estado, COUNT(*) AS cantidad, SUM(total) AS monto FROM compra GROUP BY estado`),
                conection.query(`
                    SELECT IFNULL(SUM(total), 0) AS totalMes FROM compra 
                    WHERE MONTH(fechaCreacion) = MONTH(NOW()) 
                    AND YEAR(fechaCreacion) = YEAR(NOW()) 
                    AND estado = 'completado'
                `),
                conection.query(`
                    SELECT IFNULL(SUM(total), 0) AS totalMesAnterior FROM compra 
                    WHERE MONTH(fechaCreacion) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH)) 
                    AND YEAR(fechaCreacion) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH)) 
                    AND estado = 'completado'
                `),
                conection.query(`
                    SELECT p.nombre, COUNT(c.idCompra) AS cantidad, SUM(c.total) AS monto 
                    FROM compra c
                    INNER JOIN proveedor p ON p.idProveedor = c.idProveedor
                    WHERE c.estado = 'completado'
                    GROUP BY p.idProveedor
                    ORDER BY monto DESC LIMIT 5
                `),
                conection.query(`
                    SELECT COUNT(*) AS lotesProximosVencer FROM lote 
                    WHERE fechaVencimiento <= DATE_ADD(NOW(), INTERVAL 30 DAY) 
                    AND estado = 'activo'
                `)
            ]);

            return {
                porEstado: (porEstado as any[]).map((s: any) => ({
                    estado:   s.estado,
                    cantidad: Number(s.cantidad ?? 0),
                    monto:    Number(s.monto    ?? 0),
                })),
                totalMes:          Number((totalMes as any[])[0].totalMes),
                totalMesAnterior:  Number((totalMesAnterior as any[])[0].totalMesAnterior),
                porProveedor: (porProveedor as any[]).map((p: any) => ({
                    nombre:   p.nombre,
                    cantidad: Number(p.cantidad ?? 0),
                    monto:    Number(p.monto    ?? 0),
                })),
                lotesProximosVencer: Number((lotesVencer as any[])[0].lotesProximosVencer),
            };
        } finally {
            conection.release();
        }
    },

    // ── UTILIDAD: Verificar si factura existe (CREATE) ────────────────────────
    async VerificarNumeroFactura(numeroFactura: string): Promise<number> {
        const conection = await conectar.getConnection();
        const results = await conection.query(`
            SELECT COUNT(*) AS existe FROM compra WHERE numeroFactura = ? AND estado != 'cancelado';
        `, [numeroFactura]);
        conection.release();
        return Number(results[0].existe);
    },

    // ── UTILIDAD: Verificar código de lote único ──────────────────────────────
    async VerificarCodigoLote(codigo: string): Promise<number> {
        const conection = await conectar.getConnection();
        const results = await conection.query(`
            SELECT COUNT(*) AS existe FROM lote WHERE codigo = ?;
        `, [codigo]);
        conection.release();
        return Number(results[0].existe);
    },

    // ── UPDATE: Actualizar una compra pendiente (Cabecera y Lotes) ──────────────
    async actualizar(idCompra: number, datos: ICompraInput) {
        const conection = await conectar.getConnection();
        
        // Iniciamos transacción porque haremos múltiples operaciones destructivas y creativas
        await conection.beginTransaction();

        try {
            // 1. Verificar que la compra exista y esté ESTRICTAMENTE en estado 'pendiente'
            const check = await conection.query(`
                SELECT estado FROM compra WHERE idCompra = ?
            `, [idCompra]);

            if (check.length === 0) {
                throw new Error('La compra no existe.');
            }
            if (check[0].estado !== 'pendiente') {
                throw new Error('Solo se pueden editar compras en estado pendiente. Si ya está completada, debes anularla.');
            }

            // 2. Actualizar la cabecera de la compra
            await conection.query(`
                UPDATE compra SET
                    numeroFactura = ?,
                    fechaEntrega = ?,
                    subtotal = ?,
                    descuento = ?,
                    impuesto = ?,
                    total = ?,
                    observaciones = ?,
                    idProveedor = ?,
                    idSucursal = ?
                WHERE idCompra = ?
            `, [
                datos.numeroFactura || null,
                datos.fechaEntrega || null,
                datos.subtotal,
                datos.descuento,
                datos.impuesto,
                datos.total,
                datos.observaciones || null,
                datos.idProveedor,
                datos.idSucursal,
                idCompra
            ]);

            // 3. Manejo de Detalles y Lotes (Eliminación lógica/física de borradores)
            // a) Obtener los IDs de los lotes actuales
            const lotesActuales = await conection.query(`
                SELECT idLote FROM detallecompra WHERE idCompra = ?
            `, [idCompra]);

            // b) Eliminar los detalles de la compra
            await conection.query(`DELETE FROM detallecompra WHERE idCompra = ?`, [idCompra]);

            // c) Eliminar los lotes físicos antiguos (como estaban pendientes, no rompen el inventario)
            if (lotesActuales.length > 0) {
                const idsLotes = lotesActuales.map((l: any) => Number(l.idLote));
                const placeholders = idsLotes.map(() => '?').join(',');
                
                await conection.query(`
                    DELETE FROM lote WHERE idLote IN (${placeholders})
                `, idsLotes);
            }

            // 4. Insertar los nuevos lotes y detalles actualizados (igual que en crear)
            for (const lote of datos.lotes) {
                const insertLote = await conection.query(`
                    INSERT INTO lote (
                        codigo, numeroLote, stock, fechaVencimiento, 
                        precioCompra, fechaFabricacion, estado, 
                        idProducto, idProveedor
                    ) VALUES (?, ?, ?, ?, ?, ?, 'pendiente', ?, ?)
                `, [
                    lote.codigo,
                    lote.numeroLote,
                    lote.stock,
                    lote.fechaVencimiento,
                    lote.precioCompra,
                    lote.fechaFabricacion || null,
                    lote.idProducto,
                    datos.idProveedor
                ]);

                const idLote = Number(insertLote.insertId);
                const subtotalLote = (lote.stock * lote.precioCompra) - lote.descuento;

                await conection.query(`
                    INSERT INTO detallecompra (
                        cantidad, precioUnitario, descuento, subtotal, estado, idLote, idCompra
                    ) VALUES (?, ?, ?, ?, 'activo', ?, ?)
                `, [
                    lote.stock,
                    lote.precioCompra,
                    lote.descuento,
                    subtotalLote,
                    idLote,
                    idCompra
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
};

export default DataCompra;