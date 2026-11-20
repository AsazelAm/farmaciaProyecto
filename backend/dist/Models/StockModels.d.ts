import type { PoolConnection } from 'mariadb';
/** Condición SQL reutilizable: un lote es vendible solo si está activo y vigente. */
export declare const CONDICION_LOTE_VENDIBLE = "l.estado = 'activo' AND l.fechaVencimiento > CURDATE()";
/** UPDATE canónico del snapshot de stock vendible (alias `p` = producto). */
export declare const SQL_RECALCULAR_STOCK_TOTAL = "\n    UPDATE producto p\n    SET stockTotal = (\n        SELECT COALESCE(SUM(l.stock), 0)\n        FROM lote l\n        WHERE l.idProducto = p.idProducto\n          AND l.estado = 'activo'\n          AND l.fechaVencimiento > CURDATE()\n    )\n    WHERE p.idProducto = ?\n";
/** Recalcula el stock vendible de UN producto usando la conexión de la transacción. */
export declare function recalcularStockTotal(conn: PoolConnection, idProducto: number): Promise<void>;
/** Recalcula el stock vendible de VARIOS productos (ids únicos y válidos). */
export declare function recalcularStockTotales(conn: PoolConnection, idsProducto: number[]): Promise<void>;
