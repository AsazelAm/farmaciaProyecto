"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const DataSucursal = {
    async GetSucursalM() {
        const Conexion = await db_1.default.getConnection();
        const results = await Conexion.query(`
            SELECT idSucursal,nombre, fechaCreacion
            FROM sucursal WHERE estado = 1;`);
        Conexion.release();
        return results;
    },
};
exports.default = DataSucursal;
//# sourceMappingURL=SucursalModels.js.map