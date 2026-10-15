import { useForm } from "react-hook-form";
import ErrorMessage from "../Error/ErrorMessage";
import { useState, type ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AddLaboraApi } from "../../Api/LaboratorioApi";
import { soloLetras, tecladoSoloLetras } from "../../lib/validators";

type Cua = Readonly<{
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isOpen: boolean;
}>;

type FormDataFields = {
    nombre: string;
    img: FileList | null;
};

// Estilos extraídos de UsuarioForm
const inputStyles = "w-full p-3 border-2 rounded-xl outline-none focus:ring-2 focus:ring-[#7B3FA0] transition-all border-[#D8B4F0] text-[#2D0A47]";
const labelStyles = "block text-sm font-semibold text-[#4A1A6E] mb-1";

export default function LaboratorioForm({ setIsOpen, isOpen }: Cua) {
    const [preview, setPreview] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormDataFields>();

    const mutation = useMutation({
        mutationFn: AddLaboraApi,
        onError: (error: Error) => {
            toast.error(error.message);
        },
        onSuccess: (data) => {
            toast.success(data.message || "Laboratorio creado correctamente");
            queryClient.invalidateQueries({ queryKey: ["LaboratoriosAll"] });
            handleClose();
        }
    });

    const handleClose = () => {
        reset();
        setPreview(null);
        setIsOpen(false);
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const onSubmit = (data: FormDataFields) => {
        const formData = new FormData();
        formData.append("nombre", data.nombre);
        if (data.img && data.img[0]) {
            formData.append("img", data.img[0]);
        }
        mutation.mutate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-purple-100">
                {/* Header */}
                <div className="p-6 text-white flex justify-between items-center" style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}>
                    <div>
                        <h2 className="text-2xl font-bold">Nuevo Laboratorio</h2>
                        <p className="text-purple-100 text-sm">Registra un nuevo proveedor médico</p>
                    </div>
                    <button onClick={handleClose} className="p-2 px-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                       Cerrar
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6" noValidate>
                    {/* Campo Nombre */}
                    <div className="space-y-1">
                        <label htmlFor="nombre" className={labelStyles}>Nombre del Laboratorio</label>
                        <input
                            id="nombre"
                            type="text"
                            placeholder="Ej: Laboratorios Bagó"
                            className={inputStyles}
                            {...register("nombre", soloLetras("Nombre", { required: "El nombre es obligatorio", min: 2, max: 100 }))}
                            {...tecladoSoloLetras}
                        />
                        {errors.nombre && <ErrorMessage>{errors.nombre.message}</ErrorMessage>}
                    </div>

                    {/* Manejo de Imagen / Logo */}
                    <div className="space-y-2">
                        <label className={labelStyles}>Logo o Imagen del Laboratorio</label>
                        <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-[#D8B4F0] rounded-2xl bg-[#F3EBF9]/30">
                            {preview ? (
                                <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-md border-2 border-white">
                                    <img src={preview} alt="Vista previa" className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => setPreview(null)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center text-purple-400">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            
                            <input
                                type="file"
                                accept="image/*"
                                className="block w-full text-sm text-purple-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
                                {...register("img")}
                                onChange={(e) => {
                                    register("img").onChange(e);
                                    handleImageChange(e);
                                }}
                            />
                        </div>
                    </div>

                    {/* Botón Guardar */}
                    <button
                        type="submit"
                        disabled={mutation.isPending || isSubmitting}
                        className="w-full py-4 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-purple-500/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}
                    >
                        {mutation.isPending || isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Guardando...
                            </div>
                        ) : (
                            "Registrar Laboratorio"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}