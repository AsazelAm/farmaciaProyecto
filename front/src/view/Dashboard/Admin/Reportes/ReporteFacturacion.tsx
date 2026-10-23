import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, FileText, RefreshCw, Search } from "lucide-react";
import Loading from "../../../../Helpers/Loading";
import { GetParametrosFacturacionApi, GetReporteFacturacionDatosApi, DescargarReporteFacturacionExcelApi, DescargarReporteFacturacionPdfApi } from "../../../../Api/ReporteApi";
import type { FacturacionParametrosType, ReporteFacturacionDatosType, ReporteFacturacionFiltrosType, FacturacionDetalleType } from "../../../../types";

const formatoMoneda = (n: number) => `Bs ${n.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function EmptyBox({ mensaje }: { mensaje: string }) { return <div className="py-12 text-center text-xs text-gray-400">{mensaje}</div>; }
function MensajeError({ mensaje }: { mensaje: string }) { return <div className="min-h-[60vh] flex items-center justify-center"><div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-8 text-center max-w-md"><AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" /><p className="text-sm font-semibold text-red-700">{mensaje}</p></div></div>; }

function BotonDescarga({ tipo, filtros, disabled }: { tipo: "excel" | "pdf"; filtros: ReporteFacturacionFiltrosType; disabled: boolean }) {
  const [cargando, setCargando] = useState(false);
  return (
    <button onClick={async () => { setCargando(true); try { if (tipo === "excel") await DescargarReporteFacturacionExcelApi(filtros); else await DescargarReporteFacturacionPdfApi(filtros); } finally { setCargando(false); } }} disabled={disabled || cargando} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm disabled:opacity-60" style={{ backgroundColor: tipo === "excel" ? "#15803D" : "#DC2626" }}>
      {cargando ? "Generando..." : tipo === "excel" ? "Descargar Excel" : "Descargar PDF"}
    </button>
  );
}

export default function ReporteFacturacion() {
  const filtrosIniciales: ReporteFacturacionFiltrosType = { fechaInicio: undefined, fechaFin: undefined, estado: undefined, tipoFactura: undefined, busqueda: undefined };
  const [filtrosEdit, setFiltrosEdit] = useState<ReporteFacturacionFiltrosType>(filtrosIniciales);
  const [filtrosAplicados, setFiltrosAplicados] = useState<ReporteFacturacionFiltrosType>(filtrosIniciales);
  const [busquedaInput, setBusquedaInput] = useState("");

  const { data: parametros, isLoading: lp } = useQuery<FacturacionParametrosType>({ queryKey: ["FacturacionParametros"], queryFn: GetParametrosFacturacionApi });
  const { data, isLoading, isFetching, error } = useQuery<ReporteFacturacionDatosType>({ queryKey: ["Facturacion", filtrosAplicados], queryFn: () => GetReporteFacturacionDatosApi(filtrosAplicados), placeholderData: (prev) => prev });

  const consultar = () => setFiltrosAplicados({ ...filtrosEdit, busqueda: busquedaInput.trim() === "" ? undefined : busquedaInput.trim() });
  const resetear = () => { setFiltrosEdit(filtrosIniciales); setBusquedaInput(""); setFiltrosAplicados(filtrosIniciales); };

  if (lp || isLoading) return <Loading />;
  if (error) return <MensajeError mensaje={error instanceof Error ? error.message : "Error"} />;

  const detalles = data?.detalles ?? [];
  const resumen = data?.resumen;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#4A1A6E]"><FileText className="w-6 h-6 text-white" /></div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Facturación, Emisiones y Anulaciones</h1>
          <p className="text-sm text-gray-500">Cumplimiento fiscal y auditoría</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Desde</label><input type="date" value={filtrosEdit.fechaInicio ?? ""} onChange={(e) => setFiltrosEdit((p) => ({ ...p, fechaInicio: e.target.value || undefined }))} className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm" /></div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Hasta</label><input type="date" value={filtrosEdit.fechaFin ?? ""} onChange={(e) => setFiltrosEdit((p) => ({ ...p, fechaFin: e.target.value || undefined }))} className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm" /></div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Estado</label>
            <select value={filtrosEdit.estado ?? ""} onChange={(e) => setFiltrosEdit((p) => ({ ...p, estado: e.target.value || undefined }))} className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm">
              <option value="">Todos</option>
              {(parametros?.estados ?? []).map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Tipo factura</label>
            <select value={filtrosEdit.tipoFactura ?? ""} onChange={(e) => setFiltrosEdit((p) => ({ ...p, tipoFactura: e.target.value || undefined }))} className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm">
              <option value="">Todos</option>
              {(parametros?.tiposFactura ?? []).map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1.5">Búsqueda</label><input type="text" value={busquedaInput} onChange={(e) => setBusquedaInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") consultar(); }} placeholder="Número, NIT o razón social..." className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm" /></div>
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
          <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5"><p className="text-xs text-gray-500">Facturas</p><p className="text-xl font-extrabold">{resumen.totalFacturas}</p></div>
          <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5"><p className="text-xs text-gray-500">Emitidas</p><p className="text-xl font-extrabold">{resumen.facturasEmitidas}</p></div>
          <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5"><p className="text-xs text-gray-500">Anuladas</p><p className="text-xl font-extrabold">{resumen.facturasAnuladas} ({resumen.porcentajeAnuladas.toFixed(1)}%)</p></div>
          <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5"><p className="text-xs text-gray-500">Monto total</p><p className="text-xl font-extrabold">{formatoMoneda(resumen.montoTotal)}</p></div>
          <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5"><p className="text-xs text-gray-500">Monto emitido</p><p className="text-xl font-extrabold">{formatoMoneda(resumen.montoEmitido)}</p></div>
          <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5"><p className="text-xs text-gray-500">Monto anulado</p><p className="text-xl font-extrabold">{formatoMoneda(resumen.montoAnulado)}</p></div>
          <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5"><p className="text-xs text-gray-500">IVA / Impuesto</p><p className="text-xl font-extrabold">{formatoMoneda(resumen.impuestoTotal)}</p></div>
          <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5"><p className="text-xs text-gray-500">Descuentos</p><p className="text-xl font-extrabold">{formatoMoneda(resumen.descuentoTotal)}</p></div>
        </div>
      )}

      {resumen && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Por estado</h3>
            <div className="space-y-3">
              {resumen.porEstado.map((e) => {
                const pct = resumen.totalFacturas > 0 ? (e.facturas / resumen.totalFacturas) * 100 : 0;
                const color = e.estado.toLowerCase().includes("anul") ? "#DC2626" : "#059669";
                return (
                  <div key={e.estado} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-extrabold" style={{ color }}>{e.estado}</span>
                      <span className="text-xs text-gray-500">{e.facturas} fact. · {formatoMoneda(e.total)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: color }} />
                    </div>
                    <div className="text-[11px] text-gray-500">{pct.toFixed(1)}% del total</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Por tipo de emisión</h3>
            <div className="space-y-3">
              {resumen.porTipo.map((t) => {
                const pct = resumen.totalFacturas > 0 ? (t.facturas / resumen.totalFacturas) * 100 : 0;
                return (
                  <div key={t.tipo} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-extrabold text-purple-700">{t.tipo}</span>
                      <span className="text-xs text-gray-500">{t.facturas} fact. · {formatoMoneda(t.total)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-purple-500" style={{ width: `${Math.max(pct, 4)}%` }} />
                    </div>
                    <div className="text-[11px] text-gray-500">{pct.toFixed(1)}% del total</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {resumen && resumen.motivosAnulacion.length > 0 && (
        <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Motivos de anulación</h3>
          <div className="space-y-3">
            {resumen.motivosAnulacion.map((m) => {
              const max = Math.max(...resumen.motivosAnulacion.map((x) => x.facturas), 1);
              const pct = (m.facturas / max) * 100;
              return (
                <div key={m.motivo} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-700">{m.motivo}</span>
                    <span className="text-xs font-bold text-red-600">{m.facturas} fact.</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.max(pct, 4)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white border border-purple-100 shadow-sm">
        <div className="px-5 py-4 border-b border-purple-100"><h3 className="text-sm font-bold text-gray-700">Detalle de facturas</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-purple-100">
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">NRO</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">FECHA</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">TIPO</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">NIT/DOC</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">RAZÓN SOCIAL</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">SUBTOTAL</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">DESC.</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">IMPUESTO</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">TOTAL</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">ESTADO</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">F. ANULACIÓN</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">MOTIVO</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">USUARIO</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {detalles.length === 0 ? <tr><td colSpan={13}><EmptyBox mensaje="Sin datos" /></td></tr> : detalles.map((d: FacturacionDetalleType) => (
                <tr key={d.idFactura} className="hover:bg-gray-50/70">
                  <td className="px-4 py-3 font-bold text-gray-800">{d.numeroFactura}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{d.fechaEmision}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{d.tipoFactura}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{d.nitCliente}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{d.razonSocial}</td>
                  <td className="px-4 py-3 text-right">{formatoMoneda(d.subtotal)}</td>
                  <td className="px-4 py-3 text-right">{formatoMoneda(d.descuento)}</td>
                  <td className="px-4 py-3 text-right">{formatoMoneda(d.impuesto)}</td>
                  <td className="px-4 py-3 text-right font-extrabold">{formatoMoneda(d.total)}</td>
                  <td className="px-4 py-3 text-xs font-bold">{d.estado}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{d.fechaAnulacion ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-[200px]">{d.motivoAnulacion ?? ""}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{d.usuarioEmisor}{d.usuarioAnulacion ? ` / Anuló: ${d.usuarioAnulacion}` : ""}</td>
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
