import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import Loading from "../../../../Helpers/Loading";
import {
  GetComprasApi,
  GetEstadisticasComprasApi,
} from "../../../../Api/CompraLoteApi";
import type {
  CompraType,
  CompraEstadisticasType,
  ICompraFiltros,
} from "../../../../types";

// ─── Paleta de colores (Unificada con Productos/Proveedor) ────────────────────
const COLORS = {
  dark: "#4A1A6E",      // Lila Oscuro (Botones principales, acentos fuertes)
  medium: "#7B3FA0",    // Lila Intermedio (Bordes activos, barras de título)
  light: "#F3EBF9",     // Lila muy suave (Fondo de inputs, badges secundarios)
  border: "#D8B4F0",    // Borde general fino
  bgCard: "#FFFFFF",    // Fondo de las tarjetas y tabla (Blanco limpio)
  bgRowHover: "#F9F6FC", // Fila hover sutil

  // Textos
  textPrimary: "#1F2937",   // text-gray-800 para legibilidad alta
  textSecondary: "#6B7280", // text-gray-500 para descripciones
  textMuted: "#9CA3AF",     // text-gray-400 para textos muy tenues

  // Estados Sanitarios / Transacciones
  estadoPendiente:   { bg: "#FEF3C7", color: "#D97706", dot: "#D97706" }, // Ámbar/Amarillo
  estadoCompletado:  { bg: "#D1FAE5", color: "#059669", dot: "#059669" }, // Verde Sanitario
  estadoCancelado:   { bg: "#FEE2E2", color: "#DC2626", dot: "#DC2626" }, // Rojo
};

