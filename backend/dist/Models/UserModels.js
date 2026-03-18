"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
;
;
;
const DataUser = {
    async UserAllModels() {
        const conection = await db_1.default.getConnection();
        const results = await conection.query(`
        SELECT 
            user.id_user,
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
        FROM user
            LEFT JOIN city ON user.id_city = city.id_city
            LEFT JOIN country ON city.id_country = country.id_country
            JOIN rol ON user.id_rol = rol.id_rol
        WHERE user.Estado = 1
    `);
        conection.release();
        return results;
    },
    async GetEmail(Email) {
        const Conexion = await db_1.default.getConnection();
        try {
            const [rows] = await Conexion.query(`SELECT Email FROM user WHERE Email = ?`, [Email]);
            if (rows) {
                return { exists: true, message: "El Email ya está registrado" };
            }
            return { exists: false };
        }
        catch (error) {
            console.error("Error al consultar Email:", error);
            throw new Error("Error al verificar el email");
        }
        finally {
            Conexion.release();
        }
    },
    async VerifedConfirmed(Email) {
        const Conexion = await db_1.default.getConnection();
        try {
            const [rows] = await Conexion.query(`SELECT Email FROM user WHERE Email = ? AND Confirmed = 1;`, [Email]);
            if (rows) {
                return { exists: true };
            }
            return { exists: false };
        }
        catch (error) {
            console.error("Error al consultar Confirmed:", error);
            throw new Error("Error al verificar Confirmed");
        }
        finally {
            Conexion.release();
        }
    }, async GetPasswd(Email) {
        const Conexion = await db_1.default.getConnection();
        try {
            const data = await Conexion.query(`Select id_user, passwd FROM user where Email = ?`, [Email]);
            return data;
        }
        catch (error) {
            console.error("Error al consultar Passwd:", error);
            throw new Error("Error al verificar Passwd");
        }
        finally {
            Conexion.release();
        }
    },
    async ResetPasswd(Passwd, idUser) {
        const Conexion = await db_1.default.getConnection();
        try {
            await Conexion.query(`UPDATE user SET passwd = ? where id_user = ?;`, [Passwd, idUser]);
            return "Passwd Actualizado";
        }
        catch (error) {
            console.error("Error al consultar Passwd:", error);
            throw new Error("Error al verificar Passwd");
        }
        finally {
            Conexion.release();
        }
    },
    async GetIdRol(Email) {
        const Conexion = await db_1.default.getConnection();
        try {
            const Results = await Conexion.query(`Select rol.name_rol from user
                JOIN rol ON user.id_rol = rol.id_rol
                where user.Email = ?`, [Email]);
            return Results;
        }
        catch (error) {
            console.error("Error al consultar GetId:", error);
            throw new Error("Error al verificar GetId");
        }
        finally {
            Conexion.release();
        }
    },
    async GetCI(CI) {
        const Conexion = await db_1.default.getConnection();
        try {
            const [rows] = await Conexion.query(`SELECT ci FROM user WHERE ci = ?`, [CI]);
            if (rows) {
                return { exists: true, message: "El Carnet de Identidad ya está registrado" };
            }
            return { exists: false };
        }
        catch (error) {
            console.error("Error al consultar CI:", error);
            throw new Error("Error al verificar CI");
        }
        finally {
            Conexion.release();
        }
    },
    async CreateAdmins(Admins) {
        const Conexion = await db_1.default.getConnection();
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
                ) VALUES (?,?, ?, ?, ?, ?, ?,?,?)`, [
                Admins.id_rol,
                Admins.nombre,
                Admins.apellido,
                Admins.ci,
                Admins.Email,
                Admins.telefono,
                Admins.id_city,
                Admins.Passwd,
                "1",
            ]);
            return "Usuario Creado";
        }
        catch (error) {
            console.error("Error al crear admin models:", error);
            throw new Error("Error al crear admin models:");
        }
        finally {
            Conexion.release();
        }
    },
    async DeleteUserId(id) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE user set Estado = 0 where id_user = ?;    
        `, [id]);
        Conexion.release();
        return "Usuario Eliminado Correctamente";
    },
    async UpodateUserbyId(data) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE user set
            id_rol = ?,
            nombre = ?,
            apellido = ?,
            Email = ?,
            telefono = ?,
            id_city=?
            where id_user = ?
        `, [data.id_rol, data.nombre, data.apellido, data.Email, data.telefono, data.id_city, data.id]);
        Conexion.release();
        return "Datos Actualizados";
    },
    //Docentes
    async GetDocentesModels() {
        const Conexion = await db_1.default.getConnection();
        const Results = await Conexion.query(`
            SELECT user.id_user, user.nombre, user.apellido FROM user 
            JOIN rol ON user.id_rol = rol.id_rol
            WHERE rol.id_rol = 2 AND rol.Estado = 1 AND user.Estado = 1;    
        `);
        Conexion.release();
        return Results;
    },
    //roles
    async RolAllModels() {
        const Conexion = await db_1.default.getConnection();
        const Results = await Conexion.query(`Select id_rol, name_rol from rol where Estado = 1;`);
        Conexion.release();
        return Results;
    },
    async addRol(rol) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`INSERT INTO Rol (name_rol) values (?)`, [rol]);
        Conexion.release();
        return 'Rol creado';
    },
    async DeleteRol(id) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE Rol Set Estado = 0 where id_rol = ?;    
        `, [id]);
        Conexion.release();
        return "Rol Eliminado";
    },
    async UpdateRolModels(id, rol) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE Rol set name_rol = ? where id_rol = ?;
        `, [rol, id]);
        Conexion.release();
        return "Rol Actualizado";
    },
    async GetAlumnosModels() {
        const Conexion = await db_1.default.getConnection();
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
        `);
        Conexion.release();
        return data;
    },
    async GetCityCoun(idcontry) {
        const Conexion = await db_1.default.getConnection();
        const data = await Conexion.query(`
            SELECT id_city,city FROM city WHERE id_country=? AND Estado = 1;
            `, [idcontry]);
        Conexion.release();
        return data;
    },
    async createStudentsModels(data) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            INSERT INTO user(id_rol,nombre,apellido, Email,telefono,ci, id_empresa,id_city)VALUES(3,?,?,?,?,?,?,?);
        `, [
            data.nombre,
            data.apellido,
            data.Email,
            data.telefono,
            data.ci,
            data.id_empresa,
            data.id_city
        ]);
        Conexion.release();
        return 'Estudiante Creado';
    },
    async UpdateStudentsModels(data) {
        const Conexion = await db_1.default.getConnection();
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
        `, [
            data.nombre,
            data.apellido,
            data.Email,
            data.telefono,
            data.ci,
            data.id_empresa,
            data.id_city,
            data.id
        ]);
        Conexion.release();
        return "Datos Actualizados";
    }
};
exports.default = DataUser;
//# sourceMappingURL=UserModels.js.map