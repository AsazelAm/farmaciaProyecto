import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import AlignmentSelector from './AlignmentSelector'; 
import { type BlogComponent } from '../PreviewArea/ComponentRenderer'; 

// Definimos el tipo específico para este componente.
export type ImageComponent = BlogComponent & { 
  type: 'IMAGE';
  imageUrl: string; 
  imageAlt: string; 
};

interface ImageModalProps {
  component: ImageComponent;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedComponent: ImageComponent) => void;
}

type ImageAlignment = 'left' | 'center' | 'right';

// URL de ejemplo de la imagen que el usuario subió (SIMULACIÓN DE ARCHIVO SUBIDO)
const FALLBACK_IMAGE_URL = '/placeholder-uploaded-image.png'; 
// En una implementación real, aquí se usaría la URL que devuelve tu API después de la subida.

export default function ImageModal({ 
  component, 
  isOpen, 
  onClose, 
  onSave 
}: ImageModalProps) {
  
  const [imageUrl, setImageUrl] = useState(component.imageUrl || FALLBACK_IMAGE_URL);
  const [alignment, setAlignment] = useState<ImageAlignment>((component.imageAlignment as ImageAlignment) || 'center');
  // Estado para el nombre del archivo seleccionado (solo visual)
  const [fileName, setFileName] = useState(''); 

  // Sincronizar estado local con las props
  useEffect(() => {
    if (isOpen) {
      // Usar FALLBACK_IMAGE_URL si la URL está vacía al abrir
      setImageUrl(component.imageUrl || FALLBACK_IMAGE_URL); 
      setAlignment((component.imageAlignment as ImageAlignment) || 'center');
      setFileName(''); // Limpiamos el nombre del archivo al abrir
    }
  }, [isOpen, component]);

  // ⭐ NUEVO HANDLER: Simula la subida de un archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedComponent: ImageComponent = {
      ...component,
      imageUrl: imageUrl.trim(), 
      imageAlignment: alignment,
      alignment: alignment, 
    };
    
    onSave(updatedComponent);
  };

  const isContentValid = imageUrl.trim().length  > 0;

  return (
    <BaseModal 
      title="Editar Componente de Imagen" 
      isOpen={isOpen} 
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        
        {/* ⭐ CAMPO DE SELECCIÓN DE IMAGEN (Simulación de Subida) */}
        <div className="mb-6 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-3">
            Seleccionar/Subir Imagen
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => document.getElementById('file-upload')?.click()}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 
            transition-colors shadow-md"
          >
            {fileName || 'Elegir Imagen del PC'}
          </button>
          {fileName && (
            <p className="mt-2 text-sm text-gray-500 truncate">{fileName} cargado</p>
          )}
        </div>
        
        

        {/* Mini Preview de la Imagen */}
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
        
        {/* Selector de Alineación */}
        <AlignmentSelector
          label="Alineación de la Imagen"
          currentAlignment={alignment}
          onSelect={(align) => setAlignment(align as ImageAlignment)}
        />
        
        {/* Botones de Acción */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg
             hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 
            rounded-lg hover:bg-blue-700 transition-colors"
            disabled={!isContentValid} 
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </BaseModal>
  );
}