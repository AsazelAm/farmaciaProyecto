
import React from 'react';

export interface BlogComponent {
  id: string;
  type: 
    | 'TITLE_MAIN'
    | 'TITLE_SECONDARY'
    | 'CONTENT'
    | 'LIST'
    | 'IMAGE'
    | 'IMAGE_TEXT_RIGHT'
    | 'IMAGE_TEXT_LEFT'
    | 'IMAGE_TITLE_TEXT_RIGHT'
    | 'IMAGE_TITLE_TEXT_LEFT';
  
  content?: string;
  title?: string;
  alignment: 'left' | 'center' | 'right' | 'justify';
  textAlignment?: 'left' | 'center' | 'right' | 'justify';
  imageAlignment?: 'left' | 'center' | 'right';
  imageUrl?: string;
  imageAlt?: string;
  order: number;
}

interface ComponentRendererProps {
  component: BlogComponent;
  index: number; // ⭐ Nuevo: índice del componente
  totalComponents: number; // ⭐ Nuevo: total de componentes
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void; // ⭐ Nuevo: mover hacia arriba
  onMoveDown: () => void; // ⭐ Nuevo: mover hacia abajo
  onDragStart: (e: React.DragEvent, index: number) => void; // ⭐ Nuevo
  onDragOver: (e: React.DragEvent, index: number) => void; // ⭐ Nuevo
  onDrop: (e: React.DragEvent, index: number) => void; // ⭐ Nuevo
}

