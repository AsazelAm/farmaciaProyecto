import { lazy, Suspense, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Loading from "../../../../Helpers/Loading";
import { GetProveedorApi } from "../../../../Api/ProveedorApi";
import { GetSucursalApi } from "../../../../Api/SucursalApi";
import { AddCompraApi } from "../../../../Api/CompraLoteApi";
import { GetProductoApi } from "../../../../Api/ProductoApi";
import type { CreateCompraType, ILoteInput } from "../../../../types";
// import { alfanumerico, numero, tecladoAlfanumerico } from "../../../../lib/validators";

// ─── Lazy: modal de lote ──────────────────────────────────────────────────────
const LotDetalleForm = lazy(
  () => import("../../../../Components/CompraLote/LotDetalleForm")
);

// ─── Paleta (sin cambios) ────────────────────────────────────────────────────
const C = {
  dark: "#4A1A6E",
  medium: "#7B3FA0",
  light: "#F3EBF9",
  border: "#D8B4F0",
  text: "#2D0A47",
};
const ERROR_COLOR = "#EF4444";
const SURFACE = "#FBF8FE";
const MUTED = "#9CA3AF";
const GRADIENT = `linear-gradient(135deg, ${C.dark}, ${C.medium})`;

// ═════════════════════════════════════════════════════════════════════════════
//  PIEZAS VISUALES REUTILIZABLES (solo presentación)
// ═════════════════════════════════════════════════════════════════════════════
const Icon = ({ d, className = "w-5 h-5" }: { d: string; className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

const ICONS = {
  clipboard:
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  money:
    "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  box: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  plus: "M12 4v16m8-8H4",
  trash:
    "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  check: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  down: "M19 9l-7 7-7-7",
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  doc: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  back: "M10 19l-7-7m0 0l7-7m-7 7h18",
};

// Clase base de inputs / selects / textarea (el borde va aparte en style)
const fieldCls =
  "w-full rounded-xl border-2 bg-white py-2.5 text-sm font-medium outline-none transition-all " +
  "placeholder:text-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100";
const fieldStyle = { borderColor: C.border, color: C.text } as const;

function FieldLabel({ text, required = false }: { text: string; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-semibold" style={{ color: C.dark }}>
      {text}
      {required && <span style={{ color: ERROR_COLOR }}> *</span>}
    </label>
  );
}

// Input con ícono opcional a la izquierda y sufijo opcional (ej. "%")
function InputField({
  id, type = "text", placeholder, value, onChange, icon, suffix,
}: {
  id?: string; type?: string; placeholder?: string;
  value: string | number; onChange: (v: string) => void;
  icon?: string; suffix?: string;
}) {
  return (
    <div className="group relative">
      {icon && (
        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-purple-600">
          <Icon d={icon} className="h-4 w-4" />
        </div>
      )}
      <input
        id={id} type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldCls} ${icon ? "pl-10" : "pl-4"} ${suffix ? "pr-9" : "pr-4"}`}
        style={fieldStyle}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: MUTED }}>
          {suffix}
        </span>
      )}
    </div>
  );
}

// Select con ícono opcional a la izquierda y flecha propia a la derecha
function SelectField({
  id, value, onChange, children, icon,
}: {
  id?: string; value: string | number;
  onChange: (v: string) => void; children: React.ReactNode; icon?: string;
}) {
  return (
    <div className="group relative">
      {icon && (
        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-purple-600">
          <Icon d={icon} className="h-4 w-4" />
        </div>
      )}
      <select
        id={id} value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldCls} cursor-pointer appearance-none pr-9 ${icon ? "pl-10" : "pl-4"}`}
        // Gris mientras no se haya elegido nada (placeholder), oscuro cuando hay valor
        style={{ ...fieldStyle, color: value ? C.text : MUTED }}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
        <Icon d={ICONS.down} className="h-4 w-4" />
      </div>
    </div>
  );
}

// Tarjeta blanca estándar
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: C.border }}>
      {children}
    </div>
  );
}

