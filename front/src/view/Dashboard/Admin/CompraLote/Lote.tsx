import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { GetLoteApi } from "../../../../Api/LoteApi";
import type { LoteListItemType } from "../../../../types";

// ─── Paleta (la misma del resto del proyecto) ────────────────────────────────
const C = {
  dark: "#4A1A6E",
  medium: "#7B3FA0",
  light: "#F3EBF9",
  border: "#D8B4F0",
  text: "#2D0A47",
};
const ERROR_COLOR = "#EF4444";
const SURFACE = "#FBF8FE";
const MUTED = "#9CA3AF";
const GRADIENT = `linear-gradient(135deg, ${C.dark}, ${C.medium})`;

// ─── Colores de estado ───────────────────────────────────────────────────────
// Cada estado tiene fondo suave (bg), texto oscuro legible (text) y un punto de
// color más vivo (dot). Elegí tonos distintos entre sí para que se distingan de
// un vistazo, y ninguno compite con el morado de la marca:
//   vigente   → esmeralda   (todo bien)
//   pendiente → índigo      (en espera, cercano al morado pero más frío)
//   porVencer → ámbar       (atención)
//   cuarentena→ naranja     (bloqueado, más intenso que ámbar)
//   vencido   → rojo        (crítico)
//   devuelto  → rosa        (regresó al proveedor)
//   neutro    → gris        (cancelado, ya sin acción)
const TONOS = {
  vigente: { bg: "#ECFDF5", text: "#047857", dot: "#10B981" },
  pendiente: { bg: "#EEF2FF", text: "#4338CA", dot: "#6366F1" },
  porVencer: { bg: "#FFFBEB", text: "#B45309", dot: "#F59E0B" },
  cuarentena: { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316" },
  vencido: { bg: "#FEF2F2", text: "#B91C1C", dot: ERROR_COLOR },
  devuelto: { bg: "#FDF2F8", text: "#9D174D", dot: "#EC4899" },
  neutro: { bg: "#F3F4F6", text: "#4B5563", dot: "#9CA3AF" },
} as const;

type EstadoFiltro = "todos" | "pendiente" | "activo" | "vencido" | "cancelado" | "cuarentena" | "devuelto";

// ── Helpers (misma lógica; solo cambian los colores) ──────────────────────────
const getAlertaVencimiento = (diasParaVencer: number, estado: string) => {
  if (estado === "cancelado") return { label: "Cancelado", ...TONOS.neutro };
  if (estado === "devuelto") return { label: "Devuelto", ...TONOS.devuelto };
  if (estado === "cuarentena") return { label: "Cuarentena", ...TONOS.cuarentena };
  if (estado === "vencido" || diasParaVencer < 0) return { label: "Vencido", ...TONOS.vencido };
  if (diasParaVencer <= 30) return { label: `Vence en ${diasParaVencer}d`, ...TONOS.porVencer };
  if (estado === "pendiente") return { label: "Pendiente", ...TONOS.pendiente };
  return { label: "Vigente", ...TONOS.vigente };
};

const formatFecha = (fecha: string) =>
  new Intl.DateTimeFormat("es-BO", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(fecha));

const formatMoneda = (valor: number) => `Bs ${valor.toFixed(2)}`;

// ── Helpers solo de vista ─────────────────────────────────────────────────────
// Texto secundario bajo la fecha: "en 12 días", "hace 3 días", "vence hoy".
const textoDias = (d: number) =>
  d < 0 ? `hace ${Math.abs(d)} ${Math.abs(d) === 1 ? "día" : "días"}` : d === 0 ? "vence hoy" : `en ${d} ${d === 1 ? "día" : "días"}`;

// Color de ese texto: rojo si ya venció, ámbar si vence en ≤30 días, gris si no.
const colorDias = (d: number) => (d < 0 ? TONOS.vencido.text : d <= 30 ? TONOS.porVencer.text : MUTED);

const Icon = ({ d, className = "w-5 h-5" }: { d: string; className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

const ICONS = {
  box: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  warning:
    "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  search: "M21 21l-4.35-4.35M17 10A7 7 0 113 10a7 7 0 0114 0z",
  down: "M19 9l-7 7-7-7",
  left: "M15 19l-7-7 7-7",
  right: "M9 5l7 7-7 7",
};

// Clase común de inputs / selects (el color del borde va en style)
const inputBase =
  "rounded-xl border-2 bg-white text-sm font-medium outline-none transition-all " +
  "placeholder:text-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100";

// ── Componente principal ──────────────────────────────────────────────────
export default function Lote() {
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("todos");
  const [soloProximosVencer, setSoloProximosVencer] = useState(false);
  const [pagina, setPagina] = useState(1);
  const porPagina = 10;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["lotes", busqueda, estadoFiltro, soloProximosVencer, pagina],
    queryFn: () =>
      GetLoteApi({
        busqueda: busqueda || undefined,
        estado: estadoFiltro === "todos" ? undefined : estadoFiltro,
        soloProximosVencer: soloProximosVencer || undefined,
        pagina,
        porPagina,
      }),
    placeholderData: (prev) => prev,
  });

  const lotes = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));

  // Optimización: Cálculo en una sola pasada y memoizado
  const { alertasCount, vencidosCount } = useMemo(() => {
    return lotes.reduce(
      (acc, l) => {
        if (l.estado === "vencido" || l.diasParaVencer < 0) acc.vencidosCount++;
        else if (l.estado === "activo" && l.diasParaVencer <= 30 && l.diasParaVencer >= 0) acc.alertasCount++;
        return acc;
      },
      { alertasCount: 0, vencidosCount: 0 }
    );
  }, [lotes]);

  // Handlers para evitar recreación de funciones en cada render
  const handleBusqueda = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
    setPagina(1);
  }, []);

  const handleEstado = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setEstadoFiltro(e.target.value as EstadoFiltro);
    setPagina(1);
  }, []);

  const toggleProximosVencer = useCallback(() => {
    setSoloProximosVencer((v) => !v);
    setPagina(1);
  }, []);

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Encabezado ──────────────────────────────────────────────── */}
        <header
          className="relative mb-6 overflow-hidden rounded-2xl px-6 py-5 text-white shadow-md"
          style={{ background: GRADIENT }}
        >
          {/* Círculos decorativos (solo estética) */}
          <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute right-40 -bottom-14 h-28 w-28 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 shadow-inner">
              <Icon d={ICONS.box} className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Lotes de inventario</h1>
              <p className="mt-0.5 text-xs text-purple-200">
                Controla el stock, vencimiento y procedencia de cada lote registrado.
              </p>
            </div>
          </div>
        </header>

        {/* ── Tarjetas resumen ────────────────────────────────────────── */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ResumenCard label="Total de lotes" value={total} tone="default" />
          <ResumenCard label="Próximos a vencer (30 días)" value={alertasCount} tone="warning" />
          <ResumenCard label="Vencidos" value={vencidosCount} tone="danger" />
        </div>

        {/* ── Barra de filtros ────────────────────────────────────────── */}
        <div
          className="mb-5 flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm lg:flex-row lg:items-center"
          style={{ borderColor: C.border }}
        >
          <div className="relative flex-1">
            <div
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: C.border }}
            >
              <Icon d={ICONS.search} className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={busqueda}
              onChange={handleBusqueda}
              placeholder="Buscar por código, número de lote o producto..."
              aria-label="Buscar lotes"
              className={`${inputBase} w-full py-2.5 pl-10 pr-4`}
              style={{ borderColor: C.border, color: C.text }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                value={estadoFiltro}
                onChange={handleEstado}
                aria-label="Filtrar por estado"
                className={`${inputBase} cursor-pointer appearance-none py-2.5 pl-4 pr-10`}
                style={{ borderColor: C.border, color: C.text }}
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="activo">Activo</option>
                <option value="vencido">Vencido</option>
                <option value="cancelado">Cancelado</option>
                <option value="cuarentena">Cuarentena</option>
                <option value="devuelto">Devuelto</option>
              </select>
              <div
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <Icon d={ICONS.down} className="h-4 w-4" />
              </div>
            </div>

            <button
              type="button"
              onClick={toggleProximosVencer}
              aria-pressed={soloProximosVencer}
              className="flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all active:scale-95"
              style={
                soloProximosVencer
                  ? { background: GRADIENT, borderColor: C.medium, color: "#FFFFFF" }
                  : { background: "#FFFFFF", borderColor: C.border, color: C.dark }
              }
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: soloProximosVencer ? "#FFFFFF" : TONOS.porVencer.dot }}
              />
              Por vencer
            </button>
          </div>
        </div>

        {/* ── Estados de la UI ────────────────────────────────────────── */}
        {isLoading && (
          <div
            className="flex items-center justify-center rounded-2xl border bg-white py-20 shadow-sm"
            style={{ borderColor: C.border }}
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
                style={{ borderColor: C.border, borderTopColor: C.medium }}
              />
              <p className="text-sm" style={{ color: MUTED }}>Cargando lotes...</p>
            </div>
          </div>
        )}

        {isError && !isLoading && (
          <div
            className="flex flex-col items-center gap-2 rounded-2xl border p-8 text-center"
            style={{ backgroundColor: TONOS.vencido.bg, borderColor: `${ERROR_COLOR}40` }}
          >
            <div style={{ color: ERROR_COLOR }}>
              <Icon d={ICONS.warning} className="h-8 w-8" />
            </div>
            <p className="font-bold" style={{ color: TONOS.vencido.text }}>No se pudieron cargar los lotes</p>
            <p className="text-sm" style={{ color: ERROR_COLOR }}>
              {error instanceof Error ? error.message : "Intenta nuevamente más tarde."}
            </p>
          </div>
        )}

        {!isLoading && !isError && lotes.length === 0 && (
          <div
            className="flex flex-col items-center gap-2 rounded-2xl border border-dashed bg-white py-20 text-center"
            style={{ borderColor: C.border }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: C.light, color: C.medium }}
            >
              <Icon d={ICONS.box} className="h-6 w-6" />
            </div>
            <p className="font-bold" style={{ color: C.dark }}>No se encontraron lotes</p>
            <p className="max-w-sm text-sm" style={{ color: MUTED }}>
              Ajusta los filtros o registra una nueva compra para ver lotes aquí.
            </p>
          </div>
        )}

        {/* ── Renderizado de Datos ────────────────────────────────────── */}
        {!isLoading && !isError && lotes.length > 0 && (
          <>
            {/* Tabla (escritorio) */}
            <div
              className="hidden overflow-hidden rounded-2xl border bg-white shadow-sm md:block"
              style={{ borderColor: C.border }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr style={{ backgroundColor: C.light }}>
                      <Th>Producto</Th>
                      <Th>Código / Lote</Th>
                      <Th>Proveedor</Th>
                      <Th align="right">Stock</Th>
                      <Th align="right">Precio compra</Th>
                      <Th>Vencimiento</Th>
                      <Th>Estado</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {lotes.map((lote, idx) => (
                      <FilaLote key={lote.idLote} lote={lote} isLast={idx === lotes.length - 1} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tarjetas (móvil) */}
            <div className="flex flex-col gap-3 md:hidden">
              {lotes.map((lote) => (
                <TarjetaLoteMobile key={lote.idLote} lote={lote} />
              ))}
            </div>

            {/* Paginación */}
            <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-sm" style={{ color: MUTED }}>
                Mostrando{" "}
                <strong style={{ color: C.dark }}>
                  {(pagina - 1) * porPagina + 1}–{Math.min(pagina * porPagina, total)}
                </strong>{" "}
                de <strong style={{ color: C.dark }}>{total}</strong> lote{total !== 1 && "s"} · Página {pagina} de {totalPaginas}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pagina <= 1}
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  className="flex items-center gap-1.5 rounded-xl border-2 bg-white px-4 py-2 text-sm font-bold transition-all hover:bg-purple-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
                  style={{ borderColor: C.border, color: C.dark }}
                >
                  <Icon d={ICONS.left} className="h-4 w-4" />
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={pagina >= totalPaginas}
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  className="flex items-center gap-1.5 rounded-xl border-2 bg-white px-4 py-2 text-sm font-bold transition-all hover:bg-purple-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
                  style={{ borderColor: C.border, color: C.dark }}
                >
                  Siguiente
                  <Icon d={ICONS.right} className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Subcomponentes ──────────────────────────────────────────────────────────

// Tarjeta de resumen: ícono en caja tintada + número grande.
function ResumenCard({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "warning" | "danger" }) {
  const t =
    tone === "warning"
      ? { bg: TONOS.porVencer.bg, fg: TONOS.porVencer.dot, icon: ICONS.clock }
      : tone === "danger"
      ? { bg: TONOS.vencido.bg, fg: TONOS.vencido.dot, icon: ICONS.warning }
      : { bg: C.light, fg: C.medium, icon: ICONS.box };

  return (
    <div
      className="flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm"
      style={{ borderColor: C.border }}
    >
      <div
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ background: t.bg, color: t.fg }}
      >
        <Icon d={t.icon} className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="text-3xl font-bold leading-none" style={{ color: C.dark }}>{value}</p>
        <p className="mt-1.5 text-xs font-medium" style={{ color: MUTED }}>{label}</p>
      </div>
    </div>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className={`px-4 py-3.5 text-xs font-bold ${align === "right" ? "text-right" : "text-left"}`}
      style={{ color: C.dark }}
    >
      {children}
    </th>
  );
}

// Etiqueta de estado con punto de color (se reutiliza en tabla y tarjetas móviles).
function EstadoBadge({ label, bg, text, dot }: { label: string; bg: string; text: string; dot: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ backgroundColor: bg, color: text }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dot }} />
      {label}
    </span>
  );
}

