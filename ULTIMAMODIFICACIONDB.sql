-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         8.4.3 - MySQL Community Server - GPL
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.15.0.7171
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para dbfarmacia
CREATE DATABASE IF NOT EXISTS `dbfarmacia` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `dbfarmacia`;

-- Volcando estructura para tabla dbfarmacia.cliente
CREATE TABLE IF NOT EXISTS `cliente` (
  `idCliente` int NOT NULL AUTO_INCREMENT,
  `ci` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `fechaCreacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idCliente`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.cliente: ~0 rows (aproximadamente)

-- Volcando estructura para tabla dbfarmacia.compra
CREATE TABLE IF NOT EXISTS `compra` (
  `idCompra` int NOT NULL AUTO_INCREMENT,
  `numeroFactura` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fechaCreacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaModificaion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `fechaEntrega` datetime DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `descuento` decimal(10,2) NOT NULL DEFAULT '0.00',
  `impuesto` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `observaciones` text COLLATE utf8mb4_general_ci,
  `idProveedor` int NOT NULL,
  `idUsuario` int NOT NULL,
  `idSucursal` int NOT NULL,
  PRIMARY KEY (`idCompra`) USING BTREE,
  KEY `fk_compra_proveedor` (`idProveedor`) USING BTREE,
  KEY `fk_compra_usuario` (`idUsuario`) USING BTREE,
  KEY `fk_compra_sucursal` (`idSucursal`) USING BTREE,
  CONSTRAINT `fk_compra_proveedor` FOREIGN KEY (`idProveedor`) REFERENCES `proveedor` (`idProveedor`),
  CONSTRAINT `fk_compra_sucursal` FOREIGN KEY (`idSucursal`) REFERENCES `sucursal` (`idSucursal`),
  CONSTRAINT `fk_compra_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.compra: ~0 rows (aproximadamente)

-- Volcando estructura para tabla dbfarmacia.detallecompra
CREATE TABLE IF NOT EXISTS `detallecompra` (
  `cantidad` int NOT NULL,
  `precioUnitario` decimal(10,2) NOT NULL,
  `descuento` decimal(10,2) NOT NULL DEFAULT '0.00',
  `subtotal` decimal(10,2) NOT NULL,
  `fechaCreacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `idLote` int NOT NULL,
  `idCompra` int NOT NULL,
  KEY `fk_detcompra_lote` (`idLote`) USING BTREE,
  KEY `fk_detcompra_compra` (`idCompra`) USING BTREE,
  CONSTRAINT `fk_detcompra_compra` FOREIGN KEY (`idCompra`) REFERENCES `compra` (`idCompra`),
  CONSTRAINT `fk_detcompra_lote` FOREIGN KEY (`idLote`) REFERENCES `lote` (`idLote`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.detallecompra: ~0 rows (aproximadamente)

-- Volcando estructura para tabla dbfarmacia.detalleventa
CREATE TABLE IF NOT EXISTS `detalleventa` (
  `cantidad` int NOT NULL,
  `precioUnitario` decimal(10,2) NOT NULL,
  `descuento` decimal(10,2) NOT NULL DEFAULT '0.00',
  `subtotal` decimal(10,2) NOT NULL,
  `fechaCreacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `idLote` int NOT NULL,
  `idVenta` int NOT NULL,
  `idProducto` int NOT NULL,
  KEY `fk_detalleventa_lote` (`idLote`) USING BTREE,
  KEY `fk_detalleventa_venta` (`idVenta`) USING BTREE,
  KEY `fk_detalleventa_producto` (`idProducto`) USING BTREE,
  CONSTRAINT `fk_detalleventa_lote` FOREIGN KEY (`idLote`) REFERENCES `lote` (`idLote`),
  CONSTRAINT `fk_detalleventa_producto` FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`),
  CONSTRAINT `fk_detalleventa_venta` FOREIGN KEY (`idVenta`) REFERENCES `venta` (`idVenta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.detalleventa: ~0 rows (aproximadamente)

-- Volcando estructura para tabla dbfarmacia.factura
CREATE TABLE IF NOT EXISTS `factura` (
  `idFactura` int NOT NULL AUTO_INCREMENT,
  `numeroFactura` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `fechaEmision` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tipoFactura` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `nitCliente` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `razonSocial` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `descuento` decimal(10,2) NOT NULL DEFAULT '0.00',
  `impuesto` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `estado` varchar(20) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'emitida',
  `fechaAnulacion` datetime DEFAULT NULL,
  `motivoAnulacion` text COLLATE utf8mb4_general_ci,
  `idVenta` int NOT NULL,
  PRIMARY KEY (`idFactura`) USING BTREE,
  UNIQUE KEY `uq_numerofactura` (`numeroFactura`) USING BTREE,
  KEY `fk_factura_id_venta` (`idVenta`) USING BTREE,
  CONSTRAINT `fk_factura_id_venta` FOREIGN KEY (`idVenta`) REFERENCES `venta` (`idVenta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.factura: ~0 rows (aproximadamente)

-- Volcando estructura para tabla dbfarmacia.laboratorio
CREATE TABLE IF NOT EXISTS `laboratorio` (
  `idLaboratorio` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `img` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `fechaCreacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idLaboratorio`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.laboratorio: ~3 rows (aproximadamente)
INSERT INTO `laboratorio` (`idLaboratorio`, `nombre`, `img`, `estado`, `fechaCreacion`, `fechaModificacion`) VALUES
	(1, 'INTI', 'Uploads\\img\\Laboratorio\\1-2026-04-1405-03-59\\1-2026-04-1405-03-59.webp', 1, '2026-04-14 05:03:59', '2026-04-14 05:04:01'),
	(2, 'ASDS', 'Uploads\\img\\Laboratorio\\2-2026-04-1405-05-10\\2-2026-04-1405-05-10.webp', 0, '2026-04-14 05:05:10', '2026-04-14 05:19:21'),
	(3, 'SERIO', 'Uploads\\img\\Laboratorio\\3-2026-04-1405-42-53\\3-2026-04-1405-42-53.webp', 1, '2026-04-14 05:41:59', '2026-04-14 05:42:55');

-- Volcando estructura para tabla dbfarmacia.lote
CREATE TABLE IF NOT EXISTS `lote` (
  `idLote` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `numeroLote` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `fechaVencimiento` date NOT NULL,
  `precioCompra` decimal(10,2) NOT NULL DEFAULT '0.00',
  `fechaIngreso` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaCreacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `fechaFabricacion` date DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `idProducto` int NOT NULL,
  `idProveedor` int NOT NULL,
  PRIMARY KEY (`idLote`) USING BTREE,
  UNIQUE KEY `uq_lote_codigo` (`codigo`),
  KEY `fk_lote_producto` (`idProducto`) USING BTREE,
  KEY `fk_lote_proveedor` (`idProveedor`) USING BTREE,
  CONSTRAINT `fk_lote_producto` FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`),
  CONSTRAINT `fk_lote_proveedor` FOREIGN KEY (`idProveedor`) REFERENCES `proveedor` (`idProveedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.lote: ~0 rows (aproximadamente)

-- Volcando estructura para tabla dbfarmacia.presentacion
CREATE TABLE IF NOT EXISTS `presentacion` (
  `idPresentacion` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) COLLATE utf8mb4_general_ci NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `fechaCreacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idPresentacion`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.presentacion: ~6 rows (aproximadamente)
INSERT INTO `presentacion` (`idPresentacion`, `nombre`, `estado`, `fechaCreacion`, `fechaModificacion`) VALUES
	(1, 'Tableta', 1, '2026-04-13 21:46:54', '2026-04-13 21:46:54'),
	(2, 'Jarabe', 1, '2026-04-13 21:47:16', '2026-04-13 21:47:16'),
	(3, 'Inyectable', 0, '2026-04-13 21:47:38', '2026-04-13 21:48:13'),
	(4, 'eje', 0, '2026-04-13 21:48:26', '2026-04-13 21:51:12'),
	(5, 'Capsula', 1, '2026-04-13 21:48:53', '2026-04-14 01:29:04'),
	(6, 'asdddasdf', 0, '2026-04-14 01:05:42', '2026-04-14 01:20:09'),
	(7, 'SÑDF', 0, '2026-04-14 01:29:23', '2026-04-14 01:29:34'),
	(8, 'ALGO', 0, '2026-04-26 22:49:09', '2026-04-26 22:49:41'),
	(9, 'A', 0, '2026-04-26 22:54:32', '2026-04-26 22:54:55');

-- Volcando estructura para tabla dbfarmacia.producto
CREATE TABLE IF NOT EXISTS `producto` (
  `idProducto` int NOT NULL AUTO_INCREMENT,
  `codigoBarra` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `nombreGenerico` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `nombreComercial` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `concentracion` varchar(80) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `precio` decimal(10,2) NOT NULL DEFAULT '0.00',
  `img` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `requiereReceta` tinyint(1) NOT NULL DEFAULT '0',
  `fechaCreacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `contraindicaciones` text COLLATE utf8mb4_general_ci,
  `viaAdministracion` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `stockMinimo` int NOT NULL DEFAULT '0',
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `idLaboratorio` int NOT NULL,
  `idTipoProd` int NOT NULL,
  `idPresentacion` int NOT NULL,
  PRIMARY KEY (`idProducto`) USING BTREE,
  UNIQUE KEY `uq_codigo_barra` (`codigoBarra`) USING BTREE,
  KEY `fk_prod_laboratorio` (`idLaboratorio`) USING BTREE,
  KEY `fk_prod_tipo_producto` (`idTipoProd`) USING BTREE,
  KEY `fk_prod_presentacion` (`idPresentacion`) USING BTREE,
  CONSTRAINT `fk_prod_laboratorio` FOREIGN KEY (`idLaboratorio`) REFERENCES `laboratorio` (`idLaboratorio`),
  CONSTRAINT `fk_prod_presentacion` FOREIGN KEY (`idPresentacion`) REFERENCES `presentacion` (`idPresentacion`),
  CONSTRAINT `fk_prod_tipo_producto` FOREIGN KEY (`idTipoProd`) REFERENCES `tipoproducto` (`idTipoProd`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.producto: ~0 rows (aproximadamente)

-- Volcando estructura para tabla dbfarmacia.proveedor
CREATE TABLE IF NOT EXISTS `proveedor` (
  `idProveedor` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(30) COLLATE utf8mb4_general_ci NOT NULL,
  `nombre` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `direccion` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contactoPrincipal` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `fechaCreacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idProveedor`) USING BTREE,
  UNIQUE KEY `uq_provee_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.proveedor: ~0 rows (aproximadamente)

-- Volcando estructura para tabla dbfarmacia.sucursal
CREATE TABLE IF NOT EXISTS `sucursal` (
  `idSucursal` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `direccion` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `fechaCreacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idSucursal`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.sucursal: ~0 rows (aproximadamente)
INSERT INTO `sucursal` (`idSucursal`, `nombre`, `direccion`, `estado`, `fechaCreacion`, `fechaModificacion`) VALUES
	(1, 'prueba', 'direccionPrueba', 1, '2026-03-15 23:35:58', '2026-03-15 23:35:58');

-- Volcando estructura para tabla dbfarmacia.tipoproducto
CREATE TABLE IF NOT EXISTS `tipoproducto` (
  `idTipoProd` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) COLLATE utf8mb4_general_ci NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `fechaCreacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idTipoProd`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.tipoproducto: ~7 rows (aproximadamente)
INSERT INTO `tipoproducto` (`idTipoProd`, `nombre`, `estado`, `fechaCreacion`, `fechaModificacion`) VALUES
	(1, 'P11', 1, '2026-04-13 22:54:13', '2026-04-13 22:54:13'),
	(2, 'new123', 0, '2026-04-13 23:30:10', '2026-04-13 23:45:12'),
	(3, 'Nada', 1, '2026-04-13 23:30:29', '2026-04-14 00:13:15'),
	(4, 'Serio', 1, '2026-04-13 23:34:21', '2026-04-13 23:43:39'),
	(5, 'ama', 0, '2026-04-14 00:08:00', '2026-04-14 01:42:32'),
	(6, 'AJO', 0, '2026-04-26 22:49:56', '2026-04-26 22:50:31'),
	(7, 'ASD', 0, '2026-04-26 22:55:42', '2026-04-26 22:55:54');

-- Volcando estructura para tabla dbfarmacia.tipous
CREATE TABLE IF NOT EXISTS `tipous` (
  `idTipoUs` int NOT NULL AUTO_INCREMENT,
  `nameRol` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fechaCreacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idTipoUs`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.tipous: ~10 rows (aproximadamente)
INSERT INTO `tipous` (`idTipoUs`, `nameRol`, `fechaCreacion`, `fechaModificacion`, `estado`) VALUES
	(1, 'Admin', '2026-03-15 22:32:23', '2026-03-15 23:56:12', 1),
	(2, 'Farmaceutico', '2026-04-13 01:39:02', '2026-04-13 01:40:05', 1),
	(3, 'Bodeguero', '2026-04-13 01:42:06', '2026-04-13 04:10:24', 1),
	(4, 'QUEPASA', '2026-04-13 01:48:58', '2026-04-13 14:08:37', 0),
	(5, 'Josue', '2026-04-13 02:02:07', '2026-04-13 14:07:51', 0),
	(6, 'sgsdfgs', '2026-04-13 03:27:25', '2026-04-13 04:11:35', 0),
	(7, 'Doctoraa', '2026-04-13 09:14:33', '2026-04-13 14:06:40', 0),
	(8, 'Doctoraa', '2026-04-13 09:15:30', '2026-04-13 09:15:40', 0),
	(9, 'GAA', '2026-04-13 14:07:19', '2026-04-13 14:07:31', 0),
	(10, 'prueba3', '2026-04-26 22:17:29', '2026-04-26 22:27:27', 0);

-- Volcando estructura para tabla dbfarmacia.usuario
CREATE TABLE IF NOT EXISTS `usuario` (
  `idUsuario` int NOT NULL AUTO_INCREMENT,
  `ci` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `img` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `passwd` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `ultimoAcceso` datetime DEFAULT NULL,
  `fechaCreacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `confirmed` tinyint(1) DEFAULT '0',
  `idTipoUs` int NOT NULL,
  `idSucursal` int NOT NULL,
  PRIMARY KEY (`idUsuario`) USING BTREE,
  UNIQUE KEY `uq_usuario_ci` (`ci`),
  UNIQUE KEY `uq_usuario_email` (`email`) USING BTREE,
  KEY `fk_usuario_id_tipo_us` (`idTipoUs`) USING BTREE,
  KEY `fk_usuario_sucursal` (`idSucursal`) USING BTREE,
  CONSTRAINT `fk_usuario_id_tipo_us` FOREIGN KEY (`idTipoUs`) REFERENCES `tipous` (`idTipoUs`),
  CONSTRAINT `fk_usuario_sucursal` FOREIGN KEY (`idSucursal`) REFERENCES `sucursal` (`idSucursal`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.usuario: ~10 rows (aproximadamente)
INSERT INTO `usuario` (`idUsuario`, `ci`, `nombre`, `apellido`, `img`, `passwd`, `telefono`, `email`, `estado`, `ultimoAcceso`, `fechaCreacion`, `fechaModificacion`, `confirmed`, `idTipoUs`, `idSucursal`) VALUES
	(1, '12121212', 'Guillermo', 'Mullisaca', 'Uploads/sinIMG', '$2b$10$BC1mNy/JfEcp.h82T6yH4Ob.8CG8dzb8Y2xFOxPH.fr0ZZQXn9KfO', '41491031', 'guillermoAdmin@gmail.com', 1, NULL, '2026-03-15 23:37:10', '2026-03-16 00:30:47', 1, 1, 1),
	(2, '136125412', 'JoseEDITADO', 'ErnestoEDITADO', 'Uploads\\img\\Usuario\\2-2026-04-1315-44-53\\2-2026-04-1315-44-53.webp', '$2b$10$HgzySOFtlW6Mc1xyoLUs4enIlMaBI6Vr9vwICjqO4MIlfoiNXLna.', '73189038', 'JoseAdmin@gmail.com', 1, NULL, '2026-04-13 15:44:53', '2026-04-13 19:41:24', 1, 1, 1),
	(3, '1370981', 'P1', 'P11', NULL, '$2b$10$xntPLRs5dXNPaIGzYXv0Yu/7IhlO6Zn.wzUqZSOdHydpFGt5L.oru', '12345', 'guillermoFarma@gmail.com', 0, NULL, '2026-04-13 15:49:43', '2026-04-13 16:10:17', 1, 2, 1),
	(4, '13612541', 'Asaf Guillermo', 'Ajoruro Mullisaca', 'Uploads\\img\\Usuario\\4-2026-04-1315-58-08\\4-2026-04-1315-58-08.webp', '$2b$10$rps2lZW8ZSzckU1xWZ9Ax.ZwHcooVSNxvTe25xk5xej732LNHacRu', '73189028', 'asafAdmin@gmail.com', 1, NULL, '2026-04-13 15:58:08', '2026-04-13 15:58:13', 1, 1, 1),
	(5, '12121211', 'ASDFA', 'ASDFD', NULL, '$2b$10$CnL4Yw4FyXq1LAlLc4TPQ.LxlkejSOYLWfNoS/YVs4aaC4dOjoP2i', '2425241', 'XAAdmin@gmail.com', 0, NULL, '2026-04-13 16:28:40', '2026-04-13 17:46:21', 1, 3, 1),
	(6, '1111111', 'p2', 'p22', 'Uploads\\img\\Usuario\\6-2026-04-1317-30-55\\6-2026-04-1317-30-55.webp', '$2b$10$V9FGsXRezFsslgHSZ7RkZe71e6z6164UELX09bkSe3EglMISYUIzG', '', 'añamoAdmin@gmail.com', 1, NULL, '2026-04-13 17:30:55', '2026-04-13 18:16:39', 1, 3, 1),
	(7, '9782746', 'Brayan Josue', 'Mamani Morales', 'Uploads\\img\\Usuario\\7-2026-04-1317-34-27\\7-2026-04-1317-34-27.webp', '$2b$10$xxy.EG4fMMRGWy2wnmVN2u6QZxm5Q7MDZFfFLCqHFlDcvl7rlCPf.', '', 'brayanFarmaceu@gmail.com', 0, NULL, '2026-04-13 17:34:27', '2026-04-14 01:56:31', 1, 1, 1),
	(8, '9876242', 'Manuel', 'Arauza', 'Uploads\\img\\Usuario\\8-2026-04-1318-33-15\\8-2026-04-1318-33-15.webp', '$2b$10$nXCvVfAgIOaalGBmtYYgo.86PTCcjS1OMyBs0N399YMoA/r6rB8Ry', '73180745', 'manuleFarma@gmail.com', 0, NULL, '2026-04-13 17:45:42', '2026-04-26 22:28:22', 1, 3, 1),
	(9, '13414114', 'asdfasfa', 'sdsdfasdf', 'Uploads\\img\\Usuario\\9-2026-04-1403-04-45\\9-2026-04-1403-04-45.webp', '$2b$10$PXDsPuqyqz4V2ZoK.cslqelEyxk5F41KSi4ot1CPbrrhKFs6TmLgW', '', 'NuebaAdmin@gmail.com', 1, NULL, '2026-04-14 03:04:46', '2026-04-14 03:04:49', 1, 2, 1),
	(10, '13141231', 'prueba23', 'prueba23', NULL, '$2b$10$VBFpX0wLrz6QxOzesDh7feWw2uEvwQvazwmq2/mUAy1H7gZX9jL2C', '', 'pruebaAdmin@gmail.com', 1, NULL, '2026-04-26 23:43:25', '2026-04-26 23:47:44', 1, 1, 1);

-- Volcando estructura para tabla dbfarmacia.venta
CREATE TABLE IF NOT EXISTS `venta` (
  `idVenta` int NOT NULL AUTO_INCREMENT,
  `fechaCreacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaModificaion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `descuentoTotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `impuestos` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `estado` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pendiente',
  `tipoPago` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_general_ci,
  `idCliente` int NOT NULL,
  `idUsuario` int NOT NULL,
  `idSucursal` int NOT NULL,
  PRIMARY KEY (`idVenta`) USING BTREE,
  KEY `fk_venta_cliente` (`idCliente`) USING BTREE,
  KEY `fk_venta_usuario` (`idUsuario`) USING BTREE,
  KEY `fk_venta_sucursal` (`idSucursal`) USING BTREE,
  CONSTRAINT `fk_venta_cliente` FOREIGN KEY (`idCliente`) REFERENCES `cliente` (`idCliente`),
  CONSTRAINT `fk_venta_sucursal` FOREIGN KEY (`idSucursal`) REFERENCES `sucursal` (`idSucursal`),
  CONSTRAINT `fk_venta_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.venta: ~0 rows (aproximadamente)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
