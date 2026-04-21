import ErrorMessage from "../Error/ErrorMessage";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AddTipoProdApi } from "../../Api/TipoProdApi";
import type { CreateTipoProd } from "../../types";

type Props = Readonly<{
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
}>;

const LOCAL_STORAGE_KEY = "TipoProdFormData";

export default function TipoProductoForm({ setIsOpen, isOpen }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateTipoProd>({
    defaultValues: { nombre: "" },
  });

  // Recuperar borrador al montar el componente
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      reset(JSON.parse(saved));
    }
  }, [reset]);

  // Persistir cambios en localStorage mientras el modal está abierto
  useEffect(() => {
    if (!isOpen) return;
    const { unsubscribe } = watch((values) =>
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(values))
    );
    return unsubscribe;
  }, [watch, isOpen]);

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: AddTipoProdApi,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["TipoProdAll"] });
      toast.success(results);
      reset({ nombre: "" });
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setIsOpen(false);
    },
  });

  const handleForm = (formdata: CreateTipoProd) => {
    mutate(formdata);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm transition-opacity">
      <div
        onClick={handleClose}
      />

      {/* Contenedor del Modal */}
      <div
        role="dialog"
        aria-modal="true"
        className="fixed z-[130] inset-0 flex items-center justify-center p-4"
      >
        <div
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl border overflow-hidden transform transition-all"
          style={{ borderColor: "#D8B4F0" }}
        >
          {/* HEADER con degradado lila */}
          <div
            className="px-6 py-5 border-b"
            style={{
              background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)",
              borderColor: "#5C2680",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Nuevo Tipo de Producto</h2>
                  <p className="text-xs text-purple-200">Registra una nueva categoría en el sistema</p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className=" p-2 px-4 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/25 transition-colors text-white"
              >
                Cerrar
              </button>
            </div>
          </div>

          {/* CUERPO DEL FORMULARIO */}
          <form onSubmit={handleSubmit(handleForm)}>
            <div className="px-6 py-8 space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="nombre"
                  className="block text-sm font-bold uppercase tracking-wider"
                  style={{ color: "#4A1A6E" }}
                >
                  Nombre del Tipo <span className="text-red-500">*</span>
                </label>

                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-purple-600">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="nombre"
                    type="text"
                    placeholder="Ej. Antibióticos, Analgésicos..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                    style={{ borderColor: "#D8B4F0", color: "#2D0A47" }}
                    {...register("nombre", {
                      required: "El nombre es obligatorio",
                      minLength: { value: 3, message: "Mínimo 3 caracteres" },
                    })}
                  />
                </div>
                {errors.nombre && <ErrorMessage>{errors.nombre.message}</ErrorMessage>}
              </div>

              {/* Caja Informativa */}
              <div
                className="flex items-start gap-3 p-4 rounded-xl border bg-opacity-50"
                style={{ backgroundColor: "#F3EBF9", borderColor: "#D8B4F0" }}
              >
                <div className="text-purple-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "#4A1A6E" }}>
                  Asegúrate de no duplicar nombres existentes para mantener la integridad de los datos.
                </p>
              </div>
            </div>

            {/* FOOTER */}
            <div
              className="px-6 py-4 flex justify-end gap-3 border-t bg-gray-50/50"
              style={{ borderColor: "#D8B4F0" }}
            >
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl border-2 font-bold text-sm transition-all hover:bg-gray-100 active:scale-95"
                style={{ borderColor: "#D8B4F0", color: "#4A1A6E" }}
              >
                Cancelar
              </button>

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
                    Guardar Tipo
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