"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const DataHabilidad = {
    async GetHabilidades() {
        const conection = await db_1.default.getConnection();
        const results = await conection.query(`
          SELECT id_habi, n_habilidad FROM habilidades WHERE Estado = 1;
            `);
        conection.release();
        return results;
    }
};
exports.default = DataHabilidad;
//# sourceMappingURL=HabilidadModels.js.map