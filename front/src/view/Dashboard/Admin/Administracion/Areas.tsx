import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useState } from "react";
import { DeleteAreasCono, GetAreasConocimiento } from "../../../../Api/Administracion";
import Editar from "../../../../assets/editar.png";
import Eliminar from "../../../../assets/eliminar.png";
import { toast } from "react-toastify";
import type { UpdateAreasType } from "../../../../types";
import Loading from "../../../../Helpers/Loading";

const AreasForm = lazy(()=>import("../../../../Components/Areas/AreaForm"));
const UpdateAreas = lazy(()=>import("../../../../Components/Areas/UpdateAreas"));

export default function Areas() {
    const queryClient = useQueryClient()
    const [selectedFormacion, setSelectedFormacion] = useState<UpdateAreasType | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    
    const { data, isLoading } = useQuery({
            queryKey: ['GetAllAreas'],
            queryFn: GetAreasConocimiento
    });

    //Eliminar
     const {mutate:DeleteConusmo} = useMutation({
        mutationFn: DeleteAreasCono,
        onError:(error)=>{
            toast.error(error.message)
        },
        onSuccess: (results) => {
            toast.success(results);
            queryClient.invalidateQueries({queryKey:['GetAllAreas']});
        },
    })
    //editar
    const handleEditClick = (valor: UpdateAreasType) => {
        setSelectedFormacion(valor);
        setIsEditing(true);
    };
    if(isLoading) return <Loading/>
  return (
    <section className="h-screen w-full p-10 flex flex-col gap-2">
        <article>
            <button
             onClick={()=> setIsOpen(!isOpen)}
             className="p-2 rounded-xl text-xs bg-[#00155C] text-white hover:scale-105 duration-300 hover:cursor-pointer">
                Crear Area de Conocimiento
            </button>
        </article>
        <article className="bg-[rgb(255,255,255,0.8)] p-6 rounded-2xl h-[850px] overflow-hidden">
            <h2 className="text-2xl font-normal text-[#00155C]">Areas De Conocimiento</h2>
           <div className="overflow-y-scroll max-h-[700px] clei">
                <table className='w-6/12 m-auto'>
               <thead className="bg-[#DEEAFF] sticky top-0">
                    <tr>
                        <th className="p-[6px] font-semibold text-center text-sm">Nro</th>
                        <th className="p-[6px] font-semibold text-center text-sm">Areas de Conocimiento</th>
                        <th className="p-[6px] font-semibold text-center text-sm">Opciones</th>
                    </tr>
                </thead>
                <tbody className="bg-[rgb(255,255,255,0.9)]">
                    {data?.map((item,index)=>(
                    <tr key={item.id_areas}>
                        <td className="p-2 text-xs text-center">{index + 1}</td>
                        <td className="p-2 text-xs text-center">{item.n_area}</td>
                        <td className="p-2 text-xs text-center flex justify-center gap-2">
                            <button
                                onClick={() => handleEditClick(item)} 
                                className="hover:scale-105 duration-300 hover:cursor-pointer">
                                <img className="w-6" src={Editar} alt="Editar" />
                            </button>
                            <button 
                                onClick={()=>DeleteConusmo(item.id_areas)}
                                className="hover:scale-105 duration-300 hover:cursor-pointer">
                                    <img className="w-6" src={Eliminar} alt="Eliminar" />
                            </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </article>
        {
            isOpen && (
                <Suspense fallback={<Loading/>}>
                    <AreasForm
                        setIsOpen={setIsOpen} 
                        isOpen={isOpen}
                    />
                </Suspense>
                )
        }
        {
            isEditing && (
                <Suspense fallback={<Loading/>}>
                    <UpdateAreas
                        Sendvalor={selectedFormacion}
                        SetVer={setIsEditing}
                    />
                </Suspense>
        )}
    </section>
  )
}
