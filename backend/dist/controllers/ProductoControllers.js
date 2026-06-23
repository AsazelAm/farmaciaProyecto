"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductoControllers = void 0;
const ProductoModels_1 = __importDefault(require("../Models/ProductoModels"));
const SaveImg_1 = require("../Middleware/SaveImg");
const Time_1 = require("../lib/Time");
class ProductoControllers {
    // ── GET: obtener todos los productos activos ───────────────────────────────
    static GetProductoC = async (req, res) => {
        try {
            const data = await ProductoModels_1.default.GetProductoM();
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error al obtener productos:', error);
            res.status(500).json({ error: 'Error al obtener los Productos' });
        }
    };
    // ── POST: crear un nuevo producto ─────────────────────────────────────────
    static AddProductoC = async (req, res) => {
        try {
            const { codigoBarra, nombreGenerico, nombreComercial, concentracion, descripcion, precio, requiereReceta, contraindicaciones, viaAdministracion, stockMinimo, idLaboratorio, idTipoProd, idPresentacion, } = req.body;
            const imgFile = req.file;
            const fecha = (0, Time_1.GetDateToday)();
            // ── Verificar código de barra único ────────────────────────────────
            const codExiste = await ProductoModels_1.default.VerificarCodigoBarraM(codigoBarra);
            if (codExiste !== 0) {
                return res.status(400).json({ error: 'El código de barra ya está registrado' });
            }
            // ── Insertar producto (sin imagen aún) ────────────────────────────
            const idProducto = await ProductoModels_1.default.AddProductoM({
                codigoBarra,
                nombreGenerico,
                nombreComercial: nombreComercial || null,
                concentracion: concentracion || null,
                descripcion: descripcion || null,
                precio: Number(precio),
                requiereReceta: Number(requiereReceta) || 0,
                contraindicaciones: contraindicaciones || null,
                viaAdministracion: viaAdministracion || null,
                stockMinimo: Number(stockMinimo) || 0,
                idLaboratorio: Number(idLaboratorio),
                idTipoProd: Number(idTipoProd),
                idPresentacion: Number(idPresentacion),
                img: null,
            });
            // ── Subir imagen si se envió ───────────────────────────────────────
            if (imgFile) {
                const rutaImg = await (0, SaveImg_1.uploadImageGlobal)(imgFile, String(idProducto), fecha, 'Producto');
                await ProductoModels_1.default.UpdateImgProductoM(rutaImg, idProducto);
            }
            res.status(200).json({
                message: 'Producto registrado exitosamente',
                idProducto,
            });
        }
        catch (error) {
            console.error('Error al agregar producto:', error);
            res.status(500).json({ error: 'Error al registrar el Producto' });
        }
    };
    // ── PUT: actualizar un producto ────────────────────────────────────────────
    static UpdateProductoC = async (req, res) => {
        try {
            const idProducto = String(req.params.idProducto);
            const { codigoBarra, nombreGenerico, nombreComercial, concentracion, descripcion, precio, requiereReceta, contraindicaciones, viaAdministracion, stockMinimo, idLaboratorio, idTipoProd, idPresentacion, } = req.body;
            const imgFile = req.file;
            const fecha = (0, Time_1.GetDateToday)();
            // ── Verificar código de barra (sin contar el propio producto) ──────
            const codExiste = await ProductoModels_1.default.VerificarCodigoBarraUpdateM(codigoBarra, idProducto);
            if (codExiste !== 0) {
                return res.status(400).json({ error: 'El código de barra ya está registrado en otro producto' });
            }
            // ── Actualizar datos principales ───────────────────────────────────
            await ProductoModels_1.default.UpdateProductoM({
                codigoBarra,
                nombreGenerico,
                nombreComercial: nombreComercial || null,
                concentracion: concentracion || null,
                descripcion: descripcion || null,
                precio: Number(precio),
                requiereReceta: Number(requiereReceta) || 0,
                contraindicaciones: contraindicaciones || null,
                viaAdministracion: viaAdministracion || null,
                stockMinimo: Number(stockMinimo) || 0,
                idLaboratorio: Number(idLaboratorio),
                idTipoProd: Number(idTipoProd),
                idPresentacion: Number(idPresentacion),
                img: null,
            }, idProducto);
            // ── Actualizar imagen si se envió una nueva ────────────────────────
            if (imgFile) {
                const rutaImg = await (0, SaveImg_1.uploadImageGlobal)(imgFile, idProducto, fecha, 'Producto');
                await ProductoModels_1.default.UpdateImgProductoM(rutaImg, idProducto);
            }
            res.status(200).json('Producto Actualizado Exitosamente');
        }
        catch (error) {
            console.error('Error al actualizar producto:', error);
            res.status(500).json({ error: 'Error al Actualizar el Producto' });
        }
    };
    // ── DELETE: desactivar un producto (soft delete) ──────────────────────────
    static DeleteProductoC = async (req, res) => {
        try {
            const idProducto = String(req.params.idProducto);
            const data = await ProductoModels_1.default.DeleteProductoM(idProducto);
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error al eliminar producto:', error);
            res.status(500).json({ error: 'Error al eliminar el Producto' });
        }
    };
}
exports.ProductoControllers = ProductoControllers;
//# sourceMappingURL=ProductoControllers.js.map