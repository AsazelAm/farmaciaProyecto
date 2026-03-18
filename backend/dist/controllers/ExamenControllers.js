"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamenControllers = void 0;
const ExamenModels_1 = __importDefault(require("../Models/ExamenModels"));
class ExamenControllers {
    static GetExamen = async (req, res) => {
        try {
            const data = await ExamenModels_1.default.GetExamen();
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener el Curso:", error);
            res.status(500).json({ error: "Error al obtener el Curso:" });
        }
    };
    static addExamen = async (req, res) => {
        try {
            const { codigo, Examen, Curso } = req.body;
            const data = await ExamenModels_1.default.VerifedCode(codigo);
            if (data != 0) {
                return res.status(409).json({ error: "El código ya existe" });
            }
            const data2 = await ExamenModels_1.default.AddExamenModels(Examen, codigo, Curso);
            res.status(200).json(data2);
        }
        catch (error) {
            console.error("Error al crear Examen:", error);
            res.status(500).json({ error: "Error al crear Examen:" });
        }
    };
    static DeleteExamencontrollers = async (req, res) => {
        try {
            const { id } = req.params;
            const data = await ExamenModels_1.default.DeleteExamenModels(id);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al Eliminar Examen:", error);
            res.status(500).json({ error: "Error al Eliminar Examen:" });
        }
    };
    static UpdateExamenControllers = async (req, res) => {
        try {
            const { id } = req.params;
            const { Examen, codigo, Curso } = req.body;
            const data = await ExamenModels_1.default.VerifedCode(codigo);
            if (data != 0) {
                return res.status(409).json({ error: "El codigo existe" });
            }
            const data2 = await ExamenModels_1.default.UpdateExamenModels(Examen, codigo, Curso, id);
            res.status(200).json(data2);
        }
        catch (error) {
            console.log("Error al actualizar Examen:, ", error);
            res.status(500).json({ error: "Error al actualizar EL examen" });
        }
    };
}
exports.ExamenControllers = ExamenControllers;
//# sourceMappingURL=ExamenControllers.js.map