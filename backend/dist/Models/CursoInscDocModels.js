"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const CursInsDocModels = {
    async GetCursDocAll(id_user) {
        const conection = await db_1.default.getConnection();
        const results = await conection.query(`
        SELECT 
            curs.id_curso,
            cal.id_calendario,
            curs.n_curso,
            curs.codigo,
            user.id_user,
            user.nombre 
        FROM 
            curso curs
        JOIN 
            calendario cal ON cal.curso = curs.id_curso
        JOIN 
            user ON user.id_user = cal.docente 
        WHERE 
            user.id_rol = 2 
        AND user.id_user=? 
        AND cal.Estado=1;
            `, [id_user]);
        conection.release();
        return results;
    },
    async GetAlumAsis(id_calendario) {
        const conection = await db_1.default.getConnection();
        const results = await conection.query(`
        SELECT 
            user.id_user,
            user.nombre,
            user.apellido,
            asis.id_asistencia,
            asis.fecha_asistencia,
            asis.asistencia,
            cal.id_calendario
        FROM user 
        JOIN curso_inscrito curins ON curins.id_user = user.id_user
        JOIN calendario cal ON cal.id_calendario = curins.id_calendario
        LEFT JOIN asistencia asis ON asis.id_users = user.id_user
            AND asis.id_calendario = cal.id_calendario
        WHERE 
            user.id_rol = 3 
            AND cal.id_calendario = ? 
            AND cal.Estado = 1
        ORDER BY user.apellido, user.nombre;
    `, [id_calendario]);
        conection.release();
        return results;
    },
    async AddAsistencia(fechas_asis, id_usuario, id_calendario) {
        const Conection = await db_1.default.getConnection();
        const results = await Conection.query(`
            INSERT INTO asistencia (asistencia,fecha_asistencia,id_users,id_calendario) VALUES
            ('Presente',?,?,?);
        `, [fechas_asis, id_usuario, id_calendario]);
        Conection.release();
        return Number(results.insertId);
    },
    async UpdateAsis(asistencia, fecha_asis, id_usuario, id_calendario, id_asist) {
        const Conection = await db_1.default.getConnection();
        await Conection.query(`
            UPDATE asistencia SET asistencia = ?, fecha_asistencia = ?
            WHERE id_users = ? AND id_calendario = ? AND id_asistencia = ?;   
        `, [asistencia, fecha_asis, id_usuario, id_calendario, id_asist]);
        Conection.release();
        return "Datos Actulizado ";
    },
    async UpdateFecha(fecha_anti, fecha_new, id_calen) {
        const Conection = await db_1.default.getConnection();
        await Conection.query(`
            UPDATE asistencia SET fecha_asistencia = ?
            WHERE fecha_asistencia = ? AND id_calendario = ?;    
        `, [fecha_new, fecha_anti, id_calen]);
        Conection.release();
        return "Fecha actualizado";
    },
    async GetNotasAlu(id_user, id_calendario) {
        const Conection = await db_1.default.getConnection();
        const results = await Conection.query(`
        SELECT id_nota, nota, id_user, id_calendario 
        FROM notas 
        WHERE id_user = ? AND id_calendario = ?
    `, [id_user, id_calendario]);
        Conection.release();
        return results;
    },
    async AddNotasAlum(nota, id_user, id_calendario) {
        const Conection = await db_1.default.getConnection();
        const results = await Conection.query(`
        INSERT INTO notas (nota, id_user, id_calendario) VALUES (?, ?, ?);
    `, [nota, id_user, id_calendario]);
        Conection.release();
        return Number(results.insertId);
    },
    async UpdateNotaAlum(nota, id_user, id_calendar, id_nota) {
        const Conection = await db_1.default.getConnection();
        await Conection.query(`
        UPDATE notas SET nota = ?  
        WHERE id_user = ? AND id_calendario = ? AND id_nota = ?
    `, [nota, id_user, id_calendar, id_nota]);
        Conection.release();
        return "Nota Actualizado";
    }
};
exports.default = CursInsDocModels;
//# sourceMappingURL=CursoInscDocModels.js.map