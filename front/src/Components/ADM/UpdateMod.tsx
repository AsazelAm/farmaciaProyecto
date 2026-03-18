import type { UpdateModType } from "../../types";
import cerrar from "../../assets/cerrar.png";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { UpdateModApi } from "../../Api/Administracion";


type Props = Readonly<{
  SetVer: React.Dispatch<React.SetStateAction<boolean>>;
  Sendvalor: UpdateModType | null;
}>;
export default function UpdateMod({ SetVer, Sendvalor }: Props) {
    const { register, handleSubmit, reset } = useForm<UpdateModType>({
    defaultValues: {
        id_mod: Sendvalor?.id_mod,
        modalidad: Sendvalor?.modalidad
    },
  });
  const queryClient = useQueryClient();

  const {mutate} = useMutation({
    mutationFn: UpdateModApi,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["GetAllModalidad"] });
      toast.success(results);
      reset();
      SetVer(false)
    }
  })

  const handleForm = (formdata:UpdateModType) =>{
    mutate(formdata); 
  };
  return (
     <div>
      <button  className='overlay' onClick={() => SetVer(false)}>
      </button>
        <article className="w-3/12 m-auto p-10 rounded-xl fixed z-[100] top-[10%] left-[38%] bg-[#FFFFFF] up">
          <div className='flex justify-between'>
           <button className=' self-center cursor-pointer hover:scale-105 duration-300' onClick={() => SetVer(false)}>
            <img className="w-6 " src={cerrar} alt="Cerrar" />
          </button>
         </div>
          <h2 className="text-2xl font-semibold text-white">Actualizar Datos:</h2>
          <form onSubmit={handleSubmit(handleForm)} noValidate className="flex flex-col gap-5">
            <div className='flex justify-between'>
                <div className="flex flex-col w-full">
                    <label className='text-[#00155C]' htmlFor="rol">Modalidad :</label>
                    <input
                        className="rounded-xl text-sm p-[6px] shadow-lg pl-2 bg-[#F3F3F3]"
                        type="text"
                        {...register("modalidad", { required: "La modalidad es importante" })}
                    />
                </div>
            </div>            
            <input
              type="submit"
              value="Guardar"
              className="bg-[#00155C] p-2 rounded-lg text-white cursor-pointer"
            />
          </form>
        </article>
     
    </div>
  )
}
