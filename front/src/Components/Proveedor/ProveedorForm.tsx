import ErrorMessage from "../Error/ErrorMessage";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { addProveedorApi } from "../../Api/ProveedorApi";
import type { CreateProveedor } from "../../types";
import { soloLetras, alfanumerico, textoLibre, tecladoSoloLetras, tecladoAlfanumerico, tecladoTelefono } from "../../lib/validators";

// ─── Tipos de las props (igual que TipoProductoForm) ─────────────────────────
type Cua = Readonly<{
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
}>;

// ─── Clave para persistir el borrador en localStorage ────────────────────────
// Si el usuario cierra el modal accidentalmente, los datos se recuperan solos
const LOCAL_STORAGE_KEY = "ProveedorFormData";

// ─── Paleta de colores (misma que Presentacion / Proveedor) ──────────────────
const C = {
  dark:   "#4A1A6E",
  medium: "#7B3FA0",
  light:  "#F3EBF9",
  border: "#D8B4F0",
  text:   "#2D0A47",
};

export default function ProveedorForm({ setIsOpen, isOpen }: Cua) {

  // ── react-hook-form ────────────────────────────────────────────────────────
  // register   → conecta cada <input> con el estado interno del form
  // handleSubmit → envuelve el onSubmit validando primero todos los campos
  // reset      → limpia / precarga valores
  // watch      → emite cada cambio del form (lo usamos para guardar en localStorage)
  // formState  → contiene errors e isSubmitting
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateProveedor>({
    // Valores iniciales vacíos para evitar campos "uncontrolled"
    defaultValues: {
      codigo:           "",
      nombre:           "",
      telefono:         "",
      email:            "",
      direccion:        "",
      contactoPrincipal: "",
    },
  });

  // ── Recuperar borrador guardado al abrir el modal ──────────────────────────
  // useEffect con [] se ejecuta UNA SOLA VEZ al montar el componente.
  // Si existe un borrador previo lo inyectamos con reset() para no perder el trabajo.
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        reset(JSON.parse(saved));
      } catch {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, [reset]);

  // ── Persistir cambios en localStorage mientras el modal está abierto ───────
  // watch() retorna una suscripción que emite en cada cambio de cualquier campo.
  // La guardamos como borrador. Al cerrar (isOpen = false) cancelamos la suscripción
  // con el cleanup de useEffect (return unsubscribe).
  useEffect(() => {
    if (!isOpen) return;
    const { unsubscribe } = watch((values) =>
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(values))
    );
    return unsubscribe;
  }, [watch, isOpen]);

  const queryClient = useQueryClient();

  // ── useMutation para crear el proveedor ───────────────────────────────────
  // mutate(data) dispara la llamada POST a /Proveedor/AddProveedor
  // isPending = true mientras la petición está en vuelo → deshabilitamos el botón
  const { mutate, isPending } = useMutation({
    mutationFn: addProveedorApi,
    onError: (error: Error) => {
      toast.error(error.message);
    },
    onSuccess: (result) => {
      // Invalida la caché → Proveedor.tsx recarga la tabla automáticamente
      queryClient.invalidateQueries({ queryKey: ["ProveedorAll"] });
      toast.success(result ?? "Proveedor registrado correctamente");
      reset(); // limpia el form
      localStorage.removeItem(LOCAL_STORAGE_KEY); // borra el borrador
      setIsOpen(false);
    },
  });

  // ── Submit del formulario ─────────────────────────────────────────────────
  // handleSubmit de react-hook-form primero valida, luego llama a esta función
  const handleForm = (formData: CreateProveedor) => {
    mutate(formData);
  };

  // ── Cerrar modal y borrar borrador ────────────────────────────────────────
  const handleClose = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    reset();
    setIsOpen(false);
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    // Overlay fijo que cubre toda la pantalla con fondo oscuro + blur
    <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

      {/* Click en el fondo cierra el modal */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* ── TARJETA DEL MODAL ─────────────────────────────────────────────── */}
      {/* relative para estar encima del overlay absoluto */}
      {/* max-w-2xl para dar espacio a los 6 campos en grid 2 columnas */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border overflow-hidden"
        style={{ borderColor: C.border }}
      >

        {/* ── HEADER con gradiente lila ───────────────────────────────────── */}
        <div
          className="px-6 py-5 border-b"
          style={{
            background:   "linear-gradient(135deg, #4A1A6E, #7B3FA0)",
            borderColor:  "#5C2680",
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">

              {/* Ícono de proveedor/empresa */}
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>

              <div>
                <h2 id="modal-title" className="text-xl font-bold text-white tracking-tight">
                  Nuevo Proveedor
                </h2>
                <p className="text-xs text-purple-200 mt-0.5">
                  Registra un nuevo proveedor en el sistema
                </p>
              </div>
            </div>

            {/* Botón cerrar en esquina superior derecha */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Cerrar modal"
              className="p-2 px-4 flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/25 transition-colors text-white text-sm font-semibold flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cerrar
            </button>
          </div>
        </div>

        {/* ── CUERPO DEL FORMULARIO ───────────────────────────────────────── */}
        {/* overflow-y-auto para que en móvil se pueda hacer scroll si el modal es muy alto */}
        <form onSubmit={handleSubmit(handleForm)}>
          <div className="px-6 py-6 overflow-y-auto max-h-[65vh]">

            {/* GRID 2 columnas en pantallas md+, 1 columna en móvil */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* ── CAMPO: CÓDIGO ──────────────────────────────────────────── */}
              {/* El código sigue el formato LB-001, DI-001, IM-001, GE-001    */}
              <div className="space-y-1.5">
                <label
                  htmlFor="codigo"
                  className="block text-xs font-bold uppercase tracking-wider"
                  style={{ color: C.dark }}
                >
                  Código <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  {/* Ícono decorativo dentro del input */}
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <input
                    id="codigo"
                    type="text"
                    placeholder="Ej: LB-001, DI-002, IM-003..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                    style={{ borderColor: C.border, color: C.text }}
                    // register conecta el input con react-hook-form y define las validaciones
                    {...register("codigo", alfanumerico("Código", {
                      required: "El código es obligatorio",
                      min: 3,
                      max: 30,
                    }))}
                    {...tecladoAlfanumerico}
                  />
                </div>
                {/* ErrorMessage solo se renderiza si el campo tiene error */}
                {errors.codigo && <ErrorMessage>{errors.codigo.message}</ErrorMessage>}

                {/* Guía visual de tipos de código debajo del campo */}
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {[
                    { key: "LB", label: "Laboratorio",  bg: "#EFF6FF", color: "#1d4ed8" },
                    { key: "DI", label: "Distribuidora", bg: "#FFFBEB", color: "#b45309" },
                    { key: "IM", label: "Importadora",   bg: "#ECFDF5", color: "#065f46" },
                    { key: "GE", label: "Insumos Gen.",  bg: "#F5F3FF", color: "#5b21b6" },
                  ].map((t) => (
                    <span
                      key={t.key}
                      className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: t.bg, color: t.color }}
                    >
                      {t.key} · {t.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* ── CAMPO: NOMBRE ──────────────────────────────────────────── */}
              <div className="space-y-1.5">
                <label
                  htmlFor="nombre"
                  className="block text-xs font-bold uppercase tracking-wider"
                  style={{ color: C.dark }}
                >
                  Nombre del Proveedor <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                    </svg>
                  </div>
                  <input
                    id="nombre"
                    type="text"
                    placeholder="Ej: Farmacorp S.A., Droguería..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                    style={{ borderColor: C.border, color: C.text }}
                    {...register("nombre", soloLetras("Nombre", {
                      required: "El nombre es obligatorio",
                      min: 3,
                      max: 150,
                    }))}
                    {...tecladoSoloLetras}
                  />
                </div>
                {errors.nombre && <ErrorMessage>{errors.nombre.message}</ErrorMessage>}
              </div>

              {/* ── CAMPO: TELÉFONO ────────────────────────────────────────── */}
              {/* nullable en el type → no es required */}
              <div className="space-y-1.5">
                <label
                  htmlFor="telefono"
                  className="block text-xs font-bold uppercase tracking-wider"
                  style={{ color: C.dark }}
                >
                  Teléfono
                  <span className="ml-1 text-gray-400 font-normal normal-case tracking-normal text-xs">(opcional)</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    id="telefono"
                    type="tel"
                    placeholder="Ej: 76543210"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                    style={{ borderColor: C.border, color: C.text }}
                    {...register("telefono", {
                      // No es required porque en el type es nullable
                      pattern: {
                        value: /^[0-9+\-\s()]{6,20}$/,
                        message: "Número de teléfono inválido",
                      },
                    })}
                    {...tecladoTelefono}
                  />
                </div>
                {errors.telefono && <ErrorMessage>{errors.telefono.message}</ErrorMessage>}
              </div>

              {/* ── CAMPO: EMAIL ───────────────────────────────────────────── */}
              {/* nullable en el type → no es required */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-wider"
                  style={{ color: C.dark }}
                >
                  Correo Electrónico
                  <span className="ml-1 text-gray-400 font-normal normal-case tracking-normal text-xs">(opcional)</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="Ej: ventas@proveedor.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                    style={{ borderColor: C.border, color: C.text }}
                    {...register("email", {
                      // Solo valida el formato si se escribe algo
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Formato de email inválido",
                      },
                    })}
                  />
                </div>
                {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
              </div>

              {/* ── CAMPO: DIRECCIÓN (ancho completo en grid) ─────────────── */}
              <div className="space-y-1.5 md:col-span-2">
                <label
                  htmlFor="direccion"
                  className="block text-xs font-bold uppercase tracking-wider"
                  style={{ color: C.dark }}
                >
                  Dirección
                  <span className="ml-1 text-gray-400 font-normal normal-case tracking-normal text-xs">(opcional)</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-3.5 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  {/* textarea para dirección — permite texto más largo */}
                  <textarea
                    id="direccion"
                    rows={2}
                    placeholder="Ej: Av. Beni 3er Anillo, Santa Cruz de la Sierra"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium resize-none"
                    style={{ borderColor: C.border, color: C.text }}
                    {...register("direccion", textoLibre("Dirección", { max: 200 }))}
                  />
                </div>
                {errors.direccion && <ErrorMessage>{errors.direccion.message}</ErrorMessage>}
              </div>

              {/* ── CAMPO: CONTACTO PRINCIPAL (ancho completo) ────────────── */}
              <div className="space-y-1.5 md:col-span-2">
                <label
                  htmlFor="contactoPrincipal"
                  className="block text-xs font-bold uppercase tracking-wider"
                  style={{ color: C.dark }}
                >
                  Contacto Principal
                  <span className="ml-1 text-gray-400 font-normal normal-case tracking-normal text-xs">(opcional)</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="contactoPrincipal"
                    type="text"
                    placeholder="Ej: Ing. Ramírez, Lic. Torres..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                    style={{ borderColor: C.border, color: C.text }}
                    {...register("contactoPrincipal", soloLetras("Contacto Principal", {
                      min: 2,
                      max: 100,
                    }))}
                    {...tecladoSoloLetras}
                  />
                </div>
                {errors.contactoPrincipal && (
                  <ErrorMessage>{errors.contactoPrincipal.message}</ErrorMessage>
                )}
              </div>
            </div>

            {/* ── CAJA INFORMATIVA (igual que TipoProductoForm) ─────────────── */}
            <div
              className="flex items-start gap-3 p-4 rounded-xl border mt-5"
              style={{ backgroundColor: C.light, borderColor: C.border }}
            >
              <div style={{ color: C.medium }} className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: C.dark }}>
                El <strong>código</strong> debe ser único y seguir el formato del tipo de proveedor
                (LB, DI, IM o GE). El <strong>email</strong> tampoco puede estar duplicado en el sistema.
                Los campos marcados con <span className="text-red-500 font-bold">*</span> son obligatorios.
              </p>
            </div>
          </div>

          {/* ── FOOTER con botones ──────────────────────────────────────────── */}
          <div
            className="px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 border-t bg-gray-50/50"
            style={{ borderColor: C.border }}
          >
            {/* Botón Cancelar */}
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl border-2 font-bold text-sm transition-all hover:bg-gray-100 active:scale-95 order-2 sm:order-1"
              style={{ borderColor: C.border, color: C.dark }}
            >
              Cancelar
            </button>

            {/* Botón Guardar — deshabilitado mientras isPending o isSubmitting */}
            <button
              type="submit"
              disabled={isPending || isSubmitting}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all shadow-lg hover:shadow-purple-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
              style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}
            >
              {/* Spinner mientras se está guardando */}
              {isPending || isSubmitting ? (
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
                  Guardar Proveedor
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}