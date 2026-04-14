import conectar from '../config/db';

const DataSucursal ={
async GetSucursalM (){
        const Conexion= await conectar.getConnection();
        const results = await Conexion.query(`
            SELECT id_sucursal,nombre, fecha_creacion
            FROM Sucursal WHERE Estado = 1;`);
        Conexion.release();
        return results;
    },
}
export default DataSucursal;