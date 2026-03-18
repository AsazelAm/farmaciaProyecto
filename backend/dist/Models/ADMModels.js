"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
;
const DataADM = {
    async GetModalidades() {
        const conection = await db_1.default.getConnection();
        const results = await conection.query(`
           Select * from modalidad where Estado = 1;
            `);
        conection.release();
        return results;
    },
    async AddModalidadSchema(nombre) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
        INSERT INTO modalidad(modalidad) VALUES (?);
        `, [nombre]);
        Conexion.release();
        return 'Modalidad Creada';
    },
    async DeleteModalidad(id) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE modalidad set Estado = 0 where id_mod = ?;    
        `, [id]);
        Conexion.release();
        return "Modalidad Eliminado";
    },
    async UpdateModalidad(mod, id) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE modalidad set modalidad = ? where id_mod = ?;    
        `, [mod, id]);
        Conexion.release();
        return "Modalidad Actualizado";
    },
    async GetAreasDeConocimineto() {
        const Conexion = await db_1.default.getConnection();
        const Results = await Conexion.query(`SELECT id_areas,n_area FROM areas WHERE Estado = 1;`);
        Conexion.release();
        return Results;
    },
    async DeleteAreas(id) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            UPDATE areas set Estado = 0 where id_areas = ?    
        `, [id]);
        Conexion.release();
        return 'Area Eliminada';
    },
    async AddAreasModels(area) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
            INSERT INTO areas (n_area) VALUES (?);    
        `, [area]);
        Conexion.release();
        return "Area Creada";
    },
    async UpdateAreasModels(id, area) {
        const Conexion = await db_1.default.getConnection();
        await Conexion.query(`
                UPDATE areas set n_area = ? where id_areas = ?
            `, [area, id]);
        Conexion.release();
        return "Area Actualizada";
    },
    async GetEmpresaAll() {
        const Conexion = await db_1.default.getConnection();
        const Results = await Conexion.query(`
            SELECT id_empresa, n_emp FROM Empresa WHERE Estado = 1;
        `);
        Conexion.release();
        return Results;
    },
    async GetCountryModels() {
        const Conexion = await db_1.default.getConnection();
        const data = await Conexion.query(`
            SELECT id_country,pais FROM country WHERE Estado = 1;
            `);
        Conexion.release();
        return data;
    },
};
exports.default = DataADM;
//# sourceMappingURL=ADMModels.js.map