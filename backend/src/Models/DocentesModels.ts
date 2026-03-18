import conectar from "../config/db"

interface DataDocentes {
    nombre: string;
    apellido: string;
    celular: string;
    url: string;
    formacion: string;
    descripcion: string;
    honorarios: string;
    Email: string;
}

const DataDocentes = {
    // GET - Obtener todos los docentes
    async GetDocentes() {
        const conection = await conectar.getConnection();
        const results = await conection.query(`
            SELECT 
                id_user, 
                nombre, 
                apellido, 
                formacion,
                telefono,
                Email,
                img,
                cv,
                Cvlink,
                descripcion,
                honorarios
            FROM user 
            WHERE id_rol = 2 AND Estado = 1
        `);
        conection.release();
        return results;
    },

    // GET - Obtener docente por ID
    async GetDocenteById(id: string) {
        const Conexion = await conectar.getConnection();
        const Results = await Conexion.query(`
            SELECT 
                id_user, 
                nombre, 
                apellido, 
                telefono,
                Cvlink,
                formacion,
                descripcion,
                honorarios,
                Email,
                img,
                cv
            FROM user 
            WHERE id_user = ? AND id_rol = 2 AND Estado = 1
        `, [id]);
        Conexion.release();
        return Results.length > 0 ? Results[0] : null;
    },

    // Verificar si email existe (para crear)
    async Verificar(email: string) {
        const Conexion = await conectar.getConnection();
        const Results = await Conexion.query(`
            SELECT COUNT(*) AS existe 
            FROM user 
            WHERE Email = ? AND Estado = 1
        `, [email]);
        const existeBigInt = Results[0].existe;
        const existeNumber = Number(existeBigInt);
        Conexion.release();
        return existeNumber;
    },

    // Verificar si email existe excluyendo un ID (para actualizar)
    async VerificarEmailUpdate(email: string, id: string) {
        const Conexion = await conectar.getConnection();
        const Results = await Conexion.query(`
            SELECT COUNT(*) AS existe 
            FROM user 
            WHERE Email = ? AND id_user != ? AND Estado = 1
        `, [email, id]);
        const existeBigInt = Results[0].existe;
        const existeNumber = Number(existeBigInt);
        Conexion.release();
        return existeNumber;
    },

    // GET - Obtener habilidades de un docente
    async Gethabilidades(id: string) {
        const Conexion = await conectar.getConnection();
        const Results = await Conexion.query(`
            SELECT
                dochabi.id_dochabi,
                dochabi.id_habi,
                habilidades.n_habilidad
            FROM dochabi
            JOIN habilidades ON dochabi.id_habi = habilidades.id_habi 
            WHERE dochabi.id_user = ? AND dochabi.Estado = 1
        `, [id]);
        Conexion.release();
        return Results;
    },

    // POST - Crear docente
    async AddDocenteModels(data: DataDocentes) {
        const Conexion = await conectar.getConnection();
        const result: any = await Conexion.query(
            `
            INSERT INTO user(id_rol, nombre, apellido, telefono, Cvlink, formacion, descripcion, honorarios, Email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                2,
                data.nombre,
                data.apellido,
                data.celular,
                data.url,
                data.formacion,
                data.descripcion,
                data.honorarios,
                data.Email
            ]
        );
        Conexion.release();
        return Number(result.insertId);
    },

    // PUT - Actualizar docente
    async UpdateDocenteModels(id: string, data: DataDocentes) {
        const Conexion = await conectar.getConnection();
        await Conexion.query(
            `
            UPDATE user 
            SET 
                nombre = ?,
                apellido = ?,
                telefono = ?,
                Cvlink = ?,
                formacion = ?,
                descripcion = ?,
                honorarios = ?,
                Email = ?
            WHERE id_user = ?
            `,
            [
                data.nombre,
                data.apellido,
                data.celular,
                data.url,
                data.formacion,
                data.descripcion,
                data.honorarios,
                data.Email,
                id
            ]
        );
        Conexion.release();
    },

    // Agregar relación docente-habilidad
    async addDochabi(idUser: number | string, idHabi: number | string) {
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            INSERT INTO dochabi(id_user, id_Habi) 
            VALUES(?, ?)
        `, [idUser, idHabi]);
        Conexion.release();
    },

    // Eliminar habilidades de un docente (soft delete)
    async DeleteDochabi(idUser: string) {
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            UPDATE dochabi 
            SET Estado = 0 
            WHERE id_user = ?
        `, [idUser]);
        Conexion.release();
    },

    // Actualizar ruta de imagen
    async UpdateRutaimg(ruta: string, id: number | string) {
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            UPDATE user 
            SET img = ? 
            WHERE id_user = ?
        `, [ruta, id]);
        Conexion.release();
    },

    // Actualizar ruta de CV
    async UpdateCvRuta(ruta: string, id: number | string) {
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            UPDATE user 
            SET cv = ? 
            WHERE id_user = ?
        `, [ruta, id]);
        Conexion.release();
    },

    // DELETE - Eliminar docente (soft delete)
    async DeleteDocentes(id: string) {
        const Conexion = await conectar.getConnection();
        await Conexion.query(`
            UPDATE user 
            SET Estado = 0 
            WHERE id_user = ?
        `, [id]);
        Conexion.release();
        return 'Docente eliminado exitosamente';
    },
    async AddRegisterDocenteModels(nombre,apellido,telefono,Emails, passwd) {
        const Conexion = await conectar.getConnection();
        const result: any = await Conexion.query(
            `
            INSERT INTO user(id_rol, nombre, apellido, telefono,Email,passwd)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                2,
                nombre,
                apellido,
                telefono,
                Emails,
                passwd
            ]
        );
        Conexion.release();
        return Number(result.insertId);
    },

    async RegisterToken(idUser,token,Expira){
        const cx = await conectar.getConnection();
        await cx.query(`
           INSERT INTO Token(id_user,token,expires_at) VALUES(?,?,?);
        `,[idUser,token,Expira]);
        cx.release();
    },
    async GetDataUserEmail(id){
        const cx = await conectar.getConnection();
        const [Results] = await cx.query(`
           SELECT nombre,apellido,Email FROM user WHERE id_user = ?;    
        `,[id]);
        cx.release()
        return Results
    },
    async ConfirmedDocente(idUser, Code){
        const cx = await conectar.getConnection();
        const [Rows] = await cx.query(`
            SELECT * FROM Token where id_user = ? and token = ? and expires_at > NOW() LIMIT 1;    
        `,[idUser,Code]);
    
        if (Rows.length === 0) {
            return "Código inválido o expirado"
        }
        await cx.query(`
            UPDATE user set Confirmed = 1 where id_user = ?;
        `,[Rows.id_user]);

        await cx.query(`
            DELETE FROM Token where id_user = ? and token = ?;    
        `,[idUser,Code]);
        
        cx.release();

        return "Cuenta Confirmada, Inicie Session"
    }
}

export default DataDocentes;