import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GetLoteApi } from "../../../../Api/LoteApi";
import type { LoteListItemType } from "../../../../types";

// ── Paleta de colores del proyecto ────────────────────────────────────────
const colors = {
  bgBase: "#F3EBF9",
  bgCard: "#FFFFFF",
  bgInput: "#FFFFFF",
  green: "#7B3FA0",
  greenDim: "#F3EBF9",
  textPrimary: "#4A1A6E",
  textSecondary: "#7B3FA0",
  textMuted: "#9CA3AF",
  border: "#D8B4F0",
  borderFocus: "#4A1A6E",
  required: "#EF4444",
};

type EstadoFiltro = "todos" | "pendiente" | "activo" | "vencido" | "cancelado";

// ── Helpers de vencimiento ────────────────────────────────────────────────
function getAlertaVencimiento(diasParaVencer: number, estado: string) {
  if (estado === "cancelado") {
    return { label: "Cancelado", bg: "#F3F4F6", text: "#6B7280", dot: "#9CA3AF" };
  }
  if (estado === "vencido" || diasParaVencer < 0) {
    return { label: "Vencido", bg: "#FEE2E2", text: "#B91C1C", dot: "#EF4444" };
  }
  if (diasParaVencer <= 30) {
    return { label: `Vence en ${diasParaVencer}d`, bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" };
  }
  if (estado === "pendiente") {
    return { label: "Pendiente", bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6" };
  }
  return { label: "Vigente", bg: colors.greenDim, text: colors.green, dot: colors.green };
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMoneda(valor: number) {
  return `Bs ${valor.toFixed(2)}`;
}

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

  const alertasCount = lotes.filter(
    (l) => l.estado === "activo" && l.diasParaVencer <= 30 && l.diasParaVencer >= 0
  ).length;
  const vencidosCount = lotes.filter((l) => l.estado === "vencido" || l.diasParaVencer < 0).length;

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Encabezado ──────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: colors.textPrimary }}>
            Lotes de inventario
          </h1>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Controla el stock, vencimiento y procedencia de cada lote registrado.
          </p>
        </div>

        {/* ── Tarjetas resumen ────────────────────────────────────────── */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ResumenCard
            label="Total de lotes"
            value={total}
            colors={colors}
          />
          <ResumenCard
            label="Próximos a vencer (30 días)"
            value={alertasCount}
            colors={colors}
            tone="warning"
          />
          <ResumenCard
            label="Vencidos"
            value={vencidosCount}
            colors={colors}
            tone="danger"
          />
        </div>

        {/* ── Barra de filtros ────────────────────────────────────────── */}
        <div
          className="mb-5 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between"
          style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
        >
          <div className="flex flex-1 items-center gap-2">
            <svg
              className="h-4 w-4 flex-shrink-0"
              style={{ color: colors.textMuted }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 10A7 7 0 113 10a7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar por código, número de lote o producto..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              style={{ color: colors.textPrimary }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={estadoFiltro}
              onChange={(e) => {
                setEstadoFiltro(e.target.value as EstadoFiltro);
                setPagina(1);
              }}
              className="rounded-lg px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: colors.bgInput,
                border: `1px solid ${colors.border}`,
                color: colors.textPrimary,
              }}
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="activo">Activo</option>
              <option value="vencido">Vencido</option>
              <option value="cancelado">Cancelado</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setSoloProximosVencer((v) => !v);
                setPagina(1);
              }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              style={
                soloProximosVencer
                  ? { backgroundColor: colors.green, color: "#FFFFFF" }
                  : {
                      backgroundColor: colors.bgInput,
                      border: `1px solid ${colors.border}`,
                      color: colors.textSecondary,
                    }
              }
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: soloProximosVencer ? "#FFFFFF" : "#F59E0B" }}
              />
              Por vencer
            </button>
          </div>
        </div>

        {/* ── Estado: cargando ────────────────────────────────────────── */}
        {isLoading && (
          <div
            className="flex items-center justify-center rounded-2xl py-20"
            style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
                style={{ borderColor: colors.border, borderTopColor: colors.green }}
              />
              <p className="text-sm" style={{ color: colors.textMuted }}>
                Cargando lotes...
              </p>
            </div>
          </div>
        )}

        {/* ── Estado: error ───────────────────────────────────────────── */}
        {isError && !isLoading && (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}
          >
            <p className="font-medium" style={{ color: colors.required }}>
              No se pudieron cargar los lotes
            </p>
            <p className="mt-1 text-sm text-red-500">
              {error instanceof Error ? error.message : "Intenta nuevamente más tarde."}
            </p>
          </div>
        )}

        {/* ── Estado: vacío ───────────────────────────────────────────── */}
        {!isLoading && !isError && lotes.length === 0 && (
          <div
            className="rounded-2xl py-20 text-center"
            style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
          >
            <p className="font-medium" style={{ color: colors.textPrimary }}>
              No se encontraron lotes
            </p>
            <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>
              Ajusta los filtros o registra una nueva compra para ver lotes aquí.
            </p>
          </div>
        )}

        {/* ── Tabla de lotes (desktop) ────────────────────────────────── */}
        {!isLoading && !isError && lotes.length > 0 && (
          <>
            <div
              className="hidden overflow-hidden rounded-2xl md:block"
              style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
            >
              <table className="w-full text-left text-sm">
                <thead>
                  <tr style={{ backgroundColor: colors.greenDim }}>
                    <Th colors={colors}>Producto</Th>
                    <Th colors={colors}>Código / Lote</Th>
                    <Th colors={colors}>Proveedor</Th>
                    <Th colors={colors} align="right">Stock</Th>
                    <Th colors={colors} align="right">Precio compra</Th>
                    <Th colors={colors}>Vencimiento</Th>
                    <Th colors={colors}>Estado</Th>
                  </tr>
                </thead>
                <tbody>
                  {lotes.map((lote, idx) => (
                    <FilaLote key={lote.idLote} lote={lote} colors={colors} isLast={idx === lotes.length - 1} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Tarjetas de lotes (mobile) ──────────────────────────── */}
            <div className="flex flex-col gap-3 md:hidden">
              {lotes.map((lote) => (
                <TarjetaLoteMobile key={lote.idLote} lote={lote} colors={colors} />
              ))}
            </div>

            {/* ── Paginación ───────────────────────────────────────────── */}
            <div className="mt-5 flex items-center justify-between">
              <p className="text-sm" style={{ color: colors.textMuted }}>
                Página {pagina} de {totalPaginas} · {total} lote{total !== 1 ? "s" : ""}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pagina <= 1}
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    backgroundColor: colors.bgInput,
                    border: `1px solid ${colors.border}`,
                    color: colors.textSecondary,
                  }}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={pagina >= totalPaginas}
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    backgroundColor: colors.bgInput,
                    border: `1px solid ${colors.border}`,
                    color: colors.textSecondary,
                  }}
                >
                  Siguiente
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

