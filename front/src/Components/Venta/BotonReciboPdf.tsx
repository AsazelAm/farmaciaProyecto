import { useState } from "react";
import { toast } from "react-toastify";
import { DescargarReciboPdfApi } from "../../Api/VentaApi";

interface BotonReciboPdfProps {
  idVenta: number;
  /** "compacto" = botón pequeño para la tabla · "completo" = botón grande para el modal */
  variante?: "compacto" | "completo";
  disabled?: boolean;
}

const COLORS = {
  dark: "#4A1A6E",
  medium: "#7B3FA0",
  light: "#F3EBF9",
  border: "#D8B4F0",
};

export default function BotonReciboPdf({
  idVenta,
  variante = "compacto",
  disabled = false,
}: BotonReciboPdfProps) {
  const [descargando, setDescargando] = useState(false);

  async function handleDescargar() {
    if (descargando) return; // evita doble clic mientras se genera
    setDescargando(true);
    try {
      await DescargarReciboPdfApi(idVenta);
      toast.success("Recibo PDF descargado");
    } catch (error: any) {
      toast.error(error?.message || "No se pudo generar el recibo PDF");
    } finally {
      setDescargando(false);
    }
  }

  const esCompacto = variante === "compacto";

  return (
    <button
      type="button"
      onClick={handleDescargar}
      disabled={disabled || descargando}
      title="Descargar recibo en PDF"
      className={
        esCompacto
          ? "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all hover:bg-purple-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          : "flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all hover:bg-purple-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      }
      style={{ borderColor: COLORS.border, color: COLORS.dark, backgroundColor: "#FFFFFF" }}
    >
      {descargando ? (
        <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      )}
      {descargando ? "Generando..." : "Descargar PDF recibo"}
    </button>
  );
}