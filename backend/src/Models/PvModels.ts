import conectar from  "../config/db"

interface CreateAdmins {
    id_rol:number;
    nombre:string;
    apellido:string;
    ci:number;
    Email:string;
    Passwd:string;
    telefono:string;
    ciudad:string;
};
const DataPv = {
    async PvAll(){
        const conection = await conectar.getConnection()
        const results = await conection.query(`
          SELECT id_pv, nombre, identificador,logo,imgbanner,imglogoModal,imgCuadro,status from propuesta_valor WHERE Estado = 1;
            `)
        conection.release()
        return results
    },
    async AddPv(name,identificador,LogoFile,BannerFile,CuadroFile,ModalFile){
        const Conexion = await conectar.getConnection();
        const result: any = await Conexion.query(`
            INSERT INTO  propuesta_valor (nombre,identificador,logo,imgbanner,imglogoModal,imgCuadro,Status,Estado) VALUES (?,?,?,?,?,?,1,1);  
        `,[name,identificador,LogoFile,BannerFile,ModalFile,CuadroFile]);
         Conexion.release();
        return Number(result.insertId);
    },
    async UpdateImgAddpv(ruta,id){
        const Conexion = await conectar.getConnection()
        await Conexion.query(`
            UPDATE propuesta_valor set logo = ? where id_pv = ?; 
        `,[ruta,id]);
        Conexion.release()
    },
     async UpdatebannerAddpv(ruta,id){
        const Conexion = await conectar.getConnection()
        await Conexion.query(`
            UPDATE propuesta_valor set imgbanner = ? where id_pv = ?; 
        `,[ruta,id]);
        Conexion.release()
    },
    async UpdatemodalAddpv(ruta,id){
        const Conexion = await conectar.getConnection()
        await Conexion.query(`
            UPDATE propuesta_valor set imglogoModal = ? where id_pv = ?; 
        `,[ruta,id]);
        Conexion.release()
    },
    async UpdateCuadroAddpv(ruta,id){
        const Conexion = await conectar.getConnection()
        await Conexion.query(`
            UPDATE propuesta_valor set imgCuadro = ? where id_pv = ?; 
        `,[ruta,id]);
        Conexion.release()
    },
    async DeletePv(id){
        const Conexion = await conectar.getConnection()
        await Conexion.query(`
            UPDATE propuesta_valor set Estado = 0 where id_pv = ?    
        `,[id])
        Conexion.release()
        return "Propuesta de Valor Eliminado "
    },
    async UpdatePvModels(nombre, identificador, id){
    const Conexion = await conectar.getConnection()
    await Conexion.query(`
        UPDATE propuesta_valor 
        SET nombre = ?, identificador = ? 
        WHERE id_pv = ?; 
    `,[nombre, identificador, id]);
    Conexion.release()
    return "Propuesta de Valor Actualizada";
    },
    async UpdatePvEstaModels(status,id){
        const Conexion =await conectar.getConnection();
        await Conexion.query(`
                UPDATE propuesta_valor SET Status = ?
                WHERE id_pv=?;
        `,[status,id]);
        Conexion.release();
        return "Estado Actualizado ";
    },
    async PvCalendario(){
        const conection = await conectar.getConnection()
        const results = await conection.query(`
          SELECT id_pv, nombre FROM propuesta_valor WHERE Estado = 1
            `)
        conection.release()
        return results
    },

}
export default DataPv