"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mariadb_1 = __importDefault(require("mariadb"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/*console.log("🔍 Verificando variables de moodle:");
console.log("URL_BD:", process.env.URL_BD);
console.log("USER_BD:", process.env.URL_MOODLE);
console.log("DATABASE:", process.env.BD_MOODLE);
console.log("PORT_BD:", process.env.PORT_BD);
console.log("---");
*/
const data = mariadb_1.default.createPool({
    host: process.env.URL_BD,
    user: process.env.URL_MOODLE,
    password: process.env.PASSWORD_MOODLE,
    database: process.env.BD_MOODLE,
    connectionLimit: 20,
    acquireTimeout: 20000,
    idleTimeout: 30000,
    resetAfterUse: true,
    minimumIdle: 5,
});
async function testConnection() {
    try {
        const connection = await data.getConnection();
        console.log("Conexión exitosa a la base de datos.");
        connection.release();
    }
    catch (error) {
        console.error("Error al conectar con la base de datos:", error);
    }
}
//testConnection();
exports.default = data;
//# sourceMappingURL=MoodleDb.js.map