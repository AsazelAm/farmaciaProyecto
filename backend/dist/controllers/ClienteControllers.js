"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClienteControllers = void 0;
const ClienteModels_1 = __importDefault(require("../Models/ClienteModels"));
class ClienteControllers {
    static GetClienteC = async (req, res) => {
        try {
            const data = await ClienteModels_1.default.GetClientM();
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al Obtener los clientes: ", error);
            res.status(500).json({ error: "ERROR al Obtener los Cliente" });
        }
    };
    static AddClienteC = async (req, res) => {
        try {
            const { ci, nombre, apellido, telefono, email } = req.body;
            const CiVeri = await ClienteModels_1.default.VerificarCiM(ci);
            if (CiVeri !== 0) {
                return res.status(400).json({ error: "EL Carnet de Identidad ya existe" });
            }
            const EmailVeri = await ClienteModels_1.default.VerificarEmail(email);
            if (EmailVeri !== 0) {
                return res.status(400).json({ error: "El email ya esta registrado en otro usuario" });
            }
            const data = await ClienteModels_1.default.AddClientM(ci, nombre, apellido, telefono, email);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al registrar al Cliente: ", error);
            res.status(500).json({ error: "ERROR al registra al Cliente" });
        }
    };
    static UpdateClienteC = async (req, res) => {
        try {
            const { idCliente } = req.params;
            const { ci, nombre, apellido, telefono, email } = req.body;
            // 1. Garantizamos que el ID sea procesado como un texto único
            const idCli = String(idCliente);
            // 2. Usamos 'idCli' en las validaciones y actualizaciones
            const ciVeri = await ClienteModels_1.default.VerificarCiUpdate(ci, idCli);
            if (ciVeri !== 0) {
                return res.status(400).json({ error: "El Carnet de identidad ya esta registrado" });
            }
            const emailVeri = await ClienteModels_1.default.VerificarEmailUpdate(email, idCli);
            if (emailVeri !== 0) {
                return res.status(400).json({ error: "El email ya esta registrado" });
            }
            const data = await ClienteModels_1.default.UpdateClientM(ci, nombre, apellido, telefono, email, idCli);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al Actualizar cliente: ", error);
            res.status(500).json({ error: "ERROR al actualizar Cliente" });
        }
    };
    static DeleteClienteC = async (req, res) => {
        try {
            const { idCliente } = req.params;
            const data = await ClienteModels_1.default.DeleteClientM(idCliente);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al eliminar al Cliente: ", error);
            res.status(500).json({ error: "ERROR al eliminar al cliente" });
        }
    };
}
exports.ClienteControllers = ClienteControllers;
//# sourceMappingURL=ClienteControllers.js.map