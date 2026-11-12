import { useMemo, useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Loading from "../../../../Helpers/Loading";
import {
  GetDevolucionesVentaApi,
  GetDevolucionesProveedorApi,
  GetDevolucionVentaByIdApi,
  GetDevolucionProveedorByIdApi,
  AddDevolucionVentaApi,
  AddDevolucionProveedorApi,
  ResolverDevolucionVentaApi,
  ResolverDevolucionProveedorApi,
} from "../../../../Api/DevolucionApi";
import { GetVentasApi, GetVentaByIdApi } from "../../../../Api/VentaApi";
import { GetComprasApi, GetCompraByIdApi } from "../../../../Api/CompraLoteApi";
import type {
  DevVentaListItemType,
  DevProveedorListItemType,
  DevVentaType,
  DevProveedorType,
  EstadoDevVenta,
  EstadoDevProveedor,
  MotivoDevVenta,
  MotivoDevProveedor,
  DestinoDevVenta,
  VentaType,
  CompraType,
  CreateDevVentaType,
  CreateDevProveedorType,
  ResolverDevVentaType,
  ResolverDevProveedorType,
} from "../../../../types";

// ─── Paleta del proyecto (sin cambios) ────────────────────────────────────────
const COLORS = {
  dark: "#4A1A6E",
  medium: "#7B3FA0",
  light: "#F3EBF9",
  border: "#D8B4F0",
  bgCard: "#FFFFFF",
  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
} as const;

// Colores de apoyo que ya usabas en las otras pantallas
const SURFACE = "#FBF8FE";
const ERROR_COLOR = "#EF4444";
const GRADIENT = `linear-gradient(135deg, ${COLORS.dark}, ${COLORS.medium})`;

// ─── Etiquetas ────────────────────────────────────────────────────────────────
const MOTIVO_VENTA: Record<MotivoDevVenta, string> = {
  error_dispensacion: "Error de dispensación",
  reaccion_adversa: "Reacción adversa",
  producto_danado: "Producto dañado",
  producto_vencido: "Producto vencido",
  receta_invalida: "Receta inválida",
  arrepentimiento: "Arrepentimiento",
  otro: "Otro",
};

const MOTIVO_PROVEEDOR: Record<MotivoDevProveedor, string> = {
  producto_danado: "Producto dañado",
  empaque_danado: "Empaque dañado",
  vencimiento_corto: "Vencimiento corto",
  producto_vencido: "Producto vencido",
  cantidad_incorrecta: "Cantidad incorrecta",
  reclamo_clientes: "Reclamo de clientes",
  otro: "Otro",
};

const DESTINO: Record<DestinoDevVenta, string> = {
  reingreso_stock: "Reingreso a stock",
  merma: "Merma",
  cuarentena: "Cuarentena",
};

const ESTADO_VENTA: Record<EstadoDevVenta, { label: string; bg: string; color: string }> = {
  solicitada: { label: "Solicitada", bg: "#FEF3C7", color: "#D97706" },
  aprobada: { label: "Aprobada", bg: "#DBEAFE", color: "#2563EB" },
  rechazada: { label: "Rechazada", bg: "#FEE2E2", color: "#DC2626" },
  completada: { label: "Completada", bg: "#D1FAE5", color: "#059669" },
};

const ESTADO_PROVEEDOR: Record<EstadoDevProveedor, { label: string; bg: string; color: string }> = {
  solicitada: { label: "Solicitada", bg: "#FEF3C7", color: "#D97706" },
  aceptada: { label: "Aceptada", bg: "#DBEAFE", color: "#2563EB" },
  rechazada: { label: "Rechazada", bg: "#FEE2E2", color: "#DC2626" },
  completada: { label: "Completada", bg: "#D1FAE5", color: "#059669" },
};

const numFmt = new Intl.NumberFormat("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatBOB = (v: number) => `Bs ${numFmt.format(v || 0)}`;
const dateFmt = new Intl.DateTimeFormat("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" });
const formatFecha = (s?: string | null) => (s ? dateFmt.format(new Date(s)) : "—");

// ═════════════════════════════════════════════════════════════════════════════
//  PIEZAS VISUALES REUTILIZABLES (solo presentación)
// ═════════════════════════════════════════════════════════════════════════════
const Icon = ({ d, className = "w-5 h-5" }: { d: string; className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

const ICONS = {
  plus: "M12 4v16m8-8H4",
  close: "M6 18L18 6M6 6l12 12",
  down: "M19 9l-7 7-7-7",
  undo: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6",
  inbox:
    "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4",
  eye: "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
};

// Clases compartidas
const inputCls =
  "w-full rounded-xl border-2 bg-white px-3.5 py-2.5 text-sm font-medium outline-none transition-all " +
  "placeholder:text-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100";
const inputStyle = { borderColor: COLORS.border, color: COLORS.textPrimary } as const;

// Input / select pequeño para dentro de las tablas de los modales
const cellInputCls =
  "rounded-lg border-2 bg-white px-2 py-1 text-xs font-medium outline-none transition-all " +
  "focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-40";

const btnBase =
  "inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-all " +
  "active:scale-95 disabled:cursor-not-allowed disabled:opacity-50";

function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold" style={{ backgroundColor: bg, color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

// Etiqueta + control (reemplaza los <label> repetidos de cada formulario)
function Field({ label, hint, className = "", children }: { label: string; hint?: string; className?: string; children: ReactNode }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-sm font-semibold" style={{ color: COLORS.dark }}>{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

// Tarjeta blanca con título, para agrupar secciones dentro de los modales
function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: COLORS.border }}>
      {title && <h4 className="mb-3 text-sm font-bold" style={{ color: COLORS.dark }}>{title}</h4>}
      {children}
    </section>
  );
}

