import { useMemo, useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Loading from "../../../../Helpers/Loading";
import {
  GetDevolucionesVentaApi,
  GetDevolucionesProveedorApi,
  GetDevolucionVentaByIdApi,
  GetDevolucionProveedorByIdApi,
  AddDevolucionVentaApi,
  AddDevolucionProveedorApi,
  ResolverDevolucionVentaApi,
  ResolverDevolucionProveedorApi,
} from "../../../../Api/DevolucionApi";
import { GetVentasApi, GetVentaByIdApi } from "../../../../Api/VentaApi";
import { GetComprasApi, GetCompraByIdApi } from "../../../../Api/CompraLoteApi";
import type {
  DevVentaListItemType,
  DevProveedorListItemType,
  DevVentaType,
  DevProveedorType,
  EstadoDevVenta,
  EstadoDevProveedor,
  MotivoDevVenta,
  MotivoDevProveedor,
  DestinoDevVenta,
  VentaType,
  CompraType,
  CreateDevVentaType,
  CreateDevProveedorType,
  ResolverDevVentaType,
  ResolverDevProveedorType,
} from "../../../../types";

// ─── Paleta del proyecto ──────────────────────────────────────────────────────
const COLORS = {
  dark: "#4A1A6E",
  medium: "#7B3FA0",
  light: "#F3EBF9",
  border: "#D8B4F0",
  bgCard: "#FFFFFF",
  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
} as const;

// ─── Etiquetas ────────────────────────────────────────────────────────────────
const MOTIVO_VENTA: Record<MotivoDevVenta, string> = {
  error_dispensacion: "Error de dispensación",
  reaccion_adversa: "Reacción adversa",
  producto_danado: "Producto dañado",
  producto_vencido: "Producto vencido",
  receta_invalida: "Receta inválida",
  arrepentimiento: "Arrepentimiento",
  otro: "Otro",
};

const MOTIVO_PROVEEDOR: Record<MotivoDevProveedor, string> = {
  producto_danado: "Producto dañado",
  empaque_danado: "Empaque dañado",
  vencimiento_corto: "Vencimiento corto",
  producto_vencido: "Producto vencido",
  cantidad_incorrecta: "Cantidad incorrecta",
  reclamo_clientes: "Reclamo de clientes",
  otro: "Otro",
};

const DESTINO: Record<DestinoDevVenta, string> = {
  reingreso_stock: "Reingreso a stock",
  merma: "Merma",
  cuarentena: "Cuarentena",
};

const ESTADO_VENTA: Record<EstadoDevVenta, { label: string; bg: string; color: string }> = {
  solicitada: { label: "Solicitada", bg: "#FEF3C7", color: "#D97706" },
  aprobada: { label: "Aprobada", bg: "#DBEAFE", color: "#2563EB" },
  rechazada: { label: "Rechazada", bg: "#FEE2E2", color: "#DC2626" },
  completada: { label: "Completada", bg: "#D1FAE5", color: "#059669" },
};

const ESTADO_PROVEEDOR: Record<EstadoDevProveedor, { label: string; bg: string; color: string }> = {
  solicitada: { label: "Solicitada", bg: "#FEF3C7", color: "#D97706" },
  aceptada: { label: "Aceptada", bg: "#DBEAFE", color: "#2563EB" },
  rechazada: { label: "Rechazada", bg: "#FEE2E2", color: "#DC2626" },
  completada: { label: "Completada", bg: "#D1FAE5", color: "#059669" },
};

const numFmt = new Intl.NumberFormat("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatBOB = (v: number) => `Bs ${numFmt.format(v || 0)}`;
const dateFmt = new Intl.DateTimeFormat("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" });
const formatFecha = (s?: string | null) => (s ? dateFmt.format(new Date(s)) : "—");

function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold" style={{ backgroundColor: bg, color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Página principal
// ══════════════════════════════════════════════════════════════════════════════
export default function Devolucion() {
  const [tab, setTab] = useState<"venta" | "proveedor">("venta");

  return (
    <div className="min-h-screen p-6 text-gray-800">
      <div className="mb-6">
        <h1 className="flex items-center gap-3 text-2xl font-extrabold" style={{ color: COLORS.dark }}>
          <span className="h-8 w-1.5 rounded-full" style={{ background: `linear-gradient(135deg, ${COLORS.dark}, ${COLORS.medium})` }} />
          Gestión de Devoluciones
        </h1>
        <p className="mt-1 ml-5 text-sm" style={{ color: COLORS.textSecondary }}>
          Registra y resuelve devoluciones de clientes y a proveedores.
        </p>
      </div>

      <div className="mb-5 flex gap-2">
        <TabButton active={tab === "venta"} onClick={() => setTab("venta")}>Devoluciones de venta</TabButton>
        <TabButton active={tab === "proveedor"} onClick={() => setTab("proveedor")}>Devoluciones a proveedor</TabButton>
      </div>

      {tab === "venta" ? <TabVenta /> : <TabProveedor />}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
      style={active ? { backgroundColor: COLORS.dark, color: "#FFFFFF" } : { backgroundColor: COLORS.bgCard, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary }}
    >
      {children}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab: Devoluciones de venta
// ══════════════════════════════════════════════════════════════════════════════
function TabVenta() {
  const queryClient = useQueryClient();
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoDevVenta | "todos">("todos");
  const [showCrear, setShowCrear] = useState(false);
  const [detalleId, setDetalleId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["DevolucionesVenta", estadoFiltro],
    queryFn: () => GetDevolucionesVentaApi({ estado: estadoFiltro === "todos" ? undefined : estadoFiltro, porPagina: 100 }),
  });

  const lista = data?.data ?? [];
  const refrescar = () => {
    queryClient.invalidateQueries({ queryKey: ["DevolucionesVenta"] });
    queryClient.invalidateQueries({ queryKey: ["VentasAll"] });
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl p-4" style={{ backgroundColor: COLORS.bgCard, border: `1px solid ${COLORS.border}` }}>
        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value as EstadoDevVenta | "todos")}
          className="rounded-lg px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: COLORS.bgCard, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary }}
        >
          <option value="todos">Todos los estados</option>
          {(Object.keys(ESTADO_VENTA) as EstadoDevVenta[]).map((e) => (
            <option key={e} value={e}>{ESTADO_VENTA[e].label}</option>
          ))}
        </select>
        <span className="text-xs" style={{ color: COLORS.textMuted }}>
          {lista.length} registro{lista.length !== 1 && "s"}
        </span>
        <button
          onClick={() => setShowCrear(true)}
          className="ml-auto rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: COLORS.dark }}
        >
          + Nueva devolución
        </button>
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <TablaDevoluciones
          rows={lista}
          renderRow={(d: DevVentaListItemType) => (
            <>
              <td className="px-4 py-3 font-bold" style={{ color: COLORS.dark }}>#{d.idDevolucionVenta}</td>
              <td className="px-4 py-3 text-xs">{formatFecha(d.fechaCreacion)}</td>
              <td className="px-4 py-3 text-xs">#{d.idVenta}</td>
              <td className="px-4 py-3 text-sm font-semibold">{d.cliente ?? "—"}</td>
              <td className="px-4 py-3 text-xs capitalize">{d.tipo}</td>
              <td className="px-4 py-3 text-xs">{MOTIVO_VENTA[d.motivo]}</td>
              <td className="px-4 py-3 text-sm font-bold">{formatBOB(d.montoReembolso)}</td>
              <td className="px-4 py-3"><Badge {...ESTADO_VENTA[d.estado]} /></td>
              <td className="px-4 py-3">
                <button onClick={() => setDetalleId(d.idDevolucionVenta)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: COLORS.dark }}>
                  Ver / Resolver
                </button>
              </td>
            </>
          )}
        />
      )}

      {showCrear && (
        <CrearDevVentaModal
          onClose={() => setShowCrear(false)}
          onCreated={() => { setShowCrear(false); refrescar(); }}
        />
      )}
      {detalleId !== null && (
        <DetalleDevVentaModal
          id={detalleId}
          onClose={() => setDetalleId(null)}
          onResolved={() => { setDetalleId(null); refrescar(); }}
        />
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab: Devoluciones a proveedor
// ══════════════════════════════════════════════════════════════════════════════
function TabProveedor() {
  const queryClient = useQueryClient();
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoDevProveedor | "todos">("todos");
  const [showCrear, setShowCrear] = useState(false);
  const [detalleId, setDetalleId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["DevolucionesProveedor", estadoFiltro],
    queryFn: () => GetDevolucionesProveedorApi({ estado: estadoFiltro === "todos" ? undefined : estadoFiltro, porPagina: 100 }),
  });

  const lista = data?.data ?? [];
  const refrescar = () => {
    queryClient.invalidateQueries({ queryKey: ["DevolucionesProveedor"] });
    queryClient.invalidateQueries({ queryKey: ["ComprasAll"] });
    queryClient.invalidateQueries({ queryKey: ["lotes"] });
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl p-4" style={{ backgroundColor: COLORS.bgCard, border: `1px solid ${COLORS.border}` }}>
        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value as EstadoDevProveedor | "todos")}
          className="rounded-lg px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: COLORS.bgCard, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary }}
        >
          <option value="todos">Todos los estados</option>
          {(Object.keys(ESTADO_PROVEEDOR) as EstadoDevProveedor[]).map((e) => (
            <option key={e} value={e}>{ESTADO_PROVEEDOR[e].label}</option>
          ))}
        </select>
        <span className="text-xs" style={{ color: COLORS.textMuted }}>
          {lista.length} registro{lista.length !== 1 && "s"}
        </span>
        <button
          onClick={() => setShowCrear(true)}
          className="ml-auto rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: COLORS.dark }}
        >
          + Nueva devolución
        </button>
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <TablaDevoluciones
          headers={["N°", "Fecha", "Compra", "Proveedor", "Tipo", "Motivo", "Nota crédito", "Estado", "Acciones"]}
          rows={lista}
          renderRow={(d: DevProveedorListItemType) => (
            <>
              <td className="px-4 py-3 font-bold" style={{ color: COLORS.dark }}>#{d.idDevolucionProveedor}</td>
              <td className="px-4 py-3 text-xs">{formatFecha(d.fechaCreacion)}</td>
              <td className="px-4 py-3 text-xs">{d.compraFactura ?? `#${d.idCompra}`}</td>
              <td className="px-4 py-3 text-sm font-semibold">{d.proveedor ?? "—"}</td>
              <td className="px-4 py-3 text-xs capitalize">{d.tipo}</td>
              <td className="px-4 py-3 text-xs">{MOTIVO_PROVEEDOR[d.motivo]}</td>
              <td className="px-4 py-3 text-sm font-bold">{formatBOB(d.montoNotaCredito)}</td>
              <td className="px-4 py-3"><Badge {...ESTADO_PROVEEDOR[d.estado]} /></td>
              <td className="px-4 py-3">
                <button onClick={() => setDetalleId(d.idDevolucionProveedor)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: COLORS.dark }}>
                  Ver / Resolver
                </button>
              </td>
            </>
          )}
        />
      )}

      {showCrear && (
        <CrearDevProveedorModal
          onClose={() => setShowCrear(false)}
          onCreated={() => { setShowCrear(false); refrescar(); }}
        />
      )}
      {detalleId !== null && (
        <DetalleDevProveedorModal
          id={detalleId}
          onClose={() => setDetalleId(null)}
          onResolved={() => { setDetalleId(null); refrescar(); }}
        />
      )}
    </>
  );
}

