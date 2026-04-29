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
    },
    async ValidaNombreM(nombre){
        const Conexion = await conectar.getConnection();
        try{
            const [rows] = await Conexion.query(`
                SELECT nombre FROM presentacion nombre = ?;`,[nombre]);
                if(rows){
                    return {exists:true,message:"La presentacion ya Existe"};
                }
                return {exists:false};
        }catch(error){
            console.error("Error al consultar el nombre,",error);
            throw new Error("Error al verificar el nombre");
        }finally{
            Conexion.release();
        }
    },
    async VeriUpdaNombreM(nombre,id_presentacion){
        const Conexion = await conectar.getConnection();
        const results = await Conexion.query(`
            SELECT COUNT(*) AS existe FROM presentacion WHERE nombre = ? AND id_proveedor != ?  AND estado = 1;`,[nombre,id_presentacion]);
            const existeNombre = results[0].existe;
            const exisNomb = Number(existeNombre);
            Conexion.release();
            return exisNomb;
    }

};
export default DataPresentacion;