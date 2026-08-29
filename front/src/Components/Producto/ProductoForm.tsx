import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import BarcodeRenderer from "../../lib/BarcodeRenderer";
import { AddProductoApi, GetProductoApi } from "../../Api/ProductoApi";
import { GetLaboratorioApi } from "../../Api/LaboratorioApi";
import { GetTipoProdApi } from "../../Api/TipoProdApi";
import { GetPresentaApi } from "../../Api/PresentacionApi";
import ErrorMessage from "../Error/ErrorMessage";
import type { CreateProducto } from "../../types";

// ─── Props ───────────────────────────────────────────────────────────────────
type Props = Readonly<{
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
}>;

// ─── Interfaces de Catálogos ─────────────────────────────────────────────────
interface ILaboratorio { idLaboratorio: number; nombre: string; }
interface ITipoProducto { idTipoProd: number; nombre: string; }
interface IPresentacion { idPresentacion: number; nombre: string; }

// ─── Paleta (idéntica a Proveedor / ProveedorForm) ───────────────────────────
const C = {
  dark: "#4A1A6E",
  medium: "#7B3FA0",
  light: "#F3EBF9",
  border: "#D8B4F0",
  text: "#2D0A47",
};

const LS_KEY = "ProductoFormDraft";

// ─── Helper: arma un FormData desde los valores del form + archivo ────────────
function buildFormData(values: CreateProducto, file?: File | null): FormData {
  const fd = new FormData();
  (Object.keys(values) as (keyof CreateProducto)[]).forEach((k) => {
    if (k === "img") return;
    const v = values[k];
    if (v !== null && v !== undefined) fd.append(k, String(v));
  });
  if (file) fd.append("img", file);
  return fd;
}

