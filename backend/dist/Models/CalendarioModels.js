"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
;
const DataCalendario = {
    async GetViewAreasModels(id) {
        const cx = await db_1.default.getConnection();
        const Results = cx.query(`
            	SELECT  
                    ViewCursoAreas.id_vca,
                    ViewCursoAreas.id_calendario,
                    ViewCursoAreas.id_areas,
                    ViewCursoAreas.id_curso,
                    areas.n_area
                FROM ViewCursoAreas 
                JOIN areas ON ViewCursoAreas.id_areas = areas.id_areas
                WHERE id_calendario = ?;   
        `, [id]);
        cx.release();
        return Results;
    },
    async GetViewProModels(id) {
        const cx = await db_1.default.getConnection();
        const Results = cx.query(`
       	    	SELECT 
                    ViewCursoPro.id_vcp, 
                    ViewCursoPro.id_calendario, 
                    ViewCursoPro.id_pv,
                    ViewCursoPro.id_curso,
                    propuesta_valor.nombre 
                FROM ViewCursoPro 
                    JOIN propuesta_valor ON ViewCursoPro.id_pv = propuesta_valor.id_pv 
                WHERE id_calendario = ?;
        `, [id]);
        cx.release();
        return Results;
    },
    async UpdateCalendarioMain(data) {
        const cx = await db_1.default.getConnection();
        await cx.query(`
            UPDATE calendario set
                Horaini = ?,
                horafin = ?,
                FechaIni = ?,
                FechaCreacion = ?,
                Dias = ?,
                modalidad = ?,
                propuesta = ?,
                curso = ?,
                docente = ?,
                city = ?,
                aprobado = ?
            WHERE id_calendario = ?    
        `, [
            data.Horaini,
            data.horaFin,
            data.FechaIni,
            data.FechaCreacion,
            data.Dias,
            data.id_mod,
            data.id_pv,
            data.id_curso,
            data.docente,
            data.id_city,
            data.Estado,
            data.id_calendario
        ]);
        cx.release();
    },
    async DeleteOldVca(idCalendario) {
        const cx = await db_1.default.getConnection();
        await cx.query(`
            DELETE FROM ViewCursoAreas WHERE id_calendario = ?
        `, [idCalendario]);
        cx.release();
    },
    async DeleteOldVcp(idCalendario) {
        const cx = await db_1.default.getConnection();
        await cx.query(`
            DELETE FROM ViewCursoPro WHERE id_calendario = ?
        `, [idCalendario]);
        cx.release();
    },
    async GetCalendarioById(id) {
        const cx = await db_1.default.getConnection();
        const Results = cx.query(`
            SELECT
			calendario.id_calendario,
			calendario.Horaini,
			calendario.horaFin,
			calendario.FechaIni,
			calendario.Dias,
			modalidad.modalidad,
			propuesta_valor.nombre as propuesta,
			curso.n_curso,
			user.nombre,
			user.apellido,
			city.city,
			calendario.aprobado
		FROM calendario
		JOIN modalidad ON calendario.modalidad = modalidad.id_mod
		JOIN propuesta_valor ON calendario.modalidad = propuesta_valor.id_pv
		JOIN curso ON calendario.curso = curso.id_curso
		JOIN user ON calendario.docente = user.id_user
		JOIN city ON calendario.city = city.id_city
		WHERE calendario.id_calendario = ?    
        `, [id]);
        cx.release();
        return Results;
    }
};
exports.default = DataCalendario;
//# sourceMappingURL=CalendarioModels.js.map