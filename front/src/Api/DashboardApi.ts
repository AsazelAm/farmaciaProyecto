import api from "../lib/Axios";
import { isAxiosError } from "axios";
import {
  DashboardSchema,
  DashboardKpisSchema,
  VentasPorMesesSchema,
  ProductosMasVendidosSchema,
  VentasPorEstadoSchema,
  VentasPorSucursalSchema,
  VentasPorFormaPagoSchema,
  StockBajoSchema,
  LotesPorVencerSchema,
  UltimasVentasSchema,
} from "../types";

// Extrae el mensaje de error del backend o lanza un fallback genérico
function mensajeError(error: unknown, fallback: string): Error {
  if (isAxiosError(error) && error.response) {
    return new Error(error.response.data?.error || fallback);
  }
  return error instanceof Error ? error : new Error(fallback);
}

type ResultadoValido<T> = { success: true; data: T } | { success: false };

function validar<T>(schema: { safeParse(value: unknown): ResultadoValido<T> }, data: unknown, mensaje: string): T {
  const response = schema.safeParse(data);
  if (response.success) return response.data;
  throw new Error(mensaje);
}

// ── GET: Dashboard completo (KPIs + gráficos + alertas) ───────────────────────
export async function GetDashboardApi() {
  try {
    const { data } = await api.get('/Dashboard/GetDashboard');
    return validar(DashboardSchema, data, "Error en la validación de datos del dashboard");
  } catch (error) {
    throw mensajeError(error, 'Error al obtener el dashboard');
  }
}

// ── GET: Resumen de indicadores (KPIs) ───────────────────────────────────────
export async function GetResumenApi() {
  try {
    const { data } = await api.get('/Dashboard/GetResumen');
    return validar(DashboardKpisSchema, data, "Error en la validación de los indicadores");
  } catch (error) {
    throw mensajeError(error, 'Error al obtener los indicadores del dashboard');
  }
}

// ── GET: Ventas de los últimos N meses ───────────────────────────────────────
export async function GetVentasPorMesesApi(meses: number = 12) {
  try {
    const { data } = await api.get('/Dashboard/GetVentasPorMeses', { params: { meses } });
    return validar(VentasPorMesesSchema, data, "Error en la validación de las ventas por mes");
  } catch (error) {
    throw mensajeError(error, 'Error al obtener las ventas por mes');
  }
}

// ── GET: Productos más vendidos ──────────────────────────────────────────────
export async function GetProductosMasVendidosApi(limite: number = 8) {
  try {
    const { data } = await api.get('/Dashboard/GetProductosMasVendidos', { params: { limite } });
    return validar(ProductosMasVendidosSchema, data, "Error en la validación de los productos más vendidos");
  } catch (error) {
    throw mensajeError(error, 'Error al obtener los productos más vendidos');
  }
}

// ── GET: Ventas por estado ───────────────────────────────────────────────────
export async function GetVentasPorEstadoApi() {
  try {
    const { data } = await api.get('/Dashboard/GetVentasPorEstado');
    return validar(VentasPorEstadoSchema, data, "Error en la validación de las ventas por estado");
  } catch (error) {
    throw mensajeError(error, 'Error al obtener las ventas por estado');
  }
}

// ── GET: Ventas por sucursal ─────────────────────────────────────────────────
export async function GetVentasPorSucursalApi() {
  try {
    const { data } = await api.get('/Dashboard/GetVentasPorSucursal');
    return validar(VentasPorSucursalSchema, data, "Error en la validación de las ventas por sucursal");
  } catch (error) {
    throw mensajeError(error, 'Error al obtener las ventas por sucursal');
  }
}

// ── GET: Ventas por forma de pago ────────────────────────────────────────────
export async function GetVentasPorFormaPagoApi() {
  try {
    const { data } = await api.get('/Dashboard/GetVentasPorFormaPago');
    return validar(VentasPorFormaPagoSchema, data, "Error en la validación de las ventas por forma de pago");
  } catch (error) {
    throw mensajeError(error, 'Error al obtener las ventas por forma de pago');
  }
}

// ── GET: Productos con stock bajo ────────────────────────────────────────────
export async function GetStockBajoApi(limite: number = 10) {
  try {
    const { data } = await api.get('/Dashboard/GetStockBajo', { params: { limite } });
    return validar(StockBajoSchema, data, "Error en la validación de los productos con stock bajo");
  } catch (error) {
    throw mensajeError(error, 'Error al obtener los productos con stock bajo');
  }
}

// ── GET: Lotes próximos a vencer ─────────────────────────────────────────────
export async function GetLotesPorVencerApi(dias: number = 30, limite: number = 10) {
  try {
    const { data } = await api.get('/Dashboard/GetLotesPorVencer', { params: { dias, limite } });
    return validar(LotesPorVencerSchema, data, "Error en la validación de los lotes por vencer");
  } catch (error) {
    throw mensajeError(error, 'Error al obtener los lotes próximos a vencer');
  }
}

// ── GET: Últimas ventas registradas ──────────────────────────────────────────
export async function GetUltimasVentasApi(limite: number = 10) {
  try {
    const { data } = await api.get('/Dashboard/GetUltimasVentas', { params: { limite } });
    return validar(UltimasVentasSchema, data, "Error en la validación de las últimas ventas");
  } catch (error) {
    throw mensajeError(error, 'Error al obtener las últimas ventas');
  }
}