function ResumenCard({
  label,
  value,
  colors,
  tone = "default",
}: {
  label: string;
  value: number;
  colors: Record<string, string>;
  tone?: "default" | "warning" | "danger";
}) {
  const toneColor =
    tone === "warning" ? "#F59E0B" : tone === "danger" ? "#EF4444" : colors.green;

  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.textMuted }}>
          {label}
        </p>
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: toneColor }} />
      </div>
      <p className="mt-2 text-3xl font-bold" style={{ color: colors.textPrimary }}>
        {value}
      </p>
    </div>
  );
}

function Th({
  children,
  colors,
  align = "left",
}: {
  children: React.ReactNode;
  colors: Record<string, string>;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${
        align === "right" ? "text-right" : "text-left"
      }`}
      style={{ color: colors.textSecondary }}
    >
      {children}
    </th>
  );
}

function FilaLote({
  lote,
  colors,
  isLast,
}: {
  lote: LoteListItemType;
  colors: Record<string, string>;
  isLast: boolean;
}) {
  const alerta = getAlertaVencimiento(lote.diasParaVencer, lote.estado);

  return (
    <tr
      className="transition-colors hover:bg-purple-50/40"
      style={{ borderTop: isLast ? "none" : `1px solid ${colors.border}` }}
    >
      <td className="px-4 py-3">
        <p className="font-medium" style={{ color: colors.textPrimary }}>
          {lote.nombreComercial || lote.nombreGenerico}
        </p>
        {lote.nombreComercial && (
          <p className="text-xs" style={{ color: colors.textMuted }}>
            {lote.nombreGenerico}
          </p>
        )}
      </td>
      <td className="px-4 py-3">
        <p className="font-mono text-xs" style={{ color: colors.textPrimary }}>
          {lote.codigo}
        </p>
        <p className="text-xs" style={{ color: colors.textMuted }}>
          Lote {lote.numeroLote}
        </p>
      </td>
      <td className="px-4 py-3" style={{ color: colors.textSecondary }}>
        {lote.proveedor}
      </td>
      <td className="px-4 py-3 text-right font-medium" style={{ color: colors.textPrimary }}>
        {lote.stock}
      </td>
      <td className="px-4 py-3 text-right" style={{ color: colors.textSecondary }}>
        {formatMoneda(lote.precioCompra)}
      </td>
      <td className="px-4 py-3" style={{ color: colors.textSecondary }}>
        {formatFecha(lote.fechaVencimiento)}
      </td>
      <td className="px-4 py-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
          style={{ backgroundColor: alerta.bg, color: alerta.text }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: alerta.dot }} />
          {alerta.label}
        </span>
      </td>
    </tr>
  );
}

function TarjetaLoteMobile({
  lote,
  colors,
}: {
  lote: LoteListItemType;
  colors: Record<string, string>;
}) {
  const alerta = getAlertaVencimiento(lote.diasParaVencer, lote.estado);

  return (
    <div
      className="rounded-2xl p-4"
      style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium" style={{ color: colors.textPrimary }}>
            {lote.nombreComercial || lote.nombreGenerico}
          </p>
          <p className="text-xs" style={{ color: colors.textMuted }}>
            {lote.codigo} · Lote {lote.numeroLote}
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
          style={{ backgroundColor: alerta.bg, color: alerta.text }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: alerta.dot }} />
          {alerta.label}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <InfoMini label="Proveedor" value={lote.proveedor} colors={colors} />
        <InfoMini label="Stock" value={String(lote.stock)} colors={colors} />
        <InfoMini label="Precio compra" value={formatMoneda(lote.precioCompra)} colors={colors} />
        <InfoMini label="Vencimiento" value={formatFecha(lote.fechaVencimiento)} colors={colors} />
      </div>
    </div>
  );
}

function InfoMini({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: Record<string, string>;
}) {
  return (
    <div>
      <p className="text-xs" style={{ color: colors.textMuted }}>
        {label}
      </p>
      <p className="font-medium" style={{ color: colors.textPrimary }}>
        {value}
      </p>
    </div>
  );
}