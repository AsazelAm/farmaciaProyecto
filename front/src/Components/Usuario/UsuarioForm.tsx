import { useForm } from "react-hook-form";
import ErrorMessage from "../Error/ErrorMessage";
import { useEffect, useState, type ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AddUser } from "../../Api/UserApi";
import { GetTipoUsApi } from "../../Api/TipoUsApi";
import { GetSucursalApi } from "../../Api/SucursalApi";

type Cua = Readonly<{
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isOpen: boolean;
}>;

type FormDataFields = {
    ci: string;
    nombre: string;
    apellido: string;
    passwd: string;
    Passwd_Confirmation: string;
    telefono: string;
    email: string;
    id_tipo_us: string;
    id_sucursal: string;
    img: FileList | null;
};

const LOCAL_STORAGE_KEY = "UsuarioFormData";

// Estilos reutilizables para limpiar el JSX
const inputStyles = "w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all";
const labelStyles = "block text-sm font-semibold text-gray-700 mb-1";
const sectionStyles = "bg-gray-50 p-5 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4";

export default function UsuarioForm({ setIsOpen, isOpen }: Cua) {
    const [imgPreview, setImgPreview] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const { data: tiposUsuario } = useQuery({ queryKey: ["TipoUsAll"], queryFn: GetTipoUsApi });
    const { data: sucursales } = useQuery({ queryKey: ["sucursalesAll"], queryFn: GetSucursalApi });

    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormDataFields>({
        defaultValues: {
            ci: "", nombre: "", apellido: "", passwd: "", Passwd_Confirmation: "",
            telefono: "", email: "", id_tipo_us: "", id_sucursal: "", img: null,
        },
    });

    // Cargar datos guardados al iniciar
    useEffect(() => {
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedData) reset(JSON.parse(savedData));
    }, [reset]);

    // Persistir cambios
    useEffect(() => {
        if (!isOpen) return;
        const subscription = watch((value) => {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
        });
        return () => subscription.unsubscribe();
    }, [watch, isOpen]);

    // Limpieza de memoria para la previsualización de imagen
    useEffect(() => {
        return () => { if (imgPreview) URL.revokeObjectURL(imgPreview); };
    }, [imgPreview]);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (imgPreview) URL.revokeObjectURL(imgPreview); // Limpiar anterior
            setImgPreview(URL.createObjectURL(file));
        }
    };

    const mutation = useMutation({
        mutationFn: AddUser,
        onError: (error: any) => toast.error(error.message),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["UsuariosAll"] });
            toast.success(data.message || "Usuario creado correctamente");
            handleReset();
            setIsOpen(false);
        },
    });

    const onSubmit = (data: FormDataFields) => {
        const formData = new FormData();
        
        // Automatización del mapeo de FormData
        Object.entries(data).forEach(([key, value]) => {
            if (key === "img") {
                if (value && value[0]) formData.append("img", value[0]);
            } else if (key !== "Passwd_Confirmation") {
                formData.append(key, value as string);
            }
        });

        mutation.mutate(formData);
    };

    const handleReset = () => {
        reset();
        if (imgPreview) URL.revokeObjectURL(imgPreview);
        setImgPreview(null);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
                
                {/* Header dinámico */}
                <div className="p-6 bg-blue-900 text-white flex justify-between items-center">
                    <div>
                        <p className="text-xs uppercase tracking-widest opacity-70">Sistema v1</p>
                        <h2 className="text-2xl font-bold">Registrar Usuario</h2>
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={handleReset} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-sm font-medium transition-colors">Limpiar</button>
                        <button onClick={() => setIsOpen(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors">Cerrar</button>
                    </div>
                </div>

                {/* Formulario con scroll optimizado */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 overflow-y-auto space-y-6" noValidate>
                    
                    {/* Sección: Identidad */}
                    <div className={sectionStyles}>
                        <h3 className="md:col-span-2 text-lg font-bold text-gray-800 border-b pb-2">Datos de Identidad</h3>
                        
                        <div>
                            <label className={labelStyles}>C.I. *</label>
                            <input {...register("ci", { required: "El CI es obligatorio" })} className={inputStyles} />
                            {errors.ci && <ErrorMessage>{errors.ci.message}</ErrorMessage>}
                        </div>

                        <div>
                            <label className={labelStyles}>Email *</label>
                            <input type="email" {...register("email", { required: "Email obligatorio", pattern: { value: /^\S+@\S+$/i, message: "Email inválido" }})} className={inputStyles} />
                            {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
                        </div>

                        <div>
                            <label className={labelStyles}>Nombre *</label>
                            <input {...register("nombre", { required: "Nombre obligatorio" })} className={inputStyles} />
                            {errors.nombre && <ErrorMessage>{errors.nombre.message}</ErrorMessage>}
                        </div>

                        <div>
                            <label className={labelStyles}>Apellido *</label>
                            <input {...register("apellido", { required: "Apellido obligatorio" })} className={inputStyles} />
                            {errors.apellido && <ErrorMessage>{errors.apellido.message}</ErrorMessage>}
                        </div>
                    </div>

                    {/* Sección: Roles y Seguridad */}
                    <div className={sectionStyles}>
                        <h3 className="md:col-span-2 text-lg font-bold text-gray-800 border-b pb-2">Acceso y Sucursal</h3>
                        
                        <div>
                            <label className={labelStyles}>Contraseña *</label>
                            <input type="password" {...register("passwd", { required: "Requerido", minLength: { value: 8, message: "Mínimo 8 caracteres" }})} className={inputStyles} />
                            {errors.passwd && <ErrorMessage>{errors.passwd.message}</ErrorMessage>}
                        </div>

                        <div>
                            <label className={labelStyles}>Confirmar Contraseña *</label>
                            <input type="password" {...register("Passwd_Confirmation", { 
                                required: "Debes confirmar",
                                validate: v => v === watch('passwd') || "No coinciden" 
                            })} className={inputStyles} />
                            {errors.Passwd_Confirmation && <ErrorMessage>{errors.Passwd_Confirmation.message}</ErrorMessage>}
                        </div>

                        <div>
                            <label className={labelStyles}>Rol *</label>
                            <select {...register("id_tipo_us", { required: "Selecciona un rol" })} className={inputStyles}>
                                <option value="">Seleccionar Rol</option>
                                {tiposUsuario?.map((t: any) => (
                                    <option key={t.id_tipo_us} value={t.id_tipo_us}>{t.name_rol}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelStyles}>Sucursal *</label>
                            <select {...register("id_sucursal", { required: "Selecciona sucursal" })} className={inputStyles}>
                                <option value="">Seleccionar Sucursal</option>
                                {sucursales?.map((s: any) => (
                                    <option key={s.id_sucursal} value={s.id_sucursal}>{s.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Sección: Imagen */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col md:flex-row items-center gap-6">
                        <div className="relative w-32 h-32 flex-shrink-0">
                            <div className="w-full h-full rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200 flex items-center justify-center">
                                {imgPreview ? (
                                    <img src={imgPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-gray-400 text-[10px] text-center uppercase font-bold px-2">Sin Foto</span>
                                )}
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className={labelStyles}>Foto de Perfil</label>
                            <input 
                                type="file" 
                                accept="image/*"
                                {...register("img")}
                                onChange={handleImageChange}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={mutation.isPending || isSubmitting}
                        className="w-full py-4 bg-blue-900 text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {mutation.isPending || isSubmitting ? "Procesando..." : "Finalizar Registro"}
                    </button>
                </form>
            </div>
        </div>
    );
}