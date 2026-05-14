import ErrorMessage from "../Error/ErrorMessage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import type { UpdateTipoProd } from "../../types";
import { UpdateTipoProdApi } from "../../Api/TipoProdApi";

type Props = Readonly<{
  SetVer:    React.Dispatch<React.SetStateAction<boolean>>;
  SendValor: UpdateTipoProd | null;
}>;

export default function UpdateTipoProducto({ SetVer, SendValor }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateTipoProd>({
    defaultValues: {
      idTipoProd: SendValor?.idTipoProd,
      nombre:       SendValor?.nombre,
    },
  });

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: UpdateTipoProdApi,
    onError: (error:Error) => toast.error(error.message),
    onSuccess: (results) => {
      // Invalidamos la query de Tipo de Producto para refrescar la tabla
      queryClient.invalidateQueries({ queryKey: ["TipoProdAll"] });
      toast.success(results);
      reset();
      SetVer(false);
    },
  });

  const handleForm = (formdata: UpdateTipoProd) => {
    mutate(formdata);
  };

  const handleClose = () => SetVer(false);

  return (
    <div className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm transition-opacity">
      {/* Overlay con desenfoque */}
      <div
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
          {/* HEADER - Degradado Lila */}
          <div
            className="px-6 py-5 border-b"
            style={{ 
                background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)", 
                borderColor: "#5C2680" 
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Editar Tipo de Producto</h2>
                  <p className="text-xs text-purple-200">Actualiza la información de la categoría</p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="p-2 px-4 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/25 transition-colors text-white"
              >
                Cerrar
              </button>
            </div>
          </div>

          {/* FORMULARIO */}
          <form onSubmit={handleSubmit(handleForm)}>
            <div className="px-6 py-8 space-y-6">
              
              {/* ID Oculto */}
              <input type="hidden" {...register("idTipoProd", { valueAsNumber: true })} />

              {/* Campo Nombre */}
              <div className="space-y-2">
                <label htmlFor="nombre" className="block text-sm font-bold uppercase tracking-wider" style={{ color: "#4A1A6E" }}>
                  Nombre del Tipo <span className="text-red-500">*</span>
                </label>

                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                      />
                    </svg>
                  </div>
                  <input
                    id="nombre"
                    type="text"
                    placeholder="Ej: Analgésicos, Suplementos..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium"
                    style={{ borderColor: "#D8B4F0", color: "#2D0A47" }}
                    {...register("nombre", {
                      required: "El nombre es obligatorio para actualizar",
                      minLength: { value: 3, message: "Debe tener al menos 3 caracteres" },
                    })}
                  />
                </div>

                {errors.nombre && (
                  <ErrorMessage>{errors.nombre.message}</ErrorMessage>
                )}
              </div>

              {/* Info Box Estilo Lila */}
              <div
                className="flex items-start gap-3 p-4 rounded-xl border"
                style={{ background: "#F3EBF9", borderColor: "#D8B4F0" }}
              >
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs leading-relaxed" style={{ color: "#4A1A6E" }}>
                  Los cambios realizados se aplicarán a todos los productos registrados bajo este tipo.
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
                className="px-5 py-2.5 rounded-xl border-2 font-bold text-sm transition-all hover:bg-purple-50 active:scale-95"
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