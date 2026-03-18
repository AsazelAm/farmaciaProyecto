"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CursoInscritosDocControllers = void 0;
const CursoInscDocModels_1 = __importDefault(require("../Models/CursoInscDocModels"));
class CursoInscritosDocControllers {
    static GetAllCursoDocControllers = async (req, res) => {
        try {
            const { id } = req.params;
            const data = await CursoInscDocModels_1.default.GetCursDocAll(id);
            console.log(" Datos obtenidos:", data);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener los Curso Asignados al docente:", error);
            res.status(500).json({ error: "Erro al obtener Curso Asignados" });
        }
    };
    static GetAlumAsisControllers = async (req, res) => {
        try {
            const { id_cal } = req.params;
            console.log("id del calendario", id_cal);
            const data = await CursoInscDocModels_1.default.GetAlumAsis(id_cal);
            console.log("Datos Obtenidos:", data);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener los alumnos y asistencias:", error);
            res.status(500).json({ error: "Error al obtener los alumnos y asistencias" });
        }
    };
    static AddAsistenAlumControllers = async (req, res) => {
        try {
            const { fecha_asistencia, id_user, id_calendario } = req.body;
            const data = await CursoInscDocModels_1.default.AddAsistencia(fecha_asistencia, id_user, id_calendario);
            console.log("Datos Obtenidos:", data);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al crear Asistencia:", error);
            res.status(500).json({ error: "Error al crear Asistencia" });
        }
    };
    static UpdateAsisControllers = async (req, res) => {
        try {
            const { id } = req.params;
            const { asistencia, fecha_asistencia, id_user, id_calendario } = req.body;
            console.log("📥 Datos recibidos en Controller:", { asistencia, fecha_asistencia, id_user, id_calendario });
            const data = await CursoInscDocModels_1.default.UpdateAsis(asistencia, fecha_asistencia, id_user, id_calendario, id);
            console.log("Datos Obtenidos:", data);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al actualizar Asistencia:,", error);
            res.status(500).json({ error: "Error al actualizar Asistencias" });
        }
    };
    static UpdateFechaControllers = async (req, res) => {
        try {
            const { fecha_antigua, fecha_nueva, id_calendario } = req.body;
            const data = await CursoInscDocModels_1.default.UpdateFecha(fecha_antigua, fecha_nueva, id_calendario);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Erro al actualizar fecha:,", error);
            res.status(500).json({ error: "Error al actualizar Fecha" });
        }
    };
    static GetNotaAluController = async (req, res) => {
        try {
            const { id_user, id_calendario } = req.params;
            console.log("Obteniendo notas - id_user:", id_user, "id_calendario:", id_calendario);
            const data = await CursoInscDocModels_1.default.GetNotasAlu(id_user, id_calendario);
            console.log(" Datos Obtenidos:", data);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al mostrar las notas:", error);
            res.status(500).json({ error: "Error al mostrar las Notas" });
        }
    };
    static AddNotaAluController = async (req, res) => {
        try {
            const { nota, id_user, id_calendario } = req.body;
            console.log("Agregando nota - datos:", { nota, id_user, id_calendario });
            const data = await CursoInscDocModels_1.default.AddNotasAlum(nota, id_user, id_calendario);
            console.log("Nota insertada con ID:", data);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al insertar Nota:", error);
            res.status(500).json({ error: "Error al insertar Notas" });
        }
    };
    static UpdateNotaAluController = async (req, res) => {
        try {
            const { id_nota } = req.params;
            const { nota, id_user, id_calendario } = req.body;
            console.log(" Actualizando nota:", { id_nota, nota, id_user, id_calendario });
            const data = await CursoInscDocModels_1.default.UpdateNotaAlum(nota, id_user, id_calendario, id_nota);
            console.log("Nota actualizada:", data);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al actualizar Nota:", error);
            res.status(500).json({ error: "Error al Actualizar Nota" });
        }
    };
}
exports.CursoInscritosDocControllers = CursoInscritosDocControllers;
//# sourceMappingURL=CursoInscritosDocControllers.js.map