import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import AlignmentSelector from './AlignmentSelector'; 
import { type BlogComponent } from '../PreviewArea/ComponentRenderer'; 

// Definimos el tipo específico para este componente
export type ContentComponent = BlogComponent & { type: 'CONTENT' };

interface ContentModalProps {
  component: ContentComponent;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedComponent: ContentComponent) => void;
}

export default function ContentModal({ 
  component, 
  isOpen, 
  onClose, 
  onSave 
}: ContentModalProps) {
  
  // Estado local para manejar el formulario
  const [content, setContent] = useState(component.content || '');
  const [alignment, setAlignment] = useState(component.alignment || 'left');

  // Sincronizar estado local con las props
  useEffect(() => {
    if (isOpen) {
      setContent(component.content || '');
      setAlignment(component.alignment || 'left');
    }
  }, [isOpen, component]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construimos el objeto actualizado
    const updatedComponent: ContentComponent = {
      ...component,
      content: content.trim(),
      alignment: alignment,
    };
    
    onSave(updatedComponent);
  };

  return (
    <BaseModal 
      title="Editar Contenido (Párrafo)" 
      isOpen={isOpen} 
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        
        {/* Campo de Contenido (Textarea) */}
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Texto del Párrafo
          </label>
          {/* Usamos un textarea para contenido más extenso */}
          <textarea
            id="content"
            rows={6} // Altura inicial
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3 resize-y"
            placeholder="Introduce el contenido del párrafo aquí..."
            required
          />
        </div>
        
        {/* Selector de Alineación */}
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
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={!content.trim()} 
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </BaseModal>
  );
}