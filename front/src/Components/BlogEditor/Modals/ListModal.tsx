import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import AlignmentSelector from './AlignmentSelector'; 
import { type BlogComponent } from '../PreviewArea/ComponentRenderer'; 

// Definimos el tipo específico para este componente
export type ListComponent = BlogComponent & { type: 'LIST' };

interface ListModalProps {
  component: ListComponent;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedComponent: ListComponent) => void;
}

export default function ListModal({ 
  component, 
  isOpen, 
  onClose, 
  onSave 
}: ListModalProps) {
  
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
    const updatedComponent: ListComponent = {
      ...component,
      // No usamos trim() agresivo aquí, ya que los saltos de línea son importantes.
      content: content, 
      alignment: alignment,
    };
    
    onSave(updatedComponent);
  };

  // Verificamos si hay contenido real (ignora solo espacios o saltos de línea)
  const isContentValid = content.trim().length > 0;

  return (
    <BaseModal 
      title="Editar Lista de Elementos" 
      isOpen={isOpen} 
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        
        {/* Campo de Contenido (Textarea) */}
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Elementos de la Lista
          </label>
          <p className="text-xs text-blue-600 mb-2 p-2 bg-blue-50 border border-blue-200 rounded">
            💡 **Instrucción:** Escribe cada elemento en una línea separada.
          </p>
          <textarea
            id="content"
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3 resize-y"
            placeholder="Primer elemento&#10;Segundo elemento&#10;Tercer elemento..."
            required
          />
        </div>
        
        {/* Selector de Alineación */}
        <AlignmentSelector
          label="Alineación de la Lista"
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
            disabled={!isContentValid} 
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </BaseModal>
  );
}