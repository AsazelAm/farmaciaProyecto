import {useMutation,useQueryClient}  from '@tanstack/react-query';
import { useForm } from "react-hook-form";
// Se eliminó el import de 'cerrar' ya que ahora usamos un botón con estilos Tailwind.
import { toast } from "react-toastify";
import type { UpdateExame } from '../../types';
import { UpdateExamenApi } from '../../Api/ExamenApi';

type Props = Readonly<{
    SetVer :React.Dispatch<React.SetStateAction<boolean>>;
    SendValor:UpdateExame | null;
}>
export default function UpdateExa({SetVer,SendValor}:Props) {

    // Se agrega 'isSubmitting' para el control del botón
    const{register,handleSubmit,reset, formState:{errors, isSubmitting}}=useForm<UpdateExame>({
        defaultValues:{
            id_exa:SendValor?.id_exa,
            Examen:SendValor?.Examen,
            codigo:SendValor?.codigo,
            Curso:SendValor?.Curso
        },
    });
    
    const queryClient=useQueryClient();
    // Se agrega 'isPending' para el estado de carga
    const {mutate, isPending}=useMutation({
        mutationFn:UpdateExamenApi,
        onError:(error)=>{
            toast.error(error.message);
        },
        onSuccess:(results)=>{
            queryClient.invalidateQueries({queryKey:["ExamenAll"]});
            toast.success(results);
            reset();
            SetVer(false)
        }
    })
    
    const handleForm=(formdata:UpdateExame)=>{
        mutate(formdata);
    }
    
    const handleClose = () => {
        SetVer(false);
    };

  return (
    // Contenedor principal del modal (Estilo AlumnoForm.tsx)
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl my-8"> {/* Ancho ajustado para Examen */}
        <form
          onSubmit={handleSubmit(handleForm)}
          noValidate
          className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          {/* Header (Estilo AlumnoForm.tsx) */}
          <div className="bg-gradient-to-r from-[#00155C] via-blue-700 to-indigo-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs uppercase tracking-widest font-semibold mb-1">
                  Sistema Académico
                </p>
                <h2 className="text-3xl font-bold text-white">Editar Examen</h2>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl bg-white/90 hover:bg-white text-gray-700 font-medium text-sm transition-all shadow-lg"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>

          {/* Content (Estructura de sección tipo AlumnoForm.tsx) */}
          <div className="p-8 space-y-8">
            {/* Datos del Examen */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  {/* Ícono representativo de edición/documento */}
                  <svg className="w-5 h-5 text-[#00155C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414l2.828 2.828m-2.828-2.828l-7.778 7.778a1 1 0 00-.293.707v4.586a1 1 0 001 1h4.586a1 1 0 00.707-.293l7.778-7.778m-2.828-2.828l-4.95 4.95M11 15h2v2h-2v-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Datos del Examen</h3>
              </div>

              {/* Campos de UpdateExa.tsx en 3 columnas */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Examen (6/12) */}
                <div className="flex flex-col col-span-12 lg:col-span-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Examen: <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00155C] focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm"
                    type="text"
                    placeholder="Ej: Examen Final de Base de Datos"
                    {...register("Examen", { required: "El Examen es importante" })}
                  />
                   {/* Se añadió el manejo de errores */}
                  {errors.Examen && (
                    <p className="mt-1.5 text-xs text-red-500">⚠ {errors.Examen.message}</p>
                  )}
                </div>

                {/* Codigo (3/12) */}
                <div className="flex flex-col col-span-12 lg:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Código: <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00155C] focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm"
                    type="text"
                    placeholder="Ej: BD-2024"
                    {...register("codigo", { required: "El Código es importante" })}
                  />
                   {/* Se añadió el manejo de errores */}
                  {errors.codigo && (
                    <p className="mt-1.5 text-xs text-red-500">⚠ {errors.codigo.message}</p>
                  )}
                </div>
                
                {/* Curso (3/12) */}
                <div className="flex flex-col col-span-12 lg:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Curso: <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00155C] focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm"
                    {...register("Curso", { required: "El Curso es importante" })}
                  >
                    <option value="">Seleccione una opción</option>
                    <option value="si">SI</option>
                    <option value="no">NO</option>
                  </select>
                   {/* Se añadió el manejo de errores */}
                  {errors.Curso && (
                    <p className="mt-1.5 text-xs text-red-500">⚠ {errors.Curso.message}</p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Footer (Estilo AlumnoForm.tsx) */}
          <div className="bg-gray-50 px-8 py-6 flex items-center justify-end gap-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isPending}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#00155C] to-blue-700 text-white font-semibold hover:from-blue-800 hover:to-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {isSubmitting || isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Guardando...
                </span>
              ) : (
                "Guardar Cambios"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}