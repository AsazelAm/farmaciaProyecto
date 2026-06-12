import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useMemo, useState } from "react";
import Loading from "../../../../Helpers/Loading";
import { toast } from "react-toastify";
import { GetClienteApi, DeleteClienteApi } from "../../../../Api/ClienteApi";
import type { UpdateCliente } from "../../../../types";
// ─── Lazy loading de modales ──────────────────────────────────────────────────
const ClienteForm      = lazy(() => import("../../../../Components/Cliente/ClienteForm"));
const UpdateClienteModal = lazy(() => import("../../../../Components/Cliente/UpdateCliente"));
// ─── Paleta de colores (MISMA que Proveedor.tsx) ─────────────────────────────
const COLORS = {
  dark:   "#4A1A6E",
  medium: "#7B3FA0",
  light:  "#F3EBF9",
  border: "#D8B4F0",
};
// ─── Tipos de cliente con su significado ─────────────────────────────────────
// MR = Cliente mayorista / recurrente
// MI = Minorista / consumidor final
// IN = Institucional (clínicas, hospitales)
// CF = Cliente frecuente con beneficios
type TipoFiltro = "ALL" | "MR" | "MI" | "IN" | "CF";
const TIPO_CONFIG: Record<
  Exclude<TipoFiltro, "ALL">,
  { label: string; desc: string; bg: string; color: string; dot: string }
