import conectar from "../config/db";

const DataTipoProd = {
  async GetTipoProdM() {
    const Conexion = await conectar.getConnection();
    const results = await Conexion.query(
      `SELECT nombre,fecha_creacion, Estado FROM tipo_producto WHERE Estado = 1;`,
    );
    Conexion.release();
    return results;
  },
  async AddTipoProdM(nombre) {
    const Conexion = await conectar.getConnection();
    await Conexion.query(`INSERT INTO tipo_producto(nombre) VALUE (?);`, [
      nombre,
    ]);
    Conexion.release();
    return "Tipo de Producto Registrado";
  },
  async UpdateTipoProdM(nombre, id_tipo_prod) {
    const Conexion = await conectar.getConnection();
    await Conexion.query(`
            UPDATE tipo_producto SET
            nombre = ?
            WHERE Estado = 1 AND id_tipo_prod = ?;`,[nombre,id_tipo_prod]);
            Conexion.release();
            return "Tipo de Producto Actualizado";
  },
  async DeleteTipoProdM(id_tipo_prod){
    const Conexion = await conectar.getConnection();
    await Conexion.query(`UPDATE tipo_producto SET Estado = 0 WHERE id_tipo_prod = ?`,[id_tipo_prod]);
    Conexion.release();
    return "Tipo Producto Eliminado";
  }
};
export default DataTipoProd;
