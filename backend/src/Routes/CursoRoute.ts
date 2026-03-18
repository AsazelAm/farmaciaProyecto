import { Router, NextFunction, Request, Response } from "express";
import CursoControllers from "../controllers/CursoControllers";
import { authenticate } from "../Middleware/auth";
import multer from "multer";
import { body } from "express-validator";
import { handleInputErrors } from "../Middleware/validation";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.use(authenticate);

// helper para envolver async handlers
const ah =
  (fn: (req: Request, res: Response) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res)).catch(next);

// si mandas JSON dentro de FormData, parsea:
function parseJsonFields(req: Request, _res: Response, next: NextFunction) {
  try {
    if (typeof req.body.base === "string")
      req.body.base = JSON.parse(req.body.base);
    if (typeof req.body.secciones === "string")
      req.body.secciones = JSON.parse(req.body.secciones);
    if (typeof req.body.areas === "string")
      req.body.areas = JSON.parse(req.body.areas);
    if (typeof req.body.propuestas === "string")
      req.body.propuestas = JSON.parse(req.body.propuestas);
  } catch {
    /* deja que el controller valide */
  }
  next();
}

//rutas para calendario NO Baja, colocar todas las rutas que no activen el handler primero
router.get("/GetCalendarios", ah(CursoControllers.GetCalendarioControllers));
router.get("/ModCalendario", ah(CursoControllers.ModalidadCalendario));
router.get("/City", ah(CursoControllers.CityModalidad));
router.post(
  "/addCalendario",
  body("id_curso")
    .notEmpty()
    .withMessage("El curso es obligatorio")
    .custom((value) => {
      if (value === 0 || value === "0") {
        throw new Error("El curso no puede ser 0");
      }
      return true;
    }),
  body("id_mod")
    .notEmpty()
    .withMessage("El curso es obligatorio")
    .custom((value) => {
      if (value === 0 || value === "0") {
        throw new Error("El curso no puede ser 0");
      }
      return true;
    }),
  handleInputErrors,
  ah(CursoControllers.CreateCalendarioControllers)
);

router.get("/GetCursoCalendario", ah(CursoControllers.GetCursoForCalendar));
router.delete(
  "/DeleteCalendario/:id",
  ah(CursoControllers.DeleteCalendarioControllers)
);

/* ========= REST estándar ========= */
router.get("/", ah(CursoControllers.list));
router.get("/:id", ah(CursoControllers.detail));
router.post(
  "/",
  upload.single("img"),
  parseJsonFields,
  ah(CursoControllers.create)
);
router.put(
  "/:id",
  upload.single("img"),
  parseJsonFields,
  ah(CursoControllers.update)
);
router.delete("/:id", ah(CursoControllers.remove));

// ====== RUTAS DE CONTENIDO DEL CURSO (curso_contenido) ======
router.get("/:id/contenido", ah(CursoControllers.listContenido));
router.get("/:id/contenido/:contenidoId", ah(CursoControllers.getContenido));
router.post("/:id/contenido", ah(CursoControllers.createContenido));
router.put("/:id/contenido/:contenidoId", ah(CursoControllers.updateContenido));
router.delete("/:id/contenido/:contenidoId", ah(CursoControllers.deleteContenido));
router.delete("/:id/contenido", ah(CursoControllers.deleteAllContenido));

export default router;
