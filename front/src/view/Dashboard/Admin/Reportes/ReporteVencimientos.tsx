import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarRange,
  FileSpreadsheet,
  FileText,
  Layers,
  Loader as LoaderIcon,
  RefreshCw,
  Search,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import Loading from "../../../../Helpers/Loading";
import {
  DescargarReporteVencimientosExcelApi,
  DescargarReporteVencimientosPdfApi,
  GetParametrosVencimientosApi,
  GetReporteVencimientosDatosApi,
} from "../../../../Api/ReporteApi";
import type {
  LoteVencimientoType,
  NivelVencimiento,
  ReporteVencimientosDatosType,
  ReporteVencimientosFiltrosType,
  VencimientosParametrosCatalogoType,
} from "../../../../types";

const COLORS = {
  dark: "#4A1A6E",
  medium: "#7B3FA0",
  light: "#F3EBF9",
  border: "#D8B4F0",
  excel: "#15803D",
  pdf: "#DC2626",
  red: "#DC2626",
  amber: "#D97706",
  green: "#059669",
  blue: "#2563EB",
} as const;

const NIVEL_ESTILOS: Record<
  NivelVencimiento,
  { bg: string; color: string; dot: string; label: string }
> = {
  vencido: { bg: "#FEE2E2", color: "#DC2626", dot: "#DC2626", label: "Vencido" },
  critico: { bg: "#FEF3C7", color: "#D97706", dot: "#D97706", label: "Crítico" },
  advertencia: { bg: "#FFF7ED", color: "#EA580C", dot: "#EA580C", label: "Advertencia" },
  optimo: { bg: "#D1FAE5", color: "#059669", dot: "#059669", label: "Óptimo" },
};

function EmptyBox({ mensaje }: { mensaje: string }) {
  return <div className="py-12 text-center text-xs text-gray-400">{mensaje}</div>;
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

function nivelEstilo(nivel: NivelVencimiento) {
  return NIVEL_ESTILOS[nivel];
}

function CardMetrica({
  titulo,
  icono,
  valor,
  valorDos,
}: {
  titulo: string;
  icono: ReactNode;
  valor: string;
  valorDos?: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: COLORS.light, color: COLORS.dark }}
        >
          {icono}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">{titulo}</p>
          <p className="text-xl font-extrabold text-gray-800 truncate">{valor}</p>
          <p className="text-[11px] text-gray-400 truncate">{valorDos}</p>
        </div>
      </div>
    </div>
  );
}

function BotonDescarga({
  tipo,
  filtros,
  disabled,
}: {
  tipo: "excel" | "pdf";
  filtros: ReporteVencimientosFiltrosType;
  disabled: boolean;
}) {
  const [cargando, setCargando] = useState(false);

  const click = async () => {
    setCargando(true);
    try {
      if (tipo === "excel") {
        await DescargarReporteVencimientosExcelApi(filtros);
      } else {
        await DescargarReporteVencimientosPdfApi(filtros);
      }
    } finally {
      setCargando(false);
    }
  };

  const esExcel = tipo === "excel";
  const Icono = esExcel ? FileSpreadsheet : FileText;
  const color = esExcel ? COLORS.excel : COLORS.pdf;
  const etiqueta = esExcel ? "Descargar Excel" : "Descargar PDF";

  return (
    <button
      onClick={click}
      disabled={disabled || cargando}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                 shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                 hover:brightness-105 active:scale-[0.98]"
      style={{ backgroundColor: color }}
    >
      {cargando ? (
        <LoaderIcon className="w-4 h-4 animate-spin" />
      ) : (
        <Icono className="w-4 h-4" />
      )}
      {cargando ? "Generando..." : etiqueta}
    </button>
  );
}

