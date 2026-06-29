import { lazy, Suspense, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Loading from "../../../../Helpers/Loading";
import { GetProveedorApi } from "../../../../Api/ProveedorApi";
import { GetSucursalApi } from "../../../../Api/SucursalApi";
import { AddCompraApi } from "../../../../Api/CompraLoteApi";
import { GetProductoApi } from "../../../../Api/ProductoApi";
import type { CreateCompraType, ILoteInput } from "../../../../types";

// ─── Lazy: modal de lote (igual patrón que Proveedor.tsx) ────────────────────
const LotDetalleForm = lazy(
  () => import("../../../../Components/CompraLote/LotDetalleForm")
);

// ─── Paleta dark farmacéutica ─────────────────────────────────────────────────
const COLORS = {
  bgBase:        "#F3EBF9", // Fondo claro lila (antes light)
  bgCard:        "#FFFFFF", // Fondo de tarjetas limpio
  bgInput:       "#FFFFFF", // Fondo de inputs limpio
  green:         "#7B3FA0", // El color intermedio/primario pasa a ser el morado vital (antes medium)
  greenDim:      "#F3EBF9", // Fondo suave para badges (antes light)
  textPrimary:   "#4A1A6E", // Texto principal en morado oscuro (antes dark)
  textSecondary: "#7B3FA0", // Texto secundario
  textMuted:     "#9CA3AF", // Gris neutro para placeholders o bordes sutiles (Tailwind gray-400)
  border:        "#D8B4F0", // Bordes lila (antes border)
  borderFocus:   "#4A1A6E", // Foco de inputs en morado oscuro (antes dark)
  required:      "#EF4444", // Rojo estándar de Tailwind para campos obligatorios
};
// ─── Helpers ──────────────────────────────────────────────────────────────────
function FieldLabel({ text, required = false }: { text: string; required?: boolean }) {
  return (
    <label className="block text-xs font-bold tracking-widest uppercase mb-1.5" style={{ color: COLORS.textSecondary }}>
      {text}{required && <span style={{ color: COLORS.required }}> *</span>}
    </label>
  );
}

function DarkInput({
  id, type = "text", placeholder, value, onChange,
}: {
  id?: string; type?: string; placeholder?: string;
  value: string | number; onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      id={id} type={type} value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
      style={{
        backgroundColor: COLORS.bgInput,
        border: `1.5px solid ${focused ? COLORS.borderFocus : COLORS.border}`,
        color: COLORS.textPrimary,
      }}
    />
  );
}

function DarkSelect({
  id, value, onChange, children,
}: {
  id?: string; value: string | number;
  onChange: (v: string) => void; children: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      id={id} value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all appearance-none cursor-pointer"
      style={{
        backgroundColor: COLORS.bgInput,
        border: `1.5px solid ${focused ? COLORS.borderFocus : COLORS.border}`,
        color: value ? COLORS.textPrimary : COLORS.textSecondary,
      }}
    >
      {children}
    </select>
  );
}

// ─── Tipo de fila en la tabla de lotes cargados ───────────────────────────────
type LoteRow = ILoteInput & {
  _id:          number;    // ID temporal para la key de React
  nombreProducto: string;  // Para mostrar en la tabla
};

// ─── Componente principal ─────────────────────────────────────────────────────
export default function NewCompra({ onBack }: { onBack?: () => void }) {
  const queryClient = useQueryClient();

  // ── Estado: Panel izquierdo ───────────────────────────────────────────────
  const [idProveedor,     setIdProveedor]     = useState("");
  const [numeroFactura,   setNumeroFactura]   = useState("");
  const [idSucursal,      setIdSucursal]      = useState("");
  const [fechaEntrega,    setFechaEntrega]    = useState(
    new Date().toISOString().split("T")[0]
  );
  const [observaciones,   setObservaciones]   = useState("");
  const [descuentoGlobal, setDescuentoGlobal] = useState("0");
  const [impuesto,        setImpuesto]        = useState("13");

  // ── Estado: lotes acumulados ──────────────────────────────────────────────
  const [lotes, setLotes] = useState<LoteRow[]>([]);

  // ── Estado: control del modal LotDetalleForm ──────────────────────────────
  // Patrón idéntico a Proveedor.tsx: useState + Suspense + lazy
  const [showLoteModal, setShowLoteModal] = useState(false);

  // ── Queries ───────────────────────────────────────────────────────────────
  const { data: proveedores, isLoading: loadingProv } = useQuery({
    queryKey: ["ProveedorAll"],
    queryFn:  GetProveedorApi,
  });

  const { data: sucursales, isLoading: loadingSuc } = useQuery({
    queryKey: ["SucursalAll"],
    queryFn:  GetSucursalApi,
  });

  // Traemos los productos también a NewCompra para cruzar los nombres
const { data: productos = [] } = useQuery({
  queryKey: ["ProductoAll"],
  queryFn: GetProductoApi,
});

  // ── Totales reactivos ─────────────────────────────────────────────────────
  const { subtotal, ivaCalculado, total } = useMemo(() => {
    // Subtotal = suma de (precioCompra * stock) menos descuento por lote (%)
    const sub = lotes.reduce((acc, l) => {
      const bruto = l.precioCompra * l.stock;
      return acc + bruto - (bruto * l.descuento) / 100;
    }, 0);

    const descPct    = parseFloat(descuentoGlobal) || 0;
    const subConDesc = sub - (sub * descPct) / 100;
    const ivaPct     = parseFloat(impuesto) || 0;
    const iva        = subConDesc * ivaPct / 100;

    return { subtotal: subConDesc, ivaCalculado: iva, total: subConDesc + iva };
  }, [lotes, descuentoGlobal, impuesto]);

  // ── Mutación: crear compra ────────────────────────────────────────────────
  const { mutate: crearCompra, isPending: creando } = useMutation({
    mutationFn: AddCompraApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ComprasAll"] });
      queryClient.invalidateQueries({ queryKey: ["ComprasEstadisticas"] });
      toast.success(data?.message ?? "Compra registrada exitosamente");
      onBack?.();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // ── Callback: recibe un lote del modal y lo agrega a la lista ─────────────
  // Esta función se pasa como prop al modal LotDetalleForm
  const handleLoteConfirmado = (lote: ILoteInput) => {
    // Buscar nombre del producto en las queries cacheadas para mostrarlo en tabla
    const producto = (window as any).__productosCache?.find(
      (p: any) => p.idProducto === lote.idProducto
    );
    const nombreProducto = producto?.nombreGenerico ?? `Producto #${lote.idProducto}`;

    setLotes((prev) => [
      ...prev,
      { ...lote, _id: Date.now(), nombreProducto },
    ]);
    toast.success("Lote agregado a la compra");
  };

  // ── Eliminar lote ─────────────────────────────────────────────────────────
  const handleEliminarLote = (_id: number) => {
    setLotes((prev) => prev.filter((l) => l._id !== _id));
  };

  // ── Submit final ──────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!idProveedor) { toast.error("Selecciona un proveedor"); return; }
    if (!idSucursal)  { toast.error("Selecciona una sucursal de destino"); return; }
    if (lotes.length === 0) { toast.error("Agrega al menos un medicamento/lote"); return; }

    const payload: CreateCompraType = {
      idProveedor:   parseInt(idProveedor),
      idSucursal:    parseInt(idSucursal),
      numeroFactura: numeroFactura || undefined,
      fechaEntrega:  fechaEntrega  || undefined,
      observaciones: observaciones || undefined,
      descuento:     parseFloat(descuentoGlobal) || 0,
      impuesto:      parseFloat(impuesto) || 0,
      subtotal,
      total,
      lotes: lotes.map(({ _id, nombreProducto, ...rest }) => rest), // strip campos UI
    };

    crearCompra(payload);
  };

  if (loadingProv || loadingSuc) return <Loading />;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-6" style={{color: COLORS.textPrimary }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3" style={{ color: COLORS.textPrimary }}>
            <span
              className="w-1.5 h-8 rounded-full flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${COLORS.green}, #00A37A)` }}
            />
            <span>
              Gestión Farmacéutica
              <span
                className="ml-3 text-xs font-bold px-2.5 py-1 rounded-lg align-middle"
                style={{ backgroundColor: COLORS.greenDim, color: COLORS.green }}
              >
                Control de Inventario
              </span>
            </span>
          </h1>
          <p className="text-sm mt-1 ml-5" style={{ color: COLORS.textSecondary }}>
            Módulo de Liquidación de Compras y Control Sanitario de Lotes
          </p>
        </div>

        
      </div>

      {/* ── LAYOUT 2 COLUMNAS ─────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* ══════════════════════════════════════════════════════════════════
            PANEL IZQUIERDO — 1. Datos Generales
        ══════════════════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-[310px] flex-shrink-0 flex flex-col gap-4">

          {/* Tarjeta: Datos Generales */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: COLORS.bgCard, border: `1px solid ${COLORS.border}` }}
          >
            {/* Encabezado de tarjeta */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: COLORS.greenDim }}
                >
                  <svg className="w-4 h-4" style={{ color: COLORS.green }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="font-bold text-sm" style={{ color: COLORS.textPrimary }}>
                  1. Datos Generales de la Compra
                </span>
              </div>
              <button
                onClick={onBack}
                className="text-xs font-semibold transition-colors hover:underline"
                style={{ color: COLORS.green }}
              >
                Volver a la Lista
              </button>
            </div>

            {/* Proveedor */}
            <div className="mb-4">
              <FieldLabel text="Proveedor de Medicamentos" required />
              <div className="relative">
                <DarkSelect id="idProveedor" value={idProveedor} onChange={setIdProveedor}>
                  <option value="">Seleccione el proveedor...</option>
                  {(Array.isArray(proveedores) ? proveedores : []).map((p: any) => (
                    <option key={p.idProveedor} value={p.idProveedor}>{p.nombre}</option>
                  ))}
                </DarkSelect>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.textMuted }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Número de Factura */}
            <div className="mb-4">
              <FieldLabel text="Número de Factura / Control" />
              <DarkInput
                id="numeroFactura"
                placeholder="Ejem: FAC-45892"
                value={numeroFactura}
                onChange={setNumeroFactura}
              />
            </div>

            {/* Sucursal + Fecha */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <FieldLabel text="Sucursal Destino" required />
                <div className="relative">
                  <DarkSelect id="idSucursal" value={idSucursal} onChange={setIdSucursal}>
                    <option value="">Seleccione...</option>
                    {(Array.isArray(sucursales) ? sucursales : []).map((s: any) => (
                      <option key={s.idSucursal} value={s.idSucursal}>{s.nombre}</option>
                    ))}
                  </DarkSelect>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.textMuted }}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <FieldLabel text="Fecha de Entrega" />
                <DarkInput
                  id="fechaEntrega"
                  type="date"
                  value={fechaEntrega}
                  onChange={setFechaEntrega}
                />
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <FieldLabel text="Observaciones Sanitarias / Recepción" />
              <textarea
                rows={3}
                placeholder="Ej: Cajas con control térmico intacto..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all resize-none"
                style={{
                  backgroundColor: COLORS.bgInput,
                  border: `1.5px solid ${COLORS.border}`,
                  color: COLORS.textPrimary,
                }}
              />
            </div>
          </div>

          {/* Tarjeta: Impuestos y Descuentos */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: COLORS.bgCard, border: `1px solid ${COLORS.border}` }}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#F0B42922" }}
              >
                <svg className="w-4 h-4" style={{ color: "#F0B429" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-bold text-sm" style={{ color: COLORS.textPrimary }}>
                Impuestos y Descuentos Generales
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel text="Descuento Global (%)" />
                <div className="relative">
                  <DarkInput
                    id="descuentoGlobal"
                    type="number"
                    value={descuentoGlobal}
                    onChange={setDescuentoGlobal}
                    placeholder="0"
                  />
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold pointer-events-none"
                    style={{ color: COLORS.textMuted }}
                  >%</span>
                </div>
              </div>
              <div>
                <FieldLabel text="Impuesto IVA (%)" />
                <div className="relative">
                  <DarkInput
                    id="impuesto"
                    type="number"
                    value={impuesto}
                    onChange={setImpuesto}
                    placeholder="13"
                  />
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold pointer-events-none"
                    style={{ color: COLORS.textMuted }}
                  >%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            PANEL DERECHO — 2. Productos y Lotes Cargados
        ══════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: COLORS.bgCard, border: `1px solid ${COLORS.border}` }}
          >
            {/* Cabecera panel derecho */}
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: COLORS.greenDim }}
                >
                  <svg className="w-4 h-4" style={{ color: COLORS.green }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: COLORS.textPrimary }}>
                    2. Productos y Lotes Cargados
                  </p>
                  <p className="text-xs" style={{ color: COLORS.textSecondary }}>
                    Cada medicamento debe contar con su correspondiente lote técnico
                  </p>
                </div>
              </div>

              {/* ── Botón Agregar Medicamento — abre LotDetalleForm ── */}
              <button
                onClick={() => setShowLoteModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110 active:scale-95 flex-shrink-0"
                style={{ backgroundColor: COLORS.green, color: "#0D1117" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Medicamento
              </button>
            </div>

            {/* ── Área de lotes ──────────────────────────────────────────── */}
            {lotes.length === 0 ? (
              // Estado vacío
              <div
                className="mt-4 rounded-2xl flex flex-col items-center justify-center py-14 gap-3"
                style={{ border: `2px dashed ${COLORS.border}`, backgroundColor: `${COLORS.bgBase}66` }}
              >
                <svg className="w-10 h-10" style={{ color: COLORS.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                  No se han añadido lotes de productos a esta compra
                </p>
                <button
                  onClick={() => setShowLoteModal(true)}
                  className="text-sm font-bold transition-colors hover:underline"
                  style={{ color: COLORS.green }}
                >
                  + Cargar Producto Ahora
                </button>
              </div>
            ) : (
              // Tabla de lotes
              <div className="mt-4 overflow-x-auto rounded-xl" style={{ border: `1px solid ${COLORS.border}` }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: `${COLORS.bgBase}88` }}>
                      {["#", "Producto", "Cód. Lote", "Nro. Lote", "Stock", "Precio", "Desc. %", "Sub. Total", "Acciones"].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2.5 text-left font-bold tracking-wider"
                          style={{ color: COLORS.textSecondary }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lotes.map((lote, index) => {
                        // BUSCAMOS EL PRODUCTO CORRESPONDIENTE EN EL ARRAY EN BASE AL ID
                        const productoInfo = Array.isArray(productos) 
                            ? productos.find((p: any) => p.idProducto === lote.idProducto)
                            : null;
                        return (
                            <tr key={index} className="border-b" style={{ borderColor: COLORS.border }}>
                            <td className="px-4 py-3 text-sm font-medium" style={{ color: COLORS.textPrimary }}>{index + 1 }</td>
                            {/* CELDA DEL PRODUCTO REPARADA */}
                            <td className="px-4 py-3 text-sm font-medium" style={{ color: COLORS.textPrimary }}>
                                {productoInfo ? (
                                <div>
                                    <span className="font-bold">{productoInfo.nombreGenerico}</span>
                                    {productoInfo.nombreComercial && (
                                    <span className="text-xs block text-gray-500 font-normal">
                                        {productoInfo.nombreComercial}
                                    </span>
                                    )}
                                </div>
                                ) : (
                                <span className="text-xs text-red-400">ID Producto: {lote.idProducto} (Cargando...)</span>
                                )}
                            </td>

                            <td className="px-4 py-3 text-sm" style={{ color: COLORS.textPrimary }}>
                                <span className="px-2 py-0.5 rounded text-xs font-mono bg-gray-100 border">
                                {lote.numeroLote}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-mono" style={{ color: COLORS.textPrimary }}>
                                {lote.codigo}
                            </td>
                            <td className="px-4 py-3 text-sm text-center font-bold" style={{ color: COLORS.textPrimary }}>
                                {lote.stock}
                            </td>
                            <td className="px-4 py-3 text-sm text-right" style={{ color: COLORS.textPrimary }}>
                                Bs. {Number(lote.precioCompra).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-red-500">
                                {lote.descuento}%
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-bold" style={{ color: COLORS.textPrimary }}>
                                Bs. {((lote.stock * lote.precioCompra) - (lote.stock * lote.precioCompra * lote.descuento / 100)).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm text-center">
                                <button
                                type="button"
                                onClick={() => {
                                    // Tu lógica existente para eliminar el lote del array local
                                    setLotes(lotes.filter((_, i) => i !== index));
                                }}
                                className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                </button>
                            </td>
                            </tr>
                        );
                        })}
                    </tbody>
                </table>
              </div>
            )}

            {/* ── Totales ────────────────────────────────────────────────── */}
            <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${COLORS.border}` }}>
              <div className="flex justify-between items-center py-1.5 text-sm">
                <span style={{ color: COLORS.textSecondary }}>Suma Subtotales Ítems</span>
                <span className="font-bold" style={{ color: COLORS.textPrimary }}>Bs {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 text-sm">
                <span style={{ color: COLORS.textSecondary }}>IVA Calculado ({impuesto}%)</span>
                <span className="font-bold" style={{ color: COLORS.textPrimary }}>Bs {ivaCalculado.toFixed(2)}</span>
              </div>
              <div
                className="flex justify-between items-center mt-3 pt-3"
                style={{ borderTop: `1px solid ${COLORS.border}` }}
              >
                <span className="text-base font-extrabold tracking-wide" style={{ color: COLORS.textPrimary }}>
                  TOTAL DE COMPRA
                </span>
                <span className="text-2xl font-extrabold" style={{ color: COLORS.green }}>
                  Bs {total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* ── Botones de acción ──────────────────────────────────────── */}
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={onBack}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
                style={{ border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, backgroundColor: "transparent" }}
              >
                Cancelar Registro
              </button>
              <button
                onClick={handleSubmit}
                disabled={creando}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
                style={{ backgroundColor: COLORS.green, color: "#0D1117" }}
              >
                {creando ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Registrando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Registrar Compra e Inventario
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: LotDetalleForm
          Patrón idéntico a Proveedor.tsx: Suspense + lazy + estado isOpen
      ══════════════════════════════════════════════════════════════════════ */}
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