// ── Input field helper ────────────────────────────────────────────────────
const Field = ({
  id, label, required, optional, children,
}: {
  id: string; label: string; required?: boolean; optional?: boolean; children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider" style={{ color: C.dark }}>
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
      {optional && <span className="ml-1 text-gray-400 font-normal normal-case text-xs">(opcional)</span>}
    </label>
    {children}
  </div>
);

// ── Select field reutilizable (DRY) ───────────────────────────────────────
interface SelectFieldProps {
  id: string;
  label: string;
  options: { value: number; label: string }[];
  placeholder: string;
  error?: string;
  registration: UseFormRegisterReturn;
}

const SelectField = ({ id, label, options, placeholder, error, registration }: SelectFieldProps) => (
  <Field id={id} label={label} required>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      </div>
      <select
        id={id}
        className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium appearance-none bg-white"
        style={{ borderColor: C.border, color: C.text }}
        {...registration}
      >
        <option value="0">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
    {error && <ErrorMessage>{error}</ErrorMessage>}
  </Field>
);

export default function ProductoForm({ setIsOpen, isOpen }: Props) {
  const queryClient = useQueryClient();

  // ── Estado de preview de imagen ──────────────────────────────────────────
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // ── react-hook-form ───────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateProducto>({
    defaultValues: {
      codigoBarra: "",
      nombreGenerico: "",
      nombreComercial: "",
      concentracion: "",
      descripcion: "",
      precio: 0,
      requiereReceta: 0,
      contraindicaciones: "",
      viaAdministracion: "",
      stockMinimo: 0,
      idLaboratorio: 0,
      idTipoProd: 0,
      idPresentacion: 0,
    },
  });

  // ── Recuperar borrador ─────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      try { reset(JSON.parse(saved)); } catch { localStorage.removeItem(LS_KEY); }
    }
  }, [reset]);

  // ── Persistir borrador mientras está abierto ───────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const { unsubscribe } = watch((values) =>
      localStorage.setItem(LS_KEY, JSON.stringify(values))
    );
    return unsubscribe;
  }, [watch, isOpen]);

  // ── Queries para los selects relacionados ─────────────────────────────────
  const { data: laboratorios = [] } = useQuery<ILaboratorio[] | undefined>({
    queryKey: ["LaboratorioAll"],
    queryFn: GetLaboratorioApi,
  });
  const { data: tiposProducto = [] } = useQuery<ITipoProducto[] | undefined>({
    queryKey: ["TipoProdAll"],
    queryFn: GetTipoProdApi,
  });
  const { data: presentaciones = [] } = useQuery<IPresentacion[] | undefined>({
    queryKey: ["PresentacionAll"],
    queryFn: GetPresentaApi,
  });

  // ── Productos existentes (para validar código de barra único) ──────────────
  const { data: productos = [] } = useQuery({
    queryKey: ["ProductoAll"],
    queryFn: GetProductoApi,
  });

  // ── Mutación ───────────────────────────────────────────────────────────────
  const { mutate, isPending } = useMutation({
    mutationFn: AddProductoApi,
    onError: (error: Error) => toast.error(error.message),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["ProductoAll"] });
      toast.success(result?.message ?? "Producto registrado correctamente");
      handleCleanUp();
    },
  });

  const handleForm = (values: CreateProducto) => {
    const file = fileRef.current?.files?.[0] ?? null;

    const codigo = String(values.codigoBarra ?? "").trim();
    const yaExiste = productos.some((p) => String(p.codigoBarra).trim() === codigo);
    if (yaExiste) {
      toast.warning("El código de barra ya está registrado");
      return;
    }

    mutate(buildFormData(values, file));
  };

  const handleCleanUp = () => {
    if (imgPreview) {
      URL.revokeObjectURL(imgPreview);
    }
    localStorage.removeItem(LS_KEY);
    reset();
    setImgPreview(null);
    setIsOpen(false);
  };

  // Mapeos limpios de los catálogos para el subcomponente DRY
  const labOptions = useMemo(() => laboratorios.map(l => ({ value: l.idLaboratorio, label: l.nombre })), [laboratorios]);
  const tipoOptions = useMemo(() => tiposProducto.map(t => ({ value: t.idTipoProd, label: t.nombre })), [tiposProducto]);
  const presentaOptions = useMemo(() => presentaciones.map(p => ({ value: p.idPresentacion, label: p.nombre })), [presentaciones]);

  return (
    <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={handleCleanUp} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="prod-modal-title"
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border overflow-hidden"
        style={{ borderColor: C.border }}
      >
        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <div
          className="px-6 py-5 border-b"
          style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)", borderColor: "#5C2680" }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h2 id="prod-modal-title" className="text-xl font-bold text-white tracking-tight">
                  Nuevo Producto
                </h2>
                <p className="text-xs text-purple-200 mt-0.5">Registra un nuevo producto farmacéutico</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCleanUp}
              className="p-2 px-4 flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/25 transition-colors text-white text-sm font-semibold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cerrar
            </button>
          </div>
        </div>

        {/* ── BODY ───────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit(handleForm)}>
          <div className="px-6 py-6 overflow-y-auto max-h-[65vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* ── Código de barra + preview JsBarcode ────────────────────── */}
              <div className="md:col-span-2">
                <Field id="codigoBarra" label="Código de Barra" required>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <input
                      id="codigoBarra"
                      type="text"
                      placeholder="Ej: 7501234567890"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                      style={{ borderColor: C.border, color: C.text }}
                      {...register("codigoBarra", { required: "El código de barra es obligatorio" })}
                    />
                  </div>
                  {errors.codigoBarra && <ErrorMessage>{errors.codigoBarra.message}</ErrorMessage>}
                </Field>
                {watch("codigoBarra") && (
                  <div className="mt-2 flex flex-col items-center p-2.5 bg-purple-50/50 rounded-xl border border-dashed border-purple-200">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-purple-700 mb-1">Vista Previa del Código</span>
                    <BarcodeRenderer value={watch("codigoBarra")} width={1.8} height={40} enableDownload={true} />
                  </div>
                )}
              </div>

              {/* ── Nombre Genérico ──────────────────────────────────────── */}
              <Field id="nombreGenerico" label="Nombre Genérico" required>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <input
                    id="nombreGenerico"
                    type="text"
                    placeholder="Ej: Paracetamol"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                    style={{ borderColor: C.border, color: C.text }}
                    {...register("nombreGenerico", {
                      required: "El nombre genérico es obligatorio",
                      minLength: { value: 2, message: "Mínimo 2 caracteres" },
                    })}
                  />
                </div>
                {errors.nombreGenerico && <ErrorMessage>{errors.nombreGenerico.message}</ErrorMessage>}
              </Field>

              {/* ── Nombre Comercial ─────────────────────────────────────── */}
              <Field id="nombreComercial" label="Nombre Comercial" optional>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <input
                    id="nombreComercial"
                    type="text"
                    placeholder="Ej: Tylenol, Panadol..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                    style={{ borderColor: C.border, color: C.text }}
                    {...register("nombreComercial")}
                  />
                </div>
              </Field>

              {/* ── Concentración ────────────────────────────────────────── */}
              <Field id="concentracion" label="Concentración" optional>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <input
                    id="concentracion"
                    type="text"
                    placeholder="Ej: 500 mg, 250mg/5ml..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                    style={{ borderColor: C.border, color: C.text }}
                    {...register("concentracion")}
                  />
                </div>
              </Field>

              {/* ── Precio ───────────────────────────────────────────────── */}
              <Field id="precio" label="Precio (Bs.)" required>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 font-bold text-sm pointer-events-none">
                    Bs.
                  </span>
                  <input
                    id="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                    style={{ borderColor: C.border, color: C.text }}
                    {...register("precio", {
                      required: "El precio es obligatorio",
                      min: { value: 0, message: "El precio debe ser mayor o igual a 0" },
                    })}
                  />
                </div>
                {errors.precio && <ErrorMessage>{errors.precio.message}</ErrorMessage>}
              </Field>

              {/* ── Stock Mínimo ─────────────────────────────────────────── */}
              <Field id="stockMinimo" label="Stock Mínimo" required>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <input
                    id="stockMinimo"
                    type="number"
                    min="0"
                    placeholder="Ej: 10"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                    style={{ borderColor: C.border, color: C.text }}
                    {...register("stockMinimo", {
                      required: "El stock mínimo es obligatorio",
                      min: { value: 0, message: "Debe ser mayor o igual a 0" },
                    })}
                  />
                </div>
                {errors.stockMinimo && <ErrorMessage>{errors.stockMinimo.message}</ErrorMessage>}
              </Field>

              {/* ── Vía de Administración ─────────────────────────────────── */}
              <Field id="viaAdministracion" label="Vía de Administración" optional>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <input
                    id="viaAdministracion"
                    type="text"
                    placeholder="Ej: Oral, Tópica, Intravenosa..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                    style={{ borderColor: C.border, color: C.text }}
                    {...register("viaAdministracion")}
                  />
                </div>
              </Field>

              {/* ── Requiere Receta ──────────────────────────────────────── */}
              <Field id="requiereReceta" label="¿Requiere Receta?" required>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <select
                    id="requiereReceta"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium appearance-none bg-white"
                    style={{ borderColor: C.border, color: C.text }}
                    {...register("requiereReceta", { required: "Seleccione una opción" })}
                  >
                    <option value="">-- Seleccione --</option>
                    <option value="0">No requiere receta</option>
                    <option value="1">Sí requiere receta</option>
                  </select>
                </div>
                {errors.requiereReceta && <ErrorMessage>{errors.requiereReceta.message}</ErrorMessage>}
              </Field>

              {/* ── Catálogos Abstraídos (DRY) ────────────────────────────── */}
              <SelectField
                id="idLaboratorio"
                label="Laboratorio"
                placeholder="-- Seleccione un laboratorio --"
                options={labOptions}
                error={errors.idLaboratorio?.message}
                registration={register("idLaboratorio", {
                  required: "Seleccione un laboratorio",
                  validate: (v) => Number(v) > 0 || "Seleccione un laboratorio",
                })}
              />

              <SelectField
                id="idTipoProd"
                label="Tipo de Producto"
                placeholder="-- Seleccione un tipo --"
                options={tipoOptions}
                error={errors.idTipoProd?.message}
                registration={register("idTipoProd", {
                  required: "Seleccione un tipo",
                  validate: (v) => Number(v) > 0 || "Seleccione un tipo de producto",
                })}
              />

              <SelectField
                id="idPresentacion"
                label="Presentación"
                placeholder="-- Seleccione presentación --"
                options={presentaOptions}
                error={errors.idPresentacion?.message}
                registration={register("idPresentacion", {
                  required: "Seleccione una presentación",
                  validate: (v) => Number(v) > 0 || "Seleccione una presentación",
                })}
              />

              {/* ── Descripción ─────────────────────────────────────────── */}
              <div className="space-y-1.5 md:col-span-2">
                <label htmlFor="descripcion" className="block text-xs font-bold uppercase tracking-wider" style={{ color: C.dark }}>
                  Descripción <span className="ml-1 text-gray-400 font-normal normal-case text-xs">(opcional)</span>
                </label>
                <textarea
                  id="descripcion"
                  rows={3}
                  placeholder="Descripción del producto..."
                  className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium resize-none"
                  style={{ borderColor: C.border, color: C.text }}
                  {...register("descripcion")}
                />
              </div>

              {/* ── Contraindicaciones ─────────────────────────────────── */}
              <div className="space-y-1.5 md:col-span-2">
                <label htmlFor="contraindicaciones" className="block text-xs font-bold uppercase tracking-wider" style={{ color: C.dark }}>
                  Contraindicaciones <span className="ml-1 text-gray-400 font-normal normal-case text-xs">(opcional)</span>
                </label>
                <textarea
                  id="contraindicaciones"
                  rows={3}
                  placeholder="Contraindicaciones del producto..."
                  className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium resize-none"
                  style={{ borderColor: C.border, color: C.text }}
                  {...register("contraindicaciones")}
                />
              </div>

              {/* ── Imagen del producto ──────────────────────────────────── */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: C.dark }}>
                  Imagen del Producto <span className="ml-1 text-gray-400 font-normal normal-case text-xs">(opcional · JPG/PNG · máx. 5MB)</span>
                </label>
                <div
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer hover:border-purple-400"
                  style={{ borderColor: C.border, background: C.light }}
                  onClick={() => fileRef.current?.click()}
                >
                  {imgPreview ? (
                    <img src={imgPreview} alt="Preview" className="w-20 h-20 object-cover rounded-xl shadow" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl flex items-center justify-center bg-white shadow-inner" style={{ color: C.border }}>
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold" style={{ color: C.dark }}>
                      {imgPreview ? "Imagen seleccionada" : "Haz clic para seleccionar"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Formatos: JPG, JPEG, PNG</p>
                  </div>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    ref={fileRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (imgPreview) URL.revokeObjectURL(imgPreview);
                      setImgPreview(file ? URL.createObjectURL(file) : null);
                    }}
                  />
                </div>
              </div>

            </div>

            {/* ── Caja informativa ─────────────────────────────────────── */}
            <div
              className="flex items-start gap-3 p-4 rounded-xl border mt-5"
              style={{ backgroundColor: C.light, borderColor: C.border }}
            >
              <div style={{ color: C.medium }} className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: C.dark }}>
                El <strong>código de barra</strong> debe ser único. Los campos marcados con{" "}
                <span className="text-red-500 font-bold">*</span> son obligatorios.
                El <strong>precio</strong> se ingresa en Bolivianos (Bs.).
              </p>
            </div>
          </div>

          {/* ── FOOTER ─────────────────────────────────────────────────── */}
          <div
            className="px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 border-t bg-gray-50/50"
            style={{ borderColor: C.border }}
          >
            <button
              type="button"
              onClick={handleCleanUp}
              className="px-5 py-2.5 rounded-xl border-2 font-bold text-sm transition-all hover:bg-gray-100 active:scale-95"
              style={{ borderColor: C.border, color: C.dark }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all shadow-lg hover:shadow-purple-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}
            >
              {isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar Producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}