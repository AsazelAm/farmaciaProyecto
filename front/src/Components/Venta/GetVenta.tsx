import { useQuery } from "@tanstack/react-query";
import { GetVentaByIdApi } from "../../Api/VentaApi";

type Props = Readonly<{
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  idVenta: number | null;
}>;

// ─── Paleta de Colores ───────────────────────────────────────────────────────
const COLORS = {
  bgBase: "#F3EBF9",
  bgCard: "#FFFFFF",
  purple: "#7B3FA0",
  purpleDark: "#4A1A6E",
  purpleDim: "#F3EBF9",
  textPrimary: "#2D0A47",
  textSecondary: "#7B3FA0",
  textMuted: "#9A7FA8",
  border: "#D8B4F0",
  green: "#059669",
  red: "#DC2626",
  amber: "#D97706",
};

const ESTADO_STYLES = {
  pendiente:  { bg: "#FEF3C7", color: "#D97706", label: "Pendiente" },
  completado: { bg: "#D1FAE5", color: "#059669", label: "Completado" },
  cancelado:  { bg: "#FEE2E2", color: "#DC2626", label: "Anulado" },
} as const;

// ─── Formatters ──────────────────────────────────────────────────────────────
const numFormatter = new Intl.NumberFormat("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatBOB = (valor?: number | null) => `Bs ${numFormatter.format(valor ?? 0)}`;

const dateTimeFormatter = new Intl.DateTimeFormat("es-BO", {
  day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
});
const formatFechaHora = (isoStr?: string) => {
  if (!isoStr) return "—";
  const fecha = new Date(isoStr);
  return Number.isNaN(fecha.getTime()) ? "—" : dateTimeFormatter.format(fecha);
};

const formatNumeroVenta = (idVenta: number) => `#${String(idVenta).padStart(5, "0")}`;

// Une partes opcionales con " · ", descartando las vacías (evita separadores "colgados")
const joinInfo = (...partes: (string | null | undefined | false)[]) => partes.filter(Boolean).join(" · ");

// ─── Subcomponentes ──────────────────────────────────────────────────────────
function InfoCard({ icon, titulo, idLabel, children }: {
  icon: React.ReactNode;
  titulo: string;
  idLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border p-4 flex-1 min-w-0" style={{ borderColor: COLORS.border, backgroundColor: "#FDFBFF" }}>
      <div className="flex items-center gap-1.5 mb-2">
        <span style={{ color: COLORS.purple }}>{icon}</span>
        <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: COLORS.purple }}>
          {titulo} <span className="font-normal normal-case" style={{ color: COLORS.textMuted }}>{idLabel}</span>
        </p>
      </div>
      {children}
    </div>
  );
}

function SummaryRow({ label, value, color, strong = false }: {
  label: string;
  value: string;
  color?: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: "#C7B4DA" }}>{label}</span>
      <span className={strong ? "text-lg font-extrabold" : "text-sm font-semibold"} style={{ color: color ?? "#FFFFFF" }}>
        {value}
      </span>
    </div>
  );
}

