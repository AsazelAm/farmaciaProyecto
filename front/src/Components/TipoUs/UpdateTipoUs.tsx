import ErrorMessage from "../Error/ErrorMessage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import type { UpdateTipo_us } from "../../types";
import { UpdateTipoUsApi } from "../../Api/TipoUsApi";

type Props = Readonly<{
  SetVer:    React.Dispatch<React.SetStateAction<boolean>>;
  SendValor: UpdateTipo_us | null;
}>;

export default function UpdateTipoUs({ SetVer, SendValor }: Props){
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateTipo_us>({
    defaultValues: {
      idTipoUs: SendValor?.idTipoUs,
      nameRol:   SendValor?.nameRol,
    },
  });

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: UpdateTipoUsApi,
    onError:   (error)   => toast.error(error.message),
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["TipoUsAll"] });
      toast.success(results);
      reset();
      SetVer(false);
    },
  });

  
    const handleForm=(formdata:UpdateTipo_us)=>{
        mutate(formdata);
    }
    
  const handleClose = () => SetVer(false);

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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Editar Tipo de Usuario</h2>
                  <p className="text-xs text-purple-200">Modifica el rol seleccionado</p>
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
          <form onSubmit={handleSubmit(handleForm)}>
            <div className="px-6 py-6 space-y-5">

              <input type="hidden" {...register("idTipoUs", { valueAsNumber: true })} />
              {/* Campo: Nombre del Rol */}
              <div className="space-y-1.5">
                <label htmlFor="nameRol" className="block text-sm font-semibold" style={{ color: "#4A1A6E" }}>
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
                    id="nameRol"
                    type="text"
                    placeholder="Ej: Administrador, Farmacéutico..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none text-sm transition-colors"
                    style={{ borderColor: "#D8B4F0", color: "#2D0A47" }}
                    {...register("nameRol", {
                      required: "El nombre del rol es obligatorio",
                      minLength: { value: 2, message: "Debe tener al menos 2 caracteres" },
                    })}
                  />
                </div>

                {errors.nameRol && (
                  <ErrorMessage>{errors.nameRol.message}</ErrorMessage>
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
                  Los cambios se aplicarán a todos los usuarios que tengan este rol asignado.
                </p>
              </div>
            </div>

            {/* FOOTER */}
            <div
              className="px-6 py-4 flex justify-end gap-3 border-t"
              style={{ background: "#F3EBF9", borderColor: "#D8B4F0" }}
            >
              {/* Cancelar */}
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all hover:bg-purple-100"
                style={{ borderColor: "#D8B4F0", color: "#4A1A6E" }}
              >
                Cancelar
              </button>

              {/* Actualizar */}
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
                    Actualizando...
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
    </>
  );
}