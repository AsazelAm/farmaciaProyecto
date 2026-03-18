import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import AlignmentSelector from './AlignmentSelector'; 
// Asegúrate de que esta ruta sea correcta
import { type BlogComponent } from '../PreviewArea/ComponentRenderer'; 

// Definimos el tipo específico para este componente, basado en BlogComponent
export type TitleSecondaryComponent = BlogComponent & { type: 'TITLE_SECONDARY' };

interface TitleSecondaryModalProps {
  component: TitleSecondaryComponent;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedComponent: TitleSecondaryComponent) => void;
}

export default function TitleSecondaryModal({ 
  component, 
  isOpen, 
  onClose, 
  onSave 
}: TitleSecondaryModalProps) {
  
  // Estado local para manejar el formulario (content y alignment)
  const [content, setContent] = useState(component.content || '');
  const [alignment, setAlignment] = useState(component.alignment || 'left');

  // Sincronizar estado local con las props al abrir el modal (o si cambia el componente a editar)
  useEffect(() => {
    if (isOpen) {
      setContent(component.content || '');
      setAlignment(component.alignment || 'left');
    }
  }, [isOpen, component]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construimos el objeto actualizado con los datos del formulario
    const updatedComponent: TitleSecondaryComponent = {
      ...component,
      content: content.trim(), // Aseguramos que no haya espacios innecesarios
      alignment: alignment,
    };
    
    // Llamamos a la función de guardado en BlogEditor.tsx
    onSave(updatedComponent);
  };

  return (
    <BaseModal 
      title="Editar Título Secundario (H2)" 
      isOpen={isOpen} 
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        
        {/* Campo de Contenido del Título */}
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Contenido del Título (H2)
          </label>
          <input
            id="content"
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3 text-md"
            placeholder="Introduce el subtítulo o encabezado secundario..."
            required
            maxLength={150}
          />
        </div>
        
        {/* Selector de Alineación reutilizado */}
        <AlignmentSelector
          label="Alineación del Título"
          currentAlignment={alignment}
          onSelect={setAlignment}
        />
        
        {/* Botones de Acción */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            // Deshabilitamos si el campo de contenido está vacío
            disabled={!content.trim()} 
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </BaseModal>
  );
}