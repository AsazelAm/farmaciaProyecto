import fs from 'fs';
import path from 'path';

export async function uploadPdfGlobal(
  file: Express.Multer.File,
  id: string,
  fecha: string,
  ruta: string
) {
  const folderPath = `./Uploads/pdf/${ruta}/${id}-${fecha}`;

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  // Solo permitir PDF
  const allowedExtensions = ['.pdf'];
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    throw new Error(`Formato inválido para ${file.originalname}. Solo PDF permitido.`);
  }

  // Tamaño máximo 10 MB (puedes cambiarlo)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error(`El archivo ${file.originalname} debe pesar máximo 10MB`);
  }

  const fileName = `${id}-${fecha}${extension}`;
  const savePath = path.join(folderPath, fileName);

  try {
    // Guardar el archivo directamente
    fs.writeFileSync(savePath, file.buffer);
    return savePath;
  } catch (error) {
    console.error('Error al guardar el PDF:', error);
    throw new Error('Error al guardar el PDF.');
  }
}
