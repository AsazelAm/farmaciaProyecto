import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useMemo, useState } from "react";
import Loading from "../../../../Helpers/Loading";
import { toast } from "react-toastify";
import { GetProveedorApi, DeleteProveedorApi } from "../../../../Api/ProveedorApi";
import type { UpdateProveedor } from "../../../../types";

// ─── Lazy loading de modales (igual que en Presentacion.tsx) ─────────────────
const ProveedorForm = lazy(() => import("../../../../Components/Proveedor/ProveedorForm"));
const UpdateProveedorr = lazy(() => import("../../../../Components/Proveedor/UpdateProveedorr"));

// ─── Paleta de colores (MISMA que Presentacion.tsx) ─────────────────────────
const COLORS = {
  dark:   "#4A1A6E",
  medium: "#7B3FA0",
  light:  "#F3EBF9",
  border: "#D8B4F0",
};

// ─── Tipos de proveedor con su significado ───────────────────────────────────
// LB = Laboratorios Farmacéuticos (quienes fabrican)
// DI = Distribuidoras / Droguerías (quienes comercializan múltiples marcas)
// IM = Importadoras médicas
// GE = Proveedores de insumos generales o de limpieza
type TipoFiltro = "ALL" | "LB" | "DI" | "IM" | "GE";

const TIPO_CONFIG: Record<
  Exclude<TipoFiltro, "ALL">,
  { label: string; desc: string; bg: string; color: string; dot: string }
> = {
  LB: { label: "LB",  desc: "Laboratorios Farmacéuticos",   bg: "#EFF6FF", color: "#1d4ed8", dot: "#3b82f6" },
  DI: { label: "DI",  desc: "Distribuidoras / Droguerías",  bg: "#FFFBEB", color: "#b45309", dot: "#f59e0b" },
  IM: { label: "IM",  desc: "Importadoras médicas",    bg: "#ECFDF5", color: "#065f46", dot: "#10b981" },
  GE: { label: "GE",  desc: "Proveedores de insumos generales o de limpieza",   bg: "#F5F3FF", color: "#5b21b6", dot: "#8b5cf6" },
};

