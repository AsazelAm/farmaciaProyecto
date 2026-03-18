import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useMemo, useState } from "react";
import { DeleteuserApi, GetAlumnosApi } from "../../../../Api/UserApi";
import Loading from "../../../../Helpers/Loading";
import { toast } from "react-toastify";
//import Eliminar from "../../../../assets/eliminar.png";
//import Editar from "../../../../assets/editar.png";
import type { UpdateStudents } from "../../../../types";

const AlumnoForm = lazy(() => import("../../../../Components/User/AlumnoForm"));
const UpdateStudent = lazy(() => import("../../../../Components/User/UpdateStudent"));

export default function Alumnos() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormacion, setSelectedFormacion] = useState<UpdateStudents | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);

  // Obtener datos
  const { data: rows, isLoading } = useQuery({
    queryKey: ['GetAllAlumnos'],
    queryFn: GetAlumnosApi
  });

  // Mutación para eliminar
  const { mutate: runDelete, isPending: deleting } = useMutation({
    mutationFn: DeleteuserApi,
    onError: (error) => {
      toast.error(error.message)
    },
    onSuccess: (results) => {
      toast.success(results);
      queryClient.invalidateQueries({ queryKey: ['GetAllAlumnos'] });
      setConfirmId(null);
    },
  });

  // Manejar edición
  const handleEditClick = (valor: UpdateStudents) => {
    setSelectedFormacion(valor);
    setIsEditing(true);
  };

  // Filtrado con búsqueda
  const filtered = useMemo(() => {
    const list: UpdateStudents[] = Array.isArray(rows) ? rows : [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    const hay = (v: any) => String(v ?? "").toLowerCase().includes(q);
    return list.filter((r) =>
      hay(r.nombre) ||
      hay(r.apellido) ||
      hay(r.ci) ||
      hay(r.telefono) ||
      hay(r.city) ||
      hay(r.pais)
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
                Administración de Alumnos
              </h1>
              <p className="text-sm text-gray-600">
                Gestiona el registro completo de estudiantes
              </p>
            </div>
            
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#00155C] hover:bg-[#001a7a] 
              text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear Alumno
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
                placeholder="Buscar por nombre, carnet, teléfono, ciudad o país..."
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
            
            <div className="flex items-center gap-3 text-sm">
              <div className="px-4 py-2 bg-blue-50 text-[#00155C] rounded-lg font-semibold border border-blue-100">
                {filtered?.length ?? 0} {filtered?.length === 1 ? "alumno" : "alumnos"}
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de alumnos */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-[#00155C] text-white">
                  <tr>
                    <ThCell width="w-16">Nro</ThCell>
                    <ThCell width="w-64">Alumnos</ThCell>
                    <ThCell width="w-40">Carnet</ThCell>
                    <ThCell width="w-40">Teléfono</ThCell>
                    <ThCell width="w-48">Ciudad</ThCell>
                    <ThCell width="w-40">País</ThCell>
                    <ThCell width="w-32">Acciones</ThCell>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {(!filtered || filtered.length === 0) && (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <div>
                            <p className="text-gray-500 font-medium">No se encontraron alumnos</p>
                            <p className="text-sm text-gray-400 mt-1">
                              {search ? "Intenta con otros términos de búsqueda" : "Comienza registrando tu primer alumno"}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {filtered?.map((item: UpdateStudents, index: number) => (
                    <tr
                      key={item.id_user}
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      <TdCell className="text-center font-semibold text-gray-500">
                        {index + 1}
                      </TdCell>
                      
                      <TdCell>
                        <div className="flex items-center gap-3"> 
                          <div>
                            <p className="font-semibold text-gray-900 capitalize">
                              {item.nombre} {item.apellido}
                            </p>
                          </div>
                        </div>
                      </TdCell>
                      
                      <TdCell>
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-[#00155C] font-mono text-xs font-semibold border border-blue-100">
                          {item.ci}
                        </span>
                      </TdCell>
                      
                      <TdCell>
                        <span className="text-gray-700">
                          {item.telefono}
                        </span>
                      </TdCell>

                      <TdCell>
                        <span className="text-gray-700">
                          {item.city}
                        </span>
                      </TdCell>

                      <TdCell>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                          {item.pais}
                        </span>
                      </TdCell>

                      <TdCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-[#00155C] hover:text-blue-700 transition-colors"
                            title="Editar alumno"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setConfirmId(item.id_user)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
                            title="Eliminar alumno"
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

      {/* Modales */}
      {isOpen && (
        <Suspense fallback={<Loading />}>
          <AlumnoForm
            setIsOpen={setIsOpen} 
            isOpen={isOpen}
          />
        </Suspense>
      )}

      {isEditing && selectedFormacion !== null && (
        <Suspense fallback={<Loading />}>
          <UpdateStudent
            SendValor={selectedFormacion}
            SetVer={setIsEditing}
          />
        </Suspense>
      )}

      {confirmId !== null && (
        <ConfirmDialog
          title="¿Eliminar alumno?"
          message="Esta acción eliminará el alumno de forma permanente. Los datos no podrán recuperarse."
          confirmLabel={deleting ? "Eliminando..." : "Sí, eliminar"}
          cancelLabel="Cancelar"
          onCancel={() => setConfirmId(null)}
          onConfirm={() => runDelete(confirmId)}
          disabled={deleting}
        />
      )}
      
    </div>
  );
}

/* ========== COMPONENTES AUXILIARES ========== */

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