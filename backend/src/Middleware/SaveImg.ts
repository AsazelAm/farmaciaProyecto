import fs from 'fs';
import path from 'path';
import sharp from 'sharp'; 

export async function uploadImageGlobal(file: Express.Multer.File,id: string,fecha: string,ruta: string) {
  const folderPath = `./Uploads/img/${ruta}/${id}-${fecha}`;

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const allowedExtensions = ['.jpg', '.jpeg', '.png'];
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    throw new Error(`Formato inválido para ${file.originalname}. Solo JPG, JPEG y PNG permitidos.`);
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error(`La imagen ${file.originalname} debe pesar máximo 5MB`);
  }

  // 🔥 Siempre será WEBP
  const fileName = `${id}-${fecha}.webp`;
  const savePath = path.join(folderPath, fileName);

  try {
    // Convertir y optimizar como WebP
    await sharp(file.buffer)
      .webp({
        quality: 70,        // calidad (ajustable)
        effort: 6           // nivel de compresión (0–6, más alto = más lento pero mejor)
      })
      .toFile(savePath);

    return savePath;
  } catch (error) {
    console.error('Error al convertir imagen a WebP:', error);
    throw new Error('Error al convertir imagen a WebP.');
  }
}


