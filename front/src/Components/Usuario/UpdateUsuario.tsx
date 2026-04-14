import { useForm } from "react-hook-form";
import ErrorMessage from "../Error/ErrorMessage";
import { useEffect, useState, type ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { UpdateUserApi } from "../../Api/UserApi"; // Asegúrate de que la ruta sea correcta
import { GetTipoUsApi } from "../../Api/TipoUsApi";
import { GetSucursalApi } from "../../Api/SucursalApi";
import type { updateuser } from "../../types"; // Importado de index.ts

type Props = Readonly<{
    SetVer: React.Dispatch<React.SetStateAction<boolean>>;
    SendValor: updateuser | null;
}>;

type FormDataFields = {
    ci: string;
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
    id_tipo_us: string;
    id_sucursal: string;
    img: FileList | null;
};

// Estilos reutilizados de UsuarioForm
const inputStyles = "w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all";
const labelStyles = "block text-sm font-semibold text-gray-700 mb-1";
const sectionStyles = "bg-gray-50 p-5 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4";

export default function UpdateUsuario({ SetVer, SendValor }: Props) {
    const [imgPreview, setImgPreview] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // Cargar catálogos para los selects
    const { data: tiposUsuario } = useQuery({ queryKey: ["TipoUsAll"], queryFn: GetTipoUsApi });
    const { data: sucursales } = useQuery({ queryKey: ["sucursalesAll"], queryFn: GetSucursalApi });

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormDataFields>();

    // Inicializar el formulario con los datos de SendValor
    useEffect(() => {
    if (SendValor) {
        reset({
            ci: SendValor.ci,
            nombre: SendValor.nombre,
            apellido: SendValor.apellido,
            telefono: SendValor.telefono,
            email: SendValor.email,
            id_tipo_us: String(SendValor.id_tipo_us),
            id_sucursal: String(SendValor.id_sucursal),
        });
        
        if (SendValor.img) {
            // 1. Reemplazamos las barras invertidas \ por /
            const fixedPath = SendValor.img.replace(/\\/g, '/');

            // 2. Construimos la URL apuntando a la raíz del servidor, NO a /api
            // Si VITE_API_URL termina en /api, necesitamos la URL base (http://localhost:8080)
            const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
            const imageUrl = `${baseUrl}/${fixedPath}`;
            
            setImgPreview(imageUrl);
        }
    }
}, [SendValor, reset]);

    // Lógica de limpieza y cambio de imagen igual a UsuarioForm
    useEffect(() => {
        return () => {
            if (imgPreview && imgPreview.startsWith("blob:")) {
                URL.revokeObjectURL(imgPreview);
            }
        };
    }, [imgPreview]);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (imgPreview && imgPreview.startsWith("blob:")) URL.revokeObjectURL(imgPreview);
            setImgPreview(URL.createObjectURL(file));
        }
    };

    const mutation = useMutation({
        mutationFn: ({ formData, id }: { formData: FormData; id: number }) => UpdateUserApi(formData, id),
        onError: (error: any) => toast.error(error.message),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["UsuariosAll"] }); // Invalida la lista global
            toast.success(data);
            SetVer(false);
        }
    });

    const handleForm = (data: FormDataFields) => {
        if (!SendValor) return;

        const formData = new FormData();
        formData.append("ci", data.ci);
        formData.append("nombre", data.nombre);
        formData.append("apellido", data.apellido);
        formData.append("telefono", data.telefono);
        formData.append("email", data.email);
        formData.append("id_tipo_us", data.id_tipo_us);
        formData.append("id_sucursal", data.id_sucursal);

        if (data.img && data.img[0]) {
            formData.append("img", data.img[0]);
        }

        mutation.mutate({ formData, id: SendValor.id_usuario });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden relative animate-in fade-in zoom-in duration-300">
                
                {/* Cabecera */}
                <div className="bg-blue-900 p-6 text-white flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Actualizar Usuario</h2>
                        <p className="text-blue-200 text-xs font-medium">Modifica la información del perfil</p>
                    </div>
                    <button onClick={() => SetVer(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit(handleForm)} className="p-8 space-y-6" noValidate>
                    
                    {/* Sección: Información Personal */}
                    <div className="space-y-4">
                        <h3 className="text-blue-900 font-bold text-sm uppercase tracking-widest border-l-4 border-blue-900 pl-3">Datos Personales</h3>
                        <div className={sectionStyles}>
                            <div>
                                <label className={labelStyles}>C.I. / Documento</label>
                                <input type="text" className={inputStyles} {...register("ci", { required: "El CI es obligatorio" })} />
                                {errors.ci && <ErrorMessage>{errors.ci.message}</ErrorMessage>}
                            </div>
                            <div>
                                <label className={labelStyles}>Email</label>
                                <input type="email" className={inputStyles} {...register("email", { required: "El Email es obligatorio" })} />
                                {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
                            </div>
                            <div>
                                <label className={labelStyles}>Nombre(s)</label>
                                <input type="text" className={inputStyles} {...register("nombre", { required: "El nombre es obligatorio" })} />
                            </div>
                            <div>
                                <label className={labelStyles}>Apellido(s)</label>
                                <input type="text" className={inputStyles} {...register("apellido", { required: "El apellido es obligatorio" })} />
                            </div>
                        </div>
                    </div>

                    {/* Sección: Roles y Sucursal */}
                    <div className="space-y-4">
                        <h3 className="text-blue-900 font-bold text-sm uppercase tracking-widest border-l-4 border-blue-900 pl-3">Asignación</h3>
                        <div className={sectionStyles}>
                            <div>
                                <label className={labelStyles}>Tipo de Usuario</label>
                                <select className={inputStyles} {...register("id_tipo_us", { required: "Seleccione un rol" })}>
                                    <option value="">Seleccione...</option>
                                    {tiposUsuario?.map(tipo => (
                                        <option key={tipo.id_tipo_us} value={tipo.id_tipo_us}>{tipo.name_rol}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelStyles}>Sucursal</label>
                                <select className={inputStyles} {...register("id_sucursal", { required: "Seleccione una sucursal" })}>
                                    <option value="">Seleccione...</option>
                                    {sucursales?.map(suc => (
                                        <option key={suc.id_sucursal} value={suc.id_sucursal}>{suc.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelStyles}>Teléfono de Contacto</label>
                                <input type="tel" className={inputStyles} {...register("telefono", { required: "El teléfono es obligatorio" })} />
                            </div>
                        </div>
                    </div>

                    {/* Sección: Imagen (Idéntica a UsuarioForm) */}
                    <div className="flex flex-col md:flex-row items-center gap-6 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-blue-200 flex items-center justify-center overflow-hidden shadow-inner">
                                {imgPreview ? (
                                    <img src={imgPreview} alt="Vista previa" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-gray-400 text-[10px] text-center uppercase font-bold px-2">Sin Foto</span>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 w-full">
                            <label className={labelStyles}>Cambiar Foto de Perfil</label>
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
                        {mutation.isPending || isSubmitting ? "Guardando Cambios..." : "Actualizar Información"}
                    </button>
                </form>
            </div>
        </div>
    );
}