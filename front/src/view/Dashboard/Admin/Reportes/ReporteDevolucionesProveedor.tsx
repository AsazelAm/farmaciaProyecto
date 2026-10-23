import { Fragment, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  FileSpreadsheet,
  FileText,
  Layers,
  Loader as LoaderIcon,
  Package,
  PackageX,
  RefreshCw,
  RotateCcw,
  Search,
  TrendingDown,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import Loading from "../../../../Helpers/Loading";
import {
  DescargarReporteDevolucionesProveedorExcelApi,
  DescargarReporteDevolucionesProveedorPdfApi,
  GetParametrosDevolucionesProveedorApi,
  GetReporteDevolucionesProveedorDatosApi,
} from "../../../../Api/ReporteApi";
import type {
  DevolucionProveedorReporteDetalleType,
  DevolucionesProveedorParametrosCatalogoType,
  ReporteDevolucionesProveedorDatosType,
  ReporteDevolucionesProveedorFiltrosType,
} from "../../../../types";

const COLORS = {
  dark: "#4A1A6E",
  medium: "#7B3FA0",
  light: "#F3EBF9",
  border: "#D8B4F0",
  excel: "#15803D",
  pdf: "#DC2626",
  red: "#DC2626",
  amber: "#D97706",
  green: "#059669",
  blue: "#2563EB",
} as const;

const NC_ESTILOS: Record<string, { bg: string; color: string }> = {
  pendiente: { bg: "#FEF3C7", color: "#B45309" },
  emitida: { bg: "#DBEAFE", color: "#1D4ED8" },
  aplicada: { bg: "#D1FAE5", color: "#047857" },
  reembolsada: { bg: "#EDE9FE", color: "#6D28D9" },
};

const MOTIVO_BARRAS = [
  "#4A1A6E",
  "#7B3FA0",
  "#A855F7",
  "#C084FC",
  "#D8B4F0",
  "#EC4899",
  "#F97316",
];

type CampoOrden =
  | "fechaCreacion"
  | "cantidad"
  | "montoNotaCredito"
  | "proveedor"
  | "nombreComercial";

type DireccionOrden = "asc" | "desc";

const formatoMoneda = (n: number) =>
  `Bs ${n.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function EmptyBox({ mensaje }: { mensaje: string }) {
  return <div className="py-12 text-center text-xs text-gray-400">{mensaje}</div>;
}

function MensajeError({ mensaje }: { mensaje: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-8 text-center max-w-md">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="text-sm font-semibold text-red-700">{mensaje}</p>
      </div>
    </div>
  );
}

function CardMetrica({
  titulo,
  icono,
  valor,
  detalle,
  tono = "purple",
}: {
  titulo: string;
  icono: ReactNode;
  valor: string;
  detalle?: string;
  tono?: "purple" | "red" | "amber" | "green";
}) {
  const tonos = {
    purple: { bg: COLORS.light, fg: COLORS.dark },
    red: { bg: "#FEE2E2", fg: "#DC2626" },
    amber: { bg: "#FEF3C7", fg: "#B45309" },
    green: { bg: "#D1FAE5", fg: "#059669" },
  }[tono];

  return (
    <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: tonos.bg, color: tonos.fg }}
        >
          {icono}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">{titulo}</p>
          <p className="text-xl font-extrabold text-gray-800 truncate">{valor}</p>
          {detalle && <p className="text-[11px] text-gray-400 truncate">{detalle}</p>}
        </div>
      </div>
    </div>
  );
}

function BotonDescarga({
  tipo,
  filtros,
  disabled,
}: {
  tipo: "excel" | "pdf";
  filtros: ReporteDevolucionesProveedorFiltrosType;
  disabled: boolean;
}) {
  const [cargando, setCargando] = useState(false);

  const click = async () => {
    setCargando(true);
    try {
      if (tipo === "excel") {
        await DescargarReporteDevolucionesProveedorExcelApi(filtros);
      } else {
        await DescargarReporteDevolucionesProveedorPdfApi(filtros);
      }
    } finally {
      setCargando(false);
    }
  };

  const esExcel = tipo === "excel";
  const Icono = esExcel ? FileSpreadsheet : FileText;
  const color = esExcel ? COLORS.excel : COLORS.pdf;

  return (
    <button
      onClick={click}
      disabled={disabled || cargando}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                 shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                 hover:brightness-105 active:scale-[0.98]"
      style={{ backgroundColor: color }}
    >
      {cargando ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <Icono className="w-4 h-4" />}
      {cargando ? "Generando..." : esExcel ? "Descargar Excel" : "Descargar PDF"}
    </button>
  );
}

function BarraDistribucion({
  etiqueta,
  valor,
  maximo,
  monto,
  color,
  extra,
}: {
  etiqueta: string;
  valor: number;
  maximo: number;
  monto: number;
  color: string;
  extra?: string;
}) {
  const ancho = maximo > 0 ? Math.max((valor / maximo) * 100, 4) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-gray-700 truncate">{etiqueta}</span>
        <span className="font-extrabold text-gray-800 shrink-0">{formatoMoneda(monto)}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${ancho}%`, backgroundColor: color }} />
      </div>
      <div className="flex items-center justify-between text-[11px] text-gray-400">
        <span>{valor} devoluciones</span>
        {extra && <span>{extra}</span>}
      </div>
    </div>
  );
}

