"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HabilidadesControllers = void 0;
const HabilidadModels_1 = __importDefault(require("../Models/HabilidadModels"));
class HabilidadesControllers {
    static GetHabilidades = async (req, res) => {
        try {
            const data = await HabilidadModels_1.default.GetHabilidades();
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener modalidad:", error);
            res.status(500).json({ error: "Error al obtener modalidad:" });
        }
    };
}
exports.HabilidadesControllers = HabilidadesControllers;
//# sourceMappingURL=HabilidadesControllers.js.map