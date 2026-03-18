import { Request, Response } from "express";
import DataExamen from "../Models/ExamenModels";
import DataCalendario from "../Models/CalendarioModels";
import { AddViewAreas, AddViewPropuesta } from "../Models/CursoModels";

export class CalendarioControllers {
  static readonly GetViewAreas = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = await DataCalendario.GetViewAreasModels(id);
      res.status(200).json(data);
    } catch (error) {
      console.error("Error al obtener el Curso:", error);
      res.status(500).json({ error: "Error al obtener el Curso:" });
    }
  };

  static readonly GetViewPro = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = await DataCalendario.GetViewProModels(id);
      res.status(200).json(data);
    } catch (error) {
      console.error("Error al obtener el Curso:", error);
      res.status(500).json({ error: "Error al obtener el Curso:" });
    }
  };
  static readonly UpCalendarControllers = async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        id_calendario,
        id_pv,
        docente,
        id_mod,
        id_city,
        Estado,
        FechaIni,
        Horaini,
        horaFin,
        Dias,
        id_curso,
        AreasConocimientos,
        ProPuestasDeValor,
      } = req.body;
      const fechaCreacion = new Date();
      const FechaCreacion = fechaCreacion
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      await DataCalendario.UpdateCalendarioMain({
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
        id_calendario,
      });
      const vca = await DataCalendario.GetViewAreasModels(id_calendario);
      if (vca.length > 0) {
        await DataCalendario.DeleteOldVca(id_calendario);
      }
      if (Array.isArray(AreasConocimientos) && AreasConocimientos.length > 0) {
        for (const idAreas of AreasConocimientos) {
          const { id_areas } = idAreas;
          await AddViewAreas(id_calendario, id_areas, id_curso);
        }
      }
      const vcp = await DataCalendario.GetViewProModels(id_calendario);
      if (vcp.length > 0) {
        await DataCalendario.DeleteOldVcp(id_calendario);
      }
      if (Array.isArray(ProPuestasDeValor) && ProPuestasDeValor.length > 0) {
        for (const idPv of ProPuestasDeValor) {
          const { id_pv } = idPv;
          await AddViewPropuesta(id_calendario, id_pv, id_curso);
        }
      }

      const a = "Calendario Actualizado";
      res.status(200).json(a);
    } catch (error) {
      console.error("Error al actualizar el curso:", error);
      res.status(500).json({ error: "Error al actualizar el curso:" });
    }
  };

  static readonly GetCalendarioBy = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = await DataCalendario.GetCalendarioById(id);
      res.status(200).json(data);
    } catch (error) {
      console.error("Error al obtener el Curso:", error);
      res.status(500).json({ error: "Error al obtener el Curso:" });
    }
  };
  static readonly CalendarioSlider = async (req, res) => {
    try {
      const data = await DataCalendario.getCategorias();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error al obtener las Areas:", error);
      res.status(500).json({ error: "Error al obtener  las Areas:" });
    }
  };
}
