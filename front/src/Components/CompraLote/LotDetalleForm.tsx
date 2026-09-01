import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { GetProductoApi } from "../../Api/ProductoApi";
import type { ILoteInput } from "../../types";

type Props = Readonly<{
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onConfirm: (lote: ILoteInput) => void;
}>;

// ─── Interfaces y Tipos ──────────────────────────────────────────────────────
interface IProducto {
  idProducto: number;
  nombreGenerico: string;
  codigoBarra: string;
  nombreComercial: string | null;
  concentracion: string | null;
  precio: number;
}

type LoteFormValues = {
  idProducto: number;
  searchProduct: string;
  codigo: string;
  numeroLote: string;
  stock: number;
  precioCompra: number;
  descuento: number;
  fechaVencimiento: string;
  fechaFabricacion: string;
};

// ─── Paleta de Colores ───────────────────────────────────────────────────────
const COLORS = {
  bgBase: "#F3EBF9",
  bgCard: "#FFFFFF",
  bgInput: "#FFFFFF",
  purple: "#7B3FA0",
  purpleDark: "#4A1A6E",
  purpleDim: "#F3EBF9",
  textPrimary: "#2D0A47",
  textSecondary: "#7B3FA0",
  textMuted: "#9A7FA8",
  border: "#D8B4F0",
  borderFocus: "#7B3FA0",
  required: "#EF4444",
};

// ─── Clases y Estilos Compartidos (DRY) ──────────────────────────────────────
const INPUT_CLASSES = "w-full px-4 py-2.5 rounded-xl text-sm outline-none border-2 focus:border-purple-600 transition-all focus:ring-4 focus:ring-purple-100";
const INPUT_STYLES = { borderColor: COLORS.border, color: COLORS.textPrimary, backgroundColor: COLORS.bgInput };

// ─── Subcomponentes ──────────────────────────────────────────────────────────
function FieldLabel({ text, required = false }: { text: string; required?: boolean }) {
  return (
    <label className="block text-xs font-bold tracking-widest uppercase mb-1.5" style={{ color: COLORS.purpleDark }}>
      {text} {required && <span style={{ color: COLORS.required }}>*</span>}
    </label>
  );
}

function SectionTitle({ step, title, required }: { step: number; title: string; required?: boolean }) {
  return (
    <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: COLORS.textSecondary }}>
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold mr-1.5" style={{ backgroundColor: COLORS.purpleDim, color: COLORS.purple }}>
        {step}
      </span>
      {title} {required && <span style={{ color: COLORS.required }}>*</span>}
    </p>
  );
}

