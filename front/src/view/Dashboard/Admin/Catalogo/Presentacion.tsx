import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useMemo, useState } from "react";
import Loading from "../../../../Helpers/Loading";
import { toast } from "react-toastify";
import { GetPresentaApi, DeletePresentaApi } from "../../../../Api/PresentacionApi";
import type { UpdatePresenta } from "../../../../types";

// Lazy loading de componentes secundarios
const PresentacionForm = lazy(() => import("../../../../Components/Presentacion/PresentacionForm"));
const UpdatePresentacion = lazy(() => import("../../../../Components/Presentacion/UpdatePresentacion"));

// Paleta de colores lila del archivo TipoUs
const COLORS = {
  dark: "#4A1A6E",
  medium: "#7B3FA0",
  light: "#F3EBF9",
  border: "#D8B4F0",
  text: "#4A1A6E"
};

export default function Presentacion() {
  const queryClient = useQueryClient();

  // Estados de control
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPresenta, setSelectedPresenta] = useState<UpdatePresenta | null>(null);
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);

  // Obtención de datos
  const { data: rows, isLoading } = useQuery({
    queryKey: ["PresentaAll"],
    queryFn: GetPresentaApi,
  });

  // Mutación para eliminar
  const { mutate: runDelete, isPending: deleting } = useMutation({
    mutationFn: DeletePresentaApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["PresentaAll"] });
      toast.success(data);
      setConfirmId(null);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  // Lógica del Buscador
  const filteredRows = useMemo(() => {
    if (!rows) return [];
    if (!search) return rows;
    return rows.filter((row) =>
      row.nombre.toLowerCase().includes(search.toLowerCase())
    );
  }, [rows, search]);

  const handleEdit = (presenta: UpdatePresenta) => {
    setSelectedPresenta(presenta);
    setIsEditing(true);
  };

  const handleDelete = (id: number) => {
    setConfirmId(id);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-8 rounded-full" style={{ backgroundColor: COLORS.medium }}></span>
            Gestión de Presentaciones
          </h1>
          <p className="text-gray-500 mt-1">Administra los formatos y presentaciones de tus productos</p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-6 py-3 text-white rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 font-bold"
          style={{ backgroundColor: COLORS.dark }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Presentación
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar presentación por nombre..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 transition-all"
            style={{ "--tw-focus-ring-color": COLORS.medium } as any}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ backgroundColor: COLORS.light }}>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider" style={{ color: COLORS.dark }}>ID</th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider" style={{ color: COLORS.dark }}>Nombre</th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider" style={{ color: COLORS.dark }}>Fecha Creación</th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-center" style={{ color: COLORS.dark }}>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRows.map((row) => (
                <tr key={row.id_presentacion} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-600">#{row.id_presentacion}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-800">{row.nombre}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(row.fecha_creacion).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleEdit(row)}
                        className="p-2 rounded-lg transition-colors hover:bg-blue-50 text-blue-600"
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(row.id_presentacion)}
                        className="p-2 rounded-lg transition-colors hover:bg-red-50 text-red-600"
                        title="Eliminar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRows.length === 0 && (
          <div className="py-12 text-center text-gray-400 font-medium">
            No se encontraron presentaciones que coincidan con la búsqueda.
          </div>
        )}
      </div>

      {/* MODALES */}
      <Suspense fallback={<Loading />}>
        {isOpen && (
          <PresentacionForm setIsOpen={setIsOpen} isOpen={isOpen} />
        )}

        {isEditing && (
          <UpdatePresentacion SendValor={selectedPresenta} SetVer={setIsEditing} />
        )}
      </Suspense>

      {/* DIALOGO DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {confirmId !== null && (
        <ConfirmDialog
          title="¿Eliminar Presentación?"
          message="Esta acción desactivará la presentación. Podrás reactivarla después desde la base de datos si es necesario."
          confirmLabel={deleting ? "Eliminando..." : "Sí, eliminar"}
          onConfirm={() => runDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}

// Sub-componente interno para confirmación (Mismo estilo que TipoUs)
function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
        <div className="p-4 bg-gray-50 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-white transition-all shadow-lg hover:brightness-110"
            style={{ backgroundColor: "#ef4444" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}