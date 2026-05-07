import conectar from '../config/db';

const DataSucursal ={
async GetSucursalM (){
        const Conexion= await conectar.getConnection();
        const results = await Conexion.query(`
            SELECT idSucursal,nombre, fechaCreacion
            FROM sucursal WHERE estado = 1;`);
        Conexion.release();
        return results;
    },
}
export default DataSucursal;