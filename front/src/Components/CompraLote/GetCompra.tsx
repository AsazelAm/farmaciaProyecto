import { Fragment, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GetCompraByIdApi } from "../../Api/CompraLoteApi"; // ajusta la ruta si tu carpeta real difiere

// ─── Props ──────────────────────────────────────────────────────────────────
// idCompra es nullable: Compra.tsx lo setea cuando el usuario hace click en
// una fila de la tabla, y lo vuelve a null cuando no hay nada seleccionado.
type Props = Readonly<{
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  idCompra: number | null;
}>;

// ─── Paleta Unificada con Compra.tsx ─────────────────────────────────────────
const COLORS = {
  dark: "#632D8A",       // Amatista quemado
  medium: "#7B3FA0",     // TU COLOR BASE
  light: "#F5F0FA",      // Fondo de inputs/badges tipo algodón
  border: "#E2D9EB",     // Líneas divisorias muy delicadas
  bgCard: "#FFFFFF",     
  bgRowHover: "#FAF7FC", // Un roce lila casi imperceptible pero elegante

  // Textos con tinte uva oscuro (se ve mucho más pro que el negro puro)
  textPrimary: "#231929",   
  textSecondary: "#5C5263", 
  textMuted: "#9B92A3",     

  // Estados (Tonos pastel desaturados muy aesthetic)
  estadoPendiente:   { bg: "#FEF3C7", color: "#B45309", dot: "#B45309" }, 
  estadoCompletado:  { bg: "#D1FAE5", color: "#065F46", dot: "#065F46" }, 
  estadoCancelado:   { bg: "#FEE2E2", color: "#991B1B", dot: "#991B1B" }, 
};

// ─── Helpers de formato ───────────────────────────────────────────────────────
// Formatea a "1.250,00" (separador de miles con punto, decimales con coma),
// igual que se ve en la captura ("Bs 1.250,00").
function formatMoney(value: number | string | undefined | null): string {
  const n = Number(value ?? 0);
  return n.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Tus fechas vienen en formato ISO ("2026-06-28T00:00:00.000Z"); nos quedamos
// solo con la parte YYYY-MM-DD, igual que ya haces en otros schemas (index.ts).
function formatFecha(fecha?: string | null): string {
  if (!fecha) return "—";
  return fecha.split("T")[0];
}

// ─── Badge de estado de la Compra (header) ───────────────────────────────────
function EstadoCompraBadge({ estado }: { estado: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    pendiente:  { bg: COLORS.estadoPendiente.bg,   text: COLORS.estadoPendiente.color,   label: "PENDIENTE" },
    completado: { bg: COLORS.estadoCompletado.bg,  text: COLORS.estadoCompletado.color,  label: "COMPLETADO" },
    cancelado:  { bg: COLORS.estadoCancelado.bg,   text: COLORS.estadoCancelado.color,   label: "CANCELADO" },
  };
  const s = map[estado] ?? map.pendiente;
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  );
}

// ─── Badge "sanitario" por lote, según días para vencer ──────────────────────
// Umbrales: <=30 días = CRÍTICO, <=60 días = PRÓXIMO, más de eso = Seguro.
function EstadoSanitarioBadge({
  diasParaVencer,
  fechaVencimiento,
}: {
  diasParaVencer?: number;
  fechaVencimiento?: string;
}) {
  const dias = diasParaVencer ?? 0;
  let cfg: { bg: string; text: string; label: string };

  if (dias < 0) {
    cfg = { bg: COLORS.estadoCancelado.bg, text: COLORS.estadoCancelado.color, label: "VENCIDO" };
  } else if (dias <= 30) {
    cfg = { bg: COLORS.estadoCancelado.bg, text: COLORS.estadoCancelado.color, label: `CRÍTICO (${dias} días)` };
  } else if (dias <= 60) {
    cfg = { bg: COLORS.estadoPendiente.bg, text: COLORS.estadoPendiente.color, label: `PRÓXIMO (${dias} días)` };
  } else {
    cfg = { bg: COLORS.estadoCompletado.bg, text: COLORS.estadoCompletado.color, label: `Seguro (${formatFecha(fechaVencimiento)})` };
  }

  return (
    <span
      className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  );
}

// ─── Tarjeta de información (los 3 paneles superiores) ───────────────────────
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

