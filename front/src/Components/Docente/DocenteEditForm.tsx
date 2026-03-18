import { useForm } from "react-hook-form";
import ErrorMessage from "../Error/ErrorMessage";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { UpdateDocente, GetHabilidades, GetDocenteById, GethabilidadesById } from "../../Api/Docentes";

type Props = Readonly<{
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isOpen: boolean;
    docenteId: number;
}>;

type FormData = {
    nombre: string;
    apellido: string;
    celular: string;
    Email: string;
    url: string;
    formacion: string;
    descripcion: string;
    honorarios: string;
    img: File | null;
    cv: File | null;
    detalles: {
        id_ha: number;
    }[];
}

export default function DocenteEditForm({ setIsOpen, isOpen, docenteId }: Props) {
    const [selectedHabilidades, setSelectedHabilidades] = useState<
        { id_habi: number; n_habilidad: string }[]
    >([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredHabilidades, setFilteredHabilidades] = useState<
        { id_habi: number; n_habilidad: string }[]
    >([]);

    // Obtener datos del docente
    const { data: docenteData, isLoading: loadingDocente } = useQuery({
        queryKey: ["GetDocenteById", docenteId],
        queryFn: () => GetDocenteById(docenteId),
        enabled: !!docenteId && isOpen,
    });

    // Obtener habilidades del docente
    const { data: habilidadesDocente, isLoading: loadingHabilidades } = useQuery({
        queryKey: ["GethabilidadesById", docenteId],
        queryFn: () => GethabilidadesById(docenteId),
        enabled: !!docenteId && isOpen,
    });

    // Obtener todas las habilidades disponibles
    const { data: todasHabilidades } = useQuery({
        queryKey: ["GetAllHabilidades"],
        queryFn: GetHabilidades,
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            nombre: "",
            apellido: "",
            celular: "",
            Email: "",
            url: "",
            formacion: "",
            descripcion: "",
            honorarios: "",
            img: null,
            cv: null,
            detalles: [],
        },
    });

    // Cargar datos del docente en el formulario
    useEffect(() => {
        if (docenteData) {
            reset({
                nombre: docenteData.nombre || "",
                apellido: docenteData.apellido || "",
                celular: docenteData.telefono || "",
                Email: docenteData.Email || "",
                url: docenteData.Cvlink || "",
                formacion: docenteData.formacion || "",
                descripcion: docenteData.descripcion || "",
                honorarios: docenteData.honorarios || "",
                img: null,
                cv: null,
                detalles: [],
            });
        }
    }, [docenteData, reset]);

    // Cargar habilidades del docente
    useEffect(() => {
        if (habilidadesDocente && habilidadesDocente.length > 0) {
            const habilidadesMapped = habilidadesDocente.map((hab: any) => ({
                id_habi: hab.id_habi,
                n_habilidad: hab.n_habilidad
            }));
            setSelectedHabilidades(habilidadesMapped);
        }
    }, [habilidadesDocente]);

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => UpdateDocente(id, data),
        onError: (error: any) => {
            toast.error(error.message || 'Error al actualizar docente');
        },
        onSuccess: (results) => {
            queryClient.invalidateQueries({ queryKey: ["GetAllDocentes"] });
            queryClient.invalidateQueries({ queryKey: ["GetDocenteById", docenteId] });
            queryClient.invalidateQueries({ queryKey: ["GethabilidadesById", docenteId] });
            toast.success(results.message || 'Docente actualizado exitosamente');
            setIsOpen(false);
        },
    });

    const onSubmit = (data: FormData) => {
        // Validación: Verificar que haya al menos una habilidad
        if (selectedHabilidades.length === 0) {
            toast.error('Debes seleccionar al menos una habilidad');
            return;
        }

        const detallesMapped = selectedHabilidades.map((hab) => ({
            id_ha: hab.id_habi,
        }));

        const array1 = [
            {
                nombre: data.nombre,
                apellido: data.apellido,
                celular: data.celular,
                Email: data.Email,
                url: data.url,
                formacion: data.formacion,
                descripcion: data.descripcion,
                honorarios: data.honorarios,
            },
        ];

        // Obtener los archivos correctamente desde el FileList
        const imgFile = data.img && (data.img as any).length > 0 ? (data.img as any)[0] : null;
        const cvFile = data.cv && (data.cv as any).length > 0 ? (data.cv as any)[0] : null;

        console.log('Datos a actualizar:', { 
            id: docenteId, 
            array1, 
            array2: detallesMapped,
            img: imgFile ? 'archivo seleccionado' : 'sin archivo',
            cv: cvFile ? 'archivo seleccionado' : 'sin archivo'
        });

        mutation.mutate({
            id: docenteId,
            data: {
                array1,
                array2: detallesMapped,
                img: imgFile,
                cv: cvFile,
            }
        });
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        if (!todasHabilidades) return;
        if (searchTerm.trim() === "") {
            setFilteredHabilidades([]);
            return;
        }

        const filtered = todasHabilidades.filter(
            (hab: any) =>
                (hab.n_habilidad ?? "")
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) &&
                !selectedHabilidades.some((s) => s.id_habi === hab.id_habi)
        );
        setFilteredHabilidades(filtered);
    }, [searchTerm, todasHabilidades, selectedHabilidades]);

    const handleAddHabilidad = (habilidad: {
        id_habi: number;
        n_habilidad: string | null;
    }) => {
        const newHabilidad = {
            id_habi: habilidad.id_habi,
            n_habilidad: habilidad.n_habilidad ?? ""
        };
        
        setSelectedHabilidades((prev) => [...prev, newHabilidad]);
        setSearchTerm("");
        setFilteredHabilidades([]);
    };

    const handleRemoveHabilidad = (id_habi: number) => {
        setSelectedHabilidades((prev) =>
            prev.filter((h) => h.id_habi !== id_habi)
        );
    };

    if (loadingDocente || loadingHabilidades) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl p-8">
                    <div className="flex items-center gap-3">
                        <svg className="animate-spin h-8 w-8 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-gray-700 font-medium">Cargando datos del docente...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-blue-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                <div className="bg-blue-900 p-6 flex justify-between items-center">
                    <div>
                        <p className="text-white/80 text-sm uppercase tracking-wide">Sistema Académico</p>
                        <h2 className="text-3xl font-bold text-white">Editar Docente</h2>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>

                <div className="bg-white p-8 overflow-y-auto max-h-[calc(90vh-100px)]">
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                        {/* Información Personal */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-blue-700 p-2 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Información Personal</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Juan Carlos"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all outline-none"
                                        {...register("nombre", { required: "Los nombres son importantes" })}
                                    />
                                    {errors.nombre && <ErrorMessage>{errors.nombre.message}</ErrorMessage>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Apellidos <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Pérez González"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all outline-none"
                                        {...register("apellido", { required: "Los apellidos son importantes" })}
                                    />
                                    {errors.apellido && <ErrorMessage>{errors.apellido.message}</ErrorMessage>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Celular <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 77123456"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all outline-none"
                                        {...register("celular", { required: "El celular es importante" })}
                                    />
                                    {errors.celular && <ErrorMessage>{errors.celular.message}</ErrorMessage>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Formación <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Ing. Sistemas"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all outline-none"
                                        {...register("formacion", { required: "La formación es importante" })}
                                    />
                                    {errors.formacion && <ErrorMessage>{errors.formacion.message}</ErrorMessage>}
                                </div>
                            </div>
                        </div>

                        {/* Información de Contacto */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-blue-700 p-2 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Información de Contacto</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="ejemplo@correo.com"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all outline-none"
                                        {...register("Email", { 
                                            required: "El email es importante",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Email no válido"
                                            }
                                        })}
                                    />
                                    {errors.Email && <ErrorMessage>{errors.Email.message}</ErrorMessage>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Link del CV <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="https://..."
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all outline-none"
                                        {...register("url", { required: "El link es importante" })}
                                    />
                                    {errors.url && <ErrorMessage>{errors.url.message}</ErrorMessage>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Honorarios $us. <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all outline-none"
                                        {...register("honorarios", { 
                                            required: "Los honorarios son importantes",
                                            min: { value: 0, message: "Los honorarios deben ser mayor o igual a 0" }
                                        })}
                                    />
                                    {errors.honorarios && <ErrorMessage>{errors.honorarios.message}</ErrorMessage>}
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Descripción <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        placeholder="Descripción del docente..."
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all outline-none resize-none"
                                        {...register("descripcion", { required: "La descripción es importante" })}
                                    />
                                    {errors.descripcion && <ErrorMessage>{errors.descripcion.message}</ErrorMessage>}
                                </div>
                            </div>
                        </div>

                        {/* Archivos */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-emerald-500 p-2 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Archivos</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Imagen del Docente {docenteData?.img && <span className="text-xs text-green-600">(Actual: {docenteData.img})</span>}
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        {...register("img")}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-700 file:text-white file:cursor-pointer hover:file:bg-blue-800"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Deja vacío para mantener la imagen actual</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        CV del Docente (PDF) {docenteData?.cv && <span className="text-xs text-green-600">(Actual: {docenteData.cv})</span>}
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        {...register("cv")}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-700 file:text-white file:cursor-pointer hover:file:bg-blue-800"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Deja vacío para mantener el CV actual</p>
                                </div>
                            </div>
                        </div>

                        {/* Habilidades */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-emerald-500 p-2 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Habilidades <span className="text-red-500">*</span>
                                </h3>
                            </div>

                            {selectedHabilidades.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {selectedHabilidades.map((hab) => (
                                        <div
                                            key={hab.id_habi}
                                            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium"
                                        >
                                            {hab.n_habilidad}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveHabilidad(hab.id_habi)}
                                                className="hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {selectedHabilidades.length === 0 && (
                                <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-sm text-amber-700">
                                        ⚠️ Debes seleccionar al menos una habilidad
                                    </p>
                                </div>
                            )}

                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar y añadir habilidad (Ej: React, Python)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all outline-none"
                                />

                                {filteredHabilidades.length > 0 && (
                                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                        {filteredHabilidades.map((hab) => (
                                            <button
                                                key={hab.id_habi}
                                                type="button"
                                                onClick={() => handleAddHabilidad(hab)}
                                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                                            >
                                                {hab.n_habilidad}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {searchTerm.trim() !== "" && filteredHabilidades.length === 0 && (
                                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl p-4">
                                        <p className="text-sm text-gray-500 text-center">No se encontraron habilidades</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Botón de Submit */}
                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-8 py-3 bg-blue-800 hover:bg-blue-900 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-blue-300/50 disabled:opacity-50"
                                disabled={mutation.isPending}
                            >
                                {mutation.isPending ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Actualizando...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Actualizar Docente
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