import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarRange,
  Download,
  FileSpreadsheet,
  FileText,
  Loader as LoaderIcon,
  RefreshCw,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  subWeeks,
} from "date-fns";
import type { ReactNode } from "react";
import Loading from "../../../../Helpers/Loading";
import {
  DescargarReporteExcelApi,
  DescargarReportePdfApi,
  GetReporteDatosApi,
} from "../../../../Api/ReporteApi";
import type {
  FrecuenciaReporte,
  ReporteDatosType,
  ReporteVentasDetalleType,
} from "../../../../types";
import { MESES } from "../../../../types";

// ─── Paleta y estilos consistentes con el dashboard ───────────────────────────
const COLORS = {
  dark: "#4A1A6E",
  medium: "#7B3FA0",
  light: "#F3EBF9",
  border: "#D8B4F0",
  excel: "#15803D",
  pdf: "#DC2626",
} as const;

const ESTADO_STYLES: Record<string, { bg: string; color: string }> = {
  pendiente: { bg: "#FEF3C7", color: "#D97706" },
  completado: { bg: "#D1FAE5", color: "#059669" },
  cancelado: { bg: "#FEE2E2", color: "#DC2626" },
};
const ESTADO_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  completado: "Completado",
  cancelado: "Anulado",
};

// ─── Formatters nativos ──────────────────────────────────────────────────────
const numFormatter = new Intl.NumberFormat("es-BO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const formatBOB = (valor: number): string => `Bs ${numFormatter.format(valor)}`;

const enteroFormatter = new Intl.NumberFormat("es-BO");
const formatEntero = (valor: number): string => enteroFormatter.format(valor);

const fechaEs = (fecha: Date, opciones: Intl.DateTimeFormatOptions): string =>
  new Intl.DateTimeFormat("es-BO", opciones).format(fecha);

const fechaInput = (fecha: Date): string => format(fecha, "yyyy-MM-dd");

let uidCounter = 0;
const nuevoid = (): string => `rep-${Date.now()}-${uidCounter++}`;

// ─── Componentes auxiliares ──────────────────────────────────────────────────
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

// Extrae el periodo legible del reporte (ej: "día 01/09/2026")
function periodoLabel(frecuencia: FrecuenciaReporte, etiqueta: string): string {
  const txt = MESES[frecuencia] ?? "Periodo";
  if (frecuencia === "mensual") return `${txt} ${etiqueta}`;
  return `${txt} ${etiqueta}`;
}

function BotonDescarga({
  tipo,
  frecuencia,
  fechaInicio,
  fechaFin,
  disabled,
}: {
  tipo: "excel" | "pdf";
  frecuencia: FrecuenciaReporte;
  fechaInicio: string;
  fechaFin: string;
  disabled: boolean;
}) {
  const [cargando, setCargando] = useState(false);

  const click = async () => {
    setCargando(true);
    try {
      if (tipo === "excel") {
        await DescargarReporteExcelApi(frecuencia, fechaInicio, fechaFin);
      } else {
        await DescargarReportePdfApi(frecuencia, fechaInicio, fechaFin);
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
      {cargando ? "Generando…" : etiqueta}
    </button>
  );
}

function TablaResumen({ datos }: { datos: ReporteDatosType }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white border border-purple-100 shadow-sm">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-purple-100">
        <Wallet className="w-4 h-4" style={{ color: COLORS.medium }} />
        <h3 className="text-sm font-bold text-gray-700">
          Resumen ventas {MESES[datos.frecuencia]?.toLowerCase()}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              {["PERIODO", "N° VENTAS", "SUBTOTAL", "DESCUENTO", "IMPUESTOS", "TOTAL"].map((c) => (
                <th key={c} className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-500">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {datos.periodos.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyBox mensaje="No hay ventas completadas en el periodo seleccionado" />
                </td>
              </tr>
            ) : (
              datos.periodos.map((p) => (
                <tr key={nuevoid()} className="transition-colors hover:bg-gray-50/70">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-700">
                      {periodoLabel(datos.frecuencia, p.etiqueta)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatEntero(p.cantidad)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatBOB(p.subtotal)}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{formatBOB(p.descuentoTotal)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatBOB(p.impuestos)}</td>
                  <td className="px-4 py-3 text-right font-extrabold text-gray-800">{formatBOB(p.total)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="bg-purple-50">
              <td className="px-4 py-3 font-bold text-sm" style={{ color: COLORS.dark }}>
                TOTALES
              </td>
              <td className="px-4 py-3 font-bold text-gray-700">{formatEntero(datos.totales.cantidad)}</td>
              <td className="px-4 py-3 text-right font-bold text-gray-700">{formatBOB(datos.totales.subtotal)}</td>
              <td className="px-4 py-3 text-right font-bold text-gray-600">{formatBOB(datos.totales.descuentoTotal)}</td>
              <td className="px-4 py-3 text-right font-bold text-gray-700">{formatBOB(datos.totales.impuestos)}</td>
              <td className="px-4 py-3 text-right font-extrabold" style={{ color: COLORS.dark }}>
                {formatBOB(datos.totales.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function TablaDetalle({ ventas }: { ventas: ReporteVentasDetalleType }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white border border-purple-100 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-purple-100">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" style={{ color: COLORS.medium }} />
          <h3 className="text-sm font-bold text-gray-700">Detalle de ventas</h3>
        </div>
        <span className="text-xs font-semibold text-gray-500">{formatEntero(ventas.length)} registros</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              {["N° RECIBO", "N° VENTA", "FECHA", "CLIENTE", "SUCURSAL", "TIPO PAGO", "ESTADO", "TOTAL"].map(
                (c) => (
                  <th key={c} className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-500">
                    {c}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ventas.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyBox mensaje="Sin ventas en el periodo seleccionado" />
                </td>
              </tr>
            ) : (
              ventas.map((v) => {
                const est = ESTADO_STYLES[v.estado] || ESTADO_STYLES.pendiente;
                return (
                  <tr key={v.idVenta} className="transition-colors hover:bg-gray-50/70">
                    <td className="px-4 py-3 font-semibold text-gray-700">{v.numeroFactura ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500">#{String(v.idVenta).padStart(5, "0")}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {fechaEs(new Date(v.fechaCreacion), {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{v.cliente ?? "Cliente General"}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{v.sucursal ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex px-2 py-1 rounded-full text-[11px] font-bold"
                        style={{ backgroundColor: COLORS.light, color: COLORS.dark }}
                      >
                        {v.tipoPago ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{ backgroundColor: est.bg, color: est.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: est.color }} />
                        {ESTADO_LABELS[v.estado] ?? v.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-gray-800">{formatBOB(v.total)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
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

function CardRango({ fechaInicio, fechaFin }: { fechaInicio: string; fechaFin: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white border border-purple-100 shadow-sm px-5 py-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: COLORS.light, color: COLORS.dark }}
      >
        <CalendarRange className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Periodo cubierto</p>
        <p className="text-sm font-bold text-gray-800">
          {fechaEs(new Date(`${fechaInicio}T00:00:00`), { day: "2-digit", month: "long", year: "numeric" })}
          <span className="mx-2 text-gray-400 font-medium">→</span>
          {fechaEs(new Date(`${fechaFin}T00:00:00`), { day: "2-digit", month: "long", year: "numeric" })}
        </p>
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function Reporte() {
  const [frecuencia, setFrecuencia] = useState<FrecuenciaReporte>("diario");
  const [fechaInicio, setFechaInicio] = useState<string>(fechaInput(new Date()));
  const [fechaFin, setFechaFin] = useState<string>(fechaInput(new Date()));
  const [aplicado, setAplicado] = useState({ frecuencia, desde: fechaInicio, hasta: fechaFin });
  const inputDesdeRef = useRef<HTMLInputElement>(null);
  const inputHastaRef = useRef<HTMLInputElement>(null);

  // Funciones rápidas según la frecuencia actual
  const aplicarDia = () => {
    const hoy = new Date();
    setFechaInicio(fechaInput(hoy));
    setFechaFin(fechaInput(hoy));
    setAplicado({ frecuencia, desde: fechaInput(hoy), hasta: fechaInput(hoy) });
  };
  const aplicarSemana = () => {
    const hoy = new Date();
    const ini = startOfWeek(hoy, { weekStartsOn: 1 });
    const fin = endOfWeek(hoy, { weekStartsOn: 1 });
    setFechaInicio(fechaInput(ini));
    setFechaFin(fechaInput(fin));
    setAplicado({ frecuencia, desde: fechaInput(ini), hasta: fechaInput(fin) });
  };
  const aplicarMes = () => {
    const hoy = new Date();
    setFechaInicio(fechaInput(startOfMonth(hoy)));
    setFechaFin(fechaInput(endOfMonth(hoy)));
    setAplicado({ frecuencia, desde: fechaInput(startOfMonth(hoy)), hasta: fechaInput(endOfMonth(hoy)) });
  };
  const aplicarTodos = () => {
    if (frecuencia === "diario") {
      const hoy = new Date();
      setFechaInicio(fechaInput(subMonths(hoy, 1)));
      setFechaFin(fechaInput(hoy));
      setAplicado({ frecuencia, desde: fechaInput(subMonths(hoy, 1)), hasta: fechaInput(hoy) });
    } else if (frecuencia === "semanal") {
      const hoy = new Date();
      const ini = startOfWeek(subWeeks(hoy, 4), { weekStartsOn: 1 });
      const fin = endOfWeek(hoy, { weekStartsOn: 1 });
      setFechaInicio(fechaInput(ini));
      setFechaFin(fechaInput(fin));
      setAplicado({ frecuencia, desde: fechaInput(ini), hasta: fechaInput(fin) });
    } else {
      const hoy = new Date();
      setFechaInicio(fechaInput(startOfMonth(subMonths(hoy, 6))));
      setFechaFin(fechaInput(endOfMonth(hoy)));
      setAplicado({ frecuencia, desde: fechaInput(startOfMonth(subMonths(hoy, 6))), hasta: fechaInput(endOfMonth(hoy)) });
    }
  };

  const cambiarFrecuencia = (nueva: FrecuenciaReporte) => {
    setFrecuencia(nueva);
    if (nueva === "diario") {
      const hoy = new Date();
      setFechaInicio(fechaInput(hoy));
      setFechaFin(fechaInput(hoy));
    } else if (nueva === "semanal") {
      const hoy = new Date();
      setFechaInicio(fechaInput(startOfWeek(hoy, { weekStartsOn: 1 })));
      setFechaFin(fechaInput(endOfWeek(hoy, { weekStartsOn: 1 })));
    } else {
      const hoy = new Date();
      setFechaInicio(fechaInput(startOfMonth(hoy)));
      setFechaFin(fechaInput(endOfMonth(hoy)));
    }
    setAplicado({
      frecuencia: nueva,
      desde: fechaInicio,
      hasta: fechaFin,
    });
  };

  const aplicarFiltro = () => {
    setAplicado({ frecuencia, desde: fechaInicio, hasta: fechaFin });
  };

  const { data, isLoading, isFetching, error } = useQuery<ReporteDatosType>({
    queryKey: ["Reporte", aplicado.frecuencia, aplicado.desde, aplicado.hasta],
    queryFn: () =>
      GetReporteDatosApi(aplicado.frecuencia, aplicado.desde, aplicado.hasta),
    placeholderData: (prev) => prev,
  });

  if (isLoading) return <Loading />;

  if (error) {
    return <MensajeError mensaje={error instanceof Error ? error.message : "Error al cargar el reporte"} />;
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
            <FileSpreadsheet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Reportes de Ventas</h1>
            <p className="text-sm text-gray-500">
              Genera reportes {MESES[frecuencia].toLowerCase()} y descárgalos en Excel o PDF
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          {/* Frecuencia */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Agrupar por</label>
            <div className="grid grid-cols-3 gap-2">
              {(["diario", "semanal", "mensual"] as FrecuenciaReporte[]).map((opc) => (
                <button
                  key={opc}
                  onClick={() => cambiarFrecuencia(opc)}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                    frecuencia === opc
                      ? "text-white border-transparent shadow-sm"
                      : "bg-white border-purple-200 text-gray-600 hover:bg-purple-50"
                  }`}
                  style={frecuencia === opc ? { backgroundColor: COLORS.dark } : undefined}
                >
                  {opc.charAt(0).toUpperCase() + opc.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Fechas */}
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Desde</label>
            <input
              type="date"
              ref={inputDesdeRef}
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
            />
          </div>
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Hasta</label>
            <input
              type="date"
              ref={inputHastaRef}
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
            />
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap gap-2 items-end">
            <button
              onClick={aplicarDia}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 border border-purple-200
                         hover:bg-purple-50 transition-colors"
            >
              Hoy
            </button>
            <button
              onClick={aplicarSemana}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 border border-purple-200
                         hover:bg-purple-50 transition-colors"
            >
              Semana
            </button>
            <button
              onClick={aplicarMes}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 border border-purple-200
                         hover:bg-purple-50 transition-colors"
            >
              Mes
            </button>
            <button
              onClick={aplicarTodos}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 border border-purple-200
                         hover:bg-purple-50 transition-colors"
            >
              6 meses
            </button>
            <button
              onClick={aplicarFiltro}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white
                         shadow-sm transition-all duration-200 hover:brightness-105 active:scale-[0.98]"
              style={{ backgroundColor: COLORS.dark }}
            >
              <Search className="w-4 h-4" />
              Consultar
            </button>
          </div>
        </div>
      </div>

      {/* Barra de rango + descargas */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        <div className="md:flex-1">
          <CardRango fechaInicio={aplicado.desde} fechaFin={aplicado.hasta} />
        </div>
        <div className="flex flex-wrap gap-2 items-center md:justify-end">
          <BotonDescarga
            tipo="excel"
            frecuencia={aplicado.frecuencia}
            fechaInicio={aplicado.desde}
            fechaFin={aplicado.hasta}
            disabled={!data || isFetching}
          />
          <BotonDescarga
            tipo="pdf"
            frecuencia={aplicado.frecuencia}
            fechaInicio={aplicado.desde}
            fechaFin={aplicado.hasta}
            disabled={!data || isFetching}
          />
        </div>
      </div>

      {/* Métricas */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CardMetrica
            titulo="Ventas completadas"
            icono={<FileText className="w-5 h-5" />}
            valor={formatEntero(data.totales.cantidad)}
            valorDos={`sesión ${MESES[data.frecuencia].toLowerCase()}`}
          />
          <CardMetrica
            titulo="Total vendido"
            icono={<Wallet className="w-5 h-5" />}
            valor={formatBOB(data.totales.total)}
            valorDos="ventas completadas"
          />
          <CardMetrica
            titulo="Subtotal"
            icono={<Download className="w-5 h-5" />}
            valor={formatBOB(data.totales.subtotal)}
            valorDos={`neto ${formatBOB(data.totales.subtotal)}`}
          />
          <CardMetrica
            titulo="Descuentos"
            icono={<Users className="w-5 h-5" />}
            valor={formatBOB(data.totales.descuentoTotal)}
            valorDos="aplicados en el periodo"
          />
        </div>
      )}

      {/* Tablas */}
      {data && (
        <div className="space-y-6">
          <TablaResumen datos={data} />
          <TablaDetalle ventas={data.ventas} />
        </div>
      )}

      {/* Indicador de recarga */}
      {isFetching && (
        <div className="fixed bottom-5 right-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-lg border border-purple-100 text-xs font-semibold text-gray-600">
          <RefreshCw className="w-4 h-4 animate-spin" style={{ color: COLORS.medium }} />
          Actualizando…
        </div>
      )}
    </div>
  );
}