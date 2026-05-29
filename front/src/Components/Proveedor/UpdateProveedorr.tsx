import ErrorMessage from "../Error/ErrorMessage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import type { UpdateProveedor } from "../../types";
import { UpdateProveedorApi } from "../../Api/ProveedorApi";

// ─── Paleta de colores (igual que Proveedor.tsx / UpdateTipoProducto.tsx) ─────
const C = {
  dark:   "#4A1A6E",
  medium: "#7B3FA0",
  light:  "#F3EBF9",
  border: "#D8B4F0",
};

type Props = Readonly<{
  SetVer:    React.Dispatch<React.SetStateAction<boolean>>;
  SendValor: UpdateProveedor | null;
}>;

export default function UpdateProveedorr({ SetVer, SendValor }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProveedor>({
    defaultValues: {
      idProveedor:      SendValor?.idProveedor,
      codigo:           SendValor?.codigo       ?? "",
      nombre:           SendValor?.nombre       ?? "",
      telefono:         SendValor?.telefono     ?? "",
      email:            SendValor?.email        ?? "",
      direccion:        SendValor?.direccion    ?? "",
      contactoPrincipal: SendValor?.contactoPrincipal ?? "",
    },
  });

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: UpdateProveedorApi,
    onError: (error: Error) => toast.error(error.message),
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["ProveedorAll"] });
      toast.success(results);
      reset();
      SetVer(false);
    },
  });

  const handleForm = (formdata: UpdateProveedor) => {
    mutate(formdata);
  };

  const handleClose = () => SetVer(false);

  return (
    <div className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm transition-opacity">

      {/* Overlay: click fuera cierra el modal */}
      <div className="fixed inset-0" onClick={handleClose} />

      {/* Modal centrado */}
      <div
        role="dialog"
        aria-modal="true"
        className="fixed z-[160] inset-0 flex items-center justify-center p-4"
      >
        <div
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border overflow-hidden"
          style={{ borderColor: C.border }}
        >

          {/* ── HEADER ─────────────────────────────────────────────────────── */}
          <div
            className="px-6 py-5 border-b"
            style={{
              background:  "linear-gradient(135deg, #4A1A6E, #7B3FA0)",
              borderColor: "#5C2680",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Ícono de edición */}
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Editar Proveedor</h2>
                  <p className="text-xs text-purple-200">Actualiza la información del proveedor</p>
                </div>
              </div>

              {/* Botón cerrar */}
              <button
                onClick={handleClose}
                className="p-2 px-4 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/25 transition-colors text-white font-semibold text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>

          {/* ── FORMULARIO ─────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit(handleForm)}>

            {/* Scroll interno si el modal es muy alto */}
            <div className="px-6 py-6 space-y-5 max-h-[65vh] overflow-y-auto">

              {/* ID oculto */}
              <input type="hidden" {...register("idProveedor", { valueAsNumber: true })} />

              {/* ── Fila 1: Código + Nombre ─────────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Código */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="codigo"
                    className="block text-xs font-bold uppercase tracking-wider"
                    style={{ color: C.dark }}
                  >
                    Código <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                      {/* Ícono tag/etiqueta */}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                    </div>
                    <input
                      id="codigo"
                      type="text"
                      placeholder="Ej: LB-001"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                      style={{ borderColor: C.border, color: "#2D0A47" }}
                      {...register("codigo", {
                        required: "El código es obligatorio",
                        minLength: { value: 2, message: "Mínimo 2 caracteres" },
                        maxLength: { value: 30, message: "Máximo 30 caracteres" },
                      })}
                    />
                  </div>
                  {errors.codigo && <ErrorMessage>{errors.codigo.message}</ErrorMessage>}
                </div>

                {/* Nombre */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="nombre"
                    className="block text-xs font-bold uppercase tracking-wider"
                    style={{ color: C.dark }}
                  >
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <input
                      id="nombre"
                      type="text"
                      placeholder="Nombre del proveedor"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                      style={{ borderColor: C.border, color: "#2D0A47" }}
                      {...register("nombre", {
                        required: "El nombre es obligatorio",
                        minLength: { value: 3, message: "Mínimo 3 caracteres" },
                        maxLength: { value: 150, message: "Máximo 150 caracteres" },
                      })}
                    />
                  </div>
                  {errors.nombre && <ErrorMessage>{errors.nombre.message}</ErrorMessage>}
                </div>
              </div>

              {/* ── Fila 2: Teléfono + Email ────────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Teléfono */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="telefono"
                    className="block text-xs font-bold uppercase tracking-wider"
                    style={{ color: C.dark }}
                  >
                    Teléfono
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <input
                      id="telefono"
                      type="text"
                      placeholder="Ej: +591 70012345"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                      style={{ borderColor: C.border, color: "#2D0A47" }}
                      {...register("telefono", {
                        maxLength: { value: 20, message: "Máximo 20 caracteres" },
                      })}
                    />
                  </div>
                  {errors.telefono && <ErrorMessage>{errors.telefono.message}</ErrorMessage>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold uppercase tracking-wider"
                    style={{ color: C.dark }}
                  >
                    Email
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      placeholder="proveedor@correo.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                      style={{ borderColor: C.border, color: "#2D0A47" }}
                      {...register("email", {
                        maxLength: { value: 100, message: "Máximo 100 caracteres" },
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

              {/* ── Dirección (campo completo) ────────────────────────────── */}
              <div className="space-y-1.5">
                <label
                  htmlFor="direccion"
                  className="block text-xs font-bold uppercase tracking-wider"
                  style={{ color: C.dark }}
                >
                  Dirección
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <textarea
                    id="direccion"
                    rows={2}
                    placeholder="Av. principal, ciudad, país..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium resize-none"
                    style={{ borderColor: C.border, color: "#2D0A47" }}
                    {...register("direccion", {
                      maxLength: { value: 200, message: "Máximo 200 caracteres" },
                    })}
                  />
                </div>
                {errors.direccion && <ErrorMessage>{errors.direccion.message}</ErrorMessage>}
              </div>

              {/* ── Contacto Principal ───────────────────────────────────── */}
              <div className="space-y-1.5">
                <label
                  htmlFor="contactoPrincipal"
                  className="block text-xs font-bold uppercase tracking-wider"
                  style={{ color: C.dark }}
                >
                  Contacto Principal
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    id="contactoPrincipal"
                    type="text"
                    placeholder="Nombre del contacto"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                    style={{ borderColor: C.border, color: "#2D0A47" }}
                    {...register("contactoPrincipal", {
                      maxLength: { value: 100, message: "Máximo 100 caracteres" },
                    })}
                  />
                </div>
                {errors.contactoPrincipal && (
                  <ErrorMessage>{errors.contactoPrincipal.message}</ErrorMessage>
                )}
              </div>

              {/* ── Info box (igual que UpdateTipoProducto) ───────────────── */}
              <div
                className="flex items-start gap-3 p-4 rounded-xl border"
                style={{ background: C.light, borderColor: C.border }}
              >
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xs leading-relaxed" style={{ color: C.dark }}>
                  Los campos <strong>Teléfono</strong>, <strong>Email</strong>, <strong>Dirección</strong> y{" "}
                  <strong>Contacto Principal</strong> son opcionales. Los cambios se reflejarán
                  en todos los productos asociados a este proveedor.
                </p>
              </div>
            </div>

            {/* ── FOOTER ─────────────────────────────────────────────────── */}
            <div
              className="px-6 py-4 flex justify-end gap-3 border-t bg-gray-50/50"
              style={{ borderColor: C.border }}
            >
              {/* Cancelar */}
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl border-2 font-bold text-sm transition-all hover:bg-purple-50 active:scale-95"
                style={{ borderColor: C.border, color: C.dark }}
              >
                Cancelar
              </button>

              {/* Guardar */}
              <button
                type="submit"
                disabled={isPending || isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all shadow-lg hover:shadow-purple-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}
              >
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
                    Actualizar
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}