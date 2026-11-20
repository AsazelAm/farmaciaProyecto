-- ============================================================================
-- Farmacia Dr. Osvaldo · dbfarmacia
-- Tabla: mermalote (expediente de bajas / mermas de lotes vencidos)
-- Motor: MariaDB / InnoDB / utf8mb4
--
-- IMPORTANTE: en `dbfarmacia19-11-2026.sql` esta tabla YA EXISTE con esta
-- exacta estructura (0 filas). Este script es idempotente: si la aplicas sobre
-- tu BD actual no modificará nada. Solo es necesario en instalaciones que aún
-- no tengan la tabla.
--
-- Aplicar con:
--   mysql -u <user> -p -P 3307 dbfarmacia < backend/sql/001_mermalote.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS `mermalote` (
  `idBajaVencimiento` int(11) NOT NULL AUTO_INCREMENT,
  `idLote` int(11) NOT NULL,
  `idSucursal` int(11) DEFAULT NULL,
  `idUsuario` int(11) NOT NULL,
  `idUsuarioAutoriza` int(11) DEFAULT NULL,
  `idDevolucionProveedor` int(11) DEFAULT NULL,
  `cantidadAfectada` int(11) NOT NULL,
  `costoUnitario` decimal(10,2) NOT NULL DEFAULT 0.00,
  `montoPerdida` decimal(10,2) NOT NULL DEFAULT 0.00,
  `accionTomada` enum('cuarentena','baja_merma','destruccion','devolucion_proveedor') NOT NULL DEFAULT 'cuarentena',
  `estado` enum('pendiente','aprobada','ejecutada','anulada') NOT NULL DEFAULT 'pendiente',
  `fechaDeteccion` datetime NOT NULL DEFAULT current_timestamp(),
  `fechaEjecucion` datetime DEFAULT NULL,
  `motivoDetalle` text DEFAULT NULL,
  `fechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fechaModificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`idBajaVencimiento`),
  KEY `fk_baja_venc_lote` (`idLote`),
  KEY `fk_baja_venc_sucursal` (`idSucursal`),
  KEY `fk_baja_venc_usuario` (`idUsuario`),
  KEY `fk_baja_venc_autoriza` (`idUsuarioAutoriza`),
  KEY `fk_baja_venc_devprov` (`idDevolucionProveedor`),
  CONSTRAINT `fk_baja_venc_autoriza` FOREIGN KEY (`idUsuarioAutoriza`) REFERENCES `usuario` (`idUsuario`),
  CONSTRAINT `fk_baja_venc_devprov` FOREIGN KEY (`idDevolucionProveedor`) REFERENCES `devolucionproveedor` (`idDevolucionProveedor`),
  CONSTRAINT `fk_baja_venc_lote` FOREIGN KEY (`idLote`) REFERENCES `lote` (`idLote`),
  CONSTRAINT `fk_baja_venc_sucursal` FOREIGN KEY (`idSucursal`) REFERENCES `sucursal` (`idSucursal`),
  CONSTRAINT `fk_baja_venc_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`),
  CONSTRAINT `chk_baja_venc_cantidad` CHECK (`cantidadAfectada` > 0),
  CONSTRAINT `chk_baja_venc_costo` CHECK (`costoUnitario` >= 0),
  CONSTRAINT `chk_baja_venc_perdida` CHECK (`montoPerdida` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