export default function ComponentRenderer({ 
  component,
  index,
  totalComponents,
  onEdit, 
  onDelete,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop
}: ComponentRendererProps) {

  const [isDragging, setIsDragging] = React.useState(false);

  const getAlignmentClass = (alignment: string) => {
    const map: Record<string, string> = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify'
    };
    return map[alignment] || 'text-left';
  };

  const fontFamily = "'Roboto', Arial, Helvetica, 'Nimbus Sans L', sans-serif";

  // Renderizado según tipo (tu código existente)
  const renderContent = () => {
    switch (component.type) {
      case 'TITLE_MAIN':
        return (
          <h1 
            className={`text-[50px] font-normal mb-4 ${getAlignmentClass(component.alignment)}`}
            style={{ fontFamily }}
          >
            {component.content || 'Título Principal'}
          </h1>
        );

      case 'TITLE_SECONDARY':
        return (
          <h2 
            className={`text-[32px] font-normal mb-3 ${getAlignmentClass(component.alignment)}`}
            style={{ fontFamily }}
          >
            {component.content || 'Título Secundario'}
          </h2>
        );

      case 'CONTENT':
        return (
          <p 
            className={`text-[20px] leading-relaxed mb-4 ${getAlignmentClass(component.alignment)}`}
            style={{ fontFamily }}
          >
            {component.content || 'Escribe tu contenido aquí...'}
          </p>
        );

      case 'LIST':{
        const items = component.content?.split('\n').filter(item => item.trim()) || ['Item 1', 'Item 2', 'Item 3'];
        return (
          <ul className="list-none mb-4 space-y-2">
            {items.map((item, idx) => (
              <li 
                key={idx}
                className="text-[14px] pl-4"
                style={{ fontFamily }}
              >
                • {item}
              </li>
            ))}
          </ul>
        );
      }
      case 'IMAGE':
        return (
          <div className={`w-full mb-6 ${getAlignmentClass(component.alignment)}`}>
            <img
              src={component.imageUrl || 'https://via.placeholder.com/800x450?text=Imagen'}
              alt={component.imageAlt || 'Imagen del blog'}
              className="w-full h-auto rounded-lg shadow-md"
              style={{ aspectRatio: '16/9', objectFit: 'cover' }}
            />
          </div>
        );

      case 'IMAGE_TEXT_RIGHT':
        return (
          <div className="flex flex-wrap gap-4 w-full mb-6 justify-center items-center">
            <div className="w-full md:w-[46%]">
              <img
                src={component.imageUrl || 'https://via.placeholder.com/400x300?text=Imagen'}
                alt={component.imageAlt || 'Imagen'}
                className="w-full h-auto rounded-lg shadow-md"
                style={{ aspectRatio: '16/9', objectFit: 'cover' }}
              />
            </div>
            <div className={`w-full md:w-[46%] ${getAlignmentClass(component.textAlignment || 'left')}`}>
              <p className="text-[20px]" style={{ fontFamily }}>
                {component.content || 'Escribe tu texto aquí...'}
              </p>
            </div>
          </div>
        );

      case 'IMAGE_TEXT_LEFT':
        return (
          <div className="flex flex-wrap-reverse gap-4 w-full mb-6 justify-center items-center">
            <div className={`w-full md:w-[46%] ${getAlignmentClass(component.textAlignment || 'left')}`}>
              <p className="text-[20px]" style={{ fontFamily }}>
                {component.content || 'Escribe tu texto aquí...'}
              </p>
            </div>
            <div className="w-full md:w-[46%]">
              <img
                src={component.imageUrl || 'https://via.placeholder.com/400x300?text=Imagen'}
                alt={component.imageAlt || 'Imagen'}
                className="w-full h-auto rounded-lg shadow-md"
                style={{ aspectRatio: '16/9', objectFit: 'cover' }}
              />
            </div>
          </div>
        );

      case 'IMAGE_TITLE_TEXT_RIGHT':
        return (
          <div className="flex flex-wrap gap-4 w-full mb-6 justify-center items-start">
            <div className="w-full md:w-[46%]">
              <img
                src={component.imageUrl || 'https://via.placeholder.com/400x300?text=Imagen'}
                alt={component.imageAlt || 'Imagen'}
                className="w-full h-auto rounded-lg shadow-md"
                style={{ aspectRatio: '16/9', objectFit: 'cover' }}
              />
            </div>
            <div className={`w-full md:w-[46%] flex flex-col gap-3 ${getAlignmentClass(component.textAlignment || 'left')}`}>
              <h3 className="text-[28px] font-normal" style={{ fontFamily }}>
                {component.title || 'Título del bloque'}
              </h3>
              <p className="text-[20px]" style={{ fontFamily }}>
                {component.content || 'Escribe tu contenido aquí...'}
              </p>
            </div>
          </div>
        );

      case 'IMAGE_TITLE_TEXT_LEFT':
        return (
          <div className="flex flex-wrap-reverse gap-4 w-full mb-6 justify-center items-start">
            <div className={`w-full md:w-[46%] flex flex-col gap-3 ${getAlignmentClass(component.textAlignment || 'left')}`}>
              <h3 className="text-[28px] font-normal" style={{ fontFamily }}>
                {component.title || 'Título del bloque'}
              </h3>
              <p className="text-[20px]" style={{ fontFamily }}>
                {component.content || 'Escribe tu contenido aquí...'}
              </p>
            </div>
            <div className="w-full md:w-[46%]">
              <img
                src={component.imageUrl || 'https://via.placeholder.com/400x300?text=Imagen'}
                alt={component.imageAlt || 'Imagen'}
                className="w-full h-auto rounded-lg shadow-md"
                style={{ aspectRatio: '16/9', objectFit: 'cover' }}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        onDragStart(e, index);
      }}
      onDragEnd={() => setIsDragging(false)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => {
        setIsDragging(false);
        onDrop(e, index);
      }}
      className={`
        group relative mb-6 transition-all duration-200 
        hover:bg-blue-50/30 rounded-lg p-4 -m-4
        border-2 border-dashed
        ${isDragging ? 'opacity-50 border-blue-500 bg-blue-100' : 'border-transparent'}
        cursor-move
      `}
    >
      {/* Contenido del componente */}
      {renderContent()}

      {/* ⭐ BARRA DE HERRAMIENTAS (Botones) */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
        {/* Botón Subir */}
        {index > 0 && (
          <button
            onClick={onMoveUp}
            className="px-2 py-1 bg-gray-600 text-white text-xs rounded 
                       hover:bg-gray-700 transition-colors shadow-md"
            title="Mover arriba"
          >
            ↑
          </button>
        )}

        {/* Botón Bajar */}
        {index < totalComponents - 1 && (
          <button
            onClick={onMoveDown}
            className="px-2 py-1 bg-gray-600 text-white text-xs rounded 
                       hover:bg-gray-700 transition-colors shadow-md"
            title="Mover abajo"
          >
            ↓
          </button>
        )}

        {/* Botón Editar */}
        <button
          onClick={onEdit}
          className="px-3 py-1 bg-blue-600 text-white text-xs rounded 
                     hover:bg-blue-700 transition-colors shadow-md
                     flex items-center gap-1"
          title="Editar componente"
        >
          <span>✏️</span>
          <span className="hidden sm:inline">Editar</span>
        </button>

        {/* Botón Eliminar */}
        <button
          onClick={onDelete}
          className="px-3 py-1 bg-red-600 text-white text-xs rounded 
                     hover:bg-red-700 transition-colors shadow-md
                     flex items-center gap-1"
          title="Eliminar componente"
        >
          <span>🗑️</span>
          <span className="hidden sm:inline">Eliminar</span>
        </button>
      </div>

      {/* Indicador de orden */}
      <div className="absolute -left-10 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
          {index + 1}
        </div>
      </div>

      {/* Icono de arrastre */}
      <div className="absolute -left-10 top-14 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center text-xs shadow-lg cursor-move">
          ⋮⋮
        </div>
      </div>
    </div>
  );
}