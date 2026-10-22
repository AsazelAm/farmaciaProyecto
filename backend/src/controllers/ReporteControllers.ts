import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import puppeteer from 'puppeteer';
import DataReportes, { FrecuenciaReporte } from '../Models/ReportesModels';
import DataVencimientos, {
    ETIQUETA_NIVEL,
    IFiltrosVencimientos,
    UMBRAL_ADVERTENCIA_DIAS,
    UMBRAL_CRITICO_DIAS,
} from '../Models/ReporteVencimientosModels';

const FRECUENCIAS_VALIDAS: FrecuenciaReporte[] = ['diario', 'semanal', 'mensual'];

const TITULO_HUMANO: Record<FrecuenciaReporte, string> = {
    diario: 'por Día',
    semanal: 'por Semana',
    mensual: 'por Mes',
};

const NOMBRE_ARCHIVO: Record<FrecuenciaReporte, string> = {
    diario: 'Diario',
    semanal: 'Semanal',
    mensual: 'Mensual',
};

function frecuenciaValida(valor: any): FrecuenciaReporte {
    return typeof valor === 'string' && (FRECUENCIAS_VALIDAS as string[]).includes(valor)
        ? (valor as FrecuenciaReporte)
        : 'diario';
}

function fechaHoy(): string {
    const h = new Date();
    return `${String(h.getDate()).padStart(2, '0')}/${String(h.getMonth() + 1).padStart(2, '0')}/${h.getFullYear()}`;
}

// 'YYYY-MM-DD' para incrustar en el nombre de los archivos descargados.
function fechaArchivo(): string {
    const h = new Date();
    return `${h.getFullYear()}${String(h.getMonth() + 1).padStart(2, '0')}${String(h.getDate()).padStart(2, '0')}`;
}

