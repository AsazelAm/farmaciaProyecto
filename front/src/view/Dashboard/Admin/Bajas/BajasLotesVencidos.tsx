import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Loading from "../../../../Helpers/Loading";
import {
  AddBajaApi,
  AjustarPerdidaApi,
  AnularBajaApi,
  AprobarBajaApi,
  EjecutarBajaApi,
  GetBajaByIdApi,
  GetBajasApi,
  GetLotesVencidosApi,
  GetProximosAVencerApi,
  GetReportePerdidasApi,
} from "../../../../Api/BajaLoteVencidoApi";
import { GetUserAllApi } from "../../../../Api/UserApi";
import { GetSucursalApi } from "../../../../Api/SucursalApi";
import { GetDevolucionesProveedorApi } from "../../../../Api/DevolucionApi";
import { useAuth } from "../../../../Hook/UseAuth";
import type {
  AccionBaja,
  BajaListItemType,
  BajaType,
  CrearBajaType,
  EstadoBaja,
  IBajaFiltros,
  IReportePerdidasFiltros,
  LoteParaBajaType,
  ReportePerdidasDatosType,
} from "../../../../types";

// ═════════════════════════════════════════════════════════════════════════════
// BAJAS DE LOTES VENCIDOS
// Misma paleta y patrones que Lote.tsx / Devolucion.tsx. El servidor es la
// fuente de verdad del estado y de los importes; aquí solo se presentan y se
// envían las acciones del usuario.
// ═════════════════════════════════════════════════════════════════════════════

const C = {
  dark: "#4A1A6E",
  medium: "#7B3FA0",
  light: "#F3EBF9",
  border: "#D8B4F0",
  text: "#2D0A47",
};
const GRADIENT = `linear-gradient(135deg, ${C.dark}, ${C.medium})`;
const SURFACE = "#FBF8FE";
const MUTED = "#9CA3AF";
const ERROR = "#EF4444";
const SUCCESS = "#059669";

const ESTADOS_BAJA: Record<EstadoBaja, { label: string; bg: string; color: string }> = {
  pendiente: { label: "Pendiente", bg: "#FEF3C7", color: "#D97706" },
  aprobada: { label: "Aprobada", bg: "#DBEAFE", color: "#2563EB" },
  ejecutada: { label: "Ejecutada", bg: "#D1FAE5", color: SUCCESS },
  anulada: { label: "Anulada", bg: "#F3F4F6", color: "#6B7280" },
};

const ACCIONES_LABEL: Record<AccionBaja, string> = {
  cuarentena: "Cuarentena",
  baja_merma: "Baja por merma",
  destruccion: "Destrucción",
  devolucion_proveedor: "Devolución al proveedor",
};

const ESTADO_LOTE: Record<string, { label: string; bg: string; color: string }> = {
  activo: { label: "Activo", bg: "#D1FAE5", color: SUCCESS },
  pendiente: { label: "Pendiente", bg: "#FEF3C7", color: "#D97706" },
  vencido: { label: "Vencido", bg: "#FEE2E2", color: "#DC2626" },
  cuarentena: { label: "Cuarentena", bg: "#FEF3C7", color: "#D97706" },
  devuelto: { label: "Devuelto", bg: "#DBEAFE", color: "#2563EB" },
  cancelado: { label: "Cancelado", bg: "#F3F4F6", color: "#6B7280" },
};

const numFmt = new Intl.NumberFormat("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatBOB = (valor: number) => `Bs ${numFmt.format(valor ?? 0)}`;
const dateFmt = new Intl.DateTimeFormat("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" });
const formatFecha = (valor?: string | null) =>
  valor ? dateFmt.format(new Date(valor.length === 10 ? `${valor}T00:00:00` : valor.replace(" ", "T"))) : "—";
const formatFechaHora = (valor?: string | null) =>
  valor ? formatFecha(valor) + " · " + valor.slice(11, 16) : "—";

function fechaLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function fechaHaceDias(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ─── Piezas visuales ─────────────────────────────────────────────────────────
const Icon = ({ d, className = "h-5 w-5" }: { d: string; className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

const ICONS = {
  plus: "M12 4v16m8-8H4",
  close: "M6 18L18 6M6 6l12 12",
  eye: "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  down: "M19 9l-7 7-7-7",
  left: "M15 19l-7-7 7-7",
  right: "M9 5l7 7-7 7",
  alert: "M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
  check: "M5 13l4 4L19 7",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  refresh: "M4 4v5h5M20 20v-5h-5M5.6 15A8 8 0 0012 20a8 8 0 007.4-5M18.4 9A8 8 0 0012 4a8 8 0 00-7.4 5",
  file: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
  box: "M20 7l-8-4-8 4 8 4 8-4zm-16 0v10l8 4 8-4V7M12 11v10",
};

const inputCls =
  "w-full rounded-xl border-2 bg-white px-3.5 py-2.5 text-sm font-medium outline-none transition-all " +
  "placeholder:text-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100";
const inputStyle = { borderColor: C.border, color: C.text } as const;
const btnBase =
  "inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-all " +
  "active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100";

function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold"
      style={{ backgroundColor: bg, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function EstadoBajaBadge({ estado }: { estado: EstadoBaja }) {
  const tono = ESTADOS_BAJA[estado] ?? ESTADOS_BAJA.pendiente;
  return <Badge label={tono.label} bg={tono.bg} color={tono.color} />;
}

function EstadoLoteBadge({ estado }: { estado: string }) {
  const tono = ESTADO_LOTE[estado] ?? { label: estado, bg: "#F3F4F6", color: "#6B7280" };
  return <Badge label={tono.label} bg={tono.bg} color={tono.color} />;
}

function DiasBadge({ dias }: { dias: number }) {
  if (dias < 0) return <Badge label={`Vencido hace ${Math.abs(dias)} d`} bg="#FEE2E2" color="#DC2626" />;
  if (dias === 0) return <Badge label="Vence hoy" bg="#FEE2E2" color="#DC2626" />;
  if (dias <= 7) return <Badge label={`${dias} días · crítico`} bg="#FEE2E2" color="#DC2626" />;
  if (dias <= 30) return <Badge label={`${dias} días · alerta`} bg="#FEF3C7" color="#D97706" />;
  return <Badge label={`${dias} días`} bg="#D1FAE5" color={SUCCESS} />;
}

function Field({ label, hint, className = "", children }: { label: string; hint?: string; className?: string; children: ReactNode }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-sm font-semibold" style={{ color: C.dark }}>{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: C.border }}>
      {title && <h4 className="mb-3 text-sm font-bold" style={{ color: C.dark }}>{title}</h4>}
      {children}
    </section>
  );
}

function Th({ children, align = "left" }: { children: ReactNode; align?: "left" | "right" }) {
  return (
    <th className={`whitespace-nowrap px-4 py-3.5 text-xs font-bold ${align === "right" ? "text-right" : "text-left"}`} style={{ color: C.dark, backgroundColor: C.light }}>
      {children}
    </th>
  );
}

function Modal({ title, onClose, children, footer, wide = false, zIndex = 120 }: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  zIndex?: number;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex }}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl ${wide ? "max-w-4xl" : "max-w-2xl"}`}
        style={{ borderColor: C.border }}
      >
        <div className="relative flex flex-shrink-0 items-center justify-between gap-4 overflow-hidden px-5 py-4 text-white" style={{ background: GRADIENT }}>
          <div className="pointer-events-none absolute -right-6 -top-10 h-32 w-32 rounded-full bg-white/5" />
          <h3 className="relative text-lg font-bold tracking-tight">{title}</h3>
          <button onClick={onClose} className="relative flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold transition-colors hover:bg-white/25">
            <Icon d={ICONS.close} className="h-4 w-4" /> Cerrar
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ background: SURFACE }}>{children}</div>
        {footer && (
          <div className="flex flex-shrink-0 flex-wrap justify-end gap-2 border-t bg-white px-5 py-4" style={{ borderColor: C.border }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function ResumenCard({ valor, etiqueta, tono = "normal" }: { valor: string; etiqueta: string; tono?: "normal" | "warning" | "danger" | "success" }) {
  const color = tono === "danger" ? ERROR : tono === "warning" ? "#D97706" : tono === "success" ? SUCCESS : C.dark;
  const bg = tono === "danger" ? "#FEE2E2" : tono === "warning" ? "#FEF3C7" : tono === "success" ? "#D1FAE5" : C.light;
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: C.border }}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: bg, color }}>
        <Icon d={ICONS.box} className="h-5 w-5" />
      </div>
      <p className="mt-3 text-3xl font-bold" style={{ color }}>{valor}</p>
      <p className="mt-1 text-xs font-semibold" style={{ color: MUTED }}>{etiqueta}</p>
    </div>
  );
}

function Paginacion({ pagina, total, porPagina, onCambiar }: {
  pagina: number; total: number; porPagina: number; onCambiar: (pagina: number) => void;
}) {
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  return (
    <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm" style={{ color: MUTED }}>
        Mostrando{" "}
        <strong style={{ color: C.dark }}>{total === 0 ? 0 : (pagina - 1) * porPagina + 1}–{Math.min(pagina * porPagina, total)}</strong>{" "}
        de <strong style={{ color: C.dark }}>{total}</strong> registro{total !== 1 && "s"} · Página {pagina} de {totalPaginas}
      </p>
      <div className="flex gap-2">
        <button type="button" disabled={pagina <= 1} onClick={() => onCambiar(Math.max(1, pagina - 1))}
          className={`${btnBase} border-2 bg-white px-4 py-2 hover:bg-purple-50`} style={{ borderColor: C.border, color: C.dark }}>
          <Icon d={ICONS.left} className="h-4 w-4" /> Anterior
        </button>
        <button type="button" disabled={pagina >= totalPaginas} onClick={() => onCambiar(Math.min(totalPaginas, pagina + 1))}
          className={`${btnBase} border-2 bg-white px-4 py-2 hover:bg-purple-50`} style={{ borderColor: C.border, color: C.dark }}>
          Siguiente <Icon d={ICONS.right} className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Cargando({ texto }: { texto: string }) {
  return (
    <div className="flex items-center justify-center rounded-2xl border bg-white py-20 shadow-sm" style={{ borderColor: C.border }}>
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: C.border, borderTopColor: C.medium }} />
        <p className="text-sm" style={{ color: MUTED }}>{texto}</p>
      </div>
    </div>
  );
}

function Vacio({ titulo, descripcion }: { titulo: string; descripcion: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed bg-white py-16 text-center" style={{ borderColor: C.border }}>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: C.light, color: C.medium }}>
        <Icon d={ICONS.box} className="h-6 w-6" />
      </div>
      <p className="font-bold" style={{ color: C.dark }}>{titulo}</p>
      <p className="max-w-sm text-sm" style={{ color: MUTED }}>{descripcion}</p>
    </div>
  );
}

function Fallo({ mensaje }: { mensaje: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border p-8 text-center" style={{ backgroundColor: "#FEE2E2", borderColor: `${ERROR}40` }}>
      <div style={{ color: ERROR }}><Icon d={ICONS.alert} className="h-8 w-8" /></div>
      <p className="font-bold" style={{ color: C.dark }}>No se pudieron cargar los datos</p>
      <p className="text-sm" style={{ color: ERROR }}>{mensaje}</p>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MODAL: registrar baja
// ═════════════════════════════════════════════════════════════════════════════
function CrearBajaModal({ lotes, sucursales, devoluciones, idSucursalActual, nombreSucursalActual, loteInicial, pending, onClose, onSubmit }: {
  lotes: LoteParaBajaType[];
  sucursales: { idSucursal: number; nombre: string }[];
  devoluciones: { idDevolucionProveedor: number; numeroDevolucion?: string; motivo: string; estado: string; proveedor?: string | null }[];
  idSucursalActual?: number;
  nombreSucursalActual?: string;
  loteInicial?: LoteParaBajaType | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (datos: CrearBajaType) => void;
}) {
  const [idLote, setIdLote] = useState<number | "">(loteInicial?.idLote ?? "");
  const [cantidad, setCantidad] = useState(String(loteInicial?.stock ?? ""));
  const [accion, setAccion] = useState<AccionBaja>("cuarentena");
  const [sucursal, setSucursal] = useState(String(idSucursalActual ?? ""));
  const [devolucion, setDevolucion] = useState("");
  const [motivo, setMotivo] = useState("");
  const [fechaDeteccion, setFechaDeteccion] = useState(fechaLocal());

  const lote = useMemo(() => lotes.find((l) => l.idLote === idLote), [lotes, idLote]);
  const cantidadNum = Number(cantidad);
  const vencido = (lote?.diasRestantes ?? 1) <= 0;
  const devolucionesElegibles = useMemo(
    () => devoluciones.filter((d) =>
      ["vencimiento_corto", "producto_vencido"].includes(d.motivo) && d.estado !== "rechazada"),
    [devoluciones],
  );

  const esMermaODestruccion = accion === "baja_merma" || accion === "destruccion";
  const valido =
    Boolean(lote) &&
    Number.isInteger(cantidadNum) && cantidadNum > 0 &&
    (!lote || cantidadNum <= lote.stock) &&
    (!esMermaODestruccion || vencido) &&
    (accion !== "devolucion_proveedor" || Number(devolucion) > 0);

  const costoEstimado = lote ? Number((cantidadNum * lote.precioCompra).toFixed(2)) : 0;
  const perdidaEstimada = accion === "cuarentena" ? 0 : Number.isFinite(costoEstimado) ? costoEstimado : 0;

  function enviar() {
    if (!lote || !valido) return;
    onSubmit({
      idLote: lote.idLote,
      cantidadAfectada: cantidadNum,
      accionTomada: accion,
      idSucursal: sucursal ? Number(sucursal) : null,
      idDevolucionProveedor: accion === "devolucion_proveedor" ? Number(devolucion) : null,
      fechaDeteccion,
      motivoDetalle: motivo.trim() || null,
    });
  }

  return (
    <Modal
      title="Registrar baja de lote vencido"
      onClose={onClose}
      wide
      footer={
        <>
          <button onClick={onClose} className={`${btnBase} border-2 bg-white hover:bg-purple-50`} style={{ borderColor: C.border, color: C.dark }}>
            Cancelar
          </button>
          <button onClick={enviar} disabled={!valido || pending} className={`${btnBase} text-white shadow-lg`} style={{ background: GRADIENT }}>
            {pending ? "Registrando..." : "Registrar baja"}
          </button>
        </>
      }
    >
      {(lotes.length === 0 && !loteInicial) ? (
        <Vacio titulo="No hay lotes para gestionar" descripcion="No se encontraron lotes vencidos ni próximos a vencer con stock disponible." />
      ) : (
        <>
          <Card title="1. Lote afectado">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Lote" className="md:col-span-2" hint="Se listan lotes con stock pendiente de gestión.">
                <select value={idLote} onChange={(e) => {
                  const elegido = lotes.find((l) => l.idLote === Number(e.target.value));
                  setIdLote(e.target.value ? Number(e.target.value) : "");
                  setCantidad(String(elegido?.stock ?? ""));
                }} className={inputCls} style={inputStyle} aria-label="Lote a dar de baja">
                  <option value="">Seleccione un lote...</option>
                  {lotes.map((l) => (
                    <option key={l.idLote} value={l.idLote}>
                      {l.nombreComercial} · {l.numeroLote} · {l.stock} und. · vence {formatFecha(l.fechaVencimiento)}
                    </option>
                  ))}
                </select>
              </Field>
              {lote && (
                <div className="md:col-span-2 grid grid-cols-2 gap-3 rounded-xl p-3 text-sm md:grid-cols-4" style={{ background: C.light }}>
                  <div><p style={{ color: MUTED }}>Producto</p><p className="font-bold" style={{ color: C.dark }}>{lote.nombreComercial}</p></div>
                  <div><p style={{ color: MUTED }}>Proveedor</p><p className="font-bold" style={{ color: C.dark }}>{lote.proveedor ?? "—"}</p></div>
                  <div><p style={{ color: MUTED }}>Stock del lote</p><p className="font-bold" style={{ color: C.dark }}>{lote.stock} und.</p></div>
                  <div><p style={{ color: MUTED }}>Vencimiento</p><div className="mt-1"><DiasBadge dias={lote.diasRestantes} /></div></div>
                </div>
              )}
              <Field label="Cantidad afectada" hint={lote ? `Máximo ${lote.stock} unidades del lote.` : undefined}>
                <input type="number" min={1} max={lote?.stock} value={cantidad} onChange={(e) => setCantidad(e.target.value)} className={inputCls} style={inputStyle} />
              </Field>
              <Field label="Fecha de detección">
                <input type="date" value={fechaDeteccion} onChange={(e) => setFechaDeteccion(e.target.value)} className={inputCls} style={inputStyle} />
              </Field>
            </div>
          </Card>

          <Card title="2. Acción tomada">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Acción" className="md:col-span-2">
                <select value={accion} onChange={(e) => setAccion(e.target.value as AccionBaja)} className={inputCls} style={inputStyle}>
                  <option value="cuarentena">Cuarentena (aísla, no descuenta stock)</option>
                  <option value="baja_merma" disabled={!vencido}>Baja por merma (solo lotes vencidos)</option>
                  <option value="destruccion" disabled={!vencido}>Destrucción (solo lotes vencidos)</option>
                  <option value="devolucion_proveedor">Devolución al proveedor</option>
                </select>
              </Field>
              {accion === "devolucion_proveedor" && (
                <Field label="Devolución al proveedor" className="md:col-span-2" hint="Solo se pueden vincular devoluciones por vencimiento que no estén rechazadas.">
                  <select value={devolucion} onChange={(e) => setDevolucion(e.target.value)} className={inputCls} style={inputStyle}>
                    <option value="">Seleccione una devolución...</option>
                    {devolucionesElegibles.map((d) => (
                      <option key={d.idDevolucionProveedor} value={d.idDevolucionProveedor}>
                        #{d.idDevolucionProveedor} · {d.proveedor ?? "Proveedor"} · {d.estado}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              <Field label="Sucursal" hint="Opcional. Por defecto se imputa a tu sucursal.">
                <select value={sucursal} onChange={(e) => setSucursal(e.target.value)} className={inputCls} style={inputStyle}>
                  <option value="">Sin imputación específica</option>
                  {idSucursalActual && !sucursales.some((s) => s.idSucursal === idSucursalActual) && (
                    <option value={idSucursalActual}>{nombreSucursalActual ?? `Sucursal #${idSucursalActual}`}</option>
                  )}
                  {sucursales.map((s) => <option key={s.idSucursal} value={s.idSucursal}>{s.nombre}</option>)}
                </select>
              </Field>
              <Field label="Motivo / detalle" hint="Máximo 2000 caracteres.">
                <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={2} maxLength={2000} className={inputCls} style={inputStyle} placeholder="Describe el motivo de la baja..." />
              </Field>
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3" style={{ borderColor: C.border, background: "#FFFFFF" }}>
            <p className="text-sm" style={{ color: MUTED }}>
              {accion === "cuarentena"
                ? "La cuarentena no descuenta stock: solo deja el lote no vendible y la pérdida es 0."
                : accion === "devolucion_proveedor"
                  ? "La pérdida se recalculará al registrar la nota de crédito (solo Admin)."
                  : "La ejecución descontará el stock y calculará la pérdida sobre el precio de compra."}
            </p>
            <div className="text-right">
              <p className="text-xs" style={{ color: MUTED }}>Pérdida estimada</p>
              <p className="text-xl font-bold" style={{ color: perdidaEstimada > 0 ? ERROR : SUCCESS }}>{formatBOB(perdidaEstimada)}</p>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MODAL: detalle y transiciones
// ═════════════════════════════════════════════════════════════════════════════
function autorizadorInicial(baja: BajaType, idActual?: number): number {
  if (baja.idUsuarioAutoriza && baja.idUsuarioAutoriza !== baja.idUsuario) return baja.idUsuarioAutoriza;
  if (idActual && idActual !== baja.idUsuario) return idActual;
  return 0;
}

function DetalleBajaModal({ baja, autorizadores, idUsuarioActual, puedeGestionar, esAdmin, acciones, onClose }: {
  baja: BajaType;
  autorizadores: { idUsuario: number; nombre: string; nameRol: string }[];
  idUsuarioActual?: number;
  puedeGestionar: boolean;
  esAdmin: boolean;
  acciones: {
    onAprobar: (idUsuarioAutoriza: number) => void;
    onEjecutar: (idUsuarioAutoriza: number) => void;
    onAnular: (motivo: string) => void;
    onAjustar: () => void;
    pending: boolean;
  };
  onClose: () => void;
}) {
  const [autoriza, setAutoriza] = useState(() => autorizadorInicial(baja, idUsuarioActual));
  const [anulando, setAnulando] = useState(false);
  const [motivoAnulacion, setMotivoAnulacion] = useState("");

  const opciones = autorizadores.filter((u) => u.idUsuario !== baja.idUsuario);
  const autorizaValido = autoriza > 0 && autoriza !== baja.idUsuario;
  const puedeAjustar = esAdmin && baja.estado === "ejecutada" && baja.accionTomada === "devolucion_proveedor";

  const selectorAutorizador = (
    <Field label="Usuario autorizador" hint="Debe ser distinto de quien registró la baja y tener rol Admin o EncargadoInventario.">
      <select value={autoriza} onChange={(e) => setAutoriza(Number(e.target.value))} className={inputCls} style={inputStyle} disabled={acciones.pending}>
        <option value={0}>Seleccione un autorizador...</option>
        {opciones.map((u) => (
          <option key={u.idUsuario} value={u.idUsuario}>{u.nombre} · {u.nameRol}</option>
        ))}
      </select>
    </Field>
  );

  return (
    <>
      <Modal
        title={`Baja #${baja.idBajaVencimiento} · ${baja.nombreComercial}`}
        onClose={onClose}
        wide
        footer={
          <>
            <button onClick={onClose} className={`${btnBase} border-2 bg-white hover:bg-purple-50`} style={{ borderColor: C.border, color: C.dark }}>
              Cerrar
            </button>
            {puedeGestionar && baja.estado === "pendiente" && (
              <button disabled={!autorizaValido || acciones.pending} onClick={() => acciones.onAprobar(autoriza)}
                className={`${btnBase} text-white shadow-lg`} style={{ background: "#2563EB" }}>
                {acciones.pending ? "Procesando..." : "Aprobar baja"}
              </button>
            )}
            {puedeGestionar && baja.estado === "aprobada" && (
              <button disabled={!autorizaValido || acciones.pending} onClick={() => acciones.onEjecutar(autoriza)}
                className={`${btnBase} text-white shadow-lg`} style={{ background: ERROR }}>
                {acciones.pending ? "Procesando..." : "Ejecutar y descontar stock"}
              </button>
            )}
            {puedeGestionar && ["pendiente", "aprobada"].includes(baja.estado) && (
              <button disabled={acciones.pending} onClick={() => setAnulando(true)}
                className={`${btnBase} border-2 bg-white hover:bg-red-50`} style={{ borderColor: `${ERROR}60`, color: ERROR }}>
                Anular
              </button>
            )}
            {puedeAjustar && (
              <button disabled={acciones.pending} onClick={acciones.onAjustar}
                className={`${btnBase} text-white shadow-lg`} style={{ background: SUCCESS }}>
                {acciones.pending ? "Procesando..." : "Recalcular con nota de crédito"}
              </button>
            )}
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <EstadoBajaBadge estado={baja.estado} />
          <Badge label={ACCIONES_LABEL[baja.accionTomada]} bg={C.light} color={C.medium} />
          <span className="text-sm" style={{ color: MUTED }}>Registrada el {formatFechaHora(baja.fechaCreacion)}</span>
        </div>

        {(baja.estado === "pendiente" || baja.estado === "aprobada") && puedeGestionar && selectorAutorizador}

        {baja.estado === "aprobada" && (
          <div className="flex items-start gap-2 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "#FCD34D", background: "#FFFBEB", color: "#92400E" }}>
            <Icon d={ICONS.alert} className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>La ejecución es definitiva: descuenta {baja.cantidadAfectada} unidades del lote y cambia su estado. El autorizador debe ser el mismo que aprobó la baja.</span>
          </div>
        )}

        <Card title="Lote afectado">
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div><p style={{ color: MUTED }}>Producto</p><p className="font-bold" style={{ color: C.dark }}>{baja.nombreComercial}</p></div>
            <div><p style={{ color: MUTED }}>Código / Lote</p><p className="font-bold" style={{ color: C.dark }}>{baja.codigoLote} · {baja.numeroLote}</p></div>
            <div><p style={{ color: MUTED }}>Proveedor</p><p className="font-bold" style={{ color: C.dark }}>{baja.proveedor ?? "—"}</p></div>
            <div><p style={{ color: MUTED }}>Vencimiento</p><div className="mt-1"><DiasBadge dias={baja.diasRestantes} /></div></div>
            <div><p style={{ color: MUTED }}>Laboratorio</p><p className="font-bold" style={{ color: C.dark }}>{baja.laboratorio ?? "—"}</p></div>
            <div><p style={{ color: MUTED }}>Presentación</p><p className="font-bold" style={{ color: C.dark }}>{baja.presentacion ?? "—"}</p></div>
            <div><p style={{ color: MUTED }}>Stock actual del lote</p><p className="font-bold" style={{ color: C.dark }}>{baja.stockActual} und.</p></div>
            <div><p style={{ color: MUTED }}>Estado del lote</p><div className="mt-1"><EstadoLoteBadge estado={baja.estadoLote} /></div></div>
          </div>
        </Card>

        <Card title="Operación y pérdida">
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div><p style={{ color: MUTED }}>Cantidad afectada</p><p className="text-lg font-bold" style={{ color: C.dark }}>{baja.cantidadAfectada} und.</p></div>
            <div><p style={{ color: MUTED }}>Costo unitario</p><p className="text-lg font-bold" style={{ color: C.dark }}>{formatBOB(baja.costoUnitario)}</p></div>
            <div><p style={{ color: MUTED }}>Monto de pérdida</p><p className="text-lg font-bold" style={{ color: baja.montoPerdida > 0 ? ERROR : SUCCESS }}>{formatBOB(baja.montoPerdida)}</p></div>
            <div><p style={{ color: MUTED }}>Sucursal</p><p className="font-bold" style={{ color: C.dark }}>{baja.sucursal ?? "Sin imputación"}</p></div>
            <div><p style={{ color: MUTED }}>Detectada</p><p className="font-bold" style={{ color: C.dark }}>{formatFechaHora(baja.fechaDeteccion)}</p></div>
            <div><p style={{ color: MUTED }}>Ejecutada</p><p className="font-bold" style={{ color: C.dark }}>{formatFechaHora(baja.fechaEjecucion)}</p></div>
            <div><p style={{ color: MUTED }}>Registró</p><p className="font-bold" style={{ color: C.dark }}>{baja.usuario ?? "—"}</p></div>
            <div><p style={{ color: MUTED }}>Autorizó</p><p className="font-bold" style={{ color: C.dark }}>{baja.usuarioAutoriza ?? "—"}</p></div>
          </div>
        </Card>

        {baja.idDevolucionProveedor && (
          <Card title="Devolución al proveedor vinculada">
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div><p style={{ color: MUTED }}>Devolución</p><p className="font-bold" style={{ color: C.dark }}>#{baja.idDevolucionProveedor}</p></div>
              <div><p style={{ color: MUTED }}>Nota de crédito</p><p className="font-bold" style={{ color: C.dark }}>{baja.numeroNotaCredito ?? "Pendiente"}</p></div>
              <div><p style={{ color: MUTED }}>Monto NC</p><p className="font-bold" style={{ color: C.dark }}>{formatBOB(baja.montoNotaCredito)}</p></div>
              <div><p style={{ color: MUTED }}>Estado / motivo</p><p className="font-bold" style={{ color: C.dark }}>{baja.estadoDevolucion ?? "—"} / {baja.motivoDevolucion ?? "—"}</p></div>
            </div>
          </Card>
        )}

        {baja.motivoDetalle && (
          <Card title="Motivo registrado">
            <p className="whitespace-pre-line text-sm" style={{ color: C.text }}>{baja.motivoDetalle}</p>
          </Card>
        )}
      </Modal>

      {anulando && (
        <Modal
          title={`Anular baja #${baja.idBajaVencimiento}`}
          onClose={() => setAnulando(false)}
          zIndex={130}
          footer={
            <>
              <button onClick={() => setAnulando(false)} className={`${btnBase} border-2 bg-white hover:bg-purple-50`} style={{ borderColor: C.border, color: C.dark }}>
                Volver
              </button>
              <button disabled={acciones.pending} onClick={() => { acciones.onAnular(motivoAnulacion.trim()); setAnulando(false); }}
                className={`${btnBase} text-white shadow-lg`} style={{ background: ERROR }}>
                {acciones.pending ? "Anulando..." : "Confirmar anulación"}
              </button>
            </>
          }
        >
          <div className="flex items-start gap-2 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: `${ERROR}50`, background: "#FEF2F2", color: "#991B1B" }}>
            <Icon d={ICONS.alert} className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>La baja pasará a estado <strong>anulada</strong>. No se modificará el stock. Las bajas ejecutadas no se pueden anular.</span>
          </div>
          <Field label="Motivo de la anulación" hint="Opcional, máximo 500 caracteres.">
            <textarea value={motivoAnulacion} onChange={(e) => setMotivoAnulacion(e.target.value)} rows={3} maxLength={500} className={inputCls} style={inputStyle} placeholder="Indica por qué se anula..." />
          </Field>
        </Modal>
      )}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TABLAS
// ═════════════════════════════════════════════════════════════════════════════
function TablaBajas({ bajas, onVer }: { bajas: BajaListItemType[]; onVer: (baja: BajaListItemType) => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm" style={{ borderColor: C.border }}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead><tr>
            <Th>Baja</Th><Th>Producto / Lote</Th><Th>Acción</Th><Th align="right">Cant.</Th>
            <Th align="right">Costo unit.</Th><Th align="right">Pérdida</Th><Th>Estado</Th><Th>Detección</Th><Th align="right">Detalle</Th>
          </tr></thead>
          <tbody>
            {bajas.map((b, i) => (
              <tr key={b.idBajaVencimiento} className="transition-colors hover:bg-purple-50/50"
                style={{ color: C.text, borderTop: i === 0 ? "none" : `1px solid ${C.light}` }}>
                <td className="px-4 py-3 font-bold" style={{ color: C.dark }}>#{b.idBajaVencimiento}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold" style={{ color: C.dark }}>{b.nombreComercial}</p>
                  <p className="text-xs" style={{ color: MUTED }}>{b.codigoLote} · {b.numeroLote}</p>
                </td>
                <td className="px-4 py-3"><Badge label={ACCIONES_LABEL[b.accionTomada]} bg={C.light} color={C.medium} /></td>
                <td className="px-4 py-3 text-right">{b.cantidadAfectada}</td>
                <td className="px-4 py-3 text-right">{formatBOB(b.costoUnitario)}</td>
                <td className="px-4 py-3 text-right font-bold" style={{ color: b.montoPerdida > 0 ? ERROR : SUCCESS }}>{formatBOB(b.montoPerdida)}</td>
                <td className="px-4 py-3"><EstadoBajaBadge estado={b.estado} /></td>
                <td className="px-4 py-3">{formatFecha(b.fechaDeteccion)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => onVer(b)} className={`${btnBase} border-2 px-3 py-1.5 text-xs`} style={{ borderColor: C.border, color: C.dark }}>
                    <Icon d={ICONS.eye} className="h-3.5 w-3.5" /> Ver / Gestionar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TablaLotes({ lotes, modo, onRegistrar, puedeGestionar }: {
  lotes: LoteParaBajaType[];
  modo: "vencidos" | "proximos";
  onRegistrar: (lote: LoteParaBajaType) => void;
  puedeGestionar: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm" style={{ borderColor: C.border }}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead><tr>
            <Th>Producto</Th><Th>Código / Lote</Th><Th>Proveedor</Th><Th align="right">Stock</Th>
            <Th>Vencimiento</Th><Th>Alerta</Th><Th>Estado</Th>
            {puedeGestionar && <Th align="right">Acción</Th>}
          </tr></thead>
          <tbody>
            {lotes.map((l, i) => (
              <tr key={l.idLote} className="transition-colors hover:bg-purple-50/50"
                style={{ color: C.text, borderTop: i === 0 ? "none" : `1px solid ${C.light}` }}>
                <td className="px-4 py-3">
                  <p className="font-semibold" style={{ color: C.dark }}>{l.nombreComercial}</p>
                  <p className="text-xs" style={{ color: MUTED }}>{l.laboratorio ?? "—"} · {l.presentacion ?? "—"}</p>
                </td>
                <td className="px-4 py-3"><p className="font-semibold" style={{ color: C.dark }}>{l.codigo}</p><p className="text-xs" style={{ color: MUTED }}>{l.numeroLote}</p></td>
                <td className="px-4 py-3">{l.proveedor ?? "—"}</td>
                <td className="px-4 py-3 text-right font-semibold">{l.stock}</td>
                <td className="px-4 py-3">{formatFecha(l.fechaVencimiento)}</td>
                <td className="px-4 py-3"><DiasBadge dias={l.diasRestantes} /></td>
                <td className="px-4 py-3"><EstadoLoteBadge estado={l.estadoLote} /></td>
                {puedeGestionar && (
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => onRegistrar(l)} disabled={Boolean(l.idBajaVencimiento && l.estadoGestion)}
                      className={`${btnBase} border-2 px-3 py-1.5 text-xs`} style={{ borderColor: C.border, color: C.dark }}>
                      <Icon d={ICONS.plus} className="h-3.5 w-3.5" /> {modo === "vencidos" ? "Nueva baja" : "Dar de baja"}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VistaReporte({ datos, filtros, onFiltros, isLoading, error }: {
  datos?: ReportePerdidasDatosType;
  filtros: IReportePerdidasFiltros;
  onFiltros: (filtros: IReportePerdidasFiltros) => void;
  isLoading: boolean;
  error?: Error | null;
}) {
  if (isLoading) return <Cargando texto="Generando reporte de pérdidas..." />;
  if (error) return <Fallo mensaje={error.message} />;
  if (!datos) return <Vacio titulo="Sin datos" descripcion="Ajusta el rango de fechas para consultar el reporte." />;

  const { resumen, filas } = datos;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: C.border }}>
        <Field label="Desde" className="w-40"><input type="date" value={filtros.fechaDesde} onChange={(e) => onFiltros({ ...filtros, fechaDesde: e.target.value })} className={inputCls} style={inputStyle} /></Field>
        <Field label="Hasta" className="w-40"><input type="date" value={filtros.fechaHasta} onChange={(e) => onFiltros({ ...filtros, fechaHasta: e.target.value })} className={inputCls} style={inputStyle} /></Field>
        <button onClick={() => onFiltros({ ...filtros, fechaDesde: fechaHaceDias(30), fechaHasta: fechaLocal(), accionTomada: "" })}
          className={`${btnBase} border-2 bg-white hover:bg-purple-50`} style={{ borderColor: C.border, color: C.dark }}>
          <Icon d={ICONS.refresh} className="h-4 w-4" /> Últimos 30 días
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ResumenCard valor={String(resumen.totalBajas)} etiqueta="Bajas ejecutadas" />
        <ResumenCard valor={String(resumen.totalUnidades)} etiqueta="Unidades dadas de baja" tono="warning" />
        <ResumenCard valor={formatBOB(resumen.montoPerdidaTotal)} etiqueta="Pérdida total" tono="danger" />
      </div>

      <Card title="Detalle de bajas ejecutadas">
        {filas.length === 0 ? (
          <p className="py-6 text-center text-sm" style={{ color: MUTED }}>No hay bajas ejecutadas en el rango seleccionado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead><tr>
                <Th>Baja</Th><Th>Ejecución</Th><Th>Producto / Lote</Th><Th>Acción</Th><Th align="right">Unidades</Th>
                <Th align="right">Costo unit.</Th><Th align="right">Pérdida</Th><Th>NC</Th>
              </tr></thead>
              <tbody>
                {filas.map((f, i) => (
                  <tr key={f.idBajaVencimiento} className="transition-colors hover:bg-purple-50/50"
                    style={{ color: C.text, borderTop: i === 0 ? "none" : `1px solid ${C.light}` }}>
                    <td className="px-4 py-3 font-bold" style={{ color: C.dark }}>#{f.idBajaVencimiento}</td>
                    <td className="px-4 py-3">{formatFecha(f.fechaEjecucion)}</td>
                    <td className="px-4 py-3"><p className="font-semibold" style={{ color: C.dark }}>{f.nombreComercial}</p><p className="text-xs" style={{ color: MUTED }}>{f.codigoLote} · {f.numeroLote} · {f.sucursal ?? "—"}</p></td>
                    <td className="px-4 py-3"><Badge label={ACCIONES_LABEL[f.accionTomada]} bg={C.light} color={C.medium} /></td>
                    <td className="px-4 py-3 text-right">{f.cantidadAfectada}</td>
                    <td className="px-4 py-3 text-right">{formatBOB(f.costoUnitario)}</td>
                    <td className="px-4 py-3 text-right font-bold" style={{ color: f.montoPerdida > 0 ? ERROR : SUCCESS }}>{formatBOB(f.montoPerdida)}</td>
                    <td className="px-4 py-3">{f.numeroNotaCredito ?? <span style={{ color: MUTED }}>—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Pérdida por acción">
          <div className="space-y-2">
            {resumen.porAccion.map((a) => (
              <div key={a.accion} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm" style={{ background: SURFACE }}>
                <span style={{ color: C.dark }}>{ACCIONES_LABEL[a.accion]}</span>
                <span style={{ color: MUTED }}>{a.bajas} bajas · {a.unidades} und. · <strong style={{ color: a.perdida > 0 ? ERROR : SUCCESS }}>{formatBOB(a.perdida)}</strong></span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Pérdida por sucursal">
          {resumen.porSucursal.length === 0 ? (
            <p className="py-4 text-center text-sm" style={{ color: MUTED }}>Sin datos en el rango seleccionado.</p>
          ) : (
            <div className="space-y-2">
              {resumen.porSucursal.map((s) => (
                <div key={s.sucursal} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm" style={{ background: SURFACE }}>
                  <span style={{ color: C.dark }}>{s.sucursal}</span>
                  <span style={{ color: MUTED }}>{s.bajas} bajas · {s.unidades} und. · <strong style={{ color: s.perdida > 0 ? ERROR : SUCCESS }}>{formatBOB(s.perdida)}</strong></span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// VISTA PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════
/** Total global por estado (independiente de la pagina actual). */
function useConteoBajas(estado: EstadoBaja) {
  return useQuery({
    queryKey: ["bajas-conteo", estado],
    queryFn: () => GetBajasApi({ estado, porPagina: 1, pagina: 1 }),
    select: (respuesta) => respuesta.total,
    staleTime: 30_000,
  });
}

type TabId = "bajas" | "vencidos" | "proximos" | "reporte";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "bajas", label: "Bajas registradas", icon: ICONS.file },
  { id: "vencidos", label: "Lotes vencidos", icon: ICONS.alert },
  { id: "proximos", label: "Próximos a vencer", icon: ICONS.shield },
  { id: "reporte", label: "Reporte de pérdidas", icon: ICONS.refresh },
];

export default function BajasLotesVencidos() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const puedeGestionar = user?.nameRol === "Admin" || user?.nameRol === "EncargadoInventario";
  const esAdmin = user?.nameRol === "Admin";

  const [tab, setTab] = useState<TabId>("bajas");
  const [filtros, setFiltros] = useState<IBajaFiltros>({ pagina: 1, porPagina: 10, estado: "", accionTomada: "" });
  const [dias, setDias] = useState<30 | 60 | 90>(30);
  const [filtrosReporte, setFiltrosReporte] = useState<IReportePerdidasFiltros>({
    fechaDesde: fechaHaceDias(30), fechaHasta: fechaLocal(), accionTomada: "",
  });
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [loteInicial, setLoteInicial] = useState<LoteParaBajaType | null>(null);
  const [detalleId, setDetalleId] = useState<number | null>(null);

  function refrescar() {
    qc.invalidateQueries({ queryKey: ["bajas"] });
    qc.invalidateQueries({ queryKey: ["baja-detalle"] });
    qc.invalidateQueries({ queryKey: ["bajas-vencidos"] });
    qc.invalidateQueries({ queryKey: ["bajas-proximos"] });
    qc.invalidateQueries({ queryKey: ["bajas-reporte"] });
  }

  // ── Consultas ──────────────────────────────────────────────────────────────
  const bajasQ = useQuery({
    queryKey: ["bajas", filtros],
    queryFn: () => GetBajasApi(filtros),
    placeholderData: (prev) => prev,
  });

  const pendientesQ = useConteoBajas("pendiente");
  const aprobadasQ = useConteoBajas("aprobada");
  const ejecutadasQ = useConteoBajas("ejecutada");

  const vencidosQ = useQuery({
    queryKey: ["bajas-vencidos"],
    queryFn: () => GetLotesVencidosApi({ limite: 200 }),
    enabled: tab === "vencidos" || crearAbierto,
    placeholderData: (prev) => prev,
  });
  const proximosQ = useQuery({
    queryKey: ["bajas-proximos", dias],
    queryFn: () => GetProximosAVencerApi(dias, { limite: 200 }),
    enabled: tab === "proximos",
    placeholderData: (prev) => prev,
  });
  const reporteQ = useQuery({
    queryKey: ["bajas-reporte", filtrosReporte],
    queryFn: () => GetReportePerdidasApi(filtrosReporte),
    enabled: tab === "reporte",
    placeholderData: (prev) => prev,
  });
  const detalleQ = useQuery({
    queryKey: ["baja-detalle", detalleId],
    queryFn: () => GetBajaByIdApi(detalleId as number),
    enabled: detalleId !== null,
  });

  const usuariosQ = useQuery({
    queryKey: ["usuarios-autorizadores"],
    queryFn: GetUserAllApi,
    enabled: puedeGestionar && (crearAbierto || detalleId !== null),
  });
  const sucursalesQ = useQuery({
    queryKey: ["sucursales-bajas"],
    queryFn: GetSucursalApi,
    enabled: crearAbierto,
  });
  const devolucionesQ = useQuery({
    queryKey: ["devoluciones-para-baja"],
    queryFn: () => GetDevolucionesProveedorApi({ porPagina: 200 }),
    enabled: crearAbierto && puedeGestionar,
  });

  // ── Mutaciones ─────────────────────────────────────────────────────────────
  const crearMut = useMutation({
    mutationFn: AddBajaApi,
    onSuccess: () => { toast.success("Baja registrada en estado pendiente."); refrescar(); setCrearAbierto(false); },
    onError: (e) => toast.error(e.message),
  });
  const aprobarMut = useMutation({
    mutationFn: ({ id, autoriza }: { id: number; autoriza: number }) => AprobarBajaApi(id, autoriza),
    onSuccess: () => { toast.success("Baja aprobada correctamente."); refrescar(); },
    onError: (e) => toast.error(e.message),
  });
  const ejecutarMut = useMutation({
    mutationFn: ({ id, autoriza }: { id: number; autoriza: number }) => EjecutarBajaApi(id, autoriza),
    onSuccess: () => { toast.success("Baja ejecutada. Stock y pérdida actualizados."); refrescar(); },
    onError: (e) => toast.error(e.message),
  });
  const anularMut = useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) => AnularBajaApi(id, motivo || undefined),
    onSuccess: () => { toast.success("Baja anulada."); refrescar(); setDetalleId(null); },
    onError: (e) => toast.error(e.message),
  });
  const ajustarMut = useMutation({
    mutationFn: AjustarPerdidaApi,
    onSuccess: () => { toast.success("Pérdida recalculada con la nota de crédito."); refrescar(); },
    onError: (e) => toast.error(e.message),
  });

  const autorizadores = useMemo(
    () => (usuariosQ.data ?? []).filter((u) => ["Admin", "EncargadoInventario"].includes(u.nameRol)),
    [usuariosQ.data],
  );
  const lotesParaModal = useMemo(() => {
    const porId = new Map<number, LoteParaBajaType>();
    (vencidosQ.data?.lotes ?? []).forEach((l) => porId.set(l.idLote, l));
    (proximosQ.data?.lotes ?? []).forEach((l) => porId.set(l.idLote, l));
    return Array.from(porId.values());
  }, [vencidosQ.data, proximosQ.data]);
  const sucursales = sucursalesQ.data ?? [];
  const devoluciones = useMemo(
    () => (devolucionesQ.data?.data ?? []).map((d) => ({
      idDevolucionProveedor: d.idDevolucionProveedor,
      motivo: d.motivo,
      estado: d.estado,
      proveedor: d.proveedor,
    })),
    [devolucionesQ.data],
  );

  function abrirCrear(lote?: LoteParaBajaType) {
    setLoteInicial(lote ?? null);
    setCrearAbierto(true);
  }

  const bajas = bajasQ.data?.data ?? [];
  const total = bajasQ.data?.total ?? 0;
  const porPagina = filtros.porPagina ?? 10;
  const pagina = filtros.pagina ?? 1;

  return (
    <div className="space-y-6">
      <header className="relative mb-6 overflow-hidden rounded-2xl px-6 py-5 text-white shadow-md" style={{ background: GRADIENT }}>
        <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-white/5" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20"><Icon d={ICONS.shield} className="h-6 w-6" /></div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Bajas de lotes vencidos</h1>
              <p className="mt-1 text-xs text-purple-200">Registra, autoriza y ejecuta la baja de lotes vencidos con trazabilidad y cálculo de pérdidas.</p>
            </div>
          </div>
          {puedeGestionar && (
            <button onClick={() => abrirCrear()} className={`${btnBase} bg-white text-sm`} style={{ color: C.dark }}>
              <Icon d={ICONS.plus} className="h-4 w-4" /> Nueva baja
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Secciones de bajas de lotes">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={`${btnBase} border-2 px-4 py-2 text-xs`}
            style={tab === t.id
              ? { background: GRADIENT, borderColor: C.medium, color: "#FFFFFF" }
              : { background: "#FFFFFF", borderColor: C.border, color: C.dark }}>
            <Icon d={t.icon} className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "bajas" && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ResumenCard valor={String(pendientesQ.data ?? 0)} etiqueta="Pendientes de aprobación" tono="warning" />
            <ResumenCard valor={String(aprobadasQ.data ?? 0)} etiqueta="Aprobadas · listas para ejecutar" />
            <ResumenCard valor={String(ejecutadasQ.data ?? 0)} etiqueta="Ejecutadas" tono="success" />
            <ResumenCard valor={String(total)} etiqueta="Registros en la consulta actual" />
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm lg:flex-row lg:flex-wrap lg:items-center" style={{ borderColor: C.border }}>
            <input type="date" aria-label="Filtrar desde" value={filtros.fechaDesde ?? ""}
              onChange={(e) => setFiltros((f) => ({ ...f, fechaDesde: e.target.value, pagina: 1 }))}
              className={`${inputCls} min-w-[220px] flex-1`} style={inputStyle} />
            <input type="date" aria-label="Filtrar hasta" value={filtros.fechaHasta ?? ""}
              onChange={(e) => setFiltros((f) => ({ ...f, fechaHasta: e.target.value, pagina: 1 }))}
              className={`${inputCls} lg:w-44`} style={inputStyle} />
            <select aria-label="Filtrar por estado" value={filtros.estado ?? ""}
              onChange={(e) => setFiltros((f) => ({ ...f, estado: e.target.value as EstadoBaja | "", pagina: 1 }))}
              className={`${inputCls} cursor-pointer lg:w-44`} style={inputStyle}>
              <option value="">Todos los estados</option>
              {Object.entries(ESTADOS_BAJA).map(([valor, tono]) => <option key={valor} value={valor}>{tono.label}</option>)}
            </select>
            <select aria-label="Filtrar por acción" value={filtros.accionTomada ?? ""}
              onChange={(e) => setFiltros((f) => ({ ...f, accionTomada: e.target.value as AccionBaja | "", pagina: 1 }))}
              className={`${inputCls} cursor-pointer lg:w-56`} style={inputStyle}>
              <option value="">Todas las acciones</option>
              {Object.entries(ACCIONES_LABEL).map(([valor, label]) => <option key={valor} value={valor}>{label}</option>)}
            </select>
            <button onClick={() => setFiltros({ pagina: 1, porPagina: 10, estado: "", accionTomada: "", fechaDesde: "", fechaHasta: "" })}
              className={`${btnBase} border-2 bg-white hover:bg-purple-50`} style={{ borderColor: C.border, color: C.dark }}>
              <Icon d={ICONS.refresh} className="h-4 w-4" /> Limpiar
            </button>
          </div>

          {bajasQ.isLoading ? <Cargando texto="Cargando bajas registradas..." /> :
            bajasQ.isError ? <Fallo mensaje={bajasQ.error instanceof Error ? bajasQ.error.message : "Intenta nuevamente."} /> :
            bajas.length === 0 ? <Vacio titulo="No hay bajas registradas" descripcion="Ajusta los filtros o registra una nueva baja desde un lote vencido." /> : (
              <>
                <TablaBajas bajas={bajas} onVer={(b) => setDetalleId(b.idBajaVencimiento)} />
                <Paginacion pagina={pagina} total={total} porPagina={porPagina} onCambiar={(p) => setFiltros((f) => ({ ...f, pagina: p }))} />
              </>
            )}
        </>
      )}

      {tab === "vencidos" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 shadow-sm" style={{ borderColor: "#FCA5A5", background: "#FEF2F2" }}>
            <div className="flex items-start gap-3">
              <div style={{ color: ERROR }}><Icon d={ICONS.alert} className="h-6 w-6" /></div>
              <div>
                <p className="font-bold" style={{ color: "#991B1B" }}>Lotes con fecha de vencimiento vencida y stock pendiente de gestión</p>
                <p className="text-xs" style={{ color: "#B91C1C" }}>{vencidosQ.data?.criterio ?? "fechaVencimiento <= CURDATE() y stock > 0 sin baja pendiente/aprobada"}</p>
              </div>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-bold" style={{ color: ERROR }}>{vencidosQ.data?.total ?? 0} lote(s)</span>
          </div>
          {vencidosQ.isLoading ? <Cargando texto="Detectando lotes vencidos..." /> :
            vencidosQ.isError ? <Fallo mensaje={vencidosQ.error instanceof Error ? vencidosQ.error.message : "Intenta nuevamente."} /> :
            (vencidosQ.data?.lotes.length ?? 0) === 0 ? <Vacio titulo="Sin lotes vencidos pendientes" descripcion="No hay lotes vencidos con stock sin gestionar." /> : (
              <TablaLotes lotes={vencidosQ.data?.lotes ?? []} modo="vencidos" onRegistrar={abrirCrear} puedeGestionar={puedeGestionar} />
            )}
        </>
      )}

      {tab === "proximos" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: C.light, color: C.medium }}>
                <Icon d={ICONS.shield} className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold" style={{ color: C.dark }}>Alertas de vencimiento próximo</p>
                <p className="text-xs" style={{ color: MUTED }}>Lotes activos con stock que vencen dentro del horizonte seleccionado.</p>
              </div>
            </div>
            <div className="flex gap-2">
              {([30, 60, 90] as const).map((valor) => (
                <button key={valor} onClick={() => setDias(valor)}
                  className={`${btnBase} border-2 px-3 py-1.5 text-xs`}
                  style={dias === valor ? { background: GRADIENT, borderColor: C.medium, color: "#FFFFFF" } : { background: "#FFFFFF", borderColor: C.border, color: C.dark }}>
                  {valor} días
                </button>
              ))}
            </div>
          </div>
          {proximosQ.isLoading ? <Cargando texto="Buscando lotes próximos a vencer..." /> :
            proximosQ.isError ? <Fallo mensaje={proximosQ.error instanceof Error ? proximosQ.error.message : "Intenta nuevamente."} /> :
            (proximosQ.data?.lotes.length ?? 0) === 0 ? <Vacio titulo="Sin alertas en este horizonte" descripcion={`No hay lotes activos que venzan en los próximos ${dias} días.`} /> : (
              <TablaLotes lotes={proximosQ.data?.lotes ?? []} modo="proximos" onRegistrar={abrirCrear} puedeGestionar={puedeGestionar} />
            )}
        </>
      )}

      {tab === "reporte" && (
        <VistaReporte datos={reporteQ.data} filtros={filtrosReporte} onFiltros={setFiltrosReporte}
          isLoading={Boolean(reporteQ.isLoading)} error={reporteQ.error instanceof Error ? reporteQ.error : null} />
      )}

      {crearAbierto && (
        <CrearBajaModal
          lotes={lotesParaModal.length > 0 ? lotesParaModal : (loteInicial ? [loteInicial] : [])}
          sucursales={sucursales}
          devoluciones={devoluciones}
          idSucursalActual={user?.idSucursal}
          nombreSucursalActual={user?.nombreSucursal}
          loteInicial={loteInicial}
          pending={crearMut.isPending}
          onClose={() => setCrearAbierto(false)}
          onSubmit={(datos) => crearMut.mutate(datos)}
        />
      )}

      {detalleId !== null && detalleQ.data && (
        <DetalleBajaModal
          key={detalleQ.data.idBajaVencimiento}
          baja={detalleQ.data}
          autorizadores={autorizadores.map((u) => ({ idUsuario: u.idUsuario, nombre: `${u.nombre} ${u.apellido}`, nameRol: u.nameRol }))}
          idUsuarioActual={user?.idUsuario}
          puedeGestionar={puedeGestionar}
          esAdmin={esAdmin}
          acciones={{
            onAprobar: (autoriza) => aprobarMut.mutate({ id: detalleQ.data.idBajaVencimiento, autoriza }),
            onEjecutar: (autoriza) => ejecutarMut.mutate({ id: detalleQ.data.idBajaVencimiento, autoriza }),
            onAnular: (motivo) => anularMut.mutate({ id: detalleQ.data.idBajaVencimiento, motivo }),
            onAjustar: () => ajustarMut.mutate(detalleQ.data.idBajaVencimiento),
            pending: aprobarMut.isPending || ejecutarMut.isPending || anularMut.isPending || ajustarMut.isPending,
          }}
          onClose={() => setDetalleId(null)}
        />
      )}
      {detalleId !== null && detalleQ.isLoading && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40"><Loading /></div>}
      {detalleId !== null && detalleQ.isError && (
        <Modal title="No se pudo abrir la baja" onClose={() => setDetalleId(null)}
          footer={<button onClick={() => setDetalleId(null)} className={`${btnBase} text-white`} style={{ background: GRADIENT }}>Cerrar</button>}>
          <Fallo mensaje={detalleQ.error instanceof Error ? detalleQ.error.message : "Intenta nuevamente."} />
        </Modal>
      )}
    </div>
  );
}
