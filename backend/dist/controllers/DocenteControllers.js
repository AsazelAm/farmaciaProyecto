"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocentesControllers = void 0;
const DocentesModels_1 = __importDefault(require("../Models/DocentesModels"));
const SaveImg_1 = require("../Middleware/SaveImg");
const Time_1 = require("../lib/Time");
const SavePdf_1 = require("../Middleware/SavePdf");
class DocentesControllers {
    // GET - Obtener todos los docentes
    static GetDocenteControllers = async (req, res) => {
        try {
            const data = await DocentesModels_1.default.GetDocentes();
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener docentes:", error);
            res.status(500).json({ error: "Error al obtener docentes" });
        }
    };
    // GET - Obtener un docente por ID
    static GetDocenteByIdControllers = async (req, res) => {
        try {
            const { id } = req.params;
            const data = await DocentesModels_1.default.GetDocenteById(id);
            if (!data) {
                return res.status(404).json({ error: "Docente no encontrado" });
            }
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener docente:", error);
            res.status(500).json({ error: "Error al obtener docente" });
        }
    };
    // POST - Crear docente
    static AddDocentesControllers = async (req, res) => {
        try {
            const files = req.files;
            const imgFile = files['img'] ? files['img'][0] : null;
            const cvFile = files['cv'] ? files['cv'][0] : null;
            const fecha = (0, Time_1.GetDateToday)();
            // Parsear los arrays que vienen como strings
            const array1 = JSON.parse(req.body.array1);
            const array2 = JSON.parse(req.body.array2);
            const { nombre, apellido, celular, url, formacion, descripcion, honorarios, Email } = array1[0];
            const data = await DocentesModels_1.default.Verificar(Email);
            if (data !== 0) {
                return res.status(400).json({ error: "El Email ya está registrado" });
            }
            const id = await DocentesModels_1.default.AddDocenteModels({
                nombre,
                apellido,
                celular,
                url,
                formacion,
                descripcion,
                honorarios,
                Email
            });
            if (array2 && array2.length > 0) {
                for (const detalle of array2) {
                    const { id_ha } = detalle;
                    await DocentesModels_1.default.addDochabi(id, id_ha);
                }
            }
            if (imgFile) {
                const rutaImg = await (0, SaveImg_1.uploadImageGlobal)(imgFile, String(id), fecha, 'Docente');
                await DocentesModels_1.default.UpdateRutaimg(rutaImg, id);
            }
            if (cvFile) {
                const rutaCv = await (0, SavePdf_1.uploadPdfGlobal)(cvFile, String(id), fecha, 'Docente');
                await DocentesModels_1.default.UpdateCvRuta(rutaCv, id);
            }
            res.status(201).json({
                message: 'Docente agregado exitosamente',
                id: id
            });
        }
        catch (error) {
            console.error("Error al guardar el docente:", error);
            res.status(500).json({ error: "Error al guardar el docente" });
        }
    };
    // PUT - Actualizar docente
    static UpdateDocenteControllers = async (req, res) => {
        try {
            const { id } = req.params;
            const files = req.files;
            const imgFile = files['img'] ? files['img'][0] : null;
            const cvFile = files['cv'] ? files['cv'][0] : null;
            const fecha = (0, Time_1.GetDateToday)();
            // Verificar si el docente existe
            const docenteExiste = await DocentesModels_1.default.GetDocenteById(id);
            if (!docenteExiste) {
                return res.status(404).json({ error: "Docente no encontrado" });
            }
            // Parsear los arrays que vienen como strings
            const array1 = JSON.parse(req.body.array1);
            const array2 = JSON.parse(req.body.array2);
            const { nombre, apellido, celular, url, formacion, descripcion, honorarios, Email } = array1[0];
            // Verificar si el email ya existe (excluyendo el docente actual)
            const emailExiste = await DocentesModels_1.default.VerificarEmailUpdate(Email, id);
            if (emailExiste !== 0) {
                return res.status(400).json({ error: "El Email ya está registrado por otro docente" });
            }
            // Actualizar datos del docente
            await DocentesModels_1.default.UpdateDocenteModels(id, {
                nombre,
                apellido,
                celular,
                url,
                formacion,
                descripcion,
                honorarios,
                Email
            });
            // Actualizar habilidades
            if (array2) {
                // Eliminar habilidades anteriores
                await DocentesModels_1.default.DeleteDochabi(id);
                // Agregar nuevas habilidades
                if (array2.length > 0) {
                    for (const detalle of array2) {
                        const { id_ha } = detalle;
                        await DocentesModels_1.default.addDochabi(id, id_ha);
                    }
                }
            }
            // Actualizar imagen si se proporciona
            if (imgFile) {
                const rutaImg = await (0, SaveImg_1.uploadImageGlobal)(imgFile, String(id), fecha, 'Docente');
                await DocentesModels_1.default.UpdateRutaimg(rutaImg, id);
            }
            // Actualizar CV si se proporciona
            if (cvFile) {
                const rutaCv = await (0, SavePdf_1.uploadPdfGlobal)(cvFile, String(id), fecha, 'Docente');
                await DocentesModels_1.default.UpdateCvRuta(rutaCv, id);
            }
            res.status(200).json({
                message: 'Docente actualizado exitosamente'
            });
        }
        catch (error) {
            console.error("Error al actualizar el docente:", error);
            res.status(500).json({ error: "Error al actualizar el docente" });
        }
    };
    // DELETE - Eliminar docente (soft delete)
    static DeleteDocenteControllers = async (req, res) => {
        try {
            const { id } = req.params;
            // Verificar si el docente existe
            const docenteExiste = await DocentesModels_1.default.GetDocenteById(id);
            if (!docenteExiste) {
                return res.status(404).json({ error: "Docente no encontrado" });
            }
            const data = await DocentesModels_1.default.DeleteDocentes(id);
            res.status(200).json({ message: data });
        }
        catch (error) {
            console.error("Error al eliminar docente:", error);
            res.status(500).json({ error: "Error al eliminar docente" });
        }
    };
    // GET - Obtener habilidades de un docente
    static gethabilidadesDocentes = async (req, res) => {
        try {
            const { id } = req.params;
            const data = await DocentesModels_1.default.Gethabilidades(id);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error al obtener habilidades de docentes:", error);
            res.status(500).json({ error: "Error al obtener habilidades de docentes" });
        }
    };
}
exports.DocentesControllers = DocentesControllers;
//# sourceMappingURL=DocenteControllers.js.map