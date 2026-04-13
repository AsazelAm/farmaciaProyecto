import conectar from  "../config/db"

interface CreateAdmins {
    ci:string;
    nombre:string;
    apellido:string;
    passwd:string;
    telefono:string;
    Email:string;
    id_tipo_us:number;
    id_sucursal:number;
};

interface UpdateAdmins{
    id_usuario:number;
    ci:string;
    nombre:string;
    apellido:string;
    telefono:string;
    Email:string;
    id_tipo_us:number;
    id_sucursal:number;
}

const DataUser = {
    async UserAllModels(){
        const conection = await conectar.getConnection()
        const results = await conection.query(`
        SELECT usu.id_usuario, usu.ci,usu.nombre,usu.apellido,usu.img,usu.telefono,usu.email,usu.Estado, sucursal.id_sucursal, sucursal.nombre,tipo_us.id_tipo_us, tipo_us.name_rol FROM usuario usu LEFT JOIN sucursal ON usu.id_sucursal = sucursal.id_sucursal 
        JOIN tipo_us ON usu.id_tipo_us = tipo_us.id_tipo_us WHERE usu.Estado = 1;
    `)
    conection.release()
    return results
    },
    async GetEmail(Email: string) {
        const Conexion = await conectar.getConnection();
        try {
            const rows:any = await Conexion.query(`SELECT Email FROM usuario WHERE Email = ?`, [Email]);
            if (rows && rows.length > 0) {
                return { exists: true, message: "El Email ya está registrado" };
            }
            return { exists: false };
        } catch (error) {
            console.error("Error al consultar Email:", error);
            throw new Error("Error al verificar el email");
        } finally {
            Conexion.release();
        }
    },
     async VerifedConfirmed(Email){
        const Conexion = await conectar.getConnection();
        try {
            const rows = await Conexion.query(`SELECT Confirmed FROM usuario WHERE Email = ? AND Confirmed = 1;`,[Email])

              console.log("RESULT COMPLETO:", JSON.stringify(rows));
        console.log("result[0]:", JSON.stringify(rows[0]));
        console.log("result[0].length:", rows[0]?.length);
        console.log("result[0][0]:", JSON.stringify(rows[0]?.[0]));
            
        const confirmed = rows[0].Confirmed;
        console.log("Confirmed value:", confirmed); 
            return { exists: confirmed == 1 };
        } catch (error) {
            console.error("Error al consultar Confirmed:", error);
            throw new Error("Error al verificar Confirmed");
        }finally{
            Conexion.release()
        }
    }, 
    async GetPasswd(Email:string){
        const Conexion = await conectar.getConnection();
        try {
            const rows = await Conexion.query(`SELECT id_usuario, passwd FROM usuario WHERE Email = ?`,[Email])
            return rows
        } catch (error) {
            console.error("Error al consultar Passwd:", error);
            throw new Error("Error al verificar Passwd");
        }finally{
            Conexion.release()
        }
    },
    async ResetPasswd(Passwd,idUser){
        const Conexion = await conectar.getConnection()
        try {
            await Conexion.query(`UPDATE usuario SET passwd = ? where id_usuario = ?;`,[Passwd,idUser]);
            return "Passwd Actualizado"
        } catch (error) {
            console.error("Error al consultar Passwd:", error);
            throw new Error("Error al verificar Passwd");
        } finally{
            Conexion.release()
        }
    },
    async GetIdRol(Email:string){
        const Conexion = await conectar.getConnection()
        try {
            const rows = await Conexion.query(`SELECT tipo_us.name_rol FROM usuario
             JOIN tipo_us ON usuario.id_tipo_us = tipo_us.id_tipo_us
             WHERE usuario.Email = ?`,[Email]);
            return rows
        } catch (error) {
            console.error("Error al consultar GetId:", error);
            throw new Error("Error al verificar GetId");
        }finally{
            Conexion.release()
        }
    },
    async GetCI(CI: string) {
        const Conexion = await conectar.getConnection();
        try {
            const [rows] = await Conexion.query(`SELECT ci FROM usuario WHERE ci = ?`, [CI]);
            if (rows) {
                return { exists: true, message: "El Carnet de Identidad ya está registrado" };
            }
            return { exists: false };
        } catch (error) {
            console.error("Error al consultar CI:", error);
            throw new Error("Error al verificar CI");
        } finally {
            Conexion.release();
        }
    },
     async CreateUsuarioM(Usuario:CreateAdmins){
        const Conexion = await conectar.getConnection()
        try {
            const result=await Conexion.query(`
                INSERT INTO 
                usuario (
                ci,
                nombre,
                apellido,
                Passwd,
                telefono,
                Email,
                Confirmed
                id_tipo_us,
                id_sucursal
                ) VALUES (?,?,?,?,?,?,?,?,?)`,[
                    Usuario.ci,
                    Usuario.nombre,
                    Usuario.apellido,
                    Usuario.passwd,
                    Usuario.telefono,
                    Usuario.Email,
                    "1",
                    Usuario.id_tipo_us,
                    Usuario.id_sucursal
                ])
            return Number(result.insertId);
        } catch (error) {
            console.error("Error al crear admin models:", error);
            throw new Error("Error al crear admin models:");
        }finally{
            Conexion.release()
        }
    },
    async UpdateRutaimg(ruta:string, id_usuario:number| string){
            const Conexion= await conectar.getConnection();
            await Conexion.query(`
                UPDATE usuario SET
                img = ?
                WHERE id_usuario = ?
                `,[ruta,id_usuario]);
            Conexion.release();
            return "Imagen Guardado correctamente"
        },
    async DeleteUserId(id){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            UPDATE usuario SET Estado = 0 WHERE id_usuario = ?;    
        `,[id]);
        Conexion.release()
        return "Usuario Eliminado Correctamente"
    },
    async UpodateUserbyId(data:UpdateAdmins){
        const Conexion  = await conectar.getConnection();
        await Conexion.query(`
            UPDATE usuario SET
            ci= ?,
            nombre = ?,
            apellido = ?,
            telefono = ?,
            Email = ?,
            id_tipo_us=?,
            id_sucursal = ?
            where id_usuario = ?
        `,[data.ci,data.nombre,data.apellido,data.telefono,data.Email,data.id_tipo_us,data.id_sucursal,data.id_usuario]);
        Conexion.release()
        return "Datos Actualizados"
    }
}
export default DataUser;