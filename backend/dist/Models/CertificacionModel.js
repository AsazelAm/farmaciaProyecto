"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const DataCertificacion = {
    async AllCertification() {
        const conection = await db_1.default.getConnection();
        const results = await conection.query(`
            select
                id_cert,
                n_cert,
                opcion,
                nota,
                tipo 
            from certificacion 
            where Estado = 1;
            `);
        conection.release();
        return results;
    },
    async AddCerModal(n_cert, opcion, nota, tipo) {
        const conection = await db_1.default.getConnection();
        await conection.query(`
            INSERT INTO certificacion( n_cert, opcion, nota, tipo) VALUES (?,?,?,?);
            `, [n_cert, opcion, nota, tipo]);
        conection.release();
        return "Certificado registrado";
    },
    async DeleteCert(id) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE certificacion set Estado = 0 where id_cert = ? 
        `, [id]);
        Conexion.release();
        return 'Certificado Eliminado';
    },
    async UpdateCertiModels(n_cert, opcion, nota, tipo, id_cert) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE certificacion SET n_cert = ?, opcion = ?, nota = ?,
            tipo = ? WHERE id_cert = ? AND Estado = 1;
        `, [n_cert, opcion, nota, tipo, id_cert]);
        Conexion.release();
        return 'Certificado Actualizado';
    }
};
exports.default = DataCertificacion;
//# sourceMappingURL=CertificacionModel.js.map