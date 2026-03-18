// frontend/src/components/BlogEditor/PreviewArea/EmptyState.tsx
export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-8">
      {/* Icono grande */}
      <div className="mb-6">
        <svg 
          className="w-32 h-32 text-gray-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
      </div>

      {/* Título */}
      <h3 className="text-2xl font-bold text-gray-700 mb-3">
        Tu blog está vacío
      </h3>

      {/* Descripción */}
      <p className="text-gray-500 max-w-md mb-6 leading-relaxed">
        Comienza agregando componentes desde el panel izquierdo. 
        Puedes <strong>arrastrar</strong> o <strong>hacer clic</strong> en cualquier bloque.
      </p>

      {/* Indicadores visuales */}
      <div className="flex gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👈</span>
          <span>Selecciona un componente</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🖱️</span>
          <span>Arrastra o haz clic</span>
        </div>
      </div>

      {/* Animación decorativa */}
      <div className="mt-8 flex gap-2">
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}