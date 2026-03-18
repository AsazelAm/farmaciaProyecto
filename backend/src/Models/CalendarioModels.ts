import conectar from "../config/db";

interface UpdateCalendarioType2 {
  id_calendario: number;
  id_pv: number;
  docente: number;
  id_mod: number;
  id_city: number;
  Estado: string;
  FechaIni: string;
  FechaCreacion: string;
  Horaini: string;
  horaFin: string;
  Dias: string;
  id_curso: number;
}

const DataCalendario = {
  async GetViewAreasModels(id) {
    const cx = await conectar.getConnection();
    const Results = cx.query(
      `
            	SELECT  
                    ViewCursoAreas.id_vca,
                    ViewCursoAreas.id_calendario,
                    ViewCursoAreas.id_areas,
                    ViewCursoAreas.id_curso,
                    areas.n_area
                FROM ViewCursoAreas 
                JOIN areas ON ViewCursoAreas.id_areas = areas.id_areas
                WHERE id_calendario = ?;   
        `,
      [id]
    );
    cx.release();
    return Results;
  },
  async GetViewProModels(id) {
    const cx = await conectar.getConnection();
    const Results = cx.query(
      `
       	    	SELECT 
                    ViewCursoPro.id_vcp, 
                    ViewCursoPro.id_calendario, 
                    ViewCursoPro.id_pv,
                    ViewCursoPro.id_curso,
                    propuesta_valor.nombre 
                FROM ViewCursoPro 
                    JOIN propuesta_valor ON ViewCursoPro.id_pv = propuesta_valor.id_pv 
                WHERE id_calendario = ?;
        `,
      [id]
    );
    cx.release();
    return Results;
  },
  async UpdateCalendarioMain(data: UpdateCalendarioType2) {
    const cx = await conectar.getConnection();
    await cx.query(
      `
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
        `,
      [
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
        data.id_calendario,
      ]
    );
    cx.release();
  },
  async DeleteOldVca(idCalendario) {
    const cx = await conectar.getConnection();
    await cx.query(
      `
            DELETE FROM ViewCursoAreas WHERE id_calendario = ?
        `,
      [idCalendario]
    );
    cx.release();
  },
  async DeleteOldVcp(idCalendario) {
    const cx = await conectar.getConnection();
    await cx.query(
      `
            DELETE FROM ViewCursoPro WHERE id_calendario = ?
        `,
      [idCalendario]
    );
    cx.release();
  },
  async GetCalendarioById(id) {
    const cx = await conectar.getConnection();
    const Results = cx.query(
      `
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
        `,
      [id]
    );
    cx.release();
    return Results;
  },
  async getCategorias() {
    try {
      const Conexion = await conectar.getConnection();
      const data = await Conexion.query(`
            SELECT DISTINCT pv.id_pv, pv.nombre, pv.identificador
            FROM propuesta_valor pv  
            JOIN calendario c ON pv.id_pv = c.propuesta
            WHERE c.aprobado = 'PROGRAMADO'
            AND c.FechaIni >= NOW() 
            ORDER BY pv.nombre ASC; 
        `);
      Conexion.release();
      return data;
    } catch (error) {
      console.error("Error ejecutando la consulta:", error);
      throw error;
    }
  },
};
export default DataCalendario;
