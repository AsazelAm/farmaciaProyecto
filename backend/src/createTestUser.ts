import { HashPassword } from "./Utils/auth";
import data from "./config/db";

async function createTestUser() {
  try {
    const hashedPassword = await HashPassword("12345678");

    const connection = await data.getConnection();

    // Verificar si el usuario ya existe
    const [existing] = await connection.query(
      `SELECT idUsuario FROM usuario WHERE email = 'guillermoAdmin@gmail.com'`
    );

    if (existing) {
      console.log("⚠️  El usuario ya existe, actualizando contraseña...");
      await connection.query(
        `UPDATE usuario SET passwd = ?, estado = 1 WHERE email = 'guillermoAdmin@gmail.com'`,
        [hashedPassword]
      );
    } else {
      await connection.query(
        `
                 INSERT INTO usuario (ci,nombre,apellido,img,passwd,telefono,email,estado,idTipoUs,idSucursal)
                VALUES (12121212,'Guillermo','Mullisaca','Uploads/sinIMG',?,'41491031','guillermoAdmin@gmail.com',1,1,1);
            `,
        [hashedPassword]
      );
    }

    console.log("✅ Usuario de prueba listo");
    console.log("📧 Email: guillermoAdmin@gmail.com");
    console.log("🔑 Password: 12345678");

    connection.release();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createTestUser();
