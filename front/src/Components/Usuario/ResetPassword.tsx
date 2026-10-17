import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { ResetPasswd } from '../../Api/Auth';
import { type deleteuser } from '../../types';
import ErrorMessage from '../Error/ErrorMessage';
import imgver from '../../assets/ver.png';
import imgesconder from '../../assets/esconder.png';

const EyeIcon = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img src={imgver} alt="Mostrar contraseña" className="w-5 h-5 object-contain" {...props} />
);

const EyeOffIcon = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img src={imgesconder} alt="Ocultar contraseña" className="w-5 h-5 object-contain" {...props} />
);

type ResetPasswordProps = Readonly<{
    SetVer: React.Dispatch<React.SetStateAction<boolean>>;
    SendValor: deleteuser['idUsuario'] | null;
}>

type ResetPasswordFormData = {
    adminPasswd: string;
    passwd: string;
    passwd_Confirmation: string;
}

export default function ResetPassword({ SetVer, SendValor }: ResetPasswordProps) {
    
    const initialValues: ResetPasswordFormData = {
        adminPasswd: '',
        passwd: '',
        passwd_Confirmation: ''
    }

    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({ defaultValues: initialValues });
    const queryClient = useQueryClient();

    const [showAdminPassword, setShowAdminPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const password = watch('passwd');

    const { mutate } = useMutation({
        mutationFn: ResetPasswd,
        onError: (error: Error) => {
            toast.error(error.message);
        },
        onSuccess: () => {
            toast.success("Contraseña actualizada correctamente");
            queryClient.invalidateQueries({ queryKey: ['users'] }); 
            SetVer(false);
            reset();
        }
    });

    const handleResetPassword = (formData: ResetPasswordFormData) => {
        if (!SendValor) return;
        
        mutate({
            formData: { passwd: formData.passwd, adminPasswd: formData.adminPasswd },
            idUsuario: SendValor
        });
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border" style={{ borderColor: "#D8B4F0" }}>
                
                {/* Cabecera con Degradado de TipoUsForm */}
                <div className="p-6" style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}>
                    <h3 className="text-xl font-bold text-white text-center">Restablecer Contraseña</h3>
                    <p className="text-purple-100 text-sm text-center mt-1">Ingresa la nueva contraseña para el usuario</p>
                </div>

                <form 
                    onSubmit={handleSubmit(handleResetPassword)}
                    className="p-6 space-y-4"
                    noValidate
                >
                    <div className="space-y-2">
                        <label className="text-sm font-semibold" style={{ color: "#4A1A6E" }}>Tu Contraseña (sesión actual)</label>
                        <div className="relative">
                            <input
                                type={showAdminPassword ? "text" : "password"}
                                placeholder="Ingresa tu contraseña para confirmar"
                                className="w-full p-3 pr-12 border-2 rounded-xl outline-none focus:ring-2 focus:ring-[#7B3FA0] transition-all"
                                style={{ borderColor: "#D8B4F0", color: "#2D0A47" }}
                                {...register("adminPasswd", {
                                    required: "Debes ingresar tu contraseña actual"
                                })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowAdminPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#7B3FA0] hover:text-[#4A1A6E]"
                                aria-label={showAdminPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {showAdminPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        <p className="text-xs text-[#7B3FA0]">Confirma que eres tú quien realiza el cambio.</p>
                        {errors.adminPasswd && <ErrorMessage>{errors.adminPasswd.message}</ErrorMessage>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold" style={{ color: "#4A1A6E" }}>Nueva Contraseña</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Mínimo 8 caracteres"
                                className="w-full p-3 pr-12 border-2 rounded-xl outline-none focus:ring-2 focus:ring-[#7B3FA0] transition-all"
                                style={{ borderColor: "#D8B4F0", color: "#2D0A47" }}
                                {...register("passwd", {
                                    required: "La contraseña es obligatoria",
                                    minLength: { value: 8, message: "Mínimo 8 caracteres" },
                                    maxLength: { value: 64, message: "Máximo 64 caracteres" }
                                })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#7B3FA0] hover:text-[#4A1A6E]"
                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {errors.passwd && <ErrorMessage>{errors.passwd.message}</ErrorMessage>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold" style={{ color: "#4A1A6E" }}>Confirmar Contraseña</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Repite la contraseña"
                                className="w-full p-3 pr-12 border-2 rounded-xl outline-none focus:ring-2 focus:ring-[#7B3FA0] transition-all"
                                style={{ borderColor: "#D8B4F0", color: "#2D0A47" }}
                                {...register("passwd_Confirmation", {
                                    required: "La confirmación es obligatoria",
                                    validate: value => value === password || "Las contraseñas no coinciden"
                                })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#7B3FA0] hover:text-[#4A1A6E]"
                                aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {errors.passwd_Confirmation && <ErrorMessage>{errors.passwd_Confirmation.message}</ErrorMessage>}
                    </div>

                    {/* Footer / Botones con paleta Lila/Púrpura */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => SetVer(false)}
                            className="flex-1 py-3 rounded-xl border-2 font-bold transition-all hover:bg-purple-50"
                            style={{ borderColor: "#D8B4F0", color: "#4A1A6E" }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 text-white rounded-xl font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
                            style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}