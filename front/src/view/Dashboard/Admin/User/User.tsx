import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DeleteuserApi, GetUserAllApi } from "../../../../Api/UserApi";
import Loading from "../../../../Helpers/Loading";
import { lazy, Suspense, useMemo, useState } from "react";
import Editar from "../../../../assets/editar.png";
import Eliminar from "../../../../assets/eliminar.png";
import { toast } from "react-toastify";
import type { updateuser } from "../../../../types";
import reset from "../../../../assets/contrasena.png";

const UserForm = lazy(()=>import("../../../../Components/User/UserForm"));
const UdpateUser = lazy(()=>import("../../../../Components/User/UpdateUser"));
const ResetPassword = lazy(()=>import("../../../../Components/User/ResetPassword"));

export default function User() {
    const queryClient = useQueryClient()
    const [isOpen, setIsOpen] = useState(false);
    
    const [selectedFormacion, setSelectedFormacion] = useState<updateuser | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    //usestate
    const [isIdUser, setIsIdUser] = useState<number| null>(null);
    const [isCua, setIsCua] = useState(false);

    const[search,setSearch]=useState("");//Buscador
    const[confirmId,setConfirId]=useState<number | null>(null);

    const { data, isLoading } = useQuery({
            queryKey: ['GetAllUser'],
            queryFn: GetUserAllApi
    });

    // NUEVA LÍNEA CLAVE: Define el tipo de un solo elemento del array 'data'
    type UserItem = NonNullable<typeof data>[number];  
   

    const {mutate:DeleteUsers,isPending:deleting}=useMutation({
        mutationFn:DeleteuserApi,
        onError:(error)=>{
            toast.error(error.message);
        },
        onSuccess:(results)=>{
            toast.success(results);
            queryClient.invalidateQueries({queryKey:['GetAllUser']});
            setConfirId(null);
        }
    })


    //editar
    const handleEditClick = (valor: updateuser) => {
        setSelectedFormacion(valor);
        setIsEditing(true);
    };

    //buscador
    const filtered=useMemo(()=>{
    const list:UserItem[]=Array.isArray(data) ? data:[];
    const searchTerms = search.trim().toLowerCase().split(/\s+/).filter(term => term.length > 0);
    
    // Si no hay términos de búsqueda, devuelve la lista completa.
    if(searchTerms.length === 0) return list;
    
    // Función para obtener una cadena combinada de los campos a buscar
    const combinedSearchableText = (r: UserItem) => 
        `${r.nombre ?? ''} ${r.apellido ?? ''} ${r.city ?? ''} ${r.Email ?? ''}`.toLowerCase();
    
    return list.filter((r) => {
        const fullText = combinedSearchableText(r);
        
        // Verifica que CADA término de búsqueda esté contenido en el texto combinado.
        return searchTerms.every(term => fullText.includes(term));
    });
    },[data,search])

    //Reset Passwd
    const ResetPasswds = (valor: number) => {
        setIsIdUser(valor);
        setIsCua(true);
    };
    if(isLoading) return <Loading/>
  if(data) return (

    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
        <div className="mx-auto max-w-[1600px]">
            {/*Header con titulo */}
            <header className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-[#00155C] mb-1">Usuarios</h1>
                        <p className="text-sm text-gray-600">Administra el catalogo completo de Usuarios</p>
                    </div>
                    <button
                    onClick={()=>setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#00155C] hover:bg-[#001a7a] 
                    text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                         Crear Usuario
                    </button>
                </div>
            </header>

            {/* Barra de búsqueda y filtros */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <svg
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                        value={search}
                        onChange={(e)=>setSearch(e.target.value)}
                        placeholder="Buscar por Nombre, Apellido, ciudad o correo"
                        className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00155C] focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm"
                        />
                        {search &&(
                            <button aria-label="Limpiar búsqueda"
                                onClick={() => setSearch("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                ✕
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <div className="px-4 py-2 bg-blue-50 text-[#00155C] rounded-lg font-semibold border border-blue-100">
                            {filtered?.length ?? 0}{filtered?.length===1 ? "usuarios":" Usuarios"}
                        </div>
                    </div>
                </div>
            </div>

            {/*Contenido */}       
            <div className="bg-white rounded-2xl shadow-lg border broder-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
                        <table className="w-full">
                            <thead className="sticky top-0 z-10 bg-[#00155C] text-white">
                                <tr>
                                    <ThCell width="w-16">Nro</ThCell>
                                    <ThCell width="w-46">Nombre</ThCell>
                                    <ThCell width="w-46">Apellido</ThCell>
                                    <ThCell width="w-40">Email</ThCell>
                                    <ThCell width="w-16">Telefono</ThCell>
                                    <ThCell width="w-80">Ubicacion</ThCell>
                                    <ThCell width="w-16">Rol</ThCell>
                                    <ThCell width="w-60">Opciones</ThCell>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {(!filtered || filtered.length===0)&&(
                                    <tr>
                                        <td colSpan={8} className="py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                            <div>
                                                <p className="text-gray-500 font-medium">No se encontraron los Usuarios</p>
                                                <p className="text-sm text-gray-400 mt-1">
                                                {search ? "Intenta con otros términos de búsqueda" : "Comienza creando tu primer Usuario"}
                                                </p>
                                            </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {filtered?.map((item:UserItem ,index:number)=>(
                                    <tr
                                    key={item.id_user}
                                    className="hover:bg-blue-50/50 transition-colors group">
                                        <TdCell className="text-center font-semibold text-gray-500">{index + 1}</TdCell>

                                        <TdCell className="font-semibold text-gray-900">{item.nombre}</TdCell>

                                        <TdCell className="font-semibold text-gray-900">{item.apellido}</TdCell>

                                        <TdCell className="text-gray-700">{item.Email}</TdCell>

                                        <TdCell className="text-gray-700">{item.telefono}</TdCell>

                                        <TdCell className="text-gray-700">{item.pais}-{item.city}</TdCell>

                                        <TdCell className="text-gray-700">{item.name_rol}</TdCell>

                                        <TdCell>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEditClick(item)} 
                                                    className="hover:scale-105 duration-300 hover:cursor-pointer">
                                                    <img className="w-6" src={Editar} alt="Editar" />
                                                </button>
                                                <button 
                                                    onClick={()=>setConfirId(item.id_user)}
                                                    className="hover:scale-105 duration-300 hover:cursor-pointer">
                                                        <img className="w-6" src={Eliminar} alt="Eliminar" />
                                                </button>
                                                <button
                                                    onClick={() => ResetPasswds(item.id_user)}
                                                    className="shadow-xl p-[2px] w-8 h-8 bg-white rounded-full hover:bg-[#00155C] duration-300 hover:scale-105 cursor-pointer"
                                                >
                                                    <img className="w-6 m-auto" src={reset} alt="" />
                                                </button>

                                            </div>
                                        </TdCell>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        
        {
            isOpen && (
                <Suspense fallback={<Loading/>}>
                    <UserForm
                        setIsOpen={setIsOpen} 
                        isOpen={isOpen}
                    />
                </Suspense>
                )
        }
         {
            isEditing && (
                <Suspense fallback={<Loading/>}>
                    <UdpateUser
                        Sendvalor={selectedFormacion}
                        SetVer={setIsEditing}
                    />
                </Suspense>
        )}
         {isCua && (
            <Suspense fallback={<Loading/>}>
                <ResetPassword Sendvalor={isIdUser} SetVer={setIsCua}/>
            </Suspense>
        )}
        {confirmId !== null &&(
            <ConfirmDialog
                title="¿Eliminar Usuario?"
                message="Esta accion eliminara al Usuario de forma permanente."
                confirmLabel={deleting ? "Eliminando..." : "Si, eliminar"}
                cancelLabel="Cancelar"
                onCancel={()=>setConfirId(null)}
                onConfirm={()=>DeleteUsers(confirmId)}
                disabled={deleting}
            />
        )}

    </div>
  );
}

function ThCell({children,width=""}:{children:React.ReactNode;width?:string}){
    return(
        <th className={`px-4 py-4 text-left ${width}`}>
            <span className="text-xs font-bold uppercase tracking-wider"> {children}</span>
        </th>
    );
}
function TdCell({children,className=""}:{children:React.ReactNode;className?:string}){
    return(
        <td className={`px-4 py-4 text-sm text-gray-700 ${className}`}>
            {children}
        </td>
    );
}

//Confirma Dialogo
function ConfirmDialog({
    title,
    message,
    confirmLabel="Confirmar",
    cancelLabel="Cancelar",
    onConfirm,
    onCancel,
    disabled=false,
}:{
    title:string;
    message:string;
    confirmLabel?:string;
    cancelLabel?:string;
    onConfirm:()=>void;
    onCancel:()=>void;
    disabled?:boolean;
}){
    return(
        <>
            <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm" onClick={onCancel}/>
            
            <div
            role="dialog"
            aria-modal="true"
            className="fixed z-[130] inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                    {/*Header icono */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-5 border-b border-red-100">
                        <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                        </div>
                    </div>

                     {/**Cuerpo */}
                    <div className="px-6 py-5">
                        <p className="text-gray-600 leading-relaxed">{message}</p>
                    </div>

                    {/**Pie del modal */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                        <button
                        onClick={onCancel}
                        className="px-5 py-2.5 rounded-b-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all"
                        >
                            {cancelLabel}
                        </button>
                        <button 
                        onClick={onConfirm}
                        disabled={disabled}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                        >
                            {confirmLabel}
                        </button>
                    </div>

                </div>

            </div>
            
        </>
    );
}

