-- Migracion: campos para codigo de verificacion de inicio de sesion (OTP por email)
ALTER TABLE `usuario`
  ADD COLUMN `codigoVerificacion` VARCHAR(6) NULL DEFAULT NULL,
  ADD COLUMN `codigoExpiracion` DATETIME NULL DEFAULT NULL,
  ADD COLUMN `codigoIntentos` TINYINT(1) NOT NULL DEFAULT 0;
