import { useQuery } from "@tanstack/react-query";
import Loading from "../../../../Helpers/Loading";
import { GetDocenteCursoApi } from "../../../../Api/CursoInscritosApi";
import { useAuth } from "../../../../Hook/UseAuth";
import { useNavigate } from "react-router-dom";

export default function CursoInscritos() {
    const navigate = useNavigate();
    const { data: user } = useAuth(); 
    const idDocente = user?.id_user;

    const { data, isLoading, error } = useQuery({
        queryKey: ['GetDocCursApi', idDocente],
        queryFn: () => GetDocenteCursoApi(idDocente!),
        enabled: !!idDocente,
    });

    if (isLoading || !user) {
        return <Loading />;
    }
    
    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded">
                <p className="font-semibold">Error al cargar los cursos</p>
                <p className="text-sm mt-1">{error instanceof Error ? error.message : 'Error desconocido'}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-slate-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#0129ad] via-blue-700 to-indigo-600 bg-clip-text text-transparent">
                                Mis Cursos Asignados
                            </h1>
                            <p className="text-slate-600 text-sm mt-1">
                                Docente: {user?.nombre}
                            </p>
                        </div>
                    </div>
                    
                    {!data || data.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">📚</div>
                            <p className="text-slate-600 font-medium text-lg">No tienes cursos asignados</p>
                            <p className="text-slate-400 text-sm mt-2">Contacta al administrador del sistema</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.map((curso, index) => (
                                <div 
                                    key={curso.id_calendario}
                                    className="group relative bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-xl transition-all duration-300 overflow-hidden"
                                >
                                    {/* Badge de número */}
                                    <div className="absolute top-4 right-4 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                                        {index + 1}
                                    </div>

                                    <div className="p-6">
                                        {/* Código del curso */}
                                        <div className="mb-3">
                                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                                {curso.codigo}
                                            </span>
                                        </div>

                                        {/* Nombre del curso */}
                                        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-blue-600 transition-colors">
                                            {curso.n_curso}
                                        </h3>

                                        {/* Información adicional */}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span className="font-medium">{curso.nombre}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span>ID Calendario: {curso.id_calendario}</span>
                                            </div>
                                        </div>

                                        {/* Botón de acción */}
                                        <button 
                                            onClick={() => {
                                                navigate(`/Docente/AlumnosInscritos/${curso.id_calendario}`);
                                            }}
                                            className="w-full px-4 py-3 bg-gradient-to-r from-[#0129ad] via-blue-700 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                            </svg>
                                            Ver Asistencias
                                        </button>
                                    </div>

                                    {/* Decoración */}
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// function ThCell({ children, width = "" }: { children: React.ReactNode; width?: string }) {
//     return (
//         <th className={`px-4 py-4 text-left ${width}`}>
//             <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
//                 {children}
//             </span>
//         </th>
//     );
// }

// function TdCell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
//     return (
//         <td className={`px-4 py-4 text-sm text-gray-700 ${className}`}>
//             {children}
//         </td>
//     );
// }