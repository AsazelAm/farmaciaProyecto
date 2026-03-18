// src/pages/.../Cursos.tsx - DISEÑO MEJORADO

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useMemo, useState, useCallback } from "react";
import Loading from "../../../../Helpers/Loading";
import { listCursos, deleteCurso } from "../../../../Api/Cursos";
import { toast } from "react-toastify";

const CurForm = lazy(() => import("../../../../Components/CatalogoCurso/CursForm"));
const CursoEditForm = lazy(() => import("../../../../Components/CatalogoCurso/CursoEditForm"));
const CursoDetailView  = lazy(() => import("../../../../Components/CatalogoCurso/DetailCurso"));



type RowCurso = {
  id_curso: number;
  codigo: string | null;
  n_curso: string | null;
  precio: number | string | null;
  descripcion?: string | null;
  propuestas?: string | null;
  areas?: string | null;
};

export default function Cursos() {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [viewId, setViewId] = useState<number | null>(null);

  const toggleExpanded = useCallback((id: number) => {
    setExpanded((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  }, []);

  const queryClient = useQueryClient();

  const { data: rows, isLoading } = useQuery({
    queryKey: ["GetCursoAll"],
    queryFn: listCursos,
  });

  const { mutate: runDelete, isPending: deleting } = useMutation({
    mutationFn: (id: number) => deleteCurso(id),
    onError: (error: any) => toast.error(error.message),
    onSuccess: (results: any) => {
      toast.success(typeof results === "string" ? results : "Curso eliminado");
      queryClient.invalidateQueries({ queryKey: ["GetCursoAll"] });
      setConfirmId(null);
    },
  });

  const filtered = useMemo(() => {
    const list: RowCurso[] = Array.isArray(rows) ? rows : [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    const hay = (v: any) => String(v ?? "").toLowerCase().includes(q);
    return list.filter((r) =>
      hay(r.codigo) ||
      hay(r.n_curso) ||
      hay(r.descripcion) ||
      hay(r.propuestas) ||
      hay(r.areas)
    );
  }, [rows, search]);

  const fmtBOB = (v: any) => {
    const n = Number(v);
    if (Number.isNaN(n)) return v ?? "";
    try {
      return new Intl.NumberFormat("es-BO", {
        style: "currency",
        currency: "BOB",
        maximumFractionDigits: 2,
      }).format(n);
    } catch {
      return n.toFixed(2);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="mx-auto max-w-[1600px]">
        {/* Header con título y acciones */}
        <header className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                Gestión de Cursos
              </h1>
              <p className="text-sm text-gray-600">
                Administra el catálogo completo de cursos académicos
              </p>
            </div>
            
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear Curso
            </button>
          </div>
        </header>

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
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
                placeholder="Buscar por código, nombre, propuesta de valor o área..."
                className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm"
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
            
            <div className="flex items-center gap-3 text-sm">
              <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-semibold border border-indigo-100">
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
                <thead className="sticky top-0 z-10 bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <ThCell width="w-16">#</ThCell>
                    <ThCell width="w-32">Código</ThCell>
                    <ThCell width="w-64">Curso</ThCell>
                    <ThCell width="w-32">Precio</ThCell>
                    <ThCell width="w-80">Descripción</ThCell>
                    <ThCell width="w-64">Propuestas</ThCell>
                    <ThCell width="w-64">Áreas</ThCell>
                    <ThCell width="w-32">Acciones</ThCell>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {(!filtered || filtered.length === 0) && (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-gray-500 font-medium">No se encontraron cursos</p>
                            <p className="text-sm text-gray-400 mt-1">
                              {search ? "Intenta con otros términos de búsqueda" : "Comienza creando tu primer curso"}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {filtered?.map((item: RowCurso, index: number) => {
                    const isOpenDesc = expanded.has(item.id_curso);
                    return (
                      <tr
                        key={item.id_curso}
                        className="hover:bg-indigo-50/50 transition-colors group"
                      >
                        <TdCell className="text-center font-semibold text-gray-500">
                          {index + 1}
                        </TdCell>
                        
                        <TdCell>
                          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-mono text-xs font-semibold border border-indigo-100">
                            {item.codigo ?? "—"}
                          </span>
                        </TdCell>
                        
                        <TdCell>
                          <span className="font-semibold text-gray-900">
                            {item.n_curso ?? "—"}
                          </span>
                        </TdCell>
                        
                        <TdCell>
                          <span className="font-semibold text-emerald-600">
                            {fmtBOB(item.precio)}
                          </span>
                        </TdCell>

                        <TdCell>
                          <ClampText
                            text={item.descripcion ?? ""}
                            isOpen={isOpenDesc}
                            onToggle={() => toggleExpanded(item.id_curso)}
                          />
                        </TdCell>

                        <TdCell>
                          <ChipList value={item.propuestas} color="purple" />
                        </TdCell>
                        
                        <TdCell>
                          <ChipList value={item.areas} color="blue" />
                        </TdCell>

                        <TdCell>
                          <div className="flex items-center gap-2">
                             <button
      onClick={() => setViewId(item.id_curso)}
      className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-colors"
      title="Ver detalles"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    </button>
                            <button
                              onClick={() => setEditId(item.id_curso)}
                              className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 transition-colors"
                              title="Editar curso"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setConfirmId(item.id_curso)}
                              className="p-2 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
                              title="Eliminar curso"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </TdCell>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {isOpen && (
        <Suspense fallback={<Loading />}>
          <CurForm setIsOpen={setIsOpen} isOpen={isOpen} />
        </Suspense>
      )}

      {editId !== null && (
        <Suspense fallback={<Loading />}>
          <CursoEditForm idCurso={editId} onClose={() => setEditId(null)} />
        </Suspense>
      )}

      {confirmId !== null && (
        <ConfirmDialog
          title="¿Eliminar curso?"
          message="Esta acción eliminará el curso de forma permanente. Los datos no podrán recuperarse."
          confirmLabel={deleting ? "Eliminando..." : "Sí, eliminar"}
          cancelLabel="Cancelar"
          onCancel={() => setConfirmId(null)}
          onConfirm={() => runDelete(confirmId)}
          disabled={deleting}
        />
      )}
      {viewId !== null && (
  <Suspense fallback={<Loading />}>
    <CursoDetailView idCurso={viewId} onClose={() => setViewId(null)} />
  </Suspense>
)}
    </div>
  );
}

/* ========== COMPONENTES AUXILIARES ========== */

function ThCell({ children, width = "" }: { children: React.ReactNode; width?: string }) {
  return (
    <th className={`px-4 py-4 text-left ${width}`}>
      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
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

function ClampText({
  text,
  isOpen,
  onToggle,
}: {
  text: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const hasText = (text ?? "").trim().length > 0;
  
  if (!hasText) {
    return <span className="text-gray-400 italic">Sin descripción</span>;
  }

  return (
    <div className="flex items-start gap-2">
      <p
        className={`text-sm leading-relaxed text-gray-600 ${
          !isOpen ? "line-clamp-2" : ""
        }`}
      >
        {text}
      </p>
      <button
        type="button"
        onClick={onToggle}
        className="shrink-0 text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
      >
        {isOpen ? "Menos" : "Más"}
      </button>
    </div>
  );
}

function ChipList({
  value,
  color,
}: {
  value?: string | null;
  color: "purple" | "blue";
}) {
  if (!value) return <span className="text-gray-400 italic text-xs">—</span>;
  
  const parts = value.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return <span className="text-gray-400 italic text-xs">—</span>;

  const palette =
    color === "purple"
      ? "bg-purple-50 text-purple-700 border-purple-200"
      : "bg-blue-50 text-blue-700 border-blue-200";

  return (
    <div className="flex flex-wrap gap-1.5">
      {parts.map((p, i) => (
        <span
          key={i}
          className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium ${palette}`}
        >
          {p}
        </span>
      ))}
    </div>
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
          {/* Header con icono */}
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