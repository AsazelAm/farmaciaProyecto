"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoUsControllers = void 0;
const TipoUsModels_1 = __importDefault(require("../Models/TipoUsModels"));
class TipoUsControllers {
    static GetTipoUsC = async (req, res) => {
        try {
            const data = await TipoUsModels_1.default.GetTipoUsM();
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener el Tipo del chica: ", error);
            res.status(500).json({ error: "ERROR al obtener los Tipos De Usuarion" });
        }
    };
    static AddTipoUsC = async (req, res) => {
        try {
            const { nameRol } = req.body;
            const data = await TipoUsModels_1.default.AddTipoUsM(nameRol);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al Agregar Tipo de Usuario: ", error);
            res.status(500).json({ error: "ERROR al Agregar tipo De Usuario" });
        }
    };
    static UpdateTipoUsC = async (req, res) => {
        try {
            const { idTipoUs } = req.params;
            const { nameRol } = req.body;
            const data = await TipoUsModels_1.default.UpdateTipoUsM(nameRol, idTipoUs);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al Agregar al Tipo de Usuario");
            res.status(500).json({ error: "ERROR al Agregar el tipo de Usuario" });
        }
    };
    static DeleteTipoUsC = async (req, res) => {
        try {
            const { idTipoUs } = req.params;
            const data = await TipoUsModels_1.default.DeleteTipoUsM(idTipoUs);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al eliminar el tipo de usuario: ", error);
            res.status(500).json({ error: "ERROR al eliminar el tipo de Usuario" });
        }
    };
}
exports.TipoUsControllers = TipoUsControllers;
//# sourceMappingURL=TipoUsControllers.js.map