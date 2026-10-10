import { useForm } from "react-hook-form";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import BarcodeRenderer from "../../lib/BarcodeRenderer";
import { UpdateProductoApi, GetProductoApi } from "../../Api/ProductoApi";
import { GetLaboratorioApi } from "../../Api/LaboratorioApi";
import { GetTipoProdApi } from "../../Api/TipoProdApi";
import { GetPresentaApi } from "../../Api/PresentacionApi";
import { GetPrincipioActivoApi } from "../../Api/PrincipioActivoApi";
import SearchableSelect, { type SearchableOption } from "../Common/SearchableSelect";
import ErrorMessage from "../Error/ErrorMessage";
import type {
  ProductoPrincipioInput,
  ProductoTipoInput,
  UpdateProducto,
} from "../../types";

// ─── Props ───────────────────────────────────────────────────────────────────
type Props = Readonly<{
  SendValor: UpdateProducto | null;
  SetVer: React.Dispatch<React.SetStateAction<boolean>>;
}>;

// ─── Paleta ──────────────────────────────────────────────────────────────────
const C = {
  dark: "#4A1A6E",
  medium: "#7B3FA0",
  light: "#F3EBF9",
  border: "#D8B4F0",
  text: "#2D0A47",
};

// ─── Utilidad: convierte la ruta del backend a URL pública ───────────────────
const toPublicUrl = (ruta: string | null | undefined): string | null => {
    if (!ruta) return null;
    const base = import.meta.env.VITE_API_URL?.replace('/api', '') ?? '';
    return `${base}/${ruta.replace(/^\.\//, "").replace(/\\\\/g, "/")}`;
};

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