function FilaSemaforo({ lote }: { lote: LoteVencimientoType }) {
  const est = nivelEstilo(lote.nivel);
  return (
    <tr className="transition-colors hover:bg-gray-50/70">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: est.dot }} />
          <span className="font-semibold text-gray-800">{lote.numeroLote}</span>
        </div>
      </td>
      <td className="px-4 py-3 font-semibold text-gray-800">{lote.producto?.nombreComercial ?? "—"}</td>
      <td className="px-4 py-3 text-xs text-gray-600">{lote.producto?.nombreGenerico ?? "—"}</td>
      <td className="px-4 py-3 text-xs text-gray-600">{lote.estadoLoteLabel}</td>
      <td className="px-4 py-3 text-right font-semibold text-gray-700">{lote.diasRestantes}</td>
      <td className="px-4 py-3 text-right font-extrabold" style={{ color: est.color }}>
        {lote.nivelLabel}
      </td>
      <td className="px-4 py-3 text-right font-extrabold text-gray-800">
        {lote.valorEnRiesgo.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
      </td>
      <td className="px-4 py-3 text-xs font-semibold" style={{ color: est.color }}>
        {lote.accion}
      </td>
      <td className="px-4 py-3">
        {lote.esFEFO ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: "#D1FAE5", color: "#059669" }}>
            FEFO
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}>
            <AlertTriangle className="w-3.5 h-3.5" />
            Desvío
          </span>
        )}
      </td>
    </tr>
  );
}

