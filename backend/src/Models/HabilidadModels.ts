import conectar from  "../config/db"

const DataHabilidad = {
    async GetHabilidades(){
        const conection = await conectar.getConnection()
        const results = await conection.query(`
          SELECT id_habi, n_habilidad FROM habilidades WHERE Estado = 1;
            `)
        conection.release()
        return results
    }

}
export default DataHabilidad