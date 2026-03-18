import { lazy, Suspense, useState } from "react";
import Loading from "../../../../Helpers/Loading";
import { DeleteCalendarioAPI, GetCalendarioAPI } from "../../../../Api/Calendario";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Eliminar from "../../../../assets/eliminar.png";
import { toast } from "react-toastify";
import type { UpdateCalendarioType } from "../../../../types";


import Editar from "../../../../assets/editar.png";

const CalendarioForm = lazy(()=>import("../../../../Components/Calendario/CalendarioForm"));
const UpdateCalendario  = lazy(()=>import("../../../../Components/Calendario/UpdateCalendario"));
const ViewCalendario = lazy(()=>import("../../../../Components/Calendario/ViewCalendario"));

export default function Calendario() {
    const [isOpen, setIsOpen] = useState(false); 
    const queryClient = useQueryClient();
    const [selectedFormacion, setSelectedFormacion] = useState<UpdateCalendarioType | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const [isView, setIsView] = useState(false);

    const { data, isLoading } = useQuery({
            queryKey: ['GetCalendario'],
            queryFn: GetCalendarioAPI,
        });

    //Eliminar
    const {mutate:DeleteCalendario} = useMutation({
        mutationFn: DeleteCalendarioAPI,
        onError:(error)=>{
            toast.error(error.message)
        },
        onSuccess: (results) => {
            toast.success(results);
            queryClient.invalidateQueries({queryKey:['GetCalendario']});
        },
    })

    //editar
    const handleEditClick = (valor: UpdateCalendarioType) => {
        setSelectedFormacion(valor);
        setIsEditing(true);
    };
    //Views
    const handleEditClick2 = (valor: UpdateCalendarioType) => {
        setSelectedFormacion(valor);
        setIsView(true);
    };

    if(isLoading) return <Loading/>
  return (
   <section className="h-screen w-full px-10">
        <article className="py-4">
            <button
             onClick={()=> setIsOpen(!isOpen)}
             className="p-2 rounded-xl text-xs bg-[#00155C] text-white hover:scale-105 duration-300 hover:cursor-pointer">
                Nuevo Inicio De Curso
            </button>
        </article>
        <article className="bg-[rgb(255,255,255,0.8)] p-6 rounded-2xl h-[90%]">
            <h2 className="text-2xl font-normal text-[#00155C]">Calendario</h2>
            <table className="w-8/12 m-auto">
                <thead className="bg-[#DEEAFF]">
                    <tr>
                        <th className="p-[6px] font-semibold text-center text-sm">Nro</th>
                        <th className="p-[6px] font-semibold text-center text-sm">Fecha de Inicio</th>
                        <th className="p-[6px] font-semibold text-center text-sm">Curso</th>
                        <th className="p-[6px] font-semibold text-center text-sm">Propuesta de Valor</th>
                        <th className="p-[6px] font-semibold text-center text-sm">Modalidad</th>
                        <th className="p-[6px] font-semibold text-center text-sm">Estado</th>
                        <th className="p-[6px] font-semibold text-center text-sm">Opciones</th>
                    </tr>
                </thead>
                <tbody>
                {data?.map((item, index)=>(
                     <tr 
                        key={item.id_calendario}
                        className="hover:bg-gray-200 hover:scale-105 duration-300 hover:cursor-pointer"
                         onClick={() => handleEditClick2(item)} 
                    >
                        <td className="text-gray-600 text-center p-2 text-xs">{index + 1}</td>
                        <td className="text-gray-600 text-center p-2 text-xs">{item.FechaIni}</td>
                        <td className="text-gray-600 text-center p-2 text-xs">{item.n_curso}</td>
                        <td className="text-gray-600 text-center p-2 text-xs">{item.nombre}</td>
                        <td className="text-gray-600 text-center p-2 text-xs">{item.modalidad}</td>
                        <td className="text-gray-600 text-center p-2 text-xs">{item.Estado}</td>
                        <td className="flex justify-center gap-2 p-2">
                             <button
                                onClick={() => handleEditClick(item)} 
                                className="hover:scale-105 duration-300 hover:cursor-pointer">
                                <img className="w-6" src={Editar} alt="Editar" />
                            </button>
                            <button 
                                onClick={()=>DeleteCalendario(item.id_calendario)}
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
                    <CalendarioForm
                        setIsOpen={setIsOpen} 
                        isOpen={isOpen}
                    />
                </Suspense>
                )
        }
         {
            isEditing && (
                <Suspense fallback={<Loading/>}>
                    <UpdateCalendario
                        Sendvalor={selectedFormacion}
                        SetVer={setIsEditing}
                    />
                </Suspense>
        )}

         {
            isView && (
                <Suspense fallback={<Loading/>}>
                    <ViewCalendario
                        Sendvalor={selectedFormacion}
                        SetVer={setIsView}
                    />
                </Suspense>
        )}
    </section>
  )
}