// ─── Componente Principal ────────────────────────────────────────────────────
export default function LotDetalleForm({ isOpen, setIsOpen, onConfirm }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
  } = useForm<LoteFormValues>({
    defaultValues: {
      idProducto: 0,
      searchProduct: "",
      codigo: "",
      numeroLote: "",
      stock: 1,
      precioCompra: 0,
      descuento: 0,
      fechaVencimiento: "",
      fechaFabricacion: "",
    },
  });

  const searchValues = watch("searchProduct");
  const stockValue = watch("stock");
  const precioCompraValue = watch("precioCompra");
  const descuentoValue = watch("descuento");

  const [selectedProduct, setSelectedProduct] = useState<IProducto | null>(null);

  const { data: productos = [] } = useQuery({
    queryKey: ["ProductoAll"],
    queryFn: GetProductoApi,
    enabled: isOpen,
  });

  // Memoización para evitar filtrados repetitivos en cada render
  const filteredProductos = useMemo(() => {
    if (!searchValues || !Array.isArray(productos)) return [];
    const q = searchValues.toLowerCase();
    return productos.filter((p: IProducto) =>
      p.nombreGenerico?.toLowerCase().includes(q) ||
      p.codigoBarra?.toLowerCase().includes(q) ||
      p.nombreComercial?.toLowerCase().includes(q)
    );
  }, [productos, searchValues]);

  // Cálculo seguro casteando a Number
  const subtotal = useMemo(() => {
    const bruto = (Number(stockValue) || 0) * (Number(precioCompraValue) || 0);
    const desc = Number(descuentoValue) || 0;
    return bruto - (bruto * desc) / 100;
  }, [stockValue, precioCompraValue, descuentoValue]);

  useEffect(() => {
    if (!isOpen) {
      reset();
      setSelectedProduct(null);
    }
  }, [isOpen, reset]);

  const onError = (formErrors: FieldErrors<LoteFormValues>) => {
    const firstError = Object.values(formErrors)[0];
    if (firstError?.message) {
      toast.error(firstError.message as string);
    }
  };

  const onSubmit = (data: LoteFormValues) => {
    if (!data.idProducto) {
      return toast.error("Debe seleccionar un producto");
    }

    onConfirm({
      idProducto: Number(data.idProducto),
      codigo: data.codigo.trim(),
      numeroLote: data.numeroLote.trim(),
      stock: Number(data.stock),
      precioCompra: Number(data.precioCompra),
      descuento: Number(data.descuento),
      fechaVencimiento: data.fechaVencimiento,
      fechaFabricacion: data.fechaFabricacion || null,
    });
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl z-10 border"
        style={{ backgroundColor: COLORS.bgCard, borderColor: COLORS.border }}
      >
        {/* HEADER */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: COLORS.border, background: `linear-gradient(135deg, ${COLORS.purpleDark}, ${COLORS.purple})` }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/20 shadow-inner">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Registrar Lote de Ingreso</h2>
              <p className="text-[11px] text-purple-200">Selecciona el medicamento e introduce las características físicas.</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg transition-colors hover:bg-white/10 text-purple-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <div className="px-6 py-5 overflow-y-auto max-h-[70vh] space-y-6 bg-white">
            
            {/* SECCIÓN 1: BUSCADOR */}
            <div>
              <SectionTitle step={1} title="Buscar / Seleccionar Producto" required />

              {!selectedProduct ? (
                <div className="relative mb-2">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.textMuted }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Escriba código de barra o nombre del fármaco..."
                    {...register("searchProduct")}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-4 focus:ring-purple-100"
                    style={{
                      backgroundColor: COLORS.bgInput,
                      border: `2px solid ${searchValues ? COLORS.borderFocus : COLORS.border}`,
                      color: COLORS.textPrimary,
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 rounded-xl border" style={{ backgroundColor: "#FDFAFA", borderColor: COLORS.purple }}>
                  <div>
                    <p className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>
                      {selectedProduct.nombreGenerico}
                      {selectedProduct.nombreComercial && <span className="font-normal ml-1" style={{ color: COLORS.purple }}>· {selectedProduct.nombreComercial}</span>}
                    </p>
                    <p className="text-[11px]" style={{ color: COLORS.textMuted }}>
                      Cód. barra: {selectedProduct.codigoBarra} {selectedProduct.concentracion && ` · ${selectedProduct.concentracion}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedProduct(null); setValue("idProducto", 0); }}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ml-3 flex-shrink-0 hover:bg-gray-50"
                    style={{ border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary }}
                  >
                    Cambiar
                  </button>
                </div>
              )}

              {searchValues?.length > 0 && !selectedProduct && (
                <div className="rounded-xl overflow-hidden border bg-white" style={{ borderColor: COLORS.border }}>
                  {filteredProductos.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-center" style={{ color: COLORS.textMuted }}>Sin resultados para &quot;{searchValues}&quot;</div>
                  ) : (
                    <ul className="divide-y max-h-44 overflow-y-auto" style={{ borderColor: COLORS.border }}>
                      {filteredProductos.map((p: IProducto) => (
                        <li
                          key={p.idProducto}
                          onClick={() => {
                            setSelectedProduct(p);
                            setValue("idProducto", p.idProducto);
                            setValue("searchProduct", "");
                          }}
                          className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-purple-50 transition-colors"
                          style={{ color: COLORS.textPrimary }}
                        >
                          <div>
                            <p className="text-sm font-semibold">{p.nombreGenerico} {p.nombreComercial && <span className="font-normal ml-1" style={{ color: COLORS.purple }}>· {p.nombreComercial}</span>}</p>
                            <p className="text-[11px]" style={{ color: COLORS.textMuted }}>Cód. barra: {p.codigoBarra} {p.concentracion && ` · ${p.concentracion}`}</p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 flex-shrink-0" style={{ backgroundColor: COLORS.purpleDim, color: COLORS.purple }}>
                            P.Ref. Bs.{Number(p.precio).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* SECCIÓN 2: ATRIBUTOS */}
            <div>
              <SectionTitle step={2} title="Atributos de Lote e Inventario" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel text="Número de Lote" required />
                  <input
                    type="text"
                    placeholder="Ej: L-8892-01"
                    {...register("numeroLote", { required: "El número de lote es obligatorio" })}
                    className={INPUT_CLASSES}
                    style={INPUT_STYLES}
                  />
                </div>
                <div>
                  <FieldLabel text="Código de Lote Único" required />
                  <input
                    type="text"
                    placeholder="LT-749946"
                    {...register("codigo", { required: "El código de lote es obligatorio" })}
                    className={INPUT_CLASSES}
                    style={INPUT_STYLES}
                  />
                  <p className="text-[10px] mt-1" style={{ color: COLORS.textMuted }}>Código único de referencia.</p>
                </div>
                <div>
                  <FieldLabel text="Fecha de Fabricación" />
                  <input
                    type="date"
                    {...register("fechaFabricacion")}
                    className={INPUT_CLASSES}
                    style={INPUT_STYLES}
                  />
                </div>
                <div>
                  <FieldLabel text="Fecha de Vencimiento" required />
                  <input
                    type="date"
                    {...register("fechaVencimiento", { required: "La fecha de vencimiento es obligatoria" })}
                    className={INPUT_CLASSES}
                    style={INPUT_STYLES}
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: COSTOS */}
            <div>
              <SectionTitle step={3} title="Transacción y Costos" />
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <FieldLabel text="Cantidad Recibida" required />
                  <input
                    type="number"
                    min={1}
                    {...register("stock", { required: "La cantidad es obligatoria", min: { value: 1, message: "La cantidad debe ser mayor a 0" } })}
                    className={INPUT_CLASSES}
                    style={INPUT_STYLES}
                  />
                </div>
                <div>
                  <FieldLabel text="Precio Compra Unit." required />
                  <input
                    type="number"
                    step="0.01"
                    {...register("precioCompra", { required: "El precio es obligatorio", min: { value: 0.01, message: "El precio debe ser mayor a 0" } })}
                    className={INPUT_CLASSES}
                    style={INPUT_STYLES}
                  />
                </div>
                <div>
                  <FieldLabel text="Descuento Unit. (%)" />
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={100}
                    {...register("descuento", { min: 0, max: 100 })}
                    className={INPUT_CLASSES}
                    style={INPUT_STYLES}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between px-4 py-3 rounded-xl border" style={{ backgroundColor: COLORS.bgBase, borderColor: COLORS.border }}>
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: COLORS.purpleDark }}>Subtotal Calculado:</span>
                <span className="text-lg font-extrabold" style={{ color: COLORS.purpleDark }}>Bs {subtotal.toFixed(2)}</span>
              </div>
            </div>

            {/* NOTA INFORMATIVA */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl border" style={{ backgroundColor: "#FAFAFF", borderColor: COLORS.border }}>
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: COLORS.purple }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs leading-relaxed" style={{ color: COLORS.textPrimary }}>
                El <strong>Código de Lote Único</strong> debe ser irrepetible en el sistema. El <strong>descuento</strong> se aplica en % sobre el precio unitario.
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50" style={{ borderColor: COLORS.border }}>
            <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-all">
              Cancelar
            </button>
            <button type="submit" className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-95" style={{ backgroundColor: COLORS.purpleDark }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Confirmar y Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}