// Cabecera de tarjeta: ícono en cajita + título + subtítulo + contenido a la derecha
function SectionHeader({
  icon, title, subtitle, aside,
}: { icon: string; title: string; subtitle?: string; aside?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ background: C.light, color: C.medium }}
        >
          <Icon d={icon} />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold leading-tight" style={{ color: C.dark }}>{title}</h2>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {aside}
    </div>
  );
}

// ─── Tipos ────────────────────────────────────────────────────────────────────
type LoteRow = ILoteInput & {
  _id: number;
  productoInfo: any; //
};

const INITIAL_FORM_STATE = {
  idProveedor: "",
  numeroFactura: "",
  idSucursal: "",
  fechaEntrega: new Date().toISOString().split("T")[0],
  observaciones: "",
  descuentoGlobal: "0",
  impuesto: "13",
};

// Columnas de la tabla de lotes: [título, alineación]
const COLUMNAS: [string, "left" | "center" | "right"][] = [
  ["#", "left"],
  ["Producto", "left"],
  ["Nro. lote", "left"],
  ["Código", "left"],
  ["Stock", "center"],
  ["Precio", "right"],
  ["Desc. %", "right"],
  ["Subtotal", "right"],
  ["Acciones", "center"],
];
const alignCls = { left: "text-left", center: "text-center", right: "text-right" } as const;

