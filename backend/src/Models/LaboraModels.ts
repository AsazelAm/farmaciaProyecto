import conectar from '../config/db';

const DataLabora ={
    async GetLaboraM(){
        const Conexion = await conectar.getConnection();
        const results = await Conexion.query(`SELECT nombre,img,fecha_creacion,Estado FROM laboratorio WHERE Estado = 1;`);
        Conexion.release()
        return results;
    },
    async AddLaboraM(nombre,img){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`INSERT INTO laboratorio(nombre,img) VALUES(?,?);`,[nombre,img]);
        Conexion.release();
        return "Laboratorio Registrado";
    },
    async UpdateLabM(nombre,img,id_lab){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            UPDATE laboratorio SET
            nombre = ?,
            img = ?
            WHERE id_laboratorio = ? AND Estado = 1;
            `,[nombre,img, id_lab]);
            Conexion.release();
            return "Laboratorio Actualizado";
    },
    async DeleteLabM(id_lab){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            UPDATE laboratorio SET Estado = 0 WHERE id_laboratorio = ?;`,[id_lab]);
            Conexion.release();
            return "Laboratorio Eliminado";
    }
}
export default DataLabora;