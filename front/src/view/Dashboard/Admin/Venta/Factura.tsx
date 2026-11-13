import { useState } from "react";
import { Ban, Banknote, Check, CreditCard, QrCode, Receipt, X } from "lucide-react";

export interface IDatosCobro {
  tipoPago: "Efectivo" | "Tarjeta de Crédito" | "QR Directo";
  observaciones?: string;
  emitirRecibo: boolean;
}

interface ReciboProps {
  isOpen: boolean;
  total: number;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (datos: IDatosCobro) => void;
}

// ─── Paleta (sin cambios) ────────────────────────────────────────────────────
const C = {
  dark: "#4A1A6E",
  medium: "#7B3FA0",
  light: "#F3EBF9",
  border: "#D8B4F0",
  text: "#2D0A47",
};
const SURFACE = "#FBF8FE";
const GRADIENT = `linear-gradient(135deg, ${C.dark}, ${C.medium})`;

// Opciones de pago con su ícono (mismos 3 valores de antes)
const OPCIONES_PAGO: { valor: IDatosCobro["tipoPago"]; icono: typeof Banknote }[] = [
  { valor: "Efectivo", icono: Banknote },
  { valor: "Tarjeta de Crédito", icono: CreditCard },
  { valor: "QR Directo", icono: QrCode },
];

export default function Recibo({
  isOpen,
  total,
  isLoading = false,
  onClose,
  onConfirm,
}: ReciboProps) {
  const [tipoPago, setTipoPago] = useState<IDatosCobro["tipoPago"]>("Efectivo");
  const [observaciones, setObservaciones] = useState("");
  const [emitirRecibo, setEmitirRecibo] = useState(true);

  if (!isOpen) return null;

  function handleConfirmar() {
    onConfirm({
      tipoPago,
      observaciones: observaciones.trim() || undefined,
      emitirRecibo,
    });
  }

  function handleClose() {
    setTipoPago("Efectivo");
    setObservaciones("");
    setEmitirRecibo(true);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cobro-title"
        className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl"
        style={{ borderColor: C.border }}
      >
        {/* ── Header ── */}
        <div
          className="relative flex flex-shrink-0 items-center justify-between gap-3 overflow-hidden px-5 py-4 text-white"
          style={{ background: GRADIENT }}
        >
          <div className="pointer-events-none absolute -right-6 -top-10 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 shadow-inner">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h2 id="cobro-title" className="text-base font-bold leading-tight tracking-tight">
                Cobro y emisión de recibo
              </h2>
              <p className="text-xs text-purple-200">Confirma el pago para cerrar la venta</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 transition-colors hover:bg-white/25"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Cuerpo (con scroll si la pantalla es baja) ── */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5" style={{ background: SURFACE }}>
          {/* Tipo de pago */}
          <div>
            <p className="mb-2 text-sm font-semibold" style={{ color: C.dark }}>
              Tipo de pago
            </p>
            <div role="radiogroup" aria-label="Tipo de pago" className="grid grid-cols-3 gap-2">
              {OPCIONES_PAGO.map(({ valor, icono: IconoPago }) => {
                const activo = tipoPago === valor;
                return (
                  <button
                    key={valor}
                    type="button"
                    role="radio"
                    aria-checked={activo}
                    onClick={() => setTipoPago(valor)}
                    className="relative flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 text-xs font-semibold transition-all active:scale-95"
                    style={
                      activo
                        ? { borderColor: C.medium, background: C.light, color: C.dark }
                        : { borderColor: C.border, background: "#FFFFFF", color: C.medium }
                    }
                  >
                    {/* Marca de verificación: solo aparece en la opción elegida */}
                    {activo && (
                      <span
                        className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-white"
                        style={{ background: C.medium }}
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                    )}
                    <IconoPago className="h-5 w-5" />
                    <span className="text-center leading-tight">{valor}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ¿Generar recibo? */}
          <div>
            <p className="mb-2 text-sm font-semibold" style={{ color: C.dark }}>
              ¿Generar recibo?
            </p>
            {/* Control segmentado: dos opciones dentro de una misma pastilla */}
            <div
              role="radiogroup"
              aria-label="Generar recibo"
              className="grid grid-cols-2 gap-1 rounded-xl border-2 bg-white p-1"
              style={{ borderColor: C.border }}
            >
              <button
                type="button"
                role="radio"
                aria-checked={emitirRecibo}
                onClick={() => setEmitirRecibo(true)}
                className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all"
                style={emitirRecibo ? { background: GRADIENT, color: "#FFFFFF" } : { color: C.medium }}
              >
                <Receipt className="h-3.5 w-3.5" />
                Con Recibo
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={!emitirRecibo}
                onClick={() => setEmitirRecibo(false)}
                className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all"
                style={!emitirRecibo ? { background: GRADIENT, color: "#FFFFFF" } : { color: C.medium }}
              >
                <Ban className="h-3.5 w-3.5" />
                Sin Recibo
              </button>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <label htmlFor="observaciones-venta" className="flex items-baseline gap-1.5 text-sm font-semibold" style={{ color: C.dark }}>
                Observaciones de venta
                <span className="text-xs font-normal text-gray-400">opcional</span>
              </label>
              {/* Contador de caracteres (el límite sigue siendo 500) */}
              <span className="text-xs text-gray-400">{observaciones.length}/500</span>
            </div>
            <textarea
              id="observaciones-venta"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Ej: cliente solicita factura a nombre de..."
              className="w-full resize-none rounded-xl border-2 bg-white px-3.5 py-2.5 text-sm font-medium outline-none transition-all placeholder:text-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
              style={{ borderColor: C.border, color: C.text }}
            />
          </div>

          {/* Monto total */}
          <div
            className="rounded-2xl border p-4 text-center"
            style={{ background: C.light, borderColor: C.border }}
          >
            <p className="text-sm font-semibold" style={{ color: C.medium }}>
              Monto total
            </p>
            <p className="mt-0.5 text-3xl font-bold tracking-tight" style={{ color: C.dark }}>
              Bs {total.toFixed(2)}
            </p>
          </div>
        </div>

        {/* ── Footer fijo (los botones nunca se esconden al hacer scroll) ── */}
        <div
          className="flex flex-shrink-0 gap-2 border-t bg-white px-5 py-4"
          style={{ borderColor: C.border }}
        >
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 rounded-xl border-2 bg-white py-2.5 text-sm font-bold transition-all hover:bg-purple-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderColor: C.border, color: C.dark }}
          >
            Regresar
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={isLoading}
            className="flex flex-[1.4] items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            style={{ background: GRADIENT }}
          >
            {isLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Procesando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" strokeWidth={3} />
                Confirmar transacción
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}