// ─── Componente Principal ────────────────────────────────────────────────────
export default function GetVenta({ isOpen, setIsOpen, idVenta }: Props) {
  const { data: venta, isLoading } = useQuery({
    queryKey: ["VentaDetalle", idVenta],
    queryFn: () => GetVentaByIdApi(idVenta as number),
    enabled: isOpen && !!idVenta,
  });

  if (!isOpen) return null;

  const estStyle = venta
    ? ESTADO_STYLES[venta.estado as keyof typeof ESTADO_STYLES] ?? ESTADO_STYLES.pendiente
    : ESTADO_STYLES.pendiente;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

      <div
        className="relative w-full max-w-3xl max-h-[92vh] rounded-2xl overflow-hidden shadow-2xl z-10 border flex flex-col"
        style={{ backgroundColor: COLORS.bgCard, borderColor: COLORS.border }}
      >
        {isLoading || !venta ? (
          <div className="flex items-center justify-center py-24">
            <svg className="w-8 h-8 animate-spin" style={{ color: COLORS.purple }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div
              className="px-6 py-4 border-b flex-shrink-0"
              style={{ borderColor: COLORS.border, background: `linear-gradient(135deg, ${COLORS.purpleDark}, ${COLORS.purple})` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/20 shadow-inner">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">Detalle de Venta {formatNumeroVenta(venta.idVenta)}</h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ backgroundColor: estStyle.bg, color: estStyle.color }}>
                        {estStyle.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/70 mt-0.5">
                      Emisión: {formatFechaHora(venta.fechaCreacion)} · Modificado: {formatFechaHora(venta.fechaModificacion)}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white text-xl leading-none px-2">✕</button>
              </div>
            </div>

            {/* CONTENIDO SCROLLEABLE */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5" style={{ backgroundColor: COLORS.bgBase }}>
              {/* TARJETAS DE CONTEXTO */}
              <div className="flex flex-col md:flex-row gap-3">
                <InfoCard
                  titulo="Cliente"
                  idLabel=""
                  icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                >
                  <p className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>{venta.cliente ?? "Cliente General"}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: COLORS.textMuted }}>NIT/CI: {venta.clienteNit ?? "0"}</p>
                  {venta.clienteTelefono && <p className="text-[11px]" style={{ color: COLORS.textMuted }}>Teléfono: {venta.clienteTelefono}</p>}
                </InfoCard>

                <InfoCard
                  titulo="Atendido Por"
                  idLabel=""
                  icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" /></svg>}
                >
                  <p className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>{venta.usuario ?? "—"}</p>
                  {venta.usuarioRol && <p className="text-[11px] mt-0.5" style={{ color: COLORS.textMuted }}>Cargo: {venta.usuarioRol}</p>}
                </InfoCard>

                <InfoCard
                  titulo="Sucursal"
                  idLabel=""
                  icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m8-14h.01M11 11h.01M11 15h.01M7 7h.01M7 11h.01M7 15h.01" /></svg>}
                >
                  <p className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>{venta.sucursal ?? "—"}</p>
                  {venta.sucursalDireccion && <p className="text-[11px] mt-0.5" style={{ color: COLORS.textMuted }}>{venta.sucursalDireccion}</p>}
                </InfoCard>
              </div>

              {/* PRODUCTOS VENDIDOS */}
              <div className="rounded-xl border overflow-hidden bg-white" style={{ borderColor: COLORS.border }}>
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" style={{ color: COLORS.purple }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    <p className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>
                      Productos Vendidos 
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold" style={{ color: COLORS.textMuted }}>
                    {venta.detalles?.length ?? 0} ítems registrados
                  </span>
                </div>

                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left" style={{ backgroundColor: COLORS.purpleDim }}>
                      <th className="px-4 py-2 font-bold" style={{ color: COLORS.purpleDark }}>Producto / Presentación</th>
                      <th className="px-4 py-2 font-bold" style={{ color: COLORS.purpleDark }}>Lote </th>
                      <th className="px-4 py-2 font-bold text-center" style={{ color: COLORS.purpleDark }}>Cant.</th>
                      <th className="px-4 py-2 font-bold text-right" style={{ color: COLORS.purpleDark }}>Precio Un.</th>
                      <th className="px-4 py-2 font-bold text-right" style={{ color: COLORS.purpleDark }}>Dto. Línea</th>
                      <th className="px-4 py-2 font-bold text-right" style={{ color: COLORS.purpleDark }}>Subtotal Línea</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: COLORS.border }}>
                    {(venta.detalles ?? []).map((d, i) => (
                      <tr key={`${d.idLote}-${i}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: COLORS.purpleDim }}>
                              <svg className="w-4 h-4" style={{ color: COLORS.purple }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H6.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 0011 10.172V5L8 4z" /></svg>
                            </div>
                            <div>
                              <p className="font-semibold" style={{ color: COLORS.textPrimary }}>{d.nombreGenerico}</p>
                              <p style={{ color: COLORS.textMuted }}>
                                {joinInfo(d.nombreComercial, d.concentracion, d.nombreLaboratorio)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold" style={{ color: COLORS.textPrimary }}>{d.codigo}</p>
                          <p style={{ color: COLORS.textMuted }}>Vence: {d.fechaVencimiento}</p>
                        </td>
                        <td className="px-4 py-3 text-center font-bold" style={{ color: COLORS.textPrimary }}>{d.cantidad}</td>
                        <td className="px-4 py-3 text-right" style={{ color: COLORS.textPrimary }}>{formatBOB(d.precioUnitario)}</td>
                        <td className="px-4 py-3 text-right" style={{ color: COLORS.red }}>
                          {(d.descuento ?? 0) > 0 ? `- ${formatBOB(d.descuento)}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-bold" style={{ color: COLORS.textPrimary }}>{formatBOB(d.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* OBSERVACIONES + RESUMEN DE PAGO */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 rounded-xl border p-4 bg-white" style={{ borderColor: COLORS.border }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <svg className="w-3.5 h-3.5" style={{ color: COLORS.purple }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: COLORS.purple }}>Observaciones de la Venta</p>
                  </div>
                  <p className="text-sm" style={{ color: venta.observaciones ? COLORS.textPrimary : COLORS.textMuted }}>
                    {venta.observaciones || "Sin observaciones registradas."}
                  </p>
                </div>

                <div
                  className="w-full md:w-72 flex-shrink-0 rounded-xl p-4 space-y-2"
                  style={{ background: `linear-gradient(160deg, ${COLORS.purpleDark}, #1F0A33)` }}
                >
                  <SummaryRow label="Subtotal Acumulado:" value={formatBOB(venta.subtotal)} />
                  <SummaryRow label="Descuento Aplicado:" value={(venta.descuentoTotal ?? 0) > 0 ? `- ${formatBOB(venta.descuentoTotal)}` : formatBOB(0)} color="#F87171" />
                  <SummaryRow label="Impuestos (Ley 843):" value={`+ ${formatBOB(venta.impuestos)}`} color="#FCD34D" />
                  <div className="h-px my-1" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
                  <SummaryRow label="TOTAL A PAGAR" value={formatBOB(venta.total)} color="#34D399" strong />
                  <div className="h-px my-1" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
                  <div className="flex items-center justify-between text-[11px]" style={{ color: "#C7B4DA" }}>
                    <span>Método Pago:</span>
                    <span className="font-semibold text-white">{venta.tipoPago ?? "—"}</span>
                  </div>
                  
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 flex-shrink-0" style={{ borderColor: COLORS.border }}>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border bg-white hover:bg-gray-50"
                style={{ color: COLORS.textSecondary, borderColor: COLORS.border }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-8 4h4a1 1 0 001-1v-4H9v4a1 1 0 001 1z" /></svg>
                Imprimir Recibo / Factura
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-95"
                style={{ backgroundColor: COLORS.purpleDark }}
              >
                Cerrar Ventana
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}