// ─── Helper: badge de estado ──────────────────────────────────────────────────
function EstadoBadge({ estado }: { estado: string }) {
  const cfg =
    estado === "completado"
      ? COLORS.estadoCompletado
      : estado === "cancelado"
      ? COLORS.estadoCancelado
      : COLORS.estadoPendiente;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          estado === "pendiente" ? "animate-pulse" : ""
        }`}
        style={{ backgroundColor: cfg.dot }}
      />
      {estado}
    </span>
  );
}

// ─── Helper: formatear moneda en BOB ─────────────────────────────────────────
function formatBOB(valor: number): string {
  return `BOB ${valor.toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ─── Helper: formatear fecha ISO a "dd/mm/yyyy" ───────────────────────────────
function formatFecha(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── Tarjeta de estadísticas del dashboard ───────────────────────────────────
function StatCard({
  icon,
  titulo,
  valor,
  sub,
  accentColor = COLORS.dark,
}: {
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
      {/* Icono con fondo lila o acento atenuado */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
      >
        {icon}
      </div>

      {/* Texto */}
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
          {titulo}
        </p>
        <p className="text-2xl font-extrabold mt-0.5 truncate text-gray-800">
          {valor}
        </p>
        <p className="text-xs mt-0.5 text-gray-500">
          {sub}
        </p>
      </div>
    </div>
  );
}

export default function Compra() {
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<
    "todos" | "pendiente" | "completado" | "cancelado"
  >("todos");
  const [proveedorFiltro, setProveedorFiltro] = useState("");

  const filtrosApi = useMemo<ICompraFiltros>(
    () => ({
      ...(estadoFiltro !== "todos" && { estado: estadoFiltro as ICompraFiltros["estado"] }),
      pagina: 1,
      porPagina: 50,
    }),
    [estadoFiltro]
  );

  const { data: comprasResponse, isLoading: loadingCompras } = useQuery({
    queryKey: ["ComprasAll", filtrosApi],
    queryFn: () => GetComprasApi(filtrosApi),
  });

  const { data: stats, isLoading: loadingStats } = useQuery<CompraEstadisticasType>({
    queryKey: ["ComprasEstadisticas"],
    queryFn: GetEstadisticasComprasApi,
  });

  const comprasFiltradas = useMemo<CompraType[]>(() => {
    const lista: CompraType[] = comprasResponse?.data ?? [];
    return lista.filter((c) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        (c.numeroFactura ?? "").toLowerCase().includes(q) ||
        (c.proveedor ?? "").toLowerCase().includes(q);

      const matchProveedor =
        !proveedorFiltro ||
        (c.proveedor ?? "").toLowerCase().includes(proveedorFiltro.toLowerCase());

      return matchSearch && matchProveedor;
    });
  }, [comprasResponse, search, proveedorFiltro]);

  const proveedoresUnicos = useMemo(() => {
    const lista: CompraType[] = comprasResponse?.data ?? [];
    return Array.from(new Set(lista.map((c) => c.proveedor).filter(Boolean))) as string[];
  }, [comprasResponse]);

  const totalInversion =
    stats?.porEstado?.reduce((acc: number, s: any) => acc + Number(s.monto ?? 0), 0) ?? 0;

  const cantidadFacturas =
    stats?.porEstado?.reduce((acc: number, s: any) => acc + Number(s.cantidad ?? 0), 0) ?? 0;

  const cantidadCompletadas =
    stats?.porEstado?.find((s: any) => s.estado === "completado")?.cantidad ?? 0;

  const lotesPendientes = stats?.lotesProximosVencer ?? 0;

  if (loadingCompras || loadingStats) return <Loading />;

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
                Control de Inventario
              </span>
            </span>
          </h1>
          <p className="text-sm mt-1 text-gray-500 ml-5">
            Módulo de Liquidación de Compras y Control Sanitario de Lotes
          </p>
        </div>
      </div>

      {/* ── TARJETAS DE ESTADÍSTICAS ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          accentColor={COLORS.dark}
          titulo="Inversión Total"
          valor={formatBOB(totalInversion)}
          sub="Todas las compras registradas"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />

        <StatCard
          accentColor={COLORS.medium}
          titulo="Facturas Ingresadas"
          valor={`${cantidadFacturas} compras`}
          sub="Total en el sistema"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />

        <StatCard
          accentColor="#059669"
          titulo="Completados"
          valor={`${cantidadCompletadas} transacciones`}
          sub="Compras liquidadas"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          accentColor="#D97706"
          titulo="Lotes por Verificar"
          valor={`${lotesPendientes} pendientes`}
          sub="Próximos a vencer (30 días)"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
      </div>

      {/* ── PANEL PRINCIPAL (tabla + controles) ─────────────────────────────── */}
      <div
        className="rounded-2xl shadow-sm border bg-white overflow-hidden"
        style={{ borderColor: COLORS.border }}
      >
        {/* Cabecera del panel */}
        <div
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-6 py-5 bg-white"
          style={{ borderBottom: `1px solid ${COLORS.border}` }}
        >
          <div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" style={{ color: COLORS.dark }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <h2 className="text-base font-bold text-gray-800">
                Registro Histórico de Compras y Lotes
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Lista detallada del abastecimiento de medicamentos y control sanitario de lotes
            </p>
          </div>
        </div>

        {/* ── BARRA DE FILTROS ──────────────────────────────────────────────── */}
        <div
          className="flex flex-col lg:flex-row gap-4 items-center px-6 py-4 bg-gray-50/50"
          style={{ borderBottom: `1px solid ${COLORS.border}` }}
        >
          {/* Input de búsqueda */}
          <div className="relative flex-1 w-full">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nro de factura o proveedor..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm outline-none border transition-colors bg-white text-gray-800 focus:border-purple-500"
              style={{ borderColor: COLORS.border }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Dropdown filtro por proveedor */}
          <select
            value={proveedorFiltro}
            onChange={(e) => setProveedorFiltro(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer border bg-white text-gray-700 w-full lg:w-auto"
            style={{ borderColor: COLORS.border, minWidth: "220px" }}
          >
            <option value="">Filtrar por Proveedor (Todos)</option>
            {proveedoresUnicos.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Filtros rápidos de estado */}
          <div className="flex gap-2 flex-wrap w-full lg:w-auto">
            {(["todos", "pendiente", "completado", "cancelado"] as const).map((e) => (
              <button
                key={e}
                onClick={() => setEstadoFiltro(e)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                style={
                  estadoFiltro === e
                    ? { backgroundColor: COLORS.dark, color: "#FFFFFF" }
                    : {
                        backgroundColor: "#FFFFFF",
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.textSecondary,
                      }
                }
              >
                {e === "todos" ? "Todos" : e}
              </button>
            ))}
          </div>

          {/* Contador de resultados */}
          <span className="text-xs text-gray-500 whitespace-nowrap ml-auto">
            Mostrando <span className="font-bold text-gray-800">{comprasFiltradas.length}</span> de {comprasResponse?.total ?? 0}
          </span>
        </div>

        {/* ── TABLA ────────────────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
            <div className="max-h-[calc(116vh-320px)] overflow-y-auto">
            <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                <tr className="bg-white" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    {[
                    "FACTURA N°",
                    "FECHA DE INGRESO",
                    "PROVEEDOR",
                    "SUCURSAL DESTINO",
                    "ITEMS / LOTES",
                    "TOTAL LIQUIDADO",
                    "ESTADO SANITARIO",
                    "ACCIONES",
                    ].map((col) => (
                    <th
                        key={col}
                        className="px-5 py-3 text-left text-xs font-bold tracking-wider text-gray-500"
                    >
                        {col}
                    </th>
                    ))}
                </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                {comprasFiltradas.length === 0 ? (
                    <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="font-semibold text-gray-500">No se encontraron compras</p>
                        <p className="text-xs text-gray-400">Intenta cambiar los filtros de búsqueda</p>
                        </div>
                    </td>
                    </tr>
                ) : (
                    comprasFiltradas.map((compra, index) => (
                    <tr
                        key={compra.idCompra}
                        className="transition-colors hover:bg-gray-50/80"
                    >
                        {/* Factura Link */}
                        <td className="px-5 py-4">
                        <span className="font-bold text-sm" style={{ color: COLORS.dark }}>
                            {compra.numeroFactura ?? "S/N"}
                        </span>
                        </td>

                        {/* Fecha */}
                        <td className="px-5 py-4 text-gray-600">
                        <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs">{formatFecha(compra.fechaCreacion)}</span>
                        </div>
                        </td>

                        {/* Proveedor */}
                        <td className="px-5 py-4">
                        <span className="font-semibold text-gray-800">{compra.proveedor ?? "—"}</span>
                        </td>

                        {/* Sucursal */}
                        <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.medium }} />
                            <span className="text-xs text-gray-600">{compra.sucursal ?? "—"}</span>
                        </div>
                        </td>

                        {/* Lotes */}
                        <td className="px-5 py-4">
                        <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{ backgroundColor: COLORS.light, color: COLORS.dark }}
                        >
                            {compra.totalLotes ?? 0} Lotes
                        </span>
                        </td>

                        {/* Total Liquidado */}
                        <td className="px-5 py-4">
                        <span className="font-extrabold text-sm text-gray-800">
                            {formatBOB(compra.total)}
                        </span>
                        </td>

                        {/* Estado Sanitario */}
                        <td className="px-5 py-4">
                        <EstadoBadge estado={compra.estado} />
                        </td>

                        {/* Acciones */}
                        <td className="px-5 py-4">
                        <button
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border bg-white hover:bg-gray-50 active:scale-95 shadow-sm"
                            style={{
                            color: COLORS.dark,
                            borderColor: COLORS.border,
                            }}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Detalles
                        </button>
                        </td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>
          </div>
        </div>

        {/* ── PIE DEL PANEL ───────────────────────────────────────────────── */}
        {comprasFiltradas.length > 0 && (
          <div
            className="px-6 py-4 flex justify-between items-center text-xs bg-gray-50 text-gray-500 font-medium"
            style={{ borderTop: `1px solid ${COLORS.border}` }}
          >
            <span>
              {comprasFiltradas.length} de {comprasResponse?.total ?? 0} registros
            </span>
            <span>
              Total visible:{" "}
              <span className="font-bold text-sm" style={{ color: COLORS.dark }}>
                {formatBOB(comprasFiltradas.reduce((acc, c) => acc + c.total, 0))}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}