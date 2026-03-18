import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import ErrorMessage from "../Error/ErrorMessage";
import clear from "../../assets/clear.png";
import cerrar from "../../assets/cerrar.png";
import { addAreasApi } from "../../Api/Administracion";

type Cua = Readonly<{
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isOpen: any;
}>;
type FormData = {
  n_area: string;
}
const LOCAL_STORAGE_KEY = 'ModalidadForm';
export default function AreasForm({ setIsOpen, isOpen }: Cua) {

    const { register, handleSubmit, reset,watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      n_area:'',
    }
  });

//funcionalidad de localstorage 
    useEffect(() => {
    const loadSavedData = () => {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      const defaultValues = {
        modalidad: "",
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
  const { mutate } = useMutation({
    mutationFn: addAreasApi,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["GetAllAreas"] });
      toast.success(results);
      reset();
      setIsOpen(!isOpen);
    }
  });

  const handleForm = (data: FormData) => {
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
       n_area: '',
    }, {
      keepDefaultValues: true // Important for controlled forms
    });
    
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (error) {
    console.error("Reset error:", error);
  }
};
  return (
      <div>
      <button  className='overlay' onClick={() => setIsOpen(!isOpen)}>
      </button>
        <article className="w-3/12 m-auto p-10 rounded-xl fixed z-[100] top-[10%] left-[38%] bg-[#FFFFFF] up">
          <div className='flex justify-between'>
           <button 
            type="button" 
            onClick={handleReset}
            className="bg-green-500 p-2 rounded-lg text-white cursor-pointer self-center flex gap-2 hover:scale-105 duration-300"
          >
            <img className='w-4' src={clear} alt="" />
            <p className='text-xs self-center text-white font-semibold'>Limpiar Datos</p>
          </button>
           <button className=' self-center cursor-pointer hover:scale-105 duration-300' onClick={handleClose}>
            <img className="w-6 " src={cerrar} alt="Cerrar" />
          </button>
         </div>
          <h2 className="text-2xl font-semibold text-white">Registrar Area de Conocimiento:</h2>
          <form onSubmit={handleSubmit(handleForm)} noValidate className="flex flex-col gap-5">
            <div className='flex justify-between'>
                <div className="flex flex-col w-full">
                    <label className='text-[#00155C]' htmlFor="rol">Nueva Area de Conocimiento:</label>
                    <input
                        className="rounded-xl text-sm p-[6px] shadow-lg pl-2 bg-[#F3F3F3]"
                        type="text"
                        {...register("n_area", { required: "La Fecha es importante" })}
                    />
                    {errors.n_area && (
                        <ErrorMessage>{errors.n_area.message}</ErrorMessage>
                    )}
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
