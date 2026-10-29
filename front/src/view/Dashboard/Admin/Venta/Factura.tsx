import { useState } from "react";
import { X } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-4 text-white">
          <h2 className="text-sm font-bold tracking-wide">COBRO Y EMISIÓN DE RECIBO</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar"
            className="rounded-full p-1 hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[80vh] space-y-4 overflow-y-auto p-5">
          <div>
            <label className="mb-2 block text-xs font-bold text-gray-500">
              TIPO DE PAGO (&apos;tipoPago&apos; en Venta)
            </label>
            <div className="flex gap-2">
              {(["Efectivo", "Tarjeta de Crédito", "QR Directo"] as const).map(
                (opcion) => (
                  <button
                    key={opcion}
                    type="button"
                    onClick={() => setTipoPago(opcion)}
                    className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition-colors ${
                      tipoPago === opcion
                        ? "border-violet-600 bg-violet-600 text-white"
                        : "border-violet-200 text-gray-500 hover:bg-violet-50"
                    }`}
                  >
                    {opcion}
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-gray-500">
              ¿GENERAR RECIBO?
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEmitirRecibo(true)}
                className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition-colors ${
                  emitirRecibo
                    ? "border-violet-600 bg-violet-600 text-white"
                    : "border-violet-200 text-gray-500 hover:bg-violet-50"
                }`}
              >
                Con Recibo
              </button>
              <button
                type="button"
                onClick={() => setEmitirRecibo(false)}
                className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition-colors ${
                  !emitirRecibo
                    ? "border-violet-600 bg-violet-600 text-white"
                    : "border-violet-200 text-gray-500 hover:bg-violet-50"
                }`}
              >
                Sin Recibo
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-gray-400">
              OBSERVACIONES DE VENTA (&apos;observaciones&apos;)
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              maxLength={500}
              rows={2}
              className="mt-1 w-full resize-none rounded-lg border border-violet-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400">MONTO TOTAL</p>
            <p className="text-2xl font-bold text-violet-700">Bs{total.toFixed(2)}</p>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-violet-200 py-2 text-sm font-semibold text-violet-600 hover:bg-violet-50 disabled:opacity-40"
            >
              Regresar
            </button>
            <button
              type="button"
              onClick={handleConfirmar}
              disabled={isLoading}
              className="flex-1 rounded-xl bg-violet-600 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-40"
            >
              {isLoading ? "Procesando..." : "Confirmar Transacción"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
