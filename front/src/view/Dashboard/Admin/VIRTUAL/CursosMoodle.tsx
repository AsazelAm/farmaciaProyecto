import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import Loading from "../../../../Helpers/Loading";
import { GetCursoMoodleApi } from "../../../../Api/CursosMoodle";


interface CursoMoodlew {
  id: bigint;
  shortname: string;
  fullname: string;
}

export default function CursosMoodle() {
  const [search, setSearch] = useState("");

  const { data: rows, isLoading } = useQuery({
    queryKey: ['GetAllCursoMoodle'],
    queryFn: GetCursoMoodleApi
  });

  const filtered = useMemo(() => {
    const list: CursoMoodlew[] = Array.isArray(rows) ? rows : [];
    
    const q = search.trim().toLowerCase();
    
    if (!q) return list;
    
    const hay = (v: any) => String(v ?? "").toLowerCase().includes(q);
    return list.filter((r) =>
      hay(r.shortname) ||  
      hay(r.fullname)      
    );
  }, [rows, search]); 


  if (isLoading) return <Loading />

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="mx-auto max-w-[1600px]">
        {/* Header con título y acciones */}
        <header className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#00155C] mb-1">
                Administración Cursos MOODLE
              </h1>
              <p className="text-sm text-gray-600">
                Gestiona CURSOS DE MOODLE
              </p>
            </div>
          </div>
        </header>

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              {/* Icono de búsqueda */}
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              
              {/* Input de búsqueda con control de estado */}
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código o nombre del curso..."
                className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00155C] focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm"
              />
              
              {/* Botón para limpiar búsqueda (solo visible si hay texto) */}
              {search && (
                <button
                  aria-label="Limpiar búsqueda"
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
            
            {/* Contador de resultados */}
            <div className="flex items-center gap-3 text-sm">
              <div className="px-4 py-2 bg-blue-50 text-[#00155C] rounded-lg font-semibold border border-blue-100">
                {filtered?.length ?? 0} {filtered?.length === 1 ? "curso" : "cursos"}
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de cursos */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
              <table className="w-full">
                {/* Encabezado de la tabla */}
                <thead className="sticky top-0 z-10 bg-[#00155C] text-white">
                  <tr>
                    <ThCell width="w-16">Nro</ThCell>
                    <ThCell width="w-64">Código</ThCell>
                    <ThCell width="w-40">Curso</ThCell>
                  </tr>
                </thead>

                {/* Cuerpo de la tabla */}
                <tbody className="divide-y divide-gray-100">
                  {/* Mensaje cuando no hay resultados */}
                  {(!filtered || filtered.length === 0) && (
                    <tr>
                      <td colSpan={3} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <div>
                            <p className="text-gray-500 font-medium">No se encontraron cursos</p>
                            <p className="text-sm text-gray-400 mt-1">
                              {search ? "Intenta con otros términos de búsqueda" : "No hay cursos disponibles"}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Mapeo de cursos filtrados */}
                  {filtered?.map((item: CursoMoodlew, index: number) => (
                    <tr
                      key={item.id}
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      {/* Número de fila */}
                      <TdCell className="text-center font-semibold text-gray-500">
                        {index + 1}
                      </TdCell>
                      
                      {/* Código del curso (shortname) */}
                      <TdCell>
                        <div className="flex items-center gap-3"> 
                          <div>
                            <p className="font-semibold text-gray-900 uppercase">
                              {item.shortname}
                            </p>
                          </div>
                        </div>
                      </TdCell>
                      
                      {/* Nombre completo del curso (fullname) */}
                      <TdCell>
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-[#00155C] text-xs font-semibold border border-blue-100">
                          {item.fullname}
                        </span>
                      </TdCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ThCell({ children, width = "" }: { children: React.ReactNode; width?: string }) {
  return (
    <th className={`px-4 py-4 text-left ${width}`}>
      <span className="text-xs font-bold uppercase tracking-wider">
        {children}
      </span>
    </th>
  );
}

// Componente reutilizable para celdas del cuerpo de la tabla
function TdCell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-4 py-4 text-sm text-gray-700 ${className}`}>
      {children}
    </td>
  );
}