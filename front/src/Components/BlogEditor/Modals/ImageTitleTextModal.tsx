import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import AlignmentSelector from './AlignmentSelector'; 
import { type BlogComponent } from '../PreviewArea/ComponentRenderer'; 

// URL de ejemplo de la imagen (SIMULACIÓN DE ARCHIVO SUBIDO)
const FALLBACK_IMAGE_URL = '/placeholder-uploaded-image.png'; 

// Definimos los tipos para los layouts de Imagen + Título + Texto
export type ImageTitleTextComponent = BlogComponent & { 
  type: 'IMAGE_TITLE_TEXT_RIGHT' | 'IMAGE_TITLE_TEXT_LEFT';
  imageUrl: string; 
  imageAlt: string; 
  title: string; // Título obligatorio para este tipo
};

interface ImageTitleTextModalProps {
  component: ImageTitleTextComponent;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedComponent: ImageTitleTextComponent) => void;
}

export default function ImageTitleTextModal({ 
  component, 
  isOpen, 
  onClose, 
  onSave 
}: ImageTitleTextModalProps) {
  
  // Estado local para manejar el formulario
  const [imageUrl, setImageUrl] = useState(component.imageUrl || FALLBACK_IMAGE_URL);
  const [imageAlt, setImageAlt] = useState(component.imageAlt || '');
  const [title, setTitle] = useState(component.title || ''); // Campo Título
  const [content, setContent] = useState(component.content || '');
  // Usamos 'textAlignment' para la alineación del texto
  const [alignment, setAlignment] = useState(component.textAlignment || 'left');
  const [fileName, setFileName] = useState(''); 

  // Sincronizar estado local con las props
  useEffect(() => {
    if (isOpen) {
      setImageUrl(component.imageUrl || FALLBACK_IMAGE_URL);
      setImageAlt(component.imageAlt || '');
      setTitle(component.title || '');
      setContent(component.content || '');
      setAlignment(component.textAlignment || 'left');
      setFileName('');
    }
  }, [isOpen, component]);

  // Handler para simular la selección de archivo
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
    
    const updatedComponent: ImageTitleTextComponent = {
      ...component,
      imageUrl: imageUrl.trim(),
      imageAlt: imageAlt.trim(),
      title: title.trim(), // Guardamos el título
      content: content.trim(),
      textAlignment: alignment, 
      alignment: alignment, // Guardamos por si se usa la propiedad general
    };
    
    onSave(updatedComponent);
  };

  const isContentValid = imageUrl.trim().length > 0 && imageAlt.trim().length > 0 && title.trim().length > 0 && content.trim().length > 0;
  const isImageLeft = component.type === 'IMAGE_TITLE_TEXT_LEFT';

  return (
    <BaseModal 
      title={`Editar Layout: Imagen, Título y Texto`} 
      isOpen={isOpen} 
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        
        {/* Guía visual */}
        <p className={`text-sm text-gray-600 mb-4 p-2 rounded ${isImageLeft ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-green-50 border-l-4 border-green-400'}`}>
          El texto (título y párrafo) va a la **{isImageLeft ? 'derecha' : 'izquierda'}** de la imagen.
        </p>

        {/* ⭐ Campo de Selección de Imagen (Simulación de Subida) */}
        <div className="mb-6 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
          <label htmlFor="file-upload-3" className="block text-sm font-medium text-gray-700 mb-3">
            Seleccionar/Subir Imagen
          </label>
          <input
            id="file-upload-3"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => document.getElementById('file-upload-3')?.click()}
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

        {/* ⭐ Campo de Título */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Título del Bloque
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm p-3"
            placeholder="Introduce un título para el bloque de texto"
            required
            maxLength={100}
          />
        </div>

        {/* ⭐ Campo de Contenido del Texto */}
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
            placeholder="Escribe el párrafo que acompaña al título y la imagen..."
            required
          />
        </div>
        
        {/* ⭐ Selector de Alineación para el TEXTO */}
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