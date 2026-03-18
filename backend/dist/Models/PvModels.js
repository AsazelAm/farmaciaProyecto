"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
;
const DataPv = {
    async PvAll() {
        const conection = await db_1.default.getConnection();
        const results = await conection.query(`
          SELECT id_pv, nombre, identificador,status from propuesta_valor WHERE Estado = 1;
            `);
        conection.release();
        return results;
    },
    async AddPv(name, identificador) {
        const Conexion = await db_1.default.getConnection();
        const result = await Conexion.query(`
            INSERT INTO  propuesta_valor (nombre,identificador) VALUES (?,?);  
        `, [name, identificador]);
        Conexion.release();
        return Number(result.insertId);
    },
    async UpdateImgAddpv(ruta, id) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE propuesta_valor set logo = ? where id_pv = ?; 
        `, [ruta, id]);
        Conexion.release();
    },
    async UpdatebannerAddpv(ruta, id) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE propuesta_valor set imgbanner = ? where id_pv = ?; 
        `, [ruta, id]);
        Conexion.release();
    },
    async UpdatemodalAddpv(ruta, id) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE propuesta_valor set imglogoModal = ? where id_pv = ?; 
        `, [ruta, id]);
        Conexion.release();
    },
    async UpdateCuadroAddpv(ruta, id) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE propuesta_valor set imgCuadro = ? where id_pv = ?; 
        `, [ruta, id]);
        Conexion.release();
    },
    async DeletePv(id) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE propuesta_valor set Estado = 0 where id_pv = ?    
        `, [id]);
        Conexion.release();
        return "Propuesta de Valor Eliminado ";
    },
    async UpdatePvModels(nombre, identificador, id) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
        UPDATE propuesta_valor 
        SET nombre = ?, identificador = ? 
        WHERE id_pv = ?; 
    `, [nombre, identificador, id]);
        Conexion.release();
        return "Propuesta de Valor Actualizada";
    },
    async UpdatePvEstaModels(status, id) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
                UPDATE propuesta_valor SET Status = ?
                WHERE id_pv=?;
        `, [status, id]);
        Conexion.release();
        return "Estado Actualizado ";
    },
    async PvCalendario() {
        const conection = await db_1.default.getConnection();
        const results = await conection.query(`
          SELECT id_pv, nombre FROM propuesta_valor WHERE Estado = 1
            `);
        conection.release();
        return results;
    },
};
exports.default = DataPv;
//# sourceMappingURL=PvModels.js.map