// ─── Tabla genérica ───────────────────────────────────────────────────────────
function TablaDevoluciones<T>({ headers, rows, renderRow }: {
  headers?: string[];
  rows: T[];
  renderRow: (row: T, index: number) => ReactNode;
}) {
  const cols = headers ?? ["N°", "Fecha", "Venta", "Cliente", "Tipo", "Motivo", "Reembolso", "Estado", "Acciones"];
  return (
    <div className="overflow-hidden rounded-2xl" style={{ backgroundColor: COLORS.bgCard, border: `1px solid ${COLORS.border}` }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: COLORS.light }}>
              {cols.map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: COLORS.dark }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr><td colSpan={cols.length} className="px-6 py-16 text-center text-sm" style={{ color: COLORS.textMuted }}>No se encontraron devoluciones</td></tr>
            ) : (
              rows.map((row, i) => <tr key={i} className="hover:bg-gray-50/70">{renderRow(row, i)}</tr>)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Modal genérico ───────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide = false }: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl ${wide ? "max-w-4xl" : "max-w-2xl"}`} style={{ borderColor: COLORS.border }}>
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: COLORS.border }}>
          <h3 className="text-lg font-bold" style={{ color: COLORS.dark }}>{title}</h3>
          <button onClick={onClose} className="text-2xl leading-none" style={{ color: COLORS.textMuted }}>×</button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

const inputStyle = { borderColor: COLORS.border, color: COLORS.textPrimary } as const;
const inputCls = "w-full rounded-lg border px-3 py-2 text-sm outline-none";

// ══════════════════════════════════════════════════════════════════════════════
// Crear devolución de venta
// ══════════════════════════════════════════════════════════════════════════════
function CrearDevVentaModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [idVenta, setIdVenta] = useState<number | "">("");
  const [tipo, setTipo] = useState<"total" | "parcial">("parcial");
  const [motivo, setMotivo] = useState<MotivoDevVenta>("arrepentimiento");
  const [metodoReembolso, setMetodoReembolso] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [sel, setSel] = useState<Record<number, boolean>>({});
  const [qty, setQty] = useState<Record<number, number>>({});
  const [destino, setDestino] = useState<Record<number, DestinoDevVenta>>({});

  const { data: ventasData } = useQuery({
    queryKey: ["VentasParaDevolucion"],
    queryFn: () => GetVentasApi({ porPagina: 200 }),
  });
  const ventas = useMemo(
    () => (ventasData?.data ?? []).filter((v: VentaType) => ["completado", "devuelto_parcial"].includes(v.estado)),
    [ventasData]
  );

  const { data: venta } = useQuery({
    queryKey: ["VentaDetalle", idVenta],
    queryFn: () => GetVentaByIdApi(idVenta as number),
    enabled: !!idVenta,
  });

  const lineas = useMemo(
    () => (venta?.detalles ?? []).flatMap((d) => (d.idLote == null ? [] : [{ ...d, idLote: d.idLote }])),
    [venta]
  );

  const subtotal = useMemo(
    () => lineas.reduce((acc, d) => (sel[d.idLote] ? acc + (qty[d.idLote] || 0) * d.precioUnitario : acc), 0),
    [lineas, sel, qty]
  );

  const mutation = useMutation({
    mutationFn: (payload: CreateDevVentaType) => AddDevolucionVentaApi(payload),
    onSuccess: onCreated,
    onError: (e: Error) => alert(e.message),
  });

  const submit = () => {
    if (!venta || !idVenta) return;
    const detalles = lineas
      .filter((d) => sel[d.idLote])
      .map((d) => ({
        idLote: d.idLote,
        idProducto: d.idProducto as number,
        cantidad: qty[d.idLote] || 0,
        precioUnitario: d.precioUnitario,
        destino: destino[d.idLote] || "reingreso_stock",
      }));

    if (detalles.length === 0) return alert("Selecciona al menos un producto a devolver.");
    if (detalles.some((d) => d.cantidad < 1)) return alert("Las cantidades deben ser mayores a 0.");

    mutation.mutate({
      tipo,
      motivo,
      metodoReembolso: metodoReembolso || undefined,
      observaciones: observaciones || undefined,
      idVenta: idVenta as number,
      detalles,
    });
  };

  return (
    <Modal title="Nueva devolución de venta" onClose={onClose} wide>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold" style={{ color: COLORS.textSecondary }}>Venta de origen</label>
          <select
            value={idVenta}
            onChange={(e) => { setIdVenta(e.target.value ? Number(e.target.value) : ""); setSel({}); setQty({}); setDestino({}); }}
            className={inputCls}
            style={inputStyle}
          >
            <option value="">Selecciona una venta...</option>
            {ventas.map((v) => (
              <option key={v.idVenta} value={v.idVenta}>
                #{v.idVenta} · {formatFecha(v.fechaCreacion)} · {v.cliente ?? "Cliente"} · {formatBOB(v.total)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold" style={{ color: COLORS.textSecondary }}>Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value as "total" | "parcial")} className={inputCls} style={inputStyle}>
            <option value="parcial">Parcial</option>
            <option value="total">Total</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold" style={{ color: COLORS.textSecondary }}>Motivo</label>
          <select value={motivo} onChange={(e) => setMotivo(e.target.value as MotivoDevVenta)} className={inputCls} style={inputStyle}>
            {(Object.keys(MOTIVO_VENTA) as MotivoDevVenta[]).map((m) => <option key={m} value={m}>{MOTIVO_VENTA[m]}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold" style={{ color: COLORS.textSecondary }}>Método de reembolso</label>
          <input value={metodoReembolso} onChange={(e) => setMetodoReembolso(e.target.value)} placeholder="Efectivo, QR..." className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold" style={{ color: COLORS.textSecondary }}>Observaciones</label>
          <input value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className={inputCls} style={inputStyle} />
        </div>
      </div>

      {venta && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: COLORS.textSecondary }}>Productos de la venta</p>
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: COLORS.border }}>
            <table className="w-full text-xs">
              <thead style={{ backgroundColor: COLORS.light }}>
                <tr>
                  {["", "Producto", "Lote", "Vendido", "Cant. a devolver", "Destino"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-bold" style={{ color: COLORS.dark }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lineas.map((d) => (
                  <tr key={d.idLote}>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={!!sel[d.idLote]}
                        onChange={(e) => {
                          setSel((s) => ({ ...s, [d.idLote]: e.target.checked }));
                          setQty((q) => ({ ...q, [d.idLote]: q[d.idLote] || 1 }));
                          setDestino((x) => ({ ...x, [d.idLote]: x[d.idLote] || "reingreso_stock" }));
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">{d.nombreComercial || d.nombreGenerico || `Producto ${d.idProducto}`}</td>
                    <td className="px-3 py-2">{d.numeroLote}</td>
                    <td className="px-3 py-2">{d.cantidad}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={1}
                        max={d.cantidad}
                        value={qty[d.idLote] ?? 1}
                        onChange={(e) => setQty((q) => ({ ...q, [d.idLote]: Math.min(Number(e.target.value) || 1, d.cantidad) }))}
                        className="w-20 rounded border px-2 py-1"
                        style={inputStyle}
                        disabled={!sel[d.idLote]}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={destino[d.idLote] || "reingreso_stock"}
                        onChange={(e) => setDestino((x) => ({ ...x, [d.idLote]: e.target.value as DestinoDevVenta }))}
                        className="rounded border px-2 py-1"
                        style={inputStyle}
                        disabled={!sel[d.idLote]}
                      >
                        {(Object.keys(DESTINO) as DestinoDevVenta[]).map((k) => <option key={k} value={k}>{DESTINO[k]}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-right text-sm font-bold" style={{ color: COLORS.dark }}>Reembolso estimado: {formatBOB(subtotal)}</p>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold" style={{ border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary }}>Cancelar</button>
        <button
          onClick={submit}
          disabled={mutation.isPending || !idVenta}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: COLORS.dark }}
        >
          {mutation.isPending ? "Registrando..." : "Registrar devolución"}
        </button>
      </div>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Crear devolución a proveedor
// ══════════════════════════════════════════════════════════════════════════════
function CrearDevProveedorModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [idCompra, setIdCompra] = useState<number | "">("");
  const [tipo, setTipo] = useState<"total" | "parcial">("parcial");
  const [motivo, setMotivo] = useState<MotivoDevProveedor>("producto_danado");
  const [observaciones, setObservaciones] = useState("");
  const [sel, setSel] = useState<Record<number, boolean>>({});
  const [qty, setQty] = useState<Record<number, number>>({});

  const { data: comprasData } = useQuery({
    queryKey: ["ComprasParaDevolucion"],
    queryFn: () => GetComprasApi({ porPagina: 200 }),
  });
  const compras = useMemo(
    () => (comprasData?.data ?? []).filter((c: CompraType) => ["completado", "parcial", "devuelto_parcial"].includes(c.estado)),
    [comprasData]
  );

  const { data: compra } = useQuery({
    queryKey: ["CompraDetalle", idCompra],
    queryFn: () => GetCompraByIdApi(idCompra as number),
    enabled: !!idCompra,
  });

  const lineas = useMemo(
    () => (compra?.detalles ?? []).flatMap((d) => (d.idLote == null ? [] : [{ ...d, idLote: d.idLote }])),
    [compra]
  );

  const subtotal = useMemo(
    () => lineas.reduce((acc, d) => (sel[d.idLote] ? acc + (qty[d.idLote] || 0) * d.precioUnitario : acc), 0),
    [lineas, sel, qty]
  );

  const mutation = useMutation({
    mutationFn: (payload: CreateDevProveedorType) => AddDevolucionProveedorApi(payload),
    onSuccess: onCreated,
    onError: (e: Error) => alert(e.message),
  });

  const submit = () => {
    if (!compra || !idCompra) return;
    const detalles = lineas
      .filter((d) => sel[d.idLote])
      .map((d) => ({
        idLote: d.idLote,
        cantidad: qty[d.idLote] || 0,
        precioUnitario: d.precioUnitario,
      }));

    if (detalles.length === 0) return alert("Selecciona al menos un lote a devolver.");
    if (detalles.some((d) => d.cantidad < 1)) return alert("Las cantidades deben ser mayores a 0.");

    mutation.mutate({
      tipo,
      motivo,
      observaciones: observaciones || undefined,
      idCompra: idCompra as number,
      detalles,
    });
  };

  return (
    <Modal title="Nueva devolución a proveedor" onClose={onClose} wide>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold" style={{ color: COLORS.textSecondary }}>Compra de origen</label>
          <select
            value={idCompra}
            onChange={(e) => { setIdCompra(e.target.value ? Number(e.target.value) : ""); setSel({}); setQty({}); }}
            className={inputCls}
            style={inputStyle}
          >
            <option value="">Selecciona una compra...</option>
            {compras.map((c) => (
              <option key={c.idCompra} value={c.idCompra}>
                {c.numeroFactura ?? `#${c.idCompra}`} · {formatFecha(c.fechaCreacion)} · {c.proveedor ?? ""} · {formatBOB(c.total)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold" style={{ color: COLORS.textSecondary }}>Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value as "total" | "parcial")} className={inputCls} style={inputStyle}>
            <option value="parcial">Parcial</option>
            <option value="total">Total</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold" style={{ color: COLORS.textSecondary }}>Motivo</label>
          <select value={motivo} onChange={(e) => setMotivo(e.target.value as MotivoDevProveedor)} className={inputCls} style={inputStyle}>
            {(Object.keys(MOTIVO_PROVEEDOR) as MotivoDevProveedor[]).map((m) => <option key={m} value={m}>{MOTIVO_PROVEEDOR[m]}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold" style={{ color: COLORS.textSecondary }}>Observaciones</label>
          <input value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className={inputCls} style={inputStyle} />
        </div>
      </div>

      {compra && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: COLORS.textSecondary }}>Lotes de la compra</p>
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: COLORS.border }}>
            <table className="w-full text-xs">
              <thead style={{ backgroundColor: COLORS.light }}>
                <tr>
                  {["", "Producto", "Lote", "Stock actual", "Cant. a devolver"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-bold" style={{ color: COLORS.dark }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lineas.map((d) => (
                  <tr key={d.idLote}>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={!!sel[d.idLote]}
                        onChange={(e) => {
                          setSel((s) => ({ ...s, [d.idLote]: e.target.checked }));
                          setQty((q) => ({ ...q, [d.idLote]: q[d.idLote] || d.cantidad }));
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">{d.nombreComercial || d.nombreGenerico || d.codigo || "—"}</td>
                    <td className="px-3 py-2">{d.numeroLote}</td>
                    <td className="px-3 py-2">{d.stock}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={1}
                        max={d.cantidad}
                        value={qty[d.idLote] ?? d.cantidad}
                        onChange={(e) => setQty((q) => ({ ...q, [d.idLote]: Math.min(Number(e.target.value) || 1, d.cantidad) }))}
                        className="w-20 rounded border px-2 py-1"
                        style={inputStyle}
                        disabled={!sel[d.idLote]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-right text-sm font-bold" style={{ color: COLORS.dark }}>Nota de crédito estimada: {formatBOB(subtotal)}</p>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold" style={{ border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary }}>Cancelar</button>
        <button
          onClick={submit}
          disabled={mutation.isPending || !idCompra}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: COLORS.dark }}
        >
          {mutation.isPending ? "Registrando..." : "Registrar devolución"}
        </button>
      </div>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Detalle + resolución: devolución de venta
// ══════════════════════════════════════════════════════════════════════════════
function DetalleDevVentaModal({ id, onClose, onResolved }: { id: number; onClose: () => void; onResolved: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["DevolucionVentaDetalle", id],
    queryFn: () => GetDevolucionVentaByIdApi(id),
  });

  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [numeroNotaCredito, setNumeroNotaCredito] = useState("");

  const mutation = useMutation({
    mutationFn: (payload: ResolverDevVentaType) => ResolverDevolucionVentaApi(id, payload),
    onSuccess: onResolved,
    onError: (e: Error) => alert(e.message),
  });

  const dev: DevVentaType | undefined = data;
  const resoluble = dev && !["completada", "rechazada"].includes(dev.estado);

  return (
    <Modal title={`Devolución de venta #${id}`} onClose={onClose} wide>
      {isLoading || !dev ? (
        <Loading />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Info label="Venta">{`#${dev.idVenta}`}</Info>
            <Info label="Cliente">{dev.cliente ?? "—"}</Info>
            <Info label="Estado"><Badge {...ESTADO_VENTA[dev.estado]} /></Info>
            <Info label="Tipo">{dev.tipo}</Info>
            <Info label="Motivo">{MOTIVO_VENTA[dev.motivo]}</Info>
            <Info label="Monto reembolso">{formatBOB(dev.montoReembolso)}</Info>
            <Info label="Creada">{formatFecha(dev.fechaCreacion)}</Info>
            <Info label="Resuelta">{formatFecha(dev.fechaResolucion)}</Info>
            <Info label="Nota de crédito">{dev.numeroNotaCredito ?? "—"}</Info>
          </div>

          {dev.observaciones && <p className="mt-3 text-sm" style={{ color: COLORS.textSecondary }}>{dev.observaciones}</p>}
          {dev.motivoRechazo && (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">Motivo de rechazo: {dev.motivoRechazo}</p>
          )}

          <div className="mt-4 overflow-x-auto rounded-xl border" style={{ borderColor: COLORS.border }}>
            <table className="w-full text-xs">
              <thead style={{ backgroundColor: COLORS.light }}>
                <tr>
                  {["Producto", "Lote", "Cantidad", "P. Unit.", "Subtotal", "Destino"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-bold" style={{ color: COLORS.dark }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(dev.detalles ?? []).map((d) => (
                  <tr key={d.idLote}>
                    <td className="px-3 py-2">{d.nombreComercial || d.nombreGenerico}</td>
                    <td className="px-3 py-2">{d.numeroLote}</td>
                    <td className="px-3 py-2">{d.cantidad}</td>
                    <td className="px-3 py-2">{formatBOB(d.precioUnitario)}</td>
                    <td className="px-3 py-2">{formatBOB(d.subtotal)}</td>
                    <td className="px-3 py-2">{d.destino ? DESTINO[d.destino] : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {resoluble && (
            <div className="mt-6 rounded-xl border p-4" style={{ borderColor: COLORS.border }}>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide" style={{ color: COLORS.textSecondary }}>Resolver devolución</p>
              {dev.estado === "solicitada" && (
                <button
                  onClick={() => mutation.mutate({ estado: "aprobada" })}
                  disabled={mutation.isPending}
                  className="mb-3 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: COLORS.medium }}
                >
                  Aprobar
                </button>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold" style={{ color: COLORS.textSecondary }}>N° Nota de crédito (al completar)</label>
                  <input value={numeroNotaCredito} onChange={(e) => setNumeroNotaCredito(e.target.value)} className={inputCls} style={inputStyle} placeholder="Ej. NC-0002" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold" style={{ color: COLORS.textSecondary }}>Motivo de rechazo (si aplica)</label>
                  <input value={motivoRechazo} onChange={(e) => setMotivoRechazo(e.target.value)} className={inputCls} style={inputStyle} />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => {
                    if (!motivoRechazo.trim()) return alert("Indica el motivo de rechazo.");
                    mutation.mutate({ estado: "rechazada", motivoRechazo });
                  }}
                  disabled={mutation.isPending}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  Rechazar
                </button>
                <button
                  onClick={() => mutation.mutate({ estado: "completada", numeroNotaCredito: numeroNotaCredito || undefined })}
                  disabled={mutation.isPending}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: "#059669" }}
                >
                  Completar y ajustar stock
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Detalle + resolución: devolución a proveedor
// ══════════════════════════════════════════════════════════════════════════════
function DetalleDevProveedorModal({ id, onClose, onResolved }: { id: number; onClose: () => void; onResolved: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["DevolucionProveedorDetalle", id],
    queryFn: () => GetDevolucionProveedorByIdApi(id),
  });

  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [numeroNotaCredito, setNumeroNotaCredito] = useState("");

  const mutation = useMutation({
    mutationFn: (payload: ResolverDevProveedorType) => ResolverDevolucionProveedorApi(id, payload),
    onSuccess: onResolved,
    onError: (e: Error) => alert(e.message),
  });

  const dev: DevProveedorType | undefined = data;
  const resoluble = dev && !["completada", "rechazada"].includes(dev.estado);

  return (
    <Modal title={`Devolución a proveedor #${id}`} onClose={onClose} wide>
      {isLoading || !dev ? (
        <Loading />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Info label="Compra">{dev.compraFactura ?? `#${dev.idCompra}`}</Info>
            <Info label="Proveedor">{dev.proveedor ?? "—"}</Info>
            <Info label="Estado"><Badge {...ESTADO_PROVEEDOR[dev.estado]} /></Info>
            <Info label="Tipo">{dev.tipo}</Info>
            <Info label="Motivo">{MOTIVO_PROVEEDOR[dev.motivo]}</Info>
            <Info label="Monto nota crédito">{formatBOB(dev.montoNotaCredito)}</Info>
            <Info label="Creada">{formatFecha(dev.fechaCreacion)}</Info>
            <Info label="Resuelta">{formatFecha(dev.fechaResolucion)}</Info>
            <Info label="Nota de crédito">{dev.numeroNotaCredito ?? "—"}</Info>
          </div>

          {dev.observaciones && <p className="mt-3 text-sm" style={{ color: COLORS.textSecondary }}>{dev.observaciones}</p>}
          {dev.motivoRechazo && (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">Motivo de rechazo: {dev.motivoRechazo}</p>
          )}

          <div className="mt-4 overflow-x-auto rounded-xl border" style={{ borderColor: COLORS.border }}>
            <table className="w-full text-xs">
              <thead style={{ backgroundColor: COLORS.light }}>
                <tr>
                  {["Producto", "Lote", "Cantidad", "P. Unit.", "Subtotal"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-bold" style={{ color: COLORS.dark }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(dev.detalles ?? []).map((d) => (
                  <tr key={d.idLote}>
                    <td className="px-3 py-2">{d.nombreComercial || d.nombreGenerico}</td>
                    <td className="px-3 py-2">{d.numeroLote}</td>
                    <td className="px-3 py-2">{d.cantidad}</td>
                    <td className="px-3 py-2">{formatBOB(d.precioUnitario)}</td>
                    <td className="px-3 py-2">{formatBOB(d.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {resoluble && (
            <div className="mt-6 rounded-xl border p-4" style={{ borderColor: COLORS.border }}>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide" style={{ color: COLORS.textSecondary }}>Resolver devolución</p>
              {dev.estado === "solicitada" && (
                <button
                  onClick={() => mutation.mutate({ estado: "aceptada" })}
                  disabled={mutation.isPending}
                  className="mb-3 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: COLORS.medium }}
                >
                  Aceptar
                </button>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold" style={{ color: COLORS.textSecondary }}>N° Nota de crédito (al completar)</label>
                  <input value={numeroNotaCredito} onChange={(e) => setNumeroNotaCredito(e.target.value)} className={inputCls} style={inputStyle} placeholder="Ej. NC-DV-2220" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold" style={{ color: COLORS.textSecondary }}>Motivo de rechazo (si aplica)</label>
                  <input value={motivoRechazo} onChange={(e) => setMotivoRechazo(e.target.value)} className={inputCls} style={inputStyle} />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => {
                    if (!motivoRechazo.trim()) return alert("Indica el motivo de rechazo.");
                    mutation.mutate({ estado: "rechazada", motivoRechazo });
                  }}
                  disabled={mutation.isPending}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  Rechazar
                </button>
                <button
                  onClick={() => mutation.mutate({ estado: "completada", numeroNotaCredito: numeroNotaCredito || undefined })}
                  disabled={mutation.isPending}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: "#059669" }}
                >
                  Completar y ajustar stock
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border p-3" style={{ borderColor: COLORS.border }}>
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: COLORS.textMuted }}>{label}</p>
      <div className="mt-1 text-sm font-semibold" style={{ color: COLORS.textPrimary }}>{children}</div>
    </div>
  );
}