function ControlFEFO({ control }: { control: ReporteVencimientosDatosType["resumen"]["controlFEFO"] }) {
  if (!control || control.length === 0) {
    return <EmptyBox mensaje="No hay productos con stock controlable por FEFO en el rango seleccionado" />;
  }
  return (
    <div className="overflow-hidden rounded-2xl bg-white border border-purple-100 shadow-sm">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-purple-100">
        <ShieldAlert className="w-4 h-4" style={{ color: COLORS.medium }} />
        <h3 className="text-sm font-bold text-gray-700">Control FEFO por producto</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              {["PRODUCTO", "LOTE FEFO", "VENCE", "DIAS", "NIVEL", "TOTAL LOTES", "STOCK POSTERIOR", "VALOR POSTERIOR"].map(
                (c) => (
                  <th key={c} className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-500">
                    {c}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {control.map((c) => (
              <tr key={c.idProducto} className="transition-colors hover:bg-gray-50/70">
                <td className="px-4 py-3 font-semibold text-gray-800">{c.producto}</td>
                <td className="px-4 py-3 text-gray-600">#{String(c.idLoteFEFO).padStart(5, "0")}</td>
                <td className="px-4 py-3 text-gray-600">{c.fechaVencimientoFEFO}</td>
                <td className="px-4 py-3 text-gray-600">{c.diasRestantesFEFO}</td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex px-2 py-1 rounded-full text-[11px] font-bold"
                    style={{ backgroundColor: NIVEL_ESTILOS[c.nivelFEFO].bg, color: NIVEL_ESTILOS[c.nivelFEFO].color }}
                  >
                    {NIVEL_ESTILOS[c.nivelFEFO].label}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{c.totalLotes}</td>
                <td className="px-4 py-3 text-gray-600">{c.stockLotesPosteriores}</td>
                <td className="px-4 py-3 text-right font-extrabold text-gray-800">
                  {c.valorLotesPosteriores.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VISTA: Reporte de Control de Vencimientos y Alerta FEFO
// ═══════════════════════════════════════════════════════════════════════════
export default function ReporteVencimientos() {
  const [filtrosAplicados, setFiltrosAplicados] = useState<ReporteVencimientosFiltrosType>({
    diasMin: undefined,
    diasMax: undefined,
    idLaboratorio: undefined,
    idTipoProducto: undefined,
    idProveedor: undefined,
    estados: undefined,
    busqueda: undefined,
    soloConStock: true,
  });
  const [filtrosEdit, setFiltrosEdit] = useState<ReporteVencimientosFiltrosType>(filtrosAplicados);
  const [busquedaInput, setBusquedaInput] = useState<string>("");

  const { data: parametros, isLoading: isLoadingParametros } = useQuery<VencimientosParametrosCatalogoType>({
    queryKey: ["ReporteVencimientosParametros"],
    queryFn: GetParametrosVencimientosApi,
  });

  const { data, isLoading, isFetching, error } = useQuery<ReporteVencimientosDatosType>({
    queryKey: ["ReporteVencimientos", filtrosAplicados],
    queryFn: () => GetReporteVencimientosDatosApi(filtrosAplicados),
    placeholderData: (prev) => prev,
  });

  const umbrales = parametros?.umbrales;

  const setFiltro = (patch: Partial<ReporteVencimientosFiltrosType>) => {
    setFiltrosEdit((prev) => ({ ...prev, ...patch }));
  };

  const consultar = () => {
    setFiltrosAplicados({
      diasMin: filtrosEdit.diasMin,
      diasMax: filtrosEdit.diasMax,
      idLaboratorio: filtrosEdit.idLaboratorio,
      idTipoProducto: filtrosEdit.idTipoProducto,
      idProveedor: filtrosEdit.idProveedor,
      estados: filtrosEdit.estados,
      busqueda: busquedaInput.trim() === "" ? undefined : busquedaInput.trim(),
      soloConStock: filtrosEdit.soloConStock ?? true,
    });
  };

  const resetear = () => {
    const limpio: ReporteVencimientosFiltrosType = {
      diasMin: undefined,
      diasMax: undefined,
      idLaboratorio: undefined,
      idTipoProducto: undefined,
      idProveedor: undefined,
      estados: undefined,
      busqueda: undefined,
      soloConStock: true,
    };
    setFiltrosEdit(limpio);
    setBusquedaInput("");
    setFiltrosAplicados(limpio);
  };

  const resumen = data?.resumen;
  const lotes = data?.lotes ?? [];

  const criticos = useMemo(() => {
    if (!resumen) return 0;
    return resumen.porNivel
      .filter((n) => n.nivel === "vencido" || n.nivel === "critico" || n.nivel === "advertencia")
      .reduce((acc, n) => acc + n.lotes, 0);
  }, [resumen]);

  if (isLoadingParametros) return <Loading />;

  if (isLoading) return <Loading />;

  if (error) {
    return <MensajeError mensaje={error instanceof Error ? error.message : "Error al cargar el reporte de vencimientos"} />;
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: COLORS.dark }}
          >
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Control de Vencimientos y Alerta FEFO</h1>
            <p className="text-sm text-gray-500">
              Consulta lotes próximos a vencer, semáforo de riesgo y control FEFO en el punto de venta
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5">
        <div className="flex flex-col lg:flex-row lg:flex-wrap lg:items-end gap-4">
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Desde</label>
            <input
              type="number"
              min={0}
              value={filtrosEdit.diasMin ?? ""}
              onChange={(e) => setFiltro({ diasMin: e.target.value === "" ? undefined : Number(e.target.value) })}
              placeholder={`Mín. ${umbrales?.critico ?? 30}`}
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
            />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Hasta</label>
            <input
              type="number"
              min={0}
              value={filtrosEdit.diasMax ?? ""}
              onChange={(e) => setFiltro({ diasMax: e.target.value === "" ? undefined : Number(e.target.value) })}
              placeholder={`Máx. ${umbrales?.advertencia ?? 90}`}
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
            />
          </div>

          <div className="flex-1 min-w-0">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Laboratorio</label>
            <select
              value={filtrosEdit.idLaboratorio ?? ""}
              onChange={(e) => setFiltro({ idLaboratorio: e.target.value === "" ? undefined : Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="">Todos</option>
              {(parametros?.laboratorios ?? []).map((l) => (
                <option key={l.idLaboratorio} value={l.idLaboratorio}>
                  {l.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-0">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tipo de producto</label>
            <select
              value={filtrosEdit.idTipoProducto ?? ""}
              onChange={(e) => setFiltro({ idTipoProducto: e.target.value === "" ? undefined : Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="">Todos</option>
              {(parametros?.tiposProducto ?? []).map((t) => (
                <option key={t.idTipoProd} value={t.idTipoProd}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-0">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Proveedor</label>
            <select
              value={filtrosEdit.idProveedor ?? ""}
              onChange={(e) => setFiltro({ idProveedor: e.target.value === "" ? undefined : Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="">Todos</option>
              {(parametros?.proveedores ?? []).map((p) => (
                <option key={p.idProveedor} value={p.idProveedor}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-0">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Estados</label>
            <select
              value={(filtrosEdit.estados ?? [])[0] ?? ""}
              onChange={(e) => setFiltro({ estados: e.target.value === "" ? undefined : [e.target.value] })}
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="">Todos</option>
              {["pendiente", "activo", "vencido", "cancelado", "cuarentena", "devuelto"].map((est) => (
                <option key={est} value={est}>
                  {est}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-0">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Buscar</label>
            <input
              type="text"
              value={busquedaInput}
              onChange={(e) => setBusquedaInput(e.target.value)}
              placeholder="Código, n° lote, nombre..."
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={consultar}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:brightness-105 active:scale-[0.98]"
              style={{ backgroundColor: COLORS.dark }}
            >
              <Search className="w-4 h-4" />
              Consultar
            </button>
            <button
              onClick={resetear}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 border border-purple-200 hover:bg-purple-50 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Descargas */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        <div className="md:flex-1" />
        <div className="flex flex-wrap gap-2 items-center md:justify-end">
          <BotonDescarga tipo="excel" filtros={filtrosAplicados} disabled={!data || isFetching} />
          <BotonDescarga tipo="pdf" filtros={filtrosAplicados} disabled={!data || isFetching} />
        </div>
      </div>

      {/* Métricas */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CardMetrica
            titulo="Lotes en control"
            icono={<Layers className="w-5 h-5" />}
            valor={data.resumen.totalLotes.toLocaleString("es-BO")}
            valorDos={`unidades ${data.resumen.totalUnidades.toLocaleString("es-BO")}`}
          />
          <CardMetrica
            titulo="Valor en riesgo"
            icono={<Wallet className="w-5 h-5" />}
            valor={`Bs ${data.resumen.valorEnRiesgo.toLocaleString("es-BO", { minimumFractionDigits: 2 })}`}
            valorDos={`crítico ${data.resumen.valorCritico.toLocaleString("es-BO", { minimumFractionDigits: 2 })}`}
          />
          <CardMetrica
            titulo="Lotes con alerta"
            icono={<AlertTriangle className="w-5 h-5" />}
            valor={criticos.toLocaleString("es-BO")}
            valorDos="vencidos / críticos / advertencia"
          />
          <CardMetrica
            titulo="Control FEFO"
            icono={<ShieldAlert className="w-5 h-5" />}
            valor={data.resumen.controlFEFO.length.toLocaleString("es-BO")}
            valorDos="productos con lote FEFO asignado"
          />
        </div>
      )}

      {/* Tabla semáforo */}
      {data && (
        <div className="overflow-hidden rounded-2xl bg-white border border-purple-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-purple-100">
            <div className="flex items-center gap-2">
              <CalendarRange className="w-4 h-4" style={{ color: COLORS.medium }} />
              <h3 className="text-sm font-bold text-gray-700">Detalle de lotes con semáforo</h3>
            </div>
            <span className="text-xs font-semibold text-gray-500">{lotes.length} registros</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  {["N° LOTE", "PRODUCTO", "GENÉRICO", "ESTADO", "DIAS", "NIVEL", "VALOR", "ACCIÓN", "FEFO"].map(
                    (c) => (
                      <th key={c} className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-500">
                        {c}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lotes.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <EmptyBox mensaje="Sin lotes que cumplan los filtros aplicados" />
                    </td>
                  </tr>
                ) : (
                  lotes.map((lote) => <FilaSemaforo key={lote.idLote} lote={lote} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Control FEFO */}
      {data && <ControlFEFO control={data.resumen.controlFEFO} />}

      {isFetching && (
        <div className="fixed bottom-5 right-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-lg border border-purple-100 text-xs font-semibold text-gray-600">
          <RefreshCw className="w-4 h-4 animate-spin" style={{ color: COLORS.medium }} />
          Actualizando...
        </div>
      )}
    </div>
  );
}
