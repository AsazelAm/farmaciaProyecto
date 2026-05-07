import React from 'react'
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { ResetPasswd } from '../../Api/Auth';
import { type deleteuser } from '../../types';
import ErrorMessage from '../Error/ErrorMessage';

type ResetPasswordProps = Readonly<{
    SetVer: React.Dispatch<React.SetStateAction<boolean>>;
    SendValor: deleteuser['idUsuario'] | null;
}>

type ResetPasswordFormData = {
    passwd: string;
    passwd_Confirmation: string;
}

export default function ResetPassword({ SetVer, SendValor }: ResetPasswordProps) {
    
    const initialValues: ResetPasswordFormData = {
        passwd: '',
        passwd_Confirmation: ''
    }

    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({ defaultValues: initialValues });
    const queryClient = useQueryClient();

    const password = watch('passwd');

    const { mutate } = useMutation({
        mutationFn: ResetPasswd,
        onError: (error: any) => {
            toast.error(error.message);
        },
        onSuccess: (data) => {
            toast.success("Contraseña actualizada correctamente");
            queryClient.invalidateQueries({ queryKey: ['users'] }); 
            SetVer(false);
            reset();
        }
    });

    const handleResetPassword = (formData: ResetPasswordFormData) => {
        if (!SendValor) return;
        
        mutate({
            formData: { passwd: formData.passwd },
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
                        <label className="text-sm font-semibold" style={{ color: "#4A1A6E" }}>Nueva Contraseña</label>
                        <input
                            type="password"
                            placeholder="Mínimo 8 caracteres"
                            className="w-full p-3 border-2 rounded-xl outline-none focus:ring-2 focus:ring-[#7B3FA0] transition-all"
                            style={{ borderColor: "#D8B4F0", color: "#2D0A47" }}
                            {...register("passwd", {
                                required: "La contraseña es obligatoria",
                                minLength: { value: 8, message: "Mínimo 8 caracteres" }
                            })}
                        />
                        {errors.passwd && <ErrorMessage>{errors.passwd.message}</ErrorMessage>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold" style={{ color: "#4A1A6E" }}>Confirmar Contraseña</label>
                        <input
                            type="password"
                            placeholder="Repite la contraseña"
                            className="w-full p-3 border-2 rounded-xl outline-none focus:ring-2 focus:ring-[#7B3FA0] transition-all"
                            style={{ borderColor: "#D8B4F0", color: "#2D0A47" }}
                            {...register("passwd_Confirmation", {
                                required: "La confirmación es obligatoria",
                                validate: value => value === password || "Las contraseñas no coinciden"
                            })}
                        />
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