import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import puppeteer from 'puppeteer';
import DataReportes, { FrecuenciaReporte } from '../Models/ReportesModels';

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
}