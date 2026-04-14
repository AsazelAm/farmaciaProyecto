import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useMemo, useState } from "react";
import Loading from "../../../../Helpers/Loading";
import { toast } from "react-toastify";
import { GetTipoProdApi, DeleteTipoProdApi } from "../../../../Api/TipoProdApi";
import type { UpdateTipoProd } from "../../../../types";

// Lazy loading de componentes secundarios
const TipoProductoForm = lazy(() => import("../../../../Components/TipoProducto/TipoProductoForm"));
const UpdateTipoProducto = lazy(() => import("../../../../Components/TipoProducto/UpdateTipoProducto"));

// Paleta de colores lila del archivo base
const COLORS = {
  dark: "#4A1A6E",
  medium: "#7B3FA0",
  light: "#F3EBF9",
  border: "#D8B4F0",
  text: "#4A1A6E"
};

export default function TipoProducto() {
  const queryClient = useQueryClient();

  // Estados de control
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTipoProd, setSelectedTipoProd] = useState<UpdateTipoProd | null>(null);
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);

  // Obtención de datos
  const { data: rows, isLoading } = useQuery({
    queryKey: ["TipoProdAll"],
    queryFn: GetTipoProdApi,
  });

  // Mutación para eliminar
  const { mutate: deleteMutate, isPending: deleting } = useMutation({
    mutationFn: DeleteTipoProdApi,
    onError: (error) => toast.error(error.message),
    onSuccess: (res) => {
      toast.success(res);
      queryClient.invalidateQueries({ queryKey: ["TipoProdAll"] });
      
      setConfirmId(null);
    },
  });

  // Filtrado para el buscador
  const filteredData = useMemo(() => {
    if (!rows) return [];
    return rows.filter((row) =>
      row.nombre.toLowerCase().includes(search.toLowerCase())
    );
  }, [rows, search]);

  if (isLoading) return <Loading />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER & BUSCADOR */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black flex items-center gap-3" style={{ color: COLORS.dark }}>
                <span className="p-3 rounded-2xl bg-purple-100 text-purple-700">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </span>
                Tipos de Producto
              </h1>
              <p className="mt-2 text-gray-500 font-medium">Gestiona las categorías o tipos de productos del sistema</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Buscar tipo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-80 pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-purple-300 transition-all outline-none text-sm font-medium"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <button
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-white font-bold transition-all shadow-lg hover:shadow-purple-200 active:scale-95"
                style={{ background: `linear-gradient(135deg, ${COLORS.dark}, ${COLORS.medium})` }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Tipo
              </button>
            </div>
          </div>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-gray-400 border-b">ID</th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-gray-400 border-b">Nombre del Tipo</th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-gray-400 border-b">Fecha Creacion</th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-gray-400 border-b text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredData.length > 0 ? (
                  filteredData.map((row) => (
                    <tr key={row.id_tipo_prod} className="hover:bg-purple-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500">
                          #{row.id_tipo_prod}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-700">{row.nombre}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-700">{new Date(row.fecha_creacion).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setSelectedTipoProd(row);
                              setIsEditing(true);
                            }}
                            className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setConfirmId(row.id_tipo_prod)}
                            className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                            title="Eliminar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-400 font-medium">
                      No se encontraron tipos de productos que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODALES */}
        {isOpen && (
          <Suspense fallback={<Loading />}>
            <TipoProductoForm setIsOpen={setIsOpen} isOpen={isOpen} />
          </Suspense>
        )}

        {isEditing && selectedTipoProd && (
          <Suspense fallback={<Loading />}>
            <UpdateTipoProducto SendValor={selectedTipoProd} SetVer={setIsEditing} />
          </Suspense>
        )}

        {confirmId !== null && (
          <ConfirmDialog
            title="¿Eliminar Tipo de Producto?"
            message="Esta acción desactivará este tipo de producto del sistema. ¿Deseas continuar?"
            confirmLabel={deleting ? "Eliminando..." : "Sí, eliminar"}
            cancelLabel="Cancelar"
            onConfirm={() => deleteMutate(confirmId)}
            onCancel={() => setConfirmId(null)}
          />
        )}
      </div>
    </div>
  );
}

// Subcomponente de Diálogo de Confirmación con el estilo de Presentacion.tsx
function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel, cancelLabel }: any) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-100">
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 leading-relaxed">{message}</p>
        </div>
        <div className="bg-gray-50 p-4 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}