"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const DataTipoProd = {
    async GetTipoProdM() {
        const Conexion = await db_1.default.getConnection();
        const results = await Conexion.query(`SELECT idTipoProd,nombre,fechaCreacion FROM tipoproducto WHERE estado = 1;`);
        Conexion.release();
        return results;
    },
    async AddTipoProdM(nombre) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`INSERT INTO tipoproducto(nombre) VALUE (?);`, [
            nombre,
        ]);
        Conexion.release();
        return "Tipo de Producto Registrado";
    },
    async UpdateTipoProdM(nombre, idTipoProd) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE tipoproducto SET
            nombre = ?
            WHERE estado = 1 AND idTipoProd = ?;`, [nombre, idTipoProd]);
        Conexion.release();
        return "Tipo de Producto Actualizado";
    },
    async DeleteTipoProdM(idTipoProd) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`UPDATE tipoproducto SET estado = 0 WHERE idTipoProd = ?;`, [idTipoProd]);
        Conexion.release();
        return "Tipo Producto Eliminado";
    }
};
exports.default = DataTipoProd;
//# sourceMappingURL=TipoProdModels.js.map