// ─── Componente principal ─────────────────────────────────────────────────────
export default function NewCompra({ onBack }: { onBack?: () => void }) {
  const queryClient = useQueryClient();

  // ── Estado Unificado ──────────────────────────────────────────────────────
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [lotes, setLotes] = useState<LoteRow[]>([]);
  const [showLoteModal, setShowLoteModal] = useState(false);

  const handleInputChange = (field: keyof typeof INITIAL_FORM_STATE, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ── Queries con defaults seguros ──────────────────────────────────────────
  const { data: proveedores = [], isLoading: loadingProv } = useQuery({
    queryKey: ["ProveedorAll"],
    queryFn: GetProveedorApi,
  });

  const { data: sucursales = [], isLoading: loadingSuc } = useQuery({
    queryKey: ["SucursalAll"],
    queryFn: GetSucursalApi,
  });

  const { data: productos = [] } = useQuery({
    queryKey: ["ProductoAll"],
    queryFn: GetProductoApi,
  });

  // ── Limpieza ──────────────────────────────────────────────────────────────
  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setLotes([]);
  };

  // ── Totales reactivos ─────────────────────────────────────────────────────
  const { subtotal, ivaCalculado, total } = useMemo(() => {
    const sub = lotes.reduce((acc, l) => {
      const bruto = l.precioCompra * l.stock;
      return acc + bruto - (bruto * l.descuento) / 100;
    }, 0);

    const descPct    = parseFloat(formData.descuentoGlobal) || 0;
    const subConDesc = sub - (sub * descPct) / 100;
    const ivaPct     = parseFloat(formData.impuesto) || 0;
    const iva        = subConDesc * ivaPct / 100;

    return { subtotal: subConDesc, ivaCalculado: iva, total: subConDesc + iva };
  }, [lotes, formData.descuentoGlobal, formData.impuesto]);

  // ── Mutación ──────────────────────────────────────────────────────────────
  const { mutate: crearCompra, isPending: creando } = useMutation({
    mutationFn: AddCompraApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ComprasAll"] });
      queryClient.invalidateQueries({ queryKey: ["ComprasEstadisticas"] });
      toast.success(data?.message ?? "Compra registrada exitosamente");
      resetForm();
      onBack?.();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // ── Lógica de Lotes ───────────────────────────────────────────────────────
  const handleLoteConfirmado = (lote: ILoteInput) => {
    const productoInfo = productos.find((p: any) => p.idProducto === lote.idProducto) || null;

    setLotes((prev) => [
      ...prev,
      { ...lote, _id: Date.now(), productoInfo },
    ]);
    toast.success("Lote agregado a la compra");
  };

  const handleEliminarLote = (_id: number) => {
    setLotes((prev) => prev.filter((l) => l._id !== _id));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!formData.idProveedor) { toast.error("Selecciona un proveedor"); return; }
    if (!formData.idSucursal)  { toast.error("Selecciona una sucursal de destino"); return; }
    if (lotes.length === 0) { toast.error("Agrega al menos un medicamento/lote"); return; }

    const payload: CreateCompraType = {
      idProveedor:   parseInt(formData.idProveedor),
      idSucursal:    parseInt(formData.idSucursal),
      numeroFactura: formData.numeroFactura || undefined,
      fechaEntrega:  formData.fechaEntrega  || undefined,
      observaciones: formData.observaciones || undefined,
      descuento:     parseFloat(formData.descuentoGlobal) || 0,
      impuesto:      parseFloat(formData.impuesto) || 0,
      subtotal,
      total,
      lotes: lotes.map(({ _id, productoInfo, ...rest }) => rest), //
    };

    crearCompra(payload);
  };

  if (loadingProv || loadingSuc) return <Loading />;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ color: C.text }}>
      <div className="mx-auto max-w-7xl">

        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <header
          className="relative mb-5 overflow-hidden rounded-2xl px-6 py-5 text-white shadow-md"
          style={{ background: GRADIENT }}
        >
          <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute right-40 -bottom-14 h-28 w-28 rounded-full bg-white/5" />

          <div className="relative flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-inner">
                <Icon d={ICONS.box} className="h-6 w-6" />
              </div>
              <div>
                <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold tracking-tight">
                  Gestión farmacéutica
                  <span className="rounded-lg bg-white/15 px-2.5 py-1 text-xs font-semibold text-purple-100">
                    Registro de compra e inventario
                  </span>
                </h1>
                <p className="mt-0.5 text-xs text-purple-200">
                  Módulo de liquidación de compras y control sanitario de lotes
                </p>
              </div>
            </div>

            <button
              onClick={resetForm}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/25 active:scale-95"
            >
              <Icon d={ICONS.trash} className="h-4 w-4" />
              Limpiar formulario
            </button>
          </div>
        </header>

        {/* ── LAYOUT 2 COLUMNAS ─────────────────────────────────────────────── */}
        <div className="flex flex-col items-start gap-5 lg:flex-row">

          {/* ══════════════════════════════════════════════════════════════════
              PANEL IZQUIERDO — Datos generales + Impuestos y descuentos
          ══════════════════════════════════════════════════════════════════ */}
          <div className="flex w-full flex-shrink-0 flex-col gap-4 lg:w-[340px]">
            <Card>
              <SectionHeader
                icon={ICONS.clipboard}
                title="Datos generales"
                subtitle="Paso 1 · Información de la compra"
                aside={
                  <button
                    onClick={onBack}
                    className="flex flex-shrink-0 items-center gap-1 text-xs font-bold transition-colors hover:underline"
                    style={{ color: C.medium }}
                  >
                    <Icon d={ICONS.back} className="h-3.5 w-3.5" />
                    Volver
                  </button>
                }
              />

              <div className="space-y-4">
                <div>
                  <FieldLabel text="Proveedor de medicamentos" required />
                  <SelectField
                    id="idProveedor"
                    icon={ICONS.user}
                    value={formData.idProveedor}
                    onChange={(v) => handleInputChange("idProveedor", v)}
                  >
                    <option value="">Seleccione el proveedor...</option>
                    {proveedores.map((p: any) => (
                      <option key={p.idProveedor} value={p.idProveedor}>{p.nombre}</option>
                    ))}
                  </SelectField>
                </div>

                <div>
                  <FieldLabel text="Número de factura / control" />
                  <InputField
                    id="numeroFactura"
                    icon={ICONS.doc}
                    placeholder="Ejem: FAC-45892"
                    value={formData.numeroFactura}
                    onChange={(v) => handleInputChange("numeroFactura", v)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel text="Sucursal destino" required />
                    <SelectField
                      id="idSucursal"
                      value={formData.idSucursal}
                      onChange={(v) => handleInputChange("idSucursal", v)}
                    >
                      <option value="">Seleccione...</option>
                      {sucursales.map((s: any) => (
                        <option key={s.idSucursal} value={s.idSucursal}>{s.nombre}</option>
                      ))}
                    </SelectField>
                  </div>

                  <div>
                    <FieldLabel text="Fecha de entrega" />
                    <InputField
                      id="fechaEntrega"
                      type="date"
                      value={formData.fechaEntrega}
                      onChange={(v) => handleInputChange("fechaEntrega", v)}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel text="Observaciones sanitarias / recepción" />
                  <textarea
                    rows={3}
                    placeholder="Ej: Cajas con control térmico intacto..."
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange("observaciones", e.target.value)}
                    className={`${fieldCls} resize-none px-4`}
                    style={fieldStyle}
                  />
                </div>
              </div>
            </Card>

            {/* Tarjeta: Impuestos y descuentos */}
            <Card>
              <SectionHeader
                icon={ICONS.money}
                title="Impuestos y descuentos"
                subtitle="Se aplican al total de la compra"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel text="Descuento global" />
                  <InputField
                    id="descuentoGlobal"
                    type="number"
                    suffix="%"
                    value={formData.descuentoGlobal}
                    onChange={(v) => handleInputChange("descuentoGlobal", v)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <FieldLabel text="Impuesto IVA" />
                  <InputField
                    id="impuesto"
                    type="number"
                    suffix="%"
                    value={formData.impuesto}
                    onChange={(v) => handleInputChange("impuesto", v)}
                    placeholder="13"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              PANEL DERECHO — Productos y lotes cargados
          ══════════════════════════════════════════════════════════════════ */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <Card>
              <SectionHeader
                icon={ICONS.box}
                title="Productos y lotes cargados"
                subtitle="Cada medicamento debe contar con su correspondiente lote técnico"
                aside={
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span
                      className="hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline"
                      style={{ background: C.light, color: C.dark }}
                    >
                      {lotes.length} {lotes.length === 1 ? "lote" : "lotes"}
                    </span>
                    <button
                      onClick={() => setShowLoteModal(true)}
                      className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.03] active:scale-95"
                      style={{ background: GRADIENT }}
                    >
                      <Icon d={ICONS.plus} className="h-4 w-4" />
                      Agregar medicamento
                    </button>
                  </div>
                }
              />

              {lotes.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-14"
                  style={{ borderColor: C.border, background: SURFACE }}
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ background: C.light, color: C.medium }}
                  >
                    <Icon d={ICONS.box} className="h-7 w-7" />
                  </div>
                  <p className="text-sm text-gray-500">
                    No se han añadido lotes de productos a esta compra
                  </p>
                  <button
                    onClick={() => setShowLoteModal(true)}
                    className="flex items-center gap-1 text-sm font-bold transition-colors hover:underline"
                    style={{ color: C.medium }}
                  >
                    <Icon d={ICONS.plus} className="h-4 w-4" />
                    Cargar producto ahora
                  </button>
                </div>
              ) : (
                // Tabla con scroll: si hay muchos lotes, el encabezado se queda fijo arriba
                <div className="max-h-[50vh] overflow-auto rounded-xl border" style={{ borderColor: C.border }}>
                  <table className="w-full min-w-[46rem] text-sm">
                    <thead>
                      <tr>
                        {COLUMNAS.map(([h, align]) => (
                          <th
                            key={h}
                            className={`sticky top-0 z-10 whitespace-nowrap px-3 py-3 text-xs font-bold ${alignCls[align]}`}
                            style={{ background: C.light, color: C.dark, boxShadow: `inset 0 -1px 0 ${C.border}` }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lotes.map((lote, index) => (
                        <tr
                          key={lote._id}
                          className="transition-colors hover:bg-purple-50/50"
                          style={{ color: C.text, borderTop: index === 0 ? "none" : `1px solid ${C.light}` }}
                        >
                          <td className="px-3 py-3">
                            <span
                              className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                              style={{ background: C.light, color: C.medium }}
                            >
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            {lote.productoInfo ? (
                              <div>
                                <span className="font-bold">{lote.productoInfo.nombreGenerico}</span>
                                {lote.productoInfo.nombreComercial && (
                                  <span className="block text-xs font-normal text-gray-500">
                                    {lote.productoInfo.nombreComercial}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs" style={{ color: ERROR_COLOR }}>
                                ID Producto: {lote.idProducto} (Cargando...)
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className="rounded-md border px-2 py-0.5 font-mono text-xs font-semibold"
                              style={{ background: SURFACE, borderColor: C.border, color: C.dark }}
                            >
                              {lote.numeroLote}
                            </span>
                          </td>
                          <td className="px-3 py-3 font-mono text-xs">{lote.codigo}</td>
                          <td className="px-3 py-3 text-center font-bold" style={{ color: C.dark }}>
                            {lote.stock}
                          </td>
                          <td className="px-3 py-3 text-right">
                            Bs {Number(lote.precioCompra).toFixed(2)}
                          </td>
                          <td
                            className="px-3 py-3 text-right"
                            style={{ color: lote.descuento > 0 ? ERROR_COLOR : MUTED }}
                          >
                            {lote.descuento}%
                          </td>
                          <td className="px-3 py-3 text-right font-bold" style={{ color: C.dark }}>
                            Bs {((lote.stock * lote.precioCompra) - (lote.stock * lote.precioCompra * lote.descuento / 100)).toFixed(2)}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleEliminarLote(lote._id)}
                              title="Quitar lote"
                              aria-label="Quitar lote"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
                            >
                              <Icon d={ICONS.trash} className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* ── Resumen + acciones (queda visible abajo mientras haces scroll) ── */}
            <div
              className="rounded-2xl border bg-white p-5 shadow-lg lg:sticky lg:bottom-4 lg:z-10"
              style={{ borderColor: C.border }}
            >
              <div
                className="space-y-1.5 rounded-xl border p-4"
                style={{ background: SURFACE, borderColor: C.border }}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Suma subtotales ítems</span>
                  <span className="font-bold" style={{ color: C.text }}>Bs {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">IVA calculado ({formData.impuesto}%)</span>
                  <span className="font-bold" style={{ color: C.text }}>Bs {ivaCalculado.toFixed(2)}</span>
                </div>
                <div
                  className="flex items-baseline justify-between border-t pt-2.5"
                  style={{ borderColor: C.border }}
                >
                  <span className="text-base font-bold" style={{ color: C.dark }}>Total de compra</span>
                  <span className="text-2xl font-bold" style={{ color: C.dark }}>
                    Bs {total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-col-reverse justify-end gap-3 sm:flex-row">
                <button
                  onClick={onBack}
                  className="rounded-xl border-2 bg-white px-5 py-2.5 text-sm font-bold transition-all hover:bg-purple-50 active:scale-95"
                  style={{ borderColor: C.border, color: C.dark }}
                >
                  Cancelar registro
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={creando}
                  className="flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                  style={{ background: GRADIENT }}
                >
                  {creando ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Icon d={ICONS.check} className="h-4 w-4" />
                      Registrar compra e inventario
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={<Loading />}>
        {showLoteModal && (
          <LotDetalleForm
            isOpen={showLoteModal}
            setIsOpen={setShowLoteModal}
            onConfirm={handleLoteConfirmado}
          />
        )}
      </Suspense>
    </div>
  );
}