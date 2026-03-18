"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarioControllers = void 0;
const CalendarioModels_1 = __importDefault(require("../Models/CalendarioModels"));
const CursoModels_1 = require("../Models/CursoModels");
class CalendarioControllers {
    static GetViewAreas = async (req, res) => {
        try {
            const { id } = req.params;
            const data = await CalendarioModels_1.default.GetViewAreasModels(id);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener el Curso:", error);
            res.status(500).json({ error: "Error al obtener el Curso:" });
        }
    };
    static GetViewPro = async (req, res) => {
        try {
            const { id } = req.params;
            const data = await CalendarioModels_1.default.GetViewProModels(id);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener el Curso:", error);
            res.status(500).json({ error: "Error al obtener el Curso:" });
        }
    };
    static UpCalendarControllers = async (req, res) => {
        try {
            const { id_calendario, id_pv, docente, id_mod, id_city, Estado, FechaIni, Horaini, horaFin, Dias, id_curso, AreasConocimientos, ProPuestasDeValor } = req.body;
            const fechaCreacion = new Date();
            const FechaCreacion = fechaCreacion.toISOString().slice(0, 19).replace('T', ' ');
            await CalendarioModels_1.default.UpdateCalendarioMain({
                Horaini,
                horaFin,
                FechaIni,
                FechaCreacion,
                Dias,
                id_mod,
                id_pv,
                id_curso,
                docente,
                id_city,
                Estado,
                id_calendario
            });
            const vca = await CalendarioModels_1.default.GetViewAreasModels(id_calendario);
            if (vca.length > 0) {
                await CalendarioModels_1.default.DeleteOldVca(id_calendario);
            }
            if (Array.isArray(AreasConocimientos) && AreasConocimientos.length > 0) {
                for (const idAreas of AreasConocimientos) {
                    const { id_areas } = idAreas;
                    await (0, CursoModels_1.AddViewAreas)(id_calendario, id_areas, id_curso);
                }
            }
            const vcp = await CalendarioModels_1.default.GetViewProModels(id_calendario);
            if (vcp.length > 0) {
                await CalendarioModels_1.default.DeleteOldVcp(id_calendario);
            }
            if (Array.isArray(ProPuestasDeValor) && ProPuestasDeValor.length > 0) {
                for (const idPv of ProPuestasDeValor) {
                    const { id_pv } = idPv;
                    await (0, CursoModels_1.AddViewPropuesta)(id_calendario, id_pv, id_curso);
                }
            }
            const a = "Calendario Actualizado";
            res.status(200).json(a);
        }
        catch (error) {
            console.error("Error al actualizar el curso:", error);
            res.status(500).json({ error: "Error al actualizar el curso:" });
        }
    };
    static GetCalendarioBy = async (req, res) => {
        try {
            const { id } = req.params;
            const data = await CalendarioModels_1.default.GetCalendarioById(id);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener el Curso:", error);
            res.status(500).json({ error: "Error al obtener el Curso:" });
        }
    };
}
exports.CalendarioControllers = CalendarioControllers;
//# sourceMappingURL=CalendarioControllers.js.map