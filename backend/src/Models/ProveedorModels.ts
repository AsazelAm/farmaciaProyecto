import conectar from "../config/db";

interface Proveedores {
    id_proveedor :number;
    codigo :string;
    nombre:string;
    telefono :string;
    email:string;
    direccion:string;
    contactoPrincipal:string;
    fecharCreacion:string,
}

const DataProveedor={
async GetProveedorM(){
    const conection = await conectar.getConnection();
    const results = await conection.query(`
        SELECT codigo,nombre,telefono,email,direccion,contactoPrincipal,fechaCreacion FROM proveedor WHERE estado = 1 ;    
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
    async UpdateProveedorM(data:Proveedores){
        const conection = await conectar.getConnection();
        await conection.query(`
            UPDATE proveedor SET
            codigo = ?,
            nombre = ?,
            telefono= ?,
            email= ?,
            direccion = ?,
            contactoPrincipal = ?
            WHERE estado = 1 AND id_proveedor = ?;
            `,[data.codigo,data.nombre,data.telefono,data.email,data.direccion,data.contactoPrincipal,data.id_proveedor]);
            conection.release();
            return "Proveedor Actualizado";    
    },
    async DeleteProveedorM(id_proveedor){
        const conection = await conectar.getConnection();
        await conection.query(`UPDATE proveedor SET estado = 0 WHERE id_proveedor = ?;`,[id_proveedor]);
        conection.release();
        return "Proveedor Eliminado";
    }
};
export default DataProveedor;
