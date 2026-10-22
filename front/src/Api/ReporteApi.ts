import api from "../lib/Axios";
import { isAxiosError } from "axios";
import {
  ReporteDatosSchema,
  ReporteCompraDatosSchema,
  ReporteVencimientosDatosSchema,
  VencimientosParametrosCatalogoSchema,
} from "../types";
import type {
  FrecuenciaReporte,
  ReporteDatosType,
  ReporteCompraDatosType,
  ReporteVencimientosDatosType,
  ReporteVencimientosFiltrosType,
  VencimientosParametrosCatalogoType,
} from "../types";

// Extrae el mensaje de error del backend o lanza un fallback genérico
function mensajeError(error: unknown, fallback: string): Error {
  if (isAxiosError(error) && error.response) {
    return new Error(error.response.data?.error || fallback);
  }
  return error instanceof Error ? error : new Error(fallback);
}

// Fuerza la descarga de un Blob generando un enlace temporal en el navegador
function descargarBlob(blob: Blob, nombreArchivo: string) {
  const url = window.URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  window.URL.revokeObjectURL(url);
}

type ResultadoValido<T> = { success: true; data: T } | { success: false };

function validar<T>(schema: { safeParse(value: unknown): ResultadoValido<T> }, data: unknown, mensaje: string): T {
  const response = schema.safeParse(data);
  if (response.success) return response.data;
  throw new Error(mensaje);
}

function nombreArchivoReporte(frecuencia: FrecuenciaReporte, fechaInicio: string, fechaFin: string, ext: string): string {
  const capitalizado = frecuencia.charAt(0).toUpperCase() + frecuencia.slice(1);
  return `Reporte_Ventas_${capitalizado}_${fechaInicio}_al_${fechaFin}.${ext}`;
}

function nombreArchivoReporteCompra(frecuencia: FrecuenciaReporte, fechaInicio: string, fechaFin: string, ext: string): string {
  const capitalizado = frecuencia.charAt(0).toUpperCase() + frecuencia.slice(1);
  return `Reporte_Compras_${capitalizado}_${fechaInicio}_al_${fechaFin}.${ext}`;
}

function nombreArchivoVencimientos(ext: string): string {
  const hoy = new Date();
  const sello = `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, '0')}${String(hoy.getDate()).padStart(2, '0')}`;
  return `Reporte_Control_Vencimientos_FEFO_${sello}.${ext}`;
}

// ── GET: Datos del reporte de ventas (JSON) para previsualización ─────────────
export async function GetReporteDatosApi(
  frecuencia: FrecuenciaReporte,
  fechaInicio?: string,
  fechaFin?: string
): Promise<ReporteDatosType> {
  try {
    const { data } = await api.get('/Reporte/GetDatos', {
      params: { frecuencia, fechaInicio, fechaFin },
    });
    return validar(ReporteDatosSchema, data, "Error en la validación de los datos del reporte");
  } catch (error) {
    throw mensajeError(error, "Error al obtener los datos del reporte de ventas");
  }
}

// ── GET: Descargar reporte de ventas en Excel (.xlsx) ─────────────────────────
export async function DescargarReporteExcelApi(
  frecuencia: FrecuenciaReporte,
  fechaInicio?: string,
  fechaFin?: string
) {
  try {
    const { data } = await api.get('/Reporte/DescargarExcel', {
      params: { frecuencia, fechaInicio, fechaFin },
      responseType: 'blob',
    });
    const blob = data instanceof Blob ? data : new Blob([data]);
    descargarBlob(blob, nombreArchivoReporte(frecuencia, fechaInicio ?? 'todo', fechaFin ?? 'todo', 'xlsx'));
  } catch (error) {
    throw mensajeError(error, "Error al descargar el reporte de ventas en Excel");
  }
}

// ── GET: Descargar reporte de ventas en PDF ───────────────────────────────────
export async function DescargarReportePdfApi(
  frecuencia: FrecuenciaReporte,
  fechaInicio?: string,
  fechaFin?: string
) {
  try {
    const { data } = await api.get('/Reporte/DescargarPdf', {
      params: { frecuencia, fechaInicio, fechaFin },
      responseType: 'blob',
    });
    const blob = data instanceof Blob ? data : new Blob([data]);
    descargarBlob(blob, nombreArchivoReporte(frecuencia, fechaInicio ?? 'todo', fechaFin ?? 'todo', 'pdf'));
  } catch (error) {
    throw mensajeError(error, "Error al descargar el reporte de ventas en PDF");
  }
}

