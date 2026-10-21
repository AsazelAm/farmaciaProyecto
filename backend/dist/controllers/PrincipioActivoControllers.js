"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrincipioActivoControllers = void 0;
const PrincipioActivoModels_1 = __importDefault(require("../Models/PrincipioActivoModels"));
class PrincipioActivoControllers {
    static GetPrincipioActivoC = async (req, res) => {
        try {
            const data = await PrincipioActivoModels_1.default.GetPrincipioActivoM();
            res.status(200).json(data);
        }
        catch (error) {
            console.error('Error al obtener los principios activos:', error);
            res.status(500).json({ error: 'Error al obtener los principios activos' });
        }
    };
}
exports.PrincipioActivoControllers = PrincipioActivoControllers;
//# sourceMappingURL=PrincipioActivoControllers.js.map