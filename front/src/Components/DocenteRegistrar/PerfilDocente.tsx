// CAMBIADO: No necesitas useState si usas react-hook-form para todo
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from 'react-toastify';
import { useForm, useFieldArray, Controller } from "react-hook-form";
import type { CreateCertiDoc } from '../../types';
import type { CreateReferencia } from '../../types';
import type { CreateHabiDoce } from '../../types';
import ErrorMessage from "../Error/ErrorMessage"; 


type CertificacionForm = CreateCertiDoc & {
    imagenUrl?: string;      
    imagenFile: File | null; // RHF manejará esto
};

type FormData = {
    nombre: string;
    apellido: string;
    habilidades: CreateHabiDoce[]; 
    conocimientos: string;
    certificaciones: CertificacionForm[];
    referencias: CreateReferencia[];
    cvFile: FileList | null; 
};

export default function PerfilDocente() {

    const {
        register,       
        handleSubmit,    
        reset,           
        watch,           
        control,         
        formState: { errors }, 
    } = useForm<FormData>({
        defaultValues: {
            nombre: "",
            apellido: "",
            habilidades: [{ n_habilidad: "" }], 
            conocimientos: "",
            certificaciones: [
                { nombre: "", institucion: "", fechaIni: "",fechaFin:"", imagenFile: null, imagenUrl:undefined }
            ],
            referencias: [
                { nombre: "", cargo: "", telefono: "" }
            ],
            cvFile: null,
        },
    });

    // --- MANEJO DE HABILIDADES  ---
    const { 
        fields: habilidadFields, 
        append: appendHabilidad, 
        remove: removeHabilidad 
    } = useFieldArray({
        control,
        name: "habilidades"
    });

    const { 
        fields: certFields, 
        append: appendCert, 
        remove: removeCert 
    } = useFieldArray({
        control,
        name: "certificaciones"
    });

    const { 
        fields: refFields, 
        append: appendRef, 
        remove: removeRef 
    } = useFieldArray({
        control,
        name: "referencias"
    });


    const handleFormSubmit = (data: FormData) => {
        console.log("Datos a enviar (validados por RHF):", data);


        const cv = data.cvFile ? data.cvFile[0] : null;
        console.log("CV File:", cv);


        console.log("Archivo de primera certificación:", data.certificaciones[0]?.imagenFile);

        alert('Formulario enviado! Revisa la consola para ver los datos.');

    };


    const cvFileValue = watch("cvFile"); 
    const certFilesValues = watch("certificaciones");


    return (
        <div className=" flex items-start justify-center backdrop-blur-sm">
            <div className="relative w-full max-w-5xl my-1">
                
                <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
                >
                    
                    {/* ===== HEADER ===== */}
                    <div className="bg-gradient-to-r from-[#00155C] via-blue-700 to-indigo-700 px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-xs uppercase tracking-widest font-semibold mb-1">
                                    Sistema Académico
                                </p>
                                <h2 className="text-3xl font-bold text-white">
                                    Registro de Perfil Profesional
                                </h2>
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    
                                    onClick={() => reset()}
                                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-all shadow-lg"
                                >
                                    Limpiar
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className='max-h-[81vh] overflow-y-scroll'>
                        <div className="p-8 space-y-8 ">
                            
                            {/* ===== SECCIÓN 1: INFORMACIÓN BÁSICA ===== */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-100">
                                  {/* Círculo con ícono de usuario */}
                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-[#00155C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                  </div>
                                  <h3 className="text-lg font-bold text-gray-800">Información Básica</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    
                                    {/* Campo Nombre */}
                                    <div className="flex flex-col">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Nombre: <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            
                                            {...register("nombre", { required: "El nombre es obligatorio" })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00155C] focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm"
                                            placeholder="Ingrese su nombre"
                                        />
                                        
                                        {errors.nombre && <ErrorMessage>{errors.nombre.message}</ErrorMessage>}
                                    </div>
                                    
                                    {/* Campo Apellido */}
                                    <div className="flex flex-col">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Apellido: <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                           
                                            {...register("apellido", { required: "El apellido es obligatorio" })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00155C] focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm"
                                            placeholder="Ingrese su apellido"
                                        />
                                    
                                        {errors.apellido && <ErrorMessage>{errors.apellido.message}</ErrorMessage>}
                                    </div>
                                </div>
                            </section>

                            {/* ===== SECCIÓN 2: CONOCIMIENTOS ===== */}
                            <section className="space-y-6">
                                <div className="flex flex-col">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Breve descripción de tus conocimientos y experiencia
                                    </label>
                                    <textarea
                                        {...register("conocimientos")}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00155C] focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm resize-y"
                                        placeholder="Ej: Especialista en desarrollo web full-stack con React y Node.js"
                                    ></textarea>
                                </div>
                            </section>

                            {/* ===== SECCIÓN 3: HABILIDADES CLAVE ===== */}
                            <section className="space-y-6">
                                <div className="space-y-4">
                                    {habilidadFields.map((field, index) => (
                                        <div key={field.id} className="flex items-center gap-3">
                                            
                                            <input
                                                type="text"
                                                placeholder="Ej: Python, Gestión de Proyectos, Inglés C1..."
                                              
                                                {...register(`habilidades.${index}.n_habilidad`)}
                                                className="flex-grow px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none text-sm"
                                            />
                                            
                                            {habilidadFields.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeHabilidad(index)}
                                                    className="px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-all shadow-lg"
                                                >
                                                    Quitar
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    
                                    <button
                                        type="button"
                                        onClick={() => appendHabilidad({ n_habilidad: '' })}
                                        className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-all shadow-lg"
                                    >
                                        + Añadir Habilidad
                                    </button>
                                </div>
                            </section>

                            {/* ===== SECCIÓN 4: CERTIFICACIONES ===== */}
                            <section className="space-y-6">
                                <div className="space-y-4">
                                    {certFields.map((field, index) => (
                                        <div key={field.id} className="space-y-4 p-4 border rounded-lg bg-gray-50 relative">
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                
                                                <input
                                                    type="text"
                                                    placeholder="Nombre Certificación"
                                                    {...register(`certificaciones.${index}.nombre`)}
                                                    className="px-4 py-3 rounded-xl border-2 border-gray-200 ..."
                                                />
                                                
                                                <input
                                                    type="text"
                                                    placeholder="Institución"
                                                    {...register(`certificaciones.${index}.institucion`)}
                                                    className="px-4 py-3 rounded-xl border-2 border-gray-200 ..."
                                                />
                                                
                                                <input
                                                    type="date"
                                                    {...register(`certificaciones.${index}.fechaIni`)}
                                                    className="px-4 py-3 rounded-xl border-2 border-gray-200 ..."
                                                />

                                                <input
                                                    type="date"
                                                    {...register(`certificaciones.${index}.fechaFin`)}
                                                    className="px-4 py-3 rounded-xl border-2 border-gray-200 ..."
                                                />

                                            </div>
                                            
                                            <div className="flex flex-col">
                                                <label className="text-sm font-medium text-gray-700 mb-1" htmlFor={`imagenCert-${index}`}>
                                                    Subir Certificado (PDF o Imagen)
                                                </label>
                                                <Controller
                                                    name={`certificaciones.${index}.imagenFile`}
                                                    control={control}
                                                    render={({ field: { onChange, onBlur, name } }) => (
                                                        <input
                                                            id={`imagenCert-${index}`}
                                                            type="file"
                                                            accept=".jpg,.jpeg,.png,.pdf"
                                                            onBlur={onBlur}
                                                            name={name}
                                                            onChange={(e) => {
                                                                onChange(e.target.files ? e.target.files[0] : null);
                                                            }}
                                                            className="w-full border-gray-300 rounded-lg shadow-sm ..."
                                                        />
                                                    )}
                                                />
                                                {certFilesValues[index]?.imagenFile && (
                                                    <p className="text-sm text-gray-600 mt-2 font-medium">
                                                        Archivo Seleccionado: **{certFilesValues[index].imagenFile.name}**
                                                    </p>
                                                )}
                                            </div>
                                            
                                            {certFields.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeCert(index)}
                                                    className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 ..."
                                                >
                                                    Quitar Certificación
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    
                                    <button
                                        type="button"
                                        onClick={() => appendCert({ nombre: "", institucion: "", fechaIni: "", fechaFin: "", imagenFile: null, imagenUrl: undefined })}
                                        className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 ..."
                                    >
                                        + Añadir Certificación
                                    </button>
                                </div>
                            </section>

                            {/* ===== SECCIÓN 5: REFERENCIAS LABORALES ===== */}
                            <section className="space-y-6">
                                <div className="space-y-4">
                                    {refFields.map((field, index) => (
                                        <div key={field.id} className="p-5 border-2 border-indigo-200 rounded-xl ...">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Nombre de Contacto"
                                                    {...register(`referencias.${index}.nombre`)}
                                                    className="px-4 py-3 rounded-xl border-2 border-gray-200 ..."
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Cargo / Relación"
                                                    {...register(`referencias.${index}.cargo`)}
                                                    className="px-4 py-3 rounded-xl border-2 border-gray-200 ..."
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Teléfono"
                                                    {...register(`referencias.${index}.telefono`)}
                                                    className="px-4 py-3 rounded-xl border-2 border-gray-200 ..."
                                                />
                                            </div>
                                            {refFields.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeRef(index)}
                                                    className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 ..."
                                                >
                                                    Quitar Referencia
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => appendRef({ nombre: "", cargo: "", telefono: "" })}
                                        className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 ..."
                                    >
                                        + Añadir Referencia
                                    </button>
                                </div>
                            </section>

                            {/* ===== SECCIÓN 6: SUBIR CV ===== */}
                            <section className="space-y-6">
                                <div className="flex flex-col">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Selecciona tu CV (PDF o DOCX recomendado)
                                    </label>
                                    <input
                                        type="file"
                                        {...register("cvFile")}
                                        accept=".pdf,.doc,.docx"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 ..."
                                    />
                                    {cvFileValue && cvFileValue.length > 0 && (
                                        <p className="text-sm text-gray-600 mt-2 font-medium">
                                            Archivo seleccionado: {cvFileValue[0].name}
                                        </p>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* ===== FOOTER CON BOTONES (Fijo) ===== */}
                        <div className="bg-gray-50 px-8 py-4 flex items-center justify-end gap-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => reset()}
                                className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit" 
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#00155C] to-blue-700 text-white font-semibold hover:from-blue-800 hover:to-blue-900 transition-all shadow-lg hover:shadow-xl"
                            >
                                Enviar Solicitud
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}