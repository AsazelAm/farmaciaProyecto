"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mariadb_1 = __importDefault(require("mariadb"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
console.log("🔍 Verificando variables de entorno:");
console.log("URL_BD:", process.env.URL_BD);
console.log("USER_BD:", process.env.USER_BD);
console.log("DATABASE:", process.env.DATABASE);
console.log("PORT_BD:", process.env.PORT_BD);
console.log("---");
const data = mariadb_1.default.createPool({
    host: process.env.URL_BD,
    user: process.env.USER_BD,
    password: process.env.USER_PASSWORD,
    database: process.env.DATABASE,
    port: parseInt(process.env.PORT_BD || "3307"),
    connectionLimit: 20,
    acquireTimeout: 40000,
    idleTimeout: 60000,
    resetAfterUse: true,
    minimumIdle: 5
});
async function testConnection() {
    try {
        const connection = await data.getConnection();
        console.log("Conexión exitosa a la base de datos.");
        connection.release();
    }
    catch (error) {
        console.error("Error al conectar con la base de datos:MIO ", error);
    }
}
testConnection();
exports.default = data;
//# sourceMappingURL=db.js.map