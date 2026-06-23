"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const DataProducto = {
    // ── GET: lista todos los productos activos con datos de relaciones ─────────
    async GetProductoM() {
        const conection = await db_1.default.getConnection();
        const results = await conection.query(`
            SELECT 
                p.idProducto,
                p.codigoBarra,
                p.nombreGenerico,
                p.nombreComercial,
                p.concentracion,
                p.descripcion,
                p.precio,
                p.img,
                p.requiereReceta,
                p.fechaCreacion,
                p.fechaModificacion,
                p.contraindicaciones,
                p.viaAdministracion,
                p.stockMinimo,
                p.estado,
                p.idLaboratorio,
                p.idTipoProd,
                p.idPresentacion,
                l.nombre  AS nombreLaboratorio,
                tp.nombre AS nombreTipoProd,
                pr.nombre AS nombrePresentacion
            FROM producto p
            INNER JOIN laboratorio  l  ON p.idLaboratorio  = l.idLaboratorio
            INNER JOIN tipoproducto tp ON p.idTipoProd     = tp.idTipoProd
            INNER JOIN presentacion pr ON p.idPresentacion = pr.idPresentacion
            WHERE p.estado = 1
            ORDER BY p.fechaCreacion DESC;
        `);
        conection.release();
        return results;
    },
    // ── ADD: inserta un nuevo producto ────────────────────────────────────────
    async AddProductoM(prod) {
        const conection = await db_1.default.getConnection();
        const results = await conection.query(`
            INSERT INTO producto (
                codigoBarra, nombreGenerico, nombreComercial, concentracion,
                descripcion, precio, requiereReceta, contraindicaciones,
                viaAdministracion, stockMinimo, idLaboratorio, idTipoProd, idPresentacion
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);
        `, [
            prod.codigoBarra,
            prod.nombreGenerico,
            prod.nombreComercial || null,
            prod.concentracion || null,
            prod.descripcion || null,
            prod.precio,
            prod.requiereReceta,
            prod.contraindicaciones || null,
            prod.viaAdministracion || null,
            prod.stockMinimo,
            prod.idLaboratorio,
            prod.idTipoProd,
            prod.idPresentacion,
        ]);
        conection.release();
        return Number(results.insertId);
    },
    // ── UPDATE img: actualiza solo la ruta de imagen ──────────────────────────
    async UpdateImgProductoM(ruta, idProducto) {
        const conection = await db_1.default.getConnection();
        await conection.query(`
            UPDATE producto SET img = ? WHERE idProducto = ?;
        `, [ruta, idProducto]);
        conection.release();
        return 'Imagen de producto guardada correctamente';
    },
    // ── UPDATE: actualiza todos los campos del producto ───────────────────────
    async UpdateProductoM(prod, idProducto) {
        const conection = await db_1.default.getConnection();
        await conection.query(`
            UPDATE producto SET
                codigoBarra       = ?,
                nombreGenerico    = ?,
                nombreComercial   = ?,
                concentracion     = ?,
                descripcion       = ?,
                precio            = ?,
                requiereReceta    = ?,
                contraindicaciones = ?,
                viaAdministracion  = ?,
                stockMinimo       = ?,
                idLaboratorio     = ?,
                idTipoProd        = ?,
                idPresentacion    = ?
            WHERE idProducto = ? AND estado = 1;
        `, [
            prod.codigoBarra,
            prod.nombreGenerico,
            prod.nombreComercial || null,
            prod.concentracion || null,
            prod.descripcion || null,
            prod.precio,
            prod.requiereReceta,
            prod.contraindicaciones || null,
            prod.viaAdministracion || null,
            prod.stockMinimo,
            prod.idLaboratorio,
            prod.idTipoProd,
            prod.idPresentacion,
            idProducto,
        ]);
        conection.release();
        return 'Producto Actualizado';
    },
    // ── DELETE lógico: desactiva el producto ──────────────────────────────────
    async DeleteProductoM(idProducto) {
        const conection = await db_1.default.getConnection();
        await conection.query(`
            UPDATE producto SET estado = 0 WHERE idProducto = ?;
        `, [idProducto]);
        conection.release();
        return 'Producto Eliminado';
    },
    // ── Verificar código de barra único (CREATE) ──────────────────────────────
    async VerificarCodigoBarraM(codigoBarra) {
        const conection = await db_1.default.getConnection();
        const results = await conection.query(`
            SELECT COUNT(*) AS existe FROM producto WHERE codigoBarra = ? AND estado = 1;
        `, [codigoBarra]);
        const existe = Number(results[0].existe);
        conection.release();
        return existe;
    },
    // ── Verificar código de barra único (UPDATE, excluye el propio ID) ────────
    async VerificarCodigoBarraUpdateM(codigoBarra, idProducto) {
        const conection = await db_1.default.getConnection();
        const results = await conection.query(`
            SELECT COUNT(*) AS existe FROM producto
            WHERE codigoBarra = ? AND idProducto != ? AND estado = 1;
        `, [codigoBarra, idProducto]);
        const existe = Number(results[0].existe);
        conection.release();
        return existe;
    },
};
exports.default = DataProducto;
//# sourceMappingURL=ProductoModels.js.map