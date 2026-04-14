import React from 'react'
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { ResetPasswd } from '../../Api/Auth';
import { type deleteuser } from '../../types';
import ErrorMessage from '../Error/ErrorMessage';

type ResetPasswordProps = Readonly<{
    SetVer: React.Dispatch<React.SetStateAction<boolean>>;
    SendValor: deleteuser['id_usuario'] | null;
}>

// Definimos el tipo local para el formulario basándonos en tu lógica de index.ts
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

    // Observamos el valor del password para compararlo con la confirmación
    const password = watch('passwd');

    const { mutate } = useMutation({
        mutationFn: ResetPasswd,
        onError: (error: any) => {
            toast.error(error.message);
        },
        onSuccess: (data) => {
            toast.success("Contraseña actualizada correctamente");
            queryClient.invalidateQueries({ queryKey: ['users'] }); // Invalida la lista de usuarios si es necesario
            SetVer(false);
            reset();
        }
    });

    const handleResetPassword = (formData: ResetPasswordFormData) => {
        if (!SendValor) return;
        
        // Estructuramos la data como la espera tu función en Auth.ts
        mutate({
            formData: { passwd: formData.passwd },
            id_usuario: SendValor
        });
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-[#1A3A6E] p-6">
                    <h3 className="text-xl font-bold text-white text-center">Restablecer Contraseña</h3>
                    <p className="text-blue-100 text-sm text-center mt-1">Ingresa la nueva contraseña para el usuario</p>
                </div>

                <form 
                    onSubmit={handleSubmit(handleResetPassword)}
                    className="p-6 space-y-4"
                    noValidate
                >
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Nueva Contraseña</label>
                        <input
                            type="password"
                            placeholder="Mínimo 8 caracteres"
                            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            {...register("passwd", {
                                required: "La contraseña es obligatoria",
                                minLength: { value: 8, message: "Mínimo 8 caracteres" }
                            })}
                        />
                        {errors.passwd && <ErrorMessage>{errors.passwd.message}</ErrorMessage>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Confirmar Contraseña</label>
                        <input
                            type="password"
                            placeholder="Repite la contraseña"
                            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            {...register("passwd_Confirmation", {
                                required: "La confirmación es obligatoria",
                                validate: value => value === password || "Las contraseñas no coinciden"
                            })}
                        />
                        {errors.passwd_Confirmation && <ErrorMessage>{errors.passwd_Confirmation.message}</ErrorMessage>}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => SetVer(false)}
                            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-[#1A3A6E] text-white rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}