import conectar from '../config/db';

const DataPrincipioActivo = {
    // ── GET: lista los principios activos activos ──────────────────────────────
    async GetPrincipioActivoM() {
        const conection = await conectar.getConnection();
        const results = await conection.query(
            `SELECT idPrincipioActivo, nombre, descripcion, fechaCreacion
             FROM principio_activo WHERE estado = 1 ORDER BY nombre ASC;`
        );
        conection.release();
        return results;
    },

    // ── Find-or-create: devuelve el id existente o crea uno nuevo por nombre ──
    async FindOrCreatePrincipioM(nombre: string) {
        const name = String(nombre).trim();
        const conection = await conectar.getConnection();
        const existing = await conection.query(
            `SELECT idPrincipioActivo FROM principio_activo WHERE nombre = ? LIMIT 1;`,
            [name]
        );
        if (existing.length > 0) {
            const id = Number(existing[0].idPrincipioActivo);
            conection.release();
            return id;
        }
        try {
            const inserted = await conection.query(
                `INSERT INTO principio_activo (nombre, estado) VALUES (?, 1);`,
                [name]
            );
            conection.release();
            return Number(inserted.insertId);
        } catch (error: any) {
            // Posible condición de carrera por el UNIQUE del nombre. Reconsultar.
            const row = await conection.query(
                `SELECT idPrincipioActivo FROM principio_activo WHERE nombre = ? LIMIT 1;`,
                [name]
            );
            conection.release();
            return Number(row[0].idPrincipioActivo);
        }
    },
};

export default DataPrincipioActivo;