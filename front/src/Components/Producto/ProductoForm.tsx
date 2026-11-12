import { useForm } from "react-hook-form";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import BarcodeRenderer from "../../lib/BarcodeRenderer";
import { AddProductoApi, GetProductoApi } from "../../Api/ProductoApi";
import { GetLaboratorioApi } from "../../Api/LaboratorioApi";
import { GetTipoProdApi } from "../../Api/TipoProdApi";
import { GetPresentaApi } from "../../Api/PresentacionApi";
import { GetPrincipioActivoApi } from "../../Api/PrincipioActivoApi";
import SearchableSelect, { type SearchableOption } from "../Common/SearchableSelect";
import ErrorMessage from "../Error/ErrorMessage";
import { soloLetras, soloDigitos, numero, textoLibre, alfanumerico, tecladoSoloLetras, tecladoSoloDigitos, tecladoAlfanumerico } from "../../lib/validators";
import type {
  CreateProducto,
  ProductoPrincipioInput,
  ProductoTipoInput,
} from "../../types";

// ─── Props ───────────────────────────────────────────────────────────────────
type Props = Readonly<{
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
}>;

// ─── Interfaces de Catálogos ─────────────────────────────────────────────────
interface ILaboratorio { idLaboratorio: number; nombre: string; }
interface ITipoProducto { idTipoProd: number; nombre: string; }
interface IPresentacion { idPresentacion: number; nombre: string; }
interface IPrincipioActivo { idPrincipioActivo: number; nombre: string; }

// ─── Paleta (sin cambios) ────────────────────────────────────────────────────
const C = {
  dark: "#4A1A6E",
  medium: "#7B3FA0",
  light: "#F3EBF9",
  border: "#D8B4F0",
  text: "#2D0A47",
};
const ERROR_COLOR = "#EF4444"; // rojo ya usado en el formulario (text-red-500)
const SURFACE = "#FBF8FE";     // fondo suave que ya usabas en las filas N:M

const LS_KEY = "ProductoFormDraft";

type Draft = {
  scalars?: Partial<CreateProducto>;
  principios?: ProductoPrincipioInput[];
  tipos?: ProductoTipoInput[];
  laboratorio?: { idLaboratorio?: number; nombre?: string };
  presentacion?: { idPresentacion?: number; nombre?: string };
};

const saveDraft = (draft: Draft) => localStorage.setItem(LS_KEY, JSON.stringify(draft));

// ═════════════════════════════════════════════════════════════════════════════
//  PIEZAS VISUALES REUTILIZABLES (solo presentación, sin lógica de negocio)
// ═════════════════════════════════════════════════════════════════════════════

// Clase base compartida por todos los inputs: antes estaba copiada 8 veces.
const inputCls =
  "w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all " +
  "focus:ring-4 focus:ring-purple-100 focus:border-purple-500 text-sm font-medium bg-white " +
  "placeholder:text-gray-300";

// Estilo inline de un input; si hay error el borde se pone rojo.
const fieldStyle = (hasError?: boolean): React.CSSProperties => ({
  borderColor: hasError ? ERROR_COLOR : C.border,
  color: C.text,
});

// Ícono SVG genérico: recibe solo el "d" del path.
const Icon = ({ d, className = "w-5 h-5" }: { d: string; className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

// Contenedor de input con ícono a la izquierda (cambia de color al enfocar).
const IconInput = ({ icon, children }: { icon: string; children: React.ReactNode }) => (
  <div className="relative group">
    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-purple-600 transition-colors">
      <Icon d={icon} />
    </div>
    {children}
  </div>
);

// Etiqueta + campo + pista + (el error lo pone cada campo como antes).
const Field = ({
  id, label, required, optional, hint, children,
}: {
  id: string; label: string; required?: boolean; optional?: boolean; hint?: string; children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="flex items-baseline gap-1.5 text-sm font-semibold" style={{ color: C.dark }}>
      {label}
      {required && <span className="text-red-500" aria-hidden="true">*</span>}
      {optional && <span className="text-xs text-gray-400 font-normal">opcional</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-400">{hint}</p>}
  </div>
);

// Tarjeta de sección: ícono + título + subtítulo + contenido.
const Section = ({
  icon, title, subtitle, aside, children,
}: {
  icon: string; title: string; subtitle: string; aside?: React.ReactNode; children: React.ReactNode;
}) => (
  <section className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: C.border }}>
    <header className="flex items-center gap-3 mb-4">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: C.light, color: C.medium }}
      >
        <Icon d={icon} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-bold leading-tight" style={{ color: C.dark }}>{title}</h3>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      {aside}
    </header>
    {children}
  </section>
);

