"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthControllers = void 0;
const UserModels_1 = __importDefault(require("../Models/UserModels"));
const auth_1 = require("../Utils/auth");
const jwt_1 = require("../Utils/jwt");
class AuthControllers {
    static Login = async (req, res) => {
        try {
            const { email, passwd } = req.body;
            const data = await UserModels_1.default.GetEmail(email);
            if (!data || !data.exists) {
                return res.status(400).json({ error: 'El Email no está registrado' });
            }
            const VeriCon = await UserModels_1.default.VerifedConfirmed(email);
            if (!VeriCon.exists) {
                return res.status(400).json({ error: 'El usuario no está verificado' });
            }
            const Pass = await UserModels_1.default.GetPasswd(email);
            const VerPass = Pass[0].passwd;
            const Correct = await (0, auth_1.CheckPassword)(passwd, VerPass);
            if (!Correct) {
                return res.status(401).json({ error: 'El password es incorrecto' });
            }
            const idUser = Pass[0].idUsuario;
            const token2 = (0, jwt_1.GenerateJwt)(idUser);
            const IDRolArray = await UserModels_1.default.GetIdRol(email);
            if (!IDRolArray || IDRolArray.length === 0) {
                throw new Error("Rol no encontrado");
            }
            const IDRol = IDRolArray[0].nameRol;
            res.status(200).json({ token2, IDRol });
        }
        catch (error) {
            console.error("Error al loguearse:", error);
            return res.status(500).json({ error: "Error al loguearse" });
        }
    };
    static ResetPasswd = async (req, res) => {
        try {
            const { idUsuario } = req.params;
            const { passwd } = req.body;
            const NewPasswd = await (0, auth_1.HashPassword)(passwd);
            const data = await UserModels_1.default.ResetPasswd(NewPasswd, idUsuario);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al restablecer la contrasenha:", error);
            res.status(500).json({ error: "Error al restablecer la contrasenha" });
        }
    };
    static GetAuthUser = async (req, res) => {
        try {
            return res.json(req.user);
        }
        catch (error) {
            console.error("Error al Obtener los Usuarios Auth:", error);
            res.status(500).json({ error: "Error al Obtener los Usuarios Auth" });
        }
    };
    // ── GET: Datos completos del usuario actualmente logueado ─────────────────
    // A diferencia de GetAuthUser (que solo reenvía lo que el middleware
    // guardó en req.user: idUsuario, idTipoUs, nameRol), este método consulta
    // la fila completa del usuario -incluyendo nombre, apellido e idSucursal-
    // que es lo que necesita el frontend para mostrar "Atendido por" en el POS.
    static GetMe = async (req, res) => {
        try {
            // idUsuario viene del token ya verificado por el middleware "authenticate",
            // nunca de req.params/body -> así nadie puede pedir datos de otro usuario.
            if (!req.user?.idUsuario) {
                return res.status(401).json({ error: 'No autenticado' });
            }
            // Reutilizamos la función que ya existía en UserModels.ts
            const rows = await UserModels_1.default.UserAllModelsId(req.user.idUsuario);
            const usuario = Array.isArray(rows) ? rows[0] : rows;
            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            return res.json(usuario);
        }
        catch (error) {
            console.error("Error al obtener el usuario actual:", error);
            res.status(500).json({ error: "Error al obtener el usuario actual" });
        }
    };
}
exports.AuthControllers = AuthControllers;
//# sourceMappingURL=AuthControllers.js.map