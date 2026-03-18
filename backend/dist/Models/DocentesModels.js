"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const DataDocentes = {
    // GET - Obtener todos los docentes
    async GetDocentes() {
        const conection = await db_1.default.getConnection();
        const results = await conection.query(`
            SELECT 
                id_user, 
                nombre, 
                apellido, 
                formacion,
                telefono,
                Email,
                img,
                cv,
                Cvlink,
                descripcion,
                honorarios
            FROM user 
            WHERE id_rol = 2 AND Estado = 1
        `);
        conection.release();
        return results;
    },
    // GET - Obtener docente por ID
    async GetDocenteById(id) {
        const Conexion = await db_1.default.getConnection();
        const Results = await Conexion.query(`
            SELECT 
                id_user, 
                nombre, 
                apellido, 
                telefono,
                Cvlink,
                formacion,
                descripcion,
                honorarios,
                Email,
                img,
                cv
            FROM user 
            WHERE id_user = ? AND id_rol = 2 AND Estado = 1
        `, [id]);
        Conexion.release();
        return Results.length > 0 ? Results[0] : null;
    },
    // Verificar si email existe (para crear)
    async Verificar(email) {
        const Conexion = await db_1.default.getConnection();
        const Results = await Conexion.query(`
            SELECT COUNT(*) AS existe 
            FROM user 
            WHERE Email = ? AND Estado = 1
        `, [email]);
        const existeBigInt = Results[0].existe;
        const existeNumber = Number(existeBigInt);
        Conexion.release();
        return existeNumber;
    },
    // Verificar si email existe excluyendo un ID (para actualizar)
    async VerificarEmailUpdate(email, id) {
        const Conexion = await db_1.default.getConnection();
        const Results = await Conexion.query(`
            SELECT COUNT(*) AS existe 
            FROM user 
            WHERE Email = ? AND id_user != ? AND Estado = 1
        `, [email, id]);
        const existeBigInt = Results[0].existe;
        const existeNumber = Number(existeBigInt);
        Conexion.release();
        return existeNumber;
    },
    // GET - Obtener habilidades de un docente
    async Gethabilidades(id) {
        const Conexion = await db_1.default.getConnection();
        const Results = await Conexion.query(`
            SELECT
                dochabi.id_dochabi,
                dochabi.id_habi,
                habilidades.n_habilidad
            FROM dochabi
            JOIN habilidades ON dochabi.id_habi = habilidades.id_habi 
            WHERE dochabi.id_user = ? AND dochabi.Estado = 1
        `, [id]);
        Conexion.release();
        return Results;
    },
    // POST - Crear docente
    async AddDocenteModels(data) {
        const Conexion = await db_1.default.getConnection();
        const result = await Conexion.query(`
            INSERT INTO user(id_rol, nombre, apellido, telefono, Cvlink, formacion, descripcion, honorarios, Email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
            2,
            data.nombre,
            data.apellido,
            data.celular,
            data.url,
            data.formacion,
            data.descripcion,
            data.honorarios,
            data.Email
        ]);
        Conexion.release();
        return Number(result.insertId);
    },
    // PUT - Actualizar docente
    async UpdateDocenteModels(id, data) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE user 
            SET 
                nombre = ?,
                apellido = ?,
                telefono = ?,
                Cvlink = ?,
                formacion = ?,
                descripcion = ?,
                honorarios = ?,
                Email = ?
            WHERE id_user = ?
            `, [
            data.nombre,
            data.apellido,
            data.celular,
            data.url,
            data.formacion,
            data.descripcion,
            data.honorarios,
            data.Email,
            id
        ]);
        Conexion.release();
    },
    // Agregar relación docente-habilidad
    async addDochabi(idUser, idHabi) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            INSERT INTO dochabi(id_user, id_Habi) 
            VALUES(?, ?)
        `, [idUser, idHabi]);
        Conexion.release();
    },
    // Eliminar habilidades de un docente (soft delete)
    async DeleteDochabi(idUser) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE dochabi 
            SET Estado = 0 
            WHERE id_user = ?
        `, [idUser]);
        Conexion.release();
    },
    // Actualizar ruta de imagen
    async UpdateRutaimg(ruta, id) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE user 
            SET img = ? 
            WHERE id_user = ?
        `, [ruta, id]);
        Conexion.release();
    },
    // Actualizar ruta de CV
    async UpdateCvRuta(ruta, id) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE user 
            SET cv = ? 
            WHERE id_user = ?
        `, [ruta, id]);
        Conexion.release();
    },
    // DELETE - Eliminar docente (soft delete)
    async DeleteDocentes(id) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE user 
            SET Estado = 0 
            WHERE id_user = ?
        `, [id]);
        Conexion.release();
        return 'Docente eliminado exitosamente';
    }
};
exports.default = DataDocentes;
//# sourceMappingURL=DocentesModels.js.map