import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listBlogsApi, deleteBlogApi} from "../../../../Api/Blogs";
import Loading from "../../../../Helpers/Loading";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useMemo, useState } from "react";

export default function Blogs() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [confirmId, setConfirmId] = useState<number | null>(null);

    // Obtener blogs del backend
    const { data, isLoading } = useQuery({
        queryKey: ['listBlogs'],
        // AHORA: Usamos una arrow function para ignorar el contexto y llamar la API sin parámetros.
        queryFn: () => listBlogsApi() // <--- ¡CAMBIO AQUÍ!
    });
    // Mutación para eliminar
    const { mutate: DeleteUsers, isPending: deleting } = useMutation({
        mutationFn: deleteBlogApi,
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: () => {
            toast.success('Blog eliminado correctamente');
            queryClient.invalidateQueries({ queryKey: ['listBlogs'] });
            setConfirmId(null);
        },
    });


    // Filtrado con búsqueda
    const filtered = useMemo(() => {
        const list = Array.isArray(data?.data) ? data.data : [];
        const q = search.trim().toLowerCase();
        if (!q) return list;
        
        return list.filter((blog: any) =>
            (blog.slug?.toLowerCase() ?? "").includes(q) ||
            (blog.titulo?.toLowerCase() ?? "").includes(q) ||
            (blog.pagina_slug?.toLowerCase() ?? "").includes(q)
        );
    }, [data, search]);

    if (isLoading) return <Loading />;

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
            <div className="mx-auto max-w-[1600px]">
                {/* ═══════════════════════════════════════════════════════ */}
                {/* HEADER CON TÍTULO Y BOTÓN CREAR */}
                {/* ═══════════════════════════════════════════════════════ */}
                <header className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-[#00155C] mb-1">
                                Gestión de Blogs
                            </h1>
                            <p className="text-sm text-gray-600">
                                Administra el catálogo completo de blogs y artículos
                            </p>
                        </div>
                        
                        <button
                            onClick={() => navigate('/Dashboard/BlogEditor')}
                            className="flex items-center gap-2 px-6 py-3 bg-[#00155C] hover:bg-[#001a7a] 
                            text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Crear Blog
                        </button>
                    </div>
                </header>

                {/* ═══════════════════════════════════════════════════════ */}
                {/* BARRA DE BÚSQUEDA Y FILTROS */}
                {/* ═══════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        {/* Búsqueda */}
                        <div className="relative flex-1 w-full">
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
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar por nombre, título o página..."
                                className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00155C] focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm"
                            />
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
                        
                        {/* Contador */}
                        <div className="flex items-center gap-3 text-sm">
                            <div className="px-4 py-2 bg-blue-50 text-[#00155C] rounded-lg font-semibold border border-blue-100">
                                {filtered?.length ?? 0} {filtered?.length === 1 ? "blog" : "blogs"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════ */}
                {/* TABLA DE BLOGS */}
                {/* ═══════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                            <table className="w-full">
                                {/* HEADER */}
                                <thead className="sticky top-0 z-10 bg-[#00155C] text-white">
                                    <tr>
                                        <ThCell width="w-16">Nro</ThCell>
                                        <ThCell width="w-48">Nombre</ThCell>
                                        <ThCell width="w-40">Página</ThCell>
                                        <ThCell width="w-56">Fecha Publicado</ThCell>
                                        <ThCell width="w-32">Estado</ThCell>
                                        <ThCell width="w-24">Vistas</ThCell>
                                        <ThCell width="w-32">Acciones</ThCell>
                                    </tr>
                                </thead>

                                {/* BODY */}
                                <tbody className="divide-y divide-gray-100">
                                    {(!filtered || filtered.length === 0) && (
                                        <tr>
                                            <td colSpan={7} className="py-16 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-gray-500 font-medium">No se encontraron blogs</p>
                                                        <p className="text-sm text-gray-400 mt-1">
                                                            {search ? "Intenta con otros términos de búsqueda" : "Comienza creando tu primer blog"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                    {filtered?.map((item: any, index: number) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-blue-50/50 transition-colors group"
                                        >
                                            {/* NRO */}
                                            <TdCell className="text-center font-semibold text-gray-500">
                                                {index + 1}
                                            </TdCell>
                                            
                                            {/* NOMBRE (slug) */}
                                            <TdCell>
                                                <span className="font-semibold text-gray-900">
                                                    {item.slug}
                                                </span>
                                                {item.titulo && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {item.titulo}
                                                    </div>
                                                )}
                                            </TdCell>
                                            
                                            {/* PÁGINA */}
                                            <TdCell>
                                                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-[#00155C] text-xs font-semibold border border-blue-100">
                                                    {item.pagina_slug || 'N/A'}
                                                </span>
                                            </TdCell>
                                            
                                            {/* FECHA PUBLICADO */}
                                            <TdCell>
                                                <div className="text-sm text-gray-700">
                                                    {item.publicado_en 
                                                        ? new Date(item.publicado_en).toLocaleDateString('es-ES', {
                                                            year: 'numeric',
                                                            month: '2-digit',
                                                            day: '2-digit',
                                                        })
                                                        : 'No publicado'
                                                    }
                                                </div>
                                                {item.publicado_en && (
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(item.publicado_en).toLocaleTimeString('es-ES', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                )}
                                            </TdCell>

                                            {/* ESTADO */}
                                            <TdCell>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${
                                                    item.estado === 'publicado' 
                                                        ? 'bg-green-500' 
                                                        : item.estado === 'borrador'
                                                        ? 'bg-yellow-500'
                                                        : item.estado === 'archivado'
                                                        ? 'bg-red-500'
                                                        : 'bg-gray-500'
                                                }`}>
                                                    {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
                                                </span>
                                            </TdCell>

                                            {/* VISTAS */}
                                            <TdCell className="text-center">
                                                <span className="font-bold text-blue-600">
                                                    {item.visitas}
                                                </span>
                                            </TdCell>

                                            {/* ACCIONES */}
                                            <TdCell>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/Dashboard/BlogEditor/${item.id}`)}
                                                        className="p-2 rounded-lg hover:bg-blue-50 text-[#00155C] hover:text-blue-700 transition-colors"
                                                        title="Editar blog"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmId(item.id)}
                                                        className="p-2 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
                                                        title="Eliminar blog"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </TdCell>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR */}
            {/* ═══════════════════════════════════════════════════════ */}
            {confirmId !== null && (
                <ConfirmDialog
                    title="¿Eliminar blog?"
                    message="Esta acción eliminará el blog de forma permanente. Los datos no podrán recuperarse."
                    confirmLabel={deleting ? "Eliminando..." : "Sí, eliminar"}
                    cancelLabel="Cancelar"
                    onCancel={() => setConfirmId(null)}
                    onConfirm={() => DeleteUsers(confirmId)}
                    disabled={deleting}
                />
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════ */
/* COMPONENTES AUXILIARES */
/* ═══════════════════════════════════════════════════════ */

function ThCell({ children, width = "" }: { children: React.ReactNode; width?: string }) {
    return (
        <th className={`px-4 py-4 text-left ${width}`}>
            <span className="text-xs font-bold uppercase tracking-wider">
                {children}
            </span>
        </th>
    );
}

function TdCell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <td className={`px-4 py-4 text-sm text-gray-700 ${className}`}>
            {children}
        </td>
    );
}

function ConfirmDialog({
    title,
    message,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    onConfirm,
    onCancel,
    disabled = false,
}: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    disabled?: boolean;
}) {
    return (
        <>
            <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm" onClick={onCancel} />
            <div
                role="dialog"
                aria-modal="true"
                className="fixed z-[130] inset-0 flex items-center justify-center p-4"
            >
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-5 border-b border-red-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5">
                        <p className="text-gray-600 leading-relaxed">{message}</p>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                        <button
                            onClick={onCancel}
                            className="px-5 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={disabled}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}