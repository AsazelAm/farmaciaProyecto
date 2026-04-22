import conectar from "../config/db";

interface Proveedores {
    id_proveedor :number;
    codigo :string;
    nombre:string;
    telefono :string;
    email:string;
    direccion:string;
    contacto_principal:string;
    fechar_creacion:string,
}

const DataProveedor={
async GetProveedorM(){
    const conection = await conectar.getConnection();
    const results = await conection.query(`
        SELECT codigo,nombre,telefono,email,direccion,contacto_principal,fecha_creacion FROM proveedor WHERE Estado = 1 ;    
    `)
    conection.release()
    return results;
},
async AddProveedorM(Proveedor:Proveedores){
    const conection = await conectar.getConnection();
    const results =await conection.query(`
    INTO proveedor(codigo,nombre,telefono,email,direccion,contacto_principal) VALUES (?,?,?,?,?,?);
    `,[Proveedor.codigo,
        Proveedor.nombre,
        Proveedor.telefono,
        Proveedor.email,
        Proveedor.direccion,
        Proveedor.contacto_principal
    ]);
    conection.release();
    return Number(results.insertId);
},
async UpdateProveedorM(data:Proveedores){
    const conecction = conectar.getConnection();
    await conecction.query(`
        UPDATE ´proveedor SET
        codigo = nummero
        nombre = ?,
        `)
}
}
export default DataProveedor;