// ─── Componente principal ─────────────────────────────────────────────────────
export default function GetCompra({ isOpen, setIsOpen, idCompra }: Props) {
  // Referencia al contenedor del modal para detectar clicks "fuera" y cerrarlo.
  const modalRef = useRef<HTMLDivElement>(null);

  // Fila de la tabla actualmente expandida (guardamos el idLote, no el índice,
  // para que no se desincronice si la lista cambia).
  const [expandido, setExpandido] = useState<number | null>(null);

  // ── Cierre con tecla Escape + bloqueo de scroll del body mientras está abierto ──
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, setIsOpen]);

  // ── Query: trae la compra + sus lotes por ID ──────────────────────────────
  // "enabled" evita disparar la petición si el modal está cerrado o si aún
  // no se ha seleccionado ninguna compra (idCompra === null).
  const { data: compra, isLoading, isError, error } = useQuery({
    queryKey: ["CompraDetalle", idCompra],
    queryFn: () => GetCompraByIdApi(idCompra as number),
    enabled: isOpen && idCompra !== null,
  });

  if (!isOpen) return null;

  // Reconstruye el % de IVA a partir de los montos guardados (subtotal / impuesto),
  // en vez de depender de un campo de porcentaje separado que podría desincronizarse.
  const impuestoPct =
    compra && compra.subtotal > 0 ? Math.round((compra.impuesto / compra.subtotal) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(31,41,55,0.6)", backdropFilter: "blur(2px)" }}
      onMouseDown={(e) => {
        // Cierra solo si el click fue en el overlay, no dentro de la tarjeta
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: COLORS.bgCard }}
      >
        {/* ══════════════════ HEADER (Lila Profundo) ══════════════════ */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ backgroundColor: COLORS.dark }}>
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
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
          <button
            onClick={() => setIsOpen(false)}
            className="text-purple-200 hover:text-white transition-colors flex-shrink-0"
            aria-label="Cerrar ventana"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ══════════════════ BODY (scrollable) ══════════════════ */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {/* Loading */}
          {isLoading && (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke={COLORS.medium} strokeWidth="4" />
                <path className="opacity-75" fill={COLORS.medium} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>Cargando detalle de la compra...</p>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="py-20 text-center">
              <p className="text-sm font-semibold" style={{ color: COLORS.estadoCancelado.color }}>
                {(error as Error)?.message ?? "No se pudo cargar el detalle de la compra"}
              </p>
            </div>
          )}

          {/* Contenido */}
          {compra && (
            <>
              {/* ── 3 paneles de información ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                <InfoCard title="Destino y Recepción">
                  <p className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>{compra.sucursal}</p>
                  {compra.sucursalDireccion && (
                    <p className="text-xs mt-0.5" style={{ color: COLORS.textSecondary }}>{compra.sucursalDireccion}</p>
                  )}
                  <p className="text-xs mt-1.5" style={{ color: COLORS.textSecondary }}>
                    Ingreso: <span className="font-semibold">{formatFecha(compra.fechaEntrega ?? compra.fechaCreacion)}</span>
                  </p>
                </InfoCard>

                <InfoCard title="Proveedor Farmacéutico">
                  <p className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>{compra.proveedor}</p>
                  {compra.proveedorContacto && (
                    <p className="text-xs mt-0.5" style={{ color: COLORS.textSecondary }}>Contacto: {compra.proveedorContacto}</p>
                  )}
                  {compra.proveedorTelefono && (
                    <p className="text-xs" style={{ color: COLORS.textSecondary }}>Telf: {compra.proveedorTelefono}</p>
                  )}
                </InfoCard>

                <InfoCard title="Auditoría de Sistema">
                  <p className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>{compra.usuario}</p>
                  {compra.usuarioRol && (
                    <p className="text-xs mt-0.5 uppercase tracking-wide" style={{ color: COLORS.textSecondary }}>
                      {compra.usuarioRol}
                    </p>
                  )}
                  <p className="text-xs mt-1.5" style={{ color: COLORS.textSecondary }}>
                    Entrega:{" "}
                    <span className="font-semibold">
                      {compra.estado === "completado" ? "Completada" : compra.estado === "cancelado" ? "Cancelada" : "Pendiente"}
                    </span>
                  </p>
                </InfoCard>
              </div>

              {/* ── Tabla de medicamentos / lotes ── */}
              <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: COLORS.textSecondary }}>
                Medicamentos &amp; Lotes Adquiridos
              </p>
              <div className="overflow-x-auto rounded-xl" style={{ border: `1px solid ${COLORS.border}` }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: COLORS.light }}>
                      <th className="w-8"></th>
                      {["Medicamento / Lab", "Código Barra", "Información Lote", "Estado Sanit.", "Cant.", "Precio Unit.", "Desc.", "Subtotal"].map((h) => (
                        <th key={h} className="px-3 py-2.5 text-left font-bold tracking-wider" style={{ color: COLORS.textPrimary }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(compra.detalles ?? []).map((d) => (
                      <Fragment key={d.idLote}>
                        <tr className="border-b" style={{ borderColor: COLORS.border }}>
                          <td className="px-2 py-3 align-top">
                            <button
                              type="button"
                              onClick={() => setExpandido(expandido === d.idLote ? null : d.idLote ?? null)}
                              className="text-purple-400 hover:text-purple-700 transition-colors"
                              aria-label="Ver más detalles del lote"
                            >
                              <svg
                                className="w-4 h-4 transition-transform"
                                style={{ transform: expandido === d.idLote ? "rotate(90deg)" : "rotate(0deg)" }}
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </td>
                          <td className="px-3 py-3">
                            <p className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>
                              {d.nombreGenerico}
                              {d.concentracion && <span className="font-normal"> ({d.concentracion})</span>}
                            </p>
                            {(d.nombreComercial || d.nombreLaboratorio) && (
                              <p className="text-xs" style={{ color: COLORS.textSecondary }}>
                                {d.nombreComercial && `C. ${d.nombreComercial}`}
                                {d.nombreComercial && d.nombreLaboratorio && " • "}
                                {d.nombreLaboratorio}
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-3 font-mono" style={{ color: COLORS.textSecondary }}>
                            {d.codigoBarra ?? "—"}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className="inline-block px-2 py-0.5 rounded text-[11px] font-bold"
                              style={{ backgroundColor: COLORS.light, color: COLORS.dark }}
                            >
                              {d.codigo}
                            </span>
                            <p className="text-[10px] mt-1" style={{ color: COLORS.textSecondary }}>
                              Cod. Interno: {d.numeroLote}
                            </p>
                          </td>
                          <td className="px-3 py-3">
                            <EstadoSanitarioBadge diasParaVencer={d.diasParaVencer} fechaVencimiento={d.fechaVencimiento} />
                          </td>
                          <td className="px-3 py-3 text-center font-bold" style={{ color: COLORS.textPrimary }}>
                            {d.cantidad}
                          </td>
                          <td className="px-3 py-3 text-right" style={{ color: COLORS.textPrimary }}>
                            Bs {formatMoney(d.precioUnitario)}
                          </td>
                          <td className="px-3 py-3 text-right">
                            {d.descuento ? (
                              <span className="font-semibold" style={{ color: COLORS.estadoCancelado.color }}>-Bs {formatMoney(d.descuento)}</span>
                            ) : (
                              <span style={{ color: COLORS.textMuted }}>—</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-right font-bold" style={{ color: COLORS.textPrimary }}>
                            Bs {formatMoney(d.subtotal)}
                          </td>
                        </tr>

                        {/* Fila expandible con detalle extra del lote */}
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

              {/* ── Observaciones ── */}
              {compra.observaciones && (
                <div className="mt-4 rounded-xl p-4" style={{ backgroundColor: COLORS.estadoPendiente.bg, border: `1px solid ${COLORS.border}` }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: COLORS.estadoPendiente.color }}>
                    Observaciones del Pedido
                  </p>
                  <p className="text-sm italic" style={{ color: COLORS.estadoPendiente.color }}>&quot;{compra.observaciones}&quot;</p>
                </div>
              )}

              {/* ── Totales ── */}
              <div className="mt-5 flex justify-end">
                <div className="w-full md:w-96 rounded-xl p-4" style={{ backgroundColor: COLORS.bgRowHover, border: `1px solid ${COLORS.border}` }}>
                  <div className="flex justify-between text-sm py-1">
                    <span style={{ color: COLORS.textSecondary }}>Subtotal</span>
                    <span style={{ color: COLORS.textPrimary }}>Bs {formatMoney(compra.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1">
                    <span style={{ color: COLORS.textSecondary }}>Descuento de Compra</span>
                    <span className="font-semibold" style={{ color: COLORS.estadoCancelado.color }}>-Bs {formatMoney(compra.descuento)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1">
                    <span style={{ color: COLORS.textSecondary }}>Impuestos Aplicados (IVA {impuestoPct}%)</span>
                    <span style={{ color: COLORS.textPrimary }}>Bs {formatMoney(compra.impuesto)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2" style={{ borderTop: `1px solid ${COLORS.border}` }}>
                    <span className="text-sm font-extrabold tracking-wide" style={{ color: COLORS.textPrimary }}>
                      TOTAL FACTURADO:
                    </span>
                    <span className="text-lg font-extrabold" style={{ color: COLORS.medium }}>
                      Bs {formatMoney(compra.total)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ══════════════════ FOOTER (Lila Profundo) ══════════════════ */}
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