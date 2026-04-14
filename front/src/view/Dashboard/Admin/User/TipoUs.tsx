import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useMemo, useState } from "react";
import Loading from "../../../../Helpers/Loading";
import { toast } from "react-toastify";
import { GetTipoUsApi, DeleteTipoUsApi } from "../../../../Api/TipoUsApi";
import type { UpdateTipo_us } from "../../../../types";

const TipoUsForm  = lazy(() => import("../../../../Components/TipoUs/TipoUsForm"));
const UpdateTipoUs = lazy(() => import("../../../../Components/TipoUs/UpdateTipoUs"));

// Paleta: #4A1A6E (lila oscuro) · #7B3FA0 (lila medio) · #F3EBF9 (lila suave)

export default function TipoUs() {
  const queryClient = useQueryClient();

  const [isOpen,setIsOpen] = useState(false);
  const [isEditing,setIsEditing] = useState(false);
  const [selectedFormacion, setSelectedFormacion] = useState<UpdateTipo_us | null>(null);
  const [search,setSearch] = useState("");
  const [confirmId,setConfirmId] = useState<number | null>(null);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["TipoUsAll"],
    queryFn:  GetTipoUsApi,
  });

  const { mutate: runDelete, isPending: deleting } = useMutation({
    mutationFn: DeleteTipoUsApi,
    onError:   (error)   => toast.error(error.message),
    onSuccess: (results) => {
      toast.success(results);
      queryClient.invalidateQueries({ queryKey: ["TipoUsAll"] });
      setConfirmId(null);
    },
  });

  const handleEditClick = (valor: UpdateTipo_us) => {
    setSelectedFormacion(valor);
    setIsEditing(true);
  };

  const filtered = useMemo(() => {
    const list: UpdateTipo_us[] = Array.isArray(rows) ? rows : [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) =>
      String(r.name_rol ?? "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  if (isLoading) return <Loading />;

  return (
    <div
      className="min-h-screen w-full p-4 md:p-8"
      style={{ background: "linear-gradient(135deg, #F3EBF9 0%, #EDE4F5 50%, #E6D8F2 100%)" }}
    >
      <div className="mx-auto max-w-[1400px]">

        {/* HEADER */}
        <header className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-bold" style={{ color: "#4A1A6E" }}>
                  Tipos de Usuario
                </h1>
                <p className="text-sm" style={{ color: "#7B3FA0" }}>
                  Administra los roles y tipos de usuario del sistema farmacéutico
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Tipo de Usuario
            </button>
          </div>
        </header>

        {/* BARRA DE BÚSQUEDA */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 mb-6" style={{ borderColor: "#D8B4F0" }}>
          <div className="flex flex-col md:flex-row gap-4 items-center">

            <div className="relative flex-1 w-full">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                style={{ color: "#7B3FA0" }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre de rol..."
                className="w-full pl-12 pr-10 py-3 rounded-xl border-2 outline-none text-sm transition-colors"
                style={{ borderColor: "#D8B4F0", color: "#4A1A6E" }}
              />

              {search && (
                <button
                  aria-label="Limpiar búsqueda"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-purple-100 transition-colors text-sm"
                  style={{ color: "#7B3FA0" }}
                >
                  ✕
                </button>
              )}
            </div>

            <div
              className="px-4 py-2 rounded-lg font-semibold border text-sm flex-shrink-0"
              style={{ background: "#F3EBF9", color: "#4A1A6E", borderColor: "#D8B4F0" }}
            >
              {filtered.length} {filtered.length === 1 ? "tipo de usuario" : "tipos de usuario"}
            </div>
          </div>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-2xl shadow-lg border overflow-hidden" style={{ borderColor: "#D8B4F0" }}>
          <div className="overflow-x-auto">
            <div className="max-h-[calc(116vh-320px)] overflow-y-auto">
              <table className="w-full">

                <thead
                  className="sticky top-0 z-10 text-white"
                  style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}
                >
                  <tr>
                    <ThCell width="w-16">Nro</ThCell>
                    <ThCell>Nombre del Rol</ThCell>
                    <ThCell width="w-36">Opciones</ThCell>
                  </tr>
                </thead>

                <tbody className="divide-y divide-purple-50">

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div
                            className="w-20 h-20 rounded-full flex items-center justify-center"
                            style={{ background: "#F3EBF9" }}
                          >
                            <svg className="w-10 h-10" style={{ color: "#D8B4F0" }}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                          <p className="font-medium" style={{ color: "#4A1A6E" }}>
                            No se encontraron tipos de usuario
                          </p>
                          <p className="text-sm" style={{ color: "#7B3FA0" }}>
                            {search
                              ? "Intenta con otros términos de búsqueda"
                              : "Comienza creando el primer tipo de usuario"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}

                  {filtered.map((item, index) => (
                    <tr
                      key={item.id_tipo_us ?? index}
                      className="hover:bg-purple-50/40 transition-colors"
                    >
                      <TdCell className="text-center font-semibold" style={{ color: "#7B3FA0" }}>
                        {index + 1}
                      </TdCell>

                      <TdCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}
                          >
                            {String(item.name_rol ?? "?")[0].toUpperCase()}
                          </div>
                          <span className="font-semibold" style={{ color: "#2D0A47" }}>
                            {item.name_rol}
                          </span>
                        </div>
                      </TdCell>

                      <TdCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(item)}
                            title="Editar tipo de usuario"
                            className="p-2 rounded-lg transition-colors hover:bg-purple-100"
                            style={{ color: "#4A1A6E" }}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>

                          <button
                            onClick={() => setConfirmId(item.id_tipo_us)}
                            title="Eliminar tipo de usuario"
                            className="p-2 rounded-lg transition-colors text-red-500 hover:bg-red-50 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
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

      {/* MODALES */}
      {isOpen && (
        <Suspense fallback={<Loading />}>
          <TipoUsForm setIsOpen={setIsOpen} isOpen={isOpen} />
        </Suspense>
      )}

      {isEditing && (
        <Suspense fallback={<Loading />}>
          <UpdateTipoUs SendValor={selectedFormacion} SetVer={setIsEditing} />
        </Suspense>
      )}

      {confirmId !== null && (
        <ConfirmDialog
          title="¿Eliminar Tipo de Usuario?"
          message="Esta acción eliminará AL TIPO DE USUARIO de forma permanente. Los datos no podrán recuperarse."
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

/* ── AUXILIARES ─────────────────────────────────────────────────────────────── */

function ThCell({ children, width = "" }: { children: React.ReactNode; width?: string }) {
  return (
    <th className={`px-4 py-4 text-left ${width}`}>
      <span className="text-xs font-bold uppercase tracking-wider opacity-90">{children}</span>
    </th>
  );
}

function TdCell({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <td className={`px-4 py-4 text-sm ${className}`} style={style}>
      {children}
    </td>
  );
}

function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel  = "Cancelar",
  onConfirm,
  onCancel,
  disabled = false,
}: {
  title:         string;
  message:       string;
  confirmLabel?: string;
  cancelLabel?:  string;
  onConfirm: () => void;
  onCancel:  () => void;
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
        <div
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl border overflow-hidden"
          style={{ borderColor: "#D8B4F0" }}
        >
          {/* Header */}
          <div
            className="px-6 py-5 border-b"
            style={{ background: "linear-gradient(135deg, #F3EBF9, #EDE4F5)", borderColor: "#D8B4F0" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold" style={{ color: "#4A1A6E" }}>{title}</h3>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <p className="leading-relaxed text-gray-600">{message}</p>
          </div>

          {/* Footer */}
          <div
            className="px-6 py-4 flex justify-end gap-3 border-t"
            style={{ background: "#F3EBF9", borderColor: "#D8B4F0" }}
          >
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border-2 font-medium transition-all hover:bg-purple-100"
              style={{ borderColor: "#D8B4F0", color: "#4A1A6E" }}
            >
              {cancelLabel}
            </button>

            <button
              onClick={onConfirm}
              disabled={disabled}
              className="px-5 py-2.5 rounded-xl text-white font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}