import { Fragment, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GetCompraByIdApi } from "../../Api/CompraLoteApi"; 

// ─── Props ──────────────────────────────────────────────────────────────────
type Props = Readonly<{
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  idCompra: number | null;
}>;

// ─── Paleta Unificada ───────────────────────────────────────────────────────
const COLORS = {
  dark: "#4A1A6E",       
  medium: "#7B3FA0",     
  light: "#F5F0FA",      
  border: "#D8B4F0",     
  bgCard: "#FFFFFF",     
  bgRowHover: "#FAF7FC", 
  purple: "#7B3FA0",
  textPrimary: "#231929",   
  textSecondary: "#5C5263", 
  textMuted: "#9B92A3",     
  estadoPendiente:   { bg: "#FEF3C7", color: "#B45309", label: "PENDIENTE" }, 
  estadoCompletado:  { bg: "#D1FAE5", color: "#065F46", label: "COMPLETADO" }, 
  estadoCancelado:   { bg: "#FEE2E2", color: "#991B1B", label: "CANCELADO" }, 
};

// ─── Helpers de formato ─────────────────────────────────────────────────────
const formatMoney = (value?: number | string | null): string =>
  Number(value ?? 0).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatFecha = (fecha?: string | null): string => 
  fecha ? fecha.split("T")[0] : "—";

// ─── Diccionarios Auxiliares ────────────────────────────────────────────────
const ESTADOS_COMPRA: Record<string, typeof COLORS.estadoPendiente> = {
  pendiente: COLORS.estadoPendiente,
  completado: COLORS.estadoCompletado,
  cancelado: COLORS.estadoCancelado,
};

// ─── Subcomponentes (DRY) ───────────────────────────────────────────────────
function EstadoCompraBadge({ estado }: { estado: string }) {
  const s = ESTADOS_COMPRA[estado] ?? ESTADOS_COMPRA.pendiente;
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

function EstadoSanitarioBadge({ diasParaVencer = 0, fechaVencimiento }: { diasParaVencer?: number; fechaVencimiento?: string }) {
  const isVencido = diasParaVencer < 0;
  const isCritico = diasParaVencer >= 0 && diasParaVencer <= 30;
  const isProximo = diasParaVencer > 30 && diasParaVencer <= 60;

  const cfg = isVencido || isCritico
    ? { ...COLORS.estadoCancelado, label: isVencido ? "VENCIDO" : `CRÍTICO (${diasParaVencer} días)` }
    : isProximo
    ? { ...COLORS.estadoPendiente, label: `PRÓXIMO (${diasParaVencer} días)` }
    : { ...COLORS.estadoCompletado, label: `Seguro (${formatFecha(fechaVencimiento)})` };

  return (
    <span
      className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: COLORS.bgRowHover, border: `1px solid ${COLORS.border}` }}>
      <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: COLORS.textSecondary }}>
        {title}
      </p>
      {children}
    </div>
  );
}

// Nuevo componente para reducir las líneas de los totales
function TotalRow({ label, value, isDiscount = false, isTotal = false }: { label: string; value: string; isDiscount?: boolean; isTotal?: boolean }) {
  if (isTotal) {
    return (
      <div className="flex justify-between items-center mt-2 pt-2" style={{ borderTop: `1px solid ${COLORS.border}` }}>
        <span className="text-sm font-extrabold tracking-wide" style={{ color: COLORS.textPrimary }}>{label}</span>
        <span className="text-lg font-extrabold" style={{ color: COLORS.medium }}>{value}</span>
      </div>
    );
  }
  return (
    <div className="flex justify-between text-sm py-1">
      <span style={{ color: COLORS.textSecondary }}>{label}</span>
      <span className={isDiscount ? "font-semibold" : ""} style={{ color: isDiscount ? COLORS.estadoCancelado.color : COLORS.textPrimary }}>
        {value}
      </span>
    </div>
  );
}

