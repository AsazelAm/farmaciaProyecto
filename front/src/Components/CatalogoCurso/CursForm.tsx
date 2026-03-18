import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GetAreasConocimiento } from "../../Api/Administracion";
import { GetPvAll } from "../../Api/PvApi";
import { createCurso } from "../../Api/Cursos";
import { lazy, useMemo, useState, Suspense } from "react";
import { toast } from "react-toastify";
import { saveContenidoTree, type ContenidoNode } from "../../Helpers/Contenido";
import { createCursoContenidoBulkApi } from "../../Api/CursoContenido";

const ContenidoBuilder = lazy(
  () => import("..//CatalogoCurso/ContenidoBuilder/CursoContenidoBuilder")
);

type Props = { isOpen: boolean; setIsOpen: (v: boolean) => void };

type FormData = {
  nombre: string;
  codigo: string;
  duracion: number;
  precio: number | null;
  descripcion: string;
  img: File | null;
  propuestas: number[];
  areas: number[];
  audiencia: string;
  objetivos: string;
  prerequisitos: string;
  certificaciones: string;
  contenido: string;
  beneficios: string;
  inversion: string;
};

export default function CursForm({ isOpen, setIsOpen }: Props) {
  const qc = useQueryClient();
  const { data: catAreasRaw } = useQuery({
    queryKey: ["areas"],
    queryFn: GetAreasConocimiento,
  });
  const { data: catPv } = useQuery({ queryKey: ["pv"], queryFn: GetPvAll });
  const [contenido, setContenido] = useState<ContenidoNode[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: {
      nombre: "",
      codigo: "",
      duracion: 0,
      precio: null,
      descripcion: "",
      img: null,
      propuestas: [],
      areas: [],
      audiencia: "",
      objetivos: "",
      prerequisitos: "",
      certificaciones: "",
      contenido: "",
      beneficios: "",
      inversion: "",
    },
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [qArea, setQArea] = useState("");

  const catAreas = useMemo(() => {
    if (!catAreasRaw) return [];
    const q = qArea.trim().toLowerCase();
    if (!q) return catAreasRaw;
    return catAreasRaw.filter((a: any) =>
      String(a.n_area ?? "")
        .toLowerCase()
        .includes(q)
    );
  }, [catAreasRaw, qArea]);

  const mutation = useMutation({
    mutationFn: async (p: {
      dto: any;
      file: File | null;
      contenido: ContenidoNode[];
    }) => {
      // 1) Crear el curso (1 HTTP)
      const curso = await createCurso(p.dto, p.file);
      const cursoId = curso.id;

      if (!cursoId) {
        throw new Error("No se recibió el ID del curso creado");
      }

     
      if (p.contenido && p.contenido.length > 0) {
        await createCursoContenidoBulkApi(cursoId, p.contenido);
      }

      return curso;
    },
    // ...
  });

  const onSubmit = (d: FormData) => {
    const dto = {
      base: {
        nombre: d.nombre,
        codigo: d.codigo,
        duracion: Number(d.duracion),
        precio: d.precio ?? null,
        descripcion: d.descripcion || null,
      },
      secciones: {
        audiencia: d.audiencia,
        objetivos: d.objetivos,
        prerequisitos: d.prerequisitos,
        certificaciones: d.certificaciones,
        contenido: d.contenido,
        beneficios: d.beneficios,
        inversion: d.inversion,
      },
      areas: d.areas.map(Number),
      propuestas: d.propuestas.map(Number),
    };

    mutation.mutate({ dto, file: d.img ?? null, contenido });
  };

  const selectedAreas = watch("areas");
  const selectedPv = watch("propuestas");

  const Counter = ({ value, max = 4000 }: { value: string; max?: number }) => (
    <span className="text-xs text-gray-400">
      {value.length} / {max}
    </span>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-7xl my-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          {/* Header mejorado */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-xs uppercase tracking-widest font-semibold mb-1">
                  Sistema Académico
                </p>
                <h2 className="text-3xl font-bold text-white">
                  Crear Nuevo Curso
                </h2>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setPreview(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium text-sm backdrop-blur-sm transition-all border border-white/30"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/90 hover:bg-white text-gray-700 font-medium text-sm transition-all shadow-lg"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Información básica */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b-2 border-indigo-100">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  Información del Curso
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Nombre */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre del Curso <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm"
                    placeholder="Ej. Introducción a la Programación"
                    {...register("nombre", {
                      required: "El nombre es requerido",
                    })}
                  />
                  {errors.nombre && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <span>⚠</span> {errors.nombre.message}
                    </p>
                  )}
                </div>

                {/* Código */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Código <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm font-mono"
                    placeholder="INF-101"
                    {...register("codigo", {
                      required: "El código es requerido",
                    })}
                  />
                  {errors.codigo && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <span>⚠</span> {errors.codigo.message}
                    </p>
                  )}
                </div>

                {/* Duración */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duración (horas) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm"
                    placeholder="40"
                    {...register("duracion", {
                      valueAsNumber: true,
                      required: "La duración es requerida",
                    })}
                  />
                  {errors.duracion && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <span>⚠</span> {errors.duracion.message}
                    </p>
                  )}
                </div>

                {/* Precio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Precio (Bs)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm"
                    placeholder="500.00"
                    {...register("precio", { valueAsNumber: true })}
                  />
                </div>

                {/* Descripción */}
                <div className="lg:col-span-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <Counter value={watch("descripcion") || ""} />
                  </div>
                  <textarea
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm min-h-[120px] resize-y"
                    placeholder="Describe el curso de forma clara y atractiva..."
                    {...register("descripcion", {
                      required: "La descripción es requerida",
                    })}
                  />
                  {errors.descripcion && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <span>⚠</span> {errors.descripcion.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Propuestas de Valor e Imagen */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Propuestas */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-purple-100">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Propuestas de Valor
                  </h3>
                </div>

                <select
                  multiple
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-sm h-48"
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions).map(
                      (o) => Number(o.value)
                    );
                    setValue("propuestas", values);
                  }}
                >
                  {catPv?.map((p: any) => (
                    <option key={p.id_pv} value={p.id_pv} className="py-2">
                      {p.nombre}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  💡 Usa Ctrl/Cmd + clic para seleccionar varias opciones
                </p>

                {selectedPv?.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    {selectedPv.map((id) => {
                      const item = catPv?.find((x: any) => x.id_pv === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-2 rounded-full bg-white text-purple-700 border-2 border-purple-200 px-3 py-1 text-xs font-medium shadow-sm"
                        >
                          {item?.nombre ?? id}
                          <button
                            type="button"
                            onClick={() =>
                              setValue(
                                "propuestas",
                                selectedPv.filter((x) => x !== id)
                              )
                            }
                            className="hover:text-purple-900"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Imagen */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-pink-100">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-pink-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Imagen del Curso
                  </h3>
                </div>

                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const f = e.dataTransfer.files?.[0] ?? null;
                    setValue("img", f);
                    setPreview(f ? URL.createObjectURL(f) : null);
                  }}
                  className={`flex flex-col items-center justify-center rounded-2xl border-3 border-dashed p-8 cursor-pointer transition-all ${
                    dragOver
                      ? "border-indigo-400 bg-indigo-50 scale-105"
                      : "border-gray-300 hover:border-indigo-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setValue("img", f);
                      setPreview(f ? URL.createObjectURL(f) : null);
                    }}
                  />
                  {!preview ? (
                    <>
                      <svg
                        className="w-12 h-12 text-gray-400 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-sm text-gray-600 font-medium mb-1">
                        Arrastra una imagen aquí
                      </p>
                      <p className="text-xs text-gray-400">
                        o haz clic para seleccionar
                      </p>
                    </>
                  ) : (
                    <div className="relative w-full">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-56 object-cover rounded-xl shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setValue("img", null);
                          setPreview(null);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </label>
              </div>
            </section>

            {/* Áreas */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  Áreas de Conocimiento
                </h3>
              </div>

              {selectedAreas?.length > 0 && (
                <div className="flex flex-wrap gap-2 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  {selectedAreas.map((id) => {
                    const item = catAreasRaw?.find(
                      (x: any) => x.id_areas === id
                    );
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() =>
                          setValue(
                            "areas",
                            selectedAreas.filter((x) => x !== id)
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-full bg-white text-blue-700 border-2 border-blue-200 px-3 py-1 text-xs font-medium shadow-sm hover:bg-blue-100 transition-colors"
                      >
                        {item?.n_area ?? id}
                        <span className="text-blue-500 font-bold">×</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <input
                value={qArea}
                onChange={(e) => setQArea(e.target.value)}
                placeholder="🔍 Buscar áreas..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm"
              />

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-auto p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
                {catAreas?.map((a: any) => {
                  const checked = selectedAreas.includes(a.id_areas);
                  return (
                    <label
                      key={a.id_areas}
                      className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${
                        checked
                          ? "bg-blue-100 border-2 border-blue-300"
                          : "bg-white border-2 border-gray-200 hover:border-blue-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const s = new Set(selectedAreas);
                          if (e.target.checked) s.add(a.id_areas);
                          else s.delete(a.id_areas);
                          setValue("areas", Array.from(s) as number[]);
                        }}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-xs font-medium text-gray-700 truncate">
                        {a.n_area}
                      </span>
                    </label>
                  );
                })}
                {(!catAreas || catAreas.length === 0) && (
                  <p className="col-span-full text-center text-sm text-gray-400 py-8">
                    No se encontraron áreas
                  </p>
                )}
              </div>
            </section>

            {/* Secciones del curso */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b-2 border-emerald-100">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  Detalles del Curso
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(
                  [
                    [
                      "audiencia",
                      "👥 Audiencia",
                      "¿A quién va dirigido este curso?",
                    ],
                    [
                      "objetivos",
                      "🎯 Objetivos",
                      "¿Qué aprenderán los estudiantes?",
                    ],
                    [
                      "prerequisitos",
                      "📋 Prerrequisitos",
                      "¿Qué conocimientos previos se necesitan?",
                    ],
                    [
                      "certificaciones",
                      "🏆 Certificaciones",
                      "¿Qué certificaciones se otorgan?",
                    ],

                    [
                      "beneficios",
                      "✨ Beneficios",
                      "¿Qué ventajas obtendrán los estudiantes?",
                    ],
                    [
                      "inversion",
                      "💰 Inversión",
                      "Detalles sobre costos y pagos",
                    ],
                  ] as const
                ).map(([name, labelTxt, placeholder]) => {
                  const val = (watch(name) as string) || "";
                  return (
                    <div key={name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-gray-700">
                          {labelTxt}
                        </label>
                        <Counter value={val} />
                      </div>
                      <textarea
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none text-sm min-h-[140px] resize-y"
                        {...register(name)}
                        placeholder={placeholder}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
            {/* Contenido temático / Índice del curso */}
            {/* Contenido temático del Curso */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b-2 border-indigo-100">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h10M4 14h8M4 18h6"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Contenido del Curso
                  </h3>
                  <p className="text-xs text-gray-500">
                    Construye el índice del curso con temas y subtemas.
                  </p>
                </div>
              </div>

              <Suspense
                fallback={
                  <div className="text-sm text-gray-500">
                    Cargando editor de contenido...
                  </div>
                }
              >
                <ContenidoBuilder value={contenido} onChange={setContenido} />
              </Suspense>
            </section>
          </div>

          {/* Footer con botones */}
          <div className="bg-gray-50 px-8 py-6 flex items-center justify-end gap-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all"
            >
              Cancelar
            </button>
            <button
              disabled={isSubmitting || mutation.isPending}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {isSubmitting || mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Guardando...
                </span>
              ) : (
                "Guardar Curso"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
