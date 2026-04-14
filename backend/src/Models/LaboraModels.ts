import conectar from '../config/db';

const DataLabora ={
    async GetLaboraM(){
        const Conexion = await conectar.getConnection();
        const results = await Conexion.query(`SELECT id_laboratorio,nombre,fecha_creacion FROM laboratorio WHERE Estado = 1;`);
        Conexion.release()
        return results;
    },
    async AddLaboraM(nombre){
        const Conexion = await conectar.getConnection();
        const results =await Conexion.query(`INSERT INTO laboratorio(nombre) VALUE(?);`,[nombre]);
        Conexion.release();
        return Number(results.insertId);
    },
    async UpdateRutaimg(ruta:string, id_laboratorio:number| string){
        const Conexion= await conectar.getConnection();
        await Conexion.query(`
            UPDATE laboratorio SET
            img = ?
            WHERE id_laboratorio = ?
            `,[ruta,id_laboratorio]);
        Conexion.release();
        return "Imagen Guardado correctamente"
    },
    async UpdateLabM(id_lab,nombre){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            UPDATE laboratorio SET
            nombre = ?
            WHERE id_laboratorio = ? AND Estado = 1;
            `,[nombre, id_lab]);
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