// ─── Componente principal ───────────────────────────────────────────────────
export default function GetCompra({ isOpen, setIsOpen, idCompra }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [expandido, setExpandido] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    
    // Guardamos el overflow original para no mutar side-effects en otros componentes
    const originalOverflow = document.body.style.overflow;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow; 
    };
  }, [isOpen, setIsOpen]);

  const { data: compra, isLoading, isError, error } = useQuery({
    queryKey: ["CompraDetalle", idCompra],
    queryFn: () => GetCompraByIdApi(idCompra!), 
    enabled: isOpen && idCompra !== null,
  });

  if (!isOpen) return null;

  const impuestoPct = compra?.subtotal ? Math.round((compra.impuesto / compra.subtotal) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(31,41,55,0.6)", backdropFilter: "blur(2px)" }}
      onMouseDown={(e) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) setIsOpen(false);
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: COLORS.bgCard }}
      >
        {/* ══════════════════ HEADER ══════════════════ */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderColor: COLORS.border, background: `linear-gradient(135deg, ${COLORS.dark}, ${COLORS.purple})` }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-white truncate">
                  Detalle de Factura: <span style={{ color: COLORS.light }}>{compra?.numeroFactura ?? "—"}</span>
                </h2>
                {compra && <EstadoCompraBadge estado={compra.estado} />}
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: COLORS.light }}>
                ID del Registro de Compra: #{idCompra}
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-purple-200 hover:text-white transition-colors flex-shrink-0" aria-label="Cerrar ventana">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ══════════════════ BODY ══════════════════ */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {isLoading && (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke={COLORS.medium} strokeWidth="4" />
                <path className="opacity-75" fill={COLORS.medium} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>Cargando detalle de la compra...</p>
            </div>
          )}

          {isError && (
            <div className="py-20 text-center">
              <p className="text-sm font-semibold" style={{ color: COLORS.estadoCancelado.color }}>
                {(error as Error)?.message ?? "No se pudo cargar el detalle de la compra"}
              </p>
            </div>
          )}

          {compra && (
            <>
              {/* Paneles Informativos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                <InfoCard title="Destino y Recepción">
                  <p className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>{compra.sucursal}</p>
                  {compra.sucursalDireccion && <p className="text-xs mt-0.5" style={{ color: COLORS.textSecondary }}>{compra.sucursalDireccion}</p>}
                  <p className="text-xs mt-1.5" style={{ color: COLORS.textSecondary }}>
                    Ingreso: <span className="font-semibold">{formatFecha(compra.fechaEntrega ?? compra.fechaCreacion)}</span>
                  </p>
                </InfoCard>

                <InfoCard title="Proveedor Farmacéutico">
                  <p className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>{compra.proveedor}</p>
                  {compra.proveedorContacto && <p className="text-xs mt-0.5" style={{ color: COLORS.textSecondary }}>Contacto: {compra.proveedorContacto}</p>}
                  {compra.proveedorTelefono && <p className="text-xs" style={{ color: COLORS.textSecondary }}>Telf: {compra.proveedorTelefono}</p>}
                </InfoCard>

                <InfoCard title="Auditoría de Sistema">
                  <p className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>{compra.usuario}</p>
                  {compra.usuarioRol && <p className="text-xs mt-0.5 uppercase tracking-wide" style={{ color: COLORS.textSecondary }}>{compra.usuarioRol}</p>}
                  <p className="text-xs mt-1.5" style={{ color: COLORS.textSecondary }}>
                    Entrega:{" "}
                    <span className="font-semibold">
                      {compra.estado === "completado" ? "Completada"
                        : compra.estado === "cancelado" ? "Cancelada"
                        : compra.estado === "parcial" ? "Recepción parcial"
                        : compra.estado === "rechazado" ? "Rechazada"
                        : compra.estado === "devuelto_parcial" ? "Devuelta parcialmente"
                        : compra.estado === "devuelto_total" ? "Devuelta totalmente"
                        : "Pendiente"}
                    </span>
                  </p>
                </InfoCard>
              </div>

              {/* Tabla de lotes */}
              <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: COLORS.textSecondary }}>
                Medicamentos &amp; Lotes Adquiridos
              </p>
              <div className="overflow-x-auto rounded-xl" style={{ border: `1px solid ${COLORS.border}` }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: COLORS.light }}>
                      <th className="w-8"></th>
                      {["Medicamento / Lab", "Código Barra", "Información Lote", "Estado Sanit.", "Cant.", "Precio Unit.", "Desc.", "Subtotal"].map((h) => (
                        <th key={h} className="px-3 py-2.5 text-left font-bold tracking-wider" style={{ color: COLORS.textPrimary }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(compra.detalles ?? []).map((d: any) => (
                      <Fragment key={d.idLote}>
                        <tr className="border-b" style={{ borderColor: COLORS.border }}>
                          <td className="px-2 py-3 align-top">
                            <button
                              type="button"
                              onClick={() => setExpandido(expandido === d.idLote ? null : d.idLote ?? null)}
                              className="text-purple-400 hover:text-purple-700 transition-colors"
                            >
                              <svg className="w-4 h-4 transition-transform" style={{ transform: expandido === d.idLote ? "rotate(90deg)" : "rotate(0deg)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </td>
                          <td className="px-3 py-3">
                            <p className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>
                              {d.nombreGenerico} {d.concentracion && <span className="font-normal"> ({d.concentracion})</span>}
                            </p>
                            {(d.nombreComercial || d.nombreLaboratorio) && (
                              <p className="text-xs" style={{ color: COLORS.textSecondary }}>
                                {[d.nombreComercial ? `C. ${d.nombreComercial}` : null, d.nombreLaboratorio].filter(Boolean).join(" • ")}
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-3 font-mono" style={{ color: COLORS.textSecondary }}>{d.codigoBarra ?? "—"}</td>
                          <td className="px-3 py-3">
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold" style={{ backgroundColor: COLORS.light, color: COLORS.dark }}>
                              {d.codigo}
                            </span>
                            <p className="text-[10px] mt-1" style={{ color: COLORS.textSecondary }}>Cod. Interno: {d.numeroLote}</p>
                          </td>
                          <td className="px-3 py-3">
                            <EstadoSanitarioBadge diasParaVencer={d.diasParaVencer} fechaVencimiento={d.fechaVencimiento} />
                          </td>
                          <td className="px-3 py-3 text-center font-bold" style={{ color: COLORS.textPrimary }}>{d.cantidad}</td>
                          <td className="px-3 py-3 text-right" style={{ color: COLORS.textPrimary }}>Bs {formatMoney(d.precioUnitario)}</td>
                          <td className="px-3 py-3 text-right">
                            {d.descuento ? <span className="font-semibold" style={{ color: COLORS.estadoCancelado.color }}>-Bs {formatMoney(d.descuento)}</span> : <span style={{ color: COLORS.textMuted }}>—</span>}
                          </td>
                          <td className="px-3 py-3 text-right font-bold" style={{ color: COLORS.textPrimary }}>Bs {formatMoney(d.subtotal)}</td>
                        </tr>

                        {expandido === d.idLote && (
                          <tr style={{ backgroundColor: COLORS.bgRowHover }}>
                            <td></td>
                            <td colSpan={8} className="px-3 py-3">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]" style={{ color: COLORS.textSecondary }}>
                                <div><span className="font-semibold">Stock actual: </span>{d.stock}</div>
                                <div><span className="font-semibold">Estado del lote: </span>{d.estadoLote}</div>
                                <div><span className="font-semibold">Fabricación: </span>{formatFecha(d.fechaFabricacion)}</div>
                                <div><span className="font-semibold">Precio compra: </span>Bs {formatMoney(d.precioCompra)}</div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {compra.observaciones && (
                <div className="mt-4 rounded-xl p-4" style={{ backgroundColor: COLORS.estadoPendiente.bg, border: `1px solid ${COLORS.border}` }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: COLORS.estadoPendiente.color }}>
                    Observaciones del Pedido
                  </p>
                  <p className="text-sm italic" style={{ color: COLORS.estadoPendiente.color }}>&quot;{compra.observaciones}&quot;</p>
                </div>
              )}

              {/* Componente TotalRow abstrayendo estilos redundantes */}
              <div className="mt-5 flex justify-end">
                <div className="w-full md:w-96 rounded-xl p-4" style={{ backgroundColor: COLORS.bgRowHover, border: `1px solid ${COLORS.border}` }}>
                  <TotalRow label="Subtotal" value={`Bs ${formatMoney(compra.subtotal)}`} />
                  <TotalRow label="Descuento de Compra" value={`-Bs ${formatMoney(compra.descuento)}`} isDiscount />
                  <TotalRow label={`Impuestos Aplicados (IVA ${impuestoPct}%)`} value={`Bs ${formatMoney(compra.impuesto)}`} />
                  <TotalRow label="TOTAL FACTURADO:" value={`Bs ${formatMoney(compra.total)}`} isTotal />
                </div>
              </div>
            </>
          )}
        </div>

        {/* ══════════════════ FOOTER ══════════════════ */}
        <div className="flex justify-end px-6 py-4 flex-shrink-0" style={{ backgroundColor: COLORS.dark }}>
          <button
            onClick={() => setIsOpen(false)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:brightness-125 active:scale-95 transition-all"
            style={{ backgroundColor: COLORS.medium }}
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
}