import ComponentCard, { type ComponentType } from './ComponentCard';

//  IMPORTS DE TUS IMÁGENES PNG
import titleIcon from '../../../assets/blogimg/title.png';
import titleSeconIcon from '../../../assets/blogimg/title_secondary.png';
import contentIcon from '../../../assets/blogimg/content.png';
import listIcon from '../../../assets/blogimg/list.png';
import imageIcon from '../../../assets/blogimg/image.png';
import imageContLeftIcon from '../../../assets/blogimg/image_content-left.png';
import imageContRightIcon from '../../../assets/blogimg/image_content_right.png';
import imageTitleContLeftIcon from '../../../assets/blogimg/image_title_content_left.png';
import imageTitleContRightIcon from '../../../assets/blogimg/image_title_content-right.png';

interface SidebarProps {
  onComponentSelect: (type: ComponentType) => void;
  onSaveBlog?: () => void; // Función para guardar el blog
}

// Configuración de componentes disponibles
const AVAILABLE_COMPONENTS = [
  {
    type: 'TITLE_MAIN' as ComponentType,
    title: 'Título Principal',
    imageUrl: titleIcon,
    description: 'Encabezado H1 grande'
  },
  {
    type: 'TITLE_SECONDARY' as ComponentType,
    title: 'Título Secundario',
    imageUrl: titleSeconIcon,
    description: 'Subtítulo H2'
  },
  {
    type: 'CONTENT' as ComponentType,
    title: 'Párrafo',
    imageUrl: contentIcon,
    description: 'Texto normal del blog'
  },
  {
    type: 'LIST' as ComponentType,
    title: 'Lista',
    imageUrl: listIcon,
    description: 'Lista con viñetas'
  },
  {
    type: 'IMAGE' as ComponentType,
    title: 'Imagen',
    imageUrl: imageIcon,
    description: 'Imagen individual'
  },
  {
    type: 'IMAGE_TEXT_RIGHT' as ComponentType,
    title: 'Imagen + Texto',
    imageUrl: imageContRightIcon,
    description: 'Imagen izquierda, texto derecha'
  },
  {
    type: 'IMAGE_TEXT_LEFT' as ComponentType,
    title: 'Texto + Imagen',
    imageUrl: imageContLeftIcon,
    description: 'Texto izquierda, imagen derecha'
  },
  {
    type: 'IMAGE_TITLE_TEXT_RIGHT' as ComponentType,
    title: 'Bloque Completo (Der)',
    imageUrl: imageTitleContRightIcon,
    description: 'Imagen + título + texto'
  },
  {
    type: 'IMAGE_TITLE_TEXT_LEFT' as ComponentType,
    title: 'Bloque Completo (Izq)',
    imageUrl: imageTitleContLeftIcon,
    description: 'Título + texto + imagen'
  }
];

export default function Sidebar({ onComponentSelect, onSaveBlog }: SidebarProps) {
  
  return (
    <aside className="w-[300px] h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 
                      border-r-4 border-gray-200 shadow-2xl 
                      flex flex-col overflow-hidden">
      
      {/* ========== HEADER ========== */}
      <div className="bg-gradient-to-r from-[#00155C] to-blue-800 
                      text-white p-6 shadow-lg sticky top-0 z-20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-2xl">📝</span>
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">
              COGNOS Blog
            </h2>
            <p className="text-xs text-blue-200">
              Editor de Componentes
            </p>
          </div>
        </div>
        <div className="bg-blue-700/50 rounded-lg px-3 py-2 mt-3">
          <p className="text-xs text-white/90">
            💡 <strong>Tip:</strong> Arrastra o haz clic para agregar bloques
          </p>
        </div>
      </div>

      {/* ========== LISTA DE COMPONENTES ========== */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 
                      scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="space-y-3">
          {AVAILABLE_COMPONENTS.map((component) => (
            <ComponentCard
              key={component.type}
              type={component.type}
              title={component.title}
              imageUrl={component.imageUrl}
              description={component.description}
              onSelect={onComponentSelect}
            />
          ))}
        </div>

        {/* Espacio extra al final */}
        <div className="h-4"></div>
      </div>

      {/* ========== FOOTER CON BOTÓN GUARDAR ========== */}
      <div className="bg-white border-t-4 border-gray-200 p-4 sticky bottom-0 z-20 shadow-2xl">
        <button
          onClick={onSaveBlog}
          className="w-full py-3 px-4 rounded-xl font-bold text-white
                     bg-gradient-to-r from-emerald-500 to-green-600
                     hover:from-emerald-600 hover:to-green-700
                     shadow-lg hover:shadow-xl
                     transition-all duration-200
                     active:scale-95
                     flex items-center justify-center gap-2"
        >
          <span className="text-xl">💾</span>
          <span>Guardar Blog</span>
        </button>

        {/* Botón secundario: Vista previa */}
        <button
          className="w-full mt-2 py-2 px-4 rounded-lg font-semibold 
                     text-gray-700 bg-gray-100 hover:bg-gray-200
                     border-2 border-gray-300 hover:border-gray-400
                     transition-all duration-200
                     active:scale-95
                     flex items-center justify-center gap-2"
          onClick={() => console.log('Vista previa')}
        >
          <span>👁️</span>
          <span className="text-sm">Vista Previa</span>
        </button>
      </div>
    </aside>
  );
}