function FilaLote({ lote, isLast }: { lote: LoteListItemType; isLast: boolean }) {
  const alerta = getAlertaVencimiento(lote.diasParaVencer, lote.estado);
  return (
    <tr
      className="transition-colors hover:bg-purple-50/50"
      style={{ borderTop: isLast ? "none" : `1px solid ${C.light}` }}
    >
      <td className="px-4 py-3.5">
        <p className="font-semibold" style={{ color: C.text }}>{lote.nombreComercial || lote.nombreGenerico}</p>
        {lote.nombreComercial && <p className="text-xs" style={{ color: MUTED }}>{lote.nombreGenerico}</p>}
      </td>
      <td className="px-4 py-3.5">
        <p className="font-mono text-xs font-semibold" style={{ color: C.text }}>{lote.codigo}</p>
        <p className="text-xs" style={{ color: MUTED }}>Lote {lote.numeroLote}</p>
      </td>
      <td className="px-4 py-3.5" style={{ color: C.medium }}>{lote.proveedor}</td>
      <td className="px-4 py-3.5 text-right">
        <span className="text-base font-bold" style={{ color: C.dark }}>{lote.stock}</span>
        <span className="ml-1 text-xs" style={{ color: MUTED }}>u.</span>
      </td>
      <td className="px-4 py-3.5 text-right font-medium" style={{ color: C.text }}>{formatMoneda(lote.precioCompra)}</td>
      <td className="px-4 py-3.5">
        <p className="font-medium" style={{ color: C.text }}>{formatFecha(lote.fechaVencimiento)}</p>
        <p className="text-xs" style={{ color: colorDias(lote.diasParaVencer) }}>{textoDias(lote.diasParaVencer)}</p>
      </td>
      <td className="px-4 py-3.5">
        <EstadoBadge {...alerta} />
      </td>
    </tr>
  );
}

