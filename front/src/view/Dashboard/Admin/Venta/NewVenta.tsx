import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  ChevronDown,
  Info,
  Minus,
  Pill,
  Plus,
  Search,
  ShieldAlert,
  ShoppingCart,
  Trash2,
  UserPlus,
} from "lucide-react";
import { z } from "zod";

import { GetProductoApi } from "../../../../Api/ProductoApi";
import {
  AddVentaApi,
  ChangeEstadoVentaApi,
  EmitirReciboApi,
  GetAlertaFEFOApi,
  GetLotesDisponiblesApi,
} from "../../../../Api/VentaApi";
// TODO: estos dos archivos API no venían en lo que compartiste. Los asumo
// con la misma forma que ProductoApi/VentaApi (axios + safeParse con Zod).
// Si aún no existen, créalos siguiendo ese mismo patrón.
import { GetClienteApi } from "../../../../Api/ClienteApi";
import { GetSucursalApi } from "../../../../Api/SucursalApi";
// TODO: ajusta la ruta/forma de tu hook de autenticación real. Aquí solo
// necesito idUsuario, idSucursal, nombre y nameRol del usuario logueado.
import { useAuth } from "../../../../Hook/UseAuth";
// import { soloLetras, soloDigitos, tecladoSoloLetras, tecladoSoloDigitos, tecladoTelefono } from "../../../../lib/validators";

import {
  ClienteArray,
  ProductoArray,
  sucursalArray,
  type AlertaFEFOType,
  type CreateVentaType,
  type LoteDisponibleType,
} from "../../../../types";
import Recibo, { type IDatosCobro } from "./Factura";

// ── Tipos derivados de los schemas de Zod que ya tienes en types/index.ts ──
// ProductoArray, ClienteArray y sucursalArray SÍ están exportados como
// schemas, así que podemos inferir su tipo aquí sin tocar tu index.ts.
type ProductoType = z.infer<typeof ProductoArray>;
type ClienteType = z.infer<typeof ClienteArray>;
type SucursalType = z.infer<typeof sucursalArray>;

// ── Un producto "en el carrito" trae consigo copia de sus datos de venta
//    (precio, si requiere receta, etc.) y su propia lista de lotes, para
//    poder mostrar el <select> de lote sin volver a buscar en `productos`.
interface ICarritoItem {
  idProducto: number;
  nombreGenerico: string;
  nombreComercial: string | null;
  concentracion: string | null;
  viaAdministracion: string | null;
  requiereReceta: number; // 0 | 1, tal cual viene del backend
  precioUnitario: number;
  cantidad: number;
  descuento: number; // monto en $, no porcentaje
  idLote: number;
  lotesDisponibles: LoteDisponibleType[];
}

const COLORS = {
  gradiente: "bg-gradient-to-r from-violet-600 to-fuchsia-500",
  primario: "bg-violet-600 hover:bg-violet-700",
  textoPrimario: "text-violet-700",
};

const IVA = 0.13; // 13% — ajusta si tu régimen tributario usa otra tasa

// TODO: reemplaza esto por el idCliente real de tu registro "Público
// General" en la tabla `cliente`. Lo dejo como 1 porque normalmente es el
// primer registro que se siembra en este tipo de sistemas.
const ID_CLIENTE_PUBLICO_GENERAL = 1;

