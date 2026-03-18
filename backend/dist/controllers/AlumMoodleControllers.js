"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlumnMoodleControllers = void 0;
const AlumnMoodleModels_1 = __importDefault(require("../Models/AlumnMoodleModels"));
const convertBigIntToString = (obj) => {
    if (obj === null || obj === undefined) {
        return obj;
    }
    // Si es BigInt, convertir a string
    if (typeof obj === 'bigint') {
        return obj.toString();
    }
    // Si es un array, procesar cada elemento
    if (Array.isArray(obj)) {
        return obj.map(item => convertBigIntToString(item));
    }
    // Si es un objeto, procesar cada propiedad
    if (typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                newObj[key] = convertBigIntToString(obj[key]);
            }
        }
        return newObj;
    }
    // Para cualquier otro tipo, retornar tal cual
    return obj;
};
class AlumnMoodleControllers {
    static GetAlumnMoodleController = async (req, res) => {
        try {
            const data = await AlumnMoodleModels_1.default.GetAlumnoMoodle();
            // Convertir los datos antes de enviarlos
            const cleanData = convertBigIntToString(data);
            res.status(200).json(cleanData);
        }
        catch (error) {
            console.error("Error al obtener el AlumnoMoodle:", error);
            res.status(500).json({ error: "Error al obtener el alumnoMoodle" });
        }
    };
}
exports.AlumnMoodleControllers = AlumnMoodleControllers;
//# sourceMappingURL=AlumMoodleControllers.js.map