import { useEffect, useRef } from "react";
import type { updateuser } from "../../types";

type Props = Readonly<{
  SetVer:    React.Dispatch<React.SetStateAction<boolean>>;
  SendValor: updateuser | null;
}>;

const COLORS = {
  dark: "#4A1A6E", medium: "#7B3FA0", light: "#F3EBF9", border: "#D8B4F0",
};


export default function GetUsuario({ SetVer, SendValor }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Bloquea el scroll del body mientras el modal está abierto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    modalRef.current?.focus();
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!SendValor) return null;

  const {
    nombre, apellido, ci, email,
    telefono, img, nameRol,
    idUsuario, idSucursal,
    nombreSucursal,            
  } = SendValor;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(30,0,60,0.55)", backdropFilter: "blur(6px)" }}
      onClick={() => SetVer(false)}
    >
      {/* ─── CONTENEDOR MODAL ─────────────────────────────────────────────────
          stopPropagation: evita que el clic dentro cierre el modal (no burbujea al overlay) */}
      <div
        ref={modalRef}
        tabIndex={-1}
        onKeyDown={(e) => e.key === "Escape" && SetVer(false)}
        className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full outline-none"
        style={{ border: `1.5px solid ${COLORS.border}` }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ─── HEADER CON GRADIENTE ─────────────────────────────────────────── */}
        <div
          className="relative pt-8 pb-4 flex flex-col items-center gap-2 rounded-t-3xl"
          style={{ background: `linear-gradient(135deg, ${COLORS.dark}, ${COLORS.medium})` }}
        >
          {/* Botón X cerrar */}
          <button
            onClick={() => SetVer(false)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div
            className="w-44 h-44 rounded-full flex items-center justify-center text-3xl font-extrabold text-white shadow-xl overflow-hidden"
            style={{ border: "3px solid rgba(255,255,255,0.4)", background: COLORS.dark }}
          >
            {img
              ? <img src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/${img.replace(/\\/g, "/")}`} alt={nombre} className="w-full h-full object-cover" />
              : <span className="text-[20px] text-center uppercase font-bold px-2">Sin Foto</span>
            }
          </div>

          <h2 className="text-2xl font-extrabold text-white">{nombre} {apellido}</h2>
        </div>
        <div
          className="mx-6 mt-6 py-2"
          
        >
          <div className="px-5 grid grid-cols-2 gap-y-5 gap-x-4">

            {/* CI */}
            <InfoField
              label="Cédula de Identidad"
              value={ci}
              icon="🪪"
            />

            {/* TELÉFONO */}
            <InfoField
              label="Teléfono"
              value={telefono ?? "No registrado"}
              icon="📞"
            />

            {/* EMAIL — ocupa las 2 columnas con fullWidth */}
            <InfoField
              label="Email"
              value={email}
              icon="✉️"
              fullWidth
            />

            {/* ROL */}
            <InfoField
              label="Rol"
              value={nameRol ?? "Sin asignar"}
              icon="🔐"
            />
            <InfoField
              label="Sucursal"
              value={nombreSucursal ?? `#${idSucursal}`}
              icon="🏪"
            />
          </div>

          {/* ─── BARRA DE IDs INTERNOS ─────────────────────────────────────── */}
          <div className="pt-2 px-5 pb-5">
            <div className="rounded-xl p-4 flex gap-4 bg-black/20" >
              <StatBox label="ID Usuario"  value={`#${idUsuario}`} />
              <div className="w-px"        style={{ background: COLORS.border }} />
              <StatBox label="Rol"         value={nameRol ?? "—"} />
              <div className="w-px"        style={{ background: COLORS.border }} />
              <StatBox label="Sucursal"    value={nombreSucursal ?? `#${idSucursal}`} />
            </div>
          </div>

          <div className="px-4 flex justify-end">
          <button
            onClick={() => SetVer(false)}
            className="px-8 py-3 rounded-xl font-bold text-white hover:brightness-110 hover:scale-105 active:scale-95 shadow-lg transition-all"
            style={{ background: `linear-gradient(135deg, ${COLORS.dark}, ${COLORS.medium})` }}
          >
            Cerrar
          </button>
          </div>

        </div>
        
      </div>
    </div>
  );
}

// ─── SUBCOMPONENTE: InfoField ─────────────────────────────────────────────────
// label: título del campo  |  value: dato a mostrar  |  icon: emoji decorativo
// fullWidth: si es true agrega col-span-2 para ocupar toda la fila del grid
function InfoField({
  label, value, icon, fullWidth = false,
}: {
  label: string;
  value: string | number | null | undefined;
  icon?: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      {/* Etiqueta con ícono */}
      <div className="flex items-center gap-1 mb-1">
        {icon && <span className="text-xs">{icon}</span>}
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.medium }}>
          {label}
        </p>
      </div>
      {/* Valor — break-all evita overflow con emails largos */}
      <p className="text-sm font-semibold break-all pl-1" style={{ color: COLORS.dark }}>
        {value ?? "—"}
      </p>
    </div>
  );
}

// ─── SUBCOMPONENTE: StatBox ───────────────────────────────────────────────────
// Para la barra inferior de IDs. label arriba, value abajo en grande.
function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: COLORS.medium }}>
        {label}
      </p>
      <p className="text-sm font-extrabold" style={{ color: COLORS.dark }}>
        {value}
      </p>
    </div>
  );
}