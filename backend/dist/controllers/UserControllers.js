"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserControllers = void 0;
const UserModels_1 = __importDefault(require("../Models/UserModels"));
const auth_1 = require("../Utils/auth");
class UserControllers {
    static GetAllUser = async (req, res) => {
        try {
            const data = await UserModels_1.default.UserAllModels();
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener el Rol:", error);
            res.status(500).json({ error: "Error al obtener el Rol:" });
        }
    };
    static CreateUserControllers = async (req, res) => {
        try {
            const { nombre, apellido, id_rol, Passwd, ci, Email, telefono, id_city, id_country } = req.body;
            const VE = await UserModels_1.default.GetEmail(Email);
            if (VE.exists) {
                res.status(400).json({ error: "El Email ya esta Registrado" });
                return;
            }
            const CEDU = await UserModels_1.default.GetCI(ci);
            if (CEDU.exists) {
                res.status(400).json({ error: "La Cedula de Identidad ya esta Registrado" });
                return;
            }
            const NewPasswd = await (0, auth_1.HashPassword)(Passwd);
            await UserModels_1.default.CreateAdmins({
                id_rol,
                nombre,
                apellido,
                ci,
                Email,
                telefono,
                id_city,
                id_country,
                Passwd: NewPasswd,
            });
            res.status(201).json({ message: "Usuario creado con éxito" });
        }
        catch (error) {
            console.error("Error al crear usuario:", error);
            res.status(500).json({ error: "Error al crear usuario:" });
        }
    };
    static DeleteUserControllers = async (req, res) => {
        try {
            const { id } = req.params;
            const data = await UserModels_1.default.DeleteUserId(id);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al eliminar el usuario:", error);
            res.status(500).json({ error: "Error al eliminar el usuario:" });
        }
    };
    static UpdateUserControllers = async (req, res) => {
        try {
            const { id } = req.params;
            const { id_rol, nombre, apellido, Email, telefono, id_city } = req.body;
            const data = await UserModels_1.default.UpodateUserbyId({ id_rol, nombre, apellido, Email, telefono, id_city, id });
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al actualizar usuarios:", error);
            res.status(500).json({ error: "Error al actualizar usuarios:" });
        }
    };
    static Getdocentes = async (req, res) => {
        try {
            const data = await UserModels_1.default.GetDocentesModels();
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al actualizar usuarios:", error);
            res.status(500).json({ error: "Error al actualizar usuarios:" });
        }
    };
    //roles
    static GetRol = async (req, res) => {
        try {
            const data = await UserModels_1.default.RolAllModels();
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener el Rol:", error);
            res.status(500).json({ error: "Error al obtener el Rol:" });
        }
    };
    static addRolController = async (req, res) => {
        try {
            const { rol } = req.body;
            const data = await UserModels_1.default.addRol(rol);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al crear nuevo rol:", error);
            res.status(500).json({ error: "Error al crear nuevo rol:" });
        }
    };
    static DeleteRolControolers = async (req, res) => {
        try {
            const { id } = req.params;
            const data = await UserModels_1.default.DeleteRol(id);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al eliminar el rol:", error);
            res.status(500).json({ error: "Error al eliminar el rol:" });
        }
    };
    static UpdateRolControllers = async (req, res) => {
        try {
            const { id } = req.params;
            const { rol } = req.body;
            const data = await UserModels_1.default.UpdateRolModels(id, rol);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al actualizar el rol:", error);
            res.status(500).json({ error: "Error al actualizar el rol:" });
        }
    };
    static GetAlumnosControllers = async (req, res) => {
        try {
            const data = await UserModels_1.default.GetAlumnosModels();
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al actualizar el rol:", error);
            res.status(500).json({ error: "Error al actualizar el rol:" });
        }
    };
    static GetCityCountryControllers = async (req, res) => {
        try {
            const { id_contry } = req.params;
            const data = await UserModels_1.default.GetCityCoun(id_contry);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al actualizar la Ciudad:", error);
            res.status(500).json({ error: "Error al actualizar la Ciudad:" });
        }
    };
    static CreateStudentsControllers = async (req, res) => {
        try {
            const { nombre, apellido, Email, telefono, ci, id_empresa, id_city, id_country } = req.body;
            const data = await UserModels_1.default.createStudentsModels({ nombre, apellido, Email, telefono, ci, id_empresa, id_city, id_country });
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al actualizar el rol:", error);
            res.status(500).json({ error: "Error al actualizar el rol:" });
        }
    };
    static UpdateStudentsController = async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, apellido, Email, telefono, ci, id_empresa, id_city } = req.body;
            const data = await UserModels_1.default.UpdateStudentsModels({
                nombre,
                apellido,
                Email,
                telefono,
                ci,
                id_empresa,
                id_city,
                id
            });
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al actualizar Estudiante:", error);
            res.status(500).json({ error: "Error al actualizar al Estudiante:" });
        }
    };
}
exports.UserControllers = UserControllers;
//# sourceMappingURL=UserControllers.js.map