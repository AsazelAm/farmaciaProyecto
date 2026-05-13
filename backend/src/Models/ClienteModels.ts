import conectar from "../config/db";

const DataCliente={
    async GetClientM(){
        const Conexion = await conectar.getConnection();
        const results= await Conexion.query(`
            SELECT idCliente,ci,nombre,apellido,telefono,email,fechaCreacion FROM cliente WHERE estado = 1;`)
        Conexion.release();
        return results;
    },
    async AddClientM(ci,nombre,apellido,telefono,email){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            INSERT INTO cliente(ci,nombre,apellido,telefono,email) VALUES(?,?,?,?,?);`,[ci,nombre,apellido,telefono,email]);
        Conexion.release();
        return "Cliente Registrado";
    },
    async VerificarCiM(ci){
        const Conexion = await conectar.getConnection();
        const results= await Conexion.query(`
            SELECT COUNT(*) AS existe FROM cliente
            WHERE ci = ? AND estado = 1`,[ci]);
        const existeCi=results[0].existe;
        const exisCi=Number(existeCi);
        Conexion.release();
        return exisCi;
    },
    async VerificarCiUpdate(ci,idCliente){
        const Conexion = await conectar.getConnection();
        const results = await Conexion.query(`
            SELECT COUNT(*) AS existe FROM cliente WHERE ci = ? AND idCliente != ? AND estado = 1`,[ci,idCliente]);
        const existeCi=results[0].existe;
        const exisCi = Number(existeCi);
        Conexion.release();
        return exisCi;
    },
    async VerificarEmail(email: string) {
        const Conexion = await conectar.getConnection();
        const Results = await Conexion.query(`
            SELECT COUNT(*) AS existe 
            FROM cliente 
            WHERE email = ? AND estado = 1
        `, [email]);
        const existeEmail = Results[0].existe;
        const existEmail = Number(existeEmail);
        Conexion.release();
        return existEmail ;
    },
    async VerificarEmailUpdate(email: string, idCliente: string) {
        const Conexion = await conectar.getConnection();
        const Results = await Conexion.query(`
            SELECT COUNT(*) AS existe 
            FROM cliente 
            WHERE email = ? AND idCliente != ? AND estado = 1
        `, [email, idCliente]);
        const existeEmail = Results[0].existe;
        const existEmail  = Number(existeEmail);
        Conexion.release();
        return existEmail ;
    },
    async UpdateClientM(ci,nombre,apellido,telefono,email,idCliente){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            UPDATE cliente SET
            ci = ?,
            nombre=?,
            apellido = ?,
            telefono = ?,
            email = ?,
            WHERE idCliente = ? AND estado = 1;`,[ci,nombre,apellido,telefono,email,idCliente]);
        Conexion.release();
        return "Cliente Actualizado";
    },
    async DeleteClientM(idCliente){
        const Conexion = await conectar.getConnection();
        Conexion.query(`UPDATE cliente SET estado = 0 WHERE idCliente = ?;`,[idCliente]);
        Conexion.release();
        return "Cliente Eliminado";
    }
}
export default DataCliente;