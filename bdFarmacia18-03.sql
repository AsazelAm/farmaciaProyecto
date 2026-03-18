-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         10.4.27-MariaDB - mariadb.org binary distribution
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
CREATE DATABASE IF NOT EXISTS `dbfarmacia` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `dbfarmacia`;

-- Volcando estructura para tabla dbfarmacia.cliente
CREATE TABLE IF NOT EXISTS `cliente` (
  `id_cliente` int(11) NOT NULL AUTO_INCREMENT,
  `ci` varchar(20) DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `Estado` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.cliente: ~0 rows (aproximadamente)

-- Volcando estructura para tabla dbfarmacia.compra
CREATE TABLE IF NOT EXISTS `compra` (
  `id_compra` int(11) NOT NULL AUTO_INCREMENT,
  `numero_factura` varchar(50) DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_modificaion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `fecha_entrega` datetime DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `descuento` decimal(10,2) NOT NULL DEFAULT 0.00,
  `impuesto` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `Estado` tinyint(1) NOT NULL DEFAULT 1,
  `observaciones` text DEFAULT NULL,
  `id_proveedor` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_sucursal` int(11) NOT NULL,
  PRIMARY KEY (`id_compra`),
  KEY `fk_compra_proveedor` (`id_proveedor`),
  KEY `fk_compra_usuario` (`id_usuario`),
  KEY `fk_compra_sucursal` (`id_sucursal`),
  CONSTRAINT `fk_compra_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`),
  CONSTRAINT `fk_compra_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`),
  CONSTRAINT `fk_compra_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.compra: ~0 rows (aproximadamente)

-- Volcando estructura para tabla dbfarmacia.detalle_compra
CREATE TABLE IF NOT EXISTS `detalle_compra` (
  `id_detalle_compra` int(11) NOT NULL AUTO_INCREMENT,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `descuento` decimal(10,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(10,2) NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_lote` int(11) NOT NULL,
  `id_compra` int(11) NOT NULL,
  PRIMARY KEY (`id_detalle_compra`),
  KEY `fk_detcompra_lote` (`id_lote`),
  KEY `fk_detcompra_compra` (`id_compra`),
  CONSTRAINT `fk_detcompra_compra` FOREIGN KEY (`id_compra`) REFERENCES `compra` (`id_compra`),
  CONSTRAINT `fk_detcompra_lote` FOREIGN KEY (`id_lote`) REFERENCES `lote` (`id_lote`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.detalle_compra: ~0 rows (aproximadamente)

-- Volcando estructura para tabla dbfarmacia.detalle_venta
CREATE TABLE IF NOT EXISTS `detalle_venta` (
  `id_detalle_venta` int(11) NOT NULL AUTO_INCREMENT,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `descuento` decimal(10,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(10,2) NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_lote` int(11) NOT NULL,
  `id_venta` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  PRIMARY KEY (`id_detalle_venta`),
  KEY `fk_detalleventa_lote` (`id_lote`),
  KEY `fk_detalleventa_venta` (`id_venta`),
  KEY `fk_detalleventa_producto` (`id_producto`),
  CONSTRAINT `fk_detalleventa_lote` FOREIGN KEY (`id_lote`) REFERENCES `lote` (`id_lote`),
  CONSTRAINT `fk_detalleventa_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  CONSTRAINT `fk_detalleventa_venta` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.detalle_venta: ~0 rows (aproximadamente)

-- Volcando estructura para tabla dbfarmacia.factura
CREATE TABLE IF NOT EXISTS `factura` (
  `id_factura` int(11) NOT NULL AUTO_INCREMENT,
  `numero_factura` varchar(20) NOT NULL,
  `fecha_emision` datetime NOT NULL DEFAULT current_timestamp(),
  `tipo_factura` varchar(20) NOT NULL,
  `nit_cliente` varchar(20) DEFAULT NULL,
  `razon_social` varchar(150) DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `descuento` decimal(10,2) NOT NULL DEFAULT 0.00,
  `impuesto` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `Estado` varchar(20) NOT NULL DEFAULT 'emitida',
  `fecha_anulacion` datetime DEFAULT NULL,
  `motivo_anulacion` text DEFAULT NULL,
  `id_venta` int(11) NOT NULL,
  PRIMARY KEY (`id_factura`),
  UNIQUE KEY `uq_numerofactura` (`numero_factura`),
  KEY `fk_factura_id_venta` (`id_venta`),
  CONSTRAINT `fk_factura_id_venta` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.factura: ~0 rows (aproximadamente)

-- Volcando estructura para tabla dbfarmacia.laboratorio
CREATE TABLE IF NOT EXISTS `laboratorio` (
  `id_laboratorio` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `img` varchar(255) DEFAULT NULL,
  `Estado` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_laboratorio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.laboratorio: ~0 rows (aproximadamente)

-- Volcando estructura para tabla dbfarmacia.lote
CREATE TABLE IF NOT EXISTS `lote` (
  `id_lote` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `numero_lote` varchar(50) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `fecha_vencimiento` date NOT NULL,
  `precio_compra` decimal(10,2) NOT NULL DEFAULT 0.00,
  `fecha_ingreso` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `fecha_fabricacion` date DEFAULT NULL,
  `Estado` tinyint(1) NOT NULL DEFAULT 1,
  `id_producto` int(11) NOT NULL,
  `id_proveedor` int(11) NOT NULL,
  PRIMARY KEY (`id_lote`),
  UNIQUE KEY `uq_lote_codigo` (`codigo`),
  KEY `fk_lote_producto` (`id_producto`),
  KEY `fk_lote_proveedor` (`id_proveedor`),
  CONSTRAINT `fk_lote_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  CONSTRAINT `fk_lote_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.lote: ~0 rows (aproximadamente)

-- Volcando estructura para tabla dbfarmacia.presentacion
CREATE TABLE IF NOT EXISTS `presentacion` (
  `id_presentacion` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `Estado` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_presentacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.presentacion: ~0 rows (aproximadamente)

-- Volcando estructura para tabla dbfarmacia.producto
CREATE TABLE IF NOT EXISTS `producto` (
  `id_producto` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_barra` varchar(50) NOT NULL,
  `nombre_generico` varchar(150) NOT NULL,
  `nombre_comercial` varchar(150) DEFAULT NULL,
  `concentracion` varchar(80) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL DEFAULT 0.00,
  `img` varchar(255) DEFAULT NULL,
  `requiere_receta` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `contraindicaciones` text DEFAULT NULL,
  `via_administracion` varchar(100) DEFAULT NULL,
  `stock_minimo` int(11) NOT NULL DEFAULT 0,
  `Estado` tinyint(1) NOT NULL DEFAULT 1,
  `id_laboratorio` int(11) NOT NULL,
  `id_tipo_prod` int(11) NOT NULL,
  `id_presentacion` int(11) NOT NULL,
  PRIMARY KEY (`id_producto`),
  UNIQUE KEY `uq_codigo_barra` (`codigo_barra`),
  KEY `fk_prod_laboratorio` (`id_laboratorio`),
  KEY `fk_prod_tipo_producto` (`id_tipo_prod`),
  KEY `fk_prod_presentacion` (`id_presentacion`),
  CONSTRAINT `fk_prod_laboratorio` FOREIGN KEY (`id_laboratorio`) REFERENCES `laboratorio` (`id_laboratorio`),
  CONSTRAINT `fk_prod_presentacion` FOREIGN KEY (`id_presentacion`) REFERENCES `presentacion` (`id_presentacion`),
  CONSTRAINT `fk_prod_tipo_producto` FOREIGN KEY (`id_tipo_prod`) REFERENCES `tipo_producto` (`id_tipo_prod`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.producto: ~0 rows (aproximadamente)

-- Volcando estructura para tabla dbfarmacia.proveedor
CREATE TABLE IF NOT EXISTS `proveedor` (
  `id_proveedor` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(30) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `contacto_principal` varchar(100) DEFAULT NULL,
  `Estado` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_proveedor`),
  UNIQUE KEY `uq_provee_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.proveedor: ~0 rows (aproximadamente)

-- Volcando estructura para tabla dbfarmacia.sucursal
CREATE TABLE IF NOT EXISTS `sucursal` (
  `id_sucursal` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `Estado` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_sucursal`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.sucursal: ~0 rows (aproximadamente)
INSERT INTO `sucursal` (`id_sucursal`, `nombre`, `direccion`, `Estado`, `fecha_creacion`, `fecha_modificacion`) VALUES
	(1, 'prueba', 'direccionPrueba', 1, '2026-03-15 23:35:58', '2026-03-15 23:35:58');

-- Volcando estructura para tabla dbfarmacia.tipo_producto
CREATE TABLE IF NOT EXISTS `tipo_producto` (
  `id_tipo_prod` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `Estado` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_tipo_prod`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.tipo_producto: ~0 rows (aproximadamente)

-- Volcando estructura para tabla dbfarmacia.tipo_us
CREATE TABLE IF NOT EXISTS `tipo_us` (
  `id_tipo_us` int(11) NOT NULL AUTO_INCREMENT,
  `name_rol` varchar(80) NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_tipo_us`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.tipo_us: ~0 rows (aproximadamente)
INSERT INTO `tipo_us` (`id_tipo_us`, `name_rol`, `fecha_creacion`, `fecha_modificacion`) VALUES
	(1, 'Admin', '2026-03-15 22:32:23', '2026-03-15 23:56:12');

-- Volcando estructura para tabla dbfarmacia.usuario
CREATE TABLE IF NOT EXISTS `usuario` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `ci` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `img` varchar(255) DEFAULT NULL,
  `passwd` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Estado` tinyint(1) NOT NULL DEFAULT 1,
  `ultimo_acceso` datetime DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_tipo_us` int(11) NOT NULL,
  `id_sucursal` int(11) NOT NULL,
  `Confirmed` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uq_usuario_ci` (`ci`),
  UNIQUE KEY `uq_usuario_email` (`Email`) USING BTREE,
  KEY `fk_usuario_id_tipo_us` (`id_tipo_us`),
  KEY `fk_usuario_sucursal` (`id_sucursal`),
  CONSTRAINT `fk_usuario_id_tipo_us` FOREIGN KEY (`id_tipo_us`) REFERENCES `tipo_us` (`id_tipo_us`),
  CONSTRAINT `fk_usuario_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.usuario: ~1 rows (aproximadamente)
INSERT INTO `usuario` (`id_usuario`, `ci`, `nombre`, `apellido`, `img`, `passwd`, `telefono`, `Email`, `Estado`, `ultimo_acceso`, `fecha_creacion`, `fecha_modificacion`, `id_tipo_us`, `id_sucursal`, `Confirmed`) VALUES
	(1, '12121212', 'Guillermo', 'Mullisaca', 'Uploads/sinIMG', '$2b$10$BC1mNy/JfEcp.h82T6yH4Ob.8CG8dzb8Y2xFOxPH.fr0ZZQXn9KfO', '41491031', 'guillermoAdmin@gmail.com', 1, NULL, '2026-03-15 23:37:10', '2026-03-16 00:30:47', 1, 1, 1);

-- Volcando estructura para tabla dbfarmacia.venta
CREATE TABLE IF NOT EXISTS `venta` (
  `id_venta` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_modificaion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `descuento_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `impuestos` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `Estado` varchar(20) NOT NULL DEFAULT 'pendiente',
  `tipo_pago` varchar(50) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_sucursal` int(11) NOT NULL,
  PRIMARY KEY (`id_venta`),
  KEY `fk_venta_cliente` (`id_cliente`),
  KEY `fk_venta_usuario` (`id_usuario`),
  KEY `fk_venta_sucursal` (`id_sucursal`),
  CONSTRAINT `fk_venta_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`),
  CONSTRAINT `fk_venta_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`),
  CONSTRAINT `fk_venta_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla dbfarmacia.venta: ~0 rows (aproximadamente)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