> = {
  MR: { label: "MR", desc: "Mayorista / Recurrente",  bg: "#EFF6FF", color: "#1d4ed8", dot: "#3b82f6" },
  MI: { label: "MI", desc: "Minorista / Consumidor",  bg: "#FFFBEB", color: "#b45309", dot: "#f59e0b" },
  IN: { label: "IN", desc: "Institucional",           bg: "#ECFDF5", color: "#065f46", dot: "#10b981" },
  CF: { label: "CF", desc: "Cliente Frecuente",       bg: "#F5F3FF", color: "#5b21b6", dot: "#8b5cf6" },
};
// ─── Componente principal ─────────────────────────────────────────────────────
export default function Cliente() {
  const queryClient = useQueryClient();
  // Estados de control del componente
  const [isOpen,           setIsOpen]           = useState(false);
  const [isEditing,        setIsEditing]        = useState(false);
  const [selectedCliente,  setSelectedCliente]  = useState<UpdateCliente | null>(null);
  const [search,           setSearch]           = useState("");
  const [confirmId,        setConfirmId]        = useState<number | null>(null);
  const [tipoFiltro]                            = useState<TipoFiltro>("ALL");
  // ── Obtención de datos ────────────────────────────────────────────────────
  const { data: rows, isLoading } = useQuery({
    queryKey: ["ClienteAll"],
    queryFn:  GetClienteApi,
  });
  // ── Mutación para eliminar ────────────────────────────────────────────────
  const { mutate: runDelete, isPending: deleting } = useMutation({
    mutationFn: DeleteClienteApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ClienteAll"] });
      toast.success(data);
      setConfirmId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
  // ── Buscador (useMemo) ────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    const list: UpdateCliente[] = Array.isArray(rows) ? rows : [];
    // Filtro por tipo (se aplica solo si no es ALL y el cliente tiene CI con prefijo)
    const byTipo =
      tipoFiltro === "ALL"
        ? list
        : list.filter((r) => r.ci?.startsWith(tipoFiltro));
    const q = search.trim().toLowerCase();
    if (!q) return byTipo;
    return byTipo.filter(
      (r) =>
        String(r.nombre   ?? "").toLowerCase().includes(q) ||
        String(r.apellido ?? "").toLowerCase().includes(q) ||
        String(r.ci       ?? "").toLowerCase().includes(q) ||
        String(r.telefono ?? "").toLowerCase().includes(q) ||
        String(r.email    ?? "").toLowerCase().includes(q)
    );
  }, [rows, search, tipoFiltro]);
  // ── Abrir modal de edición ────────────────────────────────────────────────
  const handleEdit = (cliente: UpdateCliente) => {
    setSelectedCliente(cliente);
    setIsEditing(true);
  };
  if (isLoading) return <Loading />;
  return (
    <div className="p-6 min-h-screen">
      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
            {/* Barra de acento de color */}
            <span
              className="w-1.5 h-8 rounded-full flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}
            />
            Gestión de Clientes
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Administra los clientes registrados en el sistema
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
          Nuevo Cliente
        </button>
      </div>
      {/* ── BARRA DE BÚSQUEDA ────────────────────────────────────────────────── */}
      <div
        className="bg-white rounded-2xl shadow-sm border p-4 mb-6"
        style={{ borderColor: COLORS.border }}
      >
        {/* Fila: input + contador */}
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
              placeholder="Buscar por nombre, apellido, CI o email..."
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
          {/* Contador de resultados */}
          <div
            className="px-4 py-2 rounded-lg font-semibold border text-sm flex-shrink-0"
            style={{ background: COLORS.light, color: COLORS.dark, borderColor: COLORS.border }}
          >
            {filteredRows.length}{" "}
            {filteredRows.length === 1 ? "Cliente" : "Clientes"}
          </div>
        </div>
        {/* ── CHIPS DE CATEGORÍAS (decorativos, sin filtro activo) ────────────── */}
        <div className="flex flex-wrap gap-2 mt-3">
          {(Object.keys(TIPO_CONFIG) as Exclude<TipoFiltro, "ALL">[]).map((tipo) => {
            const cfg = TIPO_CONFIG[tipo];
            const isActive = tipoFiltro === tipo;
            return (
              <h4
                key={tipo}
                title={`Referencia: ${cfg.desc}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all"
                style={{
                  borderColor: isActive ? COLORS.dark : COLORS.border,
                  background:  isActive ? COLORS.dark : "white",
                  color:       isActive ? "white"     : COLORS.dark,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: isActive ? "white" : cfg.dot }}
                />
                <span>
                  <strong>{tipo}</strong> · {cfg.desc}
                </span>
              </h4>
            );
          })}
        </div>
      </div>
      {/* ── TABLA ───────────────────────────────────────────────────────────── */}
      <div
        className="bg-white rounded-2xl shadow-lg border overflow-hidden"
        style={{ borderColor: COLORS.border }}
      >
        <div className="overflow-x-auto">
          <div className="max-h-[calc(100vh-360px)] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              {/* ENCABEZADO sticky */}
              <thead
                className="sticky top-0 z-10 text-white"
                style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}
              >
                <tr>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider w-12 text-center">#</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider">Cliente</th>
                  <th className="hidden md:table-cell px-4 py-4 text-xs font-bold uppercase tracking-wider">CI</th>
                  <th className="hidden md:table-cell px-4 py-4 text-xs font-bold uppercase tracking-wider">Contacto</th>
                  <th className="hidden lg:table-cell px-4 py-4 text-xs font-bold uppercase tracking-wider">Email</th>
                  <th className="hidden md:table-cell px-4 py-4 text-xs font-bold uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider w-28 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                {/* ── ESTADO VACÍO ──────────────────────────────────────────── */}
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
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <p className="font-medium" style={{ color: COLORS.dark }}>
                          No se encontraron clientes
                        </p>
                        <p className="text-sm" style={{ color: COLORS.medium }}>
                          {search
                            ? "Intenta con otros términos de búsqueda"
                            : "Comienza registrando el primer cliente"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
                {/* ── LISTADO DE FILAS ─────────────────────────────────────── */}
                {filteredRows.map((row, index) => (
                  <tr
                    key={row.idCliente ?? index}
                    className="hover:bg-purple-50/40 transition-colors"
                  >
                    {/* NRO */}
                    <td
                      className="px-4 py-4 text-center font-semibold text-sm"
                      style={{ color: COLORS.medium }}
                    >
                      {index + 1}
                    </td>
                    {/* NOMBRE + APELLIDO con avatar de inicial */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar circular con gradiente y primera letra */}
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}
                        >
                          {String(row.nombre ?? "C")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-sm" style={{ color: "#2D0A47" }}>
                            {row.nombre}{row.apellido ? ` ${row.apellido}` : ""}
                          </div>
                          {/* Email visible solo en pantallas medianas+ si hay apellido */}
                          <div className="hidden md:block text-xs text-gray-400 mt-0.5">
                            {row.email ?? "Sin correo"}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* CI — oculto en móvil */}
                    <td className="hidden md:table-cell px-4 py-4 text-sm text-gray-500">
                      {row.ci ? (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: COLORS.light, color: COLORS.dark }}
                        >
                          {row.ci}
                        </span>
                      ) : (
                        <span className="text-gray-300 italic text-xs">Sin CI</span>
                      )}
                    </td>
                    {/* CONTACTO (teléfono) — oculto en móvil */}
                    <td className="hidden md:table-cell px-4 py-4 text-sm text-gray-500">
                      {row.telefono ?? "—"}
                    </td>
                    {/* EMAIL — oculto en pantallas menores a lg */}
                    <td className="hidden lg:table-cell px-4 py-4 text-sm text-gray-500">
                      {row.email ?? "—"}
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
                          title="Editar cliente"
                          className="p-2 rounded-lg transition-colors hover:bg-purple-100"
                          style={{ color: COLORS.dark }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {/* Botón eliminar */}
                        <button
                          onClick={() => setConfirmId(row.idCliente)}
                          title="Eliminar cliente"
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* ── MODALES con Suspense ──────────────────────────────────────────────── */}
      <Suspense fallback={<Loading />}>
        {isOpen && (
          <ClienteForm setIsOpen={setIsOpen} isOpen={isOpen} />
        )}
        {isEditing && (
          <UpdateClienteModal SendValor={selectedCliente} SetVer={setIsEditing} />
        )}
      </Suspense>
      {/* ── DIÁLOGO DE CONFIRMACIÓN DE ELIMINACIÓN ─────────────────────────── */}
      {confirmId !== null && (
        <ConfirmDialog
          title="¿Eliminar Cliente?"
          message="Esta acción desactivará el cliente. Podrás reactivarlo desde la base de datos si es necesario."
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo oscuro con blur */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Tarjeta del diálogo */}
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
        {/* Botones: Cancelar + Confirmar */}
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