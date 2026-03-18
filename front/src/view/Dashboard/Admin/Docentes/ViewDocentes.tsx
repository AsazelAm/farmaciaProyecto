import { useMutation, useQuery, useQueryClient, useQueries } from "@tanstack/react-query";
import { DeleteDocente, GetDocentes, GethabilidadesById } from "../../../../Api/Docentes";
import { lazy, Suspense, useState } from "react";
import Loading from "../../../../Helpers/Loading";
import { toast } from "react-toastify";

const DocenteForm = lazy(() => import('../../../../Components/Docente/DocenteForm'));
const DocenteEditForm = lazy(() => import('../../../../Components/Docente/DocenteEditForm'));

export default function ViewDocentes() {
    const queryClient = useQueryClient();
    const [isOpenCreate, setIsOpenCreate] = useState(false);
    const [isOpenEdit, setIsOpenEdit] = useState(false);
    const [selectedDocenteId, setSelectedDocenteId] = useState<number | null>(null);
    const [searchDocente, setSearchDocente] = useState('');
    const [searchHabilidad, setSearchHabilidad] = useState('');

    const { data: docentes, isLoading } = useQuery({
        queryKey: ['GetAllDocentes'],
        queryFn: GetDocentes,
    });

    const habilidadesQueries = useQueries({
        queries: docentes?.map((docente) => ({
            queryKey: ['GethabilidadesById', docente.id_user],
            queryFn: () => GethabilidadesById(docente.id_user),
            enabled: !!docentes,
        })) || []
    });

    const { mutate: DeleteUsers } = useMutation({
        mutationFn: DeleteDocente,
        onError: (error: any) => toast.error(error.message),
        onSuccess: (results) => {
            toast.success(results.message || 'Docente eliminado');
            queryClient.invalidateQueries({ queryKey: ['GetAllDocentes'] });
        },
    });

    const handleOpenEdit = (docenteId: number) => {
        setSelectedDocenteId(docenteId);
        setIsOpenEdit(true);
    };

    if (isLoading || habilidadesQueries.some(q => q.isLoading)) return <Loading />;

    const filteredDocentes = docentes?.filter((docente, index) => {
        const habilidades = habilidadesQueries[index]?.data || [];
        const nombreCompleto = `${docente.nombre} ${docente.apellido}`.toLowerCase();
        const matchDocente = nombreCompleto.includes(searchDocente.toLowerCase());
        const matchHabilidad = habilidades.some(h => h.n_habilidad.toLowerCase().includes(searchHabilidad.toLowerCase()));
        return matchDocente && (searchHabilidad ? matchHabilidad : true);
    }) || [];

    if (!docentes) return <Loading />;

    return (
        <section className="min-h-screen w-full p-8 bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Gestión de Docentes</h1>
                <p className="text-gray-600">Administra el catálogo completo de docentes</p>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
                <div className="flex flex-wrap gap-4 items-center">
                    <button
                        onClick={() => setIsOpenCreate(!isOpenCreate)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-800 hover:bg-blue-900 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-300/50"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Crear Docente
                    </button>

                    <div className="flex-1 flex gap-3">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar por nombre, formación o habilidad..."
                                value={searchDocente}
                                onChange={(e) => setSearchDocente(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
                        <span className="text-sm font-medium text-blue-700">{filteredDocentes.length} docentes</span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-blue-900">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    NRO
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    NOMBRE
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    FORMACIÓN
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    HABILIDADES
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                                    ACCIONES
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredDocentes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                            <p className="text-gray-500 font-medium">No se encontraron docentes</p>
                                            <p className="text-sm text-gray-400">Intenta cambiar los filtros de búsqueda</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredDocentes.map((item, index) => {
                                    const habilidades = habilidadesQueries[docentes.indexOf(item)]?.data || [];
                                    return (
                                        <tr key={item.id_user} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-800">
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {item.nombre} {item.apellido}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {item.formacion || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1 max-w-md">
                                                    {habilidades.length > 0 ? (
                                                        habilidades.slice(0, 3).map((hab, idx) => (
                                                            <span key={idx + 1} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                {hab.n_habilidad}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">Sin habilidades</span>
                                                    )}
                                                    {habilidades.length > 3 && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                            +{habilidades.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleOpenEdit(item.id_user)}
                                                        className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (globalThis.confirm('¿Estás seguro de eliminar este docente?')) {
                                                                DeleteUsers(item.id_user);
                                                            }
                                                        }}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Crear */}
            {isOpenCreate && (
                <Suspense fallback={<Loading />}>
                    <DocenteForm
                        setIsOpen={setIsOpenCreate}
                        isOpen={isOpenCreate}
                    />
                </Suspense>
            )}

            {/* Modal Editar */}
            {isOpenEdit && selectedDocenteId && (
                <Suspense fallback={<Loading />}>
                    <DocenteEditForm
                        setIsOpen={setIsOpenEdit}
                        isOpen={isOpenEdit}
                        docenteId={selectedDocenteId}
                    />
                </Suspense>
            )}
        </section>
    );
}