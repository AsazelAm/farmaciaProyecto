import conectar from '../config/db';

// ─── Interfaz interna del modelo (acorde a la BD normalizada) ─────────────────
interface IProducto {
    codigoBarra:        string;
    nombreComercial:    string | null;
    descripcion:        string | null;
    precio:             number;
    img:                string | null;
    requiereReceta:     number;          // 0 | 1
    contraindicaciones: string | null;
    viaAdministracion:  string | null;
    stockMinimo:        number;
    idLaboratorio:      number;
    idPresentacion:     number;
}

const DataProducto = {

    // ── GET: lista todos los productos activos con sus relaciones N:M ─────────
    async GetProductoM() {
        const conection = await conectar.getConnection();
        try {
            const [products, principios, tipos] = await Promise.all([
                conection.query(`
                    SELECT
                        p.idProducto,
                        p.codigoBarra,
                        p.nombreComercial,
                        p.descripcion,
                        p.precio,
                        p.img,
                        p.requiereReceta,
                        p.fechaCreacion,
                        p.fechaModificacion,
                        p.contraindicaciones,
                        p.viaAdministracion,
                        p.stockMinimo,
                        p.estado,
                        p.idLaboratorio,
                        p.idPresentacion,
                        l.nombre  AS nombreLaboratorio,
                        pr.nombre AS nombrePresentacion
                    FROM producto p
                    INNER JOIN laboratorio  l  ON p.idLaboratorio  = l.idLaboratorio
                    INNER JOIN presentacion pr ON p.idPresentacion = pr.idPresentacion
                    WHERE p.estado = 1
                    ORDER BY p.fechaCreacion DESC;
                `),
                conection.query(`
                    SELECT
                        ppa.idProducto,
                        ppa.idPrincipioActivo,
                        ppa.concentracion,
                        pa.nombre AS nombrePrincipio
                    FROM productoprincipioactivo ppa
                    INNER JOIN principio_activo pa ON pa.idPrincipioActivo = ppa.idPrincipioActivo
                    INNER JOIN producto p ON p.idProducto = ppa.idProducto
                    WHERE p.estado = 1
                    ORDER BY ppa.idProducto ASC, ppa.idPrincipioActivo ASC;
                `),
                conection.query(`
                    SELECT
                        ptp.idProducto,
                        tp.idTipoProd,
                        tp.nombre AS nombreTipo
                    FROM productotipoproducto ptp
                    INNER JOIN tipoproducto tp ON tp.idTipoProd = ptp.idTipoProd
                    INNER JOIN producto p ON p.idProducto = ptp.idProducto
                    WHERE p.estado = 1 AND tp.estado = 1
                    ORDER BY ptp.idProducto ASC, ptp.idTipoProd ASC;
                `),
            ]);

            const principiosMap = new Map<number, any[]>();
            for (const row of principios as any[]) {
                if (!principiosMap.has(row.idProducto)) principiosMap.set(row.idProducto, []);
                principiosMap.get(row.idProducto)!.push({
                    idPrincipioActivo: Number(row.idPrincipioActivo),
                    nombre: row.nombrePrincipio,
                    concentracion: row.concentracion ?? null,
                });
            }

            const tiposMap = new Map<number, any[]>();
            for (const row of tipos as any[]) {
                if (!tiposMap.has(row.idProducto)) tiposMap.set(row.idProducto, []);
                tiposMap.get(row.idProducto)!.push({
                    idTipoProd: Number(row.idTipoProd),
                    nombre: row.nombreTipo,
                });
            }

            const results = (products as any[]).map((p: any) => {
                const principiosActivos = principiosMap.get(Number(p.idProducto)) ?? [];
                const tiposProducto = tiposMap.get(Number(p.idProducto)) ?? [];
                const primero = principiosActivos[0];
                return {
                    ...p,
                    // Campos derivados (compatibilidad con la vista actual)
                    nombreGenerico: primero?.nombre ?? "",
                    concentracion: primero?.concentracion ?? null,
                    // N:M
                    principiosActivos,
                    tiposProducto,
                    idTipoProd: tiposProducto[0]?.idTipoProd ?? null,
                    nombreTipoProd: tiposProducto.map((t: any) => t.nombre).join(', ') || null,
                };
            });

            conection.release();
            return results;
        } catch (error) {
            conection.release();
            throw error;
        }
    },

    // ── ADD: inserta un nuevo producto ────────────────────────────────────────
    async AddProductoM(prod: IProducto) {
        const conection = await conectar.getConnection();
        const results = await conection.query(`
            INSERT INTO producto (
                codigoBarra, nombreComercial, descripcion, precio,
                requiereReceta, contraindicaciones, viaAdministracion,
                stockMinimo, idLaboratorio, idPresentacion
            ) VALUES (?,?,?,?,?,?,?,?,?,?);
        `, [
            prod.codigoBarra,
            prod.nombreComercial      || null,
            prod.descripcion          || null,
            prod.precio,
            prod.requiereReceta,
            prod.contraindicaciones   || null,
            prod.viaAdministracion    || null,
            prod.stockMinimo,
            prod.idLaboratorio,
            prod.idPresentacion,
        ]);
        conection.release();
        return Number(results.insertId);
    },

    // ── UPDATE img: actualiza solo la ruta de imagen ──────────────────────────
    async UpdateImgProductoM(ruta: string, idProducto: number | string) {
        const conection = await conectar.getConnection();
        await conection.query(`
            UPDATE producto SET img = ? WHERE idProducto = ?;
        `, [ruta, idProducto]);
        conection.release();
        return 'Imagen de producto guardada correctamente';
    },

    // ── UPDATE: actualiza los campos propios del producto ────────────────────
    async UpdateProductoM(prod: IProducto, idProducto: number | string) {
        const conection = await conectar.getConnection();
        await conection.query(`
            UPDATE producto SET
                codigoBarra        = ?,
                nombreComercial    = ?,
                descripcion        = ?,
                precio             = ?,
                requiereReceta     = ?,
                contraindicaciones = ?,
                viaAdministracion  = ?,
                stockMinimo        = ?,
                idLaboratorio      = ?,
                idPresentacion     = ?
            WHERE idProducto = ? AND estado = 1;
        `, [
            prod.codigoBarra,
            prod.nombreComercial      || null,
            prod.descripcion          || null,
            prod.precio,
            prod.requiereReceta,
            prod.contraindicaciones   || null,
            prod.viaAdministracion    || null,
            prod.stockMinimo,
            prod.idLaboratorio,
            prod.idPresentacion,
            idProducto,
        ]);
        conection.release();
        return 'Producto Actualizado';
    },

    // ── DELETE lógico: desactiva el producto ──────────────────────────────────
    async DeleteProductoM(idProducto: number | string) {
        const conection = await conectar.getConnection();
        await conection.query(`
            UPDATE producto SET estado = 0 WHERE idProducto = ?;
        `, [idProducto]);
        conection.release();
        return 'Producto Eliminado';
    },

    // ── Verificar código de barra único (CREATE) ──────────────────────────────
    async VerificarCodigoBarraM(codigoBarra: string) {
        const conection = await conectar.getConnection();
        const results = await conection.query(`
            SELECT COUNT(*) AS existe FROM producto WHERE codigoBarra = ? AND estado = 1;
        `, [codigoBarra]);
        const existe = Number(results[0].existe);
        conection.release();
        return existe;
    },

    // ── Verificar código de barra único (UPDATE, excluye el propio ID) ────────
    async VerificarCodigoBarraUpdateM(codigoBarra: string, idProducto: number | string) {
        const conection = await conectar.getConnection();
        const results = await conection.query(`
            SELECT COUNT(*) AS existe FROM producto
            WHERE codigoBarra = ? AND idProducto != ? AND estado = 1;
        `, [codigoBarra, idProducto]);
        const existe = Number(results[0].existe);
        conection.release();
        return existe;
    },

    // ── Principios activos (N:M) ──────────────────────────────────────────────
    async DeletePrincipiosProductoM(idProducto: number | string) {
        const conection = await conectar.getConnection();
        await conection.query(`
            DELETE FROM productoprincipioactivo WHERE idProducto = ?;
        `, [idProducto]);
        conection.release();
        return 'Principios activos de producto eliminados';
    },

    async AddPrincipioProductoM(idProducto: number | string, idPrincipioActivo: number, concentracion: string | null) {
        const conection = await conectar.getConnection();
        await conection.query(`
            INSERT INTO productoprincipioactivo (idProducto, idPrincipioActivo, concentracion)
            VALUES (?, ?, ?);
        `, [idProducto, idPrincipioActivo, concentracion || null]);
        conection.release();
        return 'Principio activo asociado al producto';
    },

    // ── Tipos de producto (N:M) ───────────────────────────────────────────────
    async DeleteTiposProductoM(idProducto: number | string) {
        const conection = await conectar.getConnection();
        await conection.query(`
            DELETE FROM productotipoproducto WHERE idProducto = ?;
        `, [idProducto]);
        conection.release();
        return 'Tipos de producto eliminados';
    },

    async AddTipoProductoM(idProducto: number | string, idTipoProd: number) {
        const conection = await conectar.getConnection();
        await conection.query(`
            INSERT INTO productotipoproducto (idProducto, idTipoProd)
            VALUES (?, ?);
        `, [idProducto, idTipoProd]);
        conection.release();
        return 'Tipo de producto asociado al producto';
    },

    // ── Find-or-create de catálogos (creación inline) ────────────────────────
    async FindOrCreateTipoM(nombre: string) {
        const name = String(nombre).trim();
        const conection = await conectar.getConnection();
        const existing = await conection.query(
            `SELECT idTipoProd FROM tipoproducto WHERE nombre = ? LIMIT 1;`, [name]
        );
        if (existing.length > 0) {
            const id = Number(existing[0].idTipoProd);
            conection.release();
            return id;
        }
        const inserted = await conection.query(
            `INSERT INTO tipoproducto (nombre, estado) VALUES (?, 1);`, [name]
        );
        conection.release();
        return Number(inserted.insertId);
    },

    async FindOrCreateLaboratorioM(nombre: string) {
        const name = String(nombre).trim();
        const conection = await conectar.getConnection();
        const existing = await conection.query(
            `SELECT idLaboratorio FROM laboratorio WHERE nombre = ? LIMIT 1;`, [name]
        );
        if (existing.length > 0) {
            const id = Number(existing[0].idLaboratorio);
            conection.release();
            return id;
        }
        const inserted = await conection.query(
            `INSERT INTO laboratorio (nombre) VALUES (?);`, [name]
        );
        conection.release();
        return Number(inserted.insertId);
    },

    async FindOrCreatePresentacionM(nombre: string) {
        const name = String(nombre).trim();
        const conection = await conectar.getConnection();
        const existing = await conection.query(
            `SELECT idPresentacion FROM presentacion WHERE nombre = ? LIMIT 1;`, [name]
        );
        if (existing.length > 0) {
            const id = Number(existing[0].idPresentacion);
            conection.release();
            return id;
        }
        const inserted = await conection.query(
            `INSERT INTO presentacion (nombre) VALUES (?);`, [name]
        );
        conection.release();
        return Number(inserted.insertId);
    },
};

export default DataProducto;