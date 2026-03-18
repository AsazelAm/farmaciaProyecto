import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import { type BlogComponent } from '../PreviewArea/ComponentRenderer';
import AlignmentSelector from './AlignmentSelector';

// Tipo específico para TITLE_MAIN (basado en BlogComponent)
export type TitleMainComponent = BlogComponent & { type: 'TITLE_MAIN' };

interface TitleMainModalProps {
  component: TitleMainComponent;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedComponent: TitleMainComponent) => void;
}

export default function TitleMainModal({ 
  component, 
  isOpen, 
  onClose, 
  onSave 
}: TitleMainModalProps) {
  
  // Estado local para los campos del formulario
  const [content, setContent] = useState(component.content || '');
  const [alignment, setAlignment] = useState(component.alignment || 'left');

  // Sincronizar estado local con las props al abrir
  useEffect(() => {
    if (isOpen) {
      setContent(component.content || '');
      setAlignment(component.alignment || 'left');
    }
  }, [isOpen, component]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedComponent: TitleMainComponent = {
      ...component,
      content: content.trim(),
      alignment: alignment,
    };
    
    onSave(updatedComponent);
    onClose();
  };

  return (
    <BaseModal 
      title="Editar Título Principal (H1)" 
      isOpen={isOpen} 
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        
        {/* Campo de Contenido */}
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Contenido del Título
          </label>
          <input
            id="content"
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 
            focus:border-blue-500 p-3 text-lg"
            placeholder="Introduce el título principal..."
            required
          />
        </div>
        
        {/* Selector de Alineación */}
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
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg
             hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg
             hover:bg-blue-700 transition-colors"
            disabled={!content.trim()}
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </BaseModal>
  );
}