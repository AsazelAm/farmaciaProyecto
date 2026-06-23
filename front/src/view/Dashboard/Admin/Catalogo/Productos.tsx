import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useMemo, useState } from "react";
import Loading from "../../../../Helpers/Loading";
import { toast } from "react-toastify";
import { GetProductoApi, DeleteProductoApi } from "../../../../Api/ProductoApi";
import type { UpdateProducto } from "../../../../types";
import BarcodeRenderer from "../../../../Components/Barcode/BarcodeRenderer";

// ── Lazy loading de modales ────────────────────────────────────────────────────
const ProductoForm      = lazy(() => import("../../../../Components/Producto/ProductoForm"));
const UpdateProductoModal = lazy(() => import("../../../../Components/Producto/UpdateProducto"));

// ── Paleta (idéntica a Proveedor) ─────────────────────────────────────────────
const COLORS = {
  dark:   "#4A1A6E",
  medium: "#7B3FA0",
  light:  "#F3EBF9",
  border: "#D8B4F0",
};

// ── Helper: URL pública de imagen ─────────────────────────────────────────────
const toPublicUrl = (ruta: string | null | undefined) => {
  if (!ruta) return null;
  const base = import.meta.env.VITE_API_URL?.replace('/api', '') ?? '';
  return `${base}/${ruta.replace(/^\.\//,"").replace(/\\\\/g, "/")}`;
};

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function Productos() {
  const queryClient = useQueryClient();

  const [isOpen,    setIsOpen]    = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selected,  setSelected]  = useState<UpdateProducto | null>(null);
  const [search,    setSearch]    = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);

  // ── Fetch de productos ────────────────────────────────────────────────────
  const { data: rows, isLoading } = useQuery({
    queryKey: ["ProductoAll"],
    queryFn:  GetProductoApi,
  });

  // ── Mutación de eliminar ──────────────────────────────────────────────────
  const { mutate: runDelete, isPending: deleting } = useMutation({
    mutationFn: DeleteProductoApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ProductoAll"] });
      toast.success(data);
      setConfirmId(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // ── Buscador ──────────────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    const list: UpdateProducto[] = Array.isArray(rows) ? (rows as any) : [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (r) =>
        String(r.nombreGenerico ?? "").toLowerCase().includes(q) ||
        String(r.nombreComercial ?? "").toLowerCase().includes(q) ||
        String(r.codigoBarra ?? "").toLowerCase().includes(q) ||
        String(r.nombreLaboratorio ?? "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  const handleEdit = (prod: UpdateProducto) => {
    setSelected(prod);
    setIsEditing(true);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="p-6 min-h-screen">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
            <span
              className="w-1.5 h-8 rounded-full flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}
            />
            Gestión de Productos
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Administra el catálogo farmacéutico del sistema
          </p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-6 py-3 text-white rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 font-bold text-sm w-full md:w-auto justify-center"
          style={{ backgroundColor: COLORS.dark }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Producto
        </button>
      </div>

      {/* ── BARRA DE BÚSQUEDA ──────────────────────────────────────────────── */}
      <div
        className="bg-white rounded-2xl shadow-sm border p-4 mb-6"
        style={{ borderColor: COLORS.border }}
      >
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Input de búsqueda */}
          <div className="relative flex-1 w-full">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: COLORS.medium }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre genérico, comercial, código o laboratorio..."
              className="w-full pl-12 pr-10 py-3 rounded-xl border-2 outline-none text-sm transition-colors"
              style={{ borderColor: COLORS.border, color: COLORS.dark }}
            />
            {search && (
              <button
                aria-label="Limpiar búsqueda"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-purple-100 transition-colors text-sm"
                style={{ color: COLORS.medium }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Contador */}
          <div
            className="px-4 py-2 rounded-lg font-semibold border text-sm flex-shrink-0"
            style={{ background: COLORS.light, color: COLORS.dark, borderColor: COLORS.border }}
          >
            {filteredRows.length}{" "}
            {filteredRows.length === 1 ? "Producto" : "Productos"}
          </div>
        </div>
      </div>

      {/* ── TABLA ──────────────────────────────────────────────────────────── */}
      <div
        className="bg-white rounded-2xl shadow-lg border overflow-hidden"
        style={{ borderColor: COLORS.border }}
      >
        <div className="overflow-x-auto">
          <div className="max-h-[calc(100vh-360px)] overflow-y-auto">
            <table className="w-full text-left border-collapse">

              {/* ENCABEZADO */}
              <thead
                className="sticky top-0 z-10 text-white"
                style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}
              >
                <tr>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider w-12 text-center">#</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider">Producto</th>
                  <th className="hidden md:table-cell px-4 py-4 text-xs font-bold uppercase tracking-wider">Código / Tipo</th>
                  <th className="hidden lg:table-cell px-4 py-4 text-xs font-bold uppercase tracking-wider">Laboratorio</th>
                  <th className="hidden md:table-cell px-4 py-4 text-xs font-bold uppercase tracking-wider text-center">Precio</th>
                  <th className="hidden lg:table-cell px-4 py-4 text-xs font-bold uppercase tracking-wider text-center">Receta</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider w-28 text-center">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-purple-50">

                {/* ESTADO VACÍO */}
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center"
                          style={{ background: COLORS.light }}
                        >
                          <svg
                            className="w-10 h-10"
                            style={{ color: COLORS.border }}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <p className="font-medium" style={{ color: COLORS.dark }}>
                          No se encontraron productos
                        </p>
                        <p className="text-sm" style={{ color: COLORS.medium }}>
                          {search
                            ? "Intenta con otros términos de búsqueda"
                            : "Comienza registrando el primer producto"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* FILAS */}
                {filteredRows.map((row: any, index: number) => {
                  const imgUrl = toPublicUrl(row.img);
                  const inicial = String(row.nombreGenerico ?? "P")[0].toUpperCase();

                  return (
                    <tr
                      key={row.idProducto ?? index}
                      className="hover:bg-purple-50/40 transition-colors"
                    >
                      {/* NRO */}
                      <td className="px-4 py-4 text-center font-semibold text-sm" style={{ color: COLORS.medium }}>
                        {index + 1}
                      </td>

                      {/* PRODUCTO: avatar + nombre genérico + comercial */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar / imagen */}
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={row.nombreGenerico}
                              className="w-10 h-10 rounded-xl object-cover shadow-sm flex-shrink-0"
                            />
                          ) : (
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm"
                              style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}
                            >
                              {inicial}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-sm" style={{ color: "#2D0A47" }}>
                              {row.nombreGenerico}
                            </div>
                            {row.nombreComercial && (
                              <div className="text-xs text-gray-400 mt-0.5">{row.nombreComercial}</div>
                            )}
                            {row.concentracion && (
                              <span
                                className="inline-block text-xs px-1.5 py-0.5 rounded-full font-semibold mt-0.5"
                                style={{ background: COLORS.light, color: COLORS.medium }}
                              >
                                {row.concentracion}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* CÓDIGO / TIPO */}
                      <td className="hidden md:table-cell px-4 py-4 text-sm text-gray-500">
                        <div className="flex flex-col gap-1 items-start">
                          <div className="font-mono text-[11px] font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">{row.codigoBarra}</div>
                          <BarcodeRenderer value={row.codigoBarra} width={1.1} height={22} displayValue={false} />
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {row.nombreTipoProd ?? "—"} · {row.nombrePresentacion ?? "—"}
                        </div>
                      </td>

                      {/* LABORATORIO */}
                      <td className="hidden lg:table-cell px-4 py-4 text-sm text-gray-600">
                        {row.nombreLaboratorio ?? "—"}
                      </td>

                      {/* PRECIO */}
                      <td className="hidden md:table-cell px-4 py-4 text-center">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-sm font-bold"
                          style={{ background: COLORS.light, color: COLORS.dark }}
                        >
                          Bs. {Number(row.precio).toFixed(2)}
                        </span>
                      </td>

                      {/* RECETA */}
                      <td className="hidden lg:table-cell px-4 py-4 text-center">
                        {Number(row.requiereReceta) === 1 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Con receta
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                            Libre venta
                          </span>
                        )}
                      </td>

                      {/* ACCIONES */}
                      <td className="px-4 py-4">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleEdit(row)}
                            title="Editar producto"
                            className="p-2 rounded-lg transition-colors hover:bg-purple-100"
                            style={{ color: COLORS.dark }}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setConfirmId(row.idProducto)}
                            title="Eliminar producto"
                            className="p-2 rounded-lg transition-colors text-red-500 hover:bg-red-50 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── MODALES ─────────────────────────────────────────────────────────── */}
      <Suspense fallback={<Loading />}>
        {isOpen && (
          <ProductoForm setIsOpen={setIsOpen} isOpen={isOpen} />
        )}
        {isEditing && (
          <UpdateProductoModal SendValor={selected} SetVer={setIsEditing} />
        )}
      </Suspense>

      {/* ── CONFIRM DIALOG ─────────────────────────────────────────────────── */}
      {confirmId !== null && (
        <ConfirmDialog
          title="¿Eliminar Producto?"
          message="Esta acción desactivará el producto del catálogo. Podrás reactivarlo desde la base de datos si es necesario."
          confirmLabel={deleting ? "Eliminando..." : "Sí, eliminar"}
          onConfirm={() => runDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
          disabled={deleting}
        />
      )}
    </div>
  );
}

// ─── Sub-componente: diálogo de confirmación ──────────────────────────────────
function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  disabled = false,
}: {
  title:         string;
  message:       string;
  confirmLabel?: string;
  onConfirm:     () => void;
  onCancel:      () => void;
  disabled?:     boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-100">
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
            disabled={disabled}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-white transition-all shadow-lg hover:brightness-110 disabled:opacity-60"
            style={{ backgroundColor: "#ef4444" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}