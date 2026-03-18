import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { CreateAdmins } from "../../types";
import { AddUser, GetCityCoutryAdminAPI } from "../../Api/UserApi";
import { GetRol } from "../../Api/Rol";
import { GetCountryAPI } from "../../Api/Country";
import Loading from "../../Helpers/Loading";

type Cua = Readonly<{
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isOpen: any;
}>;

const LOCAL_STORAGE_KEY = 'UserAdm';

export default function useFormAdM({ setIsOpen, isOpen }: Cua) {

    const { data } = useQuery({
        queryKey: ['GetAllRol'],
        queryFn: GetRol
    });

    const { data: cont, isLoading: isloadingCountr } = useQuery({
        queryKey: ['GetAllCountry'],
        queryFn: GetCountryAPI
    });

    const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<CreateAdmins>({
        defaultValues: {
            nombre: '',
            apellido: '',
            Email: '',
            telefono: '',
            id_city: 0,
            id_country: 0,
            ci: 0,
            id_rol: 0,
            Passwd: '',
            Passwd_Confirmation: ''
        }
    });

    //funcionalidad de localstorage 
    useEffect(() => {
        const loadSavedData = () => {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            const defaultValues = {
                nombre: '',
                apellido: '',
                Email: '',
                telefono: '',
                id_city: 0,
                id_country: 0,
                ci: 0,
                id_rol: 0,
                Passwd: '',
                Passwd_Confirmation: ''
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

    //finish
    const queryClient = useQueryClient();
    const { mutate, isPending } = useMutation({
        mutationFn: AddUser,
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: (results) => {
            queryClient.invalidateQueries({ queryKey: ["GetAllUser"] });
            toast.success(results);
            reset();
            setIsOpen(!isOpen);
        }
    });

    const handleForm = (data: CreateAdmins) => {
        mutate(data)
    };

    //funcionalidad de localstorage 
    const handleClose = () => {
        setIsOpen(false);
    };

    const handleReset = async () => {
        try {
            // Clear form synchronously
            reset({
                nombre: '',
            }, {
                keepDefaultValues: true // Important for controlled forms
            });

            localStorage.removeItem(LOCAL_STORAGE_KEY);
        } catch (error) {
            console.error("Reset error:", error);
        }
    };

    const selectedCountry = watch('id_country');
    const { data: cityCo, isLoading: isloadingCityCountr } = useQuery({
        queryKey: ["GetAllCityAdminCountry", selectedCountry],
        queryFn: () => GetCityCoutryAdminAPI(selectedCountry),
        enabled: !!selectedCountry && selectedCountry > 0,
    });

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const countryId = parseInt(e.target.value) || 0;
        setValue('id_country', countryId);
        setValue('id_city', 0);
    };

    const getCityPlaceholder = () => {
        if (!selectedCountry) return "Primero seleccione un país";
        if (isloadingCityCountr) return "Cargando ciudades...";
        return "Seleccione una ciudad";
    };

    const password = watch('Passwd');

    if (isloadingCountr) return <Loading />

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-4xl my-8">
                <form
                    onSubmit={handleSubmit(handleForm)}
                    noValidate
                    className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#00155C] via-blue-700 to-indigo-700 px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-xs uppercase tracking-widest font-semibold mb-1">
                                    Sistema Académico
                                </p>
                                <h2 className="text-3xl font-bold text-white">Registrar Usuario</h2>
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

                    {/* Content */}
                    <div className="p-8 space-y-8">
                        {/* Información Personal */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-100">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-[#00155C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Información Personal</h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nombre <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00155C] focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm"
                                        placeholder="Ej: Juan Carlos"
                                        {...register("nombre", { required: "El nombre es importante" })}
                                    />
                                    {errors.nombre && (
                                        <p className="mt-1.5 text-xs text-red-500">⚠ {errors.nombre.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Apellidos <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00155C] focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm"
                                        placeholder="Ej: Pérez González"
                                        {...register("apellido", { required: "El apellido es importante" })}
                                    />
                                    {errors.apellido && (
                                        <p className="mt-1.5 text-xs text-red-500">⚠ {errors.apellido.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Carnet de Identidad <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00155C] focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm font-mono"
                                        placeholder="Ej: 12345678"
                                        {...register("ci", { required: "El CI es importante" })}
                                    />
                                    {errors.ci && (
                                        <p className="mt-1.5 text-xs text-red-500">⚠ {errors.ci.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Rol <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00155C] focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm"
                                        {...register("id_rol", { required: "El rol es obligatorio" })}
                                    >
                                        <option value="">Seleccione un Rol</option>
                                        {data?.map((item) => (
                                            <option key={item.id_rol} value={item.id_rol}>
                                                {item.name_rol}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.id_rol && (
                                        <p className="mt-1.5 text-xs text-red-500">⚠ {errors.id_rol.message}</p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Información de Contacto */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 pb-3 border-b-2 border-purple-100">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Información de Contacto</h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-sm"
                                        placeholder="ejemplo@correo.com"
                                        {...register("Email", { required: "El email es importante" })}
                                    />
                                    {errors.Email && (
                                        <p className="mt-1.5 text-xs text-red-500">⚠ {errors.Email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Celular <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-sm"
                                        placeholder="Ej: 77123456"
                                        {...register("telefono", { required: "El teléfono es importante" })}
                                    />
                                    {errors.telefono && (
                                        <p className="mt-1.5 text-xs text-red-500">⚠ {errors.telefono.message}</p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Ubicación */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 pb-3 border-b-2 border-emerald-100">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Ubicación</h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        País <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none text-sm"
                                        {...register("id_country", { required: "El país es obligatorio" })}
                                        onChange={handleCountryChange}
                                    >
                                        <option value="">Seleccione el país</option>
                                        {cont?.map((item) => (
                                            <option key={item.id_country} value={item.id_country}>
                                                {item.pais}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.id_country && (
                                        <p className="mt-1.5 text-xs text-red-500">⚠ {errors.id_country.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Ciudad <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        {...register("id_city", { required: "La ciudad es obligatoria" })}
                                        disabled={!selectedCountry}
                                    >
                                        <option value="">{getCityPlaceholder()}</option>
                                        {cityCo?.map((item) => (
                                            <option key={item.id_city} value={item.id_city}>
                                                {item.city}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.id_city && (
                                        <p className="mt-1.5 text-xs text-red-500">⚠ {errors.id_city.message}</p>
                                    )}
                                    {!selectedCountry && (
                                        <p className="mt-1.5 text-xs text-gray-500">💡 Seleccione primero un país</p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Seguridad */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 pb-3 border-b-2 border-amber-100">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Seguridad</h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Contraseña <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all outline-none text-sm"
                                    
                                        {...register("Passwd", { required: "La contraseña es obligatoria" })}
                                    />
                                    {errors.Passwd && (
                                        <p className="mt-1.5 text-xs text-red-500">⚠ {errors.Passwd.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Repetir Contraseña <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all outline-none text-sm"
                                        placeholder="••••••••"
                                        {...register("Passwd_Confirmation", {
                                            required: "Repetir Password es obligatorio",
                                            validate: value => value === password || 'Las contraseñas no coinciden'
                                        })}
                                    />
                                    {errors.Passwd_Confirmation && (
                                        <p className="mt-1.5 text-xs text-red-500">⚠ {errors.Passwd_Confirmation.message}</p>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Footer */}
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
                                "Guardar Usuario"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}