"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SucursalControllers = void 0;
const SucursalModels_1 = __importDefault(require("../Models/SucursalModels"));
class SucursalControllers {
    static GetSucursalC = async (req, res) => {
        try {
            const data = await SucursalModels_1.default.GetSucursalM();
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener el Sucursal: ", error);
            res.status(500).json({ error: "ERROR al obtener los Sucursal" });
        }
    };
}
exports.SucursalControllers = SucursalControllers;
//# sourceMappingURL=SucursalControllers.js.map