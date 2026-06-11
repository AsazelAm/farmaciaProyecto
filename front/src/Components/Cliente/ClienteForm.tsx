import ErrorMessage from "../Error/ErrorMessage";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AddClienteApi } from "../../Api/ClienteApi";
import type { CreateCliente } from "../../types";

// ─── Tipos de las props (igual que ProveedorForm) ─────────────────────────────
type Cua = Readonly<{
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
}>;

// ─── Clave para persistir el borrador en localStorage ────────────────────────
// Si el usuario cierra el modal accidentalmente, los datos se recuperan solos
const LOCAL_STORAGE_KEY = "ClienteFormData";

// ─── Paleta de colores (misma que ProveedorForm / Cliente.tsx) ────────────────
const C = {
  dark:   "#4A1A6E",
  medium: "#7B3FA0",
  light:  "#F3EBF9",
  border: "#D8B4F0",
  text:   "#2D0A47",
};

export default function ClienteForm({ setIsOpen, isOpen }: Cua) {

  // ── react-hook-form ────────────────────────────────────────────────────────
  // register     → conecta cada <input> con el estado interno del form
  // handleSubmit → envuelve el onSubmit validando primero todos los campos
  // reset        → limpia / precarga valores
  // watch        → emite cada cambio del form (lo usamos para guardar en localStorage)
  // formState    → contiene errors e isSubmitting
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateCliente>({
    // Valores iniciales vacíos para evitar campos "uncontrolled"
    defaultValues: {
      ci:       "",
      nombre:   "",
      apellido: "",
      telefono: "",
      email:    "",
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

  // ── useMutation para crear el cliente ─────────────────────────────────────
  // mutate(data) dispara la llamada POST a /Cliente/AddCliente
  // isPending = true mientras la petición está en vuelo → deshabilitamos el botón
  const { mutate, isPending } = useMutation({
    mutationFn: AddClienteApi,
    onError: (error: Error) => {
      toast.error(error.message);
    },
    onSuccess: (result) => {
      // Invalida la caché → Cliente.tsx recarga la tabla automáticamente
      queryClient.invalidateQueries({ queryKey: ["ClienteAll"] });
      toast.success(result ?? "Cliente registrado correctamente");
      reset(); // limpia el form
      localStorage.removeItem(LOCAL_STORAGE_KEY); // borra el borrador
      setIsOpen(false);
    },
  });

  // ── Submit del formulario ─────────────────────────────────────────────────
  // handleSubmit de react-hook-form primero valida, luego llama a esta función
  const handleForm = (formData: CreateCliente) => {
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
      {/* max-w-2xl para dar espacio a los 5 campos en grid 2 columnas */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title-cliente"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border overflow-hidden"
        style={{ borderColor: C.border }}
      >

        {/* ── HEADER con gradiente lila ───────────────────────────────────── */}
        <div
          className="px-6 py-5 border-b"
          style={{
            background:  "linear-gradient(135deg, #4A1A6E, #7B3FA0)",
            borderColor: "#5C2680",
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">

              {/* Ícono de persona / cliente */}
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              <div>
                <h2 id="modal-title-cliente" className="text-xl font-bold text-white tracking-tight">
                  Nuevo Cliente
                </h2>
                <p className="text-xs text-purple-200 mt-0.5">
                  Registra un nuevo cliente en el sistema
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

              {/* ── CAMPO: CI (Carnet de Identidad) ────────────────────────── */}
              {/* nullable en el type → no es required */}
              <div className="space-y-1.5">
                <label
                  htmlFor="ci"
                  className="block text-xs font-bold uppercase tracking-wider"
                  style={{ color: C.dark }}
                >
                  Carnet de Identidad
                  <span className="ml-1 text-gray-400 font-normal normal-case tracking-normal text-xs">(opcional)</span>
                </label>
                <div className="relative group">
                  {/* Ícono decorativo dentro del input */}
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                    </svg>
                  </div>
                  <input
                    id="ci"
                    type="text"
                    placeholder="Ej: 12345678"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                    style={{ borderColor: C.border, color: C.text }}
                    {...register("ci", {
                      // nullable en el type → no es required
                      pattern: {
                        value: /^[0-9]{5,10}$/,
                        message: "El CI debe tener entre 5 y 10 dígitos",
                      },
                    })}
                  />
                </div>
                {/* ErrorMessage solo se renderiza si el campo tiene error */}
                {errors.ci && <ErrorMessage>{errors.ci.message}</ErrorMessage>}
              </div>

              {/* ── CAMPO: NOMBRE ──────────────────────────────────────────── */}
              <div className="space-y-1.5">
                <label
                  htmlFor="nombre"
                  className="block text-xs font-bold uppercase tracking-wider"
                  style={{ color: C.dark }}
                >
                  Nombre del Cliente <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="nombre"
                    type="text"
                    placeholder="Ej: Juan, María..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                    style={{ borderColor: C.border, color: C.text }}
                    {...register("nombre", {
                      required: "El nombre es obligatorio",
                      minLength: { value: 2, message: "Mínimo 2 caracteres" },
                      maxLength: { value: 100, message: "Máximo 100 caracteres" },
                    })}
                  />
                </div>
                {errors.nombre && <ErrorMessage>{errors.nombre.message}</ErrorMessage>}
              </div>

              {/* ── CAMPO: APELLIDO ─────────────────────────────────────────── */}
              {/* nullable en el type → no es required */}
              <div className="space-y-1.5">
                <label
                  htmlFor="apellido"
                  className="block text-xs font-bold uppercase tracking-wider"
                  style={{ color: C.dark }}
                >
                  Apellido
                  <span className="ml-1 text-gray-400 font-normal normal-case tracking-normal text-xs">(opcional)</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input
                    id="apellido"
                    type="text"
                    placeholder="Ej: Pérez, González..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                    style={{ borderColor: C.border, color: C.text }}
                    {...register("apellido", {
                      minLength: { value: 2, message: "Mínimo 2 caracteres" },
                      maxLength: { value: 100, message: "Máximo 100 caracteres" },
                    })}
                  />
                </div>
                {errors.apellido && <ErrorMessage>{errors.apellido.message}</ErrorMessage>}
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
                  />
                </div>
                {errors.telefono && <ErrorMessage>{errors.telefono.message}</ErrorMessage>}
              </div>

              {/* ── CAMPO: EMAIL (ancho completo en grid) ──────────────────── */}
              {/* nullable en el type → no es required */}
              <div className="space-y-1.5 md:col-span-2">
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
                    placeholder="Ej: cliente@correo.com"
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

            </div>

            {/* ── CAJA INFORMATIVA (igual que ProveedorForm) ─────────────────── */}
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
                El <strong>CI</strong> y el <strong>email</strong> deben ser únicos en el sistema;
                no pueden estar registrados en otro cliente activo.
                Solo el <strong>Nombre</strong> es obligatorio <span className="text-red-500 font-bold">*</span>.
                Los demás campos son opcionales.
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
                  Guardar Cliente
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
