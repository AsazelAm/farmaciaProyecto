import conectar from '../config/db';

const DataLabora ={
    async GetLaboraM(){
        const Conexion = await conectar.getConnection();
        const results = await Conexion.query(`SELECT id_laboratorio,nombre,img,fechaCreacion FROM laboratorio WHERE estado = 1;`);
        Conexion.release();
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
            WHERE id_laboratorio = ? AND estado = 1;
            `,[nombre, id_lab]);
            Conexion.release();
            return "Laboratorio Actualizado";
    },
    async DeleteLabM(id_laboratorio){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            UPDATE laboratorio SET estado = 0 WHERE id_laboratorio = ?;`,[id_laboratorio]);
            Conexion.release();
            return "Laboratorio Eliminado";
    },
    async VerificarNombreM(nombre:string){
        const Conecion = await conectar.getConnection();
        try{
            const [rows] = await Conecion.query(`SELECT nombre FROM laboratorio WHERE nombre = ?`,[nombre]);
            if(rows){
                return {exists:true,message:"El Laboratorio ya esta registrado"};
            }
            return {exists :false};
        }catch(error){
            console.error("Error al consultar el nombre:",error);
            throw new Error("Error al verificar el nombre");
        }finally{
            Conecion.release();
        }
    },
    async VerificarUpdateNombreM(nombre ,id_laboratorio){
        const Conexion = await conectar.getConnection();
        const results = await Conexion.query(`
            SELECT COUNT(*) AS existe FROM laboratorio WHERE nombre = ? AND id_laboratorio != ? AND estado = 1;`,[nombre,id_laboratorio]);
        const existeNomb= results[0].existe;
        const exisNomb = Number(existeNomb);
        Conexion.release();
        return exisNomb;
    }
    
};
export default DataLabora;