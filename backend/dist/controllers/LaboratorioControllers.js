"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaboratorioControllers = void 0;
const LaboraModels_1 = __importDefault(require("../Models/LaboraModels"));
const SaveImg_1 = require("../Middleware/SaveImg");
const Time_1 = require("../lib/Time");
class LaboratorioControllers {
    static GetLaboraC = async (req, res) => {
        try {
            const data = await LaboraModels_1.default.GetLaboraM();
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener laboratorio: ", error);
            res.status(500).json({ error: "Error al obtener Laboratorio" });
        }
    };
    static AddLaboraC = async (req, res) => {
        try {
            const files = req.file;
            const imgFile = files;
            const { nombre } = req.body;
            const fecha = (0, Time_1.GetDateToday)();
            const VeriNombre = await LaboraModels_1.default.VerificarNombreM(nombre);
            if (VeriNombre.exists) {
                res.status(400).json({ error: "El nombre del Laboratorio ya esta Registrado" });
                return;
            }
            const id_laboratorio = await LaboraModels_1.default.AddLaboraM(nombre);
            if (imgFile) {
                const rutaImg = await (0, SaveImg_1.uploadImageGlobal)(imgFile, String(id_laboratorio), fecha, 'Laboratorio');
                await LaboraModels_1.default.UpdateRutaimg(rutaImg, id_laboratorio);
            }
            res.status(200).json({
                message: 'Laboratorio Agregado Exitosamente',
                idLaboratorio: id_laboratorio
            });
        }
        catch (error) {
            console.error("Error al Agregar Un Laboratorio: ", error);
            res.status(500).json({ error: "Error al Agregar Laboratorio" });
        }
    };
    static UpdateLaboraC = async (req, res) => {
        try {
            const { idLaboratorio } = req.params;
            const { nombre } = req.body;
            const ImgFile = req.file;
            const fecha = (0, Time_1.GetDateToday)();
            // 1. Forzamos el tipo desde el principio (usa Number(idLaboratorio) si en tu BD es un entero)
            const idLab = String(idLaboratorio);
            // 2. Usamos la nueva variable 'idLab' en todas las consultas
            const UpdaNomb = await LaboraModels_1.default.VerificarUpdateNombreM(nombre, idLab);
            if (UpdaNomb !== 0) {
                return res.status(400).json({ error: "El nombre ya esta registrado" });
            }
            await LaboraModels_1.default.UpdateLabM(idLab, nombre);
            if (ImgFile) {
                const rutaImg = await (0, SaveImg_1.uploadImageGlobal)(ImgFile, idLab, fecha, 'Laboratorio');
                // 3. ¡Aquí es donde ocurría el error! Ahora recibe un 'string' garantizado
                await LaboraModels_1.default.UpdateRutaimg(rutaImg, idLab);
            }
            res.status(200).json("Laboratorio Actualizado Exitosamente");
        }
        catch (error) {
            console.error("Error al actualizar laboratorio: ", error);
            res.status(500).json({ error: "Error al Actualizar el Laboratorio" });
        }
    };
    static DeleteLaboraC = async (req, res) => {
        try {
            const { idLaboratorio } = req.params;
            const data = await LaboraModels_1.default.DeleteLabM(idLaboratorio);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al eliminar Un laboratorio: ", error);
            res.status(500).json({ error: "Error al elimar el laboratorio" });
        }
    };
}
exports.LaboratorioControllers = LaboratorioControllers;
//# sourceMappingURL=LaboratorioControllers.js.map