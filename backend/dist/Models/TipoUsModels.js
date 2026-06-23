"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const DataTipoUs = {
    async GetTipoUsM() {
        const Conexion = await db_1.default.getConnection();
        const results = await Conexion.query(`
            SELECT idTipoUs,nameRol, fechaCreacion
            FROM tipoUs WHERE estado = 1;`);
        Conexion.release();
        return results;
    },
    async AddTipoUsM(nameRol) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`INSERT INTO tipoUs(nameRol) VALUES(?);`, [nameRol]);
        Conexion.release();
        return "Rol agregado exitosamente";
    },
    async UpdateTipoUsM(nameRol, idTipoUs) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE tipoUs SET
            nameRol = ?
            WHERE idTipoUs = ? AND estado = 1`, [nameRol, idTipoUs]);
        Conexion.release();
        return "Rol actulizado Correctamente";
    },
    async DeleteTipoUsM(idTipoUs) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE tipoUs SET estado = 0 WHERE idTipoUs = ?;`, [idTipoUs]);
        Conexion.release();
        return "Rol Eliminado exitosamente ";
    }
};
exports.default = DataTipoUs;
//# sourceMappingURL=TipoUsModels.js.map