function TarjetaLoteMobile({ lote }: { lote: LoteListItemType }) {
  const alerta = getAlertaVencimiento(lote.diasParaVencer, lote.estado);
  return (
    <div
      className="rounded-2xl border bg-white p-4 shadow-sm"
      // Barra de color a la izquierda: el estado se ve incluso antes de leer la etiqueta
      style={{ borderColor: C.border, borderLeft: `4px solid ${alerta.dot}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold" style={{ color: C.text }}>{lote.nombreComercial || lote.nombreGenerico}</p>
          <p className="text-xs" style={{ color: MUTED }}>{lote.codigo} · Lote {lote.numeroLote}</p>
        </div>
        <EstadoBadge {...alerta} />
      </div>
      <div
        className="mt-3 grid grid-cols-2 gap-3 rounded-xl p-3 text-sm"
        style={{ background: SURFACE }}
      >
        <InfoMini label="Proveedor" value={lote.proveedor} />
        <InfoMini label="Stock" value={`${lote.stock} u.`} />
        <InfoMini label="Precio compra" value={formatMoneda(lote.precioCompra)} />
        <InfoMini label="Vencimiento" value={formatFecha(lote.fechaVencimiento)} />
      </div>
    </div>
  );
}

function InfoMini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs" style={{ color: MUTED }}>{label}</p>
      <p className="font-semibold" style={{ color: C.text }}>{value}</p>
    </div>
  );
}