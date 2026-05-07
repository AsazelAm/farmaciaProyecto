import conectar from '../config/db';

const DataTipoUs={
    async GetTipoUsM (){
        const Conexion= await conectar.getConnection();
        const results = await Conexion.query(`
            SELECT idTipoUs,nameRol, fechaCreacion
            FROM tipoUs WHERE estado = 1;`);
        Conexion.release();
        return results;
    },
    async AddTipoUsM(nameRol){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`INSERT INTO tipoUs(nameRol) VALUES(?);`,[nameRol]);
        Conexion.release();
        return "Rol agregado exitosamente";
    },
    async UpdateTipoUsM(nameRol,idTipoUs){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            UPDATE tipoUs SET
            nameRol = ?
            WHERE idTipoUs = ? AND estado = 1`,[nameRol,idTipoUs]);
        Conexion.release();
        return "Rol actulizado Correctamente";
    },
    async DeleteTipoUsM(idTipoUs){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            UPDATE tipoUs SET estado = 0 WHERE idTipoUs = ?;`,[idTipoUs]);
        Conexion.release();
        return "Rol Eliminado exitosamente "
    }
};
export default DataTipoUs;