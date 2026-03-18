import mariadb from "mariadb";
import dotenv from "dotenv";

dotenv.config();

console.log("🔍 Verificando variables de entorno:");
console.log("URL_BD:", process.env.URL_BD);
console.log("USER_BD:", process.env.USER_BD);
console.log("DATABASE:", process.env.DATABASE);
console.log("PORT_BD:", process.env.PORT_BD);
console.log("---");

const data = mariadb.createPool({
    host: process.env.URL_BD,
    user: process.env.USER_BD,
    password: process.env.USER_PASSWORD,
    database: process.env.DATABASE,
    port:parseInt(process.env.PORT_BD || "3307"),
    connectionLimit: 20,
    acquireTimeout: 20000,
    idleTimeout: 30000,
    resetAfterUse: true,
    minimumIdle: 5
});

async function testConnection() {
    try {
        const connection = await data.getConnection();
        console.log("Conexión exitosa a la base de datos.");
        connection.release();
    } catch (error) {
        console.error("Error al conectar con la base de datos:MIO ", error);
    }
}
testConnection();

export default data;
