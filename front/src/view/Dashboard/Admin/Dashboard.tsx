import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  Clock,
  DollarSign,
  Package,
  Receipt,
  Store,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import Loading from "../../../Helpers/Loading";
import { GetDashboardApi } from "../../../Api/DashboardApi";
import type {
  DashboardType,
  LotesPorVencerType,
  StockBajoType,
  UltimasVentasType,
  VentasPorEstadoType,
  VentasPorMesesType,
} from "../../../types";

// ─── Paleta de colores y estilos ─────────────────────────────────────────────
const COLORS = {
  dark: "#4A1A6E",
  medium: "#7B3FA0",
  light: "#F3EBF9",
  border: "#D8B4F0",
  estadoPendiente: { bg: "#FEF3C7", color: "#D97706" },
  estadoCompletado: { bg: "#D1FAE5", color: "#059669" },
  estadoCancelado: { bg: "#FEE2E2", color: "#DC2626" },
} as const;

const ESTADO_STYLES: Record<string, { bg: string; color: string }> = {
  pendiente: COLORS.estadoPendiente,
  completado: COLORS.estadoCompletado,
  cancelado: COLORS.estadoCancelado,
};

const ESTADO_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  completado: "Completado",
  cancelado: "Anulado",
};

const ESTADO_DONUT_COLORS: Record<string, string> = {
  completado: "#059669",
  pendiente: "#D97706",
  cancelado: "#DC2626",
};

