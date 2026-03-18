import cerrar from "../../assets/cerrar.png";
import { useQuery } from "@tanstack/react-query";
import Loading from "../../Helpers/Loading";
import { GetCalendarioById, GetViewAreasCalendarioAPI, GetViewProCalendarioAPI } from "../../Api/Calendario";
import type { UpdateCalendarioType } from "../../types";

type Props = Readonly<{
  SetVer: React.Dispatch<React.SetStateAction<boolean>>;
  Sendvalor: UpdateCalendarioType | null;
}>;
export default function ViewCalendario({ SetVer, Sendvalor }: Props) {

    const { data, isLoading } = useQuery({
        queryKey: ['GetCalendarioById', Sendvalor?.id_calendario],
        queryFn: () => GetCalendarioById(Number(Sendvalor?.id_calendario)),
        enabled: !!Sendvalor?.id_calendario,
    });
    const { data: va, isLoading: isva } = useQuery({
            queryKey: ['GetAllAreas', Sendvalor?.id_calendario],
            queryFn: () => GetViewAreasCalendarioAPI(Number(Sendvalor?.id_calendario)),
            enabled: !!Sendvalor?.id_calendario,
    });
    
    const { data: vp, isLoading: isvp} = useQuery({
            queryKey: ['GetAllPro', Sendvalor?.id_calendario],
            queryFn: () => GetViewProCalendarioAPI(Number(Sendvalor?.id_calendario)),
            enabled: !!Sendvalor?.id_calendario,
    });
    if(isva || isLoading || isvp){return <Loading/>}
if(data) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
        {/* Overlay */}
        <button className="absolute inset-0" onClick={() => SetVer(false)}></button>

        {/* Modal */}
        <article className="relative w-11/12 sm:w-9/12 lg:w-6/12 bg-white rounded-2xl shadow-2xl p-8 transition-all animate-fadeIn">
            {/* Botón de cierre */}
            <div className="absolute top-4 right-4">
            <button
                className="p-2 rounded-full hover:bg-gray-100 transition-transform duration-200 hover:scale-110"
                onClick={() => SetVer(false)}
            >
                <img className="w-5" src={cerrar} alt="Cerrar" />
            </button>
            </div>

            {/* Título */}
            <h2 className="text-3xl font-semibold text-[#00155C] mb-6 text-center">
            Datos del Curso
            </h2>

            {/* Contenido del curso */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-h-[60vh] overflow-y-auto px-2">
            {[
                { label: "Curso", value: data.map((i) => i.n_curso) },
                { label: "Fecha Inicio", value: data.map((i) => i.FechaIni) },
                { label: "Hora Inicio", value: data.map((i) => i.Horaini) },
                { label: "Hora Fin", value: data.map((i) => i.horaFin) },
                { label: "Días de Frecuencia", value: data.map((i) => i.Dias) },
                { label: "Modalidad", value: data.map((i) => i.modalidad) },
                { label: "Propuesta de Valor", value: data.map((i) => i.propuesta) },
                { label: "Docente", value: data.map((i) => `${i.nombre} ${i.apellido}`) },
                { label: "Estado", value: data.map((i) => i.aprobado) },
            ].map((field, idx) => (
                <div
                key={idx}
                className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 border border-gray-200 hover:border-[#00155C]/30 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                <h3 className="text-sm font-semibold text-[#00155C] uppercase tracking-wide mb-1">
                    {field.label}
                </h3>
                <p className="text-gray-700 text-base font-medium leading-relaxed">
                    {field.value}
                </p>
                </div>
            ))}
            </div>

            {/* Áreas de conocimiento */}
            <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold text-[#00155C] mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#00155C] rounded-sm"></span> Áreas de Conocimiento
            </h3>
            <div className="flex flex-wrap gap-2">
                {va?.map((item) => (
                <span
                    key={item.id_vca}
                    className="bg-[#00155C]/10 text-[#00155C] px-3 py-1 rounded-full text-sm font-medium hover:bg-[#00155C]/20 transition-colors"
                >
                    {item.n_area}
                </span>
                ))}
            </div>
            </div>

            {/* Propuesta de valor */}
            <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold text-[#00155C] mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#00155C] rounded-sm"></span> Propuestas de Valor
            </h3>
            <div className="flex flex-wrap gap-2">
                {vp?.map((item) => (
                <span
                    key={item.id_pv}
                    className="bg-[#00155C]/10 text-[#00155C] px-3 py-1 rounded-full text-sm font-medium hover:bg-[#00155C]/20 transition-colors"
                >
                    {item.nombre}
                </span>
                ))}
            </div>
            </div>
        </article>
        </div>



  )
}
