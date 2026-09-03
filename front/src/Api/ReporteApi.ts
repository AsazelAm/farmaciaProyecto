import api from "../lib/Axios";
import { isAxiosError } from "axios";
import { ReporteDatosSchema, ReporteCompraDatosSchema } from "../types";
import type { FrecuenciaReporte, ReporteDatosType, ReporteCompraDatosType } from "../types";

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