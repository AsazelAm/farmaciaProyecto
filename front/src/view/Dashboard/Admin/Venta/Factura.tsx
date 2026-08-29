import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { IFacturaInput, DatosFacturacionClienteType } from "../../../../types";


export interface IDatosCobro {
  tipoPago: "Efectivo" | "Tarjeta de Crédito" | "QR Directo";
  facturaInput: IFacturaInput;
  observaciones?: string;
}

interface FacturaProps {
  isOpen: boolean;
  total: number;
  isLoading?: boolean;

  datosFacturacionPrevios?: DatosFacturacionClienteType[];
  onClose: () => void;
  onConfirm: (datos: IDatosCobro) => void;
}


const TIPOS_FACTURA = ["Electrónica Digital", "Manual", "Factura Exenta"];

export default function Factura({
  isOpen,
  total,
  isLoading = false,
  datosFacturacionPrevios = [],
  onClose,
  onConfirm,
}: FacturaProps) {
  // ── Estado local del formulario de cobro ──────────────────────────────
  const [tipoPago, setTipoPago] = useState<IDatosCobro["tipoPago"]>("Efectivo");
  const [nitCliente, setNitCliente] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [tipoFactura, setTipoFactura] = useState(TIPOS_FACTURA[0]);
  const [observaciones, setObservaciones] = useState("");

  
  useEffect(() => {
    if (isOpen && datosFacturacionPrevios.length > 0) {
      setNitCliente(datosFacturacionPrevios[0].nitCliente ?? "");
      setRazonSocial(datosFacturacionPrevios[0].razonSocial ?? "");
    }
  }, [isOpen, datosFacturacionPrevios]);

  // Modal controlado: si el padre dice que no está abierto, no renderizamos nada.
  // Así NewVenta.tsx decide cuándo aparece, y este componente no necesita
  // saber nada del carrito ni de la lógica de venta.
  if (!isOpen) return null;

  function handleConfirmar() {
    // Empaquetamos exactamente lo que el padre necesita para llamar
    // AddVentaApi / ChangeEstadoVentaApi / EmitirFacturaApi. La factura
    // siempre se envía (ya no depende de un checkbox).
    onConfirm({
      tipoPago,
      facturaInput: {
        tipoFactura,
        nitCliente: nitCliente.trim() || undefined,
        razonSocial: razonSocial.trim() || undefined,
      },
      observaciones: observaciones.trim() || undefined,
    });
  }

  function handleClose() {
    // Reseteamos el formulario para que la próxima venta no arrastre datos
    // de la anterior (NIT, razón social, observaciones, etc).
    setTipoPago("Efectivo");
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

          {/* ── Atributos de factura: siempre visibles, se registra siempre ── */}
          <div className="space-y-3 rounded-xl border border-violet-100 p-3">
            <p className="text-xs font-bold text-gray-500">
              ATRIBUTOS DE FACTURA RELACIONADA
            </p>

            {/* Chips con las combinaciones de NIT/razón social que este
                cliente ya usó antes. Si hay más de una, el cajero elige;
                "+ Nuevo" limpia los campos para cargar una combinación
                distinta a mano. */}
            {datosFacturacionPrevios.length > 0 && (
              <div>
                <p className="mb-1 text-[11px] text-gray-400">
                  Datos usados antes por este cliente
                </p>
                <div className="flex flex-wrap gap-2">
                  {datosFacturacionPrevios.map((d, i) => {
                    const activo =
                      nitCliente === (d.nitCliente ?? "") &&
                      razonSocial === (d.razonSocial ?? "");
                    return (
                      <button
                        key={`${d.nitCliente ?? "sn"}-${d.razonSocial ?? "sr"}-${i}`}
                        type="button"
                        onClick={() => {
                          setNitCliente(d.nitCliente ?? "");
                          setRazonSocial(d.razonSocial ?? "");
                        }}
                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                          activo
                            ? "border-violet-600 bg-violet-600 text-white"
                            : "border-violet-200 text-gray-500 hover:bg-violet-50"
                        }`}
                      >
                        {d.razonSocial || d.nitCliente || "Sin datos"}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setNitCliente("");
                      setRazonSocial("");
                    }}
                    className="rounded-full border border-dashed border-violet-300 px-3 py-1 text-xs text-violet-500 hover:bg-violet-50"
                  >
                    + Nuevo
                  </button>
                </div>
              </div>
            )}

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