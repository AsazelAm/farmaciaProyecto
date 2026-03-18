"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPdfGlobal = uploadPdfGlobal;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function uploadPdfGlobal(file, id, fecha, ruta) {
    const folderPath = `./Uploads/pdf/${ruta}/${id}-${fecha}`;
    if (!fs_1.default.existsSync(folderPath)) {
        fs_1.default.mkdirSync(folderPath, { recursive: true });
    }
    // Solo permitir PDF
    const allowedExtensions = ['.pdf'];
    const extension = path_1.default.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(extension)) {
        throw new Error(`Formato inválido para ${file.originalname}. Solo PDF permitido.`);
    }
    // Tamaño máximo 10 MB (puedes cambiarlo)
    if (file.size > 10 * 1024 * 1024) {
        throw new Error(`El archivo ${file.originalname} debe pesar máximo 10MB`);
    }
    const fileName = `${id}-${fecha}${extension}`;
    const savePath = path_1.default.join(folderPath, fileName);
    try {
        // Guardar el archivo directamente
        fs_1.default.writeFileSync(savePath, file.buffer);
        return savePath;
    }
    catch (error) {
        console.error('Error al guardar el PDF:', error);
        throw new Error('Error al guardar el PDF.');
    }
}
//# sourceMappingURL=SavePdf.js.map