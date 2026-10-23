import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Boxes,
  CalendarRange,
  FileSpreadsheet,
  FileText,
  Layers,
  Loader as LoaderIcon,
  RefreshCw,
  Search,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import Loading from "../../../../Helpers/Loading";
import {
  DescargarReporteInventarioExcelApi,
  DescargarReporteInventarioPdfApi,
  GetParametrosInventarioApi,
  GetReporteInventarioDatosApi,
} from "../../../../Api/ReporteApi";
import type {
  InventarioParametrosCatalogoType,
  LoteInventarioType,
  ReporteInventarioDatosType,
  ReporteInventarioFiltrosType,
} from "../../../../types";

const COLORS = {
  dark: "#4A1A6E",
  medium: "#7B3FA0",
  light: "#F3EBF9",
  border: "#D8B4F0",
  excel: "#15803D",
  pdf: "#DC2626",
} as const;

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
  filtros: ReporteInventarioFiltrosType;
  disabled: boolean;
}) {
  const [cargando, setCargando] = useState(false);

  const click = async () => {
    setCargando(true);
    try {
      if (tipo === "excel") {
        await DescargarReporteInventarioExcelApi(filtros);
      } else {
        await DescargarReporteInventarioPdfApi(filtros);
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

function FilaInventario({ lote }: { lote: LoteInventarioType }) {
  return (
    <tr className="transition-colors hover:bg-gray-50/70">
      <td className="px-4 py-3 font-semibold text-gray-800">{lote.numeroLote}</td>
      <td className="px-4 py-3 text-xs text-gray-600">{lote.codigo}</td>
      <td className="px-4 py-3 font-semibold text-gray-800">{lote.producto.nombreComercial}</td>
      <td className="px-4 py-3 text-xs text-gray-600">{lote.producto.nombreGenerico ?? "—"}</td>
      <td className="px-4 py-3 text-xs text-gray-600">{lote.producto.concentracion ?? "—"}</td>
      <td className="px-4 py-3 text-xs text-gray-600">{lote.laboratorio}</td>
      <td className="px-4 py-3 text-xs text-gray-600">{lote.tipoProducto ?? "Sin tipo"}</td>
      <td className="px-4 py-3 text-xs text-gray-600">{lote.fechaVencimiento ?? "—"}</td>
      <td className="px-4 py-3 text-right font-semibold text-gray-700">
        {lote.stock.toLocaleString("es-BO")}
      </td>
      <td className="px-4 py-3 text-right text-gray-700">
        {lote.costoUnitario.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
      </td>
      <td className="px-4 py-3 text-right font-extrabold text-gray-800">
        {lote.subtotal.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
      </td>
    </tr>
  );
}

export default function ReporteInventario() {
  const [filtrosAplicados, setFiltrosAplicados] = useState<ReporteInventarioFiltrosType>({
    idLaboratorio: undefined,
    idTipoProducto: undefined,
    busqueda: undefined,
    soloConStock: true,
  });
  const [filtrosEdit, setFiltrosEdit] = useState<ReporteInventarioFiltrosType>(filtrosAplicados);
  const [busquedaInput, setBusquedaInput] = useState<string>("");

  const { data: parametros, isLoading: isLoadingParametros } = useQuery<InventarioParametrosCatalogoType>({
    queryKey: ["ReporteInventarioParametros"],
    queryFn: GetParametrosInventarioApi,
  });

  const { data, isLoading, isFetching, error } = useQuery<ReporteInventarioDatosType>({
    queryKey: ["ReporteInventario", filtrosAplicados],
    queryFn: () => GetReporteInventarioDatosApi(filtrosAplicados),
    placeholderData: (prev) => prev,
  });

  const setFiltro = (patch: Partial<ReporteInventarioFiltrosType>) => {
    setFiltrosEdit((prev) => ({ ...prev, ...patch }));
  };

  const consultar = () => {
    setFiltrosAplicados({
      idLaboratorio: filtrosEdit.idLaboratorio,
      idTipoProducto: filtrosEdit.idTipoProducto,
      busqueda: busquedaInput.trim() === "" ? undefined : busquedaInput.trim(),
      soloConStock: filtrosEdit.soloConStock ?? true,
    });
  };

  const resetear = () => {
    const limpio: ReporteInventarioFiltrosType = {
      idLaboratorio: undefined,
      idTipoProducto: undefined,
      busqueda: undefined,
      soloConStock: true,
    };
    setFiltrosEdit(limpio);
    setBusquedaInput("");
    setFiltrosAplicados(limpio);
  };

  const resumen = data?.resumen;
  const lotes = data?.lotes ?? [];

  if (isLoadingParametros) return <Loading />;

  if (isLoading) return <Loading />;

  if (error) {
    return <MensajeError mensaje={error instanceof Error ? error.message : "Error al cargar el reporte de inventario"} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: COLORS.dark }}
          >
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Reporte de Inventario Actual</h1>
            <p className="text-sm text-gray-500">
              Consulta de lotes disponibles con su valorización por tipo de producto y laboratorio
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5">
        <div className="flex flex-col lg:flex-row lg:flex-wrap lg:items-end gap-4">
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
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Buscar</label>
            <input
              type="text"
              value={busquedaInput}
              onChange={(e) => setBusquedaInput(e.target.value)}
              placeholder="Código, n° lote, nombre..."
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          <label className="inline-flex items-center gap-2 px-1 pb-2 text-sm font-semibold text-gray-600">
            <input
              type="checkbox"
              checked={filtrosEdit.soloConStock ?? true}
              onChange={(e) => setFiltro({ soloConStock: e.target.checked })}
              className="w-4 h-4 rounded border-purple-300 accent-purple-700"
            />
            Sólo con stock
          </label>

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

      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        <div className="md:flex-1" />
        <div className="flex flex-wrap gap-2 items-center md:justify-end">
          <BotonDescarga tipo="excel" filtros={filtrosAplicados} disabled={!data || isFetching} />
          <BotonDescarga tipo="pdf" filtros={filtrosAplicados} disabled={!data || isFetching} />
        </div>
      </div>

      {data && resumen && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CardMetrica
            titulo="Lotes en inventario"
            icono={<Layers className="w-5 h-5" />}
            valor={resumen.totalLotes.toLocaleString("es-BO")}
            valorDos={`unidades ${resumen.totalUnidades.toLocaleString("es-BO")}`}
          />
          <CardMetrica
            titulo="Valor del inventario"
            icono={<Wallet className="w-5 h-5" />}
            valor={`Bs ${resumen.valorTotal.toLocaleString("es-BO", { minimumFractionDigits: 2 })}`}
            valorDos="total valorizado al costo"
          />
          <CardMetrica
            titulo="Tipos de producto"
            icono={<Boxes className="w-5 h-5" />}
            valor={resumen.porTipoProducto.length.toLocaleString("es-BO")}
            valorDos="con stock valorizado"
          />
          <CardMetrica
            titulo="Laboratorios"
            icono={<Boxes className="w-5 h-5" />}
            valor={resumen.porLaboratorio.length.toLocaleString("es-BO")}
            valorDos="con lotes en inventario"
          />
        </div>
      )}

      {data && resumen && (
        <div className="overflow-hidden rounded-2xl bg-white border border-purple-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-purple-100">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4" style={{ color: COLORS.medium }} />
              <h3 className="text-sm font-bold text-gray-700">Resumen por tipo de producto</h3>
            </div>
            <span className="text-xs font-semibold text-gray-500">{resumen.porTipoProducto.length} tipos</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  {["TIPO DE PRODUCTO", "LOTES", "UNIDADES", "VALOR"].map((c) => (
                    <th key={c} className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-500">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {resumen.porTipoProducto.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <EmptyBox mensaje="Sin valores para los filtros aplicados" />
                    </td>
                  </tr>
                ) : (
                  resumen.porTipoProducto.map((t) => (
                    <tr key={t.tipoProducto} className="transition-colors hover:bg-gray-50/70">
                      <td className="px-4 py-3 font-semibold text-gray-800">{t.tipoProducto}</td>
                      <td className="px-4 py-3 text-gray-600">{t.lotes.toLocaleString("es-BO")}</td>
                      <td className="px-4 py-3 text-gray-600">{t.unidades.toLocaleString("es-BO")}</td>
                      <td className="px-4 py-3 text-right font-extrabold text-gray-800">
                        {t.valor.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data && (
        <div className="overflow-hidden rounded-2xl bg-white border border-purple-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-purple-100">
            <div className="flex items-center gap-2">
              <CalendarRange className="w-4 h-4" style={{ color: COLORS.medium }} />
              <h3 className="text-sm font-bold text-gray-700">Detalle de lotes</h3>
            </div>
            <span className="text-xs font-semibold text-gray-500">{lotes.length} registros</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  {[
                    "N° LOTE",
                    "CÓDIGO",
                    "PRODUCTO",
                    "GENÉRICO",
                    "CONCENTRACIÓN",
                    "LABORATORIO",
                    "TIPO",
                    "VENCIMIENTO",
                    "STOCK",
                    "COSTO",
                    "SUBTOTAL",
                  ].map((c) => (
                    <th key={c} className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-500">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lotes.length === 0 ? (
                  <tr>
                    <td colSpan={11}>
                      <EmptyBox mensaje="Sin lotes que cumplan los filtros aplicados" />
                    </td>
                  </tr>
                ) : (
                  lotes.map((lote) => <FilaInventario key={lote.idLote} lote={lote} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isFetching && (
        <div className="fixed bottom-5 right-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-lg border border-purple-100 text-xs font-semibold text-gray-600">
          <RefreshCw className="w-4 h-4 animate-spin" style={{ color: COLORS.medium }} />
          Actualizando...
        </div>
      )}
    </div>
  );
}