export default function UpdateProductoModal({ SendValor, SetVer }: Props) {
    const queryClient = useQueryClient();

    const [imgPreview, setImgPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement | null>(null);

    // ── Estado de los catálogos N:M ─────────────────────────────────────────
    const [principios, setPrincipios] = useState<ProductoPrincipioInput[]>([]);
    const [tipos, setTipos] = useState<ProductoTipoInput[]>([]);
    const [laboratorio, setLaboratorio] = useState<{ idLaboratorio?: number; nombre?: string }>({});
    const [presentacion, setPresentacion] = useState<{ idPresentacion?: number; nombre?: string }>({});
    const [tried, setTried] = useState(false);

    // ── react-hook-form ───────────────────────────────────────────────────────
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<UpdateProducto>();

    // ── Precarga del formulario con los datos actuales ────────────────────────
    useEffect(() => {
        if (!SendValor) return;
        reset({
            idProducto: SendValor.idProducto,
            codigoBarra: SendValor.codigoBarra ?? "",
            nombreComercial: SendValor.nombreComercial ?? "",
            descripcion: SendValor.descripcion ?? "",
            precio: Number(SendValor.precio ?? 0),
            requiereReceta: Number(SendValor.requiereReceta ?? 0),
            contraindicaciones: SendValor.contraindicaciones ?? "",
            viaAdministracion: SendValor.viaAdministracion ?? "",
            stockMinimo: Number(SendValor.stockMinimo ?? 0),
        });

        setLaboratorio(
            (SendValor.idLaboratorio ?? 0) > 0
                ? { idLaboratorio: Number(SendValor.idLaboratorio), nombre: SendValor.nombreLaboratorio ?? "" }
                : {}
        );
        setPresentacion(
            (SendValor.idPresentacion ?? 0) > 0
                ? { idPresentacion: Number(SendValor.idPresentacion), nombre: SendValor.nombrePresentacion ?? "" }
                : {}
        );

        const principiosIniciales =
            SendValor.principiosActivos && SendValor.principiosActivos.length > 0
                ? SendValor.principiosActivos.map((p) => ({
                      idPrincipioActivo: p.idPrincipioActivo,
                      nombre: p.nombre,
                      concentracion: p.concentracion ?? "",
                  }))
                : [{ concentracion: "" }];
        setPrincipios(principiosIniciales);

        const tiposIniciales =
            SendValor.tiposProducto && SendValor.tiposProducto.length > 0
                ? SendValor.tiposProducto.map((t) => ({ idTipoProd: t.idTipoProd, nombre: t.nombre }))
                : [];
        setTipos(tiposIniciales);
        setTried(false);

        const publicUrl = toPublicUrl(SendValor.img);
        setImgPreview(publicUrl);
    }, [SendValor, reset]);

    // ── Queries para los selects ─────────────────────────────────────────────
    const { data: laboratorios = [] } = useQuery({ queryKey: ["LaboratorioAll"], queryFn: GetLaboratorioApi });
    const { data: tiposProducto = [] } = useQuery({ queryKey: ["TipoProdAll"], queryFn: GetTipoProdApi });
    const { data: presentaciones = [] } = useQuery({ queryKey: ["PresentacionAll"], queryFn: GetPresentaApi });
    const { data: principiosActivosList = [] } = useQuery({ queryKey: ["PrincipioActivoAll"], queryFn: GetPrincipioActivoApi });

    // ── Productos existentes (para validar código de barra único) ─────────────
    const { data: productos = [] } = useQuery({ queryKey: ["ProductoAll"], queryFn: GetProductoApi });

    // ── Mutación ───────────────────────────────────────────────────────────────
    const { mutate, isPending } = useMutation({
        mutationFn: ({ fd, id }: { fd: FormData; id: number }) => UpdateProductoApi(fd, id),
        onError: (error: Error) => toast.error(error.message),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ["ProductoAll"] });
            toast.success(typeof result === "string" ? result : "Producto actualizado correctamente");
            SetVer(false);
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

    const handleForm = (values: UpdateProducto) => {
        if (!SendValor) return;

        const codigo = String(values.codigoBarra ?? "").trim();
        const yaExiste = Array.isArray(productos) && productos.some(
            (p: UpdateProducto) => Number(p.idProducto) !== Number(SendValor.idProducto) &&
                String(p.codigoBarra).trim() === codigo
        );
        if (yaExiste) {
            toast.warning("El código de barra ya está registrado en otro producto");
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
        if (values.contraindicaciones) fd.append("contraindicaciones", String(values.contraindicaciones));
        if (values.viaAdministracion) fd.append("viaAdministracion", String(values.viaAdministracion));
        fd.append("stockMinimo", String(values.stockMinimo));
        if ((laboratorio.idLaboratorio ?? 0) > 0) fd.append("idLaboratorio", String(laboratorio.idLaboratorio));
        else fd.append("nombreLaboratorio", String(laboratorio.nombre));
        if ((presentacion.idPresentacion ?? 0) > 0) fd.append("idPresentacion", String(presentacion.idPresentacion));
        else fd.append("nombrePresentacion", String(presentacion.nombre));
        fd.append("tiposProducto", JSON.stringify(tiposClean));
        fd.append("principiosActivos", JSON.stringify(principiosClean));

        const file = fileRef.current?.files?.[0] ?? null;
        if (file) fd.append("img", file);

        mutate({ fd, id: SendValor.idProducto });
    };

    const handleClose = () => SetVer(false);

    // Mapeos de catálogos para SearchableSelect
    const labOptions = useMemo(() => (Array.isArray(laboratorios) ? laboratorios.map((l: { idLaboratorio: number; nombre: string }) => ({ value: l.idLaboratorio, label: l.nombre })) : []), [laboratorios]);
    const tipoOptions = useMemo(() => (Array.isArray(tiposProducto) ? tiposProducto.map((t: { idTipoProd: number; nombre: string }) => ({ value: t.idTipoProd, label: t.nombre })) : []), [tiposProducto]);
    const presentaOptions = useMemo(() => (Array.isArray(presentaciones) ? presentaciones.map((p: { idPresentacion: number; nombre: string }) => ({ value: p.idPresentacion, label: p.nombre })) : []), [presentaciones]);
    const principioOptions = useMemo(
        () => (Array.isArray(principiosActivosList) ? principiosActivosList.map((p: { idPrincipioActivo: number; nombre: string }) => ({ value: p.idPrincipioActivo, label: p.nombre })) : []),
        [principiosActivosList]
    );

    const labChip: SearchableOption[] =
        (laboratorio.idLaboratorio ?? 0) > 0 && laboratorio.nombre ? [{ value: laboratorio.idLaboratorio!, label: laboratorio.nombre }] : [];
    const labCustoms: string[] = !(laboratorio.idLaboratorio ?? 0) && laboratorio.nombre ? [laboratorio.nombre] : [];
    const presentaChip: SearchableOption[] =
        (presentacion.idPresentacion ?? 0) > 0 && presentacion.nombre ? [{ value: presentacion.idPresentacion!, label: presentacion.nombre }] : [];
    const presentaCustoms: string[] = !(presentacion.idPresentacion ?? 0) && presentacion.nombre ? [presentacion.nombre] : [];

    if (!SendValor) return null;

    return (
        <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={handleClose} />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="upd-prod-title"
                className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border overflow-hidden"
                style={{ borderColor: C.border }}
            >
                {/* ── HEADER (verde degradado para diferenciarlo del modal de creación) */}
                <div
                    className="px-6 py-5 border-b"
                    style={{ background: "linear-gradient(135deg, #2D6A4F, #52B788)", borderColor: "#1B4332" }}
                >
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <div>
                                <h2 id="upd-prod-title" className="text-xl font-bold text-white tracking-tight">
                                    Editar Producto
                                </h2>
                                <p className="text-xs text-green-100 mt-0.5">
                                    Modificando: <span className="font-semibold">{SendValor.nombreGenerico ?? SendValor.nombreComercial ?? ""}</span>
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleClose}
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

                            {/* ID oculto */}
                            <input type="hidden" {...register("idProducto")} />

                            {/* ── Código de barra ──────────────────────────────────────── */}
                            <div className="md:col-span-2">
                                <Field id="upd-codigoBarra" label="Código de Barra" required>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                            </svg>
                                        </div>
                                        <input id="upd-codigoBarra" type="text" placeholder="Ej: 7501234567890"
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                                            style={{ borderColor: C.border, color: C.text }}
                                            {...register("codigoBarra", { required: "El código de barra es obligatorio" })}
                                        />
                                    </div>
                                    {errors.codigoBarra && <ErrorMessage>{errors.codigoBarra.message}</ErrorMessage>}
                                </Field>
                                {watch("codigoBarra") && (
                                    <div className="mt-2 flex flex-col items-center p-2.5 bg-green-50/30 rounded-xl border border-dashed border-green-200">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-green-700 mb-1">Vista Previa del Código</span>
                                        <BarcodeRenderer value={watch("codigoBarra")} width={1.8} height={40} enableDownload={true} />
                                    </div>
                                )}
                            </div>

                            {/* ── Nombre Comercial ─────────────────────────────────────── */}
                            <Field id="upd-nombreComercial" label="Nombre Comercial" optional>
                                <input id="upd-nombreComercial" type="text" placeholder="Ej: Tylenol..."
                                    className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                                    style={{ borderColor: C.border, color: C.text }}
                                    {...register("nombreComercial")}
                                />
                            </Field>

                            {/* ── Precio ───────────────────────────────────────────────── */}
                            <Field id="upd-precio" label="Precio (Bs.)" required>
                                <div className="relative group">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 font-bold text-sm pointer-events-none">Bs.</span>
                                    <input id="upd-precio" type="number" step="0.01" min="0"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                                        style={{ borderColor: C.border, color: C.text }}
                                        {...register("precio", { required: "El precio es obligatorio", min: { value: 0, message: "Debe ser ≥ 0" } })}
                                    />
                                </div>
                                {errors.precio && <ErrorMessage>{errors.precio.message}</ErrorMessage>}
                            </Field>

                            {/* ── Stock Mínimo ─────────────────────────────────────────── */}
                            <Field id="upd-stockMinimo" label="Stock Mínimo" required>
                                <input id="upd-stockMinimo" type="number" min="0"
                                    className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                                    style={{ borderColor: C.border, color: C.text }}
                                    {...register("stockMinimo", { required: "Requerido", min: { value: 0, message: "Debe ser ≥ 0" } })}
                                />
                                {errors.stockMinimo && <ErrorMessage>{errors.stockMinimo.message}</ErrorMessage>}
                            </Field>

                            {/* ── Vía de Administración ─────────────────────────────────── */}
                            <Field id="upd-viaAdmin" label="Vía de Administración" optional>
                                <input id="upd-viaAdmin" type="text" placeholder="Ej: Oral, Tópica..."
                                    className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                                    style={{ borderColor: C.border, color: C.text }}
                                    {...register("viaAdministracion")}
                                />
                            </Field>

                            {/* ── Requiere Receta ──────────────────────────────────────── */}
                            <Field id="upd-requiereReceta" label="¿Requiere Receta?" required>
                                <select
                                    id="upd-requiereReceta"
                                    className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium appearance-none bg-white"
                                    style={{ borderColor: C.border, color: C.text }}
                                    {...register("requiereReceta", { required: "Seleccione una opción" })}
                                >
                                    <option value="0">No requiere receta</option>
                                    <option value="1">Sí requiere receta</option>
                                </select>
                                {errors.requiereReceta && <ErrorMessage>{errors.requiereReceta.message}</ErrorMessage>}
                            </Field>

                            {/* ── Principios Activos (N:M) ─────────────────────────────── */}
                            <div className="md:col-span-2 space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="block text-xs font-bold uppercase tracking-wider" style={{ color: C.dark }}>
                                        Principios Activos <span className="text-red-500">*</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setPrincipios((prev) => [...prev, { concentracion: "" }])}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-colors hover:bg-purple-50"
                                        style={{ borderColor: C.border, color: C.dark }}
                                    >
                                        + Agregar principio
                                    </button>
                                </div>
                                {tried && !princiValid && <ErrorMessage>Agregue al menos un principio activo</ErrorMessage>}
                                {principios.map((row, i) => (
                                    <div
                                        key={i}
                                        className="grid grid-cols-1 sm:grid-cols-[1fr,200px,auto] gap-3 items-start p-3 rounded-xl border"
                                        style={{ borderColor: C.border, background: "#FBF8FE" }}
                                    >
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
                                        <input
                                            type="text"
                                            value={row.concentracion ?? ""}
                                            onChange={(e) => updatePrincipio(i, { concentracion: e.target.value })}
                                            placeholder="Concentración (ej: 500 mg)"
                                            className="w-full px-3.5 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                                            style={{ borderColor: C.border, color: C.text }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removePrincipio(i)}
                                            title="Quitar principio"
                                            className="self-center w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* ── Tipos de Producto (N:M) ──────────────────────────────── */}
                            <div className="md:col-span-2 space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="block text-xs font-bold uppercase tracking-wider" style={{ color: C.dark }}>
                                        Tipos de Producto <span className="text-red-500">*</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setTipos((prev) => [...prev, {}])}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-colors hover:bg-purple-50"
                                        style={{ borderColor: C.border, color: C.dark }}
                                    >
                                        + Agregar tipo
                                    </button>
                                </div>
                                {tried && !tiposValid && <ErrorMessage>Agregue al menos un tipo de producto</ErrorMessage>}
                                {tipos.length === 0 && (
                                    <div className="text-xs text-gray-400 border border-dashed rounded-xl p-3 text-center" style={{ borderColor: C.border }}>
                                        Busca un tipo existente o escríbelo para crearlo al guardar.
                                    </div>
                                )}
                                {tipos.map((row, i) => (
                                    <div
                                        key={i}
                                        className="grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-3 items-start p-3 rounded-xl border"
                                        style={{ borderColor: C.border, background: "#FBF8FE" }}
                                    >
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
                                        <button
                                            type="button"
                                            onClick={() => removeTipo(i)}
                                            title="Quitar tipo"
                                            className="self-center w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* ── Laboratorio (con creación inline) ────────────────────── */}
                            <div className="space-y-1.5">
                                <label htmlFor="upd-labSearch" className="block text-xs font-bold uppercase tracking-wider" style={{ color: C.dark }}>
                                    Laboratorio <span className="text-red-500">*</span>
                                </label>
                                <SearchableSelect
                                    id="upd-labSearch"
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

                            {/* ── Presentación (con creación inline) ───────────────────── */}
                            <div className="space-y-1.5">
                                <label htmlFor="upd-presSearch" className="block text-xs font-bold uppercase tracking-wider" style={{ color: C.dark }}>
                                    Presentación <span className="text-red-500">*</span>
                                </label>
                                <SearchableSelect
                                    id="upd-presSearch"
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

                            {/* ── Descripción (ancho completo) ─────────────────────────── */}
                            <div className="space-y-1.5 md:col-span-2">
                                <label htmlFor="upd-descripcion" className="block text-xs font-bold uppercase tracking-wider" style={{ color: C.dark }}>
                                    Descripción <span className="ml-1 text-gray-400 font-normal normal-case text-xs">(opcional)</span>
                                </label>
                                <textarea id="upd-descripcion" rows={3}
                                    className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium resize-none"
                                    style={{ borderColor: C.border, color: C.text }}
                                    {...register("descripcion")}
                                />
                            </div>

                            {/* ── Contraindicaciones (ancho completo) ─────────────────── */}
                            <div className="space-y-1.5 md:col-span-2">
                                <label htmlFor="upd-contra" className="block text-xs font-bold uppercase tracking-wider" style={{ color: C.dark }}>
                                    Contraindicaciones <span className="ml-1 text-gray-400 font-normal normal-case text-xs">(opcional)</span>
                                </label>
                                <textarea id="upd-contra" rows={3}
                                    className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium resize-none"
                                    style={{ borderColor: C.border, color: C.text }}
                                    {...register("contraindicaciones")}
                                />
                            </div>

                            {/* ── Imagen ───────────────────────────────────────────────── */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: C.dark }}>
                                    Imagen del Producto{" "}
                                    <span className="ml-1 text-gray-400 font-normal normal-case text-xs">(opcional · actualizar imagen)</span>
                                </label>
                                <div
                                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed cursor-pointer hover:border-purple-400 transition-all"
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
                                            {imgPreview ? "Imagen actual / nueva selección" : "Haz clic para cambiar imagen"}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">Formatos: JPG, JPEG, PNG · máx. 5 MB</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png"
                                        className="hidden"
                                        ref={fileRef}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) setImgPreview(URL.createObjectURL(file));
                                        }}
                                    />
                                </div>
                            </div>

                        </div>{/* fin grid */}
                    </div>

                    {/* ── FOOTER ─────────────────────────────────────────────────── */}
                    <div
                        className="px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 border-t bg-gray-50/50"
                        style={{ borderColor: C.border }}
                    >
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-5 py-2.5 rounded-xl border-2 font-bold text-sm transition-all hover:bg-gray-100 active:scale-95"
                            style={{ borderColor: C.border, color: C.dark }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || isSubmitting}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all shadow-lg hover:shadow-green-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: "linear-gradient(135deg, #2D6A4F, #52B788)" }}
                        >
                            {isPending || isSubmitting ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Actualizando...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Guardar Cambios
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}