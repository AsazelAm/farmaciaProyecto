import conectar from '../config/db';

const DataSucursal ={
async GetSucursalM (){
        const Conexion= await conectar.getConnection();
        const results = await Conexion.query(`
            SELECT id_sucursal,nombre, fechaCreacion
            FROM Sucursal WHERE estado = 1;`);
        Conexion.release();
        return results;
    },
}
export default DataSucursal;