// ── GET: Datos del reporte de compras (JSON) para previsualización ────────────
export async function GetReporteCompraDatosApi(
  frecuencia: FrecuenciaReporte,
  fechaInicio?: string,
  fechaFin?: string
): Promise<ReporteCompraDatosType> {
  try {
    const { data } = await api.get('/Reporte/GetDatosCompra', {
      params: { frecuencia, fechaInicio, fechaFin },
    });
    return validar(ReporteCompraDatosSchema, data, "Error en la validación de los datos del reporte de compras");
  } catch (error) {
    throw mensajeError(error, "Error al obtener los datos del reporte de compras");
  }
}

// ── GET: Descargar reporte de compras en Excel (.xlsx) ────────────────────────
export async function DescargarReporteCompraExcelApi(
  frecuencia: FrecuenciaReporte,
  fechaInicio?: string,
  fechaFin?: string
) {
  try {
    const { data } = await api.get('/Reporte/DescargarExcelCompra', {
      params: { frecuencia, fechaInicio, fechaFin },
      responseType: 'blob',
    });
    const blob = data instanceof Blob ? data : new Blob([data]);
    descargarBlob(blob, nombreArchivoReporteCompra(frecuencia, fechaInicio ?? 'todo', fechaFin ?? 'todo', 'xlsx'));
  } catch (error) {
    throw mensajeError(error, "Error al descargar el reporte de compras en Excel");
  }
}

// ── GET: Descargar reporte de compras en PDF ──────────────────────────────────
export async function DescargarReporteCompraPdfApi(
  frecuencia: FrecuenciaReporte,
  fechaInicio?: string,
  fechaFin?: string
) {
  try {
    const { data } = await api.get('/Reporte/DescargarPdfCompra', {
      params: { frecuencia, fechaInicio, fechaFin },
      responseType: 'blob',
    });
    const blob = data instanceof Blob ? data : new Blob([data]);
    descargarBlob(blob, nombreArchivoReporteCompra(frecuencia, fechaInicio ?? 'todo', fechaFin ?? 'todo', 'pdf'));
  } catch (error) {
    throw mensajeError(error, "Error al descargar el reporte de compras en PDF");
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// REPORTE DE CONTROL DE VENCIMIENTOS Y ALERTA FEFO
// ═══════════════════════════════════════════════════════════════════════════

// ── GET: Catálogos y umbrales para construir los filtros del reporte ─────────
export async function GetParametrosVencimientosApi(): Promise<VencimientosParametrosCatalogoType> {
  try {
    const { data } = await api.get('/Reporte/GetParametrosVencimientos');
    return validar(
      VencimientosParametrosCatalogoSchema,
      data,
      "Error en la validación de los parámetros del reporte de vencimientos"
    );
  } catch (error) {
    throw mensajeError(error, "Error al obtener los parámetros del reporte de vencimientos");
  }
}

// ── GET: Datos del reporte de control de vencimientos (JSON) ─────────────────
export async function GetReporteVencimientosDatosApi(
  filtros: ReporteVencimientosFiltrosType
): Promise<ReporteVencimientosDatosType> {
  try {
    const params = { ...filtros, estados: Array.isArray(filtros.estados) ? filtros.estados.join(',') : filtros.estados };
    const { data } = await api.get('/Reporte/GetDatosVencimientos', { params });
    return validar(
      ReporteVencimientosDatosSchema,
      data,
      "Error en la validación de los datos del reporte de vencimientos"
    );
  } catch (error) {
    throw mensajeError(error, "Error al obtener los datos del reporte de vencimientos");
  }
}

// ── GET: Descargar el reporte de control de vencimientos en Excel (.xlsx) ────
export async function DescargarReporteVencimientosExcelApi(
  filtros: ReporteVencimientosFiltrosType
) {
  try {
    const params = { ...filtros, estados: Array.isArray(filtros.estados) ? filtros.estados.join(',') : filtros.estados };
    const { data } = await api.get('/Reporte/DescargarExcelVencimientos', {
      params,
      responseType: 'blob',
    });
    const blob = data instanceof Blob ? data : new Blob([data]);
    descargarBlob(blob, nombreArchivoVencimientos('xlsx'));
  } catch (error) {
    throw mensajeError(error, "Error al descargar el reporte de vencimientos en Excel");
  }
}

// ── GET: Descargar el reporte de control de vencimientos en PDF ──────────────
export async function DescargarReporteVencimientosPdfApi(
  filtros: ReporteVencimientosFiltrosType
) {
  try {
    const params = { ...filtros, estados: Array.isArray(filtros.estados) ? filtros.estados.join(',') : filtros.estados };
    const { data } = await api.get('/Reporte/DescargarPdfVencimientos', {
      params,
      responseType: 'blob',
    });
    const blob = data instanceof Blob ? data : new Blob([data]);
    descargarBlob(blob, nombreArchivoVencimientos('pdf'));
  } catch (error) {
    throw mensajeError(error, "Error al descargar el reporte de vencimientos en PDF");
  }
}
