import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import AlignmentSelector from './AlignmentSelector'; 
import { type BlogComponent } from '../PreviewArea/ComponentRenderer'; 

// URL de ejemplo de la imagen (SIMULACIÓN DE ARCHIVO SUBIDO)
const FALLBACK_IMAGE_URL = '/placeholder-uploaded-image.png'; 

// Definimos los tipos para los layouts de Imagen + Texto
export type ImageTextComponent = BlogComponent & { 
  type: 'IMAGE_TEXT_RIGHT' | 'IMAGE_TEXT_LEFT';
  imageUrl: string; 
  imageAlt: string; 
  // textAlignment se guarda en la propiedad 'textAlignment' o 'alignment' de BlogComponent
};

interface ImageTextModalProps {
  component: ImageTextComponent;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedComponent: ImageTextComponent) => void;
}

export default function ImageTextModal({ 
  component, 
  isOpen, 
  onClose, 
  onSave 
}: ImageTextModalProps) {
  
  // Estado local
  const [imageUrl, setImageUrl] = useState(component.imageUrl || FALLBACK_IMAGE_URL);
  const [imageAlt, setImageAlt] = useState(component.imageAlt || '');
  const [content, setContent] = useState(component.content || '');
  // La alineación del TEXTO dentro del layout
  const [alignment, setAlignment] = useState(component.textAlignment || 'left');
  const [fileName, setFileName] = useState(''); 

  // Sincronizar estado local con las props
  useEffect(() => {
    if (isOpen) {
      setImageUrl(component.imageUrl || FALLBACK_IMAGE_URL);
      setImageAlt(component.imageAlt || '');
      setContent(component.content || '');
      setAlignment(component.textAlignment || 'left');
      setFileName(''); 
    }
  }, [isOpen, component]);

  // ⭐ Handler para simular la selección de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      
      // SIMULACIÓN: Muestra la preview localmente
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // NOTA: En producción, aquí se llamaría a la API y se usaría la URL que esta devuelve.
      // Ejemplo: setImageUrl(url_devuelta_por_api);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedComponent: ImageTextComponent = {
      ...component,
      imageUrl: imageUrl.trim(),
      imageAlt: imageAlt.trim(),
      content: content.trim(),
      // Usamos textAlignment para la renderización del texto dentro del layout
      textAlignment: alignment, 
      alignment: alignment, 
    };
    
    onSave(updatedComponent);
  };

  const isContentValid = imageUrl.trim().length > 0 && imageAlt.trim().length > 0 && content.trim().length > 0;
  const isImageRight = component.type === 'IMAGE_TEXT_RIGHT';

  return (
    <BaseModal 
      title={`Editar Layout: Imagen y Contenido (${isImageRight ? 'Imagen Derecha' : 'Imagen Izquierda'})`} 
      isOpen={isOpen} 
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        
        {/* Guía visual */}
        <p className={`text-sm text-gray-600 mb-4 p-2 rounded ${isImageRight ? 'bg-green-50 border-l-4 border-green-400' : 'bg-blue-50 border-l-4 border-blue-400'}`}>
          Configurando un bloque con imagen y texto lado a lado.
        </p>

        {/* ⭐ Campo de Selección de Imagen (Simulación de Subida) */}
        <div className="mb-6 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
          <label htmlFor="file-upload-2" className="block text-sm font-medium text-gray-700 mb-3">
            Seleccionar/Subir Imagen
          </label>
          <input
            id="file-upload-2"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => document.getElementById('file-upload-2')?.click()}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-md"
          >
            {fileName || 'Elegir Imagen del PC'}
          </button>
          {fileName && (
            <p className="mt-2 text-sm text-gray-500 truncate">{fileName} cargado</p>
          )}
        </div>
        
        {/* Campo Alt Text */}
        <div className="mb-4">
          <label htmlFor="imageAlt" className="block text-sm font-medium text-gray-700 mb-2">
            Texto Alternativo (Alt Text)
          </label>
          <input
            id="imageAlt"
            type="text"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm p-3"
            placeholder="Descripción de la imagen"
            required
          />
        </div>

        {/* Mini Preview de la Imagen (opcional pero útil) */}
        {imageUrl.trim() && (
          <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-white text-center">
            <p className="text-sm text-gray-600 mb-2">Previsualización:</p>
            <img 
              src={imageUrl} 
              alt="Previsualización de la imagen" 
              className="max-w-full max-h-40 h-auto mx-auto object-contain rounded shadow-md"
              onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150?text=Error+Carga'; }}
            />
          </div>
        )}

        <hr className="my-6" />

        {/* Campo de Contenido del Texto */}
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Contenido del Párrafo
          </label>
          <textarea
            id="content"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm p-3 resize-y"
            placeholder="Escribe el párrafo que acompaña a la imagen..."
            required
          />
        </div>
        
        {/* Selector de Alineación para el TEXTO */}
        <AlignmentSelector
          label="Alineación del Texto"
          currentAlignment={alignment}
          onSelect={setAlignment}
        />
        
        {/* Botones de Acción */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            disabled={!isContentValid} 
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </BaseModal>
  );
}