// 'YYYY-MM-DD' -> 'DD/MM/YYYY'
function formatearFecha(iso: string): string {
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

function formatearFechaHora(valor: any): string {
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return String(valor ?? '');
    return formatoFechaHoraEs.format(fecha);
}

function formatoMoneda(n: number): string {
    return n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function escapeHtml(texto: any): string {
    return String(texto ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ─── Generador EXCEL (exceljs) ────────────────────────────────────────────────
async function generarExcel(datos: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
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

    const formatoColumnas = (filaFila: ExcelJS.Row, esTotal = false) => {
        filaFila.eachCell((celda, numero) => {
            celda.border = { bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } } };
            if (numero >= 3) {
                celda.alignment = { horizontal: 'right' };
                if (typeof celda.value === 'number' && !esTotal) celda.numFmt = '#,##0.00';
            }
        });
    };

    datos.periodos.forEach((p: any, i: number) => {
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

    datos.ventas.forEach((v: any, i: number) => {
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

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
}

// ─── Generador HTML + PDF (puppeteer) ─────────────────────────────────────────
function generarHtml(datos: any): string {
    const filasResumen = datos.periodos
        .map(
            (p: any) => `
            <tr>
                <td>${escapeHtml(p.etiqueta)}</td>
                <td class="num">${p.cantidad}</td>
                <td class="num">${formatoMoneda(p.subtotal)}</td>
                <td class="num">${formatoMoneda(p.descuentoTotal)}</td>
                <td class="num">${formatoMoneda(p.impuestos)}</td>
                <td class="num">${formatoMoneda(p.total)}</td>
            </tr>`,
        )
        .join('');

    const filasDetalle = datos.ventas
        .map(
            (v: any) => `
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
            </tr>`,
        )
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

async function generarPdf(datos: any): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
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
    } finally {
        await browser.close();
    }
}

// ─── Generador EXCEL de COMPRAS (exceljs) ─────────────────────────────────────
async function generarExcelCompra(datos: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
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

    datos.periodos.forEach((p: any, i: number) => {
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
                if (typeof celda.value === 'number') celda.numFmt = '#,##0.00';
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

    datos.compras.forEach((v: any, i: number) => {
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
                if (typeof celda.value === 'number') celda.numFmt = '#,##0.00';
            }
        });
    });

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
}

// ─── Generador HTML + PDF de COMPRAS (puppeteer) ──────────────────────────────
function generarHtmlCompra(datos: any): string {
    const filasResumen = datos.periodos
        .map(
            (p: any) => `
            <tr>
                <td>${escapeHtml(p.etiqueta)}</td>
                <td class="num">${p.cantidad}</td>
                <td class="num">${formatoMoneda(p.subtotal)}</td>
                <td class="num">${formatoMoneda(p.descuentoTotal)}</td>
                <td class="num">${formatoMoneda(p.impuestos)}</td>
                <td class="num">${formatoMoneda(p.total)}</td>
            </tr>`,
        )
        .join('');

    const filasDetalle = datos.compras
        .map(
            (v: any) => `
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
            </tr>`,
        )
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

async function generarPdfCompra(datos: any): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
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
    } finally {
        await browser.close();
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// REPORTE DE CONTROL DE VENCIMIENTOS Y ALERTA FEFO
// ═══════════════════════════════════════════════════════════════════════════

// Paleta de semáforo compartida por Excel, PDF y (equivalente en) frontend.
const COLOR_NIVEL: Record<string, { fondo: string; texto: string; borde: string }> = {
    vencido: { fondo: 'FFFCA5A5', texto: 'FF7F1D1D', borde: 'FF991B1B' },
    critico: { fondo: 'FFFECACA', texto: 'FFB91C1C', borde: 'FFDC2626' },
    advertencia: { fondo: 'FFFDE68A', texto: 'FFB45309', borde: 'FFD97706' },
    optimo: { fondo: 'FFD1FAE5', texto: 'FF047857', borde: 'FF059669' },
};

const COLOR_NIVEL_HTML: Record<string, { fondo: string; texto: string }> = {
    vencido: { fondo: '#fca5a5', texto: '#7f1d1d' },
    critico: { fondo: '#fecaca', texto: '#b91c1c' },
    advertencia: { fondo: '#fde68a', texto: '#b45309' },
    optimo: { fondo: '#d1fae5', texto: '#047857' },
};

// Convierte los query params en el objeto de filtros del modelo.
function filtrosVencimientos(req: Request): IFiltrosVencimientos {
    const q = req.query;

    const numero = (valor: any): number | null => {
        if (valor === undefined || valor === null || valor === '') return null;
        const n = Number(valor);
        return Number.isFinite(n) ? Math.trunc(n) : null;
    };

    const id = (valor: any): number | null => {
        const n = numero(valor);
        return n !== null && n > 0 ? n : null;
    };

    let estados: string[] | undefined;
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
function descripcionFiltros(parametros: any): string {
    const partes: string[] = [];

    if (parametros.diasMin !== null && parametros.diasMax !== null) {
        partes.push(`Días restantes: ${parametros.diasMin} a ${parametros.diasMax}`);
    } else if (parametros.diasMin !== null) {
        partes.push(`Días restantes: desde ${parametros.diasMin}`);
    } else if (parametros.diasMax !== null) {
        partes.push(`Días restantes: hasta ${parametros.diasMax}`);
    } else {
        partes.push('Días restantes: todos');
    }

    partes.push(`Umbrales: crítico ≤ ${UMBRAL_CRITICO_DIAS} d · advertencia ≤ ${UMBRAL_ADVERTENCIA_DIAS} d`);
    partes.push(parametros.soloConStock ? 'Sólo lotes con stock' : 'Todos los lotes');
    if (parametros.busqueda) partes.push(`Búsqueda: "${parametros.busqueda}"`);

    return partes.join('  |  ');
}

// ─── Generador EXCEL del reporte de vencimientos ───────────────────────────
async function generarExcelVencimientos(datos: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Farmacia';
    workbook.created = new Date();

    const estiloTitulo = (hoja: ExcelJS.Worksheet, rango: string, titulo: string) => {
        hoja.mergeCells(rango);
        const celda = hoja.getCell(rango.split(':')[0]);
        celda.value = titulo;
        celda.font = { bold: true, size: 16, color: { argb: 'FF1D4ED8' } };
        celda.alignment = { horizontal: 'center', vertical: 'middle' };
    };

    const estiloSubtitulo = (hoja: ExcelJS.Worksheet, rango: string, texto: string) => {
        hoja.mergeCells(rango);
        const celda = hoja.getCell(rango.split(':')[0]);
        celda.value = texto;
        celda.font = { italic: true, size: 10, color: { argb: 'FF6B7280' } };
        celda.alignment = { horizontal: 'center', vertical: 'middle' };
    };

    const estiloHeader = (fila: ExcelJS.Row) => {
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
    const kpis: [string, string | number][] = [
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

    datos.resumen.porNivel.forEach((n: any, i: number) => {
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

    datos.resumen.porLaboratorio.forEach((lab: any, i: number) => {
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

    datos.lotes.forEach((l: any, i: number) => {
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
                if (typeof celda.value === 'number') celda.numFmt = '#,##0.00';
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

    datos.resumen.controlFEFO.forEach((c: any, i: number) => {
        const fila = hojaFEFO.getRow(5 + i);
        fila.values = [
            c.producto,
            c.numeroLoteFEFO,
            c.fechaVencimientoFEFO,
            c.diasRestantesFEFO,
            ETIQUETA_NIVEL[c.nivelFEFO] ?? c.nivelFEFO,
            c.totalLotes,
            c.stockLotesPosteriores,
            c.valorLotesPosteriores,
        ];
        fila.eachCell((celda, numero) => {
            celda.border = { bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } } };
            if ([4, 6, 7, 8].includes(numero)) celda.alignment = { horizontal: 'right' };
            if (numero === 8 && typeof celda.value === 'number') celda.numFmt = '#,##0.00';
        });

        const color = COLOR_NIVEL[c.nivelFEFO];
        const celdaNivel = fila.getCell(5);
        celdaNivel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color.fondo } };
        celdaNivel.font = { bold: true, color: { argb: color.texto } };
        celdaNivel.alignment = { horizontal: 'center' };
    });

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
}

// ─── Generador HTML + PDF del reporte de vencimientos ──────────────────────
function generarHtmlVencimientos(datos: any): string {
    const filasDetalle = datos.lotes
        .map((l: any) => {
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
        .map((n: any) => {
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
        .map(
            (lab: any) => `
            <tr>
                <td>${escapeHtml(lab.laboratorio)}</td>
                <td class="num">${lab.lotes}</td>
                <td class="num">${lab.unidades}</td>
                <td class="num">${formatoMoneda(lab.valor)}</td>
            </tr>`,
        )
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

async function generarPdfVencimientos(datos: any): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
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
    } finally {
        await browser.close();
    }
}

// ─── CONTROLADOR ──────────────────────────────────────────────────────────────
export class ReporteControllers {

    // ── GET: Datos del reporte (JSON) para previsualizar en el frontend ───────
    static readonly GetDatosReporteC = async (req: Request, res: Response): Promise<any> => {
        try {
            const frecuencia = frecuenciaValida(req.query.frecuencia);
            const datos = await DataReportes.getDatos(frecuencia, req.query.fechaInicio, req.query.fechaFin);
            res.status(200).json(datos);
        } catch (error) {
            console.error('Error al generar los datos del reporte de ventas:', error);
            res.status(500).json({ error: 'Error al generar los datos del reporte de ventas' });
        }
    };

    // ── GET: Descargar reporte en Excel (.xlsx) ───────────────────────────────
    static readonly DescargarExcelC = async (req: Request, res: Response): Promise<any> => {
        try {
            const frecuencia = frecuenciaValida(req.query.frecuencia);
            const datos = await DataReportes.getDatos(frecuencia, req.query.fechaInicio, req.query.fechaFin);
            const buffer = await generarExcel(datos);
            const nombre = `Reporte_Ventas_${NOMBRE_ARCHIVO[frecuencia]}_${datos.fechaInicio}_al_${datos.fechaFin}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
            res.status(200).send(buffer);
        } catch (error) {
            console.error('Error al generar el Excel de ventas:', error);
            res.status(500).json({ error: 'Error al generar el reporte de ventas en Excel' });
        }
    };

    // ── GET: Descargar reporte en PDF ─────────────────────────────────────────
    static readonly DescargarPdfC = async (req: Request, res: Response): Promise<any> => {
        try {
            const frecuencia = frecuenciaValida(req.query.frecuencia);
            const datos = await DataReportes.getDatos(frecuencia, req.query.fechaInicio, req.query.fechaFin);
            const buffer = await generarPdf(datos);
            const nombre = `Reporte_Ventas_${NOMBRE_ARCHIVO[frecuencia]}_${datos.fechaInicio}_al_${datos.fechaFin}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
            res.status(200).send(buffer);
        } catch (error) {
            console.error('Error al generar el PDF de ventas:', error);
            res.status(500).json({ error: 'Error al generar el reporte de ventas en PDF' });
        }
    };

    // ── GET: Datos del reporte de compras (JSON) ──────────────────────────────
    static readonly GetDatosCompraC = async (req: Request, res: Response): Promise<any> => {
        try {
            const frecuencia = frecuenciaValida(req.query.frecuencia);
            const datos = await DataReportes.getDatosCompra(frecuencia, req.query.fechaInicio, req.query.fechaFin);
            res.status(200).json(datos);
        } catch (error) {
            console.error('Error al generar los datos del reporte de compras:', error);
            res.status(500).json({ error: 'Error al generar los datos del reporte de compras' });
        }
    };

    // ── GET: Descargar reporte de compras en Excel (.xlsx) ────────────────────
    static readonly DescargarExcelCompraC = async (req: Request, res: Response): Promise<any> => {
        try {
            const frecuencia = frecuenciaValida(req.query.frecuencia);
            const datos = await DataReportes.getDatosCompra(frecuencia, req.query.fechaInicio, req.query.fechaFin);
            const buffer = await generarExcelCompra(datos);
            const nombre = `Reporte_Compras_${NOMBRE_ARCHIVO[frecuencia]}_${datos.fechaInicio}_al_${datos.fechaFin}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
            res.status(200).send(buffer);
        } catch (error) {
            console.error('Error al generar el Excel de compras:', error);
            res.status(500).json({ error: 'Error al generar el reporte de compras en Excel' });
        }
    };

    // ── GET: Descargar reporte de compras en PDF ──────────────────────────────
    static readonly DescargarPdfCompraC = async (req: Request, res: Response): Promise<any> => {
        try {
            const frecuencia = frecuenciaValida(req.query.frecuencia);
            const datos = await DataReportes.getDatosCompra(frecuencia, req.query.fechaInicio, req.query.fechaFin);
            const buffer = await generarPdfCompra(datos);
            const nombre = `Reporte_Compras_${NOMBRE_ARCHIVO[frecuencia]}_${datos.fechaInicio}_al_${datos.fechaFin}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
            res.status(200).send(buffer);
        } catch (error) {
            console.error('Error al generar el PDF de compras:', error);
            res.status(500).json({ error: 'Error al generar el reporte de compras en PDF' });
        }
    };

    // ── GET: Parámetros de los filtros del reporte de vencimientos ────────────
    static readonly GetParametrosVencimientosC = async (req: Request, res: Response): Promise<any> => {
        try {
            const parametros = await DataVencimientos.getParametros();
            res.status(200).json(parametros);
        } catch (error) {
            console.error('Error al obtener los parámetros del reporte de vencimientos:', error);
            res.status(500).json({ error: 'Error al obtener los parámetros del reporte de vencimientos' });
        }
    };

    // ── GET: Datos del reporte de vencimientos (JSON) ─────────────────────────
    //      ?diasMin=&diasMax=&idLaboratorio=&idTipoProducto=&idProveedor=&estados=&busqueda=
    static readonly GetDatosVencimientosC = async (req: Request, res: Response): Promise<any> => {
        try {
            const filtros = filtrosVencimientos(req);
            const datos = await DataVencimientos.getDatos(filtros);
            res.status(200).json(datos);
        } catch (error) {
            console.error('Error al generar los datos del reporte de vencimientos:', error);
            res.status(500).json({ error: 'Error al generar los datos del reporte de vencimientos' });
        }
    };

    // ── GET: Descargar reporte de vencimientos en Excel (.xlsx) ───────────────
    static readonly DescargarExcelVencimientosC = async (req: Request, res: Response): Promise<any> => {
        try {
            const filtros = filtrosVencimientos(req);
            const datos = await DataVencimientos.getDatos(filtros);
            const buffer = await generarExcelVencimientos(datos);
            const nombre = `Reporte_Vencimientos_FEFO_${fechaArchivo()}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
            res.status(200).send(buffer);
        } catch (error) {
            console.error('Error al generar el Excel de vencimientos:', error);
            res.status(500).json({ error: 'Error al generar el reporte de vencimientos en Excel' });
        }
    };

    // ── GET: Descargar reporte de vencimientos en PDF ──────────────────────────
    static readonly DescargarPdfVencimientosC = async (req: Request, res: Response): Promise<any> => {
        try {
            const filtros = filtrosVencimientos(req);
            const datos = await DataVencimientos.getDatos(filtros);
            const buffer = await generarPdfVencimientos(datos);
            const nombre = `Reporte_Vencimientos_FEFO_${fechaArchivo()}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
            res.status(200).send(buffer);
        } catch (error) {
            console.error('Error al generar el PDF de vencimientos:', error);
            res.status(500).json({ error: 'Error al generar el reporte de vencimientos en PDF' });
        }
    };
}