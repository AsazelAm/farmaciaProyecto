// src/controllers/CursoControllers.ts
import { Request, Response } from "express";
import {
  listCursosPaged,
  getCursoFull,
  createCursoFull,
  updateCursoFull,
  deleteCursoSoft,
  updateCursoBase,
  CursoBaseUpdate,
  CursoCalendarioModels,
  ModaCalendario,
  CityCalendario,
  AddCalendarioModels,
  GetCalendarioModals,
  DeleteCalendarioModels,
  AddViewAreas,
  AddViewPropuesta,
  GetCursoForCalendarModels,
  listCursoContenido,
  getCursoContenidoById,
  createCursoContenido,
  updateCursoContenido,
  deleteCursoContenido,
  deleteAllCursoContenido,
  createCursoContenidoBulk,
  CursoContenidoTreeInput,
} from "../Models/CursoModels";

import { uploadImageGlobal } from "../Middleware/SaveImg";
import { GetDateToday } from "../lib/Time";

export class CursoControllers {
  /** GET /Curso  -> listado paginado con filtros */
  static async list(req: Request, res: Response) {
    try {
      const q = (req.query.q as string) || "";
      const page = Number(req.query.page ?? 1);
      const perPage = Number(req.query.perPage ?? 10);

      const result = await listCursosPaged(q, page, perPage);
      return res.status(200).json({ ok: true, ...result });
    } catch (err: any) {
      console.error("Error listCursosPaged:", err);
      return res
        .status(500)
        .json({ ok: false, message: "Error al listar cursos" });
    }
  }

