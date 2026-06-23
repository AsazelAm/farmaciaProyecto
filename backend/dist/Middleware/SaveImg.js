"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageGlobal = uploadImageGlobal;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
async function uploadImageGlobal(file, id, fecha, ruta) {
    const folderPath = `./Uploads/img/${ruta}/${id}-${fecha}`;
    if (!fs_1.default.existsSync(folderPath)) {
        fs_1.default.mkdirSync(folderPath, { recursive: true });
    }
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const extension = path_1.default.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(extension)) {
        throw new Error(`Formato inválido para ${file.originalname}. Solo JPG, JPEG y PNG permitidos.`);
    }
    if (file.size > 5 * 1024 * 1024) {
        throw new Error(`La imagen ${file.originalname} debe pesar máximo 5MB`);
    }
    // Siempre será WEBP
    const fileName = `${id}-${fecha}.webp`;
    const savePath = path_1.default.join(folderPath, fileName);
    try {
        // Convertir y optimizar como WebP
        await (0, sharp_1.default)(file.buffer)
            .webp({
            quality: 70, // calidad (ajustable)
            effort: 6 // nivel de compresión (0–6, más alto = más lento pero mejor)
        })
            .toFile(savePath);
        return savePath;
    }
    catch (error) {
        console.error('Error al convertir imagen a WebP:', error);
        throw new Error('Error al convertir imagen a WebP.');
    }
}
//# sourceMappingURL=SaveImg.js.map