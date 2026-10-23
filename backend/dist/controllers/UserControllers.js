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
exports.UserControllers = void 0;
const crypto_1 = require("crypto");
const UserModels_1 = __importDefault(require("../Models/UserModels"));
const CodigoModels_1 = __importStar(require("../Models/CodigoModels"));
const mailer_1 = require("../config/mailer");
const SaveImg_1 = require("../Middleware/SaveImg");
const Time_1 = require("../lib/Time");
const auth_1 = require("../Utils/auth");
// Genera un codigo de 6 digitos, lo guarda y lo envia al correo indicado.
// Devuelve false si el envio falla (el usuario queda pendiente y puede
// solicitar un reenvio desde el modal).
const GenerarYEnviarCodigoRegistro = async (email, nombreCompleto) => {
    try {
        const codigo = String((0, crypto_1.randomInt)(100000, 1000000));
        await CodigoModels_1.default.GuardarCodigo(codigo, email);
        await (0, mailer_1.EnviarCodigoRegistro)(email, nombreCompleto, codigo);
        return true;
    }
    catch (error) {
        console.error("Error al enviar el codigo de verificacion:", error);
        return false;
    }
};
class UserControllers {
    static GetAllUser = async (req, res) => {
        try {
            const data = await UserModels_1.default.UserAllModels();
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener Usuario:", error);
            res.status(500).json({ error: "ERROR al obtener el Usuario:" });
        }
    };
    static GetAllUserId = async (req, res) => {
        try {
            const { idUsuario } = req.params;
            const data = await UserModels_1.default.UserAllModelsId(idUsuario);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener Usuario:", error);
            res.status(500).json({ error: "ERROR al obtener el Usuario:" });
        }
    };
    static CreateUserControllers = async (req, res) => {
        try {
            const { ci, nombre, apellido, passwd, telefono, email, idTipoUs, idSucursal } = req.body;
            const files = req.file;
            const imgFile = files;
            const fecha = (0, Time_1.GetDateToday)();
            const VE = await UserModels_1.default.GetEmail(email);
            if (VE.exists) {
                res.status(400).json({ error: "El Email ya esta Registrado" });
                return;
            }
            const CEDU = await UserModels_1.default.GetCI(ci);
            if (CEDU.exists) {
                res.status(400).json({ error: "La Cedula de Identidad ya esta Registrado" });
                return;
            }
            const NewPasswd = await (0, auth_1.HashPassword)(passwd);
            const id_usuario = await UserModels_1.default.CreateUsuarioM({
                ci,
                nombre,
                apellido,
                passwd: NewPasswd,
                telefono,
                email,
                idTipoUs,
                idSucursal
            });
            if (imgFile) {
                const rutaImg = await (0, SaveImg_1.uploadImageGlobal)(imgFile, String(id_usuario), fecha, 'Usuario');
                await UserModels_1.default.UpdateRutaimg(rutaImg, id_usuario);
            }
            // La cuenta queda pendiente (confirmed = 0) hasta verificar el codigo.
            const nombreCompleto = `${nombre} ${apellido}`.trim();
            const correoEnviado = await GenerarYEnviarCodigoRegistro(email, nombreCompleto);
            res.status(201).json({
                message: correoEnviado
                    ? "Usuario creado con éxito. Verifica el correo para activar la cuenta."
                    : "Usuario creado, pero no se pudo enviar el correo de verificación.",
                id_usuario,
                requiresVerification: true,
                email,
                correoEnviado
            });
        }
        catch (error) {
            console.error("Error al crear usuario:", error);
            res.status(500).json({ error: "Error al crear usuario:" });
        }
    };
    static DeleteUserControllers = async (req, res) => {
        try {
            const { idUsuario } = req.params;
            const data = await UserModels_1.default.DeleteUserId(idUsuario);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al eliminar el usuario:", error);
            res.status(500).json({ error: "Error al eliminar el usuario:" });
        }
    };
    static UpdateUserControllers = async (req, res) => {
        try {
            const idUsuario = Number(req.params.idUsuario);
            const { ci, nombre, apellido, telefono, email, idTipoUs, idSucursal } = req.body;
            const files = req.file;
            const imgFile = files;
            const fecha = (0, Time_1.GetDateToday)();
            const actuales = await UserModels_1.default.UserAllModelsId(idUsuario);
            const usuarioActual = Array.isArray(actuales) ? actuales[0] : actuales;
            if (!usuarioActual) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }
            const emailCambio = String(usuarioActual.email ?? "").toLowerCase() !== String(email ?? "").toLowerCase();
            if (emailCambio) {
                const VE = await UserModels_1.default.GetEmail(email);
                if (VE.exists) {
                    return res.status(400).json({ error: "El Email ya esta Registrado" });
                }
            }
            const data = await UserModels_1.default.UpodateUserbyId({ ci, nombre, apellido, telefono, email, idTipoUs, idSucursal, idUsuario });
            if (imgFile) {
                const rutaImg = await (0, SaveImg_1.uploadImageGlobal)(imgFile, String(idUsuario), fecha, 'Usuario');
                await UserModels_1.default.UpdateRutaimg(rutaImg, idUsuario);
            }
            // Si cambio el correo, la cuenta vuelve a quedar pendiente y se
            // envia un codigo al nuevo email para confirmarlo.
            if (emailCambio) {
                await UserModels_1.default.SetConfirmed(email, 0);
                const nombreCompleto = `${nombre} ${apellido}`.trim();
                const correoEnviado = await GenerarYEnviarCodigoRegistro(email, nombreCompleto);
                return res.status(200).json({
                    message: correoEnviado
                        ? "Datos actualizados. Verifica el nuevo correo para activar la cuenta."
                        : "Datos actualizados, pero no se pudo enviar el correo de verificación.",
                    requiresVerification: true,
                    email,
                    correoEnviado
                });
            }
            res.status(200).json({ message: data, requiresVerification: false });
        }
        catch (error) {
            console.error("Error al actualizar usuarios:", error);
            res.status(500).json({ error: "Error al actualizar usuarios:" });
        }
    };
    // ── POST /verificar-codigo: confirma la cuenta tras crear/cambiar email ──
    static VerificarCodigoRegistro = async (req, res) => {
        try {
            const { email, codigo } = req.body;
            const fila = await CodigoModels_1.default.ObtenerCodigo(email);
            if (!fila || fila.length === 0) {
                return res.status(400).json({ error: "El Email no está registrado" });
            }
            const usuario = fila[0];
            if (Number(usuario.confirmed) === 1) {
                return res.status(200).json({ message: "El usuario ya está verificado", confirmed: true, email });
            }
            if (!usuario.codigoVerificacion) {
                return res.status(400).json({ error: "No hay un código activo, solicita uno nuevo" });
            }
            if (Number(usuario.codigoIntentos) >= CodigoModels_1.CODIGO_MAX_INTENTOS) {
                await CodigoModels_1.default.LimpiarCodigo(email);
                return res.status(400).json({ error: "Se superó el máximo de intentos, solicita un código nuevo" });
            }
            if (!usuario.codigoVigente) {
                await CodigoModels_1.default.LimpiarCodigo(email);
                return res.status(400).json({ error: "El código ha expirado, solicita uno nuevo" });
            }
            if (String(codigo) !== String(usuario.codigoVerificacion)) {
                const intentos = Number(usuario.codigoIntentos) + 1;
                await CodigoModels_1.default.IncrementarIntentos(email);
                if (intentos >= CodigoModels_1.CODIGO_MAX_INTENTOS) {
                    await CodigoModels_1.default.LimpiarCodigo(email);
                    return res.status(400).json({ error: "Se superó el máximo de intentos, solicita un código nuevo" });
                }
                const restantes = CodigoModels_1.CODIGO_MAX_INTENTOS - intentos;
                return res.status(401).json({ error: `El código es incorrecto, te quedan ${restantes} intento(s)` });
            }
            await UserModels_1.default.SetConfirmed(email, 1);
            await CodigoModels_1.default.LimpiarCodigo(email);
            res.status(200).json({ message: "Usuario verificado correctamente", confirmed: true, email });
        }
        catch (error) {
            console.error("Error al verificar el codigo de registro:", error);
            return res.status(500).json({ error: "Error al verificar el código" });
        }
    };
    // ── POST /reenviar-codigo: genera y reenvia el codigo de verificacion ────
    static ReenviarCodigoRegistro = async (req, res) => {
        try {
            const { email } = req.body;
            const data = await UserModels_1.default.GetEmail(email);
            if (!data || !data.exists) {
                return res.status(400).json({ error: "El Email no está registrado" });
            }
            const fila = await CodigoModels_1.default.ObtenerCodigo(email);
            if (!fila || fila.length === 0) {
                return res.status(400).json({ error: "El Email no está registrado" });
            }
            const nombreCompleto = `${fila[0]?.nombre || ''} ${fila[0]?.apellido || ''}`.trim();
            const correoEnviado = await GenerarYEnviarCodigoRegistro(email, nombreCompleto);
            if (!correoEnviado) {
                return res.status(500).json({ error: "No se pudo enviar el correo de verificación" });
            }
            res.status(200).json({ ok: true, email });
        }
        catch (error) {
            console.error("Error al reenviar el codigo de registro:", error);
            return res.status(500).json({ error: "Error al reenviar el código" });
        }
    };
}
exports.UserControllers = UserControllers;
//# sourceMappingURL=UserControllers.js.map