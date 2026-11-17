-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         10.4.32-MariaDB - mariadb.org binary distribution
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.21.0.7344
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
  `idCliente` int(11) NOT NULL AUTO_INCREMENT,
  `ci` varchar(20) DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `fechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fechaModificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`idCliente`) USING BTREE,
  UNIQUE KEY `ci` (`ci`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla dbfarmacia.compra
CREATE TABLE IF NOT EXISTS `compra` (
  `idCompra` int(11) NOT NULL AUTO_INCREMENT,
  `numeroFactura` varchar(50) DEFAULT NULL,
  `fechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fechaModificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `fechaEntrega` datetime DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `descuento` decimal(10,2) NOT NULL DEFAULT 0.00,
  `impuesto` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estado` enum('pendiente','parcial','completado','cancelado','rechazado','devuelto_parcial','devuelto_total') NOT NULL DEFAULT 'pendiente',
  `observaciones` text DEFAULT NULL,
  `motivoCancelacion` text DEFAULT NULL,
  `fechaCancelacion` datetime DEFAULT NULL,
  `idUsuarioCancelacion` int(11) DEFAULT NULL,
  `idProveedor` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `idSucursal` int(11) NOT NULL,
  PRIMARY KEY (`idCompra`) USING BTREE,
  KEY `fk_compra_proveedor` (`idProveedor`) USING BTREE,
  KEY `fk_compra_usuario` (`idUsuario`) USING BTREE,
  KEY `fk_compra_sucursal` (`idSucursal`) USING BTREE,
  KEY `fk_compra_usuario_cancel` (`idUsuarioCancelacion`),
  CONSTRAINT `fk_compra_proveedor` FOREIGN KEY (`idProveedor`) REFERENCES `proveedor` (`idProveedor`),
  CONSTRAINT `fk_compra_sucursal` FOREIGN KEY (`idSucursal`) REFERENCES `sucursal` (`idSucursal`),
  CONSTRAINT `fk_compra_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`),
  CONSTRAINT `fk_compra_usuario_cancel` FOREIGN KEY (`idUsuarioCancelacion`) REFERENCES `usuario` (`idUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=161 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla dbfarmacia.detallecompra
