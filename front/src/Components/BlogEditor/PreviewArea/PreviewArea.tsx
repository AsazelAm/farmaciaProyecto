
import React from 'react';
import ComponentRenderer, { type BlogComponent } from './ComponentRenderer';
import EmptyState from './EmptyState';
import { type ComponentType } from '../Sidebar/ComponentCard';

interface PreviewAreaProps {
  components: BlogComponent[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onDrop: (componentType: ComponentType) => void;
  onReorder: (fromIndex: number, toIndex: number) => void; // ⭐ Nuevo
}

export default function PreviewArea({ 
  components, 
  onEdit, 
  onDelete,
  onDrop,
  onReorder // ⭐ Nuevo
}: PreviewAreaProps) {

  const [isDraggingOver, setIsDraggingOver] = React.useState(false);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  // Drag & Drop para agregar desde sidebar
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    const componentType = e.dataTransfer.getData('componentType') as ComponentType;
    if (componentType) {
      onDrop(componentType);
    }
  };

  // ⭐ DRAG & DROP PARA REORDENAR
  const handleComponentDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('componentIndex', index.toString());
  };

  const handleComponentDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleComponentDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorder(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  // ⭐ MOVER CON BOTONES
  const handleMoveUp = (index: number) => {
    if (index > 0) {
      onReorder(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < components.length - 1) {
      onReorder(index, index + 1);
    }
  };

  return (
    <div 
      className={`
        flex-1 h-screen overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 p-8
        transition-all duration-300
        ${isDraggingOver ? 'bg-blue-50 border-4 border-dashed border-blue-400' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Vista Previa del Blog
              </h1>
              <p className="text-gray-600 text-sm">
                {components.length === 0 
                  ? 'Arrastra componentes aquí para empezar' 
                  : `${components.length} componente${components.length !== 1 ? 's' : ''} agregado${components.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>

            {components.length > 0 && (
              <div className="flex gap-2">
                <button 
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 
                             text-gray-700 rounded-lg transition-colors text-sm font-medium"
                  onClick={() => console.log('Limpiar todo')}
                >
                  🗑️ Limpiar
                </button>
                <button 
                  className="px-4 py-2 bg-blue-100 hover:bg-blue-200 
                             text-blue-700 rounded-lg transition-colors text-sm font-medium"
                  onClick={() => console.log('Previsualizar')}
                >
                  👁️ Previsualizar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenedor de componentes */}
      <div className="max-w-4xl mx-auto">
        <div 
          className={`
            bg-white rounded-xl shadow-xl p-8 md:p-12 min-h-[500px]
            transition-all duration-300
            ${isDraggingOver ? 'ring-4 ring-blue-400 ring-opacity-50' : ''}
          `}
        >
          {components.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {components.map((component, index) => (
                <ComponentRenderer
                  key={component.id}
                  component={component}
                  index={index}
                  totalComponents={components.length}
                  onEdit={() => onEdit(index)}
                  onDelete={() => onDelete(index)}
                  onMoveUp={() => handleMoveUp(index)}
                  onMoveDown={() => handleMoveDown(index)}
                  onDragStart={handleComponentDragStart}
                  onDragOver={handleComponentDragOver}
                  onDrop={handleComponentDrop}
                />
              ))}
            </div>
          )}

          {isDraggingOver && components.length > 0 && (
            <div className="mt-8 border-4 border-dashed border-blue-400 rounded-xl p-8 
                            bg-blue-50 flex items-center justify-center">
              <p className="text-blue-600 font-semibold text-lg">
                ⬇️ Suelta aquí para agregar al final
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="h-20"></div>
    </div>
  );
}