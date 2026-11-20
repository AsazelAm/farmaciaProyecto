"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQL_RECALCULAR_STOCK_TOTAL = exports.CONDICION_LOTE_VENDIBLE = void 0;
exports.recalcularStockTotal = recalcularStockTotal;
exports.recalcularStockTotales = recalcularStockTotales;
// ═══════════════════════════════════════════════════════════════════════════
// DECISIÓN DE MODELO: `producto.stockTotal` = STOCK VENDIBLE REAL
// ---------------------------------------------------------------------------
// `producto.stockTotal` existe como columna, por lo que se mantiene como
// snapshot, pero SIEMPRE se recalcula con esta única regla:
//
//     SUM(lote.stock) donde lote.estado = 'activo'
//                      y lote.fechaVencimiento > CURDATE()
//
// Con esto el valor nunca incluye lotes vencidos (fechaVencimiento <= CURDATE),
// en cuarentena, devueltos, cancelados ni pendientes. Es la misma condición
// que usa el punto de venta para seleccionar lotes, de modo que
// `stockTotal` y el stock realmente dispensable no pueden divergir.
//
// Toda operación que modifique `lote.stock` o `lote.estado` debe llamar a
// `recalcularStockTotal` DENTRO de la misma transacción SQL.
// ═══════════════════════════════════════════════════════════════════════════
/** Condición SQL reutilizable: un lote es vendible solo si está activo y vigente. */
exports.CONDICION_LOTE_VENDIBLE = `l.estado = 'activo' AND l.fechaVencimiento > CURDATE()`;
/** UPDATE canónico del snapshot de stock vendible (alias `p` = producto). */
exports.SQL_RECALCULAR_STOCK_TOTAL = `
    UPDATE producto p
    SET stockTotal = (
        SELECT COALESCE(SUM(l.stock), 0)
        FROM lote l
        WHERE l.idProducto = p.idProducto
          AND l.estado = 'activo'
          AND l.fechaVencimiento > CURDATE()
    )
    WHERE p.idProducto = ?
`;
/** Recalcula el stock vendible de UN producto usando la conexión de la transacción. */
async function recalcularStockTotal(conn, idProducto) {
    await conn.query(exports.SQL_RECALCULAR_STOCK_TOTAL, [idProducto]);
}
/** Recalcula el stock vendible de VARIOS productos (ids únicos y válidos). */
async function recalcularStockTotales(conn, idsProducto) {
    const ids = [...new Set(idsProducto.filter((id) => Number.isInteger(id) && id > 0))];
    for (const id of ids) {
        await recalcularStockTotal(conn, id);
    }
}
//# sourceMappingURL=StockModels.js.map