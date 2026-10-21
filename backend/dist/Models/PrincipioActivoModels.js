"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const DataPrincipioActivo = {
    // ── GET: lista los principios activos activos ──────────────────────────────
    async GetPrincipioActivoM() {
        const conection = await db_1.default.getConnection();
        const results = await conection.query(`SELECT idPrincipioActivo, nombre, descripcion, fechaCreacion
             FROM principio_activo WHERE estado = 1 ORDER BY nombre ASC;`);
        conection.release();
        return results;
    },
    // ── Find-or-create: devuelve el id existente o crea uno nuevo por nombre ──
    async FindOrCreatePrincipioM(nombre) {
        const name = String(nombre).trim();
        const conection = await db_1.default.getConnection();
        const existing = await conection.query(`SELECT idPrincipioActivo FROM principio_activo WHERE nombre = ? LIMIT 1;`, [name]);
        if (existing.length > 0) {
            const id = Number(existing[0].idPrincipioActivo);
            conection.release();
            return id;
        }
        try {
            const inserted = await conection.query(`INSERT INTO principio_activo (nombre, estado) VALUES (?, 1);`, [name]);
            conection.release();
            return Number(inserted.insertId);
        }
        catch (error) {
            // Posible condición de carrera por el UNIQUE del nombre. Reconsultar.
            const row = await conection.query(`SELECT idPrincipioActivo FROM principio_activo WHERE nombre = ? LIMIT 1;`, [name]);
            conection.release();
            return Number(row[0].idPrincipioActivo);
        }
    },
};
exports.default = DataPrincipioActivo;
//# sourceMappingURL=PrincipioActivoModels.js.map