export default function NewVenta() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // ── Estado de la pantalla ──────────────────────────────────────────────
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState<ICarritoItem[]>([]);
  const [idClienteSeleccionado, setIdClienteSeleccionado] = useState<number>(
    ID_CLIENTE_PUBLICO_GENERAL
  );
  const [idSucursalSeleccionada, setIdSucursalSeleccionada] = useState<number | null>(null);
  const [modalReciboAbierto, setModalReciboAbierto] = useState(false);
  const [alertaFEFO, setAlertaFEFO] = useState<AlertaFEFOType | null>(null);
  const [motivoDesvio, setMotivoDesvio] = useState("");
  const [modalDesvioAbierto, setModalDesvioAbierto] = useState(false);
  const datosCobroRef = useRef<IDatosCobro | null>(null);
  const [desvioFEFO, setDesvioFEFO] = useState<{ permitir: boolean; motivo: string } | null>(null);

  // ── Buscador de cliente (reemplaza el <select> por un autocompletado) ──
  // Texto que el cajero está escribiendo mientras busca un cliente.
  const [busquedaCliente, setBusquedaCliente] = useState("");
  // Controla si el dropdown de sugerencias está visible.
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  // Referencia al contenedor del buscador, para cerrar el dropdown al hacer clic afuera.
  const clienteInputRef = useRef<HTMLDivElement>(null);

  // En cuanto sepamos qué usuario está logueado, preseleccionamos SU
  // sucursal como punto de venta por defecto (el cajero puede cambiarla
  // manualmente si atiende otra sucursal ese día).
  useEffect(() => {
    if (user?.idSucursal && idSucursalSeleccionada === null) {
      setIdSucursalSeleccionada(user.idSucursal);
    }
  }, [user, idSucursalSeleccionada]);

  // Cierra el dropdown de sugerencias de cliente cuando el usuario hace clic
  // en cualquier parte fuera del buscador. Usamos "mousedown" (no "click")
  // para que este cierre no le gane la carrera al onClick de una sugerencia.
  useEffect(() => {
    function handleClickFuera(e: MouseEvent) {
      if (clienteInputRef.current && !clienteInputRef.current.contains(e.target as Node)) {
        setMostrarSugerencias(false);
      }
    }
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  // ── Data fetching 
  const { data: productos = [], isLoading: cargandoProductos } = useQuery({
    queryKey: ["ProductoAll"],
    queryFn: GetProductoApi,
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ["ClienteAll"],
    queryFn: GetClienteApi,
  });

  const { data: sucursales = [] } = useQuery({
    queryKey: ["sucursales"],
    queryFn: GetSucursalApi,
  });

  // Pedimos, EN PARALELO, los lotes disponibles de cada producto. useQueries
  // nos deja disparar N queries dinámicas (una por producto) sin violar las
  // reglas de hooks, porque el array se arma antes de llamar al hook.
  const lotesQueries = useQueries({
    queries: (productos as ProductoType[]).map((p) => ({
      queryKey: ["lotesDisponibles", p.idProducto],
      queryFn: () => GetLotesDisponiblesApi(p.idProducto),
      staleTime: 1000 * 30, // 30s: el stock cambia seguido en un POS
    })),
  });

  // Convertimos el array de resultados de useQueries en un mapa
  // { idProducto: lotes[] } para poder buscarlo por id en O(1) al renderizar.
  const lotesPorProducto = useMemo(() => {
    const mapa: Record<number, LoteDisponibleType[]> = {};
    (productos as ProductoType[]).forEach((p, i) => {
      mapa[p.idProducto] = lotesQueries[i]?.data ?? [];
    });
    return mapa;
  }, [productos, lotesQueries]);

  // ── Cliente actualmente seleccionado (para mostrar su nombre en el input) ──
  const clienteSeleccionado = useMemo(
    () =>
      idClienteSeleccionado === ID_CLIENTE_PUBLICO_GENERAL
        ? null
        : (clientes as ClienteType[]).find((c) => c.idCliente === idClienteSeleccionado) ?? null,
    [clientes, idClienteSeleccionado]
  );

  // ── Filtro de clientes por nombre, apellido o CI ────────────────────────
  // Sin texto: muestra los primeros 8 como sugerencia inicial (evita listas
  // interminables). Con texto: filtra por coincidencia.
  const clientesFiltrados = useMemo(() => {
    const termino = busquedaCliente.trim().toLowerCase();
    const lista = clientes as ClienteType[];
    if (!termino) return lista.slice(0, 8);
    return lista
      .filter(
        (c) =>
          `${c.nombre} ${c.apellido ?? ""}`.toLowerCase().includes(termino) ||
          c.ci?.toLowerCase().includes(termino)
      )
      .slice(0, 8);
  }, [clientes, busquedaCliente]);

  // ── Filtro de búsqueda (nombre genérico, comercial o código de barras) ──
  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    const lista = productos as ProductoType[];
    if (!termino) return lista;
    return lista.filter(
      (p) =>
        p.nombreGenerico.toLowerCase().includes(termino) ||
        p.nombreComercial?.toLowerCase().includes(termino) ||
        p.codigoBarra.includes(termino)
    );
  }, [productos, busqueda]);

  // ── Totales de la venta (reproduce la lógica que se ve en tu captura) ──
  // Subtotal Bruto = suma de (cantidad * precioUnitario) SIN descuentos.
  const subtotalBruto = useMemo(
    () => carrito.reduce((acc, item) => acc + item.cantidad * item.precioUnitario, 0),
    [carrito]
  );
  // Descuentos Aplicados = suma de los descuentos ($) de cada línea.
  const descuentosAplicados = useMemo(
    () => carrito.reduce((acc, item) => acc + item.descuento, 0),
    [carrito]
  );
  // Base imponible = lo que realmente se le cobra al cliente antes de IVA.
  const baseImponible = subtotalBruto - descuentosAplicados;
  const impuestos = useMemo(
    () => Number((baseImponible * IVA).toFixed(2)),
    [baseImponible]
  );
  const total = Number((baseImponible + impuestos).toFixed(2));

  // Si CUALQUIER producto del carrito requiere receta, mostramos el aviso.
  const requiereReceta = useMemo(
    () => carrito.some((item) => item.requiereReceta === 1),
    [carrito]
  );

  // ── Acciones sobre el carrito ───────────────────────────────────────────

  // "Despachar": agrega el producto usando el lote FEFO (First-Expired,
  // First-Out). El backend YA nos devuelve LotesDisponiblesPorProducto
  // ordenado por fechaVencimiento ASC, así que lotes[0] siempre es el
  // lote que vence primero — no necesitamos ordenar de nuevo aquí.
  function despacharProducto(producto: ProductoType) {
    const lotes = lotesPorProducto[producto.idProducto] ?? [];
    if (lotes.length === 0) {
      toast.error(`No hay stock disponible de ${producto.nombreGenerico}`);
      return;
    }

    setCarrito((prev) => {
      const loteFEFO = lotes[0];
      const existente = prev.find(
        (item) => item.idProducto === producto.idProducto && item.idLote === loteFEFO.idLote
      );

      // Si ya hay una línea con ese mismo producto+lote, solo sumamos 1
      // unidad (respetando el stock del lote) en vez de duplicar la línea.
      if (existente) {
        if (existente.cantidad >= loteFEFO.stock) {
          toast.warning("No hay más stock disponible en ese lote");
          return prev;
        }
        return prev.map((item) =>
          item === existente ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }

      const nuevoItem: ICarritoItem = {
        idProducto: producto.idProducto,
        nombreGenerico: producto.nombreGenerico,
        nombreComercial: producto.nombreComercial,
        concentracion: producto.concentracion,
        viaAdministracion: producto.viaAdministracion,
        requiereReceta: producto.requiereReceta,
        precioUnitario: producto.precio,
        cantidad: 1,
        descuento: 0,
        idLote: loteFEFO.idLote,
        lotesDisponibles: lotes,
      };
      return [...prev, nuevoItem];
    });
  }

  // +/- de unidades: nunca deja bajar de 1 ni subir del stock del lote
  // actualmente asignado a esa línea.
  function cambiarCantidad(idProducto: number, idLote: number, delta: number) {
    setCarrito((prev) =>
      prev.map((item) => {
        if (item.idProducto !== idProducto || item.idLote !== idLote) return item;
        const lote = item.lotesDisponibles.find((l) => l.idLote === idLote);
        const stockMax = lote?.stock ?? item.cantidad;
        const nuevaCantidad = Math.min(Math.max(item.cantidad + delta, 1), stockMax);
        return { ...item, cantidad: nuevaCantidad };
      })
    );
  }

  // Cambiar el lote asignado a una línea (el <select> "Lote asignado" del
  // carrito). Si el nuevo lote tiene menos stock que la cantidad actual,
  // la recortamos para no vender más de lo disponible.
  function cambiarLote(idProducto: number, idLoteAnterior: number, idLoteNuevo: number) {
    const itemActual = carrito.find((i) => i.idProducto === idProducto && i.idLote === idLoteAnterior);
    const loteNuevo = itemActual?.lotesDisponibles.find((l) => l.idLote === idLoteNuevo);

    setCarrito((prev) =>
      prev.map((item) => {
        if (item.idProducto !== idProducto || item.idLote !== idLoteAnterior) return item;
        const lote = item.lotesDisponibles.find((l) => l.idLote === idLoteNuevo);
        if (!lote) return item;
        return {
          ...item,
          idLote: lote.idLote,
          cantidad: Math.min(item.cantidad, lote.stock),
        };
      })
    );

    // Al cambiar de lote consultamos la alerta FEFO contra el backend para
    // avisar en pantalla si se esta desviando la regla First-Expired First-Out.
    if (loteNuevo) {
      GetAlertaFEFOApi(idProducto, loteNuevo.idLote)
        .then((data) => {
          if (!data.cumpleFEFO) {
            setAlertaFEFO(data);
            setModalDesvioAbierto(true);
          }
        })
        .catch(() => {
          // Si falla la consulta no bloquear el despacho; el backend valida al registrar.
        });
    }
  }

  // El descuento nunca puede ser negativo ni superar el total bruto de esa
  // línea (cantidad * precioUnitario), para que el subtotal no quede negativo.
  function cambiarDescuento(idProducto: number, idLote: number, valor: number) {
    setCarrito((prev) =>
      prev.map((item) => {
        if (item.idProducto !== idProducto || item.idLote !== idLote) return item;
        const maximoDescuento = item.cantidad * item.precioUnitario;
        const descuento = Math.min(Math.max(valor, 0), maximoDescuento);
        return { ...item, descuento };
      })
    );
  }

  // Selecciona un cliente desde el dropdown (o null = "Público General"),
  // y cierra + limpia el buscador.
  function seleccionarCliente(cliente: ClienteType | null) {
    if (cliente === null) {
      setIdClienteSeleccionado(ID_CLIENTE_PUBLICO_GENERAL);
    } else {
      setIdClienteSeleccionado(cliente.idCliente);
    }
    setBusquedaCliente("");
    setMostrarSugerencias(false);
  }

  function quitarDelCarrito(idProducto: number, idLote: number) {
    setCarrito((prev) =>
      prev.filter((item) => !(item.idProducto === idProducto && item.idLote === idLote))
    );
  }

  function limpiarVenta() {
    setCarrito([]);
  }

  // ── Mutación: registra la venta completa ────────────────────────────────
  // Tu backend separa esto en 3 endpoints (AddVenta crea en 'pendiente',
  // ChangeEstadoVenta la pasa a 'completado', EmitirRecibo es opcional),
  // así que aquí encadenamos las 3 llamadas como una sola operación desde
  // la perspectiva del usuario: "Confirmar Transacción" = pagar y cerrar.
  const registrarVentaMutation = useMutation({
    mutationFn: async (datosCobro: IDatosCobro) => {
      if (!idSucursalSeleccionada) {
        throw new Error("Selecciona un punto de venta antes de continuar");
      }

      const payload: CreateVentaType = {
        idCliente: idClienteSeleccionado,
        idSucursal: idSucursalSeleccionada,
        tipoPago: datosCobro.tipoPago,
        subtotal: subtotalBruto,
        descuentoTotal: descuentosAplicados,
        total,
        observaciones: datosCobro.observaciones,
        permitirDesvioFEFO: desvioFEFO?.permitir === true ? true : undefined,
        motivoDesvioFEFO: desvioFEFO?.motivo,
        detalles: carrito.map((item) => ({
          idProducto: item.idProducto,
          idLote: item.idLote,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          descuento: item.descuento,
        })),
      };

      // 1) Crear la venta (queda en estado 'pendiente' + descuenta stock)
      const { idVenta } = await AddVentaApi(payload);

      // 2) Como ya se cobró en el modal, la pasamos a 'completado'
      await ChangeEstadoVentaApi(idVenta, "completado");

      // 3) Emitir el recibo solo si el usuario eligió "Con Recibo"
      if (datosCobro.emitirRecibo) {
        await EmitirReciboApi(idVenta);
      }

      return idVenta;
    },
    onSuccess: () => {
      toast.success("Venta registrada exitosamente");
      // Invalidamos lo que quedó desactualizado: el listado de ventas, el
      // dashboard, y el stock de lotes (bajó por cada producto vendido).
      queryClient.invalidateQueries({ queryKey: ["ventas"] });
      queryClient.invalidateQueries({ queryKey: ["ventasEstadisticas"] });
      queryClient.invalidateQueries({ queryKey: ["lotesDisponibles"] });
      limpiarVenta();
      setDesvioFEFO(null);
      setModalReciboAbierto(false);
      setModalDesvioAbierto(false);
    },
    onError: (error: any) => {
      // El backend responde con `alertaFEFO` cuando la regla FEFO se incumple.
      // Abrimos el modal de desvio con el detalle para que el cajero autorice
      // o cancele el despacho del lote seleccionado.
      if (error?.alertaFEFO) {
        setAlertaFEFO(error.alertaFEFO);
        setMotivoDesvio("");
        setModalDesvioAbierto(true);
        return;
      }
      toast.error(error?.message || "Error al registrar la venta");
    },
  });

  // Confirma el desvio de FEFO con la justificacion registrada por el cajero.
  // Reintenta la misma operacion de cobro enviando `permitirDesvioFEFO = true`.
  function confirmarDesvioFEFO() {
    const dato = datosCobroRef.current;
    if (!dato) return;
    setDesvioFEFO({
      permitir: true,
      motivo: motivoDesvio.trim() || "Desvio autorizado por el cajero",
    });
    setAlertaFEFO(null);
    setModalDesvioAbierto(false);
    registrarVentaMutation.mutate(dato);
  }

  return (
    <div className="min-h-screen bg-violet-50/40 p-4 lg:p-6">
      {/* ═══════════════════ ENCABEZADO ═══════════════════ */}
      <header
        className={`${COLORS.gradiente} mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4 text-white shadow-md`}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/20 p-2">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold leading-none">FarmaLila</h1>
              <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-semibold">
                POS v2.5
              </span>
            </div>
            <p className="mt-1 text-xs text-white/80">
              Panel Integral para Gestión de Medicamentos y Ventas
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="rounded-xl bg-white/15 px-3 py-2 text-xs">
            <span className="block text-[10px] uppercase tracking-wide text-white/70">
              Punto de venta
            </span>
            <div className="flex items-center gap-1">
              <select
                value={idSucursalSeleccionada ?? ""}
                onChange={(e) => setIdSucursalSeleccionada(Number(e.target.value))}
                className="bg-transparent font-semibold text-white outline-none"
              >
                {(sucursales as SucursalType[]).map((s) => (
                  <option key={s.idSucursal} value={s.idSucursal} className="text-gray-800">
                    {s.nombre}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-3 w-3" />
            </div>
          </div>

          <div className="rounded-xl bg-white/15 px-3 py-2 text-xs">
            <span className="block text-[10px] uppercase tracking-wide text-white/70">
              Atendido por
            </span>
            <span className="font-semibold">
              {user ? `${user.nombre}${user.nameRol ? ` (${user.nameRol})` : ""}` : "Cargando..."}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* ═══════════════ COLUMNA IZQUIERDA: BÚSQUEDA ═══════════════ */}
        <section className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className={`flex items-center gap-2 font-bold ${COLORS.textoPrimario}`}>
              <Search className="h-4 w-4" /> BÚSQUEDA DE FÁRMACOS
            </h2>
            <span className="text-xs text-gray-400">
              Total: {productosFiltrados.length} productos
            </span>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-300" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Escribe el nombre del fármaco, componente genérico o escanea código de barras..."
              className="w-full rounded-xl border border-violet-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          {cargandoProductos ? (
            <p className="text-sm text-gray-400">Cargando productos...</p>
          ) : productosFiltrados.length === 0 ? (
            <p className="text-sm text-gray-400">No se encontraron fármacos para tu búsqueda.</p>
          ) : (
            <div className="grid max-h-[65vh] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
              {productosFiltrados.map((producto) => {
                const lotes = lotesPorProducto[producto.idProducto] ?? [];
                const sinReceta = producto.requiereReceta === 0;

                return (
                  <div
                    key={producto.idProducto}
                    className="rounded-xl border border-violet-100 p-3 transition-shadow hover:shadow-md"
                  >
                    <div className="mb-1 flex items-start justify-between">
                      <Pill className="h-4 w-4 text-violet-400" />
                      <span
                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          sinReceta ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {!sinReceta && <ShieldAlert className="h-3 w-3" />}
                        {sinReceta ? "VENTA LIBRE" : "RECETA RETENIDA"}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-gray-800">
                      {producto.nombreComercial || producto.nombreGenerico}
                    </h3>
                    <p className="mb-1 text-xs text-gray-500">
                      {producto.nombreGenerico}
                      {producto.concentracion ? ` - ${producto.concentracion}` : ""}
                    </p>
                    {producto.viaAdministracion && (
                      <p className="mb-2 text-[11px] text-gray-400">
                        Vía: {producto.viaAdministracion}
                      </p>
                    )}

                    <div className="mb-2 rounded-lg bg-violet-50 p-2">
                      <span className="text-[10px] font-semibold text-violet-500">
                        LOTES DISPONIBLES
                      </span>
                      {lotes.length === 0 ? (
                        <p className="mt-1 text-[11px] text-rose-500">Sin stock</p>
                      ) : (
                        <ul className="mt-1 space-y-0.5">
                          {lotes.map((l) => (
                            <li
                              key={l.idLote}
                              className="flex justify-between text-[11px] text-gray-600"
                            >
                              <span>Lote: {l.numeroLote}</span>
                              <span className="font-semibold">{l.stock} u.</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className={`font-bold ${COLORS.textoPrimario}`}>
                          Bs {producto.precio.toFixed(2)}
                        </span>
                        <Info className="h-3 w-3 text-gray-300" />
                      </div>
                      <button
                        type="button"
                        onClick={() => despacharProducto(producto)}
                        disabled={lotes.length === 0}
                        className="flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:bg-gray-300"
                      >
                        <Plus className="h-3 w-3" /> Despachar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ═══════════════ COLUMNA DERECHA: CLIENTE + CARRITO ═══════════════ */}
        <section className="flex flex-col rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
          {/* ── Cliente asociado (buscador con sugerencias) ── */}
          <div className="mb-4" ref={clienteInputRef}>
            <label className="mb-1 block text-xs font-bold text-violet-500">
              CLIENTE ASOCIADO 
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-300" />
                <input
                  type="text"
                  value={
                    mostrarSugerencias
                      ? busquedaCliente
                      : clienteSeleccionado
                      ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido ?? ""}`.trim()
                      : "Sin Nombre / Público General"
                  }
                  onFocus={() => {
                    setMostrarSugerencias(true);
                    setBusquedaCliente("");
                  }}
                  onChange={(e) => setBusquedaCliente(e.target.value)}
                  placeholder="Buscar cliente por nombre o CI..."
                  className="w-full rounded-xl border border-violet-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                />

                {mostrarSugerencias && (
                  <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-violet-200 bg-white shadow-lg">
                    <button
                      type="button"
                      onClick={() => seleccionarCliente(null)}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-violet-50"
                    >
                      Sin Nombre / Público General
                    </button>
                    {clientesFiltrados.length === 0 ? (
                      <p className="px-3 py-2 text-xs text-gray-400">Sin resultados</p>
                    ) : (
                      clientesFiltrados.map((c) => (
                        <button
                          key={c.idCliente}
                          type="button"
                          onClick={() => seleccionarCliente(c)}
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-violet-50"
                        >
                          {c.nombre} {c.apellido ?? ""}
                          {c.ci ? <span className="ml-2 text-xs text-gray-400">CI: {c.ci}</span> : null}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                // TODO: conecta esto a tu futuro modal de registro de
                // cliente. Por ahora solo avisa que la función no existe aún.
                onClick={() => toast.info("Función de registrar cliente próximamente")}
                title="Registrar Cliente"
                className="flex items-center gap-1 rounded-xl border border-violet-200 px-2 text-xs font-semibold text-violet-600 hover:bg-violet-50"
              >
                <UserPlus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col">
            <div className="mb-2 flex items-center justify-between">
              <h2 className={`font-bold ${COLORS.textoPrimario}`}>DETALLE DE VENTA</h2>
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-600">
                {carrito.length} {carrito.length === 1 ? "item" : "items"}
              </span>
            </div>

            {/* ── Aviso de receta retenida (aparece si algún ítem la requiere) ── */}
            {requiereReceta && (
              <div className="mb-3 flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <div>
                  <p className="font-semibold">REQUIERE RECETA FARMACOLÓGICA</p>
                  <p>
                    La venta incluye medicamentos bajo control gubernamental. Asegúrate de
                    sellar y firmar la receta médica física.
                  </p>
                </div>
              </div>
            )}

            {/* ── Líneas del carrito ── */}
            <div className="max-h-[38vh] flex-1 space-y-3 overflow-y-auto pr-1">
              {carrito.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">
                  Aún no agregaste productos a la venta
                </p>
              ) : (
                carrito.map((item) => (
                  <div
                    key={`${item.idProducto}-${item.idLote}`}
                    className="rounded-xl border border-violet-100 p-3"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {item.nombreComercial || item.nombreGenerico}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {item.nombreGenerico}
                          {item.concentracion ? ` - ${item.concentracion}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => quitarDelCarrito(item.idProducto, item.idLote)}
                        className="text-gray-300 hover:text-rose-500"
                        title="Quitar de la venta"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mb-2 grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-gray-400">Lote asignado</span>
                        <select
                          value={item.idLote}
                          onChange={(e) =>
                            cambiarLote(item.idProducto, item.idLote, Number(e.target.value))
                          }
                          className="w-full rounded-lg border border-violet-200 px-2 py-1 text-xs"
                        >
                          {item.lotesDisponibles.map((l) => (
                            <option key={l.idLote} value={l.idLote}>
                              {l.numeroLote} ({l.stock} u.)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400">Unidades</span>
                        <div className="flex items-center rounded-lg border border-violet-200">
                          <button
                            type="button"
                            onClick={() => cambiarCantidad(item.idProducto, item.idLote, -1)}
                            className="px-2 py-1 text-violet-500"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="flex-1 text-center text-xs font-semibold">
                            {item.cantidad}
                          </span>
                          <button
                            type="button"
                            onClick={() => cambiarCantidad(item.idProducto, item.idLote, 1)}
                            className="px-2 py-1 text-violet-500"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">Descuento (Bs)</span>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.descuento}
                          onChange={(e) =>
                            cambiarDescuento(item.idProducto, item.idLote, Number(e.target.value))
                          }
                          className="w-16 rounded-lg border border-violet-200 px-1 py-0.5"
                        />
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400">
                          Unitario: Bs {item.precioUnitario.toFixed(2)}
                        </p>
                        <p className={`font-bold ${COLORS.textoPrimario}`}>
                          Subtotal: Bs
                          {(item.cantidad * item.precioUnitario - item.descuento).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ── Totales ── */}
            <div className="mt-3 space-y-1 border-t border-violet-100 pt-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal Bruto:</span>
                <span>Bs {subtotalBruto.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Descuentos Aplicados:</span>
                <span>-Bs {descuentosAplicados.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Impuestos Declarados (IVA 13%):</span>
                <span>Bs {impuestos.toFixed(2)}</span>
              </div>
              <div className={`flex justify-between pt-1 text-lg font-bold ${COLORS.textoPrimario}`}>
                <span>TOTAL A PAGAR:</span>
                <span>Bs {total.toFixed(2)}</span>
              </div>
            </div>

            {/* ── Acciones finales ── */}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={limpiarVenta}
                disabled={carrito.length === 0}
                className="flex-1 rounded-xl border border-violet-200 py-2 text-sm font-semibold text-violet-600 hover:bg-violet-50 disabled:opacity-40"
              >
                Limpiar Venta
              </button>
              <button
                type="button"
                onClick={() => setModalReciboAbierto(true)}
                disabled={carrito.length === 0}
                className={`flex-1 rounded-xl py-2 text-sm font-semibold text-white ${COLORS.primario} disabled:bg-gray-300`}
              >
                Registrar Venta (Bs{total.toFixed(2)})
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ═══════════════ MODAL DE COBRO Y RECIBO ═══════════════ */}
      <Recibo
        isOpen={modalReciboAbierto}
        total={total}
        isLoading={registrarVentaMutation.isPending}
        onClose={() => setModalReciboAbierto(false)}
        onConfirm={(datos) => registrarVentaMutation.mutate(datos)}
      />

      {/* Modal de autorizacion de desvio FEFO */}
      {modalDesvioAbierto && alertaFEFO && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-start gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-gray-800">ALERTA FEFO</h3>
                <p className="mt-1 text-xs text-gray-600">{alertaFEFO.mensaje}</p>
              </div>
            </div>

            {alertaFEFO.idLoteFEFO !== null && alertaFEFO.idLoteFEFO !== undefined ? (
              <div className="mb-3 rounded-xl bg-violet-50 p-3 text-xs text-violet-800">
                <p>
                  Lote actual:{" "}
                  <span className="font-bold">{alertaFEFO.numeroLote}</span> (vence en {alertaFEFO.diasRestantes} días)
                </p>
                <p>
                  Debería despacharse primero:{" "}
                  <span className="font-bold">{alertaFEFO.numeroLoteFEFO}</span> (vence en {alertaFEFO.diasRestantesFEFO} días)
                </p>
              </div>
            ) : (
              <div className="mb-3 rounded-xl bg-violet-50 p-3 text-xs text-violet-800">
                <p>
                  Lote actual: <span className="font-bold">{alertaFEFO.numeroLote}</span> (vence en {alertaFEFO.diasRestantes} días)
                </p>
              </div>
            )}

            <label className="mb-1 block text-xs font-semibold text-gray-600">Motivo del desvio</label>
            <textarea
              value={motivoDesvio}
              onChange={(e) => setMotivoDesvio(e.target.value)}
              rows={3}
              placeholder="Ej: se despacha del lote alternativo por disponibilidad..."
              className="mb-4 w-full rounded-xl border border-violet-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={confirmarDesvioFEFO}
                disabled={registrarVentaMutation.isPending}
                className="flex-1 rounded-xl bg-amber-500 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
              >
                Confirmar desvio y cobrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setAlertaFEFO(null);
                  setModalDesvioAbierto(false);
                }}
                className="flex-1 rounded-xl border border-violet-200 py-2 text-sm font-semibold text-violet-600 hover:bg-violet-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}