// Encabezado de tabla de modal: pegajoso, para que quede fijo al hacer scroll
function Th({ children }: { children: ReactNode }) {
  return (
    <th
      className="sticky top-0 z-10 whitespace-nowrap px-3 py-2.5 text-left text-xs font-bold"
      style={{ background: COLORS.light, color: COLORS.dark, boxShadow: `inset 0 -1px 0 ${COLORS.border}` }}
    >
      {children}
    </th>
  );
}

// Contenedor con scroll para las tablas de líneas dentro de los modales
const tableWrapCls = "max-h-72 overflow-auto rounded-xl border";

// Caja con el monto estimado (reembolso / nota de crédito)
function MontoEstimado({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="mt-3 flex items-center justify-between rounded-xl border px-4 py-3"
      style={{ background: COLORS.light, borderColor: COLORS.border }}
    >
      <span className="text-sm font-semibold" style={{ color: COLORS.medium }}>{label}</span>
      <span className="text-xl font-bold" style={{ color: COLORS.dark }}>{value}</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Página principal
// ══════════════════════════════════════════════════════════════════════════════
export default function Devolucion() {
  const [tab, setTab] = useState<"venta" | "proveedor">("venta");

  return (
    <div className="min-h-screen p-4 text-gray-800 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* ── Encabezado ── */}
        <header
          className="relative mb-5 overflow-hidden rounded-2xl px-6 py-5 text-white shadow-md"
          style={{ background: GRADIENT }}
        >
          <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute right-40 -bottom-14 h-28 w-28 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 shadow-inner">
              <Icon d={ICONS.undo} className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Gestión de devoluciones</h1>
              <p className="mt-0.5 text-xs text-purple-200">
                Registra y resuelve devoluciones de clientes y a proveedores.
              </p>
            </div>
          </div>
        </header>

        {/* ── Pestañas ── */}
        <div
          role="tablist"
          className="mb-5 inline-flex gap-1 rounded-2xl border bg-white p-1 shadow-sm"
          style={{ borderColor: COLORS.border }}
        >
          <TabButton active={tab === "venta"} onClick={() => setTab("venta")}>Devoluciones de venta</TabButton>
          <TabButton active={tab === "proveedor"} onClick={() => setTab("proveedor")}>Devoluciones a proveedor</TabButton>
        </div>

        {tab === "venta" ? <TabVenta /> : <TabProveedor />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="rounded-xl px-4 py-2 text-sm font-bold transition-all"
      style={active ? { background: GRADIENT, color: "#FFFFFF" } : { color: COLORS.medium }}
    >
      {children}
    </button>
  );
}

// ─── Barra de filtro + botón "Nueva devolución" (compartida por las dos pestañas) ───
function BarraFiltros({
  value, onChange, options, count, onNew,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  count: number;
  onNew: () => void;
}) {
  return (
    <div
      className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm"
      style={{ borderColor: COLORS.border }}
    >
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Filtrar por estado"
          className={`${inputCls} cursor-pointer appearance-none pr-10`}
          style={inputStyle}
        >
          <option value="todos">Todos los estados</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon d={ICONS.down} className="h-4 w-4" />
        </div>
      </div>

      <span
        className="rounded-full px-2.5 py-1 text-xs font-semibold"
        style={{ background: COLORS.light, color: COLORS.dark }}
      >
        {count} registro{count !== 1 && "s"}
      </span>

      <button
        onClick={onNew}
        className={`${btnBase} ml-auto text-white shadow-lg hover:scale-[1.03] disabled:hover:scale-100`}
        style={{ background: GRADIENT }}
      >
        <Icon d={ICONS.plus} className="h-4 w-4" />
        Nueva devolución
      </button>
    </div>
  );
}

// Botón "Ver / Resolver" de cada fila
function VerButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border-2 px-3 py-1.5 text-xs font-bold transition-all hover:bg-purple-50 active:scale-95"
      style={{ borderColor: COLORS.border, color: COLORS.dark }}
    >
      <Icon d={ICONS.eye} className="h-3.5 w-3.5" />
      Ver / Resolver
    </button>
  );
}

// Chip pequeño para "total" / "parcial"
function TipoChip({ tipo }: { tipo: string }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-xs font-semibold capitalize"
      style={{ background: COLORS.light, color: COLORS.medium }}
    >
      {tipo}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab: Devoluciones de venta
// ══════════════════════════════════════════════════════════════════════════════
function TabVenta() {
  const queryClient = useQueryClient();
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoDevVenta | "todos">("todos");
  const [showCrear, setShowCrear] = useState(false);
  const [detalleId, setDetalleId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["DevolucionesVenta", estadoFiltro],
    queryFn: () => GetDevolucionesVentaApi({ estado: estadoFiltro === "todos" ? undefined : estadoFiltro, porPagina: 100 }),
  });

  const lista = data?.data ?? [];
  const refrescar = () => {
    queryClient.invalidateQueries({ queryKey: ["DevolucionesVenta"] });
    queryClient.invalidateQueries({ queryKey: ["VentasAll"] });
  };

  return (
    <>
      <BarraFiltros
        value={estadoFiltro}
        onChange={(v) => setEstadoFiltro(v as EstadoDevVenta | "todos")}
        options={(Object.keys(ESTADO_VENTA) as EstadoDevVenta[]).map((e) => ({ value: e, label: ESTADO_VENTA[e].label }))}
        count={lista.length}
        onNew={() => setShowCrear(true)}
      />

      {isLoading ? (
        <Loading />
      ) : (
        <TablaDevoluciones
          rows={lista}
          renderRow={(d: DevVentaListItemType) => (
            <>
              <td className="px-4 py-3 font-bold" style={{ color: COLORS.dark }}>#{d.idDevolucionVenta}</td>
              <td className="px-4 py-3 text-xs">{formatFecha(d.fechaCreacion)}</td>
              <td className="px-4 py-3 text-xs">#{d.idVenta}</td>
              <td className="px-4 py-3 text-sm font-semibold">{d.cliente ?? "—"}</td>
              <td className="px-4 py-3"><TipoChip tipo={d.tipo} /></td>
              <td className="px-4 py-3 text-xs">{MOTIVO_VENTA[d.motivo]}</td>
              <td className="px-4 py-3 text-sm font-bold" style={{ color: COLORS.dark }}>{formatBOB(d.montoReembolso)}</td>
              <td className="px-4 py-3"><Badge {...ESTADO_VENTA[d.estado]} /></td>
              <td className="px-4 py-3">
                <VerButton onClick={() => setDetalleId(d.idDevolucionVenta)} />
              </td>
            </>
          )}
        />
      )}

      {showCrear && (
        <CrearDevVentaModal
          onClose={() => setShowCrear(false)}
          onCreated={() => { setShowCrear(false); refrescar(); }}
        />
      )}
      {detalleId !== null && (
        <DetalleDevVentaModal
          id={detalleId}
          onClose={() => setDetalleId(null)}
          onResolved={() => { setDetalleId(null); refrescar(); }}
        />
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab: Devoluciones a proveedor
// ══════════════════════════════════════════════════════════════════════════════
function TabProveedor() {
  const queryClient = useQueryClient();
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoDevProveedor | "todos">("todos");
  const [showCrear, setShowCrear] = useState(false);
  const [detalleId, setDetalleId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["DevolucionesProveedor", estadoFiltro],
    queryFn: () => GetDevolucionesProveedorApi({ estado: estadoFiltro === "todos" ? undefined : estadoFiltro, porPagina: 100 }),
  });

  const lista = data?.data ?? [];
  const refrescar = () => {
    queryClient.invalidateQueries({ queryKey: ["DevolucionesProveedor"] });
    queryClient.invalidateQueries({ queryKey: ["ComprasAll"] });
    queryClient.invalidateQueries({ queryKey: ["lotes"] });
  };

  return (
    <>
      <BarraFiltros
        value={estadoFiltro}
        onChange={(v) => setEstadoFiltro(v as EstadoDevProveedor | "todos")}
        options={(Object.keys(ESTADO_PROVEEDOR) as EstadoDevProveedor[]).map((e) => ({ value: e, label: ESTADO_PROVEEDOR[e].label }))}
        count={lista.length}
        onNew={() => setShowCrear(true)}
      />

      {isLoading ? (
        <Loading />
      ) : (
        <TablaDevoluciones
          headers={["N°", "Fecha", "Compra", "Proveedor", "Tipo", "Motivo", "Nota crédito", "Estado", "Acciones"]}
          rows={lista}
          renderRow={(d: DevProveedorListItemType) => (
            <>
              <td className="px-4 py-3 font-bold" style={{ color: COLORS.dark }}>#{d.idDevolucionProveedor}</td>
              <td className="px-4 py-3 text-xs">{formatFecha(d.fechaCreacion)}</td>
              <td className="px-4 py-3 text-xs">{d.compraFactura ?? `#${d.idCompra}`}</td>
              <td className="px-4 py-3 text-sm font-semibold">{d.proveedor ?? "—"}</td>
              <td className="px-4 py-3"><TipoChip tipo={d.tipo} /></td>
              <td className="px-4 py-3 text-xs">{MOTIVO_PROVEEDOR[d.motivo]}</td>
              <td className="px-4 py-3 text-sm font-bold" style={{ color: COLORS.dark }}>{formatBOB(d.montoNotaCredito)}</td>
              <td className="px-4 py-3"><Badge {...ESTADO_PROVEEDOR[d.estado]} /></td>
              <td className="px-4 py-3">
                <VerButton onClick={() => setDetalleId(d.idDevolucionProveedor)} />
              </td>
            </>
          )}
        />
      )}

      {showCrear && (
        <CrearDevProveedorModal
          onClose={() => setShowCrear(false)}
          onCreated={() => { setShowCrear(false); refrescar(); }}
        />
      )}
      {detalleId !== null && (
        <DetalleDevProveedorModal
          id={detalleId}
          onClose={() => setDetalleId(null)}
          onResolved={() => { setDetalleId(null); refrescar(); }}
        />
      )}
    </>
  );
}

// ─── Tabla genérica (con SCROLL vertical y encabezado fijo) ───────────────────
function TablaDevoluciones<T>({ headers, rows, renderRow }: {
  headers?: string[];
  rows: T[];
  renderRow: (row: T, index: number) => ReactNode;
}) {
  const cols = headers ?? ["N°", "Fecha", "Venta", "Cliente", "Tipo", "Motivo", "Reembolso", "Estado", "Acciones"];
  return (
    <div
      className="overflow-hidden rounded-2xl border bg-white shadow-sm"
      style={{ borderColor: COLORS.border }}
    >
      {/*
        Este div es el contenedor con scroll:
        - max-h-[calc(100vh-22rem)] : la lista crece hasta ocupar la pantalla y luego hace scroll
        - min-h-[16rem]             : nunca se queda demasiado chica
        - overflow-auto             : scroll vertical Y horizontal si hace falta
      */}
      <div className="max-h-[calc(100vh-22rem)] min-h-[16rem] overflow-auto">
        <table className="w-full min-w-[56rem] text-sm">
          <thead>
            <tr>
              {cols.map((h) => (
                <th
                  key={h}
                  // sticky + top-0: el encabezado se queda fijo arriba mientras se hace scroll.
                  // El fondo va en el <th> (no en el <tr>) para que las filas no se vean por debajo.
                  className="sticky top-0 z-10 whitespace-nowrap px-4 py-3.5 text-left text-xs font-bold"
                  style={{ background: COLORS.light, color: COLORS.dark, boxShadow: `inset 0 -1px 0 ${COLORS.border}` }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={cols.length} className="px-6 py-16">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ background: COLORS.light, color: COLORS.medium }}
                    >
                      <Icon d={ICONS.inbox} className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold" style={{ color: COLORS.dark }}>No se encontraron devoluciones</p>
                    <p className="text-xs" style={{ color: COLORS.textMuted }}>
                      Prueba con otro estado o registra una nueva devolución.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={i}
                  className="transition-colors hover:bg-purple-50/50"
                  style={{ color: COLORS.textPrimary, borderTop: i === 0 ? "none" : `1px solid ${COLORS.light}` }}
                >
                  {renderRow(row, i)}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Modal genérico (header con degradado + footer fijo opcional) ─────────────
function Modal({ title, onClose, children, footer, wide = false }: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl ${wide ? "max-w-4xl" : "max-w-2xl"}`}
        style={{ borderColor: COLORS.border }}
      >
        <div
          className="relative flex flex-shrink-0 items-center justify-between gap-4 overflow-hidden px-5 py-4 text-white"
          style={{ background: GRADIENT }}
        >
          <div className="pointer-events-none absolute -right-6 -top-10 h-32 w-32 rounded-full bg-white/5" />
          <h3 className="relative text-lg font-bold tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="relative flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold transition-colors hover:bg-white/25"
          >
            <Icon d={ICONS.close} className="h-4 w-4" />
            Cerrar
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ background: SURFACE }}>{children}</div>

        {footer && (
          <div className="flex flex-shrink-0 justify-end gap-2 border-t bg-white px-5 py-4" style={{ borderColor: COLORS.border }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Botones del footer de los modales de creación (se reutilizan en ambos)
function FooterCrear({ onClose, onSubmit, disabled, pending }: {
  onClose: () => void; onSubmit: () => void; disabled: boolean; pending: boolean;
}) {
  return (
    <>
      <button
        onClick={onClose}
        className={`${btnBase} border-2 bg-white hover:bg-purple-50`}
        style={{ borderColor: COLORS.border, color: COLORS.dark }}
      >
        Cancelar
      </button>
      <button
        onClick={onSubmit}
        disabled={disabled}
        className={`${btnBase} text-white shadow-lg hover:scale-[1.03] disabled:hover:scale-100`}
        style={{ background: GRADIENT }}
      >
        {pending ? "Registrando..." : "Registrar devolución"}
      </button>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Crear devolución de venta
// ══════════════════════════════════════════════════════════════════════════════
function CrearDevVentaModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [idVenta, setIdVenta] = useState<number | "">("");
  const [tipo, setTipo] = useState<"total" | "parcial">("parcial");
  const [motivo, setMotivo] = useState<MotivoDevVenta>("arrepentimiento");
  const [metodoReembolso, setMetodoReembolso] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [sel, setSel] = useState<Record<number, boolean>>({});
  const [qty, setQty] = useState<Record<number, number>>({});
  const [destino, setDestino] = useState<Record<number, DestinoDevVenta>>({});

  const { data: ventasData } = useQuery({
    queryKey: ["VentasParaDevolucion"],
    queryFn: () => GetVentasApi({ porPagina: 200 }),
  });
  const ventas = useMemo(
    () => (ventasData?.data ?? []).filter((v: VentaType) => ["completado", "devuelto_parcial"].includes(v.estado)),
    [ventasData]
  );

  const { data: venta } = useQuery({
    queryKey: ["VentaDetalle", idVenta],
    queryFn: () => GetVentaByIdApi(idVenta as number),
    enabled: !!idVenta,
  });

  const lineas = useMemo(
    () => (venta?.detalles ?? []).flatMap((d) => (d.idLote == null ? [] : [{ ...d, idLote: d.idLote }])),
    [venta]
  );

  const subtotal = useMemo(
    () => lineas.reduce((acc, d) => (sel[d.idLote] ? acc + (qty[d.idLote] || 0) * d.precioUnitario : acc), 0),
    [lineas, sel, qty]
  );

  const mutation = useMutation({
    mutationFn: (payload: CreateDevVentaType) => AddDevolucionVentaApi(payload),
    onSuccess: onCreated,
    onError: (e: Error) => alert(e.message),
  });

  const submit = () => {
    if (!venta || !idVenta) return;
    const detalles = lineas
      .filter((d) => sel[d.idLote])
      .map((d) => ({
        idLote: d.idLote,
        idProducto: d.idProducto as number,
        cantidad: qty[d.idLote] || 0,
        precioUnitario: d.precioUnitario,
        destino: destino[d.idLote] || "reingreso_stock",
      }));

    if (detalles.length === 0) return alert("Selecciona al menos un producto a devolver.");
    if (detalles.some((d) => d.cantidad < 1)) return alert("Las cantidades deben ser mayores a 0.");

    mutation.mutate({
      tipo,
      motivo,
      metodoReembolso: metodoReembolso || undefined,
      observaciones: observaciones || undefined,
      idVenta: idVenta as number,
      detalles,
    });
  };

  return (
    <Modal
      title="Nueva devolución de venta"
      onClose={onClose}
      wide
      footer={<FooterCrear onClose={onClose} onSubmit={submit} disabled={mutation.isPending || !idVenta} pending={mutation.isPending} />}
    >
      <Card title="Datos de la devolución">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Venta de origen" className="sm:col-span-2">
            <select
              value={idVenta}
              onChange={(e) => { setIdVenta(e.target.value ? Number(e.target.value) : ""); setSel({}); setQty({}); setDestino({}); }}
              className={inputCls}
              style={inputStyle}
            >
              <option value="">Selecciona una venta...</option>
              {ventas.map((v) => (
                <option key={v.idVenta} value={v.idVenta}>
                  #{v.idVenta} · {formatFecha(v.fechaCreacion)} · {v.cliente ?? "Cliente"} · {formatBOB(v.total)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Tipo">
            <select value={tipo} onChange={(e) => setTipo(e.target.value as "total" | "parcial")} className={inputCls} style={inputStyle}>
              <option value="parcial">Parcial</option>
              <option value="total">Total</option>
            </select>
          </Field>
          <Field label="Motivo">
            <select value={motivo} onChange={(e) => setMotivo(e.target.value as MotivoDevVenta)} className={inputCls} style={inputStyle}>
              {(Object.keys(MOTIVO_VENTA) as MotivoDevVenta[]).map((m) => <option key={m} value={m}>{MOTIVO_VENTA[m]}</option>)}
            </select>
          </Field>
          <Field label="Método de reembolso">
            <input value={metodoReembolso} onChange={(e) => setMetodoReembolso(e.target.value)} placeholder="Efectivo, QR..." className={inputCls} style={inputStyle} />
          </Field>
          <Field label="Observaciones">
            <input value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className={inputCls} style={inputStyle} />
          </Field>
        </div>
      </Card>

      {venta && (
        <Card title="Productos de la venta">
          <div className={tableWrapCls} style={{ borderColor: COLORS.border }}>
            <table className="w-full text-xs">
              <thead>
                <tr>
                  {["", "Producto", "Lote", "Vendido", "Cant. a devolver", "Destino"].map((h, i) => <Th key={i}>{h}</Th>)}
                </tr>
              </thead>
              <tbody>
                {lineas.map((d) => (
                  <tr
                    key={d.idLote}
                    className="transition-colors"
                    style={{
                      color: COLORS.textPrimary,
                      borderTop: `1px solid ${COLORS.light}`,
                      // La fila seleccionada se resalta para ver de un vistazo qué se devuelve
                      backgroundColor: sel[d.idLote] ? COLORS.light : undefined,
                    }}
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer"
                        style={{ accentColor: COLORS.medium }}
                        checked={!!sel[d.idLote]}
                        onChange={(e) => {
                          setSel((s) => ({ ...s, [d.idLote]: e.target.checked }));
                          setQty((q) => ({ ...q, [d.idLote]: q[d.idLote] || 1 }));
                          setDestino((x) => ({ ...x, [d.idLote]: x[d.idLote] || "reingreso_stock" }));
                        }}
                      />
                    </td>
                    <td className="px-3 py-2 font-semibold">{d.nombreComercial || d.nombreGenerico || `Producto ${d.idProducto}`}</td>
                    <td className="px-3 py-2">{d.numeroLote}</td>
                    <td className="px-3 py-2">{d.cantidad}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={1}
                        max={d.cantidad}
                        value={qty[d.idLote] ?? 1}
                        onChange={(e) => setQty((q) => ({ ...q, [d.idLote]: Math.min(Number(e.target.value) || 1, d.cantidad) }))}
                        className={`${cellInputCls} w-20`}
                        style={inputStyle}
                        disabled={!sel[d.idLote]}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={destino[d.idLote] || "reingreso_stock"}
                        onChange={(e) => setDestino((x) => ({ ...x, [d.idLote]: e.target.value as DestinoDevVenta }))}
                        className={cellInputCls}
                        style={inputStyle}
                        disabled={!sel[d.idLote]}
                      >
                        {(Object.keys(DESTINO) as DestinoDevVenta[]).map((k) => <option key={k} value={k}>{DESTINO[k]}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <MontoEstimado label="Reembolso estimado" value={formatBOB(subtotal)} />
        </Card>
      )}
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Crear devolución a proveedor
// ══════════════════════════════════════════════════════════════════════════════
function CrearDevProveedorModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [idCompra, setIdCompra] = useState<number | "">("");
  const [tipo, setTipo] = useState<"total" | "parcial">("parcial");
  const [motivo, setMotivo] = useState<MotivoDevProveedor>("producto_danado");
  const [observaciones, setObservaciones] = useState("");
  const [sel, setSel] = useState<Record<number, boolean>>({});
  const [qty, setQty] = useState<Record<number, number>>({});

  const { data: comprasData } = useQuery({
    queryKey: ["ComprasParaDevolucion"],
    queryFn: () => GetComprasApi({ porPagina: 200 }),
  });
  const compras = useMemo(
    () => (comprasData?.data ?? []).filter((c: CompraType) => ["completado", "parcial", "devuelto_parcial"].includes(c.estado)),
    [comprasData]
  );

  const { data: compra } = useQuery({
    queryKey: ["CompraDetalle", idCompra],
    queryFn: () => GetCompraByIdApi(idCompra as number),
    enabled: !!idCompra,
  });

  const lineas = useMemo(
    () => (compra?.detalles ?? []).flatMap((d) => (d.idLote == null ? [] : [{ ...d, idLote: d.idLote }])),
    [compra]
  );

  const subtotal = useMemo(
    () => lineas.reduce((acc, d) => (sel[d.idLote] ? acc + (qty[d.idLote] || 0) * d.precioUnitario : acc), 0),
    [lineas, sel, qty]
  );

  const mutation = useMutation({
    mutationFn: (payload: CreateDevProveedorType) => AddDevolucionProveedorApi(payload),
    onSuccess: onCreated,
    onError: (e: Error) => alert(e.message),
  });

  const submit = () => {
    if (!compra || !idCompra) return;
    const detalles = lineas
      .filter((d) => sel[d.idLote])
      .map((d) => ({
        idLote: d.idLote,
        cantidad: qty[d.idLote] || 0,
        precioUnitario: d.precioUnitario,
      }));

    if (detalles.length === 0) return alert("Selecciona al menos un lote a devolver.");
    if (detalles.some((d) => d.cantidad < 1)) return alert("Las cantidades deben ser mayores a 0.");

    mutation.mutate({
      tipo,
      motivo,
      observaciones: observaciones || undefined,
      idCompra: idCompra as number,
      detalles,
    });
  };

  return (
    <Modal
      title="Nueva devolución a proveedor"
      onClose={onClose}
      wide
      footer={<FooterCrear onClose={onClose} onSubmit={submit} disabled={mutation.isPending || !idCompra} pending={mutation.isPending} />}
    >
      <Card title="Datos de la devolución">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Compra de origen" className="sm:col-span-2">
            <select
              value={idCompra}
              onChange={(e) => { setIdCompra(e.target.value ? Number(e.target.value) : ""); setSel({}); setQty({}); }}
              className={inputCls}
              style={inputStyle}
            >
              <option value="">Selecciona una compra...</option>
              {compras.map((c) => (
                <option key={c.idCompra} value={c.idCompra}>
                  {c.numeroFactura ?? `#${c.idCompra}`} · {formatFecha(c.fechaCreacion)} · {c.proveedor ?? ""} · {formatBOB(c.total)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Tipo">
            <select value={tipo} onChange={(e) => setTipo(e.target.value as "total" | "parcial")} className={inputCls} style={inputStyle}>
              <option value="parcial">Parcial</option>
              <option value="total">Total</option>
            </select>
          </Field>
          <Field label="Motivo">
            <select value={motivo} onChange={(e) => setMotivo(e.target.value as MotivoDevProveedor)} className={inputCls} style={inputStyle}>
              {(Object.keys(MOTIVO_PROVEEDOR) as MotivoDevProveedor[]).map((m) => <option key={m} value={m}>{MOTIVO_PROVEEDOR[m]}</option>)}
            </select>
          </Field>
          <Field label="Observaciones" className="sm:col-span-2">
            <input value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className={inputCls} style={inputStyle} />
          </Field>
        </div>
      </Card>

      {compra && (
        <Card title="Lotes de la compra">
          <div className={tableWrapCls} style={{ borderColor: COLORS.border }}>
            <table className="w-full text-xs">
              <thead>
                <tr>
                  {["", "Producto", "Lote", "Stock actual", "Cant. a devolver"].map((h, i) => <Th key={i}>{h}</Th>)}
                </tr>
              </thead>
              <tbody>
                {lineas.map((d) => (
                  <tr
                    key={d.idLote}
                    className="transition-colors"
                    style={{
                      color: COLORS.textPrimary,
                      borderTop: `1px solid ${COLORS.light}`,
                      backgroundColor: sel[d.idLote] ? COLORS.light : undefined,
                    }}
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer"
                        style={{ accentColor: COLORS.medium }}
                        checked={!!sel[d.idLote]}
                        onChange={(e) => {
                          setSel((s) => ({ ...s, [d.idLote]: e.target.checked }));
                          setQty((q) => ({ ...q, [d.idLote]: q[d.idLote] || d.cantidad }));
                        }}
                      />
                    </td>
                    <td className="px-3 py-2 font-semibold">{d.nombreComercial || d.nombreGenerico || d.codigo || "—"}</td>
                    <td className="px-3 py-2">{d.numeroLote}</td>
                    <td className="px-3 py-2">{d.stock}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={1}
                        max={d.cantidad}
                        value={qty[d.idLote] ?? d.cantidad}
                        onChange={(e) => setQty((q) => ({ ...q, [d.idLote]: Math.min(Number(e.target.value) || 1, d.cantidad) }))}
                        className={`${cellInputCls} w-20`}
                        style={inputStyle}
                        disabled={!sel[d.idLote]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <MontoEstimado label="Nota de crédito estimada" value={formatBOB(subtotal)} />
        </Card>
      )}
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Detalle + resolución: devolución de venta
// ══════════════════════════════════════════════════════════════════════════════
function DetalleDevVentaModal({ id, onClose, onResolved }: { id: number; onClose: () => void; onResolved: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["DevolucionVentaDetalle", id],
    queryFn: () => GetDevolucionVentaByIdApi(id),
  });

  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [numeroNotaCredito, setNumeroNotaCredito] = useState("");

  const mutation = useMutation({
    mutationFn: (payload: ResolverDevVentaType) => ResolverDevolucionVentaApi(id, payload),
    onSuccess: onResolved,
    onError: (e: Error) => alert(e.message),
  });

  const dev: DevVentaType | undefined = data;
  const resoluble = dev && !["completada", "rechazada"].includes(dev.estado);

  return (
    <Modal title={`Devolución de venta #${id}`} onClose={onClose} wide>
      {isLoading || !dev ? (
        <Loading />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Info label="Venta">{`#${dev.idVenta}`}</Info>
            <Info label="Cliente">{dev.cliente ?? "—"}</Info>
            <Info label="Estado"><Badge {...ESTADO_VENTA[dev.estado]} /></Info>
            <Info label="Tipo"><span className="capitalize">{dev.tipo}</span></Info>
            <Info label="Motivo">{MOTIVO_VENTA[dev.motivo]}</Info>
            <Info label="Monto reembolso">{formatBOB(dev.montoReembolso)}</Info>
            <Info label="Creada">{formatFecha(dev.fechaCreacion)}</Info>
            <Info label="Resuelta">{formatFecha(dev.fechaResolucion)}</Info>
            <Info label="Nota de crédito">{dev.numeroNotaCredito ?? "—"}</Info>
          </div>

          {dev.observaciones && (
            <p className="rounded-xl border bg-white p-3 text-sm" style={{ borderColor: COLORS.border, color: COLORS.textSecondary }}>
              {dev.observaciones}
            </p>
          )}
          {dev.motivoRechazo && (
            <p
              className="rounded-xl border p-3 text-sm"
              style={{ background: `${ERROR_COLOR}12`, borderColor: `${ERROR_COLOR}40`, color: "#B91C1C" }}
            >
              <strong>Motivo de rechazo:</strong> {dev.motivoRechazo}
            </p>
          )}

          <Card title="Productos devueltos">
            <div className={tableWrapCls} style={{ borderColor: COLORS.border }}>
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    {["Producto", "Lote", "Cantidad", "P. Unit.", "Subtotal", "Destino"].map((h) => <Th key={h}>{h}</Th>)}
                  </tr>
                </thead>
                <tbody>
                  {(dev.detalles ?? []).map((d) => (
                    <tr key={d.idLote} style={{ color: COLORS.textPrimary, borderTop: `1px solid ${COLORS.light}` }}>
                      <td className="px-3 py-2 font-semibold">{d.nombreComercial || d.nombreGenerico}</td>
                      <td className="px-3 py-2">{d.numeroLote}</td>
                      <td className="px-3 py-2">{d.cantidad}</td>
                      <td className="px-3 py-2">{formatBOB(d.precioUnitario)}</td>
                      <td className="px-3 py-2 font-bold" style={{ color: COLORS.dark }}>{formatBOB(d.subtotal)}</td>
                      <td className="px-3 py-2">{d.destino ? DESTINO[d.destino] : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {resoluble && (
            <Card title="Resolver devolución">
              {dev.estado === "solicitada" && (
                <button
                  onClick={() => mutation.mutate({ estado: "aprobada" })}
                  disabled={mutation.isPending}
                  className={`${btnBase} mb-4 text-white shadow hover:scale-[1.03] disabled:hover:scale-100`}
                  style={{ backgroundColor: COLORS.medium }}
                >
                  Aprobar
                </button>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="N° Nota de crédito (al completar)">
                  <input value={numeroNotaCredito} onChange={(e) => setNumeroNotaCredito(e.target.value)} className={inputCls} style={inputStyle} placeholder="Ej. NC-0002" />
                </Field>
                <Field label="Motivo de rechazo (si aplica)">
                  <input value={motivoRechazo} onChange={(e) => setMotivoRechazo(e.target.value)} className={inputCls} style={inputStyle} />
                </Field>
              </div>

              <div className="mt-4 flex flex-col-reverse justify-end gap-2 sm:flex-row">
                <button
                  onClick={() => {
                    if (!motivoRechazo.trim()) return alert("Indica el motivo de rechazo.");
                    mutation.mutate({ estado: "rechazada", motivoRechazo });
                  }}
                  disabled={mutation.isPending}
                  className={`${btnBase} bg-red-600 text-white hover:bg-red-700`}
                >
                  Rechazar
                </button>
                <button
                  onClick={() => mutation.mutate({ estado: "completada", numeroNotaCredito: numeroNotaCredito || undefined })}
                  disabled={mutation.isPending}
                  className={`${btnBase} text-white shadow hover:scale-[1.03] disabled:hover:scale-100`}
                  style={{ backgroundColor: "#059669" }}
                >
                  Completar y ajustar stock
                </button>
              </div>
            </Card>
          )}
        </>
      )}
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Detalle + resolución: devolución a proveedor
// ══════════════════════════════════════════════════════════════════════════════
function DetalleDevProveedorModal({ id, onClose, onResolved }: { id: number; onClose: () => void; onResolved: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["DevolucionProveedorDetalle", id],
    queryFn: () => GetDevolucionProveedorByIdApi(id),
  });

  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [numeroNotaCredito, setNumeroNotaCredito] = useState("");

  const mutation = useMutation({
    mutationFn: (payload: ResolverDevProveedorType) => ResolverDevolucionProveedorApi(id, payload),
    onSuccess: onResolved,
    onError: (e: Error) => alert(e.message),
  });

  const dev: DevProveedorType | undefined = data;
  const resoluble = dev && !["completada", "rechazada"].includes(dev.estado);

  return (
    <Modal title={`Devolución a proveedor #${id}`} onClose={onClose} wide>
      {isLoading || !dev ? (
        <Loading />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Info label="Compra">{dev.compraFactura ?? `#${dev.idCompra}`}</Info>
            <Info label="Proveedor">{dev.proveedor ?? "—"}</Info>
            <Info label="Estado"><Badge {...ESTADO_PROVEEDOR[dev.estado]} /></Info>
            <Info label="Tipo"><span className="capitalize">{dev.tipo}</span></Info>
            <Info label="Motivo">{MOTIVO_PROVEEDOR[dev.motivo]}</Info>
            <Info label="Monto nota crédito">{formatBOB(dev.montoNotaCredito)}</Info>
            <Info label="Creada">{formatFecha(dev.fechaCreacion)}</Info>
            <Info label="Resuelta">{formatFecha(dev.fechaResolucion)}</Info>
            <Info label="Nota de crédito">{dev.numeroNotaCredito ?? "—"}</Info>
          </div>

          {dev.observaciones && (
            <p className="rounded-xl border bg-white p-3 text-sm" style={{ borderColor: COLORS.border, color: COLORS.textSecondary }}>
              {dev.observaciones}
            </p>
          )}
          {dev.motivoRechazo && (
            <p
              className="rounded-xl border p-3 text-sm"
              style={{ background: `${ERROR_COLOR}12`, borderColor: `${ERROR_COLOR}40`, color: "#B91C1C" }}
            >
              <strong>Motivo de rechazo:</strong> {dev.motivoRechazo}
            </p>
          )}

          <Card title="Lotes devueltos">
            <div className={tableWrapCls} style={{ borderColor: COLORS.border }}>
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    {["Producto", "Lote", "Cantidad", "P. Unit.", "Subtotal"].map((h) => <Th key={h}>{h}</Th>)}
                  </tr>
                </thead>
                <tbody>
                  {(dev.detalles ?? []).map((d) => (
                    <tr key={d.idLote} style={{ color: COLORS.textPrimary, borderTop: `1px solid ${COLORS.light}` }}>
                      <td className="px-3 py-2 font-semibold">{d.nombreComercial || d.nombreGenerico}</td>
                      <td className="px-3 py-2">{d.numeroLote}</td>
                      <td className="px-3 py-2">{d.cantidad}</td>
                      <td className="px-3 py-2">{formatBOB(d.precioUnitario)}</td>
                      <td className="px-3 py-2 font-bold" style={{ color: COLORS.dark }}>{formatBOB(d.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {resoluble && (
            <Card title="Resolver devolución">
              {dev.estado === "solicitada" && (
                <button
                  onClick={() => mutation.mutate({ estado: "aceptada" })}
                  disabled={mutation.isPending}
                  className={`${btnBase} mb-4 text-white shadow hover:scale-[1.03] disabled:hover:scale-100`}
                  style={{ backgroundColor: COLORS.medium }}
                >
                  Aceptar
                </button>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="N° Nota de crédito (al completar)">
                  <input value={numeroNotaCredito} onChange={(e) => setNumeroNotaCredito(e.target.value)} className={inputCls} style={inputStyle} placeholder="Ej. NC-DV-2220" />
                </Field>
                <Field label="Motivo de rechazo (si aplica)">
                  <input value={motivoRechazo} onChange={(e) => setMotivoRechazo(e.target.value)} className={inputCls} style={inputStyle} />
                </Field>
              </div>

              <div className="mt-4 flex flex-col-reverse justify-end gap-2 sm:flex-row">
                <button
                  onClick={() => {
                    if (!motivoRechazo.trim()) return alert("Indica el motivo de rechazo.");
                    mutation.mutate({ estado: "rechazada", motivoRechazo });
                  }}
                  disabled={mutation.isPending}
                  className={`${btnBase} bg-red-600 text-white hover:bg-red-700`}
                >
                  Rechazar
                </button>
                <button
                  onClick={() => mutation.mutate({ estado: "completada", numeroNotaCredito: numeroNotaCredito || undefined })}
                  disabled={mutation.isPending}
                  className={`${btnBase} text-white shadow hover:scale-[1.03] disabled:hover:scale-100`}
                  style={{ backgroundColor: "#059669" }}
                >
                  Completar y ajustar stock
                </button>
              </div>
            </Card>
          )}
        </>
      )}
    </Modal>
  );
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border bg-white p-3" style={{ borderColor: COLORS.border }}>
      <p className="text-xs font-medium" style={{ color: COLORS.textMuted }}>{label}</p>
      <div className="mt-1 text-sm font-semibold" style={{ color: COLORS.textPrimary }}>{children}</div>
    </div>
  );
}