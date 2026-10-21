import conectar from "../config/db"

// Vigencia del codigo de verificacion de login (5 minutos) y maximo de
// intentos fallidos antes de invalidarlo (3).
export const CODIGO_VIGENCIA_MINUTOS = 5;
export const CODIGO_MAX_INTENTOS = 3;

const DataCodigo = {
    async GuardarCodigo(codigo: string, email: string) {
        const Conexion = await conectar.getConnection();
        try {
            await Conexion.query(`
                UPDATE usuario SET
                    codigoVerificacion = ?,
                    codigoExpiracion = DATE_ADD(NOW(), INTERVAL ${CODIGO_VIGENCIA_MINUTOS} MINUTE),
                    codigoIntentos = 0
                WHERE email = ?;
            `, [codigo, email]);
            return true;
        } catch (error) {
            console.error("Error al guardar el codigo:", error);
            throw new Error("Error al guardar el codigo");
        } finally {
            Conexion.release();
        }
    },

    // Devuelve el codigo guardado, los intentos usados y si sigue vigente.
    // La comparacion de expiracion se hace con NOW() de la base para no
    // depender de la zona horaria del servidor Node.
    async ObtenerCodigo(email: string) {
        const Conexion = await conectar.getConnection();
        try {
            const rows = await Conexion.query(`
                SELECT codigoVerificacion, codigoIntentos,
                       (codigoExpiracion > NOW()) AS codigoVigente,
                       nombre, apellido, estado, confirmed, idUsuario
                FROM usuario
                WHERE email = ?;
            `, [email]);
            return rows;
        } catch (error) {
            console.error("Error al consultar el codigo:", error);
            throw new Error("Error al consultar el codigo");
        } finally {
            Conexion.release();
        }
    },

    async IncrementarIntentos(email: string) {
        const Conexion = await conectar.getConnection();
        try {
            await Conexion.query(`
                UPDATE usuario SET codigoIntentos = codigoIntentos + 1 WHERE email = ?;
            `, [email]);
            return true;
        } catch (error) {
            console.error("Error al incrementar intentos:", error);
            throw new Error("Error al incrementar intentos");
        } finally {
            Conexion.release();
        }
    },

    // Borra el codigo (al verificarlo correctamente, al expirar o al
    // superar los intentos) para que no pueda reutilizarse.
    async LimpiarCodigo(email: string) {
        const Conexion = await conectar.getConnection();
        try {
            await Conexion.query(`
                UPDATE usuario SET
                    codigoVerificacion = NULL,
                    codigoExpiracion = NULL,
                    codigoIntentos = 0
                WHERE email = ?;
            `, [email]);
            return true;
        } catch (error) {
            console.error("Error al limpiar el codigo:", error);
            throw new Error("Error al limpiar el codigo");
        } finally {
            Conexion.release();
        }
    },
}

export default DataCodigo;