// Botón secundario pequeño (Agregar principio / Agregar tipo).
const AddButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-colors hover:bg-purple-50 active:scale-95"
    style={{ borderColor: C.border, color: C.dark }}
  >
    <Icon d="M12 4v16m8-8H4" className="w-3.5 h-3.5" />
    {children}
  </button>
);

// Botón de quitar fila (✕).
const RemoveButton = ({ onClick, title }: { onClick: () => void; title: string }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    className="self-center w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors"
  >
    <Icon d="M6 18L18 6M6 6l12 12" className="w-4 h-4" />
  </button>
);

// Insignia con contador (ej: "2 agregados").
const CountBadge = ({ count, label }: { count: number; label: string }) => (
  <span
    className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
    style={{ background: C.light, color: C.dark }}
  >
    {count} {label}
  </span>
);

// Valor ya elegido: reemplaza al buscador. Misma altura que un input para que la fila no "salte".
// Si el valor es nuevo (creado al vuelo, sin id) muestra la insignia "Nuevo".
const SelectedChip = ({
  label, isNew, onRemove,
}: { label: string; isNew?: boolean; onRemove: () => void }) => (
  <div
    className="flex items-center gap-2 w-full px-3.5 py-3 rounded-xl border-2 bg-white text-sm font-semibold"
    style={{ borderColor: C.border, color: C.text }}
  >
    <span className="flex-1 truncate">{label}</span>
    {isNew && (
      <span
        className="px-2 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0"
        style={{ background: C.light, color: C.medium }}
      >
        Nuevo
      </span>
    )}
    <button
      type="button"
      onClick={onRemove}
      title="Quitar y elegir otro"
      aria-label={`Quitar ${label}`}
      className="w-6 h-6 flex items-center justify-center rounded-md flex-shrink-0 transition-colors hover:bg-purple-50"
      style={{ color: C.medium }}
    >
      <Icon d="M6 18L18 6M6 6l12 12" className="w-4 h-4" />
    </button>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════
export default function ProductoForm({ setIsOpen, isOpen }: Props) {
  const queryClient = useQueryClient();

  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // ── Estado de los catálogos N:M (principios activos, tipos, laboratorio, presentación) ──
  const [principios, setPrincipios] = useState<ProductoPrincipioInput[]>([{ concentracion: "" }]);
  const [tipos, setTipos] = useState<ProductoTipoInput[]>([]);
  const [laboratorio, setLaboratorio] = useState<{ idLaboratorio?: number; nombre?: string }>({});
  const [presentacion, setPresentacion] = useState<{ idPresentacion?: number; nombre?: string }>({});
  const [tried, setTried] = useState(false);

  // ── react-hook-form (solo campos escalares) ──────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    formState: { errors },
  } = useForm<CreateProducto>({
    defaultValues: {
      codigoBarra: "",
      nombreComercial: "",
      descripcion: "",
      precio: 0,
      requiereReceta: 0,
      contraindicaciones: "",
      viaAdministracion: "",
      stockMinimo: 0,
    },
  });

  // ── Recuperar borrador ─────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (!saved) return;
    try {
      const draft: Draft = JSON.parse(saved);
      if (draft.scalars) reset(draft.scalars);
      if (draft.principios?.length) setPrincipios(draft.principios);
      if (draft.tipos?.length) setTipos(draft.tipos);
      if (draft.laboratorio) setLaboratorio(draft.laboratorio);
      if (draft.presentacion) setPresentacion(draft.presentacion);
    } catch {
      localStorage.removeItem(LS_KEY);
    }
  }, [reset]);

  // ── Persistir borrador mientras está abierto ───────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    saveDraft({ scalars: getValues(), principios, tipos, laboratorio, presentacion });
  }, [isOpen, principios, tipos, laboratorio, presentacion, getValues]);

  // ── Queries para los selects relacionados ─────────────────────────────────
  const { data: laboratorios = [] } = useQuery<ILaboratorio[] | undefined>({
    queryKey: ["LaboratorioAll"],
    queryFn: GetLaboratorioApi,
  });
  const { data: presentaciones = [] } = useQuery<IPresentacion[] | undefined>({
    queryKey: ["PresentacionAll"],
    queryFn: GetPresentaApi,
  });
  const { data: tiposProducto = [] } = useQuery<ITipoProducto[] | undefined>({
    queryKey: ["TipoProdAll"],
    queryFn: GetTipoProdApi,
  });
  const { data: principiosActivosList = [] } = useQuery<IPrincipioActivo[] | undefined>({
    queryKey: ["PrincipioActivoAll"],
    queryFn: GetPrincipioActivoApi,
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

  // ── Helpers de los arreglos N:M ───────────────────────────────────────────
  const updatePrincipio = (i: number, patch: Partial<ProductoPrincipioInput>) =>
    setPrincipios((prev) => prev.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const removePrincipio = (i: number) =>
    setPrincipios((prev) => prev.filter((_, idx) => idx !== i));

  const updateTipo = (i: number, patch: Partial<ProductoTipoInput>) =>
    setTipos((prev) => prev.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const removeTipo = (i: number) => setTipos((prev) => prev.filter((_, idx) => idx !== i));

  const labValid = Boolean((laboratorio.idLaboratorio ?? 0) > 0 || (laboratorio.nombre ?? "").trim());
  const presValid = Boolean((presentacion.idPresentacion ?? 0) > 0 || (presentacion.nombre ?? "").trim());
  const tiposValid = tipos.some((t) => (t.idTipoProd ?? 0) > 0 || (t.nombre ?? "").trim());
  const princiValid = principios.some((p) => (p.idPrincipioActivo ?? 0) > 0 || (p.nombre ?? "").trim());

  const handleForm = (values: CreateProducto) => {
    const file = fileRef.current?.files?.[0] ?? null;

    const codigo = String(values.codigoBarra ?? "").trim();
    const yaExiste = productos.some((p) => String(p.codigoBarra).trim() === codigo);
    if (yaExiste) {
      toast.warning("El código de barra ya está registrado");
      return;
    }

    setTried(true);
    if (!labValid) return toast.warning("Debe seleccionar o crear un laboratorio");
    if (!presValid) return toast.warning("Debe seleccionar o crear una presentación");
    if (!princiValid) return toast.warning("Debe agregar al menos un principio activo");
    if (!tiposValid) return toast.warning("Debe agregar al menos un tipo de producto");

    const principiosClean = principios
      .filter((p) => (p.idPrincipioActivo ?? 0) > 0 || (p.nombre ?? "").trim())
      .map((p) => ({
        idPrincipioActivo: (p.idPrincipioActivo ?? 0) > 0 ? p.idPrincipioActivo : undefined,
        nombre: p.nombre,
        concentracion: p.concentracion ?? null,
      }));

    const tiposClean = tipos
      .filter((t) => (t.idTipoProd ?? 0) > 0 || (t.nombre ?? "").trim())
      .map((t) => ({
        idTipoProd: (t.idTipoProd ?? 0) > 0 ? t.idTipoProd : undefined,
        nombre: t.nombre,
      }));

    const fd = new FormData();
    fd.append("codigoBarra", values.codigoBarra);
    if (values.nombreComercial) fd.append("nombreComercial", values.nombreComercial);
    if (values.descripcion) fd.append("descripcion", values.descripcion);
    fd.append("precio", String(values.precio));
    fd.append("requiereReceta", String(values.requiereReceta));
    if (values.contraindicaciones) fd.append("contraindicaciones", values.contraindicaciones);
    if (values.viaAdministracion) fd.append("viaAdministracion", values.viaAdministracion);
    fd.append("stockMinimo", String(values.stockMinimo));
    if ((laboratorio.idLaboratorio ?? 0) > 0) fd.append("idLaboratorio", String(laboratorio.idLaboratorio));
    else fd.append("nombreLaboratorio", String(laboratorio.nombre));
    if ((presentacion.idPresentacion ?? 0) > 0) fd.append("idPresentacion", String(presentacion.idPresentacion));
    else fd.append("nombrePresentacion", String(presentacion.nombre));
    fd.append("tiposProducto", JSON.stringify(tiposClean));
    fd.append("principiosActivos", JSON.stringify(principiosClean));
    if (file) fd.append("img", file);

    mutate(fd);
  };

  const handleCleanUp = () => {
    if (imgPreview) URL.revokeObjectURL(imgPreview);
    localStorage.removeItem(LS_KEY);
    reset();
    setPrincipios([{ concentracion: "" }]);
    setTipos([]);
    setLaboratorio({});
    setPresentacion({});
    setTried(false);
    setImgPreview(null);
    setIsOpen(false);
  };

  // Mapeos de los catálogos para el subcomponente SearchableSelect
  const labOptions = useMemo(() => laboratorios.map((l) => ({ value: l.idLaboratorio, label: l.nombre })), [laboratorios]);
  const tipoOptions = useMemo(() => tiposProducto.map((t) => ({ value: t.idTipoProd, label: t.nombre })), [tiposProducto]);
  const presentaOptions = useMemo(() => presentaciones.map((p) => ({ value: p.idPresentacion, label: p.nombre })), [presentaciones]);
  const principioOptions = useMemo(
    () => principiosActivosList.map((p) => ({ value: p.idPrincipioActivo, label: p.nombre })),
    [principiosActivosList]
  );

  // Chips auxiliares para el SearchableSelect
  const labChip: SearchableOption[] =
    (laboratorio.idLaboratorio ?? 0) > 0 && laboratorio.nombre ? [{ value: laboratorio.idLaboratorio!, label: laboratorio.nombre }] : [];
  const labCustoms: string[] = !(laboratorio.idLaboratorio ?? 0) && laboratorio.nombre ? [laboratorio.nombre] : [];
  const presentaChip: SearchableOption[] =
    (presentacion.idPresentacion ?? 0) > 0 && presentacion.nombre ? [{ value: presentacion.idPresentacion!, label: presentacion.nombre }] : [];
  const presentaCustoms: string[] = !(presentacion.idPresentacion ?? 0) && presentacion.nombre ? [presentacion.nombre] : [];

  // Solo para la vista: cuántos principios / tipos ya tienen contenido (insignias)
  const principiosCount = principios.filter((p) => (p.idPrincipioActivo ?? 0) > 0 || (p.nombre ?? "").trim()).length;
  const tiposCount = tipos.filter((t) => (t.idTipoProd ?? 0) > 0 || (t.nombre ?? "").trim()).length;

  return (
    <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={handleCleanUp} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="prod-modal-title"
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border overflow-hidden"
        style={{ borderColor: C.border }}
      >
        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <div
          className="relative px-6 py-5 border-b flex-shrink-0 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)", borderColor: "#5C2680" }}
        >
          {/* Círculos decorativos (solo estética) */}
          <div className="absolute -right-8 -top-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute right-24 -bottom-12 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shadow-inner text-white">
                <Icon
                  className="w-6 h-6"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </div>
              <div>
                <h2 id="prod-modal-title" className="text-xl font-bold text-white tracking-tight">
                  Nuevo producto
                </h2>
                <p className="text-xs text-purple-200 mt-0.5">Registra un nuevo producto farmacéutico</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCleanUp}
              className="p-2 px-4 flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/25 transition-colors text-white text-sm font-semibold"
            >
              <Icon d="M6 18L18 6M6 6l12 12" className="w-4 h-4" />
              Cerrar
            </button>
          </div>
        </div>

        {/* ── FORM (columna: cuerpo con scroll + footer fijo) ───────────── */}
        <form onSubmit={handleSubmit(handleForm)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5" style={{ background: SURFACE }}>

            {/* ═══ SECCIÓN 1: Identificación ═══ */}
            <Section
              icon="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              title="Identificación"
              subtitle="Cómo se reconoce el producto en el sistema"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Código de barra */}
                <div className="md:col-span-2">
                  <Field id="codigoBarra" label="Código de barra" required hint="Debe ser único. Entre 8 y 14 dígitos.">
                    <IconInput icon="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01">
                      <input
                        id="codigoBarra"
                        type="text"
                        placeholder="Ej: 7501234567890"
                        className={inputCls}
                        style={fieldStyle(!!errors.codigoBarra)}
                        {...register("codigoBarra", soloDigitos("Código de barra", { required: "El código de barra es obligatorio", min: 8, max: 14 }))}
                        {...tecladoSoloDigitos}
                      />
                    </IconInput>
                    {errors.codigoBarra && <ErrorMessage>{errors.codigoBarra.message}</ErrorMessage>}
                  </Field>

                  {watch("codigoBarra") && (
                    <div className="mt-3 flex flex-col items-center p-3 bg-purple-50/60 rounded-xl border border-dashed border-purple-200">
                      <span className="text-xs font-semibold text-purple-700 mb-1">Vista previa del código</span>
                      <BarcodeRenderer value={watch("codigoBarra")} width={1.8} height={40} enableDownload={true} />
                    </div>
                  )}
                </div>

                {/* Nombre comercial */}
                <div className="md:col-span-2">
                  <Field id="nombreComercial" label="Nombre comercial" optional>
                    <IconInput icon="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z">
                      <input
                        id="nombreComercial"
                        type="text"
                        placeholder="Ej: Tylenol, Panadol..."
                        className={inputCls}
                        style={fieldStyle(!!errors.nombreComercial)}
                        {...register("nombreComercial", alfanumerico("Nombre comercial", { min: 2, max: 150 }))}
                        {...tecladoAlfanumerico}
                      />
                    </IconInput>
                    {errors.nombreComercial && <ErrorMessage>{errors.nombreComercial.message}</ErrorMessage>}
                  </Field>
                </div>
              </div>
            </Section>

            {/* ═══ SECCIÓN 2: Venta e inventario ═══ */}
            <Section
              icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              title="Venta e inventario"
              subtitle="Precio, stock de alerta y control de receta"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Precio */}
                <Field id="precio" label="Precio (Bs.)" required>
                  <div className="relative group">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 font-bold text-sm pointer-events-none">
                      Bs.
                    </span>
                    <input
                      id="precio"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className={inputCls}
                      style={fieldStyle(!!errors.precio)}
                      {...register("precio", numero("Precio", {
                        required: "El precio es obligatorio",
                        min: 0,
                        max: 1000000,
                      }))}
                    />
                  </div>
                  {errors.precio && <ErrorMessage>{errors.precio.message}</ErrorMessage>}
                </Field>

                {/* Stock mínimo */}
                <Field id="stockMinimo" label="Stock mínimo" required hint="Avisa cuando queden pocas unidades.">
                  <IconInput icon="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4">
                    <input
                      id="stockMinimo"
                      type="number"
                      min="0"
                      placeholder="Ej: 10"
                      className={inputCls}
                      style={fieldStyle(!!errors.stockMinimo)}
                      {...register("stockMinimo", numero("Stock mínimo", {
                        required: "El stock mínimo es obligatorio",
                        min: 0,
                        max: 1000000,
                      }))}
                    />
                  </IconInput>
                  {errors.stockMinimo && <ErrorMessage>{errors.stockMinimo.message}</ErrorMessage>}
                </Field>

                {/* Requiere receta */}
                <Field id="requiereReceta" label="¿Requiere receta?" required>
                  <IconInput icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z">
                    <select
                      id="requiereReceta"
                      className={inputCls + " appearance-none"}
                      style={fieldStyle(!!errors.requiereReceta)}
                      {...register("requiereReceta", { required: "Seleccione una opción" })}
                    >
                      <option value="">-- Seleccione --</option>
                      <option value="0">No requiere receta</option>
                      <option value="1">Sí requiere receta</option>
                    </select>
                    {/* Flecha del select (como usamos appearance-none, la dibujamos nosotros) */}
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <Icon d="M19 9l-7 7-7-7" className="w-4 h-4" />
                    </div>
                  </IconInput>
                  {errors.requiereReceta && <ErrorMessage>{errors.requiereReceta.message}</ErrorMessage>}
                </Field>
              </div>
            </Section>

            {/* ═══ SECCIÓN 3: Composición (N:M) ═══ */}
            <Section
              icon="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              title="Composición"
              subtitle="Principios activos con su concentración, y tipos de producto"
            >
              <div className="space-y-6">
                {/* Principios activos */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: C.dark }}>
                        Principios activos <span className="text-red-500">*</span>
                      </span>
                      <CountBadge count={principiosCount} label={principiosCount === 1 ? "agregado" : "agregados"} />
                    </div>
                    <AddButton onClick={() => setPrincipios((prev) => [...prev, { concentracion: "" }])}>
                      Agregar principio
                    </AddButton>
                  </div>
                  {tried && !princiValid && <ErrorMessage>Agregue al menos un principio activo</ErrorMessage>}

                  {principios.map((row, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_200px_auto] gap-3 items-start p-3 rounded-xl border"
                      style={{ borderColor: C.border, background: SURFACE }}
                    >
                      {row.idPrincipioActivo || (row.nombre ?? "").trim() ? (
                        <SelectedChip
                          label={row.nombre ?? ""}
                          isNew={!row.idPrincipioActivo}
                          onRemove={() => updatePrincipio(i, { idPrincipioActivo: undefined, nombre: undefined })}
                        />
                      ) : (
                      <SearchableSelect
                        placeholder="Buscar principio activo..."
                        options={principioOptions}
                        selected={row.idPrincipioActivo ? [{ value: row.idPrincipioActivo, label: row.nombre ?? "" }] : []}
                        customs={!row.idPrincipioActivo && row.nombre ? [row.nombre] : []}
                        onPick={(opt) => updatePrincipio(i, { idPrincipioActivo: opt.value, nombre: opt.label })}
                        onPickCustom={(name) => updatePrincipio(i, { idPrincipioActivo: undefined, nombre: name })}
                        onRemoveSelected={() => updatePrincipio(i, { idPrincipioActivo: undefined, nombre: undefined })}
                        onRemoveCustom={() => updatePrincipio(i, { nombre: undefined })}
                        createVerb="principio activo"
                        emptyText="Escribe el nombre para crearlo"
                        invalid={tried && !row.idPrincipioActivo && !(row.nombre ?? "").trim()}
                      />
                      )}
                      <input
                        type="text"
                        value={row.concentracion ?? ""}
                        onChange={(e) => updatePrincipio(i, { concentracion: e.target.value })}
                        maxLength={50}
                        placeholder="Concentración (ej: 500 mg)"
                        aria-label="Concentración"
                        className="w-full px-3.5 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 focus:border-purple-500 text-sm font-medium bg-white placeholder:text-gray-300"
                        style={{ borderColor: C.border, color: C.text }}
                      />
                      <RemoveButton onClick={() => removePrincipio(i)} title="Quitar principio" />
                    </div>
                  ))}
                </div>

                <hr style={{ borderColor: C.light }} />

                {/* Tipos de producto */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: C.dark }}>
                        Tipos de producto <span className="text-red-500">*</span>
                      </span>
                      <CountBadge count={tiposCount} label={tiposCount === 1 ? "agregado" : "agregados"} />
                    </div>
                    <AddButton onClick={() => setTipos((prev) => [...prev, {}])}>
                      Agregar tipo
                    </AddButton>
                  </div>
                  {tried && !tiposValid && <ErrorMessage>Agregue al menos un tipo de producto</ErrorMessage>}

                  {tipos.length === 0 && (
                    <div className="text-xs text-gray-400 border border-dashed rounded-xl p-4 text-center" style={{ borderColor: C.border }}>
                      Busca un tipo existente o escríbelo para crearlo al guardar. Ej: Antibiótico, Analgésico...
                    </div>
                  )}

                  {tipos.map((row, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-start p-3 rounded-xl border"
                      style={{ borderColor: C.border, background: SURFACE }}
                    >
                      {row.idTipoProd || (row.nombre ?? "").trim() ? (
                        <SelectedChip
                          label={row.nombre ?? ""}
                          isNew={!row.idTipoProd}
                          onRemove={() => updateTipo(i, { idTipoProd: undefined, nombre: undefined })}
                        />
                      ) : (
                      <SearchableSelect
                        placeholder="Buscar tipo de producto..."
                        options={tipoOptions}
                        selected={row.idTipoProd ? [{ value: row.idTipoProd, label: row.nombre ?? "" }] : []}
                        customs={!row.idTipoProd && row.nombre ? [row.nombre] : []}
                        onPick={(opt) => updateTipo(i, { idTipoProd: opt.value, nombre: opt.label })}
                        onPickCustom={(name) => updateTipo(i, { idTipoProd: undefined, nombre: name })}
                        onRemoveSelected={() => updateTipo(i, { idTipoProd: undefined, nombre: undefined })}
                        onRemoveCustom={() => updateTipo(i, { nombre: undefined })}
                        createVerb="tipo de producto"
                        emptyText="Escribe el nombre para crearlo"
                        invalid={tried && !row.idTipoProd && !(row.nombre ?? "").trim()}
                      />
                      )}
                      <RemoveButton onClick={() => removeTipo(i)} title="Quitar tipo" />
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* ═══ SECCIÓN 4: Fabricación y presentación ═══ */}
            <Section
              icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              title="Fabricación y presentación"
              subtitle="Quién lo fabrica, cómo se vende y cómo se administra"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Laboratorio */}
                <div className="space-y-1.5">
                  <label htmlFor="labSearch" className="block text-sm font-semibold" style={{ color: C.dark }}>
                    Laboratorio <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    id="labSearch"
                    placeholder="Buscar laboratorio..."
                    options={labOptions}
                    selected={labChip}
                    customs={labCustoms}
                    onPick={(opt) => setLaboratorio({ idLaboratorio: opt.value, nombre: opt.label })}
                    onPickCustom={(name) => setLaboratorio({ nombre: name })}
                    onRemoveSelected={() => setLaboratorio({})}
                    onRemoveCustom={() => setLaboratorio({})}
                    createVerb="laboratorio"
                    emptyText="Escribe el nombre para crearlo"
                    invalid={tried && !labValid}
                  />
                  {tried && !labValid && <ErrorMessage>Seleccione o cree un laboratorio</ErrorMessage>}
                </div>

                {/* Presentación */}
                <div className="space-y-1.5">
                  <label htmlFor="presSearch" className="block text-sm font-semibold" style={{ color: C.dark }}>
                    Presentación <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    id="presSearch"
                    placeholder="Buscar presentación..."
                    options={presentaOptions}
                    selected={presentaChip}
                    customs={presentaCustoms}
                    onPick={(opt) => setPresentacion({ idPresentacion: opt.value, nombre: opt.label })}
                    onPickCustom={(name) => setPresentacion({ nombre: name })}
                    onRemoveSelected={() => setPresentacion({})}
                    onRemoveCustom={() => setPresentacion({})}
                    createVerb="presentación"
                    emptyText="Escribe el nombre para crearlo"
                    invalid={tried && !presValid}
                  />
                  {tried && !presValid && <ErrorMessage>Seleccione o cree una presentación</ErrorMessage>}
                </div>

                {/* Vía de administración */}
                <div className="md:col-span-2">
                  <Field id="viaAdministracion" label="Vía de administración" optional>
                    <IconInput icon="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7">
                      <input
                        id="viaAdministracion"
                        type="text"
                        placeholder="Ej: Oral, Tópica, Intravenosa..."
                        className={inputCls}
                        style={fieldStyle(!!errors.viaAdministracion)}
                        {...register("viaAdministracion", soloLetras("Vía de administración", { min: 2, max: 100 }))}
                        {...tecladoSoloLetras}
                      />
                    </IconInput>
                    {errors.viaAdministracion && <ErrorMessage>{errors.viaAdministracion.message}</ErrorMessage>}
                  </Field>
                </div>
              </div>
            </Section>

            {/* ═══ SECCIÓN 5: Información adicional ═══ */}
            <Section
              icon="M4 6h16M4 12h16M4 18h7"
              title="Información adicional"
              subtitle="Detalles que ayudan al personal de venta (todo opcional)"
            >
              <div className="grid grid-cols-1 gap-5">
                {/* Descripción */}
                <Field id="descripcion" label="Descripción" optional>
                  <textarea
                    id="descripcion"
                    rows={3}
                    placeholder="Descripción del producto..."
                    className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 focus:border-purple-500 text-sm font-medium resize-none bg-white placeholder:text-gray-300"
                    style={fieldStyle(!!errors.descripcion)}
                    {...register("descripcion", textoLibre("Descripción", { max: 500 }))}
                  />
                  {errors.descripcion && <ErrorMessage>{errors.descripcion.message}</ErrorMessage>}
                </Field>

                {/* Contraindicaciones */}
                <Field id="contraindicaciones" label="Contraindicaciones" optional>
                  <textarea
                    id="contraindicaciones"
                    rows={3}
                    placeholder="Contraindicaciones del producto..."
                    className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 focus:border-purple-500 text-sm font-medium resize-none bg-white placeholder:text-gray-300"
                    style={fieldStyle(!!errors.contraindicaciones)}
                    {...register("contraindicaciones", textoLibre("Contraindicaciones", { max: 500 }))}
                  />
                  {errors.contraindicaciones && <ErrorMessage>{errors.contraindicaciones.message}</ErrorMessage>}
                </Field>

                {/* Imagen */}
                <div className="space-y-1.5">
                  <span className="flex items-baseline gap-1.5 text-sm font-semibold" style={{ color: C.dark }}>
                    Imagen del producto
                    <span className="text-xs text-gray-400 font-normal">opcional · JPG o PNG · máx. 5 MB</span>
                  </span>
                  <div
                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer hover:border-purple-400 hover:bg-purple-50/40"
                    style={{ borderColor: C.border, background: C.light }}
                    onClick={() => fileRef.current?.click()}
                  >
                    {imgPreview ? (
                      <img src={imgPreview} alt="Vista previa del producto" className="w-20 h-20 object-cover rounded-xl shadow" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl flex items-center justify-center bg-white shadow-inner" style={{ color: C.border }}>
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: C.dark }}>
                        {imgPreview ? "Imagen seleccionada" : "Haz clic para seleccionar una imagen"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {imgPreview ? "Haz clic de nuevo para cambiarla" : "Formatos: JPG, JPEG, PNG"}
                      </p>
                    </div>
                    <span
                      className="hidden sm:inline-flex px-3 py-1.5 rounded-lg text-xs font-bold border-2 bg-white"
                      style={{ borderColor: C.border, color: C.dark }}
                    >
                      {imgPreview ? "Cambiar" : "Examinar"}
                    </span>
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
            </Section>

            {/* ── Caja informativa ─────────────────────────────────────── */}
            <div
              className="flex items-start gap-3 p-4 rounded-xl border"
              style={{ backgroundColor: C.light, borderColor: C.border }}
            >
              <div style={{ color: C.medium }} className="flex-shrink-0 mt-0.5">
                <Icon d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </div>
              <p className="text-xs leading-relaxed" style={{ color: C.dark }}>
                Los <strong>principios activos</strong>, <strong>tipos de producto</strong>, <strong>laboratorio</strong> y{" "}
                <strong>presentación</strong> se pueden crear al momento si no existen: escribe el nombre y el sistema lo
                guardará automáticamente. El <strong>código de barra</strong> debe ser único.
              </p>
            </div>
          </div>

          {/* ── FOOTER (siempre visible, fuera del scroll) ─────────────── */}
          <div
            className="px-6 py-4 flex flex-col-reverse sm:flex-row sm:items-center gap-3 border-t bg-white flex-shrink-0"
            style={{ borderColor: C.border }}
          >
            <p className="text-xs text-gray-400 sm:mr-auto">
              <span className="text-red-500">*</span> Campos obligatorios
            </p>
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
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all shadow-lg hover:shadow-purple-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                  <Icon d="M5 13l4 4L19 7" className="w-4 h-4" />
                  Guardar producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}