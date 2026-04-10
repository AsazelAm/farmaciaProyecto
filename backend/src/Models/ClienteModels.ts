import conectar from "../config/db";

const DataCliente={
    async GetClientM(){
        const Conexion = await conectar.getConnection();
        const results= await Conexion.query(`
            SELECT id_cliente,ci,nombre,apellido,telefono, email,fecha_creacion FROM cliente WHERE Estado = 1;`)
        Conexion.release();
        return results;
    },
    async AddClientM(ci,nombre,apellido,telefono,email){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            INSERT INTO presentacion(ci,nombre,apellido,telefono,email) VALUES(?,?,?,?,?);`,[ci,nombre,apellido,telefono,email]);
        Conexion.release();
        return "Cliente Registrado";
    },
    async VerificarCiM(ci){
        const Conexion = await conectar.getConnection();
        const results= await Conexion.query(`
            SELECT COUNT(*) AS existe FROM cliente
            WHERE ci = ? AND Estado = 1`,[ci]);
        const existeCi=results[0].existe;
        const exisCi=Number(existeCi);
        Conexion.release();
        return exisCi;
    },
    async VerificarCiUpdate(ci,id_cliente){
        const Conexion = await conectar.getConnection();
        const results = await Conexion.query(`
            SELECT COUNT(*) AS existe FROM cliente WHERE ci = ? AND id_cliente != ? AND Estado = 1`,[ci,id_cliente]);
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
            WHERE email = ? AND Estado = 1
        `, [email]);
        const existeEmail = Results[0].existe;
        const existEmail = Number(existeEmail);
        Conexion.release();
        return existEmail ;
    },
    async VerificarEmailUpdate(email: string, id_cliente: string) {
        const Conexion = await conectar.getConnection();
        const Results = await Conexion.query(`
            SELECT COUNT(*) AS existe 
            FROM cliente 
            WHERE email = ? AND id_cliente != ? AND Estado = 1
        `, [email, id_cliente]);
        const existeEmail = Results[0].existe;
        const existEmail  = Number(existeEmail);
        Conexion.release();
        return existEmail ;
    },
    async UpdateClientM(ci,nombre,apellido,telefono,email,id_cliente){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            UPDATE cliente SET
            ci = ?,
            nombre=?,
            apellido = ?,
            telefono = ?,
            email = ?,
            WHERE id_cliente = ? AND Estado = 1;`,[ci,nombre,apellido,telefono,email,id_cliente]);
        Conexion.release();
        return "Cliente Actualizado";
    },
    async DeleteClientM(id_cliente){
        const Conexion = await conectar.getConnection();
        Conexion.query(`UPDATE cliente SET Estado = 0 WHERE id_cliente = ?;`,[id_cliente]);
        Conexion.release();
        return "Cliente Eliminado";
    }
}
export default DataCliente;