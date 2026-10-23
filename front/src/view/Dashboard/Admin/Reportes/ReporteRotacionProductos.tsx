import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Package, RefreshCw, Search } from "lucide-react";
import Loading from "../../../../Helpers/Loading";
import { DescargarReporteRotacionProductosExcelApi, DescargarReporteRotacionProductosPdfApi, GetParametrosRotacionProductosApi, GetReporteRotacionProductosDatosApi } from "../../../../Api/ReporteApi";
import type { RotacionProductosParametrosType, ReporteRotacionProductosDatosType, ReporteRotacionProductosFiltrosType, RotacionProductosDetalleType } from "../../../../types";

const formatoMoneda = (n: number) => `Bs ${n.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function EmptyBox({ mensaje }: { mensaje: string }) {
  return <div className="py-12 text-center text-xs text-gray-400">{mensaje}</div>;
}

function MensajeError({ mensaje }: { mensaje: string }) {
  return <div className="min-h-[60vh] flex items-center justify-center"><div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-8 text-center max-w-md"><AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" /><p className="text-sm font-semibold text-red-700">{mensaje}</p></div></div>;
}

const COLOR_CLASE: Record<string, string> = { A: "#059669", B: "#D97706", C: "#DC2626" };

function BotonDescarga({ tipo, filtros, disabled }: { tipo: "excel" | "pdf"; filtros: ReporteRotacionProductosFiltrosType; disabled: boolean }) {
  const [cargando, setCargando] = useState(false);
  return (
    <button
      onClick={async () => {
        setCargando(true);
        try {
          if (tipo === "excel") await DescargarReporteRotacionProductosExcelApi(filtros);
          else await DescargarReporteRotacionProductosPdfApi(filtros);
        } finally { setCargando(false); }
      }}
      disabled={disabled || cargando}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm disabled:opacity-60"
      style={{ backgroundColor: tipo === "excel" ? "#15803D" : "#DC2626" }}
    >
      {cargando ? "Generando..." : tipo === "excel" ? "Descargar Excel" : "Descargar PDF"}
    </button>
  );
}

export default function ReporteRotacionProductos() {
  const filtrosIniciales: ReporteRotacionProductosFiltrosType = {
    fechaInicio: undefined, fechaFin: undefined, idLaboratorio: undefined, idTipoProducto: undefined, clasificacion: undefined, busqueda: undefined, soloConStock: true,
  };
  const [filtrosEdit, setFiltrosEdit] = useState<ReporteRotacionProductosFiltrosType>(filtrosIniciales);
  const [filtrosAplicados, setFiltrosAplicados] = useState<ReporteRotacionProductosFiltrosType>(filtrosIniciales);
  const [busquedaInput, setBusquedaInput] = useState("");

  const { data: parametros, isLoading: lp } = useQuery<RotacionProductosParametrosType>({
    queryKey: ["RotacionProductosParametros"], queryFn: GetParametrosRotacionProductosApi,
  });
  const { data, isLoading, isFetching, error } = useQuery<ReporteRotacionProductosDatosType>({
    queryKey: ["RotacionProductos", filtrosAplicados],
    queryFn: () => GetReporteRotacionProductosDatosApi(filtrosAplicados),
    placeholderData: (prev) => prev,
  });

  const consultar = () => {
    setFiltrosAplicados({ ...filtrosEdit, busqueda: busquedaInput.trim() === "" ? undefined : busquedaInput.trim() });
  };
  const resetear = () => {
    setFiltrosEdit(filtrosIniciales); setBusquedaInput(""); setFiltrosAplicados(filtrosIniciales);
  };

  if (lp || isLoading) return <Loading />;
  if (error) return <MensajeError mensaje={error instanceof Error ? error.message : "Error"} />;

  const detalles = data?.detalles ?? [];
  const resumen = data?.resumen;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#4A1A6E]"><Package className="w-6 h-6 text-white" /></div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Rotación y Clasificación ABC de Productos</h1>
          <p className="text-sm text-gray-500">Análisis de ventas, rotación y capital inmovilizado</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Desde</label>
            <input type="date" value={filtrosEdit.fechaInicio ?? ""} onChange={(e) => setFiltrosEdit((p) => ({ ...p, fechaInicio: e.target.value || undefined }))} className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Hasta</label>
            <input type="date" value={filtrosEdit.fechaFin ?? ""} onChange={(e) => setFiltrosEdit((p) => ({ ...p, fechaFin: e.target.value || undefined }))} className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Laboratorio</label>
            <select value={filtrosEdit.idLaboratorio ?? ""} onChange={(e) => setFiltrosEdit((p) => ({ ...p, idLaboratorio: e.target.value === "" ? undefined : Number(e.target.value) }))} className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm">
              <option value="">Todos</option>
              {(parametros?.laboratorios ?? []).map((l) => <option key={l.idLaboratorio} value={l.idLaboratorio}>{l.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tipo de producto</label>
            <select value={filtrosEdit.idTipoProducto ?? ""} onChange={(e) => setFiltrosEdit((p) => ({ ...p, idTipoProducto: e.target.value === "" ? undefined : Number(e.target.value) }))} className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm">
              <option value="">Todos</option>
              {(parametros?.tiposProducto ?? []).map((t) => <option key={t.idTipoProd} value={t.idTipoProd}>{t.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Clasificación</label>
            <select value={filtrosEdit.clasificacion ?? ""} onChange={(e) => setFiltrosEdit((p) => ({ ...p, clasificacion: e.target.value || undefined }))} className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm">
              <option value="">Todas</option>
              <option value="A">A - Alta</option>
              <option value="B">B - Media</option>
              <option value="C">C - Baja</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Búsqueda</label>
            <input type="text" value={busquedaInput} onChange={(e) => setBusquedaInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") consultar(); }} placeholder="Nombre o código..." className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm" />
          </div>
          <div className="flex items-end gap-2">
            <button onClick={consultar} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#4A1A6E]"><Search className="w-4 h-4" />Consultar</button>
            <button onClick={resetear} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 border border-purple-200">Limpiar</button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-end">
        <BotonDescarga tipo="excel" filtros={filtrosAplicados} disabled={!data || isFetching} />
        <BotonDescarga tipo="pdf" filtros={filtrosAplicados} disabled={!data || isFetching} />
      </div>

      {resumen && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5"><p className="text-xs text-gray-500">Productos</p><p className="text-xl font-extrabold">{resumen.totalProductos}</p></div>
          <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5"><p className="text-xs text-gray-500">Unidades vendidas</p><p className="text-xl font-extrabold">{resumen.totalUnidadesVendidas}</p></div>
          <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5"><p className="text-xs text-gray-500">Monto vendido</p><p className="text-xl font-extrabold">{formatoMoneda(resumen.totalMontoVendido)}</p></div>
          <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5"><p className="text-xs text-gray-500">Valor stock</p><p className="text-xl font-extrabold">{formatoMoneda(resumen.totalValorStock)}</p></div>
        </div>
      )}

      {resumen && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Clasificación ABC</h3>
            <div className="space-y-3">
              {resumen.porClasificacion.map((c) => {
                const pct = resumen.totalMontoVendido > 0 ? (c.montoVendido / resumen.totalMontoVendido) * 100 : 0;
                return (
                  <div key={c.clasificacion} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-extrabold" style={{ color: COLOR_CLASE[c.clasificacion] }}>Clase {c.clasificacion}</span>
                      <span className="text-xs text-gray-500">{c.productos} prod. · {c.unidadesVendidas} unid.</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: COLOR_CLASE[c.clasificacion] }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-500">
                      <span>{formatoMoneda(c.montoVendido)} ({pct.toFixed(1)}%)</span>
                      <span>Stock: {formatoMoneda(c.valorStock)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Productos críticos (baja rotación con vencimiento cercano)</h3>
            {resumen.criticos.length === 0 ? <EmptyBox mensaje="Sin productos críticos" /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-purple-100">
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-500">PRODUCTO</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-500">STOCK</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-500">VALOR</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-500">VENCE</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {resumen.criticos.map((c) => (
                      <tr key={c.idProducto}>
                        <td className="px-3 py-2 font-semibold text-gray-800">{c.producto}</td>
                        <td className="px-3 py-2 text-right">{c.stock}</td>
                        <td className="px-3 py-2 text-right">{formatoMoneda(c.valorStock)}</td>
                        <td className="px-3 py-2 text-xs text-red-600 font-bold">{c.proximoVencimiento}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white border border-purple-100 shadow-sm">
        <div className="px-5 py-4 border-b border-purple-100"><h3 className="text-sm font-bold text-gray-700">Detalle de productos</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-100">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">PRODUCTO</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">LABORATORIO</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">UNID. VEND.</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">FREQ.</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">MONTO VEND.</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">STOCK</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">VALOR STOCK</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500">CLASE</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">PRÓX. VENCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {detalles.length === 0 ? (
                <tr><td colSpan={9}><EmptyBox mensaje="Sin datos" /></td></tr>
              ) : detalles.map((d: RotacionProductosDetalleType) => (
                <tr key={d.idProducto} className="hover:bg-gray-50/70">
                  <td className="px-4 py-3"><p className="font-semibold text-gray-800">{d.nombreComercial}</p><p className="text-[11px] text-gray-400">{d.nombreGenerico}</p></td>
                  <td className="px-4 py-3 text-xs text-gray-600">{d.laboratorio}</td>
                  <td className="px-4 py-3 text-right font-semibold">{d.unidadesVendidas}</td>
                  <td className="px-4 py-3 text-right">{d.frecuenciaSalida}</td>
                  <td className="px-4 py-3 text-right font-extrabold">{formatoMoneda(d.montoVendido)}</td>
                  <td className="px-4 py-3 text-right">{d.stockActual}</td>
                  <td className="px-4 py-3 text-right">{formatoMoneda(d.valorStock)}</td>
                  <td className="px-4 py-3 text-center font-bold" style={{ color: COLOR_CLASE[d.clasificacion] }}>{d.clasificacion}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{d.proximoVencimiento ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isFetching && <div className="fixed bottom-5 right-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-lg border border-purple-100 text-xs font-semibold text-gray-600"><RefreshCw className="w-4 h-4 animate-spin" />Actualizando...</div>}
    </div>
  );
}
