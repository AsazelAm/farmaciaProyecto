"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProveedorControllers = void 0;
const ProveedorModels_1 = __importDefault(require("../Models/ProveedorModels"));
class ProveedorControllers {
    static GetProveedorC = async (req, res) => {
        try {
            const data = await ProveedorModels_1.default.GetProveedorM();
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener los Proveedores: ", error);
            res.status(500).json({ error: "ERROR al Obtener Proveedores" });
        }
    };
    static AddProveedorC = async (req, res) => {
        try {
            const { codigo, nombre, telefono, email, direccion, contactoPrincipal } = req.body;
            const CodVerif = await ProveedorModels_1.default.VerificarCodigo(codigo);
            if (CodVerif !== 0) {
                return res.status(400).json({ error: "El codigo ya esta registrado" });
            }
            const EmailVerificar = await ProveedorModels_1.default.VerificarEmail(email);
            if (EmailVerificar !== 0) {
                return res.status(400).json({ error: "El email ya esta registrado" });
            }
            //OTRA FORMA DE HACERLO 
            const dat_a = await ProveedorModels_1.default.AddProveedorM({ codigo, nombre, telefono, email, direccion, contactoPrincipal });
            res.status(200).json({ message: 'Proveedor Agregado Exitosamente',
                data: dat_a });
        }
        catch (error) {
            console.error("Error al registra al Proveedor:", error);
            res.status(500).json({ error: "ERROR al registrar el Proveedor" });
        }
    };
    static UpdateProveedorC = async (req, res) => {
        try {
            const { idProveedor } = req.params;
            const { codigo, nombre, telefono, email, direccion, contactoPrincipal } = req.body;
            const idProv = String(idProveedor);
            const codiVeri = await ProveedorModels_1.default.VerificarCodigoUpdate(codigo, idProv);
            if (codiVeri !== 0) {
                return res.status(400).json({ error: "El codigo ya estaba registrado" });
            }
            const EmailVeri = await ProveedorModels_1.default.VerificarEmailUpdate(email, idProv);
            if (EmailVeri !== 0) {
                return res.status(400).json({ error: "El email ya estaba registrado" });
            }
            const data = await ProveedorModels_1.default.UpdateProveedorM({ codigo, nombre, telefono, email, direccion, contactoPrincipal }, idProv);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al actualizar un Proveedor: ", error);
            res.status(500).json({ error: "ERROR al Actualizar Proveedor" });
        }
    };
    static DeleteProveedorC = async (req, res) => {
        try {
            const { idProveedor } = req.params;
            const data = await ProveedorModels_1.default.DeleteProveedorM(idProveedor);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al eliminar al Proveedor: ", error);
            res.status(500).json({ error: "ERROR al eliminar al Proveedor" });
        }
    };
}
exports.ProveedorControllers = ProveedorControllers;
//# sourceMappingURL=ProveControllers.js.map