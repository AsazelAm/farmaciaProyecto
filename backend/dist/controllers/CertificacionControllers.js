"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificacionControllers = void 0;
const CertificacionModel_1 = __importDefault(require("../Models/CertificacionModel"));
class CertificacionControllers {
    static GetCertificacionall = async (req, res) => {
        try {
            const data = await CertificacionModel_1.default.AllCertification();
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener Certificacion", error);
            res.status(500).json({ error: "Error al obtener  Certificacion:" });
        }
    };
    static addCertificacion = async (req, res) => {
        try {
            const { n_cert, opcion, nota, tipo } = req.body;
            const data = await CertificacionModel_1.default.AddCerModal(n_cert, opcion, nota, tipo);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al agregar Certificacion:", error);
            res.status(500).json({ error: "Error al agregar Certificacion" });
        }
    };
    static DeleteCertControllers = async (req, res) => {
        try {
            const { id } = req.params;
            const data = await CertificacionModel_1.default.DeleteCert(id);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al eliminar el certificado:", error);
            res.status(500).json({ error: "Error al eliminar el certificado" });
        }
    };
    static UpdateCertiControllers = async (req, res) => {
        try {
            const { id } = req.params;
            const { n_cert, opcion, nota, tipo } = req.body;
            const data = await CertificacionModel_1.default.UpdateCertiModels(n_cert, opcion, nota, tipo, id);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al actualizar Cerificado:", error);
            res.status(500).json({ error: "Erro al eliminar certificado" });
        }
    };
}
exports.CertificacionControllers = CertificacionControllers;
//# sourceMappingURL=CertificacionControllers.js.map