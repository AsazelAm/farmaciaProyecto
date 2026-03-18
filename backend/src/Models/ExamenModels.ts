import conectar from '../config/db';

const DataExamen={
    async GetExamen(){
        const Conexion=await conectar.getConnection();
        const Results=await Conexion.query(`SELECT * FROM examen where Estado = 1`);
        Conexion.release()
        return Results;
    },
    async VerifedCode(code){
        const Conexion = await conectar.getConnection()
        const results = await Conexion.query(`
         SELECT COUNT(*) as existe FROM examen WHERE codigo = ? and Estado = 1;
            `,[code]);
        Conexion.release()
        const existeBigInt =results[0].existe;
        const existeNumber =Number(existeBigInt);;
        return existeNumber
    },
    async AddExamenModels(Exa,code,Cur){
        const Conexion = await conectar.getConnection()
        await Conexion.query(`
        INSERT INTO examen (Examen,codigo,Curso) VALUES (?,?,?)
            `,[Exa,code,Cur]);
        Conexion.release()
        return "Examen registrado"
    },
    async DeleteExamenModels(id){
        const Conexion = await conectar.getConnection()
        await  Conexion.query(`
            UPDATE examen SET Estado = 0 where id_exa = ?  
        `,[id])
        Conexion.release()
        return "Examen Eliminado"
    },
    async UpdateExamenModels(Examen,codigo,Curso,id_exa){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            UPDATE examen SET 
            Examen = ?,
            codigo = ?,
            Curso = ?
            WHERE id_exa = ? AND Estado = 1;
            `,[Examen,codigo,Curso,id_exa]);
            Conexion.release()
            return "Datos Actualizados";
    }
    
}
export default DataExamen;