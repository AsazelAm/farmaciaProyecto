import mariadb from "mariadb";
import dotenv from "dotenv";

dotenv.config();

console.log("🔍 Verificando conexión a la base de datos...");

// Pasamos la URL completa incluyendo los parámetros de timeout y SSL directamente en el string
const connectionUri = process.env.DATABASE_URL || "mariadb://root:r3oSKTJ7DY3z9DnAE4SZyz6v@dbfarmacia-lit-maze.sage.cloud.layerbase.dev:47742/dbfarmacia?ssl-mode=REQUIRED&connectTimeout=60000&acquireTimeout=60000&connectionLimit=10";

// Al pasar un string directamente, TypeScript no se queja y el driver parsea todo automáticamente
const data = mariadb.createPool(connectionUri);

async function testConnection() {
    try {
        const connection = await data.getConnection();
        console.log("Conexión exitosa a la base de datos.");
        connection.release();
    } catch (error) {
        console.error("Error al conectar con la base de datos: MIO ", error);
    }
}
testConnection();

export default data;