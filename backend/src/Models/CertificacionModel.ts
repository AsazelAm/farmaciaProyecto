import conectar from  "../config/db"

const DataCertificacion = {

    async AllCertification(){
        const conection = await conectar.getConnection()
        const results = await conection.query(`
            select
                id_cert,
                n_cert,
                opcion,
                nota,
                tipo 
            from certificacion 
            where Estado = 1;
            `)
        conection.release()
        return results
    },
    
     async AddCerModal(n_cert,opcion,nota,tipo){
        const conection = await conectar.getConnection()
        await conection.query(`
            INSERT INTO certificacion( n_cert, opcion, nota, tipo) VALUES (?,?,?,?);
            `,[n_cert,opcion,nota,tipo])
        conection.release()
        return "Certificado registrado"
    },

    async DeleteCert(id){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            UPDATE certificacion set Estado = 0 where id_cert = ? 
        `,[id]);
        Conexion.release()
        return 'Certificado Eliminado'
    },

    async UpdateCertiModels(n_cert,opcion,nota,tipo,id_cert){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            UPDATE certificacion SET n_cert = ?, opcion = ?, nota = ?,
            tipo = ? WHERE id_cert = ? AND Estado = 1;
        `,[n_cert,opcion,nota,tipo,id_cert]);
        Conexion.release();
        return 'Certificado Actualizado';
    }
   
  
}
export default DataCertificacion