// ─── Componente principal ────────────────────────────────────────────────────
export default function Proveedor() {
  const queryClient = useQueryClient();

  // Estados de control del componente
  const [isOpen, setIsOpen] = useState(false);               // Abre modal de creación
  const [isEditing, setIsEditing] = useState(false);         // Abre modal de edición
  const [selectedProveedor, setSelectedProveedor] = useState<UpdateProveedor | null>(null);
  const [search, setSearch] = useState("");                  // Texto del buscador
  const [confirmId, setConfirmId] = useState<number | null>(null); // ID pendiente de eliminar
  const [tipoFiltro,] = useState<TipoFiltro>("ALL"); // Filtro activo

  // ── Obtención de datos desde el servidor ──────────────────────────────────
  // useQuery guarda el resultado en caché con la clave "ProveedorAll".
  // Mientras carga, isLoading = true → mostramos el spinner <Loading />.
  const { data: rows, isLoading } = useQuery({
    queryKey: ["ProveedorAll"],
    queryFn: GetProveedorApi,
  });

  // ── Mutación para eliminar ────────────────────────────────────────────────
  // useMutation no ejecuta la función hasta que se llama a runDelete(id).
  // isPending se vuelve true mientras la petición está en curso → usamos
  // este flag para deshabilitar el botón de confirmar y mostrar "Eliminando..."
  const { mutate: runDelete, isPending: deleting } = useMutation({
    mutationFn: DeleteProveedorApi,
    onSuccess: (data) => {
      // Invalidar la caché fuerza un re-fetch automático de la lista
      queryClient.invalidateQueries({ queryKey: ["ProveedorAll"] });
      toast.success(data);
      setConfirmId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // ── Lógica del buscador + filtro por tipo (useMemo) ───────────────────────
  // useMemo recalcula solo cuando cambian rows, search o tipoFiltro.
  // Esto evita filtrar el array en cada re-render innecesario.
  const filteredRows = useMemo(() => {
    // Garantizamos que "list" siempre sea un array aunque rows sea undefined
    const list: UpdateProveedor[] = Array.isArray(rows) ? rows : [];

    // 1. Filtro por tipo (LB, DI, IM, GE) — se omite si el filtro es "ALL"
    const byTipo =
      tipoFiltro === "ALL"
        ? list
        : list.filter((r) => r.codigo?.startsWith(tipoFiltro));

    // 2. Filtro por texto (nombre o código)
    const q = search.trim().toLowerCase();
    if (!q) return byTipo;
    return byTipo.filter(
      (r) =>
        String(r.nombre ?? "").toLowerCase().includes(q) ||
        String(r.codigo ?? "").toLowerCase().includes(q)
    );
  }, [rows, search, tipoFiltro]);

  // ── Abrir modal de edición ────────────────────────────────────────────────
  const handleEdit = (proveedor: UpdateProveedor) => {
    setSelectedProveedor(proveedor);
    setIsEditing(true);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="p-6 min-h-screen">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
            {/* Barra de acento de color — igual que en Presentacion.tsx */}
            <span
              className="w-1.5 h-8 rounded-full flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}
            />
            Gestión de Proveedores
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Administra los proveedores registrados en el sistema
          </p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-6 py-3 text-white rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 font-bold text-sm w-full md:w-auto justify-center"
          style={{ backgroundColor: COLORS.dark }}
        >
          {/* Icono "+" en SVG */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Proveedor
        </button>
      </div>

      {/* ── BARRA DE BÚSQUEDA + FILTROS ────────────────────────────────────── */}
      {/* Contenedor blanco con borde de la paleta lila */}
      <div
        className="bg-white rounded-2xl shadow-sm border p-4 mb-6"
        style={{ borderColor: COLORS.border }}
      >
        {/* Fila superior: input + contador */}
        <div className="flex flex-col md:flex-row gap-4 items-center">

          {/* Input de búsqueda con ícono lupa */}
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
              placeholder="Buscar por nombre o código..."
              className="w-full pl-12 pr-10 py-3 rounded-xl border-2 outline-none text-sm transition-colors"
              style={{ borderColor: COLORS.border, color: COLORS.dark }}
            />
            {/* Botón "✕" para limpiar el buscador (solo visible cuando hay texto) */}
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

          {/* Contador de resultados */}
          <div
            className="px-4 py-2 rounded-lg font-semibold border text-sm flex-shrink-0"
            style={{ background: COLORS.light, color: COLORS.dark, borderColor: COLORS.border }}
          >
            {filteredRows.length}{" "}
            {filteredRows.length === 1 ? "Proveedor" : "Proveedores"}
          </div>
        </div>

        {/* ── CHIPS DE FILTRO POR TIPO ─────────────────────────────────────── */}
        {/* Cada chip filtra la tabla por el prefijo del código (LB, DI, IM, GE) */}
        <div className="flex flex-wrap gap-2 mt-3">

          {/* Chips individuales por tipo */}
          {(Object.keys(TIPO_CONFIG) as Exclude<TipoFiltro, "ALL">[]).map((tipo) => {
            const cfg = TIPO_CONFIG[tipo];
            const isActive = tipoFiltro === tipo;
            return (
              <h4
                key={tipo}

                title={`Filtrar solo ${cfg.desc}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all"
                style={{
                  borderColor: isActive ? COLORS.dark : COLORS.border,
                  background:  isActive ? COLORS.dark : "white",
                  color:       isActive ? "white"     : COLORS.dark,
                }}
              >
                {/* Punto de color que identifica el tipo */}
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: isActive ? "white" : cfg.dot }}
                />
                {/* Texto: "LB · Laboratorio" */}
                <span>
                  <strong>{tipo}</strong> · {cfg.desc}
                </span>
              </h4>
            );
          })}
        </div>

      </div>

      {/* ── TABLA ──────────────────────────────────────────────────────────── */}
      <div
        className="bg-white rounded-2xl shadow-lg border overflow-hidden"
        style={{ borderColor: COLORS.border }}
      >
        <div className="overflow-x-auto">
          {/* max-h con scroll interno para que no crezca infinitamente */}
          <div className="max-h-[calc(100vh-360px)] overflow-y-auto">
            <table className="w-full text-left border-collapse">

              {/* ENCABEZADO — sticky para que se quede fijo al hacer scroll vertical */}
              <thead
                className="sticky top-0 z-10 text-white"
                style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}
              >
                <tr>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider w-12 text-center">#</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider">Proveedor</th>
                  
                  {/* Columnas ocultas en pantallas pequeñas con clases responsive */}
                  <th className="hidden md:table-cell px-4 py-4 text-xs font-bold uppercase tracking-wider">Contacto</th>
                  <th className="hidden lg:table-cell px-4 py-4 text-xs font-bold uppercase tracking-wider">Dirección</th>
                  <th className="hidden md:table-cell px-4 py-4 text-xs font-bold uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider w-28 text-center">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-purple-50">

                {/* ── ESTADO VACÍO ─────────────────────────────────────────── */}
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
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <p className="font-medium" style={{ color: COLORS.dark }}>
                          No se encontraron proveedores
                        </p>
                        <p className="text-sm" style={{ color: COLORS.medium }}>
                          {search
                            ? "Intenta con otros términos de búsqueda"
                            : "Comienza registrando el primer proveedor"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* ── LISTADO DE FILAS ──────────────────────────────────────── */}
                {filteredRows.map((row, index) => {
                 
                

                  return (
                    <tr
                      key={row.idProveedor ?? index}
                      className="hover:bg-purple-50/40 transition-colors"
                    >
                      {/* NRO */}
                      <td
                        className="px-4 py-4 text-center font-semibold text-sm"
                        style={{ color: COLORS.medium }}
                      >
                        {index + 1}
                      </td>

                      {/* NOMBRE + CÓDIGO con avatar de inicial */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar circular con gradiente y primera letra */}
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}
                          >
                            {String(row.nombre ?? "P")[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-sm" style={{ color: "#2D0A47" }}>
                              {row.nombre}
                            </div>
                            {/* Código visible solo en pantallas medianas+ */}
                            <div className="hidden md:block text-xs text-gray-400 mt-0.5">
                              {row.codigo}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* CONTACTO — oculto en móvil */}
                      <td className="hidden md:table-cell px-4 py-4 text-sm text-gray-500">
                        <div>{row.telefono ?? "—"}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {row.contactoPrincipal ?? "Sin contacto"}
                        </div>
                      </td>

                      {/* DIRECCIÓN — oculto en pantallas menores a lg */}
                      <td className="hidden lg:table-cell px-4 py-4 text-sm text-gray-500">
                        {row.direccion ?? "—"}
                      </td>

                      {/* FECHA — formato largo en español */}
                      <td className="hidden md:table-cell px-4 py-4 text-sm font-medium text-gray-500">
                        {new Date(row.fechaCreacion).toLocaleDateString("es-ES", {
                          day:   "2-digit",
                          month: "long",
                          year:  "numeric",
                        })}
                      </td>

                      {/* ACCIONES: editar + eliminar */}
                      <td className="px-4 py-4">
                        <div className="flex justify-center items-center gap-2">
                          {/* Botón editar */}
                          <button
                            onClick={() => handleEdit(row)}
                            title="Editar proveedor"
                            className="p-2 rounded-lg transition-colors hover:bg-purple-100"
                            style={{ color: COLORS.dark }}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          {/* Botón eliminar — abre el ConfirmDialog */}
                          <button
                            onClick={() => setConfirmId(row.idProveedor)}
                            title="Eliminar proveedor"
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

      {/* ── MODALES con Suspense (igual que Presentacion.tsx) ──────────────── */}
      {/* Suspense muestra <Loading /> mientras se carga el componente lazy */}
      <Suspense fallback={<Loading />}>
        {isOpen && (
          <ProveedorForm setIsOpen={setIsOpen} isOpen={isOpen} />
        )}
        {isEditing && (
          <UpdateProveedorr SendValor={selectedProveedor} SetVer={setIsEditing} />
        )}
      </Suspense>

      {/* ── DIÁLOGO DE CONFIRMACIÓN DE ELIMINACIÓN ─────────────────────────── */}
      {/* Solo se renderiza cuando confirmId tiene un valor (≠ null) */}
      {confirmId !== null && (
        <ConfirmDialog
          title="¿Eliminar Proveedor?"
          message="Esta acción desactivará el proveedor. Podrás reactivarlo desde la base de datos si es necesario."
          confirmLabel={deleting ? "Eliminando..." : "Sí, eliminar"}
          onConfirm={() => runDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
          disabled={deleting}
        />
      )}
    </div>
  );
}

// ─── Sub-componente: diálogo de confirmación ─────────────────────────────────
// Props tipadas explícitamente para mayor claridad
function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  disabled = false,
}: {
  title:          string;
  message:        string;
  confirmLabel?:  string;
  onConfirm:      () => void;
  onCancel:       () => void;
  disabled?:      boolean;
}) {
  return (
    // Overlay fijo que cubre toda la pantalla (z-50 = encima de todo)
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo oscuro con blur — click cierra el diálogo */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Tarjeta del diálogo (relative para estar sobre el overlay) */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-100">
        <div className="p-6 text-center">
          {/* Ícono de advertencia */}
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 leading-relaxed">{message}</p>
        </div>

        {/* Botones: Cancelar (gris) + Confirmar (rojo) */}
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