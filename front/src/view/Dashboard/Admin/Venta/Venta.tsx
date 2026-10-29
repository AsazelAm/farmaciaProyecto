import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useMemo, useState, useCallback } from "react";
import Loading from "../../../../Helpers/Loading";
import { GetVentasApi, GetEstadisticasVentasApi } from "../../../../Api/VentaApi";
import type { VentaType, VentaEstadisticasType, IVentaFiltros } from "../../../../types";

const GetVenta = lazy(() => import("../../../../Components/Venta/GetVenta"));

// ─── Paleta de colores y Estilos ──────────────────────────────────────────────
const COLORS = {
  dark: "#4A1A6E",
  medium: "#7B3FA0",
  light: "#F3EBF9",
  border: "#D8B4F0",
  bgCard: "#FFFFFF",
  bgRowHover: "#F9F6FC",
  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  estadoPendiente:  { bg: "#FEF3C7", color: "#D97706", dot: "#D97706" },
  estadoCompletado: { bg: "#D1FAE5", color: "#059669", dot: "#059669" },
  estadoCancelado:  { bg: "#FEE2E2", color: "#DC2626", dot: "#DC2626" },
  estadoDevParcial: { bg: "#FFEDD5", color: "#EA580C", dot: "#EA580C" },
  estadoDevTotal:   { bg: "#EDE9FE", color: "#7C3AED", dot: "#7C3AED" },
} as const;

const ESTADO_STYLES = {
  pendiente: COLORS.estadoPendiente,
  completado: COLORS.estadoCompletado,
  cancelado: COLORS.estadoCancelado,
  devuelto_parcial: COLORS.estadoDevParcial,
  devuelto_total: COLORS.estadoDevTotal,
};

type TipoEstadoVenta = keyof typeof ESTADO_STYLES;

const ESTADO_LABELS: Record<TipoEstadoVenta, string> = {
  pendiente: "Pendiente",
  completado: "Completado",
  cancelado: "Anulado",
  devuelto_parcial: "Dev. Parcial",
  devuelto_total: "Dev. Total",
};

const TIPOS_PAGO = ["Efectivo", "QR", "Transferencia", "Tarjeta de crédito", "Tarjeta de débito"] as const;

// Normaliza valores opcionales a minúsculas para comparaciones seguras (evita repetir `?? "" .toLowerCase()`)
const norm = (valor?: string | null): string => (valor ?? "").toLowerCase();

// ─── Formatters Nativos (Instanciados una vez para mayor rendimiento) ──────────
const numFormatter = new Intl.NumberFormat("es-BO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const formatBOB = (valor: number): string => `Bs ${numFormatter.format(valor)}`;

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

const formatNumeroVenta = (idVenta: number) => `#${String(idVenta).padStart(5, "0")}`;

// ─── Ícono según el método de pago ────────────────────────────────────────────
// Icono por defecto (efectivo / otros) y reglas para los métodos especiales.
const PAGO_ICON_DEFAULT_PATH =
  "M12 8c-1.657 0-3 .672-3 1.5S10.343 11 12 11s3 .672 3 1.5-1.343 1.5-3 1.5m0-6V6m0 1.5V6m0 12v-1.5m0 1.5V18M21 12a9 9 0 11-18 0 9 9 0 0118 0z";

const PAGO_ICON_RULES: { test: (t: string) => boolean; path: string }[] = [
  {
    test: (t) => t.includes("tarjeta"),
    path: "M3 10h18M7 15h1m4 0h1m-9 4h16a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  {
    test: (t) => t.includes("qr") || t.includes("transfer"),
    path: "M12 4v1m6 11h2m-6 0h-2v2m0-8h.01M6 9h.01M9 9h.01M9 6h.01M6 6h.01M17 6h.01M14 6h.01M14 9h.01M17 9h.01M6 17h.01M9 17h.01M4 4h4v4H4V4zm10 0h4v4h-4V4zM4 14h4v4H4v-4z",
  },
];

function TipoPagoIcon({ tipoPago }: { tipoPago: string }) {
  const t = tipoPago.toLowerCase();
  const path = PAGO_ICON_RULES.find((r) => r.test(t))?.path ?? PAGO_ICON_DEFAULT_PATH;
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
  );
}

