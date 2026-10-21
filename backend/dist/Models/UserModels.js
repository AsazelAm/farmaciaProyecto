"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
;
const DataUser = {
    async UserAllModels() {
        const conection = await db_1.default.getConnection();
        const results = await conection.query(`
        SELECT usu.idUsuario, usu.ci, usu.nombre, usu.apellido, usu.img, usu.telefono, usu.email, usu.estado,
               sucursal.idSucursal, sucursal.nombre AS nombreSucursal,
               tipous.idTipoUs, tipous.nameRol
        FROM usuario usu
        LEFT JOIN sucursal ON usu.idSucursal = sucursal.idSucursal
        JOIN tipous ON usu.idTipoUs = tipous.idTipoUs
        WHERE usu.estado = 1;
    `);
        conection.release();
        return results;
    },
    async UserAllModelsId(idUsuario) {
        const conection = await db_1.default.getConnection();
        const results = await conection.query(`
        SELECT usu.idUsuario, usu.ci, usu.nombre, usu.apellido, usu.img, usu.telefono, usu.email, usu.estado,
               sucursal.idSucursal, sucursal.nombre AS nombreSucursal,
               tipous.idTipoUs, tipous.nameRol
        FROM usuario usu
        LEFT JOIN sucursal ON usu.idSucursal = sucursal.idSucursal
        JOIN tipous ON usu.idTipoUs = tipous.idTipoUs
        WHERE usu.estado = 1 AND usu.idUsuario = ?;
    `, [idUsuario]);
        conection.release();
        return results;
    },
    async GetEmail(email) {
        const Conexion = await db_1.default.getConnection();
        try {
            const rows = await Conexion.query(`SELECT email FROM usuario WHERE email = ?`, [email]);
            if (rows && rows.length > 0) {
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
    async VerifedConfirmed(email) {
        const Conexion = await db_1.default.getConnection();
        try {
            const rows = await Conexion.query(`SELECT confirmed FROM usuario WHERE email = ? AND confirmed = 1;`, [email]);
            console.log("RESULT COMPLETO:", JSON.stringify(rows));
            console.log("result[0]:", JSON.stringify(rows[0]));
            console.log("result[0].length:", rows[0]?.length);
            console.log("result[0][0]:", JSON.stringify(rows[0]?.[0]));
            const confirmed = rows[0].confirmed;
            console.log("Confirmed value:", confirmed);
            return { exists: confirmed == 1 };
        }
        catch (error) {
            console.error("Error al consultar Confirmed:", error);
            throw new Error("Error al verificar Confirmed");
        }
        finally {
            Conexion.release();
        }
    },
    async GetPasswd(email) {
        const Conexion = await db_1.default.getConnection();
        try {
            const rows = await Conexion.query(`SELECT idUsuario, passwd FROM usuario WHERE email = ?`, [email]);
            return rows;
        }
        catch (error) {
            console.error("Error al consultar Passwd:", error);
            throw new Error("Error al verificar Passwd");
        }
        finally {
            Conexion.release();
        }
    },
    async GetPasswdById(idUsuario) {
        const Conexion = await db_1.default.getConnection();
        try {
            const rows = await Conexion.query(`SELECT passwd FROM usuario WHERE idUsuario = ?`, [idUsuario]);
            return rows;
        }
        catch (error) {
            console.error("Error al consultar Passwd por Id:", error);
            throw new Error("Error al verificar Passwd");
        }
        finally {
            Conexion.release();
        }
    },
    async ResetPasswd(Passwd, idUser) {
        const Conexion = await db_1.default.getConnection();
        try {
            await Conexion.query(`UPDATE usuario SET passwd = ? where idUsuario = ?;`, [Passwd, idUser]);
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
    async GetIdRol(email) {
        const Conexion = await db_1.default.getConnection();
        try {
            const rows = await Conexion.query(`SELECT tipous.nameRol FROM usuario
             JOIN tipous ON usuario.idTipoUs = tipous.idTipoUs
             WHERE usuario.email = ?`, [email]);
            return rows;
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
            const [rows] = await Conexion.query(`SELECT ci FROM usuario WHERE ci = ?`, [CI]);
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
    async CreateUsuarioM(Usuario) {
        const Conexion = await db_1.default.getConnection();
        try {
            const result = await Conexion.query(`
                INSERT INTO 
                usuario (ci,nombre,apellido,passwd,telefono,email,Confirmed,idTipoUs,idSucursal)VALUES(?,?,?,?,?,?,?,?,?)`, [
                Usuario.ci,
                Usuario.nombre,
                Usuario.apellido,
                Usuario.passwd,
                Usuario.telefono,
                Usuario.email,
                1,
                Usuario.idTipoUs,
                Usuario.idSucursal
            ]);
            return Number(result.insertId);
        }
        catch (error) {
            console.error("Error al crear admin models:", error);
            throw new Error("Error al crear admin models:");
        }
        finally {
            Conexion.release();
        }
    },
    async UpdateRutaimg(ruta, idUsuario) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
                UPDATE usuario SET
                img = ?
                WHERE idUsuario = ?
                `, [ruta, idUsuario]);
        Conexion.release();
        return "Imagen Guardado correctamente";
    },
    async DeleteUserId(id) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE usuario SET estado = 0 WHERE idUsuario = ?;    
        `, [id]);
        Conexion.release();
        return "Usuario Eliminado Correctamente";
    },
    async UpodateUserbyId(data) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE usuario SET
            ci= ?,
            nombre = ?,
            apellido = ?,
            telefono = ?,
            email = ?,
            idTipoUs=?,
            idSucursal = ?
            where idUsuario = ?
        `, [data.ci, data.nombre, data.apellido, data.telefono, data.email, data.idTipoUs, data.idSucursal, data.idUsuario]);
        Conexion.release();
        return "Datos Actualizados";
    }
};
exports.default = DataUser;
//# sourceMappingURL=UserModels.js.map