function TarjetaDistribucion({
  titulo,
  icono,
  registros,
  vacio,
}: {
  titulo: string;
  icono: ReactNode;
  registros: { etiqueta: string; devoluciones: number; unidades: number; monto: number }[];
  vacio: string;
}) {
  const maximo = registros.reduce((acc, r) => Math.max(acc, r.devoluciones), 0);
  return (
    <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <span style={{ color: COLORS.medium }}>{icono}</span>
        <h3 className="text-sm font-bold text-gray-700">{titulo}</h3>
      </div>
      {registros.length === 0 ? (
        <EmptyBox mensaje={vacio} />
      ) : (
        <div className="space-y-4">
          {registros.map((r, i) => (
            <BarraDistribucion
              key={`${r.etiqueta}-${i}`}
              etiqueta={r.etiqueta}
              valor={r.devoluciones}
              maximo={maximo}
              monto={r.monto}
              color={MOTIVO_BARRAS[i % MOTIVO_BARRAS.length]}
              extra={`${r.unidades} unid.`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Ranking({
  titulo,
  icono,
  filas,
  encabezadoMonto,
  vacio,
}: {
  titulo: string;
  icono: ReactNode;
  filas: { principal: string; secundario?: string; unidades: number; monto: number }[];
  encabezadoMonto: string;
  vacio: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white border border-purple-100 shadow-sm">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-purple-100">
        <span style={{ color: COLORS.medium }}>{icono}</span>
        <h3 className="text-sm font-bold text-gray-700">{titulo}</h3>
      </div>
      {filas.length === 0 ? (
        <EmptyBox mensaje={vacio} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-500">#</th>
                <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-500">DETALLE</th>
                <th className="px-4 py-3 text-right text-xs font-bold tracking-wider text-gray-500">UNID.</th>
                <th className="px-4 py-3 text-right text-xs font-bold tracking-wider text-gray-500">{encabezadoMonto}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filas.map((f, i) => (
                <tr key={`${f.principal}-${i}`} className="transition-colors hover:bg-gray-50/70">
                  <td className="px-4 py-3 text-xs font-bold text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800 truncate max-w-[260px]">{f.principal}</p>
                    {f.secundario && <p className="text-[11px] text-gray-400">{f.secundario}</p>}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-600">{f.unidades}</td>
                  <td className="px-4 py-3 text-right font-extrabold text-gray-800">{formatoMoneda(f.monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SortHeader({
  label,
  campo,
  orden,
  onOrden,
  align = "left",
}: {
  label: string;
  campo: CampoOrden;
  orden: { campo: CampoOrden; dir: DireccionOrden };
  onOrden: (campo: CampoOrden) => void;
  align?: "left" | "right";
}) {
  const activo = orden.campo === campo;
  const Icono = activo ? (orden.dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th className={`px-4 py-3 text-xs font-bold tracking-wider text-gray-500 ${align === "right" ? "text-right" : "text-left"}`}>
      <button
        onClick={() => onOrden(campo)}
        className={`inline-flex items-center gap-1 hover:text-purple-700 transition-colors ${align === "right" ? "flex-row-reverse" : ""}`}
      >
        {label}
        <Icono className={`w-3.5 h-3.5 ${activo ? "text-purple-600" : "text-gray-300"}`} />
      </button>
    </th>
  );
}

function FilaDetalle({ d }: { d: DevolucionProveedorReporteDetalleType }) {
  const nc = NC_ESTILOS[d.estadoNotaCredito] ?? NC_ESTILOS.pendiente;
  const producto = [d.nombreComercial, d.concentracion, d.presentacion].filter(Boolean).join(" · ");
  return (
    <tr className="transition-colors hover:bg-gray-50/70 align-top">
      <td className="px-4 py-3">
        <p className="font-bold text-gray-800">{d.numeroDevolucion}</p>
        <p className="text-[11px] text-gray-400">{d.fechaCreacion}</p>
        <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700">
          {d.estadoLabel}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-gray-600">
        <p className="font-semibold text-gray-700">{d.proveedor}</p>
        <p>{d.numeroFacturaCompra ?? "Sin factura"}</p>
        {d.fechaCompra && <p className="text-[11px] text-gray-400">{d.fechaCompra}</p>}
      </td>
      <td className="px-4 py-3 text-xs">
        <p className="font-semibold text-gray-800 max-w-[260px]">{producto}</p>
        <p className="text-[11px] text-gray-400">{d.laboratorio}</p>
      </td>
      <td className="px-4 py-3 text-xs text-gray-600">
        <p className="font-semibold text-gray-700">{d.numeroLote}</p>
        <p className="text-[11px] text-gray-400">Vence {d.fechaVencimiento}</p>
      </td>
      <td className="px-4 py-3 text-right font-bold text-gray-700">{d.cantidad}</td>
      <td className="px-4 py-3 text-xs text-gray-600 max-w-[180px]">{d.motivoLabel}</td>
      <td className="px-4 py-3">
        <span
          className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
          style={{ backgroundColor: nc.bg, color: nc.color }}
        >
          {d.estadoNotaCreditoLabel}
        </span>
        <p className="text-[11px] text-gray-400 mt-1">{d.numeroNotaCredito ?? "Sin NC"}</p>
      </td>
      <td className="px-4 py-3 text-right font-extrabold text-gray-800 whitespace-nowrap">
        {formatoMoneda(d.montoNotaCredito)}
      </td>
      <td className="px-4 py-3 text-xs text-gray-600">
        <p className="font-semibold text-gray-700">{d.usuario}</p>
        {d.usuarioAutoriza && <p className="text-[11px] text-gray-400">Aut: {d.usuarioAutoriza}</p>}
      </td>
    </tr>
  );
}

function claveAgrupacion(d: DevolucionProveedorReporteDetalleType, agrupacion: string): string {
  switch (agrupacion) {
    case "motivo":
      return d.motivoLabel;
    case "producto":
      return d.nombreComercial;
    case "proveedor":
      return d.proveedor;
    case "estado":
      return d.estadoNotaCreditoLabel;
    default:
      return "";
  }
}

export default function ReporteDevolucionesProveedor() {
  const filtrosIniciales: ReporteDevolucionesProveedorFiltrosType = {
    fechaInicio: undefined,
    fechaFin: undefined,
    idProveedor: undefined,
    idLaboratorio: undefined,
    motivo: undefined,
    estadoNotaCredito: undefined,
    idUsuario: undefined,
    producto: undefined,
    busqueda: undefined,
  };

  const [filtrosAplicados, setFiltrosAplicados] =
    useState<ReporteDevolucionesProveedorFiltrosType>(filtrosIniciales);
  const [filtrosEdit, setFiltrosEdit] =
    useState<ReporteDevolucionesProveedorFiltrosType>(filtrosIniciales);
  const [productoInput, setProductoInput] = useState("");
  const [busquedaInput, setBusquedaInput] = useState("");
  const [orden, setOrden] = useState<{ campo: CampoOrden; dir: DireccionOrden }>({
    campo: "fechaCreacion",
    dir: "desc",
  });
  const [agrupacion, setAgrupacion] = useState<string>("none");

  const { data: parametros, isLoading: isLoadingParametros } =
    useQuery<DevolucionesProveedorParametrosCatalogoType>({
      queryKey: ["ReporteDevolucionesProveedorParametros"],
      queryFn: GetParametrosDevolucionesProveedorApi,
    });

  const { data, isLoading, isFetching, error } = useQuery<ReporteDevolucionesProveedorDatosType>({
    queryKey: ["ReporteDevolucionesProveedor", filtrosAplicados],
    queryFn: () => GetReporteDevolucionesProveedorDatosApi(filtrosAplicados),
    placeholderData: (prev) => prev,
  });

  const setFiltro = (patch: Partial<ReporteDevolucionesProveedorFiltrosType>) => {
    setFiltrosEdit((prev) => ({ ...prev, ...patch }));
  };

  const consultar = () => {
    setFiltrosAplicados({
      ...filtrosEdit,
      producto: productoInput.trim() === "" ? undefined : productoInput.trim(),
      busqueda: busquedaInput.trim() === "" ? undefined : busquedaInput.trim(),
    });
  };

  const resetear = () => {
    setFiltrosEdit(filtrosIniciales);
    setProductoInput("");
    setBusquedaInput("");
    setFiltrosAplicados(filtrosIniciales);
    setOrden({ campo: "fechaCreacion", dir: "desc" });
    setAgrupacion("none");
  };

  const alternarOrden = (campo: CampoOrden) => {
    setOrden((prev) =>
      prev.campo === campo
        ? { campo, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { campo, dir: campo === "montoNotaCredito" || campo === "cantidad" ? "desc" : "asc" }
    );
  };

  const ordenados = useMemo(() => {
    const filas = [...(data?.detalles ?? [])];
    const factor = orden.dir === "asc" ? 1 : -1;
    filas.sort((a, b) => {
      const va = a[orden.campo] as string | number;
      const vb = b[orden.campo] as string | number;
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * factor;
      return String(va ?? "").localeCompare(String(vb ?? ""), "es", { sensitivity: "base" }) * factor;
    });
    return filas;
  }, [data?.detalles, orden]);

  const grupos = useMemo(() => {
    if (agrupacion === "none") return [];
    const mapa = new Map<string, { etiqueta: string; filas: DevolucionProveedorReporteDetalleType[]; unidades: number; monto: number }>();
    ordenados.forEach((d) => {
      const clave = claveAgrupacion(d, agrupacion);
      const actual = mapa.get(clave) ?? { etiqueta: clave || "Sin clasificar", filas: [], unidades: 0, monto: 0 };
      actual.filas.push(d);
      actual.unidades += d.cantidad;
      actual.monto += d.montoNotaCredito;
      mapa.set(clave, actual);
    });
    return [...mapa.values()].sort((a, b) => b.monto - a.monto);
  }, [ordenados, agrupacion]);

  const resumen = data?.resumen;
  const detalles = data?.detalles ?? [];

  const registrosProveedor = (resumen?.porProveedor ?? []).map((p) => ({
    etiqueta: p.proveedor,
    devoluciones: p.devoluciones,
    unidades: p.unidades,
    monto: p.montoNC,
  }));

  const registrosMotivo = (resumen?.porMotivo ?? []).map((m) => ({
    etiqueta: m.etiqueta,
    devoluciones: m.devoluciones,
    unidades: m.unidades,
    monto: m.montoNC,
  }));

  const registrosEstado = (resumen?.porEstadoNotaCredito ?? []).map((e) => ({
    etiqueta: e.etiqueta,
    devoluciones: e.devoluciones,
    unidades: e.unidades,
    monto: e.montoNC,
  }));

  if (isLoadingParametros) return <Loading />;
  if (isLoading) return <Loading />;
  if (error) {
    return <MensajeError mensaje={error instanceof Error ? error.message : "Error al cargar el reporte de devoluciones a proveedores"} />;
  }

  const COLS = 9;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: COLORS.dark }}>
            <PackageX className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Devoluciones a Proveedores y Recuperación de Notas de Crédito</h1>
            <p className="text-sm text-gray-500">
              Trazabilidad de devoluciones a proveedores, notas de crédito y recuperación económica
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Desde</label>
            <input
              type="date"
              value={filtrosEdit.fechaInicio ?? ""}
              onChange={(e) => setFiltro({ fechaInicio: e.target.value || undefined })}
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Hasta</label>
            <input
              type="date"
              value={filtrosEdit.fechaFin ?? ""}
              onChange={(e) => setFiltro({ fechaFin: e.target.value || undefined })}
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Proveedor</label>
            <select
              value={filtrosEdit.idProveedor ?? ""}
              onChange={(e) => setFiltro({ idProveedor: e.target.value === "" ? undefined : Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="">Todos</option>
              {(parametros?.proveedores ?? []).map((p) => (
                <option key={p.idProveedor} value={p.idProveedor}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Laboratorio</label>
            <select
              value={filtrosEdit.idLaboratorio ?? ""}
              onChange={(e) => setFiltro({ idLaboratorio: e.target.value === "" ? undefined : Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="">Todos</option>
              {(parametros?.laboratorios ?? []).map((l) => (
                <option key={l.idLaboratorio} value={l.idLaboratorio}>{l.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Motivo</label>
            <select
              value={filtrosEdit.motivo ?? ""}
              onChange={(e) => setFiltro({ motivo: e.target.value || undefined })}
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="">Todos</option>
              {(parametros?.motivos ?? []).map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Estado nota de crédito</label>
            <select
              value={filtrosEdit.estadoNotaCredito ?? ""}
              onChange={(e) => setFiltro({ estadoNotaCredito: e.target.value || undefined })}
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="">Todos</option>
              {(parametros?.estadosNotaCredito ?? []).map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Usuario</label>
            <select
              value={filtrosEdit.idUsuario ?? ""}
              onChange={(e) => setFiltro({ idUsuario: e.target.value === "" ? undefined : Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="">Todos</option>
              {(parametros?.usuarios ?? []).map((u) => (
                <option key={u.idUsuario} value={u.idUsuario}>{u.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Producto / lote</label>
            <input
              type="text"
              value={productoInput}
              onChange={(e) => setProductoInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") consultar(); }}
              placeholder="Nombre, código o lote..."
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Búsqueda</label>
            <input
              type="text"
              value={busquedaInput}
              onChange={(e) => setBusquedaInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") consultar(); }}
              placeholder="Proveedor, factura, lote..."
              className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-2">
            <button
              onClick={consultar}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:brightness-105 active:scale-[0.98]"
              style={{ backgroundColor: COLORS.dark }}
            >
              <Search className="w-4 h-4" />
              Consultar
            </button>
            <button
              onClick={resetear}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 border border-purple-200 hover:bg-purple-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-end">
        <BotonDescarga tipo="excel" filtros={filtrosAplicados} disabled={!data || isFetching} />
        <BotonDescarga tipo="pdf" filtros={filtrosAplicados} disabled={!data || isFetching} />
      </div>

      {resumen && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CardMetrica
            titulo="Total devoluciones"
            icono={<PackageX className="w-5 h-5" />}
            valor={resumen.totalDevoluciones.toLocaleString("es-BO")}
            detalle={`${resumen.totalLineas} líneas registradas`}
            tono="purple"
          />
          <CardMetrica
            titulo="Unidades devueltas"
            icono={<Layers className="w-5 h-5" />}
            valor={resumen.totalUnidades.toLocaleString("es-BO")}
            detalle="suma de cantidades"
            tono="amber"
          />
          <CardMetrica
            titulo="Monto total NC"
            icono={<Wallet className="w-5 h-5" />}
            valor={formatoMoneda(resumen.montoTotalNC)}
            detalle="notas de crédito"
            tono="red"
          />
          <CardMetrica
            titulo="Promedio por devolución"
            icono={<TrendingDown className="w-5 h-5" />}
            valor={formatoMoneda(resumen.montoPromedio)}
            detalle="monto medio recuperado"
            tono="green"
          />
        </div>
      )}

      {resumen && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TarjetaDistribucion
            titulo="Devoluciones por proveedor"
            icono={<Users className="w-4 h-4" />}
            registros={registrosProveedor}
            vacio="Sin devoluciones para los filtros aplicados"
          />
          <TarjetaDistribucion
            titulo="Estado de notas de crédito"
            icono={<Wallet className="w-4 h-4" />}
            registros={registrosEstado}
            vacio="Sin notas de crédito registradas"
          />
        </div>
      )}

      {resumen && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TarjetaDistribucion
            titulo="Devoluciones por motivo"
            icono={<AlertTriangle className="w-4 h-4" />}
            registros={registrosMotivo}
            vacio="Sin motivos registrados"
          />
          <Ranking
            titulo="Top productos devueltos"
            icono={<Package className="w-4 h-4" />}
            encabezadoMonto="MONTO"
            vacio="Sin productos devueltos"
            filas={resumen.topProductos.map((p) => ({
              principal: p.producto,
              unidades: p.unidades,
              monto: p.monto,
            }))}
          />
        </div>
      )}

      {resumen && resumen.porLaboratorio.length > 0 && (
        <Ranking
          titulo="Devoluciones por laboratorio"
          icono={<UserRound className="w-4 h-4" />}
          encabezadoMonto="MONTO NC"
          vacio="Sin laboratorios"
          filas={resumen.porLaboratorio.map((l) => ({
            principal: l.laboratorio,
            secundario: `${l.devoluciones} devoluciones`,
            unidades: l.unidades,
            monto: l.montoNC,
          }))}
        />
      )}

      {resumen && resumen.porProveedor.length > 0 && (
        <Ranking
          titulo="Devoluciones por proveedor (ranking)"
          icono={<Users className="w-4 h-4" />}
          encabezadoMonto="MONTO NC"
          vacio="Sin proveedores"
          filas={resumen.porProveedor.map((p) => ({
            principal: p.proveedor,
            secundario: `${p.devoluciones} devoluciones`,
            unidades: p.unidades,
            monto: p.montoNC,
          }))}
        />
      )}

      {data && (
        <div className="overflow-hidden rounded-2xl bg-white border border-purple-100 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-5 py-4 border-b border-purple-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" style={{ color: COLORS.medium }} />
              <h3 className="text-sm font-bold text-gray-700">Detalle de devoluciones a proveedores</h3>
              <span className="text-xs font-semibold text-gray-500">{detalles.length} líneas</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500">Agrupar por</label>
              <select
                value={agrupacion}
                onChange={(e) => setAgrupacion(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-purple-200 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="none">Sin agrupar</option>
                <option value="motivo">Motivo</option>
                <option value="producto">Producto</option>
                <option value="proveedor">Proveedor</option>
                <option value="estado">Estado NC</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <SortHeader label="DEVOLUCIÓN" campo="fechaCreacion" orden={orden} onOrden={alternarOrden} />
                  <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-500">PROVEEDOR / FACTURA</th>
                  <SortHeader label="PRODUCTO" campo="nombreComercial" orden={orden} onOrden={alternarOrden} />
                  <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-500">LOTE / VENCE</th>
                  <SortHeader label="CANT." campo="cantidad" orden={orden} onOrden={alternarOrden} align="right" />
                  <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-500">MOTIVO</th>
                  <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-500">ESTADO NC</th>
                  <SortHeader label="MONTO NC" campo="montoNotaCredito" orden={orden} onOrden={alternarOrden} align="right" />
                  <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-500">USUARIO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {detalles.length === 0 ? (
                  <tr>
                    <td colSpan={COLS}>
                      <EmptyBox mensaje="No hay devoluciones que cumplan los filtros aplicados" />
                    </td>
                  </tr>
                ) : agrupacion === "none" ? (
                  ordenados.map((d) => (
                    <FilaDetalle key={`${d.idDevolucionProveedor}-${d.idLote}-${d.idProducto}`} d={d} />
                  ))
                ) : (
                  grupos.map((g) => (
                    <Fragment key={`grupo-${g.etiqueta}`}>
                      <tr className="bg-purple-50/70">
                        <td colSpan={COLS} className="px-4 py-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-extrabold uppercase tracking-wide text-purple-800">
                              {g.etiqueta} <span className="font-semibold text-purple-500">({g.filas.length} líneas)</span>
                            </span>
                            <span className="text-xs font-bold text-purple-700">
                              {g.unidades} unid. · {formatoMoneda(g.monto)}
                            </span>
                          </div>
                        </td>
                      </tr>
                      {g.filas.map((d) => (
                        <FilaDetalle key={`${g.etiqueta}-${d.idDevolucionProveedor}-${d.idLote}-${d.idProducto}`} d={d} />
                      ))}
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isFetching && (
        <div className="fixed bottom-5 right-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-lg border border-purple-100 text-xs font-semibold text-gray-600">
          <RefreshCw className="w-4 h-4 animate-spin" style={{ color: COLORS.medium }} />
          Actualizando...
        </div>
      )}
    </div>
  );
}
