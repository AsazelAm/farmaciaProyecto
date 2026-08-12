"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../Middleware/auth");
const multer_1 = __importDefault(require("multer"));
const ProductoControllers_1 = require("../controllers/ProductoControllers");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// ── Multer en memoria (igual que LaboratorioRoutes) ───────────────────────────
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
// ── GET: lista todos los productos activos ────────────────────────────────────
router.get('/GetProducto', ProductoControllers_1.ProductoControllers.GetProductoC);
// ── POST: crear producto (con imagen opcional) ────────────────────────────────
router.post('/AddProducto', upload.single('img'), ProductoControllers_1.ProductoControllers.AddProductoC);
// ── PUT: actualizar producto (con imagen opcional) ────────────────────────────
router.put('/UpdateProducto/:idProducto', upload.single('img'), ProductoControllers_1.ProductoControllers.UpdateProductoC);
// ── DELETE: desactivar producto ───────────────────────────────────────────────
router.delete('/DeleteProducto/:idProducto', ProductoControllers_1.ProductoControllers.DeleteProductoC);
exports.default = router;
//# sourceMappingURL=ProductoRoutes.js.map