// ─── Formatters nativos ──────────────────────────────────────────────────────
const numFormatter = new Intl.NumberFormat("es-BO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const formatBOB = (valor: number): string => `Bs ${numFormatter.format(valor)}`;

const enteroFormatter = new Intl.NumberFormat("es-BO");
const formatEntero = (valor: number): string => enteroFormatter.format(valor);

const compactMonto = (valor: number): string =>
  valor >= 1000
    ? `Bs ${(valor / 1000).toFixed(1).replace(".", ",")}K`
    : `Bs ${Math.round(valor)}`;

const dateTimeFormatter = new Intl.DateTimeFormat("es-BO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const formatFechaHora = (isoStr: string): string => {
  const fecha = new Date(isoStr);
  return Number.isNaN(fecha.getTime()) ? "—" : dateTimeFormatter.format(fecha);
};

const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const mesCorto = (mes: string): string => {
  const [y, m] = mes.split("-");
  const idx = Number(m) - 1;
  return `${idx >= 0 && idx < 12 ? MESES_CORTOS[idx] : mes} ${y.slice(2)}`;
};

const fechaHoy = (): string => {
  const texto = new Intl.DateTimeFormat("es-BO", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

// ─── Componentes auxiliares ──────────────────────────────────────────────────
function EmptyBox({ mensaje }: { mensaje: string }) {
  return <div className="py-10 text-center text-xs text-gray-400">{mensaje}</div>;
}

function MensajeError({ mensaje }: { mensaje: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-8 text-center max-w-md">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="text-sm font-semibold text-red-700">{mensaje}</p>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  valor,
  sub,
  accentColor,
  chip,
}: {
  icon: ReactNode;
  label: string;
  valor: string;
  sub?: string;
  accentColor: string;
  chip?: ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex items-start gap-4 bg-white shadow-sm border animate-fadeIn"
      style={{ borderColor: COLORS.border }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="text-2xl font-extrabold mt-0.5 truncate text-gray-800">{valor}</p>
        {sub && <p className="text-xs mt-0.5 text-gray-500 truncate">{sub}</p>}
      </div>
      {chip}
    </div>
  );
}

function KpiMini({
  icon,
  label,
  valor,
  accentColor,
}: {
  icon: ReactNode;
  label: string;
  valor: string;
  accentColor: string;
}) {
  return (
    <div
      className="rounded-2xl px-4 py-4 bg-white shadow-sm border flex items-center gap-3 animate-fadeIn"
      style={{ borderColor: COLORS.border }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 truncate">{label}</p>
        <p className="text-xl font-extrabold truncate text-gray-800">{valor}</p>
      </div>
    </div>
  );
}

function SectionCard({
  titulo,
  sub,
  icono,
  extra,
  children,
}: {
  titulo: string;
  sub?: string;
  icono: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border p-5 animate-fadeIn" style={{ borderColor: COLORS.border }}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span
            className="w-1.5 h-7 rounded-full flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${COLORS.dark}, ${COLORS.medium})` }}
          />
          <div>
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              {icono}
              {titulo}
            </h2>
            {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
          </div>
        </div>
        {extra}
      </div>
      {children}
    </div>
  );
}

// ─── Gráfico de barras: ventas por mes ───────────────────────────────────────
function BarChartMensual({ datos }: { datos: VentasPorMesesType }) {
  const max = Math.max(...datos.map((d) => d.monto), 1);
  const totalMonto = datos.reduce((acc, d) => acc + d.monto, 0);

  if (datos.length === 0) return <EmptyBox mensaje="Sin datos de ventas" />;

  return (
    <div>
      <div className="flex items-end gap-1.5 h-40">
        {datos.map((d, i) => {
          const pct = d.monto > 0 ? Math.max((d.monto / max) * 100, 3) : 0;
          const actual = i === datos.length - 1;
          return (
            <div
              key={d.mes}
              className="flex-1 flex flex-col items-center gap-1 h-full justify-end min-w-0"
              title={`${mesCorto(d.mes)}: ${formatBOB(d.monto)} · ${d.cantidad} ventas`}
            >
              <span className="text-[10px] font-semibold text-gray-500">{d.monto > 0 ? compactMonto(d.monto) : ""}</span>
              <div
                className="w-full rounded-t-md transition-all duration-300"
                style={{
                  height: `${pct}%`,
                  background: actual
                    ? "linear-gradient(180deg, #FBBF24, #D97706)"
                    : `linear-gradient(180deg, ${COLORS.medium}, ${COLORS.dark})`,
                }}
              />
              <span className="text-[10px] text-gray-400 text-center truncate w-full">{mesCorto(d.mes)}</span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-3 text-center">
        Total del período: <b className="text-gray-800">{formatBOB(totalMonto)}</b>
      </p>
    </div>
  );
}

// ─── Gráfico de dona: ventas por estado ──────────────────────────────────────
function DonutEstados({ datos }: { datos: VentasPorEstadoType }) {
  const total = datos.reduce((acc, d) => acc + d.cantidad, 0);
  if (total <= 0) return <EmptyBox mensaje="Sin ventas registradas" />;

  const R = 40;
  const CIRC = 2 * Math.PI * R;
  let acumulado = 0;

  return (
    <div>
      <div className="relative w-44 h-44 mx-auto">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={R} fill="none" stroke="#EDF2F7" strokeWidth="13" />
          {datos.map((d) => {
            const len = (d.cantidad / total) * CIRC;
            const segmento = (
              <circle
                key={d.estado}
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke={ESTADO_DONUT_COLORS[d.estado] ?? "#9CA3AF"}
                strokeWidth="13"
                strokeDasharray={`${len} ${CIRC - len}`}
                strokeDashoffset={-acumulado}
              />
            );
            acumulado += len;
            return segmento;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase tracking-wider text-gray-400">Ventas</span>
          <span className="text-lg font-extrabold text-gray-800">{formatEntero(total)}</span>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {datos.map((d) => (
          <div key={d.estado} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-gray-600">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: ESTADO_DONUT_COLORS[d.estado] ?? "#9CA3AF" }}
              />
              {ESTADO_LABELS[d.estado] ?? d.estado}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">
                {formatEntero(d.cantidad)} · {((d.cantidad / total) * 100).toFixed(1).replace(".", ",")}%
              </span>
              <span className="font-bold text-gray-800 w-20 text-right">{formatBOB(d.monto)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Lista de barras horizontales ────────────────────────────────────────────
function HBarList({
  items,
  color,
  valorFormatter,
}: {
  items: { etiqueta: string; valor: number; detalle?: string }[];
  color: string;
  valorFormatter: (valor: number) => string;
}) {
  if (items.length === 0) return <EmptyBox mensaje="Sin datos" />;

  const max = Math.max(...items.map((i) => i.valor), 1);

  return (
    <div className="space-y-4">
      {items.map((i) => (
        <div key={i.etiqueta}>
          <div className="flex items-center justify-between mb-1 gap-2">
            <span className="text-xs font-semibold text-gray-700 truncate">{i.etiqueta}</span>
            <span className="text-xs font-bold text-gray-800 whitespace-nowrap">{valorFormatter(i.valor)}</span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(i.valor / max) * 100}%`, background: `linear-gradient(90deg, ${color}, ${color})` }}
            />
          </div>
          {i.detalle && <p className="text-[10px] text-gray-400 mt-0.5">{i.detalle}</p>}
        </div>
      ))}
    </div>
  );
}

// ─── Tablas de alertas y actividad reciente ──────────────────────────────────
function TablaStockBajo({ datos }: { datos: StockBajoType }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
            {["PRODUCTO", "STOCK", "MÍNIMO"].map((c) => (
              <th key={c} className="px-4 py-2.5 text-left text-xs font-bold tracking-wider text-gray-500">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {datos.length === 0 ? (
            <tr>
              <td colSpan={3}>
                <EmptyBox mensaje="Ningún producto bajo el mínimo" />
              </td>
            </tr>
          ) : (
            datos.map((p) => {
              const agotado = p.stockTotal === 0;
              return (
                <tr key={p.idProducto} className="transition-colors hover:bg-gray-50/70">
                  <td className="px-4 py-2.5">
                    <p className="font-semibold text-gray-800">{p.nombreGenerico}</p>
                    <p className="text-[11px] text-gray-400">{p.nombreComercial ?? "—"}</p>
                  </td>
                  <td className="px-4 py-2.5 text-left">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: agotado ? COLORS.estadoCancelado.bg : "#FEF3C7",
                        color: agotado ? COLORS.estadoCancelado.color : "#D97706",
                      }}
                    >
                      {agotado && <XCircle className="w-3 h-3" />}
                      {agotado ? "AGOTADO" : formatEntero(p.stockTotal)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-left text-gray-600">{formatEntero(p.stockMinimo)}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function TablaLotesPorVencer({ datos }: { datos: LotesPorVencerType }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
            {["PRODUCTO", "LOTE", "STOCK", "VENCE EN"].map((c) => (
              <th key={c} className="px-4 py-2.5 text-left text-xs font-bold tracking-wider text-gray-500">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {datos.length === 0 ? (
            <tr>
              <td colSpan={4}>
                <EmptyBox mensaje="Sin lotes próximos a vencer" />
              </td>
            </tr>
          ) : (
            datos.map((l) => {
              const critico = l.diasParaVencer <= 15;
              return (
                <tr key={l.idLote} className="transition-colors hover:bg-gray-50/70">
                  <td className="px-4 py-2.5">
                    <p className="font-semibold text-gray-800">{l.nombreGenerico}</p>
                    <p className="text-[11px] text-gray-400">{l.concentracion || l.nombreComercial || "—"}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="text-xs font-semibold text-gray-700">{l.numeroLote}</p>
                    <p className="text-[11px] text-gray-400">{l.codigoLote}</p>
                  </td>
                  <td className="px-4 py-2.5 text-left text-gray-600">{formatEntero(l.stock)}</td>
                  <td className="px-4 py-2.5 text-left">
                    <span
                      className="inline-flex px-2 py-1 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: critico ? COLORS.estadoCancelado.bg : "#FEF3C7",
                        color: critico ? COLORS.estadoCancelado.color : "#D97706",
                      }}
                    >
                      {l.diasParaVencer} días
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function TablaUltimasVentas({ datos }: { datos: UltimasVentasType }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
            {["N° VENTA", "FECHA & HORA", "CLIENTE", "SUCURSAL", "TIPO PAGO", "ESTADO", "TOTAL"].map((c) => (
              <th key={c} className="px-4 py-2.5 text-left text-xs font-bold tracking-wider text-gray-500">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {datos.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <EmptyBox mensaje="Sin ventas recientes" />
              </td>
            </tr>
          ) : (
            datos.map((v) => {
              const est = ESTADO_STYLES[v.estado] || ESTADO_STYLES.pendiente;
              return (
                <tr key={v.idVenta} className="transition-colors hover:bg-gray-50/70">
                  <td className="px-4 py-2.5">
                    <span className="font-bold text-sm" style={{ color: COLORS.dark }}>
                      #{String(v.idVenta).padStart(5, "0")}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600 text-xs">{formatFechaHora(v.fechaCreacion)}</td>
                  <td className="px-4 py-2.5 font-semibold text-gray-800">{v.cliente ?? "Cliente General"}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-600">{v.sucursal ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className="inline-flex px-2 py-1 rounded-full text-[11px] font-bold"
                      style={{ backgroundColor: COLORS.light, color: COLORS.dark }}
                    >
                      {v.tipoPago ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: est.bg, color: est.color }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: est.color }} />
                      {ESTADO_LABELS[v.estado] ?? v.estado}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-extrabold text-gray-800">{formatBOB(v.total)}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function Dashboard() {
  const { data, isLoading, error } = useQuery<DashboardType>({
    queryKey: ["Dashboard"],
    queryFn: GetDashboardApi,
  });

  if (isLoading) return <Loading />;

  if (error || !data) {
    return <MensajeError mensaje={error instanceof Error ? error.message : "Error al cargar el dashboard"} />;
  }

  const { resumen: res, ventasPorMeses, productosMasVendidos, porEstado, porSucursal, porFormaPago, stockBajo, lotesPorVencer, ultimasVentas } = data;

  const r = res.kpis;

  const variacionMes =
    r.ventasMes.comparativoMesAnterior > 0
      ? ((r.ventasMes.monto - r.ventasMes.comparativoMesAnterior) / r.ventasMes.comparativoMesAnterior) * 100
      : null;

  const chipVariacion = variacionMes !== null && (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap"
      style={{
        backgroundColor: variacionMes >= 0 ? "#D1FAE5" : "#FEE2E2",
        color: variacionMes >= 0 ? "#059669" : "#DC2626",
      }}
    >
      {variacionMes >= 0 ? "▲" : "▼"} {Math.abs(variacionMes).toFixed(1).replace(".", ",")}%
    </span>
  );

  const topProductos: { etiqueta: string; valor: number; detalle?: string }[] = productosMasVendidos.map((p) => ({
    etiqueta: p.nombreGenerico,
    valor: p.unidades,
    detalle: `${p.nombreComercial ?? ""} · ${formatBOB(p.monto)}`,
  }));

  const sucursales: { etiqueta: string; valor: number; detalle?: string }[] = porSucursal.map((s) => ({
    etiqueta: s.nombre,
    valor: s.monto,
    detalle: `${formatEntero(s.cantidad)} ventas`,
  }));

  const formasPago: { etiqueta: string; valor: number; detalle?: string }[] = porFormaPago.map((f) => ({
    etiqueta: f.tipoPago,
    valor: f.monto,
    detalle: `${formatEntero(f.cantidad)} ventas`,
  }));

  return (
    <div className="min-h-screen p-6 text-gray-800">
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
            <span
              className="w-1.5 h-8 rounded-full flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${COLORS.dark}, ${COLORS.medium})` }}
            />
            <span>
              Panel de Control
              <span
                className="ml-3 text-xs font-bold px-2.5 py-1 rounded-lg align-middle"
                style={{ backgroundColor: COLORS.light, color: COLORS.dark }}
              >
                Dashboard
              </span>
            </span>
          </h1>
          <p className="text-sm mt-1 text-gray-500 ml-5">
            Resumen general de ventas, inventario y operaciones de la farmacia
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-white border shadow-sm" style={{ borderColor: COLORS.border, color: COLORS.dark }}>
          <CalendarDays className="w-4 h-4" />
          {fechaHoy()}
        </div>
      </div>

      {/* ── KPIS PRINCIPALES ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <KpiCard
          accentColor={COLORS.medium}
          icon={<DollarSign className="w-5 h-5" />}
          label="Ventas de Hoy"
          valor={formatBOB(r.ventasHoy.monto)}
          sub={`${formatEntero(r.ventasHoy.cantidad)} ventas registradas hoy`}
        />
        <KpiCard
          accentColor={COLORS.dark}
          icon={<TrendingUp className="w-5 h-5" />}
          label="Ventas del Mes"
          valor={formatBOB(r.ventasMes.monto)}
          sub={`${formatEntero(r.ventasMes.cantidad)} ventas en el mes`}
          chip={chipVariacion}
        />
        <KpiCard
          accentColor="#059669"
          icon={<Receipt className="w-5 h-5" />}
          label="Ingresos Totales"
          valor={formatBOB(r.ventasTotales.monto)}
          sub={`${formatEntero(r.ventasTotales.cantidad)} ventas completadas`}
        />
        <KpiCard
          accentColor="#D97706"
          icon={<Clock className="w-5 h-5" />}
          label="Pendientes"
          valor={formatEntero(r.ventasPendientes)}
          sub={`${formatEntero(r.ventasAnuladas)} ventas anuladas`}
        />
      </div>

      {/* ── KPIS SECUNDARIOS ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <KpiMini accentColor="#2563EB" icon={<Users className="w-4 h-4" />} label="Clientes" valor={formatEntero(r.totalClientes)} />
        <KpiMini accentColor="#7C3AED" icon={<Package className="w-4 h-4" />} label="Productos" valor={formatEntero(r.totalProductos)} />
        <KpiMini accentColor="#0EA5E9" icon={<UserRound className="w-4 h-4" />} label="Usuarios" valor={formatEntero(r.totalUsuarios)} />
        <KpiMini accentColor="#DC2626" icon={<AlertTriangle className="w-4 h-4" />} label="Stock Bajo" valor={formatEntero(r.stockBajo)} />
        <KpiMini accentColor="#D97706" icon={<CalendarDays className="w-4 h-4" />} label="Por Vencer" valor={formatEntero(r.lotesPorVencer)} />
        <KpiMini accentColor="#DC2626" icon={<XCircle className="w-4 h-4" />} label="Vencidos" valor={formatEntero(r.lotesVencidos)} />
      </div>

      {/* ── GRÁFICOS: VENTAS ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <SectionCard
            titulo="Ventas por Mes"
            sub="Monto acumulado (Bs) de los últimos 12 meses"
            icono={<TrendingUp className="w-4 h-4" style={{ color: COLORS.dark }} />}
          >
            <BarChartMensual datos={ventasPorMeses} />
          </SectionCard>
        </div>
        <SectionCard
          titulo="Ventas por Estado"
          sub="Distribución de todas las ventas"
          icono={<Activity className="w-4 h-4" style={{ color: COLORS.dark }} />}
        >
          <DonutEstados datos={porEstado} />
        </SectionCard>
      </div>

      {/* ── GRÁFICOS: RANKINGS ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <SectionCard
          titulo="Más Vendidos"
          sub="Por unidades despachadas"
          icono={<Package className="w-4 h-4" style={{ color: COLORS.dark }} />}
        >
          <HBarList items={topProductos} color={COLORS.medium} valorFormatter={(v) => `${formatEntero(v)} u.`} />
        </SectionCard>
        <SectionCard
          titulo="Por Sucursal"
          sub="Monto vendido por punto de venta"
          icono={<Store className="w-4 h-4" style={{ color: COLORS.dark }} />}
        >
          <HBarList items={sucursales} color={COLORS.dark} valorFormatter={formatBOB} />
        </SectionCard>
        <SectionCard
          titulo="Forma de Pago"
          sub="Monto recaudado por método"
          icono={<Wallet className="w-4 h-4" style={{ color: COLORS.dark }} />}
        >
          <HBarList items={formasPago} color="#059669" valorFormatter={formatBOB} />
        </SectionCard>
      </div>

      {/* ── ALERTAS DE INVENTARIO ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <SectionCard
          titulo="Stock Bajo"
          sub="Productos por debajo del mínimo (stockMinimo)"
          icono={<AlertTriangle className="w-4 h-4" style={{ color: COLORS.dark }} />}
          extra={
            <span
              className="inline-flex px-2 py-1 rounded-lg text-xs font-bold"
              style={{ backgroundColor: COLORS.estadoCancelado.bg, color: COLORS.estadoCancelado.color }}
            >
              {stockBajo.length} alertas
            </span>
          }
        >
          <TablaStockBajo datos={stockBajo} />
        </SectionCard>
        <SectionCard
          titulo="Lotes por Vencer"
          sub="Lotes activos que vencen en los próximos 30 días"
          icono={<CalendarDays className="w-4 h-4" style={{ color: COLORS.dark }} />}
        >
          <TablaLotesPorVencer datos={lotesPorVencer} />
        </SectionCard>
      </div>

      {/* ── ACTIVIDAD RECIENTE ────────────────────────────────────────────── */}
      <SectionCard
        titulo="Últimas Ventas"
        sub="Registros más recientes del sistema"
        icono={<Receipt className="w-4 h-4" style={{ color: COLORS.dark }} />}
      >
        <TablaUltimasVentas datos={ultimasVentas} />
      </SectionCard>
    </div>
  );
}