// src/Components/CatalogoCurso/CursoEditForm.tsx
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GetAreasConocimiento } from "../../Api/Administracion";
import { GetPvAll } from "../../Api/PvApi";
import { getCurso, updateCurso } from "../../Api/Cursos";
import {
  listCursoContenidoApi,
  type CursoContenidoNode,
  deleteAllCursoContenidoApi,
} from "../../Api/CursoContenido";
import { saveContenidoTree, type ContenidoNode } from "../../Helpers/Contenido";
import ContenidoBuilder from "..//CatalogoCurso/ContenidoBuilder/CursoContenidoBuilder"; // 🔁 usa la MISMA ruta que en el form de crear
import { toast } from "react-toastify";

type Props = { idCurso: number; onClose: () => void };

type FormData = {
  nombre: string;
  codigo: string;
  duracion: number;
  precio: number | null;
  descripcion: string;
  propuestas: number[];
  areas: number[];
  img: File | null;
  audiencia: string;
  objetivos: string;
  prerequisitos: string;
  certificaciones: string;
  beneficios: string;
  inversion: string;
};

export default function CursoEditForm({ idCurso, onClose }: Props) {
  const qc = useQueryClient();
  const { data: catAreasRaw } = useQuery({
    queryKey: ["areas"],
    queryFn: GetAreasConocimiento,
  });
  const { data: catPv } = useQuery({ queryKey: ["pv"], queryFn: GetPvAll });

  const { data: detail, isLoading } = useQuery({
    queryKey: ["curso", idCurso],
    queryFn: () => getCurso(idCurso),
  });

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
      propuestas: [],
      areas: [],
      img: null,
      audiencia: "",
      objetivos: "",
      prerequisitos: "",
      certificaciones: "",
      beneficios: "",
      inversion: "",
    },
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [qArea, setQArea] = useState("");

  // 👉 estado para el árbol de contenido
  const [contenido, setContenido] = useState<ContenidoNode[]>([]);

  // query para el árbol de contenido
  const {
    data: contenidoApi,
    isLoading: isLoadingContenido,
    error: contenidoError,
  } = useQuery({
    queryKey: ["cursoContenido", idCurso],
    queryFn: () => listCursoContenidoApi(idCurso),
  });

  const catAreas = useMemo(() => {
    if (!catAreasRaw) return [];
    const q = qArea.trim().toLowerCase();
    if (!q) return catAreasRaw;
    return catAreasRaw.filter((a: any) =>
      String(a.n_area ?? "").toLowerCase().includes(q)
    );
  }, [catAreasRaw, qArea]);

  // Cargar datos del curso cuando lleguen
  useEffect(() => {
    if (!detail?.ok) return;
    const b = detail.data.base;
    const s = detail.data.secciones || {};

    reset({
      nombre: b.n_curso || "",
      codigo: b.codigo || "",
      duracion: Number(b.duracion || 0),
      precio: b.precio ?? null,
      descripcion: b.descripcion || "",
      propuestas: detail.data.propuestaIds || [],
      areas: detail.data.areaIds || [],
      audiencia: s.audiencia || "",
      objetivos: s.objetivos || "",
      prerequisitos: s.prerequisitos || "",
      certificaciones: s.certificaciones || "",
      beneficios: s.beneficios || "",
      inversion: s.inversion || "",
      img: null,
    });

    setPreview(b.img || null);
  }, [detail, reset]);

  // Mapear árbol del backend -> formato simple para el builder
  useEffect(() => {
    if (!contenidoApi) return;

    const mapNode = (n: CursoContenidoNode): ContenidoNode => ({
      titulo: n.titulo,
      descripcion: n.descripcion ?? "",
      hijos: (n.hijos || []).map(mapNode),
    });

    setContenido(contenidoApi.map(mapNode));
  }, [contenidoApi]);

  const mutation = useMutation({
    mutationFn: async (p: {
      dto: any;
      file: File | null;
      contenido: ContenidoNode[];
    }) => {
      // 1) actualizar curso base/secciones/relaciones
      await updateCurso(idCurso, p.dto, p.file);

      // 2) limpiar contenido anterior (si hay endpoint backend)
      await deleteAllCursoContenidoApi(idCurso);

      // 3) guardar nuevo árbol
      if (p.contenido && p.contenido.length > 0) {
        await saveContenidoTree(idCurso, p.contenido);
      }

      return true;
    },
    onSuccess: () => {
      toast.success("Curso actualizado exitosamente");
      qc.invalidateQueries({ queryKey: ["GetCursoAll"] });
      qc.invalidateQueries({ queryKey: ["curso", idCurso] });
      qc.invalidateQueries({ queryKey: ["cursoContenido", idCurso] });
      onClose();
    },
    onError: (e: any) => toast.error(e.message || "Error al actualizar"),
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
        beneficios: d.beneficios,
        inversion: d.inversion,
      },
      areas: (d.areas || []).map(Number),
      propuestas: (d.propuestas || []).map(Number),
    };

    mutation.mutate({ dto, file: d.img ?? null, contenido });
  };

  const selectedAreas = watch("areas") || [];
  const selectedPv = watch("propuestas") || [];

  const Counter = ({ value, max = 4000 }: { value: string; max?: number }) => (
    <span className="text-xs text-gray-400">
      {value?.length || 0} / {max}
    </span>
  );

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-700">Cargando curso...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-7xl my-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-xs uppercase tracking-widest font-semibold mb-1">
                  Sistema Académico
                </p>
                <h2 className="text-3xl font-bold text-white">Editar Curso</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-white/90 hover:bg-white text-gray-700 font-medium text-sm transition-all shadow-lg"
              >
                Cerrar
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Información básica */}
            <section className="space-y-6">
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  Información del Curso
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre del Curso <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none text-sm"
                    {...register("nombre", {
                      required: "El nombre es requerido",
                    })}
                  />
                  {errors.nombre && (
                    <p className="mt-1.5 text-xs text-red-500">
                      ⚠ {errors.nombre.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Código <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none text-sm font-mono"
                    {...register("codigo", {
                      required: "El código es requerido",
                    })}
                  />
                  {errors.codigo && (
                    <p className="mt-1.5 text-xs text-red-500">
                      ⚠ {errors.codigo.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duración (horas) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none text-sm"
                    {...register("duracion", {
                      valueAsNumber: true,
                      required: "La duración es requerida",
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Precio (Bs)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none text-sm"
                    {...register("precio", { valueAsNumber: true })}
                  />
                </div>

                <div className="lg:col-span-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <Counter value={watch("descripcion") || ""} />
                  </div>
                  <textarea
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none text-sm min-h-[120px] resize-y"
                    {...register("descripcion", {
                      required: "La descripción es requerida",
                    })}
                  />
                </div>
              </div>
            </section>

            {/* Propuestas e Imagen */}
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
                  value={selectedPv}
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
                  💡 Usa Ctrl/Cmd + clic para seleccionar varias
                </p>

                {selectedPv.length > 0 && (
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

                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-500 transition-all outline-none text-sm"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setValue("img", f);
                    setPreview(f ? URL.createObjectURL(f) : preview);
                  }}
                />

                {preview && (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-56 object-cover rounded-xl shadow-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setValue("img", null);
                        setPreview(null);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg"
                    >
                      ×
                    </button>
                  </div>
                )}
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

              {selectedAreas.length > 0 && (
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
                        className="inline-flex items-center gap-2 rounded-full bg-white text-blue-700 border-2 border-blue-200 px-3 py-1 text-xs font-medium shadow-sm hover:bg-blue-100"
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
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-xs font-medium text-gray-700 truncate">
                        {a.n_area}
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>

            {/* Secciones */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b-2 border-amber-100">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-amber-600"
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
                    ["audiencia", "👥 Audiencia"],
                    ["objetivos", "🎯 Objetivos"],
                    ["prerequisitos", "📋 Prerrequisitos"],
                    ["certificaciones", "🏆 Certificaciones"],
                    ["beneficios", "✨ Beneficios"],
                    ["inversion", "💰 Inversión"],
                  ] as const
                ).map(([name, labelTxt]) => {
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
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all outline-none text-sm min-h-[140px] resize-y"
                        {...register(name as keyof FormData)}
                      />
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Contenido del curso (árbol) */}
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
                    Edita el índice del curso: temas, subtemas y niveles.
                  </p>
                </div>
              </div>

              {isLoadingContenido && (
                <p className="text-sm text-gray-500">
                  Cargando contenido del curso...
                </p>
              )}

              {contenidoError && (
                <p className="text-sm text-red-500">
                  Error al cargar el contenido del curso.
                </p>
              )}

              {!isLoadingContenido && !contenidoError && (
                <ContenidoBuilder value={contenido} onChange={setContenido} />
              )}
            </section>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 flex items-center justify-end gap-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all"
            >
              Cancelar
            </button>
            <button
              disabled={isSubmitting || mutation.isPending}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
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
                "Guardar Cambios"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