  /** GET /Curso/:id -> detalle (base + secciones + ids de áreas/propuestas) */
  static async detail(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const data = await getCursoFull(id);
      if (!data)
        return res
          .status(404)
          .json({ ok: false, message: "Curso no encontrado" });
      return res.status(200).json({ ok: true, data });
    } catch (err: any) {
      console.error("Error detail Curso:", err);
      return res
        .status(500)
        .json({ ok: false, message: "Error al obtener detalle del curso" });
    }
  }

  /**
   * POST /Curso/CreateCursoApi
   * Body: { base, secciones, areas, propuestas }
   * file?: img (multer)
   */
  static async create(req: Request, res: Response) {
    try {
      const file = req.file;
      const fecha = GetDateToday();
      const body = req.body ?? {};
      const base = body.base ?? {};
      const secciones = body.secciones ?? {};
      const areas = Array.isArray(body.areas) ? body.areas.map(Number) : [];
      const propuestas = Array.isArray(body.propuestas)
        ? body.propuestas.map(Number)
        : [];

      // 1) crea curso + secciones + relaciones (sin imagen aún)
      const id = await createCursoFull(base, secciones, areas, propuestas);

      // 2) si llegó imagen, súbela con el id y actualiza img
      if (file) {
        const rutaImg = await uploadImageGlobal(
          file,
          String(id),
          fecha,
          "Curso"
        );
        const patch: CursoBaseUpdate = {
          id_curso: id,
          nombre: base.nombre,
          codigo: base.codigo,
          duracion: base.duracion,
          precio: base.precio ?? null,
          descripcion: base.descripcion ?? null,
          img: rutaImg,
        };
        await updateCursoBase(patch);
      }

      return res
        .status(201)
        .json({ ok: true, message: "Curso creado correctamente", id });
    } catch (err: any) {
      console.error("Error create Curso:", err);
      return res.status(500).json({
        ok: false,
        message: err?.message || "Error al crear el curso",
      });
    }
  }

  /**
   * PUT /Curso/:id
   * Body: { base, secciones, areas, propuestas }
   * file?: img (multer)
   */
  static async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const file = req.file;
      const fecha = GetDateToday();
      const body = req.body ?? {};
      const base = body.base ?? {};
      const secciones = body.secciones ?? {};
      const areas = Array.isArray(body.areas) ? body.areas.map(Number) : [];
      const propuestas = Array.isArray(body.propuestas)
        ? body.propuestas.map(Number)
        : [];

      // 1) actualiza base + secciones + relaciones (sin imagen aún)
      await updateCursoFull(
        { id_curso: id, ...base },
        secciones,
        areas,
        propuestas
      );

      // 2) si hay imagen, súbela y actualiza solo el campo img
      if (file) {
        const rutaImg = await uploadImageGlobal(
          file,
          String(id),
          fecha,
          "Curso"
        );
        const patch: CursoBaseUpdate = {
          id_curso: id,
          nombre: base.nombre,
          codigo: base.codigo,
          duracion: base.duracion,
          precio: base.precio ?? null,
          descripcion: base.descripcion ?? null,
          img: rutaImg,
        };
        await updateCursoBase(patch);
      }

      return res.status(200).json({ ok: true, message: "Curso actualizado" });
    } catch (err: any) {
      console.error("Error update Curso:", err);
      return res.status(500).json({
        ok: false,
        message: err?.message || "Error al actualizar el curso",
      });
    }
  }

  /** DELETE /Curso/:id -> soft delete */
  static async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await deleteCursoSoft(id);
      return res.status(200).json({ ok: true, message: "Curso eliminado" });
    } catch (err: any) {
      console.error("Error delete Curso:", err);
      return res
        .status(500)
        .json({ ok: false, message: "Error al eliminar el curso" });
    }
  }

  static async GetCursoCalendario(req: Request, res: Response) {
    try {
      const data = await CursoCalendarioModels();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error al obtener el Curso:", error);
      res.status(500).json({ error: "Error al obtener el Curso:" });
    }
  }

  static readonly ModalidadCalendario = async (req: Request, res: Response) => {
    try {
      const data = await ModaCalendario();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error al obtener al Obtener Curso:", error);
      res.status(500).json({ error: "Error al obtener el Curso:" });
    }
  };

  static readonly CityModalidad = async (req: Request, res: Response) => {
    try {
      const data = await CityCalendario();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error al obtener al Obtener Curso:", error);
      res.status(500).json({ error: "Error al obtener el Curso:" });
    }
  };

  static readonly CreateCalendarioControllers = async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        HoraIni,
        HoraFin,
        FechaIni,
        Dias,
        id_mod,
        id_pv,
        id_curso,
        id_user,
        id_city,
        Estado,
        AreasConocimientos,
        ProPuestasDeValor,
      } = req.body;

      const fechaCreacion = new Date();
      const FechaCreacion = fechaCreacion
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      const data = await AddCalendarioModels({
        HoraIni,
        HoraFin,
        FechaIni,
        FechaCreacion,
        Dias,
        id_mod,
        id_pv,
        id_curso,
        id_user,
        id_city,
        Estado,
      });
      if (Array.isArray(AreasConocimientos) && AreasConocimientos.length > 0) {
        for (const idAreas of AreasConocimientos) {
          const { id_areas } = idAreas;
          await AddViewAreas(data, id_areas, id_curso);
        }
      }

      if (Array.isArray(ProPuestasDeValor) && ProPuestasDeValor.length > 0) {
        for (const idPv of ProPuestasDeValor) {
          const { id_pv } = idPv;
          await AddViewPropuesta(data, id_pv, id_curso);
        }
      }

      res.status(200).json(data);
    } catch (error) {
      console.error("Error al agendar el curso:", error);
      res.status(500).json({ error: "Error al agendar el curso:" });
    }
  };

  static readonly GetCalendarioControllers = async (
    req: Request,
    res: Response
  ) => {
    try {
      const data = await GetCalendarioModals();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error al obtener el calendario:", error);
      res.status(500).json({ error: "Error al obtener el calendario:" });
    }
  };

  static readonly DeleteCalendarioControllers = async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;
      const data = await DeleteCalendarioModels(Number(id));
      res.status(200).json(data);
    } catch (error) {
      console.error("Error al eliminar la agendacion:", error);
      res.status(500).json({ error: "Error al eliminar la agendacion:" });
    }
  };

  static readonly GetCursoForCalendar = async (req: Request, res: Response) => {
    try {
      const data = await GetCursoForCalendarModels();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error al obtener el calendario:", error);
      res.status(500).json({ error: "Error al obtener el calendario:" });
    }
  };

  /** GET /Curso/:id/contenido -> árbol de contenido del curso */
  static async listContenido(req: Request, res: Response) {
    try {
      const id_curso = Number(req.params.id);
      const data = await listCursoContenido(id_curso);
      return res.status(200).json({ ok: true, data });
    } catch (err: any) {
      console.error("Error listContenido Curso:", err);
      return res
        .status(500)
        .json({ ok: false, message: "Error al listar el contenido del curso" });
    }
  }

  /** GET /Curso/:id/contenido/:contenidoId -> item individual */
  static async getContenido(req: Request, res: Response) {
    try {
      const id_contenido = Number(req.params.contenidoId);
      const data = await getCursoContenidoById(id_contenido);
      if (!data) {
        return res
          .status(404)
          .json({ ok: false, message: "Contenido no encontrado" });
      }
      return res.status(200).json({ ok: true, data });
    } catch (err: any) {
      console.error("Error getContenido Curso:", err);
      return res
        .status(500)
        .json({ ok: false, message: "Error al obtener el contenido" });
    }
  }

  /** POST /Curso/:id/contenido */
  static async createContenido(req: Request, res: Response) {
    try {
      const id_curso = Number(req.params.id);
      const { padre_id, titulo, descripcion, orden, nivel } = req.body;

      const nuevoId = await createCursoContenido({
        id_curso,
        padre_id: padre_id ?? null,
        titulo,
        descripcion: descripcion ?? null,
        orden: typeof orden === "number" ? orden : undefined,
        nivel: typeof nivel === "number" ? nivel : undefined,
      });

      const data = await getCursoContenidoById(nuevoId);

      return res.status(201).json({
        ok: true,
        message: "Contenido creado",
        id: nuevoId,
        data,
      });
    } catch (err: any) {
      console.error("Error createContenido Curso:", err);
      return res.status(500).json({
        ok: false,
        message: err?.message || "Error al crear el contenido",
      });
    }
  }

  /** PUT /Curso/:id/contenido/:contenidoId */
  static async updateContenido(req: Request, res: Response) {
    try {
      const id_curso = Number(req.params.id);
      const id_contenido = Number(req.params.contenidoId);
      const { padre_id, titulo, descripcion, orden, nivel } = req.body;

      await updateCursoContenido({
        id_contenido,
        id_curso,
        padre_id,
        titulo,
        descripcion,
        orden,
        nivel,
      });

      const data = await getCursoContenidoById(id_contenido);

      return res.status(200).json({
        ok: true,
        message: "Contenido actualizado",
        data,
      });
    } catch (err: any) {
      console.error("Error updateContenido Curso:", err);
      return res.status(500).json({
        ok: false,
        message: err?.message || "Error al actualizar el contenido",
      });
    }
  }

  /** DELETE /Curso/:id/contenido/:contenidoId */
  static async deleteContenido(req: Request, res: Response) {
    try {
      const id_curso = Number(req.params.id);
      const id_contenido = Number(req.params.contenidoId);

      await deleteCursoContenido(id_curso, id_contenido);

      return res.status(200).json({
        ok: true,
        message: "Contenido eliminado",
      });
    } catch (err: any) {
      console.error("Error deleteContenido Curso:", err);
      return res.status(500).json({
        ok: false,
        message: "Error al eliminar el contenido",
      });
    }
  }

  /** DELETE /Curso/:id/contenido  -> eliminar TODO el contenido del curso */
  static async deleteAllContenido(req: Request, res: Response) {
    try {
      const id_curso = Number(req.params.id);

      await deleteAllCursoContenido(id_curso);

      return res.status(200).json({
        ok: true,
        message: "Todo el contenido del curso fue eliminado",
      });
    } catch (err: any) {
      console.error("Error deleteAllContenido Curso:", err);
      return res.status(500).json({
        ok: false,
        message: "Error al limpiar el contenido del curso",
      });
    }
  }

  // POST /Curso/:id/contenido/bulk
 static async createContenidoBulk(req: Request, res: Response) {
    try {
      const id_curso = Number(req.params.id);
      const nodes = (req.body?.nodes ?? []) as CursoContenidoTreeInput[];

      if (!Array.isArray(nodes) || nodes.length === 0) {
        return res.status(400).json({
          ok: false,
          message: "No se envió contenido para guardar",
        });
      }

      await createCursoContenidoBulk(id_curso, nodes);

      return res.status(201).json({
        ok: true,
        message: "Contenido del curso guardado correctamente",
      });
    } catch (err: any) {
      console.error("Error createContenidoBulk Curso:", err);
      return res.status(500).json({
        ok: false,
        message: err?.message || "Error al guardar el contenido del curso",
      });
    }
  }
}

export default CursoControllers;
