import ErrorMessage from "../Error/ErrorMessage";
// Eliminamos imports de clear/cerrar.png ya que usamos botones con estilos Tailwind
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AddCertificacion } from "../../Api/Certificaciones";
import type { CreateCert } from "../../types";

type Cua = Readonly<{
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isOpen: boolean;
}>;

const LOCAL_STORAGE_KEY = 'CertForm';
export default function CertForm({ setIsOpen, isOpen }: Cua) {

    
    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<CreateCert>({
    defaultValues: {
      n_cert:'',
      opcion:'',
      nota:'',
      tipo:''
    }
  });

// funcionalidad de localstorage (Mantenida)
    useEffect(() => {
    const loadSavedData = () => {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      const defaultValues = {
        n_cert:'',
        opcion:'',
        nota:'',
        tipo:''
      };
      
      reset(savedData ? JSON.parse(savedData) : defaultValues);
    };

    loadSavedData();
  }, [reset]);
 
  useEffect(() => {
    if (!isOpen) return;

    const subscription = watch((formValues) => {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formValues));
    });

    return () => subscription.unsubscribe();
  }, [watch, isOpen]);
 
  // finish localstorage

  const queryClient = useQueryClient();
  // Se añade isPending al useMutation (para el botón de carga)
  const { mutate, isPending } = useMutation({
    mutationFn: AddCertificacion,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["GetCertificacionAll"] });
      toast.success(results);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      reset();
      setIsOpen(false);
    }
  });

  const handleForm = (data: CreateCert) => {
    mutate(data)
  };

  const handleClose = () => {
    setIsOpen(false);
  };
    
  const handleReset = async () => {
  try {
    reset({
      n_cert:'',
      opcion:'',
      nota:'',
      tipo:''
    }, {
      keepDefaultValues: true 
    });
    
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    toast.info("Formulario limpiado"); // Notificación para el usuario
  } catch (error) {
    console.error("Reset error:", error);
  }
};

  return (
    // Contenedor principal del modal (Estilo AlumnoForm.tsx)
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl my-8">
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
                <h2 className="text-3xl font-bold text-white">Registrar Certificación</h2>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-all shadow-lg"
                >
                  Limpiar
                </button>
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
            {/* Datos de la Certificación */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  {/* Ícono representativo de Certificación */}
                  <svg className="w-5 h-5 text-[#00155C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-5 8a9 9 0 01-9-9V6a2 2 0 012-2h14a2 2 0 012 2v9a9 9 0 01-9 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Datos de la Certificación</h3>
              </div>

              {/* Campos de CertForm.tsx en 2 columnas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Columna izquierda (Nombre y Nota) */}
                <div className="space-y-6">
                  {/* Nombre Certificación */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="n_cert">
                      Nombre Certificación: <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00155C] focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm"
                      type="text"
                      placeholder="Ej: Certificación AWS"
                      {...register("n_cert", { required: "El Nombre es importante" })}
                    />
                    {errors.n_cert && (
                       <ErrorMessage>{errors.n_cert.message}</ErrorMessage>
                    )}
                  </div>

                  {/* Nota - Observación */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="nota">
                      Nota - Observación:
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00155C] focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm"
                      type="text"
                      placeholder="Ej: Certificado con 95/100"
                      {...register("nota")}
                    />
                  </div>
                </div>

                {/* Columna derecha (Examen y Opción) */}
                <div className="space-y-6">
                  {/* Tipo (Examen) */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="tipo">
                      Examen: <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00155C] focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm"
                      {...register("tipo", { required: "El examen es importante" })}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="si">SI</option>
                      <option value="no">NO</option>
                    </select>
                    {errors.tipo && (
                       <ErrorMessage>{errors.tipo.message}</ErrorMessage>
                    )}
                  </div>

                  {/* Opción */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="opcion">
                      Opción: <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00155C] focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm"
                      {...register("opcion", { required: "La opción es importante" })}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="Curso Obligatorio">Curso Obligatorio</option>
                      <option value="Curso Opcional">Curso Opcional</option>
                    </select>
                    {errors.opcion && (
                       <ErrorMessage>{errors.opcion.message}</ErrorMessage>
                    )}
                  </div>
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
                "Guardar Certificación"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}