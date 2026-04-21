import ErrorMessage from "../Error/ErrorMessage";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AddPresentaApi } from "../../Api/PresentacionApi";
import type { CreatePresenta } from "../../types";

type Cua = Readonly<{
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isOpen: boolean;
}>;

const LOCAL_STORAGE_KEY = "PresentacionFormData";

export default function PresentacionForm({ setIsOpen, isOpen }: Cua) {
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<CreatePresenta>({
        defaultValues: { nombre: "" },
    });

    // Restaurar borrador desde localStorage al montar el componente
    useEffect(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) reset(JSON.parse(saved));
    }, [reset]);

    // Guardar cambios en localStorage mientras el usuario escribe
    useEffect(() => {
        if (!isOpen) return;
        const { unsubscribe } = watch((values) =>
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(values))
        );
        return unsubscribe;
    }, [isOpen, watch]);

    const { mutate, isPending } = useMutation({
        mutationFn: AddPresentaApi,
        onSuccess: (data) => {
            toast.success(data); // Mensaje de éxito desde el backend
            queryClient.invalidateQueries({ queryKey: ["PresentaAll"] });
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            reset();
            setIsOpen(false);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const handleForm = (formData: CreatePresenta) => mutate(formData);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header con el degradado solicitado */}
                <div 
                    className="px-8 py-6 text-white flex justify-between items-center"
                    style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}
                >
                    <div>
                        <h2 className="text-2xl font-bold">Nueva Presentación</h2>
                        <p className="text-purple-100 text-sm mt-1">Registra una nueva categoría de producto</p>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="bg-white/10 hover:bg-white/20 p-2 px-4 rounded-xl transition-colors"
                    >
                        Cerrar
                    </button>
                </div>

                <form onSubmit={handleSubmit(handleForm)} className="p-8 space-y-6" noValidate>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                            Nombre de la Presentación
                        </label>
                        <input
                            type="text"
                            placeholder="Ej. Tabletas, Jarabe, Inyectable..."
                            className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-purple-500 focus:ring-0 transition-all outline-none"
                            {...register("nombre", {
                                required: "El nombre de la presentación es obligatorio",
                            })}
                        />
                        {errors.nombre && <ErrorMessage>{errors.nombre.message}</ErrorMessage>}
                    </div>

                    <div className="flex gap-4 pt-4">
                        {/* Botón Cancelar */}
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-100 text-gray-500 font-semibold hover:bg-gray-50 transition-all"
                        >
                            Cancelar
                        </button>

                        {/* Botón Guardar con el degradado y estructura de TipoUsForm */}
                        <button
                            type="submit"
                            disabled={isPending || isSubmitting}
                            className="flex-[2] flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all shadow-lg hover:shadow-purple-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}
                        >
                            {isPending || isSubmitting ? (
                                <>
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Registrar Presentación
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}