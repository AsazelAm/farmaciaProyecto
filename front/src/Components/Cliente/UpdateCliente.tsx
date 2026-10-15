import ErrorMessage from "../Error/ErrorMessage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import type { UpdateCliente } from "../../types";
import { UpdateClienteApi } from "../../Api/ClienteApi";
import { soloLetras, tecladoSoloLetras, tecladoSoloDigitos, tecladoTelefono } from "../../lib/validators";

// ─── Paleta de colores (igual que Cliente.tsx / UpdateProveedorr.tsx) ──────────
const C = {
  dark:   "#4A1A6E",
  medium: "#7B3FA0",
  light:  "#F3EBF9",
  border: "#D8B4F0",
};

type Props = Readonly<{
  SetVer:    React.Dispatch<React.SetStateAction<boolean>>;
  SendValor: UpdateCliente | null;
}>;

export default function UpdateClienteModal({ SetVer, SendValor }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateCliente>({
    defaultValues: {
      idCliente: SendValor?.idCliente ?? undefined,
      ci:        SendValor?.ci        ?? "",
      nombre:    SendValor?.nombre    ?? "",
      apellido:  SendValor?.apellido  ?? "",
      telefono:  SendValor?.telefono  ?? "",
      email:     SendValor?.email     ?? "",
    },
  });

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: UpdateClienteApi,
    onError: (error: Error) => toast.error(error.message),
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["ClienteAll"] });
      toast.success(results);
      reset();
      SetVer(false);
    },
  });

  const handleForm = (formdata: UpdateCliente) => {
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
                {/* Ícono de edición de persona */}
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Editar Cliente</h2>
                  <p className="text-xs text-purple-200">Actualiza la información del cliente</p>
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
              <input type="hidden" {...register("idCliente", { valueAsNumber: true })} />

              {/* ── Fila 1: CI + Nombre ──────────────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* CI */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="upd-ci"
                    className="block text-xs font-bold uppercase tracking-wider"
                    style={{ color: C.dark }}
                  >
                    Carnet de Identidad
                    <span className="ml-1 text-gray-400 font-normal normal-case text-xs">(opcional)</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0"
                        />
                      </svg>
                    </div>
                    <input
                      id="upd-ci"
                      type="text"
                      placeholder="Ej: 12345678"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                      style={{ borderColor: C.border, color: "#2D0A47" }}
                      {...register("ci", {
                        pattern: {
                          value: /^[0-9]{5,10}$/,
                          message: "El CI debe tener entre 5 y 10 dígitos",
                        },
                      })}
                      {...tecladoSoloDigitos}
                    />
                  </div>
                  {errors.ci && <ErrorMessage>{errors.ci.message}</ErrorMessage>}
                </div>

                {/* Nombre */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="upd-nombre"
                    className="block text-xs font-bold uppercase tracking-wider"
                    style={{ color: C.dark }}
                  >
                    Nombre <span className="text-red-500">*</span>
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
                      id="upd-nombre"
                      type="text"
                      placeholder="Nombre del cliente"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                      style={{ borderColor: C.border, color: "#2D0A47" }}
                      {...register("nombre", soloLetras("Nombre", {
                        required: "El nombre es obligatorio",
                        min: 2,
                        max: 100,
                      }))}
                      {...tecladoSoloLetras}
                    />
                  </div>
                  {errors.nombre && <ErrorMessage>{errors.nombre.message}</ErrorMessage>}
                </div>
              </div>

              {/* ── Fila 2: Apellido + Teléfono ─────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Apellido */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="upd-apellido"
                    className="block text-xs font-bold uppercase tracking-wider"
                    style={{ color: C.dark }}
                  >
                    Apellido
                    <span className="ml-1 text-gray-400 font-normal normal-case text-xs">(opcional)</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <input
                      id="upd-apellido"
                      type="text"
                      placeholder="Apellido del cliente"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                      style={{ borderColor: C.border, color: "#2D0A47" }}
                      {...register("apellido", soloLetras("Apellido", {
                        min: 2,
                        max: 100,
                      }))}
                      {...tecladoSoloLetras}
                    />
                  </div>
                  {errors.apellido && <ErrorMessage>{errors.apellido.message}</ErrorMessage>}
                </div>

                {/* Teléfono */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="upd-telefono"
                    className="block text-xs font-bold uppercase tracking-wider"
                    style={{ color: C.dark }}
                  >
                    Teléfono
                    <span className="ml-1 text-gray-400 font-normal normal-case text-xs">(opcional)</span>
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
                      id="upd-telefono"
                      type="text"
                      placeholder="Ej: +591 70012345"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                      style={{ borderColor: C.border, color: "#2D0A47" }}
                      {...register("telefono", {
                        maxLength: { value: 20, message: "Máximo 20 caracteres" },
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
              </div>

              {/* ── Email (campo completo) ────────────────────────────────── */}
              <div className="space-y-1.5">
                <label
                  htmlFor="upd-email"
                  className="block text-xs font-bold uppercase tracking-wider"
                  style={{ color: C.dark }}
                >
                  Correo Electrónico
                  <span className="ml-1 text-gray-400 font-normal normal-case text-xs">(opcional)</span>
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
                    id="upd-email"
                    type="email"
                    placeholder="cliente@correo.com"
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

              {/* ── Info box ─────────────────────────────────────────────── */}
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
                  Los campos <strong>CI</strong>, <strong>Apellido</strong>, <strong>Teléfono</strong> y{" "}
                  <strong>Email</strong> son opcionales. Los cambios se reflejarán
                  en el historial de compras asociado a este cliente.
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
