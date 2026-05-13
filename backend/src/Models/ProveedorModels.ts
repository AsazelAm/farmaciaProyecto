import { Result } from "express-validator";
import conectar from "../config/db";

interface Proveedores {
    codigo :string;
    nombre:string;
    telefono :string;
    email:string;
    direccion:string;
    contactoPrincipal:string;
}

const DataProveedor={
async GetProveedorM(){
    const conection = await conectar.getConnection();
    const results = await conection.query(`
        SELECT idProveedor,codigo,nombre,telefono,email,direccion,contactoPrincipal,fechaCreacion FROM proveedor WHERE estado = 1 ;    
    `)
    conection.release()
    return results;
},
async AddProveedorM(Proveedor:Proveedores){
    const conection = await conectar.getConnection();
    const results =await conection.query(`
    INTO proveedor(codigo,nombre,telefono,email,direccion,contactoPrincipal) VALUES (?,?,?,?,?,?);
    `,[Proveedor.codigo,
        Proveedor.nombre,
        Proveedor.telefono,
        Proveedor.email,
        Proveedor.direccion,
        Proveedor.contactoPrincipal
    ]);
    conection.release();
    return Number(results.insertId);
},
    async VerificarEmail(email:string){
        const conection= await conectar.getConnection();
        const Results = await conection.query(`
            SELECT COUNT(*) AS existe FROM proveedor
            WHERE email = ? AND estado = 1;`,[email]);
        const existeEmail = Results[0].existe;
        const existEmail= Number(existeEmail);
        conection.release();
        return existEmail;
},
    async VerificarEmailUpdate(email:string,idProveedor:string){
        const conection = await conectar.getConnection();
        const Results = await conection.query(`SELECT COUNT(*) AS existe FROM proveedor WHERE email = ? AND idProveedor != ? AND estado = 1;`,[email,idProveedor]);
        const existeEmail= Results[0].existe;
        const existEmail= Number(existeEmail);
        conection.release();
        return existEmail;
},
    async VerificarCodigo(codigo){
        const conection = await conectar.getConnection();
        const Results = await conection.query(`SELECT COUNT(*) AS existe FROM proveedor WHERE codigo = ? AND estado = 1;`,[codigo]);
        const existeCod = Results[0].existe;
        const existCodi = Number(existeCod);
        conection.release();
        return existCodi;
},
    async VerificarCodigoUpdate(codigo, idProveedor){
        const conection = await conectar.getConnection();
        const results = await conection.query(`SELECT COUTN(*) AS existe FROM proveedor WHERE codigo = ? AND idProveedor != ? AND estado = 1;`,[codigo,idProveedor]);
        const existeCod= results[0].existe;
        const existCodi = Number(existeCod);
        conection.release();
        return existCodi;
},
    async UpdateProveedorM(data:Proveedores, idProveedor){
        const conection = await conectar.getConnection();
        await conection.query(`
            UPDATE proveedor SET
            codigo = ?,
            nombre = ?,
            telefono= ?,
            email= ?,
            direccion = ?,
            contactoPrincipal = ?
            WHERE estado = 1 AND idProveedor = ?;
            `,[data.codigo,data.nombre,data.telefono,data.email,data.direccion,data.contactoPrincipal,idProveedor]);
            conection.release();
            return "Proveedor Actualizado";    
    },
    async DeleteProveedorM(idProveedor){
        const conection = await conectar.getConnection();
        await conection.query(`UPDATE proveedor SET estado = 0 WHERE idProveedor = ?;`,[idProveedor]);
        conection.release();
        return "Proveedor Eliminado";
    }
};
export default DataProveedor;
