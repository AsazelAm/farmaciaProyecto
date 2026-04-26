import mariadb from "mariadb";
import dotenv from "dotenv";
import fs from "fs"; // Necesario para leer el certificado

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

    port: parseInt(process.env.PORT_BD || "4000"), 
    connectionLimit: 20,
    acquireTimeout: 60000, // Subimos un poco el tiempo por la latencia a AWS
    
    // CONFIGURACIÓN SSL CRÍTICA
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true 
    },

    idleTimeout: 60000,
    resetAfterUse: true,
    minimumIdle: 5
});

async function testConnection() {
    try {
        const connection = await data.getConnection();
        console.log("✅ Conexión exitosa a TiDB Cloud.");
        connection.release();
    } catch (error) {
        console.error("❌ Error al conectar con la base de datos: ", error);
    }
}

testConnection();

export default data;