"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresentaControllers = void 0;
const PresentaModels_1 = __importDefault(require("../Models/PresentaModels"));
class PresentaControllers {
    static GetPresentaC = async (req, res) => {
        try {
            const data = await PresentaModels_1.default.GetPresentaM();
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al Obtener Presentacion: ", error);
            res.status(500).json({ error: "ERROR al obtener la Presentacion" });
        }
    };
    static AddPresentaC = async (req, res) => {
        try {
            const { nombre } = req.body;
            const data = await PresentaModels_1.default.AddPresentaM(nombre);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al Registrar Presentacion: ", error);
            res.status(500).json({ error: "ERROR al registrar Presentacion" });
        }
    };
    static UpdatePresentaC = async (req, res) => {
        try {
            const { idPresentacion } = req.params;
            const { nombre } = req.body;
            const data = await PresentaModels_1.default.UpdatePresentaM(nombre, idPresentacion);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al Actualizar Presentacion: ", error);
            res.status(500).json({ error: "ERROR al actualizar Presentacion" });
        }
    };
    static DeletePresentaC = async (req, res) => {
        try {
            const { idPresentacion } = req.params;
            const data = await PresentaModels_1.default.DeletePresentaM(idPresentacion);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al Eliminar Presentacion: ", error);
            res.status(500).json({ error: "ERROR al Eliminar Presentacion" });
        }
    };
}
exports.PresentaControllers = PresentaControllers;
//# sourceMappingURL=PresentaContollers.js.map