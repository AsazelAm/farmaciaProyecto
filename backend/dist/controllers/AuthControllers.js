"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthControllers = void 0;
const crypto_1 = require("crypto");
const UserModels_1 = __importDefault(require("../Models/UserModels"));
const CodigoModels_1 = __importStar(require("../Models/CodigoModels"));
const mailer_1 = require("../config/mailer");
const auth_1 = require("../Utils/auth");
const jwt_1 = require("../Utils/jwt");
// Codigo de 6 digitos (100000 - 999999) para la verificacion por correo.
const GenerarCodigoLogin = () => String((0, crypto_1.randomInt)(100000, 1000000));
class AuthControllers {
    // ── POST /login: valida credenciales y envia codigo OTP por correo ──────
    // Ya NO devuelve el JWT directamente: primero debe verificar el codigo
    // en POST /verificar-codigo.
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
            const codigo = GenerarCodigoLogin();
            await CodigoModels_1.default.GuardarCodigo(codigo, email);
            const fila = await CodigoModels_1.default.ObtenerCodigo(email);
            const nombreCompleto = `${fila[0]?.nombre || ''} ${fila[0]?.apellido || ''}`.trim();
            try {
                await (0, mailer_1.EnviarCodigoLogin)(email, nombreCompleto, codigo);
            }
            catch (errorEnvio) {
                await CodigoModels_1.default.LimpiarCodigo(email);
                console.error("Error al enviar el codigo de login:", errorEnvio);
                return res.status(500).json({ error: "No se pudo enviar el código de verificación" });
            }
            res.status(200).json({ requiresCode: true, email });
        }
        catch (error) {
            console.error("Error al loguearse:", error);
            return res.status(500).json({ error: "Error al loguearse" });
        }
    };
    // ── POST /verificar-codigo: valida el codigo OTP y entrega el JWT ───────
    static VerificarCodigo = async (req, res) => {
        try {
            const { email, codigo } = req.body;
            const fila = await CodigoModels_1.default.ObtenerCodigo(email);
            if (!fila || fila.length === 0) {
                return res.status(400).json({ error: 'El Email no está registrado' });
            }
            const usuario = fila[0];
            if (!usuario.codigoVerificacion) {
                return res.status(400).json({ error: 'No hay un código activo, solicita uno nuevo' });
            }
            if (Number(usuario.codigoIntentos) >= CodigoModels_1.CODIGO_MAX_INTENTOS) {
                await CodigoModels_1.default.LimpiarCodigo(email);
                return res.status(400).json({ error: 'Se superó el máximo de intentos, solicita un código nuevo' });
            }
            if (!usuario.codigoVigente) {
                await CodigoModels_1.default.LimpiarCodigo(email);
                return res.status(400).json({ error: 'El código ha expirado, solicita uno nuevo' });
            }
            if (String(codigo) !== String(usuario.codigoVerificacion)) {
                const intentos = Number(usuario.codigoIntentos) + 1;
                await CodigoModels_1.default.IncrementarIntentos(email);
                if (intentos >= CodigoModels_1.CODIGO_MAX_INTENTOS) {
                    await CodigoModels_1.default.LimpiarCodigo(email);
                    return res.status(400).json({ error: 'Se superó el máximo de intentos, solicita un código nuevo' });
                }
                const restantes = CodigoModels_1.CODIGO_MAX_INTENTOS - intentos;
                return res.status(401).json({ error: `El código es incorrecto, te quedan ${restantes} intento(s)` });
            }
            await CodigoModels_1.default.LimpiarCodigo(email);
            const token2 = (0, jwt_1.GenerateJwt)(usuario.idUsuario);
            const IDRolArray = await UserModels_1.default.GetIdRol(email);
            if (!IDRolArray || IDRolArray.length === 0) {
                throw new Error("Rol no encontrado");
            }
            const IDRol = IDRolArray[0].nameRol;
            res.status(200).json({ token2, IDRol });
        }
        catch (error) {
            console.error("Error al verificar el codigo:", error);
            return res.status(500).json({ error: "Error al verificar el código" });
        }
    };
    // ── POST /reenviar-codigo: genera otro codigo y lo reenvia ──────────────
    static ReenviarCodigo = async (req, res) => {
        try {
            const { email } = req.body;
            const data = await UserModels_1.default.GetEmail(email);
            if (!data || !data.exists) {
                return res.status(400).json({ error: 'El Email no está registrado' });
            }
            const VeriCon = await UserModels_1.default.VerifedConfirmed(email);
            if (!VeriCon.exists) {
                return res.status(400).json({ error: 'El usuario no está verificado' });
            }
            const codigo = GenerarCodigoLogin();
            await CodigoModels_1.default.GuardarCodigo(codigo, email);
            const fila = await CodigoModels_1.default.ObtenerCodigo(email);
            const nombreCompleto = `${fila[0]?.nombre || ''} ${fila[0]?.apellido || ''}`.trim();
            try {
                await (0, mailer_1.EnviarCodigoLogin)(email, nombreCompleto, codigo);
            }
            catch (errorEnvio) {
                await CodigoModels_1.default.LimpiarCodigo(email);
                console.error("Error al reenviar el codigo de login:", errorEnvio);
                return res.status(500).json({ error: "No se pudo enviar el código de verificación" });
            }
            res.status(200).json({ ok: true, email });
        }
        catch (error) {
            console.error("Error al reenviar el codigo:", error);
            return res.status(500).json({ error: "Error al reenviar el código" });
        }
    };
    static ResetPasswd = async (req, res) => {
        try {
            const { idUsuario } = req.params;
            const { passwd, adminPasswd } = req.body;
            // Verificamos que quien cambia la contraseña sea el usuario logueado,
            // revalidando su propia contraseña actual.
            if (!adminPasswd) {
                return res.status(400).json({ error: "Debes ingresar tu contraseña actual" });
            }
            if (!req.user?.idUsuario) {
                return res.status(401).json({ error: "No autenticado" });
            }
            const AdminPass = await UserModels_1.default.GetPasswdById(req.user.idUsuario);
            const AdminHash = AdminPass[0]?.passwd;
            if (!AdminHash) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }
            const Correct = await (0, auth_1.CheckPassword)(adminPasswd, AdminHash);
            if (!Correct) {
                return res.status(401).json({ error: "Tu contraseña actual es incorrecta" });
            }
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