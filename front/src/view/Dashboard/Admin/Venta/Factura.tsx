import { useState } from "react";
import { X } from "lucide-react";
import type { IFacturaInput } from "../../../../types";

// ── Tipo de datos que este modal le entrega a NewVenta.tsx al confirmar ──────
// NewVenta.tsx es quien realmente ejecuta la creación de la venta; este
// componente solo recolecta los datos de cobro y factura.
export interface IDatosCobro {
  tipoPago: "Efectivo" | "Tarjeta de Crédito" | "QR Directo";
  registrarFactura: boolean;
  facturaInput?: IFacturaInput;
  observaciones?: string;
}

interface FacturaProps {
  isOpen: boolean;
  total: number;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (datos: IDatosCobro) => void;
}

// TODO: ajusta esta lista a los tipos de factura reales que emite tu régimen
// tributario (en Bolivia normalmente: Factura con Derecho a Crédito Fiscal,
// Factura sin Derecho a Crédito Fiscal, etc). La dejo genérica.
const TIPOS_FACTURA = ["Electrónica Digital", "Manual", "Factura Exenta"];

export default function Factura({
  isOpen,
  total,
  isLoading = false,
  onClose,
  onConfirm,
}: FacturaProps) {
  // ── Estado local del formulario de cobro ──────────────────────────────
  const [tipoPago, setTipoPago] = useState<IDatosCobro["tipoPago"]>("Efectivo");
  const [registrarFactura, setRegistrarFactura] = useState(true);
  const [nitCliente, setNitCliente] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [tipoFactura, setTipoFactura] = useState(TIPOS_FACTURA[0]);
  const [observaciones, setObservaciones] = useState("");

  // Modal controlado: si el padre dice que no está abierto, no renderizamos nada.
  // Así NewVenta.tsx decide cuándo aparece, y este componente no necesita
  // saber nada del carrito ni de la lógica de venta.
  if (!isOpen) return null;

  function handleConfirmar() {
    // Empaquetamos exactamente lo que el padre necesita para llamar
    // AddVentaApi / ChangeEstadoVentaApi / EmitirFacturaApi.
    onConfirm({
      tipoPago,
      registrarFactura,
      facturaInput: registrarFactura
        ? {
            tipoFactura,
            nitCliente: nitCliente.trim() || undefined,
            razonSocial: razonSocial.trim() || undefined,
          }
        : undefined,
      observaciones: observaciones.trim() || undefined,
    });
  }

  function handleClose() {
    // Reseteamos el formulario para que la próxima venta no arrastre datos
    // de la anterior (NIT, razón social, observaciones, etc).
    setTipoPago("Efectivo");
    setRegistrarFactura(true);
    setNitCliente("");
    setRazonSocial("");
    setTipoFactura(TIPOS_FACTURA[0]);
    setObservaciones("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* ── Encabezado del modal ── */}
        <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-4 text-white">
          <h2 className="text-sm font-bold tracking-wide">
            COBRO Y DATOS TRIBUTARIOS DE FACTURACIÓN
          </h2>
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
          {/* ── Tipo de pago (columna 'tipoPago' de la tabla venta) ── */}
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

          {/* ── Checkbox: ¿emitir factura ahora? ── */}
          <label className="flex cursor-pointer items-start gap-2 rounded-xl bg-violet-50 p-3">
            <input
              type="checkbox"
              checked={registrarFactura}
              onChange={(e) => setRegistrarFactura(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-violet-600"
            />
            <span className="text-xs">
              <span className="block font-semibold text-gray-700">
                ¿Registrar Factura Asociada?
              </span>
              <span className="text-gray-400">
                Inserta registro correspondiente en la tabla &apos;factura&apos; de tu DB.
              </span>
            </span>
          </label>

          {/* ── Campos de factura: solo visibles si registrarFactura = true ── */}
          {registrarFactura && (
            <div className="space-y-3 rounded-xl border border-violet-100 p-3">
              <p className="text-xs font-bold text-gray-500">
                ATRIBUTOS DE FACTURA RELACIONADA
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-400">
                    NIT / CI Facturado
                  </label>
                  <input
                    value={nitCliente}
                    onChange={(e) => setNitCliente(e.target.value)}
                    className="w-full rounded-lg border border-violet-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400">Razón Social</label>
                  <input
                    value={razonSocial}
                    onChange={(e) => setRazonSocial(e.target.value)}
                    className="w-full rounded-lg border border-violet-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-gray-400">
                  Modalidad de Facturación (&apos;tipoFactura&apos;)
                </label>
                <select
                  value={tipoFactura}
                  onChange={(e) => setTipoFactura(e.target.value)}
                  className="w-full rounded-lg border border-violet-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  {TIPOS_FACTURA.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ── Observaciones de venta ── */}
          <div>
            <label className="text-[11px] text-gray-400">
              OBSERVACIONES DE VENTA (&apos;observaciones&apos;)
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={2}
              placeholder="Por ejemplo: Firma de la receta controlada archivada, descuento general aprobado por gerencia..."
              className="w-full resize-none rounded-lg border border-violet-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          {/* ── Monto total ── */}
          <div className="text-center">
            <p className="text-xs text-gray-400">MONTO TOTAL</p>
            <p className="text-2xl font-bold text-violet-700">${total.toFixed(2)}</p>
          </div>

          {/* ── Acciones ── */}
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