"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserControllers = void 0;
const UserModels_1 = __importDefault(require("../Models/UserModels"));
const SaveImg_1 = require("../Middleware/SaveImg");
const Time_1 = require("../lib/Time");
const auth_1 = require("../Utils/auth");
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
            res.status(201).json({ message: "Usuario creado con éxito", id_usuario: id_usuario });
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
            const data = await UserModels_1.default.UpodateUserbyId({ ci, nombre, apellido, telefono, email, idTipoUs, idSucursal, idUsuario });
            if (imgFile) {
                const rutaImg = await (0, SaveImg_1.uploadImageGlobal)(imgFile, String(idUsuario), fecha, 'Usuario');
                await UserModels_1.default.UpdateRutaimg(rutaImg, idUsuario);
            }
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al actualizar usuarios:", error);
            res.status(500).json({ error: "Error al actualizar usuarios:" });
        }
    };
}
exports.UserControllers = UserControllers;
//# sourceMappingURL=UserControllers.js.map