CREATE TABLE IF NOT EXISTS `detallecompra` (
  `cantidad` int(11) NOT NULL,
  `cantidadRecibida` int(11) DEFAULT NULL,
  `cantidadRechazada` int(11) NOT NULL DEFAULT 0,
  `precioUnitario` decimal(10,2) NOT NULL,
  `descuento` decimal(10,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(10,2) NOT NULL,
  `fechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fechaModificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `estado` enum('activo','anulado') NOT NULL DEFAULT 'activo',
  `idLote` int(11) NOT NULL,
  `idCompra` int(11) NOT NULL,
  PRIMARY KEY (`idCompra`,`idLote`),
  KEY `fk_detcompra_lote` (`idLote`) USING BTREE,
  KEY `fk_detcompra_compra` (`idCompra`) USING BTREE,
  CONSTRAINT `fk_detcompra_compra` FOREIGN KEY (`idCompra`) REFERENCES `compra` (`idCompra`),
  CONSTRAINT `fk_detcompra_lote` FOREIGN KEY (`idLote`) REFERENCES `lote` (`idLote`),
  CONSTRAINT `chk_detcompra_recibida` CHECK (`cantidadRecibida` is null or `cantidadRecibida` <= `cantidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla dbfarmacia.detalledevolucionproveedor
CREATE TABLE IF NOT EXISTS `detalledevolucionproveedor` (
  `idDevolucionProveedor` int(11) NOT NULL,
  `idLote` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precioUnitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`idDevolucionProveedor`,`idLote`),
  KEY `fk_ddp_lote` (`idLote`),
  CONSTRAINT `fk_ddp_devolucion` FOREIGN KEY (`idDevolucionProveedor`) REFERENCES `devolucionproveedor` (`idDevolucionProveedor`) ON DELETE CASCADE,
  CONSTRAINT `fk_ddp_lote` FOREIGN KEY (`idLote`) REFERENCES `lote` (`idLote`),
  CONSTRAINT `chk_ddp_cantidad` CHECK (`cantidad` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla dbfarmacia.detalledevolucionventa
CREATE TABLE IF NOT EXISTS `detalledevolucionventa` (
  `idDevolucionVenta` int(11) NOT NULL,
  `idLote` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precioUnitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `destino` enum('reingreso_stock','merma','cuarentena') DEFAULT NULL,
  PRIMARY KEY (`idDevolucionVenta`,`idLote`),
  KEY `fk_ddv_lote` (`idLote`),
  CONSTRAINT `fk_ddv_devolucion` FOREIGN KEY (`idDevolucionVenta`) REFERENCES `devolucionventa` (`idDevolucionVenta`) ON DELETE CASCADE,
  CONSTRAINT `fk_ddv_lote` FOREIGN KEY (`idLote`) REFERENCES `lote` (`idLote`),
  CONSTRAINT `chk_ddv_cantidad` CHECK (`cantidad` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla dbfarmacia.detalleventa
CREATE TABLE IF NOT EXISTS `detalleventa` (
  `cantidad` int(11) NOT NULL,
  `precioUnitario` decimal(10,2) NOT NULL,
  `descuento` decimal(10,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(10,2) NOT NULL,
  `idLote` int(11) NOT NULL,
  `idVenta` int(11) NOT NULL,
  PRIMARY KEY (`idVenta`,`idLote`),
  KEY `fk_detalleventa_lote` (`idLote`) USING BTREE,
  KEY `fk_detalleventa_venta` (`idVenta`) USING BTREE,
  CONSTRAINT `fk_detalleventa_lote` FOREIGN KEY (`idLote`) REFERENCES `lote` (`idLote`),
  CONSTRAINT `fk_detalleventa_venta` FOREIGN KEY (`idVenta`) REFERENCES `venta` (`idVenta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla dbfarmacia.devolucionproveedor
CREATE TABLE IF NOT EXISTS `devolucionproveedor` (
  `idDevolucionProveedor` int(11) NOT NULL AUTO_INCREMENT,
  `fechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fechaResolucion` datetime DEFAULT NULL,
  `fechaModificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `tipo` enum('total','parcial') NOT NULL,
  `motivo` enum('producto_danado','empaque_danado','vencimiento_corto','producto_vencido','cantidad_incorrecta','reclamo_clientes','otro') NOT NULL,
  `estado` enum('solicitada','aceptada','rechazada','completada') NOT NULL DEFAULT 'solicitada',
  `montoNotaCredito` decimal(10,2) NOT NULL DEFAULT 0.00,
  `numeroNotaCredito` varchar(30) DEFAULT NULL,
  `motivoRechazo` text DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `idCompra` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `idUsuarioAutoriza` int(11) DEFAULT NULL,
  PRIMARY KEY (`idDevolucionProveedor`),
  KEY `fk_devprov_compra` (`idCompra`),
  KEY `fk_devprov_usuario` (`idUsuario`),
  KEY `fk_devprov_autoriza` (`idUsuarioAutoriza`),
  CONSTRAINT `fk_devprov_autoriza` FOREIGN KEY (`idUsuarioAutoriza`) REFERENCES `usuario` (`idUsuario`),
  CONSTRAINT `fk_devprov_compra` FOREIGN KEY (`idCompra`) REFERENCES `compra` (`idCompra`),
  CONSTRAINT `fk_devprov_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla dbfarmacia.devolucionventa
CREATE TABLE IF NOT EXISTS `devolucionventa` (
  `idDevolucionVenta` int(11) NOT NULL AUTO_INCREMENT,
  `fechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fechaResolucion` datetime DEFAULT NULL,
  `fechaModificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `tipo` enum('total','parcial') NOT NULL,
  `motivo` enum('error_dispensacion','reaccion_adversa','producto_danado','producto_vencido','receta_invalida','arrepentimiento','otro') NOT NULL,
  `estado` enum('solicitada','aprobada','rechazada','completada') NOT NULL DEFAULT 'solicitada',
  `montoReembolso` decimal(10,2) NOT NULL DEFAULT 0.00,
  `metodoReembolso` varchar(50) DEFAULT NULL,
  `motivoRechazo` text DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `idVenta` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `idUsuarioAutoriza` int(11) DEFAULT NULL,
  PRIMARY KEY (`idDevolucionVenta`),
  KEY `fk_devventa_venta` (`idVenta`),
  KEY `fk_devventa_usuario` (`idUsuario`),
  KEY `fk_devventa_autoriza` (`idUsuarioAutoriza`),
  CONSTRAINT `fk_devventa_autoriza` FOREIGN KEY (`idUsuarioAutoriza`) REFERENCES `usuario` (`idUsuario`),
  CONSTRAINT `fk_devventa_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`),
  CONSTRAINT `fk_devventa_venta` FOREIGN KEY (`idVenta`) REFERENCES `venta` (`idVenta`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla dbfarmacia.laboratorio
CREATE TABLE IF NOT EXISTS `laboratorio` (
  `idLaboratorio` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `img` varchar(255) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `fechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fechaModificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`idLaboratorio`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla dbfarmacia.lote
CREATE TABLE IF NOT EXISTS `lote` (
  `idLote` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `numeroLote` varchar(50) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `fechaVencimiento` date NOT NULL,
  `precioCompra` decimal(10,2) NOT NULL DEFAULT 0.00,
  `fechaIngreso` datetime NOT NULL DEFAULT current_timestamp(),
  `fechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fechaModificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `fechaFabricacion` date DEFAULT NULL,
  `estado` enum('pendiente','activo','vencido','cancelado','cuarentena','devuelto') NOT NULL DEFAULT 'pendiente',
  `idProducto` int(11) NOT NULL,
  `idProveedor` int(11) NOT NULL,
  PRIMARY KEY (`idLote`) USING BTREE,
  UNIQUE KEY `uq_lote_codigo` (`codigo`),
  KEY `fk_lote_producto` (`idProducto`) USING BTREE,
  KEY `fk_lote_proveedor` (`idProveedor`) USING BTREE,
  CONSTRAINT `fk_lote_producto` FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`),
  CONSTRAINT `fk_lote_proveedor` FOREIGN KEY (`idProveedor`) REFERENCES `proveedor` (`idProveedor`),
  CONSTRAINT `chk_lote_stock` CHECK (`stock` >= 0)
) ENGINE=InnoDB AUTO_INCREMENT=224 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla dbfarmacia.presentacion
CREATE TABLE IF NOT EXISTS `presentacion` (
  `idPresentacion` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `fechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fechaModificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`idPresentacion`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla dbfarmacia.principio_activo
CREATE TABLE IF NOT EXISTS `principio_activo` (
  `idPrincipioActivo` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `fechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fechaModificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`idPrincipioActivo`) USING BTREE,
  UNIQUE KEY `uq_principio_nombre` (`nombre`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=107 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla dbfarmacia.producto
CREATE TABLE IF NOT EXISTS `producto` (
  `idProducto` int(11) NOT NULL AUTO_INCREMENT,
  `codigoBarra` varchar(50) NOT NULL,
  `nombreComercial` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL DEFAULT 0.00,
  `img` varchar(255) DEFAULT NULL,
  `requiereReceta` tinyint(1) NOT NULL DEFAULT 0,
  `fechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fechaModificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `contraindicaciones` text DEFAULT NULL,
  `viaAdministracion` varchar(100) DEFAULT NULL,
  `stockMinimo` int(11) NOT NULL DEFAULT 0,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `idLaboratorio` int(11) NOT NULL,
  `idPresentacion` int(11) NOT NULL,
  `stockTotal` int(11) DEFAULT NULL,
  PRIMARY KEY (`idProducto`) USING BTREE,
  UNIQUE KEY `uq_codigo_barra` (`codigoBarra`) USING BTREE,
  KEY `fk_prod_laboratorio` (`idLaboratorio`) USING BTREE,
  KEY `fk_prod_presentacion` (`idPresentacion`) USING BTREE,
  CONSTRAINT `fk_prod_laboratorio` FOREIGN KEY (`idLaboratorio`) REFERENCES `laboratorio` (`idLaboratorio`),
  CONSTRAINT `fk_prod_presentacion` FOREIGN KEY (`idPresentacion`) REFERENCES `presentacion` (`idPresentacion`)
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla dbfarmacia.productoprincipioactivo
CREATE TABLE IF NOT EXISTS `productoprincipioactivo` (
  `idProducto` int(11) NOT NULL,
  `idPrincipioActivo` int(11) NOT NULL,
  `concentracion` varchar(80) NOT NULL,
  PRIMARY KEY (`idProducto`,`idPrincipioActivo`) USING BTREE,
  KEY `fk_ppa_principio` (`idPrincipioActivo`) USING BTREE,
  CONSTRAINT `fk_ppa_principio` FOREIGN KEY (`idPrincipioActivo`) REFERENCES `principio_activo` (`idPrincipioActivo`) ON UPDATE CASCADE,
  CONSTRAINT `fk_ppa_producto` FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla dbfarmacia.productotipoproducto
CREATE TABLE IF NOT EXISTS `productotipoproducto` (
  `idProducto` int(11) NOT NULL,
  `idTipoProd` int(11) NOT NULL,
  PRIMARY KEY (`idProducto`,`idTipoProd`) USING BTREE,
  KEY `fk_ptp_tipo` (`idTipoProd`) USING BTREE,
  CONSTRAINT `fk_ptp_producto` FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ptp_tipo` FOREIGN KEY (`idTipoProd`) REFERENCES `tipoproducto` (`idTipoProd`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla dbfarmacia.proveedor
CREATE TABLE IF NOT EXISTS `proveedor` (
  `idProveedor` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(30) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `contactoPrincipal` varchar(100) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `fechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fechaModificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`idProveedor`) USING BTREE,
  UNIQUE KEY `uq_provee_codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla dbfarmacia.recibo
CREATE TABLE IF NOT EXISTS `recibo` (
  `idRecibo` int(11) NOT NULL AUTO_INCREMENT,
  `numeroRecibo` varchar(20) NOT NULL,
  `fechaEmision` datetime NOT NULL DEFAULT current_timestamp(),
  `estado` enum('emitido','anulado') NOT NULL DEFAULT 'emitido',
  `idVenta` int(11) NOT NULL,
  PRIMARY KEY (`idRecibo`),
  UNIQUE KEY `uq_recibo_numero` (`numeroRecibo`),
  UNIQUE KEY `uq_recibo_venta` (`idVenta`),
  CONSTRAINT `fk_recibo_venta` FOREIGN KEY (`idVenta`) REFERENCES `venta` (`idVenta`)
) ENGINE=InnoDB AUTO_INCREMENT=109 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla dbfarmacia.sucursal
CREATE TABLE IF NOT EXISTS `sucursal` (
  `idSucursal` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `fechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fechaModificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`idSucursal`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla dbfarmacia.tipoproducto
CREATE TABLE IF NOT EXISTS `tipoproducto` (
  `idTipoProd` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `fechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fechaModificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`idTipoProd`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla dbfarmacia.tipous
CREATE TABLE IF NOT EXISTS `tipous` (
  `idTipoUs` int(11) NOT NULL AUTO_INCREMENT,
  `nameRol` varchar(80) NOT NULL,
  `fechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fechaModificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`idTipoUs`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla dbfarmacia.usuario
CREATE TABLE IF NOT EXISTS `usuario` (
  `idUsuario` int(11) NOT NULL AUTO_INCREMENT,
  `ci` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `img` varchar(255) DEFAULT NULL,
  `passwd` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `ultimoAcceso` datetime DEFAULT NULL,
  `fechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fechaModificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `confirmed` tinyint(1) DEFAULT 0,
  `idTipoUs` int(11) NOT NULL,
  `idSucursal` int(11) NOT NULL,
  `codigoVerificacion` varchar(6) DEFAULT NULL,
  `codigoExpiracion` datetime DEFAULT NULL,
  `codigoIntentos` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`idUsuario`) USING BTREE,
  UNIQUE KEY `uq_usuario_ci` (`ci`),
  UNIQUE KEY `uq_usuario_email` (`email`) USING BTREE,
  KEY `fk_usuario_id_tipo_us` (`idTipoUs`) USING BTREE,
  KEY `fk_usuario_sucursal` (`idSucursal`) USING BTREE,
  CONSTRAINT `fk_usuario_id_tipo_us` FOREIGN KEY (`idTipoUs`) REFERENCES `tipous` (`idTipoUs`),
  CONSTRAINT `fk_usuario_sucursal` FOREIGN KEY (`idSucursal`) REFERENCES `sucursal` (`idSucursal`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla dbfarmacia.venta
CREATE TABLE IF NOT EXISTS `venta` (
  `idVenta` int(11) NOT NULL AUTO_INCREMENT,
  `fechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fechaModificacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `descuentoTotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estado` varchar(20) NOT NULL DEFAULT 'pendiente',
  `tipoPago` varchar(50) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `motivoCancelacion` text DEFAULT NULL,
  `fechaCancelacion` datetime DEFAULT NULL,
  `idUsuarioCancelacion` int(11) DEFAULT NULL,
  `idCliente` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `idSucursal` int(11) NOT NULL,
  PRIMARY KEY (`idVenta`) USING BTREE,
  KEY `fk_venta_cliente` (`idCliente`) USING BTREE,
  KEY `fk_venta_usuario` (`idUsuario`) USING BTREE,
  KEY `fk_venta_sucursal` (`idSucursal`) USING BTREE,
  KEY `fk_venta_usuario_cancel` (`idUsuarioCancelacion`),
  CONSTRAINT `fk_venta_cliente` FOREIGN KEY (`idCliente`) REFERENCES `cliente` (`idCliente`),
  CONSTRAINT `fk_venta_sucursal` FOREIGN KEY (`idSucursal`) REFERENCES `sucursal` (`idSucursal`),
  CONSTRAINT `fk_venta_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`),
  CONSTRAINT `fk_venta_usuario_cancel` FOREIGN KEY (`idUsuarioCancelacion`) REFERENCES `usuario` (`idUsuario`),
  CONSTRAINT `chk_venta_estado` CHECK (`estado` in ('pendiente','completado','cancelado','devuelto_parcial','devuelto_total'))
) ENGINE=InnoDB AUTO_INCREMENT=120 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
