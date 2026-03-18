import conectar from  "../config/db"

interface CreateAdmins {
    id_rol:number;
    nombre:string;
    apellido:string;
    ci:number;
    Email:string;
    Passwd:string;
    telefono:string;
    id_city:number;
    id_country:number;};

interface UpdateAdmins{
    id_rol:number;
    nombre:string;
    apellido:string;
    Email:string;
    telefono:string;
    id_city:number;
    id:string;
}
interface CreateAlumnos {
    nombre:string;
    apellido:string;
    ci:number;
    Email:string;
    telefono:string;
    id_empresa:number;
    id_city:number;
    id_country:number;
};

interface UpdateEstudiantes {
    nombre:string;
    apellido:string;
    Email:string;
    telefono:string;
    ci:number;
    id_empresa:number;
    id_city:number;
    id:string;
};

const DataUser = {
    async UserAllModels(){
        const conection = await conectar.getConnection()
        const results = await conection.query(`
        SELECT 
            user.id_usuario,
            user.apellido,
            user.nombre,
            user.telefono,
            user.Email,
            user.Estado,
            rol.name_rol,
            rol.id_rol,
            city.city,
            city.id_city,
            city.id_country,
            country.pais
        FROM usuario
            LEFT JOIN city ON user.id_city = city.id_city
            LEFT JOIN country ON city.id_country = country.id_country
            JOIN rol ON user.id_rol = rol.id_rol
        WHERE user.Estado = 1
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
    }, async GetPasswd(Email:string){
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
            const [rows] = await Conexion.query(`SELECT ci FROM user WHERE ci = ?`, [CI]);
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
     async CreateAdmins(Admins:CreateAdmins){
        const Conexion = await conectar.getConnection()
        try {
            await Conexion.query(`
                INSERT INTO 
                user (
                id_rol,
                nombre,
                apellido,
                ci,
                Email,
                telefono,
                id_city,
                Passwd, 
                Confirmed
                ) VALUES (?,?, ?, ?, ?, ?, ?,?,?)`,[
                    Admins.id_rol,
                    Admins.nombre,
                    Admins.apellido,
                    Admins.ci,
                    Admins.Email,
                    Admins.telefono,
                    Admins.id_city,
                    Admins.Passwd,
                    "1",
                ])
            return "Usuario Creado"
        } catch (error) {
            console.error("Error al crear admin models:", error);
            throw new Error("Error al crear admin models:");
        }finally{
            Conexion.release()
        }
    },

    async DeleteUserId(id){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            UPDATE user set Estado = 0 where id_user = ?;    
        `,[id]);
        Conexion.release()
        return "Usuario Eliminado Correctamente"
    },

    async UpodateUserbyId(data:UpdateAdmins){
        const Conexion  = await conectar.getConnection();
        await Conexion.query(`
            UPDATE user set
            id_rol = ?,
            nombre = ?,
            apellido = ?,
            Email = ?,
            telefono = ?,
            id_city=?
            where id_user = ?
        `,[data.id_rol,data.nombre,data.apellido,data.Email,data.telefono,data.id_city,data.id]);
        Conexion.release()
        return "Datos Actualizados"
    },
    //Docentes
    async GetDocentesModels(){
        const Conexion = await conectar.getConnection();
        const Results = await Conexion.query(`
            SELECT user.id_user, user.nombre, user.apellido FROM user 
            JOIN rol ON user.id_rol = rol.id_rol
            WHERE rol.id_rol = 2 AND rol.Estado = 1 AND user.Estado = 1;    
        `)
        Conexion.release()
        return Results
    },
    //roles
    async RolAllModels(){
        const Conexion = await conectar.getConnection();
        const Results = await Conexion.query(`Select id_rol, name_rol from rol where Estado = 1;`);
        Conexion.release();
        return Results;
    },
    async addRol(rol){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`INSERT INTO Rol (name_rol) values (?)`,[rol]);
        Conexion.release();
        return 'Rol creado';
    },
    async DeleteRol(id){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            UPDATE Rol Set Estado = 0 where id_rol = ?;    
        `,[id])
        Conexion.release();
        return "Rol Eliminado"
    },
    async UpdateRolModels(id,rol){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            UPDATE Rol set name_rol = ? where id_rol = ?;
        `,[rol,id])
        Conexion.release();
        return "Rol Actualizado"
    },

    async GetAlumnosModels(){
        const Conexion = await conectar.getConnection();
        const data = await Conexion.query(`
             SELECT 
                user.id_user, 
                user.nombre, 
                user.apellido, 
                user.ci, 
                user.Email, 
                user.telefono,
                user.id_empresa,
                user.id_city,
                city.city,
                city.id_country,
                country.pais
            FROM user
            JOIN rol ON user.id_rol = rol.id_rol
            JOIN city ON user.id_city = city.id_city
            JOIN country ON city.id_country = country.id_country
            WHERE rol.id_rol = 3
            AND user.Estado = 1;
        `)
        Conexion.release();
        return data
    },
    async GetCityCoun(idcontry){
        const Conexion =await conectar.getConnection();
        const data =await Conexion.query(`
            SELECT id_city,city FROM city WHERE id_country=? AND Estado = 1;
            `,[idcontry])
        Conexion.release();
        return data;
    },
    async createStudentsModels(data:CreateAlumnos){
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            INSERT INTO user(id_rol,nombre,apellido, Email,telefono,ci, id_empresa,id_city)VALUES(3,?,?,?,?,?,?,?);
        `,[
            data.nombre,
            data.apellido,
            data.Email,
            data.telefono,
            data.ci,
            data.id_empresa,
            data.id_city
        ]);
        Conexion.release();
        return 'Estudiante Creado'
    },
    async UpdateStudentsModels(data:UpdateEstudiantes){
        const Conexion =await conectar.getConnection();
        await Conexion.query(`
            UPDATE user SET
            nombre = ?,
            apellido= ?,
            Email= ?,
            telefono=?,
            ci=?,
            id_empresa=?,
            id_city=?
            WHERE id_user = ? AND id_rol=3;
        `,[
            data.nombre,
            data.apellido,
            data.Email,
            data.telefono,
            data.ci,
            data.id_empresa,
            data.id_city,
            data.id
        ])
            Conexion.release()
            return "Datos Actualizados"
    }
  
}
export default DataUser