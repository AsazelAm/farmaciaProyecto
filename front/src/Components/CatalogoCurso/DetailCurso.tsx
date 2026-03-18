// src/Components/CatalogoCurso/CursoDetailView.tsx
import { useQuery } from "@tanstack/react-query";
import { getCurso } from "../../Api/Cursos";
import { useEffect } from "react";

type Props = {
  idCurso: number;
  onClose: () => void;
};

export default function CursoDetailView({ idCurso, onClose }: Props) {
  const { data: detail, isLoading } = useQuery({
    queryKey: ["curso", idCurso],
    queryFn: () => getCurso(idCurso),
  });

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-700 font-medium">Cargando información del curso...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!detail?.ok || !detail?.data) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md">
          <p className="text-red-600">Error al cargar el curso</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const { base, secciones, areaIds, propuestaIds } = detail.data;
  const areas = detail.data.areas || [];
  const propuestas = detail.data.propuestas || [];

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/40 backdrop-blur-sm">
      <div className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Header con botón cerrar */}
          <div className="flex justify-end mb-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white hover:bg-gray-100 rounded-xl shadow-lg font-semibold text-gray-700 transition-all"
            >
              ✕ Cerrar
            </button>
          </div>

          {/* Contenido principal */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Hero section */}
            <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-12 md:px-12 md:py-16">
              {/* Imagen del curso */}
              {base.img && (
                <div className="absolute right-8 top-8 w-64 h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 hidden lg:block">
                  <img
                    src={base.img}
                    alt={base.n_curso || "Curso"}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-4">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  CONTENIDO DEL CURSO
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  {base.n_curso || "Sin nombre"}
                </h1>

                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl text-indigo-700 font-mono font-bold text-sm">
                    {base.codigo || "Sin código"}
                  </span>
                  <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl text-gray-700 font-semibold text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {base.duracion || 0} Horas
                  </span>
                  {base.precio && (
                    <span className="px-4 py-2 bg-emerald-500 rounded-xl text-white font-bold text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Bs {Number(base.precio).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>

                {base.descripcion && (
                  <p className="text-white/90 text-lg leading-relaxed">
                    {base.descripcion}
                  </p>
                )}
              </div>
            </div>

            {/* Propuestas y Áreas */}
            <div className="grid md:grid-cols-2 gap-6 px-8 py-8 bg-gradient-to-br from-gray-50 to-blue-50">
              {/* Propuestas de Valor */}
              {propuestas && propuestas.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Propuesta de Valor</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {propuestas.map((p: any, i: number) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl text-sm font-semibold border-2 border-purple-200"
                      >
                        {p.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Áreas de Conocimiento */}
              {areas && areas.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Áreas de Conocimiento</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {areas.map((a: any, i: number) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-semibold border-2 border-blue-200"
                      >
                        {a.n_area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Secciones del curso */}
            <div className="px-8 py-8 space-y-6">
              {/* Audiencia */}
              {secciones?.audiencia && (
                <Section
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  }
                  title="👥 Audiencia"
                  content={secciones.audiencia}
                  color="blue"
                />
              )}

              {/* Objetivos */}
              {secciones?.objetivos && (
                <Section
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  title="🎯 Objetivos"
                  content={secciones.objetivos}
                  color="green"
                />
              )}

              {/* Prerrequisitos */}
              {secciones?.prerequisitos && (
                <Section
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  }
                  title="📋 Prerrequisitos"
                  content={secciones.prerequisitos}
                  color="yellow"
                />
              )}

              {/* Contenido */}
              {secciones?.contenido && (
                <Section
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  }
                  title="📚 Contenido del Curso"
                  content={secciones.contenido}
                  color="indigo"
                />
              )}

              {/* Certificaciones */}
              {secciones?.certificaciones && (
                <Section
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  }
                  title="🏆 Certificaciones"
                  content={secciones.certificaciones}
                  color="purple"
                />
              )}

              {/* Beneficios */}
              {secciones?.beneficios && (
                <Section
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  }
                  title="✨ Beneficios"
                  content={secciones.beneficios}
                  color="pink"
                />
              )}

              {/* Inversión */}
              {secciones?.inversion && (
                <Section
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  title="💰 Inversión"
                  content={secciones.inversion}
                  color="emerald"
                />
              )}
            </div>

            {/* Footer con acciones */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-t border-gray-200 flex justify-center gap-4">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-sm"
              >
                Cerrar
              </button>
              <button className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
                Inscribirse al Curso
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========== Componente de Sección ========== */
function Section({
  icon,
  title,
  content,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
  color: "blue" | "green" | "yellow" | "indigo" | "purple" | "pink" | "emerald";
}) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    pink: "bg-pink-50 border-pink-200 text-pink-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
  };

  const iconBgClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    indigo: "bg-indigo-100 text-indigo-600",
    purple: "bg-purple-100 text-purple-600",
    pink: "bg-pink-100 text-pink-600",
    emerald: "bg-emerald-100 text-emerald-600",
  };

  return (
    <div className={`rounded-2xl border-2 ${colorClasses[color]} p-6`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl ${iconBgClasses[color]} flex items-center justify-center`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>
      <div className="prose prose-sm max-w-none">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}