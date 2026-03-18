import { type BlogComponent } from '../PreviewArea/ComponentRenderer'; // Importa el tipo

// Tipo simplificado de alineación
type Alignment = BlogComponent['alignment'];

interface AlignmentSelectorProps {
  currentAlignment: Alignment;
  label: string;
  onSelect: (alignment: Alignment) => void;
}

const ALIGNMENTS: { value: Alignment; icon: string; title: string }[] = [
  { value: 'left', icon: 'L', title: 'Izquierda' },
  { value: 'center', icon: 'C', title: 'Centro' },
  { value: 'right', icon: 'R', title: 'Derecha' },
  { value: 'justify', icon: 'J', title: 'Justificado' },
];

export default function AlignmentSelector({ 
  currentAlignment, 
  label, 
  onSelect 
}: AlignmentSelectorProps) {

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
        {ALIGNMENTS.map((align) => (
          <button
            key={align.value}
            type="button"
            onClick={() => onSelect(align.value)}
            title={`Alinear a la ${align.title}`}
            className={`
              p-2 rounded-md transition-colors w-10 h-10 font-bold text-lg
              ${currentAlignment === align.value 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-transparent text-gray-600 hover:bg-gray-200'}
            `}
          >
            {/* Estos son íconos de ejemplo, en un proyecto real usarías iconos SVG como 'text-align-left' */}
            {align.icon} 
          </button>
        ))}
      </div>
    </div>
  );
}