import ErrorMessage from "../Error/ErrorMessage";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AddTipoUsApi } from "../../Api/TipoUsApi";
import type { CreateTipo_us } from "../../types";

type Cua = Readonly<{
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
}>;

const LOCAL_STORAGE_KEY = "TipoUsFormData";

export default function TipoUsForm({ setIsOpen, isOpen }: Cua) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateTipo_us>({
    defaultValues: { name_rol: "" },
  });

  // Al montar: restaura borrador guardado
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) reset(JSON.parse(saved));
  }, [reset]);

  // Mientras el modal está abierto: persiste cambios en localStorage
  useEffect(() => {
    if (!isOpen) return;
    const { unsubscribe } = watch((values) =>
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(values))
    );
    return unsubscribe;
  }, [watch, isOpen]);

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: AddTipoUsApi,
    onError:   (error)   => toast.error(error.message),
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["TipoUsAll"] });
      toast.success(results);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      reset();
      setIsOpen(false);
    },
  });

  const handleFaorm = (data: CreateTipo_us) => {
    mutate(data);
  } ;

  const handleClose = () => setIsOpen(false);

  const handleReset = () => {
    reset({ name_rol: "" }, { keepDefaultValues: true });
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    toast.info("Formulario limpiado");
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        className="fixed z-[130] inset-0 flex items-center justify-center p-4"
      >
        <div
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl border overflow-hidden"
          style={{ borderColor: "#D8B4F0" }}
        >
          {/* HEADER */}
          <div
            className="px-6 py-5 border-b"
            style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)", borderColor: "#5C2680" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Nuevo Tipo de Usuario</h2>
                  <p className="text-xs text-purple-200">Registra un nuevo rol en el sistema</p>
                </div>
              </div>

              <button
                onClick={handleClose}
                title="Cerrar"
                className="p-2 px-4 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/25 transition-colors text-white"
              >
                Cerrar
              </button>
            </div>
          </div>

          {/* FORMULARIO */}
          <form onSubmit={handleSubmit( handleFaorm ) }>
            <div className="px-6 py-6 space-y-5">

              {/* Campo nombre */}
              <div className="space-y-1.5">
                <label htmlFor="name_rol" className="block text-sm font-semibold" style={{ color: "#4A1A6E" }}>
                  Nombre del Rol <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5" style={{ color: "#7B3FA0" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    id="name_rol"
                    type="text"
                    placeholder="Ej: Administrador, Farmacéutico..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none text-sm transition-colors"
                    style={{ borderColor: "#D8B4F0", color: "#2D0A47" }}
                    {...register("name_rol", {
                      required: "El nombre del rol es obligatorio",
                      minLength: { value: 2, message: "Debe tener al menos 2 caracteres" },
                    })}
                  />
                </div>

                {errors.name_rol && (
                  <ErrorMessage>{errors.name_rol.message}</ErrorMessage>
                )}
              </div>

              {/* Info */}
              <div
                className="flex items-start gap-3 px-4 py-3 rounded-xl border"
                style={{ background: "#F3EBF9", borderColor: "#D8B4F0" }}
              >
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#7B3FA0" }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xs leading-relaxed" style={{ color: "#4A1A6E" }}>
                  El tipo de usuario define los permisos y accesos dentro del sistema farmacéutico.
                </p>
              </div>
            </div>

            {/* FOOTER */}
            <div
              className="px-6 py-4 flex justify-between gap-3 border-t"
              style={{ background: "#F3EBF9", borderColor: "#D8B4F0" }}
            >
              {/* Limpiar */}
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all hover:bg-purple-100"
                style={{ borderColor: "#D8B4F0", color: "#4A1A6E" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Limpiar
              </button>

              <div className="flex gap-3">
                {/* Cancelar */}
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all hover:bg-purple-100"
                  style={{ borderColor: "#D8B4F0", color: "#4A1A6E" }}
                >
                  Cancelar
                </button>

                {/* Guardar */}
                <button
                  type="submit"
                  disabled={isPending || isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      Guardar
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}   