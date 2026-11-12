import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  ChevronDown,
  Minus,
  Package,
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

// ─── Paleta (la misma del formulario de producto) ────────────────────────────
const C = {
  dark: "#4A1A6E",
  medium: "#7B3FA0",
  light: "#F3EBF9",
  border: "#D8B4F0",
  text: "#2D0A47",
};
const ERROR_COLOR = "#EF4444";
const SURFACE = "#FBF8FE";

// Degradado de marca reutilizado en el header y en los botones principales.
const GRADIENT = `linear-gradient(135deg, ${C.dark}, ${C.medium})`;

// Clase común de inputs / selects: el color del borde va aparte, en style.
const inputBase =
  "w-full rounded-xl border-2 bg-white text-sm font-medium outline-none transition-all " +
  "placeholder:text-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100";

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
    <div className="min-h-screen p-4 lg:p-6">
      {/* ═══════════════════ ENCABEZADO ═══════════════════ */}
      <header
        className="relative mb-5 flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-2xl px-5 py-4 text-white shadow-md"
        style={{ background: GRADIENT }}
      >
        {/* Círculos decorativos (solo estética) */}
        <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute right-40 -bottom-14 h-28 w-28 rounded-full bg-white/5" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 shadow-inner">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">Farmacia Dr. Osvaldo</h1>
            <p className="mt-1 text-xs text-purple-200">
              Panel integral para gestión de medicamentos y ventas
            </p>
          </div>
        </div>

        <div className="relative flex flex-wrap gap-2">
          <div className="rounded-xl bg-white/15 px-3.5 py-2 text-xs">
            <span className="block text-[11px] text-purple-200">Punto de venta</span>
            <div className="flex items-center gap-1">
              <select
                value={idSucursalSeleccionada ?? ""}
                onChange={(e) => setIdSucursalSeleccionada(Number(e.target.value))}
                className="cursor-pointer appearance-none bg-transparent pr-1 text-sm font-semibold text-white outline-none"
              >
                {(sucursales as SucursalType[]).map((s) => (
                  <option key={s.idSucursal} value={s.idSucursal} style={{ color: C.text }}>
                    {s.nombre}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="rounded-xl bg-white/15 px-3.5 py-2 text-xs">
            <span className="block text-[11px] text-purple-200">Atendido por</span>
            <span className="text-sm font-semibold">
              {user ? `${user.nombre}${user.nameRol ? ` (${user.nameRol})` : ""}` : "Cargando..."}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* ═══════════════ COLUMNA IZQUIERDA: BÚSQUEDA ═══════════════ */}
        <section
          className="rounded-2xl border bg-white p-5 shadow-sm lg:col-span-2"
          style={{ borderColor: C.border }}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ background: C.light, color: C.medium }}
              >
                <Search className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold leading-tight" style={{ color: C.dark }}>
                  Búsqueda de fármacos
                </h2>
                <p className="text-xs text-gray-500">Por nombre, componente genérico o código de barras</p>
              </div>
            </div>
            <span
              className="whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ background: C.light, color: C.dark }}
            >
              {productosFiltrados.length} {productosFiltrados.length === 1 ? "producto" : "productos"}
            </span>
          </div>

          <div className="relative mb-4">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: C.border }}
            />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Escribe el nombre del fármaco, componente genérico o escanea código de barras..."
              className={`${inputBase} py-3 pl-10 pr-4`}
              style={{ borderColor: C.border, color: C.text }}
            />
          </div>

          {cargandoProductos ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-400">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Cargando productos...
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div
              className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-12 text-center"
              style={{ borderColor: C.border }}
            >
              <Package className="h-8 w-8" style={{ color: C.border }} />
              <p className="text-sm text-gray-400">No se encontraron fármacos para tu búsqueda.</p>
            </div>
          ) : (
            <div className="grid max-h-[65vh] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
              {productosFiltrados.map((producto) => {
                const lotes = lotesPorProducto[producto.idProducto] ?? [];
                const sinReceta = producto.requiereReceta === 0;
                const sinStock = lotes.length === 0;
                const stockTotal = lotes.reduce((acc, l) => acc + l.stock, 0);

                return (
                  <article
                    key={producto.idProducto}
                    className={`flex flex-col rounded-xl border bg-white p-3.5 transition-shadow hover:shadow-md ${
                      sinStock ? "opacity-60" : ""
                    }`}
                    style={{ borderColor: C.border }}
                  >
                    {/* Ícono + etiqueta de receta */}
                    <div className="mb-2 flex items-start justify-between">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{ background: C.light, color: C.medium }}
                      >
                        <Pill className="h-4 w-4" />
                      </div>
                      <span
                        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        style={
                          sinReceta
                            ? { background: C.light, color: C.dark }
                            : { background: `${ERROR_COLOR}1A`, color: ERROR_COLOR }
                        }
                      >
                        {!sinReceta && <ShieldAlert className="h-3 w-3" />}
                        {sinReceta ? "Venta libre" : "Receta retenida"}
                      </span>
                    </div>

                    {/* Nombres */}
                    <h3 className="text-sm font-bold" style={{ color: C.text }}>
                      {producto.nombreComercial || producto.nombreGenerico}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {producto.nombreGenerico}
                      {producto.concentracion ? ` - ${producto.concentracion}` : ""}
                    </p>
                    {producto.viaAdministracion && (
                      <p className="mt-1 text-[11px] text-gray-400">Vía: {producto.viaAdministracion}</p>
                    )}

                    {/* Lotes */}
                    <div
                      className="my-3 rounded-lg border p-2.5"
                      style={{ background: SURFACE, borderColor: C.light }}
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-xs font-semibold" style={{ color: C.medium }}>
                          Lotes disponibles
                        </span>
                        {!sinStock && (
                          <span className="text-[11px] text-gray-400">{stockTotal} u. en total</span>
                        )}
                      </div>
                      {sinStock ? (
                        <p className="text-xs font-semibold" style={{ color: ERROR_COLOR }}>
                          Sin stock
                        </p>
                      ) : (
                        <ul className="space-y-1">
                          {lotes.map((l, idx) => (
                            <li
                              key={l.idLote}
                              className="flex items-center justify-between text-xs text-gray-600"
                            >
                              <span className="flex items-center gap-1.5">
                                Lote: {l.numeroLote}
                                {/* El primer lote es el FEFO (vence primero) */}
                                {idx === 0 && (
                                  <span
                                    className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                                    style={{ background: C.light, color: C.medium }}
                                  >
                                    Vence primero
                                  </span>
                                )}
                              </span>
                              <span className="font-semibold" style={{ color: C.text }}>
                                {l.stock} u.
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Precio + botón */}
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-lg font-bold" style={{ color: C.dark }}>
                        Bs {producto.precio.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => despacharProducto(producto)}
                        disabled={sinStock}
                        className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                        style={{ background: GRADIENT }}
                      >
                        <Plus className="h-3.5 w-3.5" /> Despachar
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ═══════════════ COLUMNA DERECHA: CLIENTE + CARRITO ═══════════════ */}
        <section
          className="flex flex-col rounded-2xl border bg-white p-5 shadow-sm lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:self-start"
          style={{ borderColor: C.border }}
        >
          {/* ── Cliente asociado (buscador con sugerencias) ── */}
          <div className="mb-4 flex-shrink-0" ref={clienteInputRef}>
            <label className="mb-1.5 block text-sm font-semibold" style={{ color: C.dark }}>
              Cliente asociado
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: C.border }}
                />
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
                  className={`${inputBase} py-2.5 pl-10 pr-3`}
                  style={{ borderColor: C.border, color: C.text }}
                />

                {mostrarSugerencias && (
                  <div
                    className="absolute z-10 mt-1.5 max-h-56 w-full overflow-y-auto rounded-xl border bg-white py-1 shadow-xl"
                    style={{ borderColor: C.border }}
                  >
                    <button
                      type="button"
                      onClick={() => seleccionarCliente(null)}
                      className="block w-full px-3.5 py-2 text-left text-sm font-medium transition-colors hover:bg-purple-50"
                      style={{ color: C.dark }}
                    >
                      Sin Nombre / Público General
                    </button>
                    {clientesFiltrados.length === 0 ? (
                      <p className="px-3.5 py-2 text-xs text-gray-400">Sin resultados</p>
                    ) : (
                      clientesFiltrados.map((c) => (
                        <button
                          key={c.idCliente}
                          type="button"
                          onClick={() => seleccionarCliente(c)}
                          className="block w-full px-3.5 py-2 text-left text-sm transition-colors hover:bg-purple-50"
                          style={{ color: C.text }}
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
                title="Registrar cliente"
                aria-label="Registrar cliente"
                className="flex w-11 items-center justify-center rounded-xl border-2 transition-colors hover:bg-purple-50 active:scale-95"
                style={{ borderColor: C.border, color: C.medium }}
              >
                <UserPlus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="mb-2 flex flex-shrink-0 items-center justify-between">
              <h2 className="text-base font-bold" style={{ color: C.dark }}>
                Detalle de venta
              </h2>
              <span
                className="rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{ background: C.light, color: C.dark }}
              >
                {carrito.length} {carrito.length === 1 ? "item" : "items"}
              </span>
            </div>

            {/* ── Aviso de receta retenida (aparece si algún ítem la requiere) ── */}
            {requiereReceta && (
              <div
                className="mb-3 flex flex-shrink-0 gap-2.5 rounded-xl border p-3 text-xs"
                style={{
                  background: `${ERROR_COLOR}12`,
                  borderColor: `${ERROR_COLOR}40`,
                  color: C.text,
                }}
              >
                <ShieldAlert className="h-4 w-4 shrink-0" style={{ color: ERROR_COLOR }} />
                <div>
                  <p className="font-semibold" style={{ color: ERROR_COLOR }}>
                    Requiere receta farmacológica
                  </p>
                  <p className="mt-0.5 leading-relaxed">
                    La venta incluye medicamentos bajo control gubernamental. Asegúrate de
                    sellar y firmar la receta médica física.
                  </p>
                </div>
              </div>
            )}

            {/* ── Líneas del carrito (esta zona hace scroll; los totales quedan fijos) ── */}
            <div className="min-h-[8rem] max-h-[38vh] flex-1 space-y-3 overflow-y-auto pr-1 lg:max-h-none">
              {carrito.length === 0 ? (
                <div
                  className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-10 text-center"
                  style={{ borderColor: C.border, background: SURFACE }}
                >
                  <ShoppingCart className="h-8 w-8" style={{ color: C.border }} />
                  <p className="text-sm text-gray-400">Aún no agregaste productos a la venta</p>
                  <p className="text-xs text-gray-300">Usa el botón "Despachar" de cada fármaco</p>
                </div>
              ) : (
                carrito.map((item) => {
                  // Solo para la vista: stock máximo del lote asignado (deshabilita +)
                  const stockMax =
                    item.lotesDisponibles.find((l) => l.idLote === item.idLote)?.stock ?? item.cantidad;

                  return (
                    <div
                      key={`${item.idProducto}-${item.idLote}`}
                      className="rounded-xl border p-3"
                      style={{ borderColor: C.border, background: SURFACE }}
                    >
                      <div className="mb-2.5 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold" style={{ color: C.text }}>
                            {item.nombreComercial || item.nombreGenerico}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {item.nombreGenerico}
                            {item.concentracion ? ` - ${item.concentracion}` : ""}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => quitarDelCarrito(item.idProducto, item.idLote)}
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                          title="Quitar de la venta"
                          aria-label="Quitar de la venta"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mb-3 grid grid-cols-2 gap-2.5">
                        <div>
                          <span className="mb-1 block text-xs text-gray-500">Lote asignado</span>
                          <select
                            value={item.idLote}
                            onChange={(e) =>
                              cambiarLote(item.idProducto, item.idLote, Number(e.target.value))
                            }
                            className={`${inputBase} px-2.5 py-1.5 text-xs`}
                            style={{ borderColor: C.border, color: C.text }}
                          >
                            {item.lotesDisponibles.map((l) => (
                              <option key={l.idLote} value={l.idLote}>
                                {l.numeroLote} ({l.stock} u.)
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <span className="mb-1 block text-xs text-gray-500">Unidades</span>
                          <div
                            className="flex items-center overflow-hidden rounded-xl border-2 bg-white"
                            style={{ borderColor: C.border }}
                          >
                            <button
                              type="button"
                              onClick={() => cambiarCantidad(item.idProducto, item.idLote, -1)}
                              disabled={item.cantidad <= 1}
                              aria-label="Restar una unidad"
                              className="px-2.5 py-1.5 transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-30"
                              style={{ color: C.medium }}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span
                              className="flex-1 text-center text-sm font-bold"
                              style={{ color: C.text }}
                            >
                              {item.cantidad}
                            </span>
                            <button
                              type="button"
                              onClick={() => cambiarCantidad(item.idProducto, item.idLote, 1)}
                              disabled={item.cantidad >= stockMax}
                              aria-label="Sumar una unidad"
                              className="px-2.5 py-1.5 transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-30"
                              style={{ color: C.medium }}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div
                        className="flex items-end justify-between gap-2 border-t pt-2.5 text-xs"
                        style={{ borderColor: C.light }}
                      >
                        <div>
                          <span className="mb-1 block text-gray-500">Descuento (Bs)</span>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={item.descuento}
                            onChange={(e) =>
                              cambiarDescuento(item.idProducto, item.idLote, Number(e.target.value))
                            }
                            className={`${inputBase} w-20 px-2 py-1 text-xs`}
                            style={{ borderColor: C.border, color: C.text }}
                          />
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400">Unitario: Bs {item.precioUnitario.toFixed(2)}</p>
                          <p className="text-sm font-bold" style={{ color: C.dark }}>
                            Subtotal: Bs {(item.cantidad * item.precioUnitario - item.descuento).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── Totales (siempre visibles) ── */}
            <div
              className="mt-3 flex-shrink-0 space-y-1.5 rounded-xl border p-3.5 text-sm"
              style={{ background: SURFACE, borderColor: C.border }}
            >
              <div className="flex justify-between text-gray-500">
                <span>Subtotal bruto</span>
                <span>Bs {subtotalBruto.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Descuentos aplicados</span>
                <span>-Bs {descuentosAplicados.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Impuestos declarados (IVA 13%)</span>
                <span>Bs {impuestos.toFixed(2)}</span>
              </div>
              <div
                className="flex items-baseline justify-between border-t pt-2"
                style={{ borderColor: C.border }}
              >
                <span className="font-bold" style={{ color: C.dark }}>
                  Total a pagar
                </span>
                <span className="text-2xl font-bold" style={{ color: C.dark }}>
                  Bs {total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* ── Acciones finales ── */}
            <div className="mt-3 flex flex-shrink-0 gap-2">
              <button
                type="button"
                onClick={limpiarVenta}
                disabled={carrito.length === 0}
                className="flex-1 rounded-xl border-2 py-2.5 text-sm font-bold transition-all hover:bg-purple-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ borderColor: C.border, color: C.dark }}
              >
                Limpiar venta
              </button>
              <button
                type="button"
                onClick={() => setModalReciboAbierto(true)}
                disabled={carrito.length === 0}
                className="flex-[1.4] rounded-xl py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                style={{ background: GRADIENT }}
              >
                Registrar venta (Bs {total.toFixed(2)})
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="fefo-title"
            className="w-full max-w-lg overflow-hidden rounded-2xl border bg-white shadow-2xl"
            style={{ borderColor: C.border }}
          >
            {/* Header del modal */}
            <div className="flex items-start gap-3 px-5 py-4" style={{ background: GRADIENT }}>
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 id="fefo-title" className="text-base font-bold text-white">
                  Alerta FEFO
                </h3>
                <p className="mt-0.5 text-xs text-purple-100">{alertaFEFO.mensaje}</p>
              </div>
            </div>

            <div className="space-y-4 p-5">
              {/* Comparación de lotes */}
              {alertaFEFO.idLoteFEFO !== null && alertaFEFO.idLoteFEFO !== undefined ? (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="rounded-xl border p-3 text-xs" style={{ borderColor: C.border, background: SURFACE }}>
                    <p className="text-gray-500">Lote actual</p>
                    <p className="mt-0.5 text-sm font-bold" style={{ color: C.text }}>
                      {alertaFEFO.numeroLote}
                    </p>
                    <p className="text-gray-500">vence en {alertaFEFO.diasRestantes} días</p>
                  </div>
                  <div className="rounded-xl border p-3 text-xs" style={{ borderColor: C.medium, background: C.light }}>
                    <p style={{ color: C.medium }}>Debería despacharse primero</p>
                    <p className="mt-0.5 text-sm font-bold" style={{ color: C.dark }}>
                      {alertaFEFO.numeroLoteFEFO}
                    </p>
                    <p style={{ color: C.medium }}>vence en {alertaFEFO.diasRestantesFEFO} días</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border p-3 text-xs" style={{ borderColor: C.border, background: SURFACE }}>
                  <p className="text-gray-500">Lote actual</p>
                  <p className="mt-0.5 text-sm font-bold" style={{ color: C.text }}>
                    {alertaFEFO.numeroLote}
                  </p>
                  <p className="text-gray-500">vence en {alertaFEFO.diasRestantes} días</p>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-semibold" style={{ color: C.dark }}>
                  Motivo del desvío
                </label>
                <textarea
                  value={motivoDesvio}
                  onChange={(e) => setMotivoDesvio(e.target.value)}
                  rows={3}
                  placeholder="Ej: se despacha del lote alternativo por disponibilidad..."
                  className={`${inputBase} resize-none px-4 py-3`}
                  style={{ borderColor: C.border, color: C.text }}
                />
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setAlertaFEFO(null);
                    setModalDesvioAbierto(false);
                  }}
                  className="flex-1 rounded-xl border-2 py-2.5 text-sm font-bold transition-all hover:bg-purple-50 active:scale-95"
                  style={{ borderColor: C.border, color: C.dark }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarDesvioFEFO}
                  disabled={registrarVentaMutation.isPending}
                  className="flex-[1.4] rounded-xl py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  style={{ background: GRADIENT }}
                >
                  Confirmar desvío y cobrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}