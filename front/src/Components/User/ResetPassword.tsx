import React from 'react'
import { type deleteuser } from '../../types';
import Cerrar from "../../assets/cerrar.png"
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { ResetPasswd } from '../../Api/Auth';

type op = Readonly <{
  SetVer: React.Dispatch<React.SetStateAction<boolean>>;
  Sendvalor: deleteuser['id_user'] | null;
}>
export default function ResetPassword({ SetVer, Sendvalor  }: op) {

      const { register, handleSubmit, watch, reset} = useForm({
        defaultValues: {
            id_user: Sendvalor ?? 0,
            Passwd:'',
            Passwd_Confirmation:'',
        }
      });
      const queryClient = useQueryClient();
      const {mutate} = useMutation({
        mutationFn: ResetPasswd,
        onError:(error)=>{
            toast.error(error.message)
        },
        onSuccess:(results)=>{
            toast.success(results)
            queryClient.invalidateQueries({queryKey:['GetAllAdmins']})
            reset();
            SetVer(false);
        }
      })
      const handleForm:SubmitHandler<{
        id_user:number;
        Passwd:string;
        Passwd_Confirmation:string;
      }> = (data)=>{
        if (!Sendvalor || typeof Sendvalor !== 'number'){
           toast.error("El ID del anticipo es requerido.");
            return; 
        }
        mutate({ formData: { ...data }, id: Sendvalor }); 
      }
      const password = watch('Passwd');

  return (
    <main>
      <button  className='overlay' onClick={() => SetVer(false)}>
      </button>
        <article className="w-3/12 m-auto p-10 rounded-xl fixed z-[100] top-[10%] left-[40%] bg-white up">
          <button className='flex justify-end w-full' onClick={() => SetVer(false)}>
            <img className="w-6 " src={Cerrar} alt="Cerrar" />
          </button>
          <h2 className="text-2xl font-semibold text-[#00155C]">Restablecer Contraseña:</h2> <br />
          <form onSubmit={handleSubmit(handleForm)} noValidate className="flex flex-col gap-5">

                    <div className="flex flex-col">
                        <label className='text-[#00155C]' htmlFor="N_tractor">Contraseña:</label>
                        <input
                          className="rounded-xl text-sm p-[6px] shadow-lg pl-2"
                          type="password"
                          {...register("Passwd", { required: "El password es obligatorio" })}
                        />
                
                      </div>
                      <div className="flex flex-col">
                        <label className='text-[#00155C]' htmlFor="N_tractor">Repetir la Contraseña:</label>
                        <input
                          className="rounded-xl text-sm p-[6px] shadow-lg pl-2"
                          type="password"
                          {...register("Passwd_Confirmation", {
                            required: "Repetir Password es obligatorio",
                            validate: value => value === password || 'Los Passwords no son iguales'
                          })}
                        />
                   
                      </div>
            <input
              type="submit"
              value="Guardar"
              className="bg-[#00155C] p-2 rounded-lg text-white cursor-pointer"
            />
          </form>
        </article>
     
    </main>
  )
}
