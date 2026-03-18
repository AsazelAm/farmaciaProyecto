import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Loading from "../../../../Helpers/Loading";
import { lazy, Suspense, useState } from "react";
import Editar from "../../../../assets/editar.png";
import Eliminar from "../../../../assets/eliminar.png";
import { toast } from "react-toastify";
import type { UpdateModType } from "../../../../types";
import { DeleteMod, GetModalidad } from "../../../../Api/Administracion";

const ModalidadForm = lazy(()=>import("../../../../Components/ADM/ModalidadForm"));
const UpdateMod = lazy(()=> import("../../../../Components/ADM/UpdateMod"));

export default function Modalidad() {
    const queryClient = useQueryClient()
    const [selectedFormacion, setSelectedFormacion] = useState<UpdateModType | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const { data, isLoading } = useQuery({
            queryKey: ['GetAllModalidad'],
            queryFn: GetModalidad
    });

    //Eliminar
     const {mutate:DeleteConusmo} = useMutation({
        mutationFn: DeleteMod,
        onError:(error)=>{
            toast.error(error.message)
        },
        onSuccess: (results) => {
            toast.success(results);
            queryClient.invalidateQueries({queryKey:['GetAllModalidad']});
        },
    })
    //editar
    const handleEditClick = (valor: UpdateModType) => {
        setSelectedFormacion(valor);
        setIsEditing(true);
    };

    if(isLoading) return <Loading/>
 if(data) return (
    <section className="h-screen w-full p-10 flex flex-col gap-2">
        <article>
            <button
             onClick={()=> setIsOpen(!isOpen)}
             className="p-2 rounded-xl text-xs bg-[#00155C] text-white hover:scale-105 duration-300 hover:cursor-pointer">
                Crear Modalidad
            </button>
        </article>
        <article className="bg-[rgb(255,255,255,0.8)] p-6 rounded-2xl h-[850px]">
            <h2 className="text-2xl font-normal text-[#00155C]">Modalidades</h2>
            <table className='w-6/12 m-auto'>
               <thead className="bg-[#DEEAFF]">
                    <tr>
                        <th className="p-[6px] font-semibold text-center text-sm">Nro</th>
                        <th className="p-[6px] font-semibold text-center text-sm">Modalidad</th>
                        <th className="p-[6px] font-semibold text-center text-sm">Opciones</th>
                    </tr>
                </thead>
                <tbody className="bg-[rgb(255,255,255,0.9)]">
                    {data.map((item,index)=>(
                    <tr key={item.id_mod}>
                        <td className="p-2 text-xs text-center">{index + 1}</td>
                        <td className="p-2 text-xs text-center">{item.modalidad}</td>
                        <td className="p-2 text-xs text-center flex justify-center gap-2">
                            <button
                                onClick={() => handleEditClick(item)} 
                                className="hover:scale-105 duration-300 hover:cursor-pointer">
                                <img className="w-6" src={Editar} alt="Editar" />
                            </button>
                            <button 
                                onClick={()=>DeleteConusmo(item.id_mod)}
                                className="hover:scale-105 duration-300 hover:cursor-pointer">
                                    <img className="w-6" src={Eliminar} alt="Eliminar" />
                            </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </article>
        {
            isOpen && (
                <Suspense fallback={<Loading/>}>
                    <ModalidadForm
                        setIsOpen={setIsOpen} 
                        isOpen={isOpen}
                    />
                </Suspense>
                )
        }
        {
            isEditing && (
                <Suspense fallback={<Loading/>}>
                    <UpdateMod
                        Sendvalor={selectedFormacion}
                        SetVer={setIsEditing}
                    />
                </Suspense>
        )}
    </section>
  )
}
