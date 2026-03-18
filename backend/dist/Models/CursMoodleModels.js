"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MoodleDb_1 = __importDefault(require("../config/MoodleDb"));
const DataCursMoodle = {
    async GetCursMoodle() {
        const Conexion = await MoodleDb_1.default.getConnection();
        const Results = await Conexion.query(`
         SELECT * FROM mdl_course ORDER BY startdate DESC    
     `);
        Conexion.release();
        return Results;
    }
};
exports.default = DataCursMoodle;
//# sourceMappingURL=CursMoodleModels.js.map