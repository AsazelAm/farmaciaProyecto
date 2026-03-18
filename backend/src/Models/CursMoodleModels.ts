 import MoodleDb from "../config/MoodleDb";

const DataCursMoodle={
async GetCursMoodle(){
     const Conexion = await MoodleDb.getConnection();
     const Results = await Conexion.query(`
         SELECT * FROM mdl_course ORDER BY startdate DESC    
     `);
     Conexion.release();
     return Results;
}
}
export default DataCursMoodle;   