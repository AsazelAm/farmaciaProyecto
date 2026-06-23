"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("./Utils/auth");
const db_1 = __importDefault(require("./config/db"));
async function createTestUser() {
    try {
        const hashedPassword = await (0, auth_1.HashPassword)("12345678");
        const connection = await db_1.default.getConnection();
        // Verificar si el usuario ya existe
        const [existing] = await connection.query(`SELECT id_usuario FROM usuario WHERE email = 'guillermoAdmin@gmail.com'`);
        if (existing) {
            console.log("⚠️  El usuario ya existe, actualizando contraseña...");
            await connection.query(`UPDATE usuario SET contrasena = ?, Estado = 1 WHERE email = 'guillermoAdmin@gmail.com'`, [hashedPassword]);
        }
        else {
            await connection.query(`
                 INSERT INTO usuario (id_usuario,ci,nombre,apellido,img,contrasena,telefono,email,Estado,id_tipo_us,id_sucursal)
                VALUES (1,12121212,'Guillermo','Mullisaca','Uploads/sinIMG',?,'41491031','guillermoAdmin@gmail.com',1,1,1);
            `, [hashedPassword]);
        }
        console.log("✅ Usuario de prueba listo");
        console.log("📧 Email: guillermoAdmin@gmail.com");
        console.log("🔑 Password: 12345678");
        connection.release();
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}
createTestUser();
//# sourceMappingURL=createTestUser.js.map