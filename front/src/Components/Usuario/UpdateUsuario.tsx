import { useForm } from "react-hook-form";
import ErrorMessage from "../Error/ErrorMessage";
import { useEffect, useState, type ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { UpdateUserApi } from "../../Api/UserApi"; 
import { GetTipoUsApi } from "../../Api/TipoUsApi";
import { GetSucursalApi } from "../../Api/SucursalApi";
import type { updateuser } from "../../types";
import { soloLetras, soloDigitos, telefono, email, tecladoSoloLetras, tecladoSoloDigitos, tecladoTelefono } from "../../lib/validators";

type Props = Readonly<{
    SetVer: React.Dispatch<React.SetStateAction<boolean>>;
    SendValor: updateuser | null;
    onRequiereVerificacion?: (email: string, correoEnviado: boolean) => void;
}>;

type FormDataFields = {
    ci: string;
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
    idTipoUs: string;
    idSucursal: string;
    img: FileList | null;
};

// ESTILOS ACTUALIZADOS CON LA PALETA DE TIPO_US_FORM
const inputStyles = "w-full p-3 border-2 rounded-xl outline-none focus:ring-2 focus:ring-[#7B3FA0] transition-colors border-[#D8B4F0] text-[#2D0A47]";
const labelStyles = "block text-sm font-semibold text-[#4A1A6E] mb-1";
const sectionStyles = " p-5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4";

export default function UpdateUsuario({ SetVer, SendValor, onRequiereVerificacion }: Props) {
    const [imgPreview, setImgPreview] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const { data: tiposUsuario } = useQuery({ queryKey: ["TipoUsAll"], queryFn: GetTipoUsApi });
    const { data: sucursales } = useQuery({ queryKey: ["sucursalesAll"], queryFn: GetSucursalApi });

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormDataFields>();

    useEffect(() => {
        if (SendValor) {
            reset({
                ci: SendValor.ci,
                nombre: SendValor.nombre,
                apellido: SendValor.apellido,
                telefono: SendValor.telefono ?? "",
                email: SendValor.email,
                idTipoUs: String(SendValor.idTipoUs),
                idSucursal: String(SendValor.idSucursal),
            });
            
            if (SendValor.img) {
                const fixedPath = SendValor.img.replace(/\\/g, '/');
                const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
                const imageUrl = `${baseUrl}/${fixedPath}`;
                setImgPreview(imageUrl);
            }
        }
    }, [SendValor, reset]);

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
        onError: (error: Error) => toast.error(error.message),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["UsuariosAll"] });
            toast.success(data?.message || "Datos actualizados");

            // Si el correo cambio, el backend dejo la cuenta en confirmed = 0
            // y envio un codigo al nuevo email: hay que abrir el modal.
            if (data?.requiresVerification && data?.email) {
                onRequiereVerificacion?.(data.email, data.correoEnviado !== false);
                return;
            }

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
        formData.append("idTipoUs", data.idTipoUs);
        formData.append("idSucursal", data.idSucursal);
        if (data.img && data.img[0]) formData.append("img", data.img[0]);
        mutation.mutate({ formData, id: SendValor.idUsuario });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative animate-in fade-in zoom-in duration-300 border-2 border-[#D8B4F0]">
                
                {/* Cabecera con degradado de TipoUsForm */}
                <div className="p-6 text-white flex justify-between  items-center sticky top-0 z-10 rounded-t-[20px]" style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}>
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Actualizar Usuario</h2>
                        <p className="text-purple-200 text-xs font-medium">Modifica la información del perfil</p>
                    </div>
                    <button onClick={() => SetVer(false)} className="bg-white/10 hover:bg-white/20 p-2 px-4 rounded-xl transition-colors">
                        Cerrar
                    </button>
                </div>

                <form onSubmit={handleSubmit(handleForm)} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto overflow-x-hidden " noValidate>
                    
                    <div className="space-y-4">
                        <h3 className="text-[#4A1A6E] font-bold text-sm uppercase tracking-widest border-l-4 border-[#7B3FA0] pl-3">Datos Personales</h3>
                        <div className={sectionStyles}>
                            <div>
                                <label className={labelStyles}>C.I. / Documento</label>
                                <input type="text" className={inputStyles} {...register("ci", soloDigitos("C.I.", { required: "El CI es obligatorio", min: 5, max: 10 }))} {...tecladoSoloDigitos} />
                                {errors.ci && <ErrorMessage>{errors.ci.message}</ErrorMessage>}
                            </div>
                            <div>
                                <label className={labelStyles}>Email</label>
                                <input type="email" className={inputStyles} {...register("email", email("Email", { required: "El Email es obligatorio" }))} />
                                {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
                            </div>
                            <div>
                                <label className={labelStyles}>Nombre(s)</label>
                                <input type="text" className={inputStyles} {...register("nombre", soloLetras("Nombre", { required: "El nombre es obligatorio" }))} {...tecladoSoloLetras} />
                            </div>
                            <div>
                                <label className={labelStyles}>Apellido(s)</label>
                                <input type="text" className={inputStyles} {...register("apellido", soloLetras("Apellido", { required: "El apellido es obligatorio" }))} {...tecladoSoloLetras} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[#4A1A6E] font-bold text-sm uppercase tracking-widest border-l-4 border-[#7B3FA0] pl-3">Asignación</h3>
                        <div className={sectionStyles}>
                            <div>
                                <label className={labelStyles}>Tipo de Usuario</label>
                                <select className={inputStyles} {...register("idTipoUs", { required: "Seleccione un rol" })}>
                                    <option value="">Seleccione...</option>
                                    {tiposUsuario?.map(tipo => (
                                        <option key={tipo.idTipoUs} value={tipo.idTipoUs}>{tipo.nameRol}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelStyles}>Sucursal</label>
                                <select className={inputStyles} {...register("idSucursal", { required: "Seleccione una sucursal" })}>
                                    <option value="">Seleccione...</option>
                                    {sucursales?.map(suc => (
                                        <option key={suc.idSucursal} value={suc.idSucursal}>{suc.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelStyles}>Teléfono de Contacto</label>
                                <input type="tel" className={inputStyles} {...register("telefono", telefono("Teléfono", { required: "El teléfono es obligatorio" }))} {...tecladoTelefono} />
                            </div>
                        </div>
                    </div>

                    {/* Imagen con bordes y botones lila */}
                    <div className="flex flex-col md:flex-row items-center gap-6 p-5 bg-[#F3EBF9] rounded-2xl border border-[#D8B4F0]">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-[#D8B4F0] flex items-center justify-center overflow-hidden shadow-inner">
                                {imgPreview ? (
                                    <img src={imgPreview} alt="Vista previa" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[#7B3FA0] text-[10px] text-center uppercase font-bold px-2">Sin Foto</span>
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
                                className="w-full text-sm text-[#4A1A6E] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-[#7B3FA0] hover:file:bg-purple-200 cursor-pointer"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={mutation.isPending || isSubmitting}
                        className="w-full py-4 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-purple-500/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}
                    >
                        {mutation.isPending || isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Guardando Cambios...</span>
                            </div>
                        ) : "Actualizar Información"}
                    </button>
                </form>
            </div>
        </div>
    );
}