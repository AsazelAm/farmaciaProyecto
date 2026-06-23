"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const DataLabora = {
    async GetLaboraM() {
        const Conexion = await db_1.default.getConnection();
        const results = await Conexion.query(`SELECT idLaboratorio,nombre,img,fechaCreacion FROM laboratorio WHERE estado = 1;`);
        Conexion.release();
        return results;
    },
    async AddLaboraM(nombre) {
        const Conexion = await db_1.default.getConnection();
        const results = await Conexion.query(`INSERT INTO laboratorio(nombre) VALUE(?);`, [nombre]);
        Conexion.release();
        return Number(results.insertId);
    },
    async UpdateRutaimg(ruta, idLaboratorio) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE laboratorio SET
            img = ?
            WHERE idLaboratorio = ?
            `, [ruta, idLaboratorio]);
        Conexion.release();
        return "Imagen Guardado correctamente";
    },
    async UpdateLabM(id_lab, nombre) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE laboratorio SET
            nombre = ?
            WHERE idLaboratorio = ? AND estado = 1;
            `, [nombre, id_lab]);
        Conexion.release();
        return "Laboratorio Actualizado";
    },
    async DeleteLabM(idLaboratorio) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE laboratorio SET estado = 0 WHERE idLaboratorio = ?;`, [idLaboratorio]);
        Conexion.release();
        return "Laboratorio Eliminado";
    },
    async VerificarNombreM(nombre) {
        const Conecion = await db_1.default.getConnection();
        try {
            const [rows] = await Conecion.query(`SELECT nombre FROM laboratorio WHERE nombre = ?`, [nombre]);
            if (rows) {
                return { exists: true, message: "El Laboratorio ya esta registrado" };
            }
            return { exists: false };
        }
        catch (error) {
            console.error("Error al consultar el nombre:", error);
            throw new Error("Error al verificar el nombre");
        }
        finally {
            Conecion.release();
        }
    },
    async VerificarUpdateNombreM(nombre, idLaboratorio) {
        const Conexion = await db_1.default.getConnection();
        const results = await Conexion.query(`
            SELECT COUNT(*) AS existe FROM laboratorio WHERE nombre = ? AND idLaboratorio != ? AND estado = 1;`, [nombre, idLaboratorio]);
        const existeNomb = results[0].existe;
        const exisNomb = Number(existeNomb);
        Conexion.release();
        return exisNomb;
    }
};
exports.default = DataLabora;
//# sourceMappingURL=LaboraModels.js.map