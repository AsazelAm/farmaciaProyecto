import React from 'react';

export type ComponentType = 
  | 'TITLE_MAIN'
  | 'TITLE_SECONDARY'
  | 'CONTENT'
  | 'LIST'
  | 'IMAGE'
  | 'IMAGE_TEXT_RIGHT'
  | 'IMAGE_TEXT_LEFT'
  | 'IMAGE_TITLE_TEXT_RIGHT'
  | 'IMAGE_TITLE_TEXT_LEFT';

interface ComponentCardProps {
  type: ComponentType;
  title: string;
  imageUrl: string; // ⭐ Ruta de tu imagen PNG
  description?: string;
  onSelect: (type: ComponentType) => void;
}

const CARD_BASE_CLASS = `
  relative p-4 rounded-xl border-2 border-gray-200 
  bg-white shadow-md cursor-pointer 
  transition-all duration-200 ease-in-out
  hover:border-blue-400 hover:shadow-lg hover:scale-[1.02]
  active:scale-[0.98]
  flex flex-col items-center justify-center gap-2
`;

export default function ComponentCard({ 
  type, 
  title, 
  imageUrl, 
  description,
  onSelect 
}: ComponentCardProps) {

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('componentType', type);
    e.dataTransfer.effectAllowed = 'copy';
    e.currentTarget.classList.add('opacity-60', 'border-dashed', 'border-blue-500');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-60', 'border-dashed', 'border-blue-500');
  };

  // Click
  const handleClick = () => {
    onSelect(type);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      className={CARD_BASE_CLASS}
      title={`Haz clic o arrastra: ${title}`}
      style={{ userSelect: 'none' }}
    >
      {/* Imagen del componente */}
      <div className="w-16 h-16 flex items-center justify-center">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>

      {/* Título */}
      <p className="text-xs font-bold text-gray-800 text-center uppercase tracking-wide">
        {title}
      </p>

      {/* Descripción (opcional) */}
      {description && (
        <p className="text-[10px] text-gray-500 text-center italic leading-tight px-2">
          {description}
        </p>
      )}

      {/* Badge de "Arrastra" */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
          🖱️
        </span>
      </div>
    </div>
  );
}