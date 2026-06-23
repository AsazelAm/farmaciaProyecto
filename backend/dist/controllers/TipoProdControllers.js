"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoProdControllers = void 0;
const TipoProdModels_1 = __importDefault(require("../Models/TipoProdModels"));
class TipoProdControllers {
    static GetTipoProdC = async (req, res) => {
        try {
            const data = await TipoProdModels_1.default.GetTipoProdM();
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener el tipo de prodcto: ", error);
            res.status(500).json({ error: "ERROR al obtener el tipo del Producto" });
        }
    };
    static AddTipoProdC = async (req, res) => {
        try {
            const { nombre } = req.body;
            const data = await TipoProdModels_1.default.AddTipoProdM(nombre);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al agregar un tipo de Producto: ", error);
            res.status(500).json({ error: "ERROR al Agregar un Tipo Proyecto" });
        }
    };
    static UpdateTipoProdC = async (req, res) => {
        try {
            const { idTipoProd } = req.params;
            const { nombre } = req.body;
            const data = await TipoProdModels_1.default.UpdateTipoProdM(nombre, idTipoProd);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al Actualizar Tipo de Producto: ", error);
            res.status(500).json({ error: "ERROR al actualizar el Tipo Producto" });
        }
    };
    static DeleteTipoProdC = async (req, res) => {
        try {
            const { idTipoProd } = req.params;
            const data = await TipoProdModels_1.default.DeleteTipoProdM(idTipoProd);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al Eliminar Tipo Producto: ", error);
            res.status(500).json({ error: "ERROR al eliminar al Tipo Producto" });
        }
    };
}
exports.TipoProdControllers = TipoProdControllers;
//# sourceMappingURL=TipoProdControllers.js.map