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
    const fileName = `${id}-${fecha}${extension}`;
    const savePath = path_1.default.join(folderPath, fileName);
    try {
        const image = (0, sharp_1.default)(file.buffer);
        if (extension === '.png') {
            await image
                .png({ quality: 50, compressionLevel: 9 }) // optimiza PNG
                .toFile(savePath);
        }
        else {
            await image
                .jpeg({ quality: 50 }) // optimiza JPG/JPEG
                .toFile(savePath);
        }
        return savePath;
    }
    catch (error) {
        console.error('Error al optimizar la imagen:', error);
        throw new Error('Error al optimizar la imagen.');
    }
}
//# sourceMappingURL=SaveImg.js.map