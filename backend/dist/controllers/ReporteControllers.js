"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReporteControllers = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const ReportesModels_1 = __importDefault(require("../Models/ReportesModels"));
const ReporteVencimientosModels_1 = __importStar(require("../Models/ReporteVencimientosModels"));
const ReporteInventarioModels_1 = __importDefault(require("../Models/ReporteInventarioModels"));
const ReporteDevolucionesModels_1 = __importStar(require("../Models/ReporteDevolucionesModels"));
const ReporteDevolucionesProveedorModels_1 = __importStar(require("../Models/ReporteDevolucionesProveedorModels"));
const ReporteRotacionProductosModels_1 = __importDefault(require("../Models/ReporteRotacionProductosModels"));
const ReporteFacturacionModels_1 = __importDefault(require("../Models/ReporteFacturacionModels"));
const FRECUENCIAS_VALIDAS = ['diario', 'semanal', 'mensual'];
const TITULO_HUMANO = {
    diario: 'por Día',
    semanal: 'por Semana',
    mensual: 'por Mes',
};
const NOMBRE_ARCHIVO = {
    diario: 'Diario',
    semanal: 'Semanal',
    mensual: 'Mensual',
};
function frecuenciaValida(valor) {
    return typeof valor === 'string' && FRECUENCIAS_VALIDAS.includes(valor)
        ? valor
        : 'diario';
}
function fechaHoy() {
    const h = new Date();
    return `${String(h.getDate()).padStart(2, '0')}/${String(h.getMonth() + 1).padStart(2, '0')}/${h.getFullYear()}`;
}
// 'YYYY-MM-DD' para incrustar en el nombre de los archivos descargados.
function fechaArchivo() {
    const h = new Date();
    return `${h.getFullYear()}${String(h.getMonth() + 1).padStart(2, '0')}${String(h.getDate()).padStart(2, '0')}`;
}
// 'YYYY-MM-DD' -> 'DD/MM/YYYY'
function formatearFecha(iso) {
    const partes = String(iso ?? '').split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : iso;
}
// Fecha/hora de la venta en español local (el driver trae ISO en UTC).
const formatoFechaHoraEs = new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});
function formatearFechaHora(valor) {
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime()))
        return String(valor ?? '');
    return formatoFechaHoraEs.format(fecha);
}
function formatoMoneda(n) {
    return n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function escapeHtml(texto) {
    return String(texto ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
// ─── Generador EXCEL (exceljs) ────────────────────────────────────────────────
async function generarExcel(datos) {
    const workbook = new exceljs_1.default.Workbook();
    workbook.creator = 'Sistema de Farmacia';
    workbook.created = new Date();
    // Hoja 1: resumen por periodo
    const hojaResumen = workbook.addWorksheet('Resumen');
    hojaResumen.columns = [
        { header: 'Periodo', key: 'etiqueta', width: 20 },
        { header: 'N° Ventas', key: 'cantidad', width: 12 },
        { header: 'Subtotal', key: 'subtotal', width: 14 },
        { header: 'Descuento', key: 'descuentoTotal', width: 14 },
        { header: 'Impuestos', key: 'impuestos', width: 14 },
        { header: 'Total', key: 'total', width: 14 },
    ];
    hojaResumen.mergeCells('A1:F1');
    hojaResumen.getCell('A1').value = `Reporte de Ventas ${TITULO_HUMANO[datos.frecuencia]}`;
    hojaResumen.getCell('A1').font = { bold: true, size: 16 };
    hojaResumen.getCell('A1').alignment = { horizontal: 'center' };
    hojaResumen.mergeCells('A2:F2');
    hojaResumen.getCell('A2').value =
        `Periodo: ${formatearFecha(datos.fechaInicio)} al ${formatearFecha(datos.fechaFin)}   |   Generado: ${fechaHoy()}`;
    hojaResumen.getCell('A2').font = { italic: true, size: 10 };
    // Encabezados de columna
    hojaResumen.getRow(4).values = ['Periodo', 'N° Ventas', 'Subtotal', 'Descuento', 'Impuestos', 'Total'];
    const filaHeaderResumen = hojaResumen.getRow(4);
    filaHeaderResumen.height = 20;
    filaHeaderResumen.eachCell((celda) => {
        celda.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
        celda.alignment = { horizontal: 'center', vertical: 'middle' };
        celda.border = { bottom: { style: 'thin', color: { argb: 'FFB0B0B0' } } };
    });
    const formatoColumnas = (filaFila, esTotal = false) => {
        filaFila.eachCell((celda, numero) => {
            celda.border = { bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } } };
            if (numero >= 3) {
                celda.alignment = { horizontal: 'right' };
                if (typeof celda.value === 'number' && !esTotal)
                    celda.numFmt = '#,##0.00';
            }
        });
    };
    datos.periodos.forEach((p, i) => {
        const fila = hojaResumen.getRow(5 + i);
        fila.getCell(1).value = p.etiqueta;
        fila.getCell(2).value = p.cantidad;
        fila.getCell(3).value = p.subtotal;
        fila.getCell(4).value = p.descuentoTotal;
        fila.getCell(5).value = p.impuestos;
        fila.getCell(6).value = p.total;
        formatoColumnas(fila);
    });
    const filaTotales = hojaResumen.getRow(5 + datos.periodos.length);
    filaTotales.values = [
        'TOTALES',
        datos.totales.cantidad,
        datos.totales.subtotal,
        datos.totales.descuentoTotal,
        datos.totales.impuestos,
        datos.totales.total,
    ];
    filaTotales.eachCell((celda, numero) => {
        celda.font = { bold: true };
        celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
        celda.alignment = { horizontal: numero >= 3 ? 'right' : 'left' };
        celda.numFmt = numero >= 3 ? '#,##0.00' : 'General';
    });
    // Hoja 2: detalle de ventas
    const hojaDetalle = workbook.addWorksheet('Detalle de Ventas');
    hojaDetalle.columns = [
        { header: 'N° Factura', key: 'numeroFactura', width: 14 },
        { header: 'N° Venta', key: 'idVenta', width: 10 },
        { header: 'Fecha', key: 'fechaCreacion', width: 20 },
        { header: 'Cliente', key: 'cliente', width: 25 },
        { header: 'Usuario', key: 'usuario', width: 22 },
        { header: 'Sucursal', key: 'sucursal', width: 18 },
        { header: 'Tipo Pago', key: 'tipoPago', width: 16 },
        { header: 'Estado', key: 'estado', width: 12 },
        { header: 'Subtotal', key: 'subtotal', width: 13 },
        { header: 'Descuento', key: 'descuentoTotal', width: 12 },
        { header: 'Impuestos', key: 'impuestos', width: 12 },
        { header: 'Total', key: 'total', width: 13 },
    ];
    hojaDetalle.mergeCells('A1:L1');
    hojaDetalle.getCell('A1').value = `Detalle de Ventas ${TITULO_HUMANO[datos.frecuencia]}`;
    hojaDetalle.getCell('A1').font = { bold: true, size: 16 };
    hojaDetalle.getCell('A1').alignment = { horizontal: 'center' };
    const filaHeaderDetalle = hojaDetalle.getRow(3);
    filaHeaderDetalle.height = 20;
    filaHeaderDetalle.eachCell((celda) => {
        celda.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
        celda.alignment = { horizontal: 'center', vertical: 'middle' };
        celda.border = { bottom: { style: 'thin', color: { argb: 'FFB0B0B0' } } };
    });
    datos.ventas.forEach((v, i) => {
        const fila = hojaDetalle.getRow(4 + i);
        fila.values = [
            v.numeroFactura ?? '',
            v.idVenta,
            formatearFechaHora(v.fechaCreacion),
            v.cliente ?? '',
            v.usuario ?? '',
            v.sucursal ?? '',
            v.tipoPago ?? '',
            v.estado,
            v.subtotal,
            v.descuentoTotal,
            v.impuestos,
            v.total,
        ];
        formatoColumnas(fila);
    });
    return workbook.xlsx.writeBuffer();
}
// ─── Generador HTML + PDF (puppeteer) ─────────────────────────────────────────
function generarHtml(datos) {
    const filasResumen = datos.periodos
        .map((p) => `
            <tr>
                <td>${escapeHtml(p.etiqueta)}</td>
                <td class="num">${p.cantidad}</td>
                <td class="num">${formatoMoneda(p.subtotal)}</td>
                <td class="num">${formatoMoneda(p.descuentoTotal)}</td>
                <td class="num">${formatoMoneda(p.impuestos)}</td>
                <td class="num">${formatoMoneda(p.total)}</td>
            </tr>`)
        .join('');
    const filasDetalle = datos.ventas
        .map((v) => `
            <tr>
                <td>${escapeHtml(v.numeroFactura)}</td>
                <td>${v.idVenta}</td>
                <td>${escapeHtml(formatearFechaHora(v.fechaCreacion))}</td>
                <td>${escapeHtml(v.cliente)}</td>
                <td>${escapeHtml(v.usuario)}</td>
                <td>${escapeHtml(v.sucursal)}</td>
                <td>${escapeHtml(v.tipoPago)}</td>
                <td><span class="estado">${escapeHtml(v.estado)}</span></td>
                <td class="num">${formatoMoneda(v.subtotal)}</td>
                <td class="num">${formatoMoneda(v.descuentoTotal)}</td>
                <td class="num">${formatoMoneda(v.impuestos)}</td>
                <td class="num">${formatoMoneda(v.total)}</td>
            </tr>`)
        .join('');
    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; font-size: 11px; margin: 0; padding: 0; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2563eb; padding-bottom: 10px; margin-bottom: 18px; }
    .header h1 { margin: 0; font-size: 20px; color: #2563eb; }
    .header p { margin: 2px 0 0; color: #6b7280; font-size: 11px; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 16px; padding: 10px 14px; background: #eff6ff; border-radius: 8px; font-size: 12px; }
    .meta b { color: #1d4ed8; }
    h2 { font-size: 14px; color: #1d4ed8; margin: 20px 0 8px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #2563eb; color: #fff; text-align: left; padding: 6px 8px; font-size: 10px; }
    td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background: #f9fafb; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    td.num, th.num { text-align: right; }
    .total-row td { font-weight: bold; background: #dbeafe !important; }
    .estado { display: inline-block; padding: 1px 8px; border-radius: 10px; text-transform: capitalize; }
    .estado-completado { background: #dcfce7; color: #15803d; }
    .estado-pendiente { background: #fef9c3; color: #a16207; }
    .estado-cancelado { background: #fee2e2; color: #b91c1c; }
    .footer { margin-top: 22px; color: #9ca3af; font-size: 10px; text-align: center; }
</style>
</head>
<body>
    <div class="header">
        <div>
            <h1>Reporte de Ventas ${TITULO_HUMANO[datos.frecuencia]}</h1>
            <p>Sistema de Farmacia</p>
        </div>
        <p><b>Generado:</b> ${fechaHoy()}<br><b>Usuario:</b> Administrador</p>
    </div>

    <div class="meta">
        <span>Periodo: <b>${formatearFecha(datos.fechaInicio)}</b> al <b>${formatearFecha(datos.fechaFin)}</b></span>
        <span>Ventas completadas: <b>${datos.totales.cantidad}</b></span>
        <span>Total facturado: <b>${formatoMoneda(datos.totales.total)}</b></span>
    </div>

    <h2>Resumen ${TITULO_HUMANO[datos.frecuencia]}</h2>
    <table>
        <thead>
            <tr>
                <th>Periodo</th>
                <th class="num">N° Ventas</th>
                <th class="num">Subtotal</th>
                <th class="num">Descuento</th>
                <th class="num">Impuestos</th>
                <th class="num">Total</th>
            </tr>
        </thead>
        <tbody>
            ${filasResumen}
            <tr class="total-row">
                <td>TOTALES</td>
                <td class="num">${datos.totales.cantidad}</td>
                <td class="num">${formatoMoneda(datos.totales.subtotal)}</td>
                <td class="num">${formatoMoneda(datos.totales.descuentoTotal)}</td>
                <td class="num">${formatoMoneda(datos.totales.impuestos)}</td>
                <td class="num">${formatoMoneda(datos.totales.total)}</td>
            </tr>
        </tbody>
    </table>

    <h2>Detalle de Ventas (${datos.ventas.length} registros)</h2>
    <table>
        <thead>
            <tr>
                <th>N° Factura</th>
                <th>N° Venta</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Usuario</th>
                <th>Sucursal</th>
                <th>Tipo Pago</th>
                <th>Estado</th>
                <th class="num">Subtotal</th>
                <th class="num">Descuento</th>
                <th class="num">Impuestos</th>
                <th class="num">Total</th>
            </tr>
        </thead>
        <tbody>${filasDetalle}</tbody>
    </table>

    <div class="footer">Documento generado automáticamente por el sistema de farmacia.</div>
</body>
</html>`;
}
async function generarPdf(datos) {
    const browser = await puppeteer_1.default.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
        const page = await browser.newPage();
        await page.setContent(generarHtml(datos), { waitUntil: 'load' });
        const pdf = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: { top: '30px', bottom: '30px', left: '25px', right: '25px' },
        });
        return Buffer.from(pdf);
    }
    finally {
        await browser.close();
    }
}
// ─── Generador EXCEL de COMPRAS (exceljs) ─────────────────────────────────────
async function generarExcelCompra(datos) {
    const workbook = new exceljs_1.default.Workbook();
    workbook.creator = 'Sistema de Farmacia';
    workbook.created = new Date();
    const hojaResumen = workbook.addWorksheet('Resumen');
    hojaResumen.columns = [
        { header: 'Periodo', key: 'etiqueta', width: 20 },
        { header: 'N° Compras', key: 'cantidad', width: 12 },
        { header: 'Subtotal', key: 'subtotal', width: 14 },
        { header: 'Descuento', key: 'descuentoTotal', width: 14 },
        { header: 'Impuestos', key: 'impuestos', width: 14 },
        { header: 'Total', key: 'total', width: 14 },
    ];
    hojaResumen.mergeCells('A1:F1');
    hojaResumen.getCell('A1').value = `Reporte de Compras ${TITULO_HUMANO[datos.frecuencia]}`;
    hojaResumen.getCell('A1').font = { bold: true, size: 16 };
    hojaResumen.getCell('A1').alignment = { horizontal: 'center' };
    hojaResumen.mergeCells('A2:F2');
    hojaResumen.getCell('A2').value =
        `Periodo: ${formatearFecha(datos.fechaInicio)} al ${formatearFecha(datos.fechaFin)}   |   Generado: ${fechaHoy()}`;
    hojaResumen.getCell('A2').font = { italic: true, size: 10 };
    hojaResumen.getRow(4).values = ['Periodo', 'N° Compras', 'Subtotal', 'Descuento', 'Impuestos', 'Total'];
    const filaHeaderResumen = hojaResumen.getRow(4);
    filaHeaderResumen.height = 20;
    filaHeaderResumen.eachCell((celda) => {
        celda.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
        celda.alignment = { horizontal: 'center', vertical: 'middle' };
        celda.border = { bottom: { style: 'thin', color: { argb: 'FFB0B0B0' } } };
    });
    datos.periodos.forEach((p, i) => {
        const fila = hojaResumen.getRow(5 + i);
        fila.getCell(1).value = p.etiqueta;
        fila.getCell(2).value = p.cantidad;
        fila.getCell(3).value = p.subtotal;
        fila.getCell(4).value = p.descuentoTotal;
        fila.getCell(5).value = p.impuestos;
        fila.getCell(6).value = p.total;
        fila.eachCell((celda, numero) => {
            celda.border = { bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } } };
            if (numero >= 3) {
                celda.alignment = { horizontal: 'right' };
                if (typeof celda.value === 'number')
                    celda.numFmt = '#,##0.00';
            }
        });
    });
    const filaTotales = hojaResumen.getRow(5 + datos.periodos.length);
    filaTotales.values = [
        'TOTALES',
        datos.totales.cantidad,
        datos.totales.subtotal,
        datos.totales.descuentoTotal,
        datos.totales.impuestos,
        datos.totales.total,
    ];
    filaTotales.eachCell((celda, numero) => {
        celda.font = { bold: true };
        celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
        celda.alignment = { horizontal: numero >= 3 ? 'right' : 'left' };
        celda.numFmt = numero >= 3 ? '#,##0.00' : 'General';
    });
    const hojaDetalle = workbook.addWorksheet('Detalle de Compras');
    hojaDetalle.columns = [
        { header: 'N° Factura', key: 'numeroFactura', width: 14 },
        { header: 'N° Compra', key: 'idEntidad', width: 11 },
        { header: 'Fecha', key: 'fechaCreacion', width: 20 },
        { header: 'Proveedor', key: 'pagador', width: 28 },
        { header: 'Usuario', key: 'usuario', width: 22 },
        { header: 'Sucursal', key: 'sucursal', width: 18 },
        { header: 'Estado', key: 'estado', width: 12 },
        { header: 'Subtotal', key: 'subtotal', width: 13 },
        { header: 'Descuento', key: 'descuentoTotal', width: 12 },
        { header: 'Impuestos', key: 'impuestos', width: 12 },
        { header: 'Total', key: 'total', width: 13 },
    ];
    hojaDetalle.mergeCells('A1:K1');
    hojaDetalle.getCell('A1').value = `Detalle de Compras ${TITULO_HUMANO[datos.frecuencia]}`;
    hojaDetalle.getCell('A1').font = { bold: true, size: 16 };
    hojaDetalle.getCell('A1').alignment = { horizontal: 'center' };
    const filaHeaderDetalle = hojaDetalle.getRow(3);
    filaHeaderDetalle.height = 20;
    filaHeaderDetalle.eachCell((celda) => {
        celda.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
        celda.alignment = { horizontal: 'center', vertical: 'middle' };
        celda.border = { bottom: { style: 'thin', color: { argb: 'FFB0B0B0' } } };
    });
    datos.compras.forEach((v, i) => {
        const fila = hojaDetalle.getRow(4 + i);
        fila.values = [
            v.numeroFactura ?? '',
            v.idEntidad,
            formatearFechaHora(v.fechaCreacion),
            v.pagador ?? '',
            v.usuario ?? '',
            v.sucursal ?? '',
            v.estado,
            v.subtotal,
            v.descuentoTotal,
            v.impuestos,
            v.total,
        ];
        fila.eachCell((celda, numero) => {
            celda.border = { bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } } };
            if (numero >= 3) {
                celda.alignment = { horizontal: 'right' };
                if (typeof celda.value === 'number')
                    celda.numFmt = '#,##0.00';
            }
        });
    });
    return workbook.xlsx.writeBuffer();
}
// ─── Generador HTML + PDF de COMPRAS (puppeteer) ──────────────────────────────
function generarHtmlCompra(datos) {
    const filasResumen = datos.periodos
        .map((p) => `
            <tr>
                <td>${escapeHtml(p.etiqueta)}</td>
                <td class="num">${p.cantidad}</td>
                <td class="num">${formatoMoneda(p.subtotal)}</td>
                <td class="num">${formatoMoneda(p.descuentoTotal)}</td>
                <td class="num">${formatoMoneda(p.impuestos)}</td>
                <td class="num">${formatoMoneda(p.total)}</td>
            </tr>`)
        .join('');
    const filasDetalle = datos.compras
        .map((v) => `
            <tr>
                <td>${escapeHtml(v.numeroFactura)}</td>
                <td>${v.idEntidad}</td>
                <td>${escapeHtml(formatearFechaHora(v.fechaCreacion))}</td>
                <td>${escapeHtml(v.pagador)}</td>
                <td>${escapeHtml(v.usuario)}</td>
                <td>${escapeHtml(v.sucursal)}</td>
                <td><span class="estado">${escapeHtml(v.estado)}</span></td>
                <td class="num">${formatoMoneda(v.subtotal)}</td>
                <td class="num">${formatoMoneda(v.descuentoTotal)}</td>
                <td class="num">${formatoMoneda(v.impuestos)}</td>
                <td class="num">${formatoMoneda(v.total)}</td>
            </tr>`)
        .join('');
    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; font-size: 11px; margin: 0; padding: 0; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2563eb; padding-bottom: 10px; margin-bottom: 18px; }
    .header h1 { margin: 0; font-size: 20px; color: #2563eb; }
    .header p { margin: 2px 0 0; color: #6b7280; font-size: 11px; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 16px; padding: 10px 14px; background: #eff6ff; border-radius: 8px; font-size: 12px; }
    .meta b { color: #1d4ed8; }
    h2 { font-size: 14px; color: #1d4ed8; margin: 20px 0 8px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #2563eb; color: #fff; text-align: left; padding: 6px 8px; font-size: 10px; }
    td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background: #f9fafb; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    td.num, th.num { text-align: right; }
    .total-row td { font-weight: bold; background: #dbeafe !important; }
    .estado { display: inline-block; padding: 1px 8px; border-radius: 10px; text-transform: capitalize; }
    .estado-completado { background: #dcfce7; color: #15803d; }
    .estado-pendiente { background: #fef9c3; color: #a16207; }
    .estado-cancelado { background: #fee2e2; color: #b91c1c; }
    .footer { margin-top: 22px; color: #9ca3af; font-size: 10px; text-align: center; }
</style>
</head>
<body>
    <div class="header">
        <div>
            <h1>Reporte de Compras ${TITULO_HUMANO[datos.frecuencia]}</h1>
            <p>Sistema de Farmacia</p>
        </div>
        <p><b>Generado:</b> ${fechaHoy()}<br><b>Usuario:</b> Administrador</p>
    </div>

    <div class="meta">
        <span>Periodo: <b>${formatearFecha(datos.fechaInicio)}</b> al <b>${formatearFecha(datos.fechaFin)}</b></span>
        <span>Compras completadas: <b>${datos.totales.cantidad}</b></span>
        <span>Total comprado: <b>${formatoMoneda(datos.totales.total)}</b></span>
    </div>

    <h2>Resumen ${TITULO_HUMANO[datos.frecuencia]}</h2>
    <table>
        <thead>
            <tr>
                <th>Periodo</th>
                <th class="num">N° Compras</th>
                <th class="num">Subtotal</th>
                <th class="num">Descuento</th>
                <th class="num">Impuestos</th>
                <th class="num">Total</th>
            </tr>
        </thead>
        <tbody>
            ${filasResumen}
            <tr class="total-row">
                <td>TOTALES</td>
                <td class="num">${datos.totales.cantidad}</td>
                <td class="num">${formatoMoneda(datos.totales.subtotal)}</td>
                <td class="num">${formatoMoneda(datos.totales.descuentoTotal)}</td>
                <td class="num">${formatoMoneda(datos.totales.impuestos)}</td>
                <td class="num">${formatoMoneda(datos.totales.total)}</td>
            </tr>
        </tbody>
    </table>

    <h2>Detalle de Compras (${datos.compras.length} registros)</h2>
    <table>
        <thead>
            <tr>
                <th>N° Factura</th>
                <th>N° Compra</th>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Usuario</th>
                <th>Sucursal</th>
                <th>Estado</th>
                <th class="num">Subtotal</th>
                <th class="num">Descuento</th>
                <th class="num">Impuestos</th>
                <th class="num">Total</th>
            </tr>
        </thead>
        <tbody>${filasDetalle}</tbody>
    </table>

    <div class="footer">Documento generado automáticamente por el sistema de farmacia.</div>
</body>
</html>`;
}
async function generarPdfCompra(datos) {
    const browser = await puppeteer_1.default.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
        const page = await browser.newPage();
        await page.setContent(generarHtmlCompra(datos), { waitUntil: 'load' });
        const pdf = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: { top: '30px', bottom: '30px', left: '25px', right: '25px' },
        });
        return Buffer.from(pdf);
    }
    finally {
        await browser.close();
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// REPORTE DE CONTROL DE VENCIMIENTOS Y ALERTA FEFO
// ═══════════════════════════════════════════════════════════════════════════
// Paleta de semáforo compartida por Excel, PDF y (equivalente en) frontend.
const COLOR_NIVEL = {
    vencido: { fondo: 'FFFCA5A5', texto: 'FF7F1D1D', borde: 'FF991B1B' },
    critico: { fondo: 'FFFECACA', texto: 'FFB91C1C', borde: 'FFDC2626' },
    advertencia: { fondo: 'FFFDE68A', texto: 'FFB45309', borde: 'FFD97706' },
    optimo: { fondo: 'FFD1FAE5', texto: 'FF047857', borde: 'FF059669' },
};
const COLOR_NIVEL_HTML = {
    vencido: { fondo: '#fca5a5', texto: '#7f1d1d' },
    critico: { fondo: '#fecaca', texto: '#b91c1c' },
    advertencia: { fondo: '#fde68a', texto: '#b45309' },
    optimo: { fondo: '#d1fae5', texto: '#047857' },
};
// Convierte los query params en el objeto de filtros del modelo.
function filtrosVencimientos(req) {
    const q = req.query;
    const numero = (valor) => {
        if (valor === undefined || valor === null || valor === '')
            return null;
        const n = Number(valor);
        return Number.isFinite(n) ? Math.trunc(n) : null;
    };
    const id = (valor) => {
        const n = numero(valor);
        return n !== null && n > 0 ? n : null;
    };
    let estados;
    if (typeof q.estados === 'string' && q.estados.trim() !== '') {
        estados = q.estados
            .split(',')
            .map((e) => e.trim().toLowerCase())
            .filter((e) => e !== '');
    }
    return {
        diasMin: numero(q.diasMin),
        diasMax: numero(q.diasMax),
        idLaboratorio: id(q.idLaboratorio),
        idTipoProducto: id(q.idTipoProducto),
        idProveedor: id(q.idProveedor),
        estados,
        busqueda: typeof q.busqueda === 'string' ? q.busqueda : null,
        soloConStock: q.soloConStock === undefined ? true : q.soloConStock !== 'false',
        limite: numero(q.limite),
    };
}
// Descripción legible de los filtros aplicados (se imprime en Excel y PDF).
function descripcionFiltros(parametros) {
    const partes = [];
    if (parametros.diasMin !== null && parametros.diasMax !== null) {
        partes.push(`Días restantes: ${parametros.diasMin} a ${parametros.diasMax}`);
    }
    else if (parametros.diasMin !== null) {
        partes.push(`Días restantes: desde ${parametros.diasMin}`);
    }
    else if (parametros.diasMax !== null) {
        partes.push(`Días restantes: hasta ${parametros.diasMax}`);
    }
    else {
        partes.push('Días restantes: todos');
    }
    partes.push(`Umbrales: crítico ≤ ${ReporteVencimientosModels_1.UMBRAL_CRITICO_DIAS} d · advertencia ≤ ${ReporteVencimientosModels_1.UMBRAL_ADVERTENCIA_DIAS} d`);
    partes.push(parametros.soloConStock ? 'Sólo lotes con stock' : 'Todos los lotes');
    if (parametros.busqueda)
        partes.push(`Búsqueda: "${parametros.busqueda}"`);
    return partes.join('  |  ');
}
// ─── Generador EXCEL del reporte de vencimientos ───────────────────────────
async function generarExcelVencimientos(datos) {
    const workbook = new exceljs_1.default.Workbook();
    workbook.creator = 'Sistema de Farmacia';
    workbook.created = new Date();
    const estiloTitulo = (hoja, rango, titulo) => {
        hoja.mergeCells(rango);
        const celda = hoja.getCell(rango.split(':')[0]);
        celda.value = titulo;
        celda.font = { bold: true, size: 16, color: { argb: 'FF1D4ED8' } };
        celda.alignment = { horizontal: 'center', vertical: 'middle' };
    };
    const estiloSubtitulo = (hoja, rango, texto) => {
        hoja.mergeCells(rango);
        const celda = hoja.getCell(rango.split(':')[0]);
        celda.value = texto;
        celda.font = { italic: true, size: 10, color: { argb: 'FF6B7280' } };
        celda.alignment = { horizontal: 'center', vertical: 'middle' };
    };
    const estiloHeader = (fila) => {
        fila.height = 22;
        fila.eachCell((celda) => {
            celda.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
            celda.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            celda.border = { bottom: { style: 'thin', color: { argb: 'FFB0B0B0' } } };
        });
    };
    // ── Hoja 1: Resumen ───────────────────────────────────────────────────
    const hojaResumen = workbook.addWorksheet('Resumen');
    hojaResumen.columns = [
        { header: 'Nivel', key: 'nivel', width: 16 },
        { header: 'Lotes', key: 'lotes', width: 10 },
        { header: 'Unidades', key: 'unidades', width: 12 },
        { header: 'Valor en riesgo', key: 'valor', width: 18 },
        { header: 'Acción operativa', key: 'accion', width: 70 },
    ];
    estiloTitulo(hojaResumen, 'A1:E1', 'Reporte de Control de Vencimientos y Alerta FEFO');
    estiloSubtitulo(hojaResumen, 'A2:E2', `Generado: ${fechaHoy()}  |  ${descripcionFiltros(datos.parametros)}`);
    // KPIs
    hojaResumen.getRow(4).values = ['Indicador', 'Valor'];
    estiloHeader(hojaResumen.getRow(4));
    const kpis = [
        ['Lotes analizados', datos.resumen.totalLotes],
        ['Unidades en stock', datos.resumen.totalUnidades],
        ['Valor total en stock (Bs)', datos.resumen.valorTotal],
        ['Valor en riesgo (vencido+crítico+advertencia) (Bs)', datos.resumen.valorEnRiesgo],
        ['Valor crítico (vencido+crítico) (Bs)', datos.resumen.valorCritico],
    ];
    kpis.forEach(([label, valor], i) => {
        const fila = hojaResumen.getRow(5 + i);
        fila.getCell(1).value = label;
        fila.getCell(2).value = valor;
        fila.getCell(1).font = { bold: true };
        fila.getCell(2).numFmt = typeof valor === 'number' ? '#,##0.00' : 'General';
        fila.getCell(2).alignment = { horizontal: 'right' };
        fila.eachCell((celda) => {
            celda.border = { bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } } };
        });
    });
    // Semáforo por nivel
    const inicioSem = 12;
    hojaResumen.mergeCells(`A${inicioSem}:E${inicioSem}`);
    const tituloSem = hojaResumen.getCell(`A${inicioSem}`);
    tituloSem.value = 'Semáforo de vencimiento';
    tituloSem.font = { bold: true, size: 13, color: { argb: 'FF1D4ED8' } };
    hojaResumen.getRow(inicioSem + 1).values = ['Nivel', 'Lotes', 'Unidades', 'Valor en riesgo', 'Acción operativa'];
    estiloHeader(hojaResumen.getRow(inicioSem + 1));
    datos.resumen.porNivel.forEach((n, i) => {
        const fila = hojaResumen.getRow(inicioSem + 2 + i);
        fila.getCell(1).value = n.etiqueta;
        fila.getCell(2).value = n.lotes;
        fila.getCell(3).value = n.unidades;
        fila.getCell(4).value = n.valor;
        fila.getCell(5).value = n.accion;
        fila.getCell(4).numFmt = '#,##0.00';
        fila.getCell(4).alignment = { horizontal: 'right' };
        fila.getCell(2).alignment = { horizontal: 'center' };
        fila.getCell(3).alignment = { horizontal: 'right' };
        const color = COLOR_NIVEL[n.nivel];
        fila.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color.fondo } };
        fila.getCell(1).font = { bold: true, color: { argb: color.texto } };
        fila.getCell(1).alignment = { horizontal: 'center' };
        fila.eachCell((celda) => {
            celda.border = { bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } } };
        });
    });
    // Top laboratorios
    const inicioLab = inicioSem + 2 + datos.resumen.porNivel.length + 2;
    hojaResumen.mergeCells(`A${inicioLab}:E${inicioLab}`);
    const tituloLab = hojaResumen.getCell(`A${inicioLab}`);
    tituloLab.value = 'Valor en riesgo por laboratorio (Top 10)';
    tituloLab.font = { bold: true, size: 13, color: { argb: 'FF1D4ED8' } };
    hojaResumen.getRow(inicioLab + 1).values = ['Laboratorio', 'Lotes', 'Unidades', 'Valor en riesgo', ''];
    estiloHeader(hojaResumen.getRow(inicioLab + 1));
    datos.resumen.porLaboratorio.forEach((lab, i) => {
        const fila = hojaResumen.getRow(inicioLab + 2 + i);
        fila.getCell(1).value = lab.laboratorio;
        fila.getCell(2).value = lab.lotes;
        fila.getCell(3).value = lab.unidades;
        fila.getCell(4).value = lab.valor;
        fila.getCell(4).numFmt = '#,##0.00';
        fila.getCell(4).alignment = { horizontal: 'right' };
        fila.eachCell((celda) => {
            celda.border = { bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } } };
        });
    });
    // ── Hoja 2: Detalle de vencimientos ───────────────────────────────────
    const hojaDetalle = workbook.addWorksheet('Detalle de Vencimientos');
    hojaDetalle.columns = [
        { header: 'Código de lote', key: 'codigo', width: 14 },
        { header: 'N° lote', key: 'numeroLote', width: 14 },
        { header: 'Producto (nombre comercial)', key: 'nombreComercial', width: 28 },
        { header: 'Nombre genérico', key: 'nombreGenerico', width: 22 },
        { header: 'Concentración', key: 'concentracion', width: 15 },
        { header: 'Forma farmacéutica', key: 'presentacion', width: 22 },
        { header: 'Laboratorio', key: 'laboratorio', width: 24 },
        { header: 'Tipo de producto', key: 'tipoProducto', width: 18 },
        { header: 'Proveedor', key: 'proveedor', width: 26 },
        { header: 'Stock', key: 'stock', width: 9 },
        { header: 'Fecha vencimiento', key: 'fechaVencimiento', width: 17 },
        { header: 'Días restantes', key: 'diasRestantes', width: 13 },
        { header: 'Nivel', key: 'nivel', width: 13 },
        { header: 'Costo unitario', key: 'precioCompra', width: 13 },
        { header: 'Valor en riesgo', key: 'valorEnRiesgo', width: 15 },
        { header: 'Estado del lote', key: 'estadoLoteLabel', width: 14 },
        { header: '¿Cumple FEFO?', key: 'esFEFO', width: 14 },
        { header: 'Acción sugerida', key: 'accion', width: 62 },
    ];
    estiloTitulo(hojaDetalle, 'A1:R1', 'Detalle de Control de Vencimientos (orden cronológico)');
    estiloSubtitulo(hojaDetalle, 'A2:R2', `Generado: ${fechaHoy()}  |  ${descripcionFiltros(datos.parametros)}`);
    estiloHeader(hojaDetalle.getRow(4));
    hojaDetalle.views = [{ state: 'frozen', ySplit: 4 }];
    datos.lotes.forEach((l, i) => {
        const fila = hojaDetalle.getRow(5 + i);
        fila.values = [
            l.codigo,
            l.numeroLote,
            l.producto.nombreComercial,
            l.producto.nombreGenerico,
            l.producto.concentracion,
            l.producto.presentacion,
            l.laboratorio,
            l.tipoProducto,
            l.proveedor,
            l.stock,
            l.fechaVencimiento,
            l.diasRestantes,
            l.nivelLabel,
            l.precioCompra,
            l.valorEnRiesgo,
            l.estadoLoteLabel,
            l.esFEFO ? 'SÍ' : 'NO',
            l.accion,
        ];
        fila.eachCell((celda, numero) => {
            celda.border = { bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } } };
            if ([10, 12, 14, 15].includes(numero)) {
                celda.alignment = { horizontal: 'right' };
                if (typeof celda.value === 'number')
                    celda.numFmt = '#,##0.00';
            }
        });
        // Semáforo: se colorea la celda de nivel y la de días restantes.
        const color = COLOR_NIVEL[l.nivel];
        [12, 13].forEach((numero) => {
            const celda = fila.getCell(numero);
            celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color.fondo } };
            celda.font = { bold: true, color: { argb: color.texto } };
            celda.alignment = { horizontal: 'center' };
        });
        fila.getCell(13).numFmt = 'General';
        // Marca visual del incumplimiento FEFO.
        if (!l.esFEFO) {
            const celdaFefo = fila.getCell(17);
            celdaFefo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE4E6' } };
            celdaFefo.font = { bold: true, color: { argb: 'FFBE123C' } };
            celdaFefo.alignment = { horizontal: 'center' };
        }
    });
    hojaDetalle.autoFilter = {
        from: { row: 4, column: 1 },
        to: { row: 4 + datos.lotes.length, column: 18 },
    };
    // ── Hoja 3: Control FEFO ──────────────────────────────────────────────
    const hojaFEFO = workbook.addWorksheet('Control FEFO');
    hojaFEFO.columns = [
        { header: 'Producto', key: 'producto', width: 34 },
        { header: 'Lote FEFO', key: 'numeroLoteFEFO', width: 16 },
        { header: 'Fecha vencimiento FEFO', key: 'fechaVencimientoFEFO', width: 20 },
        { header: 'Días restantes FEFO', key: 'diasRestantesFEFO', width: 17 },
        { header: 'Nivel FEFO', key: 'nivelFEFO', width: 14 },
        { header: 'Lotes del producto', key: 'totalLotes', width: 17 },
        { header: 'Stock en lotes posteriores', key: 'stockLotesPosteriores', width: 22 },
        { header: 'Valor en lotes posteriores (Bs)', key: 'valorLotesPosteriores', width: 24 },
    ];
    estiloTitulo(hojaFEFO, 'A1:H1', 'Control FEFO por producto (lote que debe salir primero)');
    estiloSubtitulo(hojaFEFO, 'A2:H2', `Generado: ${fechaHoy()}  |  Regla FEFO: First-Expired, First-Out`);
    estiloHeader(hojaFEFO.getRow(4));
    datos.resumen.controlFEFO.forEach((c, i) => {
        const fila = hojaFEFO.getRow(5 + i);
        fila.values = [
            c.producto,
            c.numeroLoteFEFO,
            c.fechaVencimientoFEFO,
            c.diasRestantesFEFO,
            ReporteVencimientosModels_1.ETIQUETA_NIVEL[c.nivelFEFO] ?? c.nivelFEFO,
            c.totalLotes,
            c.stockLotesPosteriores,
            c.valorLotesPosteriores,
        ];
        fila.eachCell((celda, numero) => {
            celda.border = { bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } } };
            if ([4, 6, 7, 8].includes(numero))
                celda.alignment = { horizontal: 'right' };
            if (numero === 8 && typeof celda.value === 'number')
                celda.numFmt = '#,##0.00';
        });
        const color = COLOR_NIVEL[c.nivelFEFO];
        const celdaNivel = fila.getCell(5);
        celdaNivel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color.fondo } };
        celdaNivel.font = { bold: true, color: { argb: color.texto } };
        celdaNivel.alignment = { horizontal: 'center' };
    });
    return workbook.xlsx.writeBuffer();
}
// ─── Generador HTML + PDF del reporte de vencimientos ──────────────────────
function generarHtmlVencimientos(datos) {
    const filasDetalle = datos.lotes
        .map((l) => {
        const color = COLOR_NIVEL_HTML[l.nivel];
        const dias = l.diasRestantes < 0 ? `${l.diasRestantes} d (vencido)` : `${l.diasRestantes} d`;
        const producto = [
            escapeHtml(l.producto.nombreComercial),
            l.producto.concentracion ? escapeHtml(l.producto.concentracion) : '',
            l.producto.presentacion ? escapeHtml(l.producto.presentacion) : '',
        ]
            .filter(Boolean)
            .join(' · ');
        return `
            <tr>
                <td>${escapeHtml(l.codigo)}<br><small>${escapeHtml(l.numeroLote)}</small></td>
                <td>${producto}<br><small>${escapeHtml(l.laboratorio ?? '')}</small></td>
                <td class="num">${l.stock}</td>
                <td>${escapeHtml(l.fechaVencimiento)}</td>
                <td class="num" style="background:${color.fondo}; color:${color.texto}; font-weight:bold;">${dias}</td>
                <td style="background:${color.fondo}; color:${color.texto}; font-weight:bold; text-align:center;">${escapeHtml(l.nivelLabel)}</td>
                <td class="num">${formatoMoneda(l.valorEnRiesgo)}</td>
                <td style="text-align:center; ${l.esFEFO ? 'color:#047857; font-weight:bold;' : 'color:#be123c; font-weight:bold;'}">${l.esFEFO ? 'SÍ' : 'NO'}</td>
                <td><small>${escapeHtml(l.accion)}</small></td>
            </tr>`;
    })
        .join('');
    const filasNivel = datos.resumen.porNivel
        .map((n) => {
        const color = COLOR_NIVEL_HTML[n.nivel];
        return `
            <tr>
                <td style="background:${color.fondo}; color:${color.texto}; font-weight:bold; text-align:center;">${escapeHtml(n.etiqueta)}</td>
                <td class="num">${n.lotes}</td>
                <td class="num">${n.unidades}</td>
                <td class="num">${formatoMoneda(n.valor)}</td>
                <td><small>${escapeHtml(n.accion)}</small></td>
            </tr>`;
    })
        .join('');
    const filasLaboratorio = datos.resumen.porLaboratorio
        .map((lab) => `
            <tr>
                <td>${escapeHtml(lab.laboratorio)}</td>
                <td class="num">${lab.lotes}</td>
                <td class="num">${lab.unidades}</td>
                <td class="num">${formatoMoneda(lab.valor)}</td>
            </tr>`)
        .join('');
    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; font-size: 10.5px; margin: 0; padding: 0; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2563eb; padding-bottom: 10px; margin-bottom: 16px; }
    .header h1 { margin: 0; font-size: 19px; color: #1d4ed8; }
    .header p { margin: 2px 0 0; color: #6b7280; font-size: 11px; }
    .meta { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 14px; padding: 10px 14px; background: #eff6ff; border-radius: 8px; font-size: 11px; }
    .meta b { color: #1d4ed8; }
    h2 { font-size: 13px; color: #1d4ed8; margin: 18px 0 6px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #2563eb; color: #fff; text-align: left; padding: 5px 7px; font-size: 9.5px; }
    td { padding: 4px 7px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
    tr:nth-child(even) td { background: #f9fafb; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    td.num, th.num { text-align: right; }
    small { color: #6b7280; }
    .footer { margin-top: 20px; color: #9ca3af; font-size: 9.5px; text-align: center; }
</style>
</head>
<body>
    <div class="header">
        <div>
            <h1>Reporte de Control de Vencimientos y Alerta FEFO</h1>
            <p>Sistema de Farmacia · First-Expired, First-Out</p>
        </div>
        <p><b>Generado:</b> ${fechaHoy()}<br><b>Usuario:</b> Administrador</p>
    </div>

    <div class="meta">
        <span>Lotes analizados: <b>${datos.resumen.totalLotes}</b></span>
        <span>Unidades: <b>${datos.resumen.totalUnidades}</b></span>
        <span>Valor en riesgo: <b>${formatoMoneda(datos.resumen.valorEnRiesgo)} Bs</b></span>
        <span>Valor crítico: <b>${formatoMoneda(datos.resumen.valorCritico)} Bs</b></span>
        <span>${escapeHtml(descripcionFiltros(datos.parametros))}</span>
    </div>

    <h2>Semáforo de vencimiento</h2>
    <table>
        <thead>
            <tr>
                <th style="text-align:center;">Nivel</th>
                <th class="num">Lotes</th>
                <th class="num">Unidades</th>
                <th class="num">Valor en riesgo (Bs)</th>
                <th>Acción operativa</th>
            </tr>
        </thead>
        <tbody>${filasNivel}</tbody>
    </table>

    <h2>Valor en riesgo por laboratorio (Top 10)</h2>
    <table>
        <thead>
            <tr>
                <th>Laboratorio</th>
                <th class="num">Lotes</th>
                <th class="num">Unidades</th>
                <th class="num">Valor en riesgo (Bs)</th>
            </tr>
        </thead>
        <tbody>${filasLaboratorio}</tbody>
    </table>

    <h2>Detalle de vencimientos (${datos.lotes.length} registros, orden cronológico)</h2>
    <table>
        <thead>
            <tr>
                <th>Lote</th>
                <th>Producto</th>
                <th class="num">Stock</th>
                <th>Vencimiento</th>
                <th class="num">Días</th>
                <th style="text-align:center;">Nivel</th>
                <th class="num">Valor en riesgo (Bs)</th>
                <th style="text-align:center;">FEFO</th>
                <th>Acción sugerida</th>
            </tr>
        </thead>
        <tbody>${filasDetalle}</tbody>
    </table>

    <div class="footer">Documento generado automáticamente por el sistema de farmacia · Regla FEFO: despachar siempre el lote con vencimiento más próximo.</div>
</body>
</html>`;
}
async function generarPdfVencimientos(datos) {
    const browser = await puppeteer_1.default.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
        const page = await browser.newPage();
        await page.setContent(generarHtmlVencimientos(datos), { waitUntil: 'load' });
        const pdf = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: { top: '30px', bottom: '30px', left: '25px', right: '25px' },
        });
        return Buffer.from(pdf);
    }
    finally {
        await browser.close();
    }
}
// ─── Generador EXCEL del reporte de inventario ───────────────────────────────
async function generarExcelInventario(datos) {
    const workbook = new exceljs_1.default.Workbook();
    workbook.creator = 'Sistema de Farmacia';
    workbook.created = new Date();
    const hojaResumen = workbook.addWorksheet('Resumen');
    hojaResumen.columns = [
        { header: 'Tipo de producto / Laboratorio', key: 'nombre', width: 30 },
        { header: 'Lotes', key: 'lotes', width: 10 },
        { header: 'Unidades', key: 'unidades', width: 12 },
        { header: 'Valor (Bs)', key: 'valor', width: 16 },
    ];
    hojaResumen.mergeCells('A1:D1');
    hojaResumen.getCell('A1').value = 'Reporte de Inventario';
    hojaResumen.getCell('A1').font = { bold: true, size: 16 };
    hojaResumen.getCell('A1').alignment = { horizontal: 'center' };
    const hojaDetalle = workbook.addWorksheet('Detalle de Inventario');
    hojaDetalle.columns = [
        { header: 'Código', key: 'codigo', width: 14 },
        { header: 'N° Lote', key: 'numeroLote', width: 14 },
        { header: 'Producto', key: 'producto', width: 28 },
        { header: 'Laboratorio', key: 'laboratorio', width: 24 },
        { header: 'Tipo de producto', key: 'tipoProducto', width: 18 },
        { header: 'Stock', key: 'stock', width: 9 },
        { header: 'Costo unitario', key: 'costoUnitario', width: 13 },
        { header: 'Subtotal', key: 'subtotal', width: 13 },
        { header: 'Vencimiento', key: 'fechaVencimiento', width: 14 },
    ];
    hojaDetalle.mergeCells('A1:I1');
    hojaDetalle.getCell('A1').value = 'Detalle de Inventario';
    hojaDetalle.getCell('A1').font = { bold: true, size: 16 };
    hojaDetalle.getCell('A1').alignment = { horizontal: 'center' };
    const headerRow = hojaDetalle.getRow(3);
    headerRow.height = 20;
    headerRow.eachCell((c) => {
        c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    datos.lotes.forEach((l, i) => {
        const fila = hojaDetalle.getRow(4 + i);
        fila.values = [
            l.codigo,
            l.numeroLote,
            l.producto?.nombreComercial ?? l.producto?.nombreGenerico ?? '',
            l.laboratorio,
            l.tipoProducto,
            l.stock,
            l.costoUnitario,
            l.subtotal,
            l.fechaVencimiento,
        ];
    });
    return workbook.xlsx.writeBuffer();
}
function generarHtmlInventario(datos) {
    const filas = datos.lotes.map((l) => `
        <tr>
            <td>${escapeHtml(l.codigo)}</td>
            <td>${escapeHtml(l.numeroLote)}</td>
            <td>${escapeHtml(l.producto?.nombreComercial ?? '')}</td>
            <td>${escapeHtml(l.laboratorio ?? '')}</td>
            <td>${escapeHtml(l.tipoProducto ?? '')}</td>
            <td class="num">${l.stock}</td>
            <td class="num">${formatoMoneda(l.costoUnitario)}</td>
            <td class="num">${formatoMoneda(l.subtotal)}</td>
            <td>${escapeHtml(l.fechaVencimiento ?? '')}</td>
        </tr>`).join('');
    return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><style>
        *{box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;color:#1f2937;font-size:11px;margin:0;padding:0}
        .header{border-bottom:3px solid #2563eb;padding-bottom:10px;margin-bottom:16px}
        .header h1{margin:0;font-size:19px;color:#1d4ed8}
        table{width:100%;border-collapse:collapse}
        th{background:#2563eb;color:#fff;text-align:left;padding:5px 7px;font-size:9.5px}
        td{padding:4px 7px;border-bottom:1px solid #e5e7eb}
        tr:nth-child(even) td{background:#f9fafb}
        .num{text-align:right;font-variant-numeric:tabular-nums}
        .footer{margin-top:20px;color:#9ca3af;font-size:9.5px;text-align:center}
    </style></head><body>
        <div class="header"><h1>Reporte de Inventario</h1><p>Sistema de Farmacia</p></div>
        <table><thead><tr><th>Código</th><th>N° Lote</th><th>Producto</th><th>Laboratorio</th><th>Tipo de producto</th><th class="num">Stock</th><th class="num">Costo</th><th class="num">Subtotal</th><th>Vencimiento</th></tr></thead><tbody>${filas}</tbody></table>
        <div class="footer">Documento generado automáticamente por el sistema de farmacia.</div>
    </body></html>`;
}
async function generarPdfInventario(datos) {
    const browser = await puppeteer_1.default.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
        const page = await browser.newPage();
        await page.setContent(generarHtmlInventario(datos), { waitUntil: 'load' });
        const pdf = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: { top: '30px', bottom: '30px', left: '25px', right: '25px' },
        });
        return Buffer.from(pdf);
    }
    finally {
        await browser.close();
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// REPORTE DE DEVOLUCIONES DE CLIENTES Y ANÁLISIS DE CAUSAS
// ═══════════════════════════════════════════════════════════════════════════
function fechaQuery(valor) {
    return typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor.trim()) ? valor.trim() : null;
}
function filtrosDevoluciones(req) {
    const q = req.query;
    const numero = (valor) => {
        if (valor === undefined || valor === null || valor === '')
            return null;
        const n = Number(valor);
        return Number.isFinite(n) ? Math.trunc(n) : null;
    };
    const id = (valor) => {
        const n = numero(valor);
        return n !== null && n > 0 ? n : null;
    };
    const texto = (valor) => typeof valor === 'string' && valor.trim() !== '' ? valor.trim() : null;
    return {
        fechaInicio: fechaQuery(q.fechaInicio),
        fechaFin: fechaQuery(q.fechaFin),
        motivo: texto(q.motivo),
        estado: texto(q.estado),
        idUsuario: id(q.idUsuario),
        idCliente: id(q.idCliente),
        idLaboratorio: id(q.idLaboratorio),
        idTipoProducto: id(q.idTipoProducto),
        producto: texto(q.producto),
        cliente: texto(q.cliente),
        busqueda: texto(q.busqueda),
    };
}
function descripcionFiltrosDevoluciones(parametros) {
    const partes = [];
    partes.push(parametros.fechaInicio || parametros.fechaFin
        ? `Periodo: ${parametros.fechaInicio ? formatearFecha(parametros.fechaInicio) : 'inicio'} al ${parametros.fechaFin ? formatearFecha(parametros.fechaFin) : 'hoy'}`
        : 'Periodo: todos los registros');
    if (parametros.motivo)
        partes.push(`Motivo: ${ReporteDevolucionesModels_1.MOTIVOS_DEVOLUCION[parametros.motivo] ?? parametros.motivo}`);
    if (parametros.estado)
        partes.push(`Estado: ${ReporteDevolucionesModels_1.ESTADOS_DEVOLUCION[parametros.estado] ?? parametros.estado}`);
    if (parametros.cliente)
        partes.push(`Cliente: "${parametros.cliente}"`);
    if (parametros.producto)
        partes.push(`Producto: "${parametros.producto}"`);
    if (parametros.busqueda)
        partes.push(`Búsqueda: "${parametros.busqueda}"`);
    return partes.join('  |  ');
}
const COLOR_DESTINO = {
    reingreso_stock: { fondo: 'FFD1FAE5', texto: 'FF047857' },
    cuarentena: { fondo: 'FFFEF3C7', texto: 'FFB45309' },
    merma: { fondo: 'FFFEE2E2', texto: 'FFB91C1C' },
    sin_definir: { fondo: 'FFF3F4F6', texto: 'FF6B7280' },
};
// ─── Generador EXCEL del reporte de devoluciones ───────────────────────────
async function generarExcelDevoluciones(datos) {
    const workbook = new exceljs_1.default.Workbook();
    workbook.creator = 'Sistema de Farmacia';
    workbook.created = new Date();
    const estiloTitulo = (hoja, rango, titulo) => {
        hoja.mergeCells(rango);
        const celda = hoja.getCell(rango.split(':')[0]);
        celda.value = titulo;
        celda.font = { bold: true, size: 16, color: { argb: 'FF1D4ED8' } };
        celda.alignment = { horizontal: 'center', vertical: 'middle' };
    };
    const estiloSubtitulo = (hoja, rango, texto) => {
        hoja.mergeCells(rango);
        const celda = hoja.getCell(rango.split(':')[0]);
        celda.value = texto;
        celda.font = { italic: true, size: 10, color: { argb: 'FF6B7280' } };
        celda.alignment = { horizontal: 'center', vertical: 'middle' };
    };
    const estiloHeader = (fila) => {
        fila.height = 22;
        fila.eachCell((celda) => {
            celda.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
            celda.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            celda.border = { bottom: { style: 'thin', color: { argb: 'FFB0B0B0' } } };
        });
    };
    const bordeFila = (fila) => {
        fila.eachCell((celda) => {
            celda.border = { bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } } };
        });
    };
    // ── Hoja 1: Resumen ───────────────────────────────────────────────────
    const hojaResumen = workbook.addWorksheet('Resumen');
    hojaResumen.columns = [
        { header: 'Indicador', key: 'indicador', width: 46 },
        { header: 'Valor', key: 'valor', width: 20 },
    ];
    estiloTitulo(hojaResumen, 'A1:B1', 'Reporte de Devoluciones de Clientes y Análisis de Causas');
    estiloSubtitulo(hojaResumen, 'A2:B2', `Generado: ${fechaHoy()}  |  ${descripcionFiltrosDevoluciones(datos.parametros)}`);
    hojaResumen.getRow(4).values = ['Indicador', 'Valor'];
    estiloHeader(hojaResumen.getRow(4));
    const kpis = [
        ['Total de devoluciones', datos.resumen.totalDevoluciones],
        ['Líneas de detalle', datos.resumen.totalLineas],
        ['Unidades devueltas', datos.resumen.totalUnidades],
        ['Monto total devuelto (Bs)', datos.resumen.montoTotalDevuelto],
        ['Monto promedio por devolución (Bs)', datos.resumen.montoPromedio],
    ];
    kpis.forEach(([label, valor], i) => {
        const fila = hojaResumen.getRow(5 + i);
        fila.getCell(1).value = label;
        fila.getCell(2).value = valor;
        fila.getCell(1).font = { bold: true };
        fila.getCell(2).numFmt = typeof valor === 'number' ? '#,##0.00' : 'General';
        fila.getCell(2).alignment = { horizontal: 'right' };
        bordeFila(fila);
    });
    // Sección genérica de tabla resumen
    let cursor = 12;
    const seccion = (titulo, encabezados, filas, formatos = []) => {
        hojaResumen.mergeCells(`A${cursor}:D${cursor}`);
        const celda = hojaResumen.getCell(`A${cursor}`);
        celda.value = titulo;
        celda.font = { bold: true, size: 13, color: { argb: 'FF1D4ED8' } };
        cursor += 1;
        const header = hojaResumen.getRow(cursor);
        header.values = encabezados;
        estiloHeader(header);
        cursor += 1;
        filas.forEach((valores) => {
            const fila = hojaResumen.getRow(cursor);
            valores.forEach((valor, idx) => {
                const c = fila.getCell(idx + 1);
                c.value = valor;
                if (formatos.includes(idx + 1) && typeof valor === 'number')
                    c.numFmt = '#,##0.00';
                if (idx >= 1)
                    c.alignment = { horizontal: 'right' };
            });
            bordeFila(fila);
            cursor += 1;
        });
        cursor += 1;
    };
    seccion('Devoluciones por motivo', ['Motivo', 'Devoluciones', 'Unidades', 'Monto (Bs)'], datos.resumen.porMotivo.map((m) => [m.etiqueta, m.devoluciones, m.unidades, m.monto]), [4]);
    seccion('Devoluciones por destino', ['Destino', 'Devoluciones', 'Unidades', 'Monto (Bs)'], datos.resumen.porDestino.map((d) => [d.etiqueta, d.devoluciones, d.unidades, d.monto]), [4]);
    seccion('Top productos devueltos', ['Producto', 'Unidades', 'Monto (Bs)'], datos.resumen.topProductos.map((p) => [p.producto, p.unidades, p.monto]), [3]);
    seccion('Top usuarios / cajeros', ['Usuario', 'Devoluciones', 'Unidades', 'Monto (Bs)'], datos.resumen.topUsuarios.map((u) => [u.usuario, u.devoluciones, u.unidades, u.monto]), [4]);
    seccion('Devoluciones por laboratorio', ['Laboratorio', 'Unidades', 'Monto (Bs)'], datos.resumen.porLaboratorio.map((l) => [l.laboratorio, l.unidades, l.monto]), [3]);
    // ── Hoja 2: Detalle ───────────────────────────────────────────────────
    const hojaDetalle = workbook.addWorksheet('Detalle de Devoluciones');
    hojaDetalle.columns = [
        { header: 'N° devolución', key: 'numeroDevolucion', width: 15 },
        { header: 'Fecha', key: 'fechaCreacion', width: 18 },
        { header: 'N° venta', key: 'idVenta', width: 10 },
        { header: 'N° factura', key: 'numeroFactura', width: 14 },
        { header: 'Cliente', key: 'cliente', width: 28 },
        { header: 'CI / NIT', key: 'clienteCi', width: 14 },
        { header: 'Producto', key: 'nombreComercial', width: 28 },
        { header: 'Genérico', key: 'nombreGenerico', width: 22 },
        { header: 'Concentración', key: 'concentracion', width: 15 },
        { header: 'Laboratorio', key: 'laboratorio', width: 22 },
        { header: 'Tipo de producto', key: 'tipoProducto', width: 18 },
        { header: 'Lote', key: 'numeroLote', width: 14 },
        { header: 'Vencimiento', key: 'fechaVencimiento', width: 14 },
        { header: 'Cantidad', key: 'cantidad', width: 10 },
        { header: 'Motivo', key: 'motivoLabel', width: 22 },
        { header: 'Destino', key: 'destinoLabel', width: 18 },
        { header: 'Monto devuelto (Bs)', key: 'montoDevuelto', width: 17 },
        { header: 'Usuario', key: 'usuario', width: 24 },
        { header: 'Cajero venta', key: 'cajero', width: 24 },
        { header: 'Estado', key: 'estadoLabel', width: 13 },
    ];
    estiloTitulo(hojaDetalle, 'A1:T1', 'Detalle de Devoluciones de Clientes');
    estiloSubtitulo(hojaDetalle, 'A2:T2', `Generado: ${fechaHoy()}  |  ${descripcionFiltrosDevoluciones(datos.parametros)}`);
    estiloHeader(hojaDetalle.getRow(4));
    hojaDetalle.views = [{ state: 'frozen', ySplit: 4 }];
    datos.detalles.forEach((d, i) => {
        const fila = hojaDetalle.getRow(5 + i);
        fila.values = [
            d.numeroDevolucion,
            formatearFechaHora(d.fechaCreacion),
            d.idVenta,
            d.numeroFactura ?? '',
            d.cliente,
            d.clienteCi ?? '',
            d.nombreComercial,
            d.nombreGenerico ?? '',
            d.concentracion ?? '',
            d.laboratorio,
            d.tipoProducto ?? '',
            d.numeroLote,
            d.fechaVencimiento,
            d.cantidad,
            d.motivoLabel,
            d.destinoLabel,
            d.montoDevuelto,
            d.usuario,
            d.cajero ?? '',
            d.estadoLabel,
        ];
        bordeFila(fila);
        [3, 14, 17].forEach((col) => { fila.getCell(col).alignment = { horizontal: 'right' }; });
        fila.getCell(17).numFmt = '#,##0.00';
        const color = COLOR_DESTINO[d.destino] ?? COLOR_DESTINO.sin_definir;
        const celdaDestino = fila.getCell(16);
        celdaDestino.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color.fondo } };
        celdaDestino.font = { bold: true, color: { argb: color.texto } };
    });
    hojaDetalle.autoFilter = {
        from: { row: 4, column: 1 },
        to: { row: 4 + datos.detalles.length, column: 20 },
    };
    return workbook.xlsx.writeBuffer();
}
// ─── Generador HTML + PDF del reporte de devoluciones ──────────────────────
function generarHtmlDevoluciones(datos) {
    const colorDestinoHtml = {
        reingreso_stock: { fondo: '#d1fae5', texto: '#047857' },
        cuarentena: { fondo: '#fef3c7', texto: '#b45309' },
        merma: { fondo: '#fee2e2', texto: '#b91c1c' },
        sin_definir: { fondo: '#f3f4f6', texto: '#6b7280' },
    };
    const filasMotivo = datos.resumen.porMotivo
        .map((m) => `
            <tr>
                <td>${escapeHtml(m.etiqueta)}</td>
                <td class="num">${m.devoluciones}</td>
                <td class="num">${m.unidades}</td>
                <td class="num">${formatoMoneda(m.monto)}</td>
            </tr>`)
        .join('');
    const filasDestino = datos.resumen.porDestino
        .map((d) => {
        const c = colorDestinoHtml[d.destino] ?? colorDestinoHtml.sin_definir;
        return `
            <tr>
                <td style="background:${c.fondo}; color:${c.texto}; font-weight:bold;">${escapeHtml(d.etiqueta)}</td>
                <td class="num">${d.devoluciones}</td>
                <td class="num">${d.unidades}</td>
                <td class="num">${formatoMoneda(d.monto)}</td>
            </tr>`;
    })
        .join('');
    const filasProducto = datos.resumen.topProductos
        .map((p) => `
            <tr>
                <td>${escapeHtml(p.producto)}</td>
                <td class="num">${p.unidades}</td>
                <td class="num">${formatoMoneda(p.monto)}</td>
            </tr>`)
        .join('');
    const filasUsuario = datos.resumen.topUsuarios
        .map((u) => `
            <tr>
                <td>${escapeHtml(u.usuario)}</td>
                <td class="num">${u.devoluciones}</td>
                <td class="num">${u.unidades}</td>
                <td class="num">${formatoMoneda(u.monto)}</td>
            </tr>`)
        .join('');
    const filasDetalle = datos.detalles
        .map((d) => {
        const c = colorDestinoHtml[d.destino] ?? colorDestinoHtml.sin_definir;
        return `
            <tr>
                <td>${escapeHtml(d.numeroDevolucion)}<br><small>${escapeHtml(formatearFechaHora(d.fechaCreacion))}</small></td>
                <td>${d.idVenta}${d.numeroFactura ? `<br><small>${escapeHtml(d.numeroFactura)}</small>` : ''}</td>
                <td>${escapeHtml(d.cliente)}<br><small>${escapeHtml(d.clienteCi ?? '')}</small></td>
                <td>${escapeHtml(d.nombreComercial)}<br><small>${escapeHtml(d.laboratorio ?? '')}</small></td>
                <td>${escapeHtml(d.numeroLote)}<br><small>Vence ${escapeHtml(d.fechaVencimiento)}</small></td>
                <td class="num">${d.cantidad}</td>
                <td>${escapeHtml(d.motivoLabel)}</td>
                <td style="background:${c.fondo}; color:${c.texto}; font-weight:bold; text-align:center;">${escapeHtml(d.destinoLabel)}</td>
                <td class="num">${formatoMoneda(d.montoDevuelto)}</td>
                <td>${escapeHtml(d.usuario)}<br><small>${escapeHtml(d.cajero ?? '')}</small></td>
            </tr>`;
    })
        .join('');
    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; font-size: 10.5px; margin: 0; padding: 0; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2563eb; padding-bottom: 10px; margin-bottom: 16px; }
    .header h1 { margin: 0; font-size: 19px; color: #1d4ed8; }
    .header p { margin: 2px 0 0; color: #6b7280; font-size: 11px; }
    .meta { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 14px; padding: 10px 14px; background: #eff6ff; border-radius: 8px; font-size: 11px; }
    .meta b { color: #1d4ed8; }
    h2 { font-size: 13px; color: #1d4ed8; margin: 18px 0 6px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #2563eb; color: #fff; text-align: left; padding: 5px 7px; font-size: 9.5px; }
    td { padding: 4px 7px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
    tr:nth-child(even) td { background: #f9fafb; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    td.num, th.num { text-align: right; }
    small { color: #6b7280; }
    .grid { display: flex; gap: 16px; }
    .grid > div { flex: 1; }
    .footer { margin-top: 20px; color: #9ca3af; font-size: 9.5px; text-align: center; }
</style>
</head>
<body>
    <div class="header">
        <div>
            <h1>Reporte de Devoluciones de Clientes y Análisis de Causas</h1>
            <p>Sistema de Farmacia</p>
        </div>
        <p><b>Generado:</b> ${fechaHoy()}<br><b>Usuario:</b> Administrador</p>
    </div>

    <div class="meta">
        <span>Devoluciones: <b>${datos.resumen.totalDevoluciones}</b></span>
        <span>Unidades: <b>${datos.resumen.totalUnidades}</b></span>
        <span>Monto devuelto: <b>${formatoMoneda(datos.resumen.montoTotalDevuelto)} Bs</b></span>
        <span>Promedio: <b>${formatoMoneda(datos.resumen.montoPromedio)} Bs</b></span>
        <span>${escapeHtml(descripcionFiltrosDevoluciones(datos.parametros))}</span>
    </div>

    <div class="grid">
        <div>
            <h2>Devoluciones por motivo</h2>
            <table><thead><tr><th>Motivo</th><th class="num">Devol.</th><th class="num">Unid.</th><th class="num">Monto (Bs)</th></tr></thead><tbody>${filasMotivo}</tbody></table>
        </div>
        <div>
            <h2>Devoluciones por destino</h2>
            <table><thead><tr><th>Destino</th><th class="num">Devol.</th><th class="num">Unid.</th><th class="num">Monto (Bs)</th></tr></thead><tbody>${filasDestino}</tbody></table>
        </div>
    </div>

    <div class="grid">
        <div>
            <h2>Top productos devueltos</h2>
            <table><thead><tr><th>Producto</th><th class="num">Unid.</th><th class="num">Monto (Bs)</th></tr></thead><tbody>${filasProducto}</tbody></table>
        </div>
        <div>
            <h2>Top usuarios / cajeros</h2>
            <table><thead><tr><th>Usuario</th><th class="num">Devol.</th><th class="num">Unid.</th><th class="num">Monto (Bs)</th></tr></thead><tbody>${filasUsuario}</tbody></table>
        </div>
    </div>

    <h2>Detalle de devoluciones (${datos.detalles.length} líneas)</h2>
    <table>
        <thead>
            <tr>
                <th>Devolución</th>
                <th>Venta / Factura</th>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Lote / Vence</th>
                <th class="num">Cant.</th>
                <th>Motivo</th>
                <th style="text-align:center;">Destino</th>
                <th class="num">Monto (Bs)</th>
                <th>Usuario / Cajero</th>
            </tr>
        </thead>
        <tbody>${filasDetalle}</tbody>
    </table>

    <div class="footer">Documento generado automáticamente por el sistema de farmacia.</div>
</body>
</html>`;
}
async function generarPdfDevoluciones(datos) {
    const browser = await puppeteer_1.default.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
        const page = await browser.newPage();
        await page.setContent(generarHtmlDevoluciones(datos), { waitUntil: 'load' });
        const pdf = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: { top: '30px', bottom: '30px', left: '25px', right: '25px' },
        });
        return Buffer.from(pdf);
    }
    finally {
        await browser.close();
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// REPORTE DE DEVOLUCIONES A PROVEEDORES Y RECUPERACIÓN DE NOTAS DE CRÉDITO
// ═══════════════════════════════════════════════════════════════════════════
const COLOR_NC_EXCEL = {
    pendiente: { fondo: 'FFFEF3C7', texto: 'FFB45309' },
    emitida: { fondo: 'FFDBEAFE', texto: 'FF1D4ED8' },
    aplicada: { fondo: 'FFD1FAE5', texto: 'FF047857' },
    reembolsada: { fondo: 'FFEDE9FE', texto: 'FF6D28D9' },
};
const COLOR_NC_HTML = {
    pendiente: { fondo: '#fef3c7', texto: '#b45309' },
    emitida: { fondo: '#dbeafe', texto: '#1d4ed8' },
    aplicada: { fondo: '#d1fae5', texto: '#047857' },
    reembolsada: { fondo: '#ede9fe', texto: '#6d28d9' },
};
function filtrosDevolucionesProveedor(req) {
    const q = req.query;
    const numero = (valor) => {
        if (valor === undefined || valor === null || valor === '')
            return null;
        const n = Number(valor);
        return Number.isFinite(n) ? Math.trunc(n) : null;
    };
    const id = (valor) => {
        const n = numero(valor);
        return n !== null && n > 0 ? n : null;
    };
    const texto = (valor) => typeof valor === 'string' && valor.trim() !== '' ? valor.trim() : null;
    return {
        fechaInicio: fechaQuery(q.fechaInicio),
        fechaFin: fechaQuery(q.fechaFin),
        idProveedor: id(q.idProveedor),
        idLaboratorio: id(q.idLaboratorio),
        motivo: texto(q.motivo),
        estadoNotaCredito: texto(q.estadoNotaCredito),
        idUsuario: id(q.idUsuario),
        producto: texto(q.producto),
        busqueda: texto(q.busqueda),
    };
}
function descripcionFiltrosDevolucionesProveedor(parametros) {
    const partes = [];
    partes.push(parametros.fechaInicio || parametros.fechaFin
        ? `Periodo: ${parametros.fechaInicio ? formatearFecha(parametros.fechaInicio) : 'inicio'} al ${parametros.fechaFin ? formatearFecha(parametros.fechaFin) : 'hoy'}`
        : 'Periodo: todos los registros');
    if (parametros.motivo)
        partes.push(`Motivo: ${ReporteDevolucionesProveedorModels_1.MOTIVOS_DEVOLUCION_PROVEEDOR[parametros.motivo] ?? parametros.motivo}`);
    if (parametros.estadoNotaCredito)
        partes.push(`Estado NC: ${ReporteDevolucionesProveedorModels_1.ESTADOS_NOTA_CREDITO[parametros.estadoNotaCredito] ?? parametros.estadoNotaCredito}`);
    if (parametros.producto)
        partes.push(`Producto: "${parametros.producto}"`);
    if (parametros.busqueda)
        partes.push(`Búsqueda: "${parametros.busqueda}"`);
    return partes.join('  |  ');
}
async function generarExcelDevolucionesProveedor(datos) {
    const workbook = new exceljs_1.default.Workbook();
    workbook.creator = 'Sistema de Farmacia';
    workbook.created = new Date();
    const estiloTitulo = (hoja, rango, titulo) => {
        hoja.mergeCells(rango);
        const celda = hoja.getCell(rango.split(':')[0]);
        celda.value = titulo;
        celda.font = { bold: true, size: 16, color: { argb: 'FF1D4ED8' } };
        celda.alignment = { horizontal: 'center', vertical: 'middle' };
    };
    const estiloSubtitulo = (hoja, rango, texto) => {
        hoja.mergeCells(rango);
        const celda = hoja.getCell(rango.split(':')[0]);
        celda.value = texto;
        celda.font = { italic: true, size: 10, color: { argb: 'FF6B7280' } };
        celda.alignment = { horizontal: 'center', vertical: 'middle' };
    };
    const estiloHeader = (fila) => {
        fila.height = 22;
        fila.eachCell((celda) => {
            celda.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
            celda.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            celda.border = { bottom: { style: 'thin', color: { argb: 'FFB0B0B0' } } };
        });
    };
    const bordeFila = (fila) => {
        fila.eachCell((celda) => {
            celda.border = { bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } } };
        });
    };
    const hojaResumen = workbook.addWorksheet('Resumen');
    hojaResumen.columns = [
        { header: 'Indicador', key: 'indicador', width: 46 },
        { header: 'Valor', key: 'valor', width: 20 },
        { header: 'Detalle', key: 'detalle', width: 20 },
        { header: 'Monto NC (Bs)', key: 'monto', width: 18 },
    ];
    estiloTitulo(hojaResumen, 'A1:D1', 'Reporte de Devoluciones a Proveedores y Recuperación de Notas de Crédito');
    estiloSubtitulo(hojaResumen, 'A2:D2', `Generado: ${fechaHoy()}  |  ${descripcionFiltrosDevolucionesProveedor(datos.parametros)}`);
    hojaResumen.getRow(4).values = ['Indicador', 'Valor'];
    estiloHeader(hojaResumen.getRow(4));
    const kpis = [
        ['Total de devoluciones', datos.resumen.totalDevoluciones],
        ['Líneas de detalle', datos.resumen.totalLineas],
        ['Unidades devueltas', datos.resumen.totalUnidades],
        ['Monto total de notas de crédito (Bs)', datos.resumen.montoTotalNC],
        ['Monto promedio por devolución (Bs)', datos.resumen.montoPromedio],
    ];
    kpis.forEach(([label, valor], i) => {
        const fila = hojaResumen.getRow(5 + i);
        fila.getCell(1).value = label;
        fila.getCell(2).value = valor;
        fila.getCell(1).font = { bold: true };
        fila.getCell(2).numFmt = typeof valor === 'number' ? '#,##0.00' : 'General';
        fila.getCell(2).alignment = { horizontal: 'right' };
        bordeFila(fila);
    });
    let cursor = 12;
    const seccion = (titulo, encabezados, filas, formatos = []) => {
        hojaResumen.mergeCells(`A${cursor}:D${cursor}`);
        const celda = hojaResumen.getCell(`A${cursor}`);
        celda.value = titulo;
        celda.font = { bold: true, size: 13, color: { argb: 'FF1D4ED8' } };
        cursor += 1;
        const header = hojaResumen.getRow(cursor);
        header.values = encabezados;
        estiloHeader(header);
        cursor += 1;
        filas.forEach((valores) => {
            const fila = hojaResumen.getRow(cursor);
            valores.forEach((valor, idx) => {
                const c = fila.getCell(idx + 1);
                c.value = valor;
                if (formatos.includes(idx + 1) && typeof valor === 'number')
                    c.numFmt = '#,##0.00';
                if (idx >= 1)
                    c.alignment = { horizontal: 'right' };
            });
            bordeFila(fila);
            cursor += 1;
        });
        cursor += 1;
    };
    seccion('Devoluciones por proveedor', ['Proveedor', 'Devoluciones', 'Unidades', 'Monto NC (Bs)'], datos.resumen.porProveedor.map((p) => [p.proveedor, p.devoluciones, p.unidades, p.montoNC]), [4]);
    seccion('Estado de las notas de crédito', ['Estado NC', 'Devoluciones', 'Unidades', 'Monto NC (Bs)'], datos.resumen.porEstadoNotaCredito.map((e) => [e.etiqueta, e.devoluciones, e.unidades, e.montoNC]), [4]);
    seccion('Devoluciones por motivo', ['Motivo', 'Devoluciones', 'Unidades', 'Monto NC (Bs)'], datos.resumen.porMotivo.map((m) => [m.etiqueta, m.devoluciones, m.unidades, m.montoNC]), [4]);
    seccion('Devoluciones por laboratorio (Top 10)', ['Laboratorio', 'Devoluciones', 'Unidades', 'Monto NC (Bs)'], datos.resumen.porLaboratorio.map((l) => [l.laboratorio, l.devoluciones, l.unidades, l.montoNC]), [4]);
    seccion('Productos devueltos (Top 10)', ['Producto', 'Unidades', 'Monto devuelto (Bs)'], datos.resumen.topProductos.map((p) => [p.producto, p.unidades, p.monto]), [3]);
    const hojaDetalle = workbook.addWorksheet('Detalle de Devoluciones');
    hojaDetalle.columns = [
        { header: 'N° devolución', key: 'numeroDevolucion', width: 16 },
        { header: 'Fecha', key: 'fechaCreacion', width: 18 },
        { header: 'Proveedor', key: 'proveedor', width: 28 },
        { header: 'Compra / factura', key: 'numeroFacturaCompra', width: 16 },
        { header: 'Fecha compra', key: 'fechaCompra', width: 18 },
        { header: 'Producto', key: 'nombreComercial', width: 28 },
        { header: 'Genérico', key: 'nombreGenerico', width: 22 },
        { header: 'Concentración', key: 'concentracion', width: 15 },
        { header: 'Laboratorio', key: 'laboratorio', width: 22 },
        { header: 'Lote', key: 'numeroLote', width: 14 },
        { header: 'Vencimiento', key: 'fechaVencimiento', width: 14 },
        { header: 'Cantidad', key: 'cantidad', width: 10 },
        { header: 'Precio unitario', key: 'precioUnitario', width: 15 },
        { header: 'Monto línea (Bs)', key: 'montoLinea', width: 16 },
        { header: 'Motivo', key: 'motivoLabel', width: 22 },
        { header: 'Estado devolución', key: 'estadoLabel', width: 16 },
        { header: 'Estado NC', key: 'estadoNotaCreditoLabel', width: 15 },
        { header: 'N° NC', key: 'numeroNotaCredito', width: 16 },
        { header: 'Monto NC (Bs)', key: 'montoNotaCredito', width: 16 },
        { header: 'Usuario', key: 'usuario', width: 24 },
        { header: 'Autoriza', key: 'usuarioAutoriza', width: 24 },
    ];
    estiloTitulo(hojaDetalle, 'A1:U1', 'Detalle de Devoluciones a Proveedores');
    estiloSubtitulo(hojaDetalle, 'A2:U2', `Generado: ${fechaHoy()}  |  ${descripcionFiltrosDevolucionesProveedor(datos.parametros)}`);
    estiloHeader(hojaDetalle.getRow(4));
    hojaDetalle.views = [{ state: 'frozen', ySplit: 4 }];
    datos.detalles.forEach((d, i) => {
        const fila = hojaDetalle.getRow(5 + i);
        fila.values = [
            d.numeroDevolucion,
            formatearFechaHora(d.fechaCreacion),
            d.proveedor,
            d.numeroFacturaCompra ?? '',
            d.fechaCompra ? formatearFechaHora(d.fechaCompra) : '',
            d.nombreComercial,
            d.nombreGenerico ?? '',
            d.concentracion ?? '',
            d.laboratorio,
            d.numeroLote,
            d.fechaVencimiento,
            d.cantidad,
            d.precioUnitario,
            d.montoLinea,
            d.motivoLabel,
            d.estadoLabel,
            d.estadoNotaCreditoLabel,
            d.numeroNotaCredito ?? '',
            d.montoNotaCredito,
            d.usuario,
            d.usuarioAutoriza ?? '',
        ];
        bordeFila(fila);
        [4, 12, 13, 14, 19].forEach((col) => { fila.getCell(col).alignment = { horizontal: 'right' }; });
        [13, 14, 19].forEach((col) => { fila.getCell(col).numFmt = '#,##0.00'; });
        const color = COLOR_NC_EXCEL[d.estadoNotaCredito] ?? COLOR_NC_EXCEL.pendiente;
        const celdaEstado = fila.getCell(17);
        celdaEstado.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color.fondo } };
        celdaEstado.font = { bold: true, color: { argb: color.texto } };
        celdaEstado.alignment = { horizontal: 'center' };
    });
    hojaDetalle.autoFilter = {
        from: { row: 4, column: 1 },
        to: { row: 4 + datos.detalles.length, column: 21 },
    };
    return workbook.xlsx.writeBuffer();
}
function generarHtmlDevolucionesProveedor(datos) {
    const filasProveedor = datos.resumen.porProveedor
        .map((p) => `
            <tr>
                <td>${escapeHtml(p.proveedor)}</td>
                <td class="num">${p.devoluciones}</td>
                <td class="num">${p.unidades}</td>
                <td class="num">${formatoMoneda(p.montoNC)}</td>
            </tr>`)
        .join('');
    const filasEstado = datos.resumen.porEstadoNotaCredito
        .map((e) => {
        const c = COLOR_NC_HTML[e.estado] ?? COLOR_NC_HTML.pendiente;
        return `
            <tr>
                <td style="background:${c.fondo}; color:${c.texto}; font-weight:bold;">${escapeHtml(e.etiqueta)}</td>
                <td class="num">${e.devoluciones}</td>
                <td class="num">${e.unidades}</td>
                <td class="num">${formatoMoneda(e.montoNC)}</td>
            </tr>`;
    })
        .join('');
    const filasMotivo = datos.resumen.porMotivo
        .map((m) => `
            <tr>
                <td>${escapeHtml(m.etiqueta)}</td>
                <td class="num">${m.devoluciones}</td>
                <td class="num">${m.unidades}</td>
                <td class="num">${formatoMoneda(m.montoNC)}</td>
            </tr>`)
        .join('');
    const filasDetalle = datos.detalles
        .map((d) => {
        const c = COLOR_NC_HTML[d.estadoNotaCredito] ?? COLOR_NC_HTML.pendiente;
        return `
            <tr>
                <td>${escapeHtml(d.numeroDevolucion)}<br><small>${escapeHtml(formatearFechaHora(d.fechaCreacion))}</small></td>
                <td>${escapeHtml(d.proveedor)}</td>
                <td>${escapeHtml(d.numeroFacturaCompra ?? 'Sin factura')}${d.fechaCompra ? `<br><small>${escapeHtml(formatearFechaHora(d.fechaCompra))}</small>` : ''}</td>
                <td>${escapeHtml(d.nombreComercial)}<br><small>${escapeHtml(d.laboratorio)}</small></td>
                <td>${escapeHtml(d.numeroLote)}<br><small>Vence ${escapeHtml(d.fechaVencimiento)}</small></td>
                <td class="num">${d.cantidad}</td>
                <td>${escapeHtml(d.motivoLabel)}</td>
                <td style="background:${c.fondo}; color:${c.texto}; font-weight:bold; text-align:center;">${escapeHtml(d.estadoNotaCreditoLabel)}</td>
                <td>${escapeHtml(d.numeroNotaCredito ?? '—')}</td>
                <td class="num">${formatoMoneda(d.montoNotaCredito)}</td>
                <td>${escapeHtml(d.usuario)}</td>
            </tr>`;
    })
        .join('');
    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; font-size: 10.5px; margin: 0; padding: 0; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2563eb; padding-bottom: 10px; margin-bottom: 16px; }
    .header h1 { margin: 0; font-size: 19px; color: #1d4ed8; }
    .header p { margin: 2px 0 0; color: #6b7280; font-size: 11px; }
    .meta { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 14px; padding: 10px 14px; background: #eff6ff; border-radius: 8px; font-size: 11px; }
    .meta b { color: #1d4ed8; }
    h2 { font-size: 13px; color: #1d4ed8; margin: 18px 0 6px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #2563eb; color: #fff; text-align: left; padding: 5px 7px; font-size: 9.5px; }
    td { padding: 4px 7px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
    tr:nth-child(even) td { background: #f9fafb; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    td.num, th.num { text-align: right; }
    small { color: #6b7280; }
    .grid { display: flex; gap: 16px; }
    .grid > div { flex: 1; }
    .footer { margin-top: 20px; color: #9ca3af; font-size: 9.5px; text-align: center; }
</style>
</head>
<body>
    <div class="header">
        <div>
            <h1>Reporte de Devoluciones a Proveedores y Recuperación de Notas de Crédito</h1>
            <p>Sistema de Farmacia</p>
        </div>
        <p><b>Generado:</b> ${fechaHoy()}<br><b>Usuario:</b> Administrador</p>
    </div>

    <div class="meta">
        <span>Devoluciones: <b>${datos.resumen.totalDevoluciones}</b></span>
        <span>Unidades: <b>${datos.resumen.totalUnidades}</b></span>
        <span>Monto total NC: <b>${formatoMoneda(datos.resumen.montoTotalNC)} Bs</b></span>
        <span>Promedio por devolución: <b>${formatoMoneda(datos.resumen.montoPromedio)} Bs</b></span>
        <span>${escapeHtml(descripcionFiltrosDevolucionesProveedor(datos.parametros))}</span>
    </div>

    <div class="grid">
        <div>
            <h2>Devoluciones por proveedor</h2>
            <table><thead><tr><th>Proveedor</th><th class="num">Devol.</th><th class="num">Unid.</th><th class="num">Monto NC (Bs)</th></tr></thead><tbody>${filasProveedor}</tbody></table>
        </div>
        <div>
            <h2>Estado de notas de crédito</h2>
            <table><thead><tr><th>Estado NC</th><th class="num">Devol.</th><th class="num">Unid.</th><th class="num">Monto NC (Bs)</th></tr></thead><tbody>${filasEstado}</tbody></table>
        </div>
    </div>

    <h2>Devoluciones por motivo</h2>
    <table><thead><tr><th>Motivo</th><th class="num">Devol.</th><th class="num">Unid.</th><th class="num">Monto NC (Bs)</th></tr></thead><tbody>${filasMotivo}</tbody></table>

    <h2>Detalle de devoluciones (${datos.detalles.length} líneas)</h2>
    <table>
        <thead>
            <tr>
                <th>Devolución</th>
                <th>Proveedor</th>
                <th>Compra / factura</th>
                <th>Producto</th>
                <th>Lote / vence</th>
                <th class="num">Cant.</th>
                <th>Motivo</th>
                <th style="text-align:center;">Estado NC</th>
                <th>N° NC</th>
                <th class="num">Monto NC (Bs)</th>
                <th>Usuario</th>
            </tr>
        </thead>
        <tbody>${filasDetalle}</tbody>
    </table>

    <div class="footer">Documento generado automáticamente por el sistema de farmacia.</div>
</body>
</html>`;
}
async function generarPdfDevolucionesProveedor(datos) {
    const browser = await puppeteer_1.default.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
        const page = await browser.newPage();
        await page.setContent(generarHtmlDevolucionesProveedor(datos), { waitUntil: 'load' });
        const pdf = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: { top: '30px', bottom: '30px', left: '25px', right: '25px' },
        });
        return Buffer.from(pdf);
    }
    finally {
        await browser.close();
    }
}
// ─── CONTROLADOR ──────────────────────────────────────────────────────────────
async function generarExcelRotacionProductos(datos) {
    const workbook = new exceljs_1.default.Workbook();
    workbook.creator = 'Sistema de Farmacia';
    workbook.created = new Date();
    const hoja = workbook.addWorksheet('Rotacion ABC');
    hoja.columns = [
        { header: 'Producto', key: 'nombreComercial', width: 30 },
        { header: 'Laboratorio', key: 'laboratorio', width: 24 },
        { header: 'Clase', key: 'clasificacion', width: 8 },
        { header: 'Unid. vendidas', key: 'unidadesVendidas', width: 14 },
        { header: 'Frecuencia', key: 'frecuenciaSalida', width: 12 },
        { header: 'Monto vendido', key: 'montoVendido', width: 16 },
        { header: 'Stock', key: 'stockActual', width: 10 },
        { header: 'Valor stock', key: 'valorStock', width: 16 },
        { header: 'Proximo vencimiento', key: 'proximoVencimiento', width: 16 },
    ];
    hoja.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    hoja.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
    datos.detalles.forEach((d) => {
        hoja.addRow({
            nombreComercial: d.nombreComercial,
            laboratorio: d.laboratorio,
            clasificacion: d.clasificacion,
            unidadesVendidas: d.unidadesVendidas,
            frecuenciaSalida: d.frecuenciaSalida,
            montoVendido: d.montoVendido,
            stockActual: d.stockActual,
            valorStock: d.valorStock,
            proximoVencimiento: d.proximoVencimiento ?? '',
        });
    });
    return workbook.xlsx.writeBuffer();
}
function generarHtmlRotacionProductos(datos) {
    const filas = datos.detalles.map((d) => `
        <tr>
            <td>${escapeHtml(d.nombreComercial)}</td>
            <td>${escapeHtml(d.laboratorio)}</td>
            <td style="text-align:center;font-weight:bold;color:${d.clasificacion === 'A' ? '#059669' : d.clasificacion === 'B' ? '#D97706' : '#DC2626'}">${d.clasificacion}</td>
            <td class="num">${d.unidadesVendidas}</td>
            <td class="num">${d.frecuenciaSalida}</td>
            <td class="num">${formatoMoneda(d.montoVendido)}</td>
            <td class="num">${d.stockActual}</td>
            <td class="num">${formatoMoneda(d.valorStock)}</td>
            <td>${escapeHtml(d.proximoVencimiento ?? '—')}</td>
        </tr>`).join('');
    return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><style>
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10.5px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #2563eb; color: #fff; padding: 5px 7px; font-size: 9.5px; }
    td { padding: 4px 7px; border-bottom: 1px solid #e5e7eb; }
    .num { text-align: right; }
    </style></head><body>
    <h1>Rotacion y Clasificacion ABC de Productos</h1>
    <p>Generado: ${fechaHoy()}</p>
    <table><thead><tr><th>Producto</th><th>Laboratorio</th><th>Clase</th><th>Unid.</th><th>Freq.</th><th>Monto vendido</th><th>Stock</th><th>Valor stock</th><th>Prox. vence</th></tr></thead><tbody>${filas}</tbody></table>
    </body></html>`;
}
async function generarPdfRotacionProductos(datos) {
    const browser = await puppeteer_1.default.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
        const page = await browser.newPage();
        await page.setContent(generarHtmlRotacionProductos(datos), { waitUntil: 'load' });
        const pdf = await page.pdf({ format: 'A4', landscape: true, printBackground: true, margin: { top: '30px', bottom: '30px', left: '25px', right: '25px' } });
        return Buffer.from(pdf);
    }
    finally {
        await browser.close();
    }
}
async function generarExcelFacturacion(datos) {
    const workbook = new exceljs_1.default.Workbook();
    const hoja = workbook.addWorksheet('Recibos');
    hoja.columns = [
        { header: 'Nro recibo', key: 'numeroFactura', width: 14 },
        { header: 'Fecha emision', key: 'fechaEmision', width: 18 },
        { header: 'CI cliente', key: 'nitCliente', width: 14 },
        { header: 'Cliente', key: 'razonSocial', width: 24 },
        { header: 'Subtotal', key: 'subtotal', width: 12 },
        { header: 'Descuento', key: 'descuento', width: 12 },
        { header: 'Total', key: 'total', width: 12 },
        { header: 'Estado', key: 'estado', width: 12 },
        { header: 'Fecha anulacion', key: 'fechaAnulacion', width: 18 },
        { header: 'Motivo anulacion', key: 'motivoAnulacion', width: 30 },
        { header: 'Usuario emisor', key: 'usuarioEmisor', width: 20 },
    ];
    hoja.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    hoja.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
    datos.detalles.forEach((d) => hoja.addRow(d));
    return workbook.xlsx.writeBuffer();
}
function generarHtmlFacturacion(datos) {
    const filas = datos.detalles.map((d) => `<tr>
        <td>${escapeHtml(d.numeroFactura)}</td>
        <td>${escapeHtml(d.fechaEmision)}</td>
        <td>${escapeHtml(d.nitCliente)}</td>
        <td>${escapeHtml(d.razonSocial)}</td>
        <td class="num">${formatoMoneda(d.subtotal)}</td>
        <td class="num">${formatoMoneda(d.descuento)}</td>
        <td class="num">${formatoMoneda(d.total)}</td>
        <td>${escapeHtml(d.estado)}</td>
        <td>${escapeHtml(d.fechaAnulacion ?? '—')}</td>
        <td>${escapeHtml(d.motivoAnulacion ?? '')}</td>
    </tr>`).join('');
    return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><style>
    body { font-family:'Segoe UI',Arial,sans-serif; font-size:10.5px; }
    table { width:100%; border-collapse:collapse; }
    th { background:#2563eb; color:#fff; padding:5px 7px; font-size:9.5px; }
    td { padding:4px 7px; border-bottom:1px solid #e5e7eb; }
    .num { text-align:right; }
    </style></head><body>
    <h1>Reporte de Recibos y Anulaciones</h1>
    <p>Generado: ${fechaHoy()}</p>
    <table><thead><tr><th>Nro</th><th>Fecha</th><th>CI</th><th>Cliente</th><th>Subtotal</th><th>Desc.</th><th>Total</th><th>Estado</th><th>F. Anulacion</th><th>Motivo</th></tr></thead><tbody>${filas}</tbody></table>
    </body></html>`;
}
async function generarPdfFacturacion(datos) {
    const browser = await puppeteer_1.default.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
        const page = await browser.newPage();
        await page.setContent(generarHtmlFacturacion(datos), { waitUntil: 'load' });
        const pdf = await page.pdf({ format: 'A4', landscape: true, printBackground: true, margin: { top: '30px', bottom: '30px', left: '25px', right: '25px' } });
        return Buffer.from(pdf);
    }
    finally {
        await browser.close();
    }
}
class ReporteControllers {
    // ── GET: Datos del reporte (JSON) para previsualizar en el frontend ───────
    static GetDatosReporteC = async (req, res) => {
        try {
            const frecuencia = frecuenciaValida(req.query.frecuencia);
            const datos = await ReportesModels_1.default.getDatos(frecuencia, req.query.fechaInicio, req.query.fechaFin);
            res.status(200).json(datos);
        }
        catch (error) {
            console.error('Error al generar los datos del reporte de ventas:', error);
            res.status(500).json({ error: 'Error al generar los datos del reporte de ventas' });
        }
    };
    // ── GET: Descargar reporte en Excel (.xlsx) ───────────────────────────────
    static DescargarExcelC = async (req, res) => {
        try {
            const frecuencia = frecuenciaValida(req.query.frecuencia);
            const datos = await ReportesModels_1.default.getDatos(frecuencia, req.query.fechaInicio, req.query.fechaFin);
            const buffer = await generarExcel(datos);
            const nombre = `Reporte_Ventas_${NOMBRE_ARCHIVO[frecuencia]}_${datos.fechaInicio}_al_${datos.fechaFin}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
            res.status(200).send(buffer);
        }
        catch (error) {
            console.error('Error al generar el Excel de ventas:', error);
            res.status(500).json({ error: 'Error al generar el reporte de ventas en Excel' });
        }
    };
    // ── GET: Descargar reporte en PDF ─────────────────────────────────────────
    static DescargarPdfC = async (req, res) => {
        try {
            const frecuencia = frecuenciaValida(req.query.frecuencia);
            const datos = await ReportesModels_1.default.getDatos(frecuencia, req.query.fechaInicio, req.query.fechaFin);
            const buffer = await generarPdf(datos);
            const nombre = `Reporte_Ventas_${NOMBRE_ARCHIVO[frecuencia]}_${datos.fechaInicio}_al_${datos.fechaFin}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
            res.status(200).send(buffer);
        }
        catch (error) {
            console.error('Error al generar el PDF de ventas:', error);
            res.status(500).json({ error: 'Error al generar el reporte de ventas en PDF' });
        }
    };
    // ── GET: Datos del reporte de compras (JSON) ──────────────────────────────
    static GetDatosCompraC = async (req, res) => {
        try {
            const frecuencia = frecuenciaValida(req.query.frecuencia);
            const datos = await ReportesModels_1.default.getDatosCompra(frecuencia, req.query.fechaInicio, req.query.fechaFin);
            res.status(200).json(datos);
        }
        catch (error) {
            console.error('Error al generar los datos del reporte de compras:', error);
            res.status(500).json({ error: 'Error al generar los datos del reporte de compras' });
        }
    };
    // ── GET: Descargar reporte de compras en Excel (.xlsx) ────────────────────
    static DescargarExcelCompraC = async (req, res) => {
        try {
            const frecuencia = frecuenciaValida(req.query.frecuencia);
            const datos = await ReportesModels_1.default.getDatosCompra(frecuencia, req.query.fechaInicio, req.query.fechaFin);
            const buffer = await generarExcelCompra(datos);
            const nombre = `Reporte_Compras_${NOMBRE_ARCHIVO[frecuencia]}_${datos.fechaInicio}_al_${datos.fechaFin}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
            res.status(200).send(buffer);
        }
        catch (error) {
            console.error('Error al generar el Excel de compras:', error);
            res.status(500).json({ error: 'Error al generar el reporte de compras en Excel' });
        }
    };
    // ── GET: Descargar reporte de compras en PDF ──────────────────────────────
    static DescargarPdfCompraC = async (req, res) => {
        try {
            const frecuencia = frecuenciaValida(req.query.frecuencia);
            const datos = await ReportesModels_1.default.getDatosCompra(frecuencia, req.query.fechaInicio, req.query.fechaFin);
            const buffer = await generarPdfCompra(datos);
            const nombre = `Reporte_Compras_${NOMBRE_ARCHIVO[frecuencia]}_${datos.fechaInicio}_al_${datos.fechaFin}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
            res.status(200).send(buffer);
        }
        catch (error) {
            console.error('Error al generar el PDF de compras:', error);
            res.status(500).json({ error: 'Error al generar el reporte de compras en PDF' });
        }
    };
    // ── GET: Parámetros de los filtros del reporte de vencimientos ────────────
    static GetParametrosVencimientosC = async (req, res) => {
        try {
            const parametros = await ReporteVencimientosModels_1.default.getParametros();
            res.status(200).json(parametros);
        }
        catch (error) {
            console.error('Error al obtener los parámetros del reporte de vencimientos:', error);
            res.status(500).json({ error: 'Error al obtener los parámetros del reporte de vencimientos' });
        }
    };
    // ── GET: Datos del reporte de vencimientos (JSON) ─────────────────────────
    //      ?diasMin=&diasMax=&idLaboratorio=&idTipoProducto=&idProveedor=&estados=&busqueda=
    static GetDatosVencimientosC = async (req, res) => {
        try {
            const filtros = filtrosVencimientos(req);
            const datos = await ReporteVencimientosModels_1.default.getDatos(filtros);
            res.status(200).json(datos);
        }
        catch (error) {
            console.error('Error al generar los datos del reporte de vencimientos:', error);
            res.status(500).json({ error: 'Error al generar los datos del reporte de vencimientos' });
        }
    };
    // ── GET: Descargar reporte de vencimientos en Excel (.xlsx) ───────────────
    static DescargarExcelVencimientosC = async (req, res) => {
        try {
            const filtros = filtrosVencimientos(req);
            const datos = await ReporteVencimientosModels_1.default.getDatos(filtros);
            const buffer = await generarExcelVencimientos(datos);
            const nombre = `Reporte_Vencimientos_FEFO_${fechaArchivo()}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
            res.status(200).send(buffer);
        }
        catch (error) {
            console.error('Error al generar el Excel de vencimientos:', error);
            res.status(500).json({ error: 'Error al generar el reporte de vencimientos en Excel' });
        }
    };
    // ── GET: Descargar reporte de vencimientos en PDF ──────────────────────────
    static DescargarPdfVencimientosC = async (req, res) => {
        try {
            const filtros = filtrosVencimientos(req);
            const datos = await ReporteVencimientosModels_1.default.getDatos(filtros);
            const buffer = await generarPdfVencimientos(datos);
            const nombre = `Reporte_Vencimientos_FEFO_${fechaArchivo()}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
            res.status(200).send(buffer);
        }
        catch (error) {
            console.error('Error al generar el PDF de vencimientos:', error);
            res.status(500).json({ error: 'Error al generar el reporte de vencimientos en PDF' });
        }
    };
    static GetParametrosInventarioC = async (req, res) => {
        try {
            const parametros = await ReporteInventarioModels_1.default.getParametros();
            res.status(200).json(parametros);
        }
        catch (error) {
            console.error('Error al obtener los parámetros del reporte de inventario:', error);
            res.status(500).json({ error: 'Error al obtener los parámetros del reporte de inventario' });
        }
    };
    static GetDatosInventarioC = async (req, res) => {
        try {
            const filtros = {
                idLaboratorio: req.query.idLaboratorio ?? null,
                idTipoProducto: req.query.idTipoProducto ?? null,
                busqueda: req.query.busqueda ?? null,
                soloConStock: req.query.soloConStock !== 'false',
            };
            const datos = await ReporteInventarioModels_1.default.getDatos(filtros);
            res.status(200).json(datos);
        }
        catch (error) {
            console.error('Error al generar los datos del reporte de inventario:', error);
            res.status(500).json({ error: 'Error al generar los datos del reporte de inventario' });
        }
    };
    static DescargarExcelInventarioC = async (req, res) => {
        try {
            const filtros = {
                idLaboratorio: req.query.idLaboratorio ?? null,
                idTipoProducto: req.query.idTipoProducto ?? null,
                busqueda: req.query.busqueda ?? null,
                soloConStock: req.query.soloConStock !== 'false',
            };
            const datos = await ReporteInventarioModels_1.default.getDatos(filtros);
            const buffer = await generarExcelInventario(datos);
            const nombre = `Reporte_Inventario_${fechaArchivo()}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
            res.status(200).send(buffer);
        }
        catch (error) {
            console.error('Error al generar el Excel de inventario:', error);
            res.status(500).json({ error: 'Error al generar el reporte de inventario en Excel' });
        }
    };
    static DescargarPdfInventarioC = async (req, res) => {
        try {
            const filtros = {
                idLaboratorio: req.query.idLaboratorio ?? null,
                idTipoProducto: req.query.idTipoProducto ?? null,
                busqueda: req.query.busqueda ?? null,
                soloConStock: req.query.soloConStock !== 'false',
            };
            const datos = await ReporteInventarioModels_1.default.getDatos(filtros);
            const buffer = await generarPdfInventario(datos);
            const nombre = `Reporte_Inventario_${fechaArchivo()}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
            res.status(200).send(buffer);
        }
        catch (error) {
            console.error('Error al generar el PDF de inventario:', error);
            res.status(500).json({ error: 'Error al generar el reporte de inventario en PDF' });
        }
    };
    // ── GET: Parámetros de los filtros del reporte de devoluciones ────────────
    static GetParametrosDevolucionesC = async (req, res) => {
        try {
            const parametros = await ReporteDevolucionesModels_1.default.getParametros();
            res.status(200).json(parametros);
        }
        catch (error) {
            console.error('Error al obtener los parámetros del reporte de devoluciones:', error);
            res.status(500).json({ error: 'Error al obtener los parámetros del reporte de devoluciones' });
        }
    };
    // ── GET: Datos del reporte de devoluciones (JSON) ─────────────────────────
    static GetDatosDevolucionesC = async (req, res) => {
        try {
            const filtros = filtrosDevoluciones(req);
            const datos = await ReporteDevolucionesModels_1.default.getDatos(filtros);
            res.status(200).json(datos);
        }
        catch (error) {
            console.error('Error al generar los datos del reporte de devoluciones:', error);
            res.status(500).json({ error: 'Error al generar los datos del reporte de devoluciones' });
        }
    };
    // ── GET: Descargar reporte de devoluciones en Excel (.xlsx) ───────────────
    static DescargarExcelDevolucionesC = async (req, res) => {
        try {
            const filtros = filtrosDevoluciones(req);
            const datos = await ReporteDevolucionesModels_1.default.getDatos(filtros);
            const buffer = await generarExcelDevoluciones(datos);
            const nombre = `Reporte_Devoluciones_Clientes_${fechaArchivo()}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
            res.status(200).send(buffer);
        }
        catch (error) {
            console.error('Error al generar el Excel de devoluciones:', error);
            res.status(500).json({ error: 'Error al generar el reporte de devoluciones en Excel' });
        }
    };
    // ── GET: Descargar reporte de devoluciones en PDF ─────────────────────────
    static DescargarPdfDevolucionesC = async (req, res) => {
        try {
            const filtros = filtrosDevoluciones(req);
            const datos = await ReporteDevolucionesModels_1.default.getDatos(filtros);
            const buffer = await generarPdfDevoluciones(datos);
            const nombre = `Reporte_Devoluciones_Clientes_${fechaArchivo()}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
            res.status(200).send(buffer);
        }
        catch (error) {
            console.error('Error al generar el PDF de devoluciones:', error);
            res.status(500).json({ error: 'Error al generar el reporte de devoluciones en PDF' });
        }
    };
    static GetParametrosDevolucionesProveedorC = async (req, res) => {
        try {
            const parametros = await ReporteDevolucionesProveedorModels_1.default.getParametros();
            res.status(200).json(parametros);
        }
        catch (error) {
            console.error('Error al obtener los parámetros del reporte de devoluciones a proveedores:', error);
            res.status(500).json({ error: 'Error al obtener los parámetros del reporte de devoluciones a proveedores' });
        }
    };
    static GetDatosDevolucionesProveedorC = async (req, res) => {
        try {
            const filtros = filtrosDevolucionesProveedor(req);
            const datos = await ReporteDevolucionesProveedorModels_1.default.getDatos(filtros);
            res.status(200).json(datos);
        }
        catch (error) {
            console.error('Error al generar los datos del reporte de devoluciones a proveedores:', error);
            res.status(500).json({ error: 'Error al generar los datos del reporte de devoluciones a proveedores' });
        }
    };
    static DescargarExcelDevolucionesProveedorC = async (req, res) => {
        try {
            const filtros = filtrosDevolucionesProveedor(req);
            const datos = await ReporteDevolucionesProveedorModels_1.default.getDatos(filtros);
            const buffer = await generarExcelDevolucionesProveedor(datos);
            const nombre = `Reporte_Devoluciones_Proveedores_NC_${fechaArchivo()}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
            res.status(200).send(buffer);
        }
        catch (error) {
            console.error('Error al generar el Excel de devoluciones a proveedores:', error);
            res.status(500).json({ error: 'Error al generar el reporte de devoluciones a proveedores en Excel' });
        }
    };
    static DescargarPdfDevolucionesProveedorC = async (req, res) => {
        try {
            const filtros = filtrosDevolucionesProveedor(req);
            const datos = await ReporteDevolucionesProveedorModels_1.default.getDatos(filtros);
            const buffer = await generarPdfDevolucionesProveedor(datos);
            const nombre = `Reporte_Devoluciones_Proveedores_NC_${fechaArchivo()}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
            res.status(200).send(buffer);
        }
        catch (error) {
            console.error('Error al generar el PDF de devoluciones a proveedores:', error);
            res.status(500).json({ error: 'Error al generar el reporte de devoluciones a proveedores en PDF' });
        }
    };
    static GetParametrosRotacionProductosC = async (req, res) => {
        try {
            const parametros = await ReporteRotacionProductosModels_1.default.getParametros();
            res.status(200).json(parametros);
        }
        catch (error) {
            console.error('Error al obtener los parámetros del reporte de rotación de productos:', error);
            res.status(500).json({ error: 'Error al obtener los parámetros del reporte de rotación de productos' });
        }
    };
    static GetDatosRotacionProductosC = async (req, res) => {
        try {
            const filtros = {
                fechaInicio: req.query.fechaInicio ?? null,
                fechaFin: req.query.fechaFin ?? null,
                idLaboratorio: req.query.idLaboratorio ?? null,
                idTipoProducto: req.query.idTipoProducto ?? null,
                clasificacion: req.query.clasificacion ?? null,
                busqueda: req.query.busqueda ?? null,
                soloConStock: req.query.soloConStock !== 'false',
            };
            const datos = await ReporteRotacionProductosModels_1.default.getDatos(filtros);
            res.status(200).json(datos);
        }
        catch (error) {
            console.error('Error al generar los datos del reporte de rotación de productos:', error);
            res.status(500).json({ error: 'Error al generar los datos del reporte de rotación de productos' });
        }
    };
    static DescargarExcelRotacionProductosC = async (req, res) => {
        try {
            const filtros = {
                fechaInicio: req.query.fechaInicio ?? null,
                fechaFin: req.query.fechaFin ?? null,
                idLaboratorio: req.query.idLaboratorio ?? null,
                idTipoProducto: req.query.idTipoProducto ?? null,
                clasificacion: req.query.clasificacion ?? null,
                busqueda: req.query.busqueda ?? null,
                soloConStock: req.query.soloConStock !== 'false',
            };
            const datos = await ReporteRotacionProductosModels_1.default.getDatos(filtros);
            const buffer = await generarExcelRotacionProductos(datos);
            const nombre = `Reporte_Rotacion_ABC_${fechaArchivo()}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
            res.status(200).send(buffer);
        }
        catch (error) {
            console.error('Error al generar el Excel de rotación de productos:', error);
            res.status(500).json({ error: 'Error al generar el reporte de rotación de productos en Excel' });
        }
    };
    static DescargarPdfRotacionProductosC = async (req, res) => {
        try {
            const filtros = {
                fechaInicio: req.query.fechaInicio ?? null,
                fechaFin: req.query.fechaFin ?? null,
                idLaboratorio: req.query.idLaboratorio ?? null,
                idTipoProducto: req.query.idTipoProducto ?? null,
                clasificacion: req.query.clasificacion ?? null,
                busqueda: req.query.busqueda ?? null,
                soloConStock: req.query.soloConStock !== 'false',
            };
            const datos = await ReporteRotacionProductosModels_1.default.getDatos(filtros);
            const buffer = await generarPdfRotacionProductos(datos);
            const nombre = `Reporte_Rotacion_ABC_${fechaArchivo()}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
            res.status(200).send(buffer);
        }
        catch (error) {
            console.error('Error al generar el PDF de rotación de productos:', error);
            res.status(500).json({ error: 'Error al generar el reporte de rotación de productos en PDF' });
        }
    };
    static GetParametrosFacturacionC = async (req, res) => {
        try {
            const parametros = await ReporteFacturacionModels_1.default.getParametros();
            res.status(200).json(parametros);
        }
        catch (error) {
            console.error('Error al obtener los parámetros del reporte de facturación:', error);
            res.status(500).json({ error: 'Error al obtener los parámetros del reporte de facturación' });
        }
    };
    static GetDatosFacturacionC = async (req, res) => {
        try {
            const filtros = {
                fechaInicio: req.query.fechaInicio ?? null,
                fechaFin: req.query.fechaFin ?? null,
                estado: req.query.estado ?? null,
                tipoFactura: req.query.tipoFactura ?? null,
                busqueda: req.query.busqueda ?? null,
            };
            const datos = await ReporteFacturacionModels_1.default.getDatos(filtros);
            res.status(200).json(datos);
        }
        catch (error) {
            console.error('Error al generar los datos del reporte de facturación:', error);
            res.status(500).json({ error: 'Error al generar los datos del reporte de facturación' });
        }
    };
    static DescargarExcelFacturacionC = async (req, res) => {
        try {
            const filtros = {
                fechaInicio: req.query.fechaInicio ?? null,
                fechaFin: req.query.fechaFin ?? null,
                estado: req.query.estado ?? null,
                tipoFactura: req.query.tipoFactura ?? null,
                busqueda: req.query.busqueda ?? null,
            };
            const datos = await ReporteFacturacionModels_1.default.getDatos(filtros);
            const buffer = await generarExcelFacturacion(datos);
            const nombre = `Reporte_Facturacion_${fechaArchivo()}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
            res.status(200).send(buffer);
        }
        catch (error) {
            console.error('Error al generar el Excel de facturación:', error);
            res.status(500).json({ error: 'Error al generar el reporte de facturación en Excel' });
        }
    };
    static DescargarPdfFacturacionC = async (req, res) => {
        try {
            const filtros = {
                fechaInicio: req.query.fechaInicio ?? null,
                fechaFin: req.query.fechaFin ?? null,
                estado: req.query.estado ?? null,
                tipoFactura: req.query.tipoFactura ?? null,
                busqueda: req.query.busqueda ?? null,
            };
            const datos = await ReporteFacturacionModels_1.default.getDatos(filtros);
            const buffer = await generarPdfFacturacion(datos);
            const nombre = `Reporte_Facturacion_${fechaArchivo()}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
            res.status(200).send(buffer);
        }
        catch (error) {
            console.error('Error al generar el PDF de facturación:', error);
            res.status(500).json({ error: 'Error al generar el reporte de facturación en PDF' });
        }
    };
}
exports.ReporteControllers = ReporteControllers;
//# sourceMappingURL=ReporteControllers.js.map