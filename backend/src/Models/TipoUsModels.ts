import conectar from '../config/db';

const DataTipoUs={
    async GetTipoUsM (){
        const Conexion= await conectar.getConnection();
        const results = await Conexion.query(`
            SELECT id_tipo_us,name_rol, fechaCreacion
            FROM tipo_us WHERE Estado = 1;`);
        Conexion.release();
        return results;
    },
    async AddTipoUsM(name_rol){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`INSERT INTO tipo_us(name_rol) VALUES(?);`,[name_rol]);
        Conexion.release();
        return "Rol agregado exitosamente";
    },
    async UpdateTipoUsM(name_rol,id_tipo_us){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            UPDATE tipo_us SET
            name_rol = ?
            WHERE id_tipo_us = ? AND estado = 1`,[name_rol,id_tipo_us]);
        Conexion.release();
        return "Rol actulizado Correctamente";
    },
    async DeleteTipoUsM(id_tipo_us){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            UPDATE tipo_us SET estado = 0 WHERE id_tipo_us = ?;`,[id_tipo_us]);
        Conexion.release();
        return "Rol Eliminado exitosamente "
    }
};
export default DataTipoUs;