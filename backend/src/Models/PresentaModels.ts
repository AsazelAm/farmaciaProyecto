import conectar from "../config/db";

const DataPresentacion={
    async GetPresentaM(){
        const Conexion = await conectar.getConnection();
        const results = await Conexion.query(`
            SELECT id_presentacion,nombre,fechaCreacion FROM presentacion WHERE estado = 1;`);
            Conexion.release();
            return results;
    },
    async AddPresentaM(nombre){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            INSERT INTO presentacion(nombre) VALUES (?);`,[nombre]);
        Conexion.release();
        return "Presentacion Registrado";
    },
    async UpdatePresentaM(nombre,id_presentacion){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            UPDATE presentacion SET
            nombre = ?
            WHERE id_presentacion = ? AND estado = 1;`,[nombre,id_presentacion]);
        Conexion.release();
        return "Presentacion Actualizado";
    },
    async DeletePresentaM(id_presentacion){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            UPDATE presentacion SET
            estado = 0 
            WHERE id_presentacion = ?;`,[id_presentacion]);
        Conexion.release();
        return "Presentacion Eliminado";
    }

}
export default DataPresentacion;