// ─── Componentes Auxiliares ──────────────────────────────────────────────────
function StatCard({ icon, titulo, valor, sub, accentColor = COLORS.dark }: {
  icon: React.ReactNode;
  titulo: string;
  valor: string;
  sub: string;
  accentColor?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex items-start gap-4 flex-1 min-w-0 bg-white shadow-sm border"
      style={{ borderColor: COLORS.border }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{titulo}</p>
        <p className="text-2xl font-extrabold mt-0.5 truncate text-gray-800">{valor}</p>
        <p className="text-xs mt-0.5 text-gray-500">{sub}</p>
      </div>
    </div>
  );
}

// ─── Componente Principal ────────────────────────────────────────────────────
export default function Venta() {
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<TipoEstadoVenta | "todos">("todos");
  const [sucursalFiltro, setSucursalFiltro] = useState("");
  const [tipoPagoFiltro, setTipoPagoFiltro] = useState("");

  const [showGetVenta, setShowGetVenta] = useState(false);
  const [idVentaSeleccionada, setIdVentaSeleccionada] = useState<number | null>(null);

  // Consultas
  const filtrosApi = useMemo<IVentaFiltros>(
    () => ({
      ...(estadoFiltro !== "todos" && { estado: estadoFiltro as IVentaFiltros["estado"] }),
      pagina: 1,
      porPagina: 50,
    }),
    [estadoFiltro]
  );

  const { data: ventasResponse, isLoading: loadingVentas } = useQuery({
    queryKey: ["VentasAll", filtrosApi],
    queryFn: () => GetVentasApi(filtrosApi),
  });

  const { data: stats, isLoading: loadingStats } = useQuery<VentaEstadisticasType>({
    queryKey: ["VentasEstadisticas"],
    queryFn: GetEstadisticasVentasApi,
  });

  const openModal = useCallback((idVenta: number) => {
    setIdVentaSeleccionada(idVenta);
    setShowGetVenta(true);
  }, []);

  // Filtros y Derivaciones
  const listaVentas = ventasResponse?.data ?? [];

  const ventasFiltradas = useMemo<VentaType[]>(() => {
    const query = search.trim().toLowerCase();
    const sucursalQuery = sucursalFiltro.toLowerCase();

    return listaVentas.filter((v) => {
      const matchSearch =
        !query ||
        [formatNumeroVenta(v.idVenta), v.cliente, v.clienteNit, v.usuario].some((campo) =>
          norm(campo).includes(query)
        );
      const matchSucursal = !sucursalFiltro || norm(v.sucursal).includes(sucursalQuery);
      const matchTipoPago = !tipoPagoFiltro || (v.tipoPago ?? "") === tipoPagoFiltro;
      return matchSearch && matchSucursal && matchTipoPago;
    });
  }, [listaVentas, search, sucursalFiltro, tipoPagoFiltro]);

  const sucursalesUnicas = useMemo(() => {
    return Array.from(new Set(listaVentas.map((v) => v.sucursal).filter(Boolean))) as string[];
  }, [listaVentas]);

  // Tarjetas de estadísticas (independientes de los filtros de la tabla)
  const dashboardStats = useMemo(() => {
    if (!stats?.porEstado) {
      return { totalRegistros: 0, ingresosFacturados: 0, porConfirmar: 0, ticketPromedio: 0 };
    }

    let totalRegistros = 0;
    let ingresosFacturados = 0;
    let noAnuladas = 0;
    let porConfirmar = 0;

    for (const s of stats.porEstado as any[]) {
      const cantidad = Number(s.cantidad ?? 0);
      const monto = Number(s.monto ?? 0);
      totalRegistros += cantidad;
      if (s.estado !== "cancelado") {
        ingresosFacturados += monto;
        noAnuladas += cantidad;
      }
      if (s.estado === "pendiente") porConfirmar += cantidad;
    }

    const ticketPromedio = noAnuladas > 0 ? ingresosFacturados / noAnuladas : 0;
    return { totalRegistros, ingresosFacturados, porConfirmar, ticketPromedio };
  }, [stats?.porEstado]);

  if (loadingVentas || loadingStats) return <Loading />;

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
              Gestión Farmacéutica
              <span
                className="ml-3 text-xs font-bold px-2.5 py-1 rounded-lg align-middle"
                style={{ backgroundColor: COLORS.light, color: COLORS.dark }}
              >
                Punto de Venta
              </span>
            </span>
          </h1>
          <p className="text-sm mt-1 text-gray-500 ml-5">
            Módulo de Registro de Ventas y Recibos
          </p>
        </div>
      </div>

      {/* ── TARJETAS DE ESTADÍSTICAS ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          accentColor={COLORS.dark}
          titulo="Total Registros Ventas"
          valor={`${dashboardStats.totalRegistros}`}
          sub="En tiempo real"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .672-3 1.5S10.343 11 12 11s3 .672 3 1.5-1.343 1.5-3 1.5m0-6V6m0 1.5V6m0 12v-1.5m0 1.5V18M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          accentColor="#059669"
          titulo="Ingresos por Ventas"
          valor={formatBOB(dashboardStats.ingresosFacturados)}
          sub="Excluye anulados"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
        <StatCard
          accentColor="#D97706"
          titulo="Por Confirmar"
          valor={`${dashboardStats.porConfirmar}`}
          sub="Requiere revisión de caja"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          accentColor={COLORS.medium}
          titulo="Ticket Promedio"
          valor={formatBOB(dashboardStats.ticketPromedio)}
          sub="Por cliente atendido"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
        />
      </div>

      {/* ── PANEL PRINCIPAL ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl shadow-sm border bg-white overflow-hidden" style={{ borderColor: COLORS.border }}>
        {/* Cabecera del panel */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-6 py-5 bg-white" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
          <div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" style={{ color: COLORS.dark }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              <h2 className="text-base font-bold text-gray-800">Registro General de Ventas (&apos;venta&apos;)</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Mostrando {ventasFiltradas.length} de {ventasResponse?.total ?? 0} registros
            </p>
          </div>
        </div>

        {/* ── BARRA DE FILTROS ──────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-4 items-center px-6 py-4 bg-gray-50/50" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
          <div className="relative flex-1 w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por # Venta, Cliente, NIT o Usuario..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm outline-none border transition-colors bg-white text-gray-800 focus:border-purple-500"
              style={{ borderColor: COLORS.border }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-gray-600">✕</button>
            )}
          </div>

          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value as TipoEstadoVenta | "todos")}
            className="px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer border bg-white text-gray-700 w-full lg:w-auto"
            style={{ borderColor: COLORS.border, minWidth: "180px" }}
          >
            <option value="todos">Todos los Estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Anulado</option>
            <option value="devuelto_parcial">Devuelto Parcial</option>
            <option value="devuelto_total">Devuelto Total</option>
          </select>

          <select
            value={sucursalFiltro}
            onChange={(e) => setSucursalFiltro(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer border bg-white text-gray-700 w-full lg:w-auto"
            style={{ borderColor: COLORS.border, minWidth: "200px" }}
          >
            <option value="">Todas las Sucursales</option>
            {sucursalesUnicas.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={tipoPagoFiltro}
            onChange={(e) => setTipoPagoFiltro(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer border bg-white text-gray-700 w-full lg:w-auto"
            style={{ borderColor: COLORS.border, minWidth: "180px" }}
          >
            <option value="">Todos los Pagos</option>
            {TIPOS_PAGO.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* ── TABLA ────────────────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <div className="max-h-[calc(116vh-320px)] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-white" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  {["N° VENTA", "FECHA & HORA", "CLIENTE ", "ATENDIDO POR ", "SUCURSAL", "TIPO PAGO", "ESTADO", "MONTO TOTAL", "ACCIONES"].map((col) => (
                    <th key={col} className="px-5 py-3 text-left text-xs font-bold tracking-wider text-gray-500">{col}</th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {ventasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <p className="font-semibold text-gray-500">No se encontraron ventas</p>
                        <p className="text-xs text-gray-400">Intenta cambiar los filtros de búsqueda</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  ventasFiltradas.map((venta) => {
                    const estStyle = ESTADO_STYLES[venta.estado as TipoEstadoVenta] || ESTADO_STYLES.pendiente;
                    return (
                      <tr key={venta.idVenta} className="transition-colors hover:bg-gray-50/80">
                        <td className="px-5 py-4">
                          <span className="font-bold text-sm" style={{ color: COLORS.dark }}>{formatNumeroVenta(venta.idVenta)}</span>
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="text-xs">{formatFechaHora(venta.fechaCreacion)}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-800">{venta.cliente ?? "Cliente General"}</p>
                          <p className="text-[11px] text-gray-400">NIT/CI: {venta.clienteNit ?? "0"}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-800">{venta.usuario ?? "—"}</p>
                          <p className="text-[11px]" style={{ color: COLORS.medium }}>{venta.usuarioRol ?? ""}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.medium }} />
                            <span className="text-xs text-gray-600">{venta.sucursal ?? "—"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: COLORS.light, color: COLORS.dark }}>
                            <TipoPagoIcon tipoPago={venta.tipoPago ?? ""} />
                            {venta.tipoPago ?? "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{ backgroundColor: estStyle.bg, color: estStyle.color }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: estStyle.dot }} />
                            {ESTADO_LABELS[venta.estado as TipoEstadoVenta]}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-extrabold text-sm text-gray-800">{formatBOB(venta.total ?? 0)}</span>
                          <p className="text-[11px] text-gray-400">{venta.totalItems ?? 0} producto{(venta.totalItems ?? 0) === 1 ? "" : "s"}</p>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => openModal(venta.idVenta)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-white shadow-sm hover:brightness-110 active:scale-95"
                            style={{ backgroundColor: COLORS.dark }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            Ver Detalle
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Suspense fallback={<Loading />}>
        {showGetVenta && (
          <GetVenta isOpen={showGetVenta} setIsOpen={setShowGetVenta} idVenta={idVentaSeleccionada} />
        )}
      </Suspense>
    </div>
  );
}