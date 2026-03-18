"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PvControllers = void 0;
const PvModels_1 = __importDefault(require("../Models/PvModels"));
const SaveImg_1 = require("../Middleware/SaveImg");
const Time_1 = require("../lib/Time");
class PvControllers {
    static GetAllPvControllers = async (req, res) => {
        try {
            const data = await PvModels_1.default.PvAll();
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener propuestas  de valor:", error);
            res.status(500).json({ error: "Error al obtener propuestas  de valor:" });
        }
    };
    static AddPv = async (req, res) => {
        try {
            const files = req.files;
            // CORRECCIÓN: array1 viene en req.body como string JSON
            const array1Data = JSON.parse(req.body.array1);
            const { nombre, identificador } = array1Data[0];
            const LogoFile = files['logo'] ? files['logo'][0] : null;
            const BannerFile = files['banner'] ? files['banner'][0] : null;
            const CuadroFile = files['cuadro'] ? files['cuadro'][0] : null;
            const ModalFile = files['modal'] ? files['modal'][0] : null;
            console.log(ModalFile);
            const data = await PvModels_1.default.AddPv(nombre, identificador);
            const now = (0, Time_1.GetDateToday)();
            if (LogoFile) {
                const ruta = await (0, SaveImg_1.uploadImageGlobal)(LogoFile, String(data), now, 'LogoPv');
                await PvModels_1.default.UpdateImgAddpv(ruta, data);
            }
            if (BannerFile) {
                const ruta = await (0, SaveImg_1.uploadImageGlobal)(BannerFile, String(data), now, 'BannersPv');
                await PvModels_1.default.UpdatebannerAddpv(ruta, data);
            }
            if (ModalFile) {
                const ruta = await (0, SaveImg_1.uploadImageGlobal)(ModalFile, String(data), now, 'ModalsPv');
                await PvModels_1.default.UpdatemodalAddpv(ruta, data);
            }
            if (CuadroFile) {
                const ruta = await (0, SaveImg_1.uploadImageGlobal)(CuadroFile, String(data), now, 'CuadroPv');
                await PvModels_1.default.UpdateCuadroAddpv(ruta, data);
            }
            res.status(200).json('Propuesta de valor creado correctamente');
        }
        catch (error) {
            console.error("Error al agregar propuestas de valor:", error);
            res.status(500).json({ error: "Error al agregar propuestas de valor:" });
        }
    };
    static deletePv = async (req, res) => {
        try {
            const { id } = req.params;
            const data = await PvModels_1.default.DeletePv(id);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al eliminar propuesta de valor:", error);
            res.status(500).json({ error: "Error al eliminar propuesta de valor:" });
        }
    };
    static UpdatePvControllers = async (req, res) => {
        try {
            const { id } = req.params;
            const files = req.files;
            const array1Data = JSON.parse(req.body.array1);
            const { nombre, identificador } = array1Data[0];
            const LogoFile = files['logo']?.[0] || null;
            const BannerFile = files['banner']?.[0] || null;
            const CuadroFile = files['cuadro']?.[0] || null;
            const ModalFile = files['modal']?.[0] || null;
            await PvModels_1.default.UpdatePvModels(nombre, identificador, id);
            const now = (0, Time_1.GetDateToday)();
            if (LogoFile) {
                const ruta = await (0, SaveImg_1.uploadImageGlobal)(LogoFile, id, now, 'LogoPv');
                await PvModels_1.default.UpdateImgAddpv(ruta, id);
            }
            if (BannerFile) {
                const ruta = await (0, SaveImg_1.uploadImageGlobal)(BannerFile, id, now, 'BannersPv');
                await PvModels_1.default.UpdatebannerAddpv(ruta, id);
            }
            if (ModalFile) {
                const ruta = await (0, SaveImg_1.uploadImageGlobal)(ModalFile, id, now, 'ModalsPv');
                await PvModels_1.default.UpdatemodalAddpv(ruta, id);
            }
            if (CuadroFile) {
                const ruta = await (0, SaveImg_1.uploadImageGlobal)(CuadroFile, id, now, 'CuadroPv');
                await PvModels_1.default.UpdateCuadroAddpv(ruta, id);
            }
            res.status(200).json('Propuesta de valor actualizada correctamente');
        }
        catch (error) {
            console.error("Error al actualizar propuesta de valor:", error);
            res.status(500).json({ error: "Error al actualizar propuesta de valor:" });
        }
    };
    static GetPvCalendario = async (req, res) => {
        try {
            const data = await PvModels_1.default.PvCalendario();
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener propuestas  de valor:", error);
            res.status(500).json({ error: "Error al obtener propuestas  de valor:" });
        }
    };
    static UpdatePvEstaController = async (req, res) => {
        try {
            const { id } = req.params;
            const { Status } = req.body;
            const data = await PvModels_1.default.UpdatePvEstaModels(Status, id);
            res.status(200).json(data);
        }
        catch (error) {
            console.log("Erro actualizar Status,", error);
            res.status(500).json({ error: "Erro actualizar Status de PV" });
        }
    };
}
exports.PvControllers = PvControllers;
//# sourceMappingURL=PvControllers.js.map