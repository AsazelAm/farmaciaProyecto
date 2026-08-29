import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import BarcodeRenderer from "../../lib/BarcodeRenderer";
import { UpdateProductoApi, GetProductoApi } from "../../Api/ProductoApi";
import { GetLaboratorioApi } from "../../Api/LaboratorioApi";
import { GetTipoProdApi } from "../../Api/TipoProdApi";
import { GetPresentaApi } from "../../Api/PresentacionApi";
import ErrorMessage from "../Error/ErrorMessage";
import type { UpdateProducto } from "../../types";

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

// ─── Helper: arma FormData ───────────────────────────────────────────────────
function buildFormData(values: Omit<UpdateProducto, "img" | "newImg">, file?: File | null): FormData {
    const fd = new FormData();
    const record = values as Record<string, unknown>;
    (Object.keys(record) as string[]).forEach((k) => {
        const v = record[k];
        if (v !== null && v !== undefined && k !== "img" && k !== "newImg") {
            fd.append(k, String(v));
        }
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

export default function UpdateProductoModal({ SendValor, SetVer }: Props) {
    const queryClient = useQueryClient();

    const [imgPreview, setImgPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement | null>(null);

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
            nombreGenerico: SendValor.nombreGenerico ?? "",
            nombreComercial: SendValor.nombreComercial ?? "",
            concentracion: SendValor.concentracion ?? "",
            descripcion: SendValor.descripcion ?? "",
            precio: SendValor.precio ?? 0,
            requiereReceta: SendValor.requiereReceta ?? 0,
            contraindicaciones: SendValor.contraindicaciones ?? "",
            viaAdministracion: SendValor.viaAdministracion ?? "",
            stockMinimo: SendValor.stockMinimo ?? 0,
            idLaboratorio: SendValor.idLaboratorio ?? 0,
            idTipoProd: SendValor.idTipoProd ?? 0,
            idPresentacion: SendValor.idPresentacion ?? 0,
        });
        // Mostrar imagen actual del producto (si existe)
        const publicUrl = toPublicUrl(SendValor.img);
        setImgPreview(publicUrl);
    }, [SendValor, reset]);

    // ── Queries para los selects ─────────────────────────────────────────────
    const { data: laboratorios = [] } = useQuery({ queryKey: ["LaboratorioAll"], queryFn: GetLaboratorioApi });
    const { data: tiposProducto = [] } = useQuery({ queryKey: ["TipoProdAll"], queryFn: GetTipoProdApi });
    const { data: presentaciones = [] } = useQuery({ queryKey: ["PresentacionAll"], queryFn: GetPresentaApi });

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

    const handleForm = (values: UpdateProducto) => {
        if (!SendValor) return;

        // ── Validar código de barra único (excluyendo este mismo producto) ─────
        const codigo = String(values.codigoBarra ?? "").trim();
        const yaExiste = Array.isArray(productos) && productos.some(
            (p: UpdateProducto) => Number(p.idProducto) !== Number(SendValor.idProducto) &&
                String(p.codigoBarra).trim() === codigo
        );
        if (yaExiste) {
            toast.warning("El código de barra ya está registrado en otro producto");
            return;
        }

        const file = fileRef.current?.files?.[0] ?? null;
        mutate({ fd: buildFormData(values, file), id: SendValor.idProducto });
    };

    const handleClose = () => SetVer(false);

    if (!SendValor) return null;

    // Field helper se movió afuera para evitar pérdida de focus al recrearse.

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
                                    Modificando: <span className="font-semibold">{SendValor.nombreGenerico}</span>
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
                                {/* Preview del Código de Barra */}
                                {watch("codigoBarra") && (
                                    <div className="mt-2 flex flex-col items-center p-2.5 bg-green-50/30 rounded-xl border border-dashed border-green-200">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-green-700 mb-1">Vista Previa del Código</span>
                                        <BarcodeRenderer value={watch("codigoBarra")} width={1.8} height={40} enableDownload={true} />
                                    </div>
                                )}
                            </div>

                            {/* ── Nombre Genérico ──────────────────────────────────────── */}
                            <Field id="upd-nombreGenerico" label="Nombre Genérico" required>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <input id="upd-nombreGenerico" type="text" placeholder="Ej: Paracetamol"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                                        style={{ borderColor: C.border, color: C.text }}
                                        {...register("nombreGenerico", { required: "El nombre genérico es obligatorio" })}
                                    />
                                </div>
                                {errors.nombreGenerico && <ErrorMessage>{errors.nombreGenerico.message}</ErrorMessage>}
                            </Field>

                            {/* ── Nombre Comercial ─────────────────────────────────────── */}
                            <Field id="upd-nombreComercial" label="Nombre Comercial" optional>
                                <input id="upd-nombreComercial" type="text" placeholder="Ej: Tylenol..."
                                    className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                                    style={{ borderColor: C.border, color: C.text }}
                                    {...register("nombreComercial")}
                                />
                            </Field>

                            {/* ── Concentración ────────────────────────────────────────── */}
                            <Field id="upd-concentracion" label="Concentración" optional>
                                <input id="upd-concentracion" type="text" placeholder="Ej: 500 mg"
                                    className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                                    style={{ borderColor: C.border, color: C.text }}
                                    {...register("concentracion")}
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

                            {/* ── Laboratorio ──────────────────────────────────────────── */}
                            <Field id="upd-idLaboratorio" label="Laboratorio" required>
                                <select
                                    id="upd-idLaboratorio"
                                    className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium appearance-none bg-white"
                                    style={{ borderColor: C.border, color: C.text }}
                                    {...register("idLaboratorio", {
                                        required: "Seleccione un laboratorio",
                                        validate: (v) => Number(v) > 0 || "Seleccione un laboratorio",
                                    })}
                                >
                                    <option value="0">-- Seleccione --</option>
                                    {Array.isArray(laboratorios) && laboratorios.map((l: { idLaboratorio: number; nombre: string }) => (
                                        <option key={l.idLaboratorio} value={l.idLaboratorio}>{l.nombre}</option>
                                    ))}
                                </select>
                                {errors.idLaboratorio && <ErrorMessage>{errors.idLaboratorio.message}</ErrorMessage>}
                            </Field>

                            {/* ── Tipo de Producto ─────────────────────────────────────── */}
                            <Field id="upd-idTipoProd" label="Tipo de Producto" required>
                                <select
                                    id="upd-idTipoProd"
                                    className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium appearance-none bg-white"
                                    style={{ borderColor: C.border, color: C.text }}
                                    {...register("idTipoProd", {
                                        required: "Seleccione un tipo",
                                        validate: (v) => Number(v) > 0 || "Seleccione un tipo",
                                    })}
                                >
                                    <option value="0">-- Seleccione --</option>
                                    {Array.isArray(tiposProducto) && tiposProducto.map((t: { idTipoProd: number; nombre: string }) => (
                                        <option key={t.idTipoProd} value={t.idTipoProd}>{t.nombre}</option>
                                    ))}
                                </select>
                                {errors.idTipoProd && <ErrorMessage>{errors.idTipoProd.message}</ErrorMessage>}
                            </Field>

                            {/* ── Presentación ─────────────────────────────────────────── */}
                            <Field id="upd-idPresentacion" label="Presentación" required>
                                <select
                                    id="upd-idPresentacion"
                                    className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium appearance-none bg-white"
                                    style={{ borderColor: C.border, color: C.text }}
                                    {...register("idPresentacion", {
                                        required: "Seleccione una presentación",
                                        validate: (v) => Number(v) > 0 || "Seleccione una presentación",
                                    })}
                                >
                                    <option value="0">-- Seleccione --</option>
                                    {Array.isArray(presentaciones) && presentaciones.map((p: { idPresentacion: number; nombre: string }) => (
                                        <option key={p.idPresentacion} value={p.idPresentacion}>{p.nombre}</option>
                                    ))}
                                </select>
                                {errors.idPresentacion && <ErrorMessage>{errors.idPresentacion.message}</ErrorMessage>}
                            </Field>

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
