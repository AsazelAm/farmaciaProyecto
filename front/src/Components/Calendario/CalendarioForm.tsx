import clear from "../../assets/clear.png"
import cerrar from "../../assets/cerrar.png";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GetCursoCalendarioApi } from "../../Api/Cursos";
import Loading from "../../Helpers/Loading";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { CityModalidadAPI, ModCalendarioAPI, PvCalendarioAPI } from "../../Api/PvApi";
import { GetDocenteAPI } from "../../Api/UserApi";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import ErrorMessage from "../Error/ErrorMessage";
import { GetCountryAPI } from "../../Api/Country";
import { GetAreasConocimiento } from "../../Api/Administracion";
import { useState } from "react";
import { CreateCalendarioAPI } from "../../Api/Calendario";
import { toast } from "react-toastify";

type Cua = Readonly<{
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isOpen: any;
}>;
type FormData = {
  id_curso: number;
  id_pv:number;
  id_country:number;
  id_user:number;
  id_mod: number;
  id_city: number;
  Estado: string;
  Dias:string;
  FechaIni:string;
  HoraIni:string;
  HoraFin:string;
  AreasConocimientos: {
    id_areas: number;
  }[];
  ProPuestasDeValor: {
    id_pv: number;
  }[];
}
export default function CalendarioForm({ setIsOpen, isOpen }: Cua) {

    const [selectedOption, setSelectedOption] = useState("AREA");
    const queryClient = useQueryClient();
    
    const { data: Country, isLoading:isCountry } = useQuery({
        queryKey: ['GetCountry'],
        queryFn: GetCountryAPI,
    });

    const { data: Curso, isLoading:isCursoCalendario } = useQuery({
        queryKey: ['GetCursoCalendario'],
        queryFn: GetCursoCalendarioApi,
    });

     const { data: PvCalendario, isLoading:isPvCalendario } = useQuery({
        queryKey: ['PropuestaCalendario'],
        queryFn: PvCalendarioAPI,
    });

    const { data: ModCalendario, isLoading:isModCalendario } = useQuery({
        queryKey: ['ModalidadCalendario'],
        queryFn: ModCalendarioAPI,
    });

    const { data: CityCalendario, isLoading:isCityCalendario } = useQuery({
        queryKey: ['CityCalendario'],
        queryFn: CityModalidadAPI,
    });

    const { data: Docente, isLoading:isDocente } = useQuery({
        queryKey: ['userCalendario'],
        queryFn: GetDocenteAPI,
    });

    const { data:ac, isLoading:isac } = useQuery({
        queryKey: ['GetAllAreas'],
        queryFn: GetAreasConocimiento
    });
     const { register, handleSubmit, reset, control,watch,setValue,  formState: { errors },} = useForm<FormData>({
        defaultValues: {
          id_pv:0,
          id_user:0,
          id_mod:0,
          id_country:0,
          id_city:0,
          Estado: 'FINALIZADO',
          FechaIni:'',
          HoraIni:'',
          HoraFin:'',
          Dias:'',
          AreasConocimientos:[],
          ProPuestasDeValor:[],
        }
    });

    const diasSemana = [
    { nombre: "Lunes", abrev: "LUN" },
    { nombre: "Martes", abrev: "MAR" },
    { nombre: "Miércoles", abrev: "MIE" },
    { nombre: "Jueves", abrev: "JUE" },
    { nombre: "Viernes", abrev: "VIE" },
    { nombre: "Sábado", abrev: "SAB" },
    { nombre: "Domingo", abrev: "DOM" },
  ];

    const diasSeleccionados = watch("Dias")?.split(", ") || [];

        const handleChange = (abrev: string) => {
        let nuevosDias = [...diasSeleccionados];

        if (nuevosDias.includes(abrev)) {
        nuevosDias = nuevosDias.filter((d) => d !== abrev);
        } else {
        nuevosDias.push(abrev);
        }

        setValue("Dias", nuevosDias.join(", "));
    };

    const { fields:fieldAreasConocimientos, append: appendAreasConocimientos, remove: removeAreasConocimientos } = useFieldArray({
        control,
        name: "AreasConocimientos",
    });

    
    const { fields:ProPuestasDeValor, append: appendProPuestasDeValor, remove: removeProPuestasDeValor } = useFieldArray({
        control,
        name: "ProPuestasDeValor",
    });


     const { mutate } = useMutation({
        mutationFn: CreateCalendarioAPI,
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: (results) => {
            queryClient.invalidateQueries({ queryKey: ["GetCalendario"] });
            toast.success(results);
            reset();
            setIsOpen(!isOpen);
        }
    });
    const onSubmit = (data: FormData) => {
        mutate(data);
    };


    if(isCursoCalendario || isPvCalendario || isModCalendario || isCityCalendario || isDocente || isCountry || isac) return <Loading/>
  return (
   <div>
      <button  className='overlay' onClick={() => setIsOpen(!isOpen)}>
      </button>
        <article className="w-8/12 m-auto px-10 py-4 rounded-xl fixed z-[100] top-[0%] left-[18%] bg-[#FFFFFF] up">
          <div className='flex justify-between'>
           <button 
            type="button" 
            className="bg-green-500 p-2 rounded-lg text-white cursor-pointer self-center flex gap-2 hover:scale-105 duration-300"
          >
            <img className='w-4' src={clear}  alt="" />
            <p className='text-xs self-center text-white font-semibold'>Limpiar Datos</p>
          </button>
           <button className=' self-center cursor-pointer hover:scale-105 duration-300' onClick={() => setIsOpen(!isOpen)}>
            <img className="w-6 "  src={cerrar} alt="Cerrar" />
          </button>
         </div>
          <h2 className="text-2xl font-semibold text-[#00155C]">Nuevo Inicio de Curso:</h2>
          <form noValidate className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
           <div className="flex gap-2 flex-col justify-between">
                <label htmlFor="curso">Curso</label>
                <div className="text-xs">
                    <Controller
                        name="id_curso"
                        control={control}
                        render={({ field }) => (
                            <Autocomplete
                            options={Curso || []}
                            getOptionLabel={(option: any) => option.n_curso}
                            onChange={(_, value) => field.onChange(value ? value.id_curso : 0)}
                            renderInput={(params) => (
                                <TextField
                                {...params} 
                                label="Curso"
                                placeholder="Selecciona un curso"
                                size="small"
                                slotProps={{
                                    input: {
                                    ...params.InputProps,
                                    sx: {
                                        fontSize: "0.75rem",
                                        padding: "4px 8px",
                                    },
                                    },
                                    inputLabel: {
                                    shrink: true,
                                    sx: {
                                        fontSize: "0.75rem",
                                    },
                                    },
                                }}
                                sx={{
                                    "& .MuiAutocomplete-input": {
                                    fontSize: "0.75rem",
                                    },
                                    "& .MuiAutocomplete-option": {
                                    fontSize: "0.75rem",
                                    padding: "2px 8px",
                                    },  
                                }}
                                />
                            )}
                            />
                        )}
                        />
                        {errors.id_curso && (
                            <ErrorMessage>{errors.id_curso.message}</ErrorMessage>
                        )}
                </div>
            </div>      
            <div className="flex gap-10">
                <div className="flex flex-col w-2/12 gap-2">
                    <label htmlFor="pv" className="text-[#00155C]">Propuesta de valor</label>
                    <select
                    className="shadow-lg rounded-xl text-sm text-gray-600 font-thin p-2"
                     {...register("id_pv", { required: "La propuesta de valor es importante" })}
                    >
                        <option value="0">Seleccione una propuesta de valor</option>
                        {PvCalendario?.map((item)=>(
                            <option key={item.id_pv} value={item.id_pv}>{item.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col w-2/12 gap-2">
                    <label htmlFor="pv" className="text-[#00155C]">Modalidad</label>
                    <select
                    className="shadow-lg rounded-xl text-sm text-gray-600 font-thin p-2"
                     {...register("id_mod", { required: "La propuesta de valor es importante" })}
                    >
                        <option value="0">Seleccione una Modalidad</option>
                        {ModCalendario?.map((item)=>(
                            <option key={item.id_mod} value={item.id_mod}>{item.modalidad}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col w-2/12 gap-2">
                    <label htmlFor="pv" className="text-[#00155C]">Franquicia</label>
                    <select
                    className="shadow-lg rounded-xl text-sm text-gray-600 font-thin p-2"
                     {...register("id_city", { required: "La propuesta de valor es importante" })}
                    >
                        <option value="0">Seleccione una Franquicia</option>
                        {CityCalendario?.map((item)=>(
                            <option key={item.id_city} value={item.id_city}>{item.city}</option>
                        ))}
                    </select>
                </div>
                 <div className="flex flex-col w-2/12 gap-2">
                    <label htmlFor="pv" className="text-[#00155C]">Docentes</label>
                   <div className="text-xs">
                    <Controller
                        name="id_user"
                        control={control}
                        render={({ field }) => (
                            <Autocomplete
                            options={Docente || []}
                            getOptionLabel={(option: any) => option.nombre}
                            onChange={(_, value) => field.onChange(value ? value.id_user : 0)}
                            renderInput={(params) => (
                                <TextField
                                {...params} 
                                label="Docentes"
                                placeholder="Selecciona el Docentes"
                                size="small"
                                slotProps={{
                                    input: {
                                    ...params.InputProps,
                                    sx: {
                                        fontSize: "0.75rem",
                                        padding: "4px 8px",
                                    },
                                    },
                                    inputLabel: {
                                    shrink: true,
                                    sx: {
                                        fontSize: "0.75rem",
                                    },
                                    },
                                }}
                                sx={{
                                    "& .MuiAutocomplete-input": {
                                    fontSize: "0.75rem",
                                    },
                                    "& .MuiAutocomplete-option": {
                                    fontSize: "0.75rem",
                                    padding: "2px 8px",
                                    },  
                                }}
                                />
                            )}
                            />
                        )}
                        />
                        {errors.id_user && (
                            <ErrorMessage>{errors.id_user.message}</ErrorMessage>
                        )}
                </div>
                </div>
                <div className="flex flex-col w-2/12 gap-2">
                    <label htmlFor="pv" className="text-[#00155C]">Estado</label>
                    <select
                    className="shadow-lg rounded-xl text-sm text-gray-600 font-thin p-2"
                     {...register("Estado", { required: "La propuesta de valor es importante" })}
                    >
                        <option value="FINALIZADO">FINALIZADO</option>
                        <option value="EN EJECUCION">EN EJECUCION</option>
                        <option value="CANCELADO">CANCELADO</option>
                        <option value="PROGRAMADO">PROGRAMADO</option>
                    </select>
                     {errors.Estado && (
                            <ErrorMessage>{errors.Estado.message}</ErrorMessage>
                        )}
                </div>
            </div>
            <div className="flex justify-center gap-10">
                <div className="flex flex-col w-2/12 gap-2">
                    <label htmlFor="FechaIni" className="text-[#00155C]">Fecha Inicio</label>
                    <input type="date"
                     className="shadow-lg rounded-xl text-sm text-gray-600 font-thin p-2"
                     {...register("FechaIni", { required: "La propuesta de valor es importante" })}
                    />
                    {errors.FechaIni && (
                            <ErrorMessage>{errors.FechaIni.message}</ErrorMessage>
                    )}
                </div>
                 <div className="flex flex-col w-2/12 gap-2">
                    <label htmlFor="HoraIni" className="text-[#00155C]">Hora Inicio</label>
                    <input type="time"
                     className="shadow-lg rounded-xl text-sm text-gray-600 font-thin p-2"
                     {...register("HoraIni", { required: "La propuesta de valor es importante" })}
                    />
                    {errors.HoraIni && (
                            <ErrorMessage>{errors.HoraIni.message}</ErrorMessage>
                    )}
                </div>
                 <div className="flex flex-col w-2/12 gap-2">
                    <label htmlFor="HoraFin" className="text-[#00155C]">Hora Fin</label>
                    <input type="time"
                     className="shadow-lg rounded-xl text-sm text-gray-600 font-thin p-2"
                     {...register("HoraFin", { required: "La propuesta de valor es importante" })}
                    />
                    {errors.HoraFin && (
                            <ErrorMessage>{errors.HoraFin.message}</ErrorMessage>
                    )}
                </div>
                 <div className="flex flex-col w-2/12 gap-2">
                    <label htmlFor="pv" className="text-[#00155C]">Zona Horaria</label>
                    <select
                        className="shadow-lg rounded-xl text-sm text-gray-600 font-thin p-2"
                        {...register("id_country", { required: "La propuesta de valor es importante" })}
                    >
                        <option value="0">Seleccione el Pais</option>
                        {Country?.map((item)=>(
                            <option key={item.id_country} value={item.id_country}>{item.pais}</option>
                        ))}
                    </select>
                     {errors.id_country && (
                            <ErrorMessage>{errors.id_country.message}</ErrorMessage>
                        )}
                </div>
            </div>
            <div>
                <div>
                    <label htmlFor="Dias" className="text-[#00155C] font-semibold">Días de los Cursos</label>
                    <div className="rounded-xl text-sm text-gray-600 font-thin p-2 flex flex-wrap gap-4 mt-2">
                        {diasSemana.map((dia) => (
                        <label key={dia.abrev} className="flex items-center gap-1">
                            <input
                            type="checkbox"
                            checked={diasSeleccionados.includes(dia.abrev)}
                            onChange={() => handleChange(dia.abrev)}
                            className="cursor-pointer"
                            />
                            {dia.nombre}
                        </label>
                        ))}
                    </div>
                    <p className="mt-3 text-xs text-gray-600">
                        Dias seleccionados: <b>{watch("Dias")}</b>
                    </p>
                </div>

            </div>
            <div className="bg-[#D1DADE] rounded-xl p-4">
                
                <div className="flex justify-between">
                    <h2 className="text-sm">VIZUALIZAR CURSO EN:</h2>
                    <div className="w-2/12 mb-4">
                        <select
                            value={selectedOption}
                            onChange={(e) => setSelectedOption(e.target.value)}
                            className="shadow-lg bg-white rounded-xl text-sm text-gray-600 font-thin p-2"
                        >
                            <option value="PROPUESTA">PROPUESTA DE VALOR</option>
                            <option value="AREA">AREA DE CONOCIMIENTO</option>
                        </select>
                    </div>
                </div>
                {selectedOption === "AREA" && (
                    <h2 className="text-lg text-[#00155C]">AREA DE CONOCIMIENTO</h2>
                )}
                 {selectedOption === "PROPUESTA" && (
                    <h2 className="text-lg text-[#00155C]">PROPUESTA DE VALOR</h2>
                )}
               
                {selectedOption === "AREA" && (
                    <div className="flex flex-col max-h-[300px] flex-wrap mt-2">
                    {ac?.map((item) => {
                        const isChecked = fieldAreasConocimientos.some(
                        (f) => f.id_areas === item.id_areas
                        );

                        return (
                        <label
                            key={item.id_areas}
                            className="flex items-center gap-2 cursor-pointer text-[10px] text-gray-500"
                        >
                            <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                                if (e.target.checked) {
                                appendAreasConocimientos({ id_areas: item.id_areas });
                                } else {
                                const index = fieldAreasConocimientos.findIndex(
                                    (f) => f.id_areas === item.id_areas
                                );
                                if (index >= 0) removeAreasConocimientos(index);
                                }
                            }}
                            className="appearance-none w-4 text-xs h-4 border border-gray-400 rounded-full checked:bg-blue-500 checked:border-blue-500"
                            />
                            <span>{item.n_area}</span>
                        </label>
                        );
                    })}
                    </div>
                )}

                {selectedOption === "PROPUESTA" && (
                    <div className="flex flex-col max-h-[300px] flex-wrap mt-2">
                    {PvCalendario?.map((item) => {
                        const isChecked = ProPuestasDeValor.some(
                        (f) => f.id_pv === item.id_pv
                        );

                        return (
                        <label
                            key={item.id_pv}
                            className="flex items-center gap-2 cursor-pointer text-[10px] text-gray-500"
                        >
                            <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                                if (e.target.checked) {
                                appendProPuestasDeValor({ id_pv: item.id_pv });
                                } else {
                                const index = ProPuestasDeValor.findIndex(
                                    (f) => f.id_pv === item.id_pv
                                );
                                if (index >= 0) removeProPuestasDeValor(index);
                                }
                            }}
                            className="appearance-none w-4 text-xs h-4 border border-gray-400 rounded-full checked:bg-blue-500 checked:border-blue-500"
                            />
                            <span>{item.nombre}</span>
                        </label>
                        );
                    })}
                    </div>
                )}
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
