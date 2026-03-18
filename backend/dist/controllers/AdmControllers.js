"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADMControllers = void 0;
const ADMModels_1 = __importDefault(require("../Models/ADMModels"));
class ADMControllers {
    static GetModalidades = async (req, res) => {
        try {
            const data = await ADMModels_1.default.GetModalidades();
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener modalidad:", error);
            res.status(500).json({ error: "Error al obtener modalidad:" });
        }
    };
    static AddModalidad = async (req, res) => {
        try {
            const { modalidad } = req.body;
            const data = await ADMModels_1.default.AddModalidadSchema(modalidad);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al registrar una nueva modalidad:", error);
            res.status(500).json({ error: "Error al registrar una nueva modalidad:" });
        }
    };
    static DeleteModalidad = async (req, res) => {
        try {
            const { id } = req.params;
            const data = await ADMModels_1.default.DeleteModalidad(id);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al eliminar la modalidad:", error);
            res.status(500).json({ error: "Error al eliminar la modalidad:" });
        }
    };
    static UpdateModControllers = async (req, res) => {
        try {
            const { id } = req.params;
            const { modalidad } = req.body;
            const data = await ADMModels_1.default.UpdateModalidad(modalidad, id);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al eliminar la modalidad:", error);
            res.status(500).json({ error: "Error al eliminar la modalidad:" });
        }
    };
    static GetAreasControllers = async (req, res) => {
        try {
            const data = await ADMModels_1.default.GetAreasDeConocimineto();
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener areas de conocimiento:", error);
            res.status(500).json({ error: "Error al obtener areas de conocimiento:" });
        }
    };
    static DeleteAreasControllers = async (req, res) => {
        try {
            const { id } = req.params;
            const data = await ADMModels_1.default.DeleteAreas(id);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al eliminar el area:", error);
            res.status(500).json({ error: "Error al eliminar el area:" });
        }
    };
    static addAreaControllers = async (req, res) => {
        try {
            const { n_area } = req.body;
            const data = await ADMModels_1.default.AddAreasModels(n_area);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al agregar el area:", error);
            res.status(500).json({ error: "Error al agregar el area:" });
        }
    };
    static UpdateAreasControllers = async (req, res) => {
        try {
            const { id } = req.params;
            const { n_area } = req.body;
            const data = await ADMModels_1.default.UpdateAreasModels(id, n_area);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al actualizar area:", error);
            res.status(500).json({ error: "Error al actualizar area:" });
        }
    };
    static GetModalidadCalendario = async (req, res) => {
        try {
            const data = await ADMModels_1.default.GetModalidades();
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener modalidad:", error);
            res.status(500).json({ error: "Error al obtener modalidad:" });
        }
    };
    static GetEmpresaControllers = async (req, res) => {
        try {
            const data = await ADMModels_1.default.GetEmpresaAll();
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener modalidad:", error);
            res.status(500).json({ error: "Error al obtener modalidad:" });
        }
    };
    static GetCountryControllers = async (req, res) => {
        try {
            const data = await ADMModels_1.default.GetCountryModels();
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al actualizar el Pais:", error);
            res.status(500).json({ error: "Error al actualizar el rol:" });
        }
    };
}
exports.ADMControllers = ADMControllers;
//# sourceMappingURL=AdmControllers.js.map