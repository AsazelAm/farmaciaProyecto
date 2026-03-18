"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const DataExamen = {
    async GetExamen() {
        const Conexion = await db_1.default.getConnection();
        const Results = await Conexion.query(`SELECT * FROM examen where Estado = 1`);
        Conexion.release();
        return Results;
    },
    async VerifedCode(code) {
        const Conexion = await db_1.default.getConnection();
        const results = await Conexion.query(`
         SELECT COUNT(*) as existe FROM examen WHERE codigo = ? and Estado = 1;
            `, [code]);
        Conexion.release();
        const existeBigInt = results[0].existe;
        const existeNumber = Number(existeBigInt);
        ;
        return existeNumber;
    },
    async AddExamenModels(Exa, code, Cur) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
        INSERT INTO examen (Examen,codigo,Curso) VALUES (?,?,?)
            `, [Exa, code, Cur]);
        Conexion.release();
        return "Examen registrado";
    },
    async DeleteExamenModels(id) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE examen SET Estado = 0 where id_exa = ?  
        `, [id]);
        Conexion.release();
        return "Examen Eliminado";
    },
    async UpdateExamenModels(Examen, codigo, Curso, id_exa) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE examen SET 
            Examen = ?,
            codigo = ?,
            Curso = ?
            WHERE id_exa = ? AND Estado = 1;
            `, [Examen, codigo, Curso, id_exa]);
        Conexion.release();
        return "Datos Actualizados";
    }
};
exports.default = DataExamen;
//# sourceMappingURL=ExamenModels.js.map