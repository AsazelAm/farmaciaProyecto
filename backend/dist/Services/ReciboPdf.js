"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.numeroALetras = numeroALetras;
exports.construirReciboHtml = construirReciboHtml;
exports.generarReciboPdf = generarReciboPdf;
const puppeteer_1 = __importDefault(require("puppeteer"));
// ════════════════════════════════════════════════════════════════════════════
//  DATOS FIJOS DEL NEGOCIO (cámbialos o muévelos a tu .env)
// ════════════════════════════════════════════════════════════════════════════
const NEGOCIO = {
    nombre: process.env.NEGOCIO_NOMBRE ?? 'FARMACIA DR. OSVALDO',
    telefono: process.env.NEGOCIO_TELEFONO ?? '',
    ciudad: process.env.NEGOCIO_CIUDAD ?? 'Santa Cruz',
};
// ════════════════════════════════════════════════════════════════════════════
//  UTILIDADES
// ════════════════════════════════════════════════════════════════════════════
// Escapa caracteres HTML: el nombre del cliente o las observaciones son texto
// escrito por personas; sin esto podrían inyectar HTML dentro del PDF.
const esc = (v) => String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
// MariaDB devuelve DECIMAL como string; esto lo convierte siempre a número.
const num = (v) => Number(v ?? 0) || 0;
const bs = (v) => num(v).toFixed(2);
const pad2 = (n) => String(n).padStart(2, '0');
function formatFechaHora(valor) {
    const f = new Date(valor);
    if (Number.isNaN(f.getTime()))
        return '—';
    const h24 = f.getHours();
    const h12 = h24 % 12 || 12;
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    return `${pad2(f.getDate())}/${pad2(f.getMonth() + 1)}/${f.getFullYear()} ${h12}:${pad2(f.getMinutes())} ${ampm}`;
}
// Las farmacias imprimen el vencimiento como MM/AAAA
function formatVencimiento(valor) {
    if (!valor)
        return '—';
    const f = new Date(valor);
    if (Number.isNaN(f.getTime()))
        return '—';
    return `${pad2(f.getMonth() + 1)}/${f.getFullYear()}`;
}
// ── Número a letras (español, hasta 999 999 999,99) ─────────────────────────
const UNIDADES = [
    '', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE',
    'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE',
    'DIECIOCHO', 'DIECINUEVE', 'VEINTE', 'VEINTIÚN', 'VEINTIDÓS', 'VEINTITRÉS',
    'VEINTICUATRO', 'VEINTICINCO', 'VEINTISÉIS', 'VEINTISIETE', 'VEINTIOCHO', 'VEINTINUEVE',
];
const DECENAS = ['', '', '', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
const CENTENAS = [
    '', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS',
    'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS',
];
function menorDeMil(n) {
    if (n === 0)
        return '';
    if (n === 100)
        return 'CIEN';
    const c = Math.floor(n / 100);
    const r = n % 100;
    const partes = [];
    if (c)
        partes.push(CENTENAS[c]);
    if (r) {
        if (r < 30) {
            partes.push(UNIDADES[r]);
        }
        else {
            const d = Math.floor(r / 10);
            const u = r % 10;
            partes.push(u ? `${DECENAS[d]} Y ${UNIDADES[u]}` : DECENAS[d]);
        }
    }
    return partes.join(' ');
}
function numeroALetras(valor) {
    const totalCentavos = Math.round(valor * 100);
    const entero = Math.floor(totalCentavos / 100);
    const centavos = totalCentavos % 100;
    let letras;
    if (entero === 0) {
        letras = 'CERO';
    }
    else {
        const millones = Math.floor(entero / 1_000_000);
        const miles = Math.floor((entero % 1_000_000) / 1000);
        const resto = entero % 1000;
        const partes = [];
        if (millones)
            partes.push(millones === 1 ? 'UN MILLÓN' : `${menorDeMil(millones)} MILLONES`);
        if (miles)
            partes.push(miles === 1 ? 'MIL' : `${menorDeMil(miles)} MIL`);
        if (resto)
            partes.push(menorDeMil(resto));
        letras = partes.join(' ');
    }
    return `${letras} ${pad2(centavos)}/100 BOLIVIANOS`;
}
// Las observaciones pueden traer la auditoría interna "[FEFO] ..." que el
// controlador agrega. Eso es para uso interno: no debe salir en el recibo.
function observacionesParaCliente(obs) {
    if (!obs)
        return '';
    return obs
        .split(' | ')
        .filter((parte) => !parte.trim().startsWith('[FEFO]'))
        .join(' | ')
        .trim();
}
// ════════════════════════════════════════════════════════════════════════════
//  HTML DEL RECIBO
// ════════════════════════════════════════════════════════════════════════════
function construirReciboHtml(venta) {
    const numeroDoc = venta.recibo?.numeroRecibo ?? `V-${String(venta.idVenta).padStart(5, '0')}`;
    const anulado = venta.estado === 'cancelado' || venta.recibo?.estado === 'anulado';
    const observaciones = observacionesParaCliente(venta.observaciones);
    const total = num(venta.total);
    const filas = venta.detalles
        .map((d) => {
        const subLinea = [d.nombreComercial, d.nombreLaboratorio].filter(Boolean).join(' · ');
        return `
            <tr>
                <td>${esc(d.codigoBarra || d.codigo || '—')}</td>
                <td class="r">${esc(d.cantidad)}</td>
                <td>
                    <strong>${esc(d.nombreGenerico ?? '—')}</strong>${d.concentracion ? ` ${esc(d.concentracion)}` : ''}
                    ${subLinea ? `<div class="sub">${esc(subLinea)}</div>` : ''}
                </td>
                <td class="c">
                    ${esc(d.numeroLote ?? '—')}
                    <div class="sub">Venc. ${formatVencimiento(d.fechaVencimiento)}</div>
                </td>
                <td class="r">${bs(d.precioUnitario)}</td>
                <td class="r">${bs(d.descuento)}</td>
                <td class="r">${bs(d.subtotal)}</td>
            </tr>`;
    })
        .join('');
    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Recibo ${esc(numeroDoc)}</title>
<style>
  @page { size: A4; margin: 14mm 12mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #1F2937; margin: 0; }

  .encabezado { display: flex; justify-content: space-between; align-items: flex-start; }
  .negocio { text-align: center; width: 55%; line-height: 1.45; }
  .negocio .nombre { font-size: 15px; font-weight: 800; color: #4A1A6E; letter-spacing: .3px; }
  .negocio .linea { font-size: 10px; }

  .datos-doc { width: 40%; border: 1.5px solid #D8B4F0; border-radius: 6px; padding: 8px 10px; }
  .datos-doc div { display: flex; justify-content: space-between; padding: 3px 0; }
  .datos-doc b { color: #4A1A6E; }

  .titulo { text-align: center; margin: 18px 0 14px; }
  .titulo h1 { margin: 0; font-size: 26px; letter-spacing: 3px; color: #4A1A6E; }
  .titulo p { margin: 2px 0 0; font-size: 10.5px; color: #6B7280; }

  .info { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; margin-bottom: 12px; }
  .info div { display: flex; gap: 6px; }
  .info b { min-width: 92px; }

  table { width: 100%; border-collapse: collapse; }
  thead th { background: #F3EBF9; color: #4A1A6E; border: 1px solid #D8B4F0; padding: 6px 5px; font-size: 10px; text-transform: uppercase; }
  tbody td { border: 1px solid #D8B4F0; padding: 5px; vertical-align: top; }
  tbody tr { page-break-inside: avoid; }
  .r { text-align: right; } .c { text-align: center; }
  .sub { font-size: 9px; color: #6B7280; }

  .pie { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 0; }
  .son { padding-top: 10px; font-weight: 700; width: 55%; }
  .totales { width: 42%; border-collapse: collapse; }
  .totales td { border: 1px solid #D8B4F0; padding: 5px 8px; }
  .totales td:first-child { text-align: right; font-weight: 700; background: #FBF8FE; }
  .totales td:last-child { text-align: right; width: 90px; }
  .totales tr.grande td { font-size: 13px; color: #4A1A6E; }

  .obs { margin-top: 12px; border: 1px dashed #D8B4F0; border-radius: 6px; padding: 7px 10px; }
  .leyenda { margin-top: 22px; text-align: center; font-size: 9px; color: #6B7280; line-height: 1.5; }

  .marca-agua {
    position: fixed; top: 38%; left: 12%; transform: rotate(-25deg);
    font-size: 120px; font-weight: 900; color: rgba(220, 38, 38, .13);
    border: 10px solid rgba(220, 38, 38, .13); padding: 0 24px; border-radius: 16px;
    pointer-events: none;
  }
</style>
</head>
<body>
  ${anulado ? '<div class="marca-agua">ANULADO</div>' : ''}

  <div class="encabezado">
    <div class="negocio">
      <div class="nombre">${esc(NEGOCIO.nombre)}</div>
      <div class="linea"><b>${esc(venta.sucursal ?? '')}</b></div>
      ${venta.sucursalDireccion ? `<div class="linea">${esc(venta.sucursalDireccion)}</div>` : ''}
      ${NEGOCIO.telefono ? `<div class="linea">Teléfono: ${esc(NEGOCIO.telefono)}</div>` : ''}
      <div class="linea">${esc(NEGOCIO.ciudad)}</div>
    </div>
    <div class="datos-doc">
      <div><b>RECIBO Nº</b><span>${esc(numeroDoc)}</span></div>
      <div><b>VENTA Nº</b><span>${esc(String(venta.idVenta).padStart(5, '0'))}</span></div>
      <div><b>FECHA</b><span>${formatFechaHora(venta.fechaCreacion)}</span></div>
    </div>
  </div>

  <div class="titulo">
    <h1>RECIBO</h1>
    <p>(Comprobante de venta — sin derecho a crédito fiscal)</p>
  </div>

  <div class="info">
    <div><b>Cliente:</b><span>${esc(venta.cliente || 'Cliente General')}</span></div>
    <div><b>Atendido por:</b><span>${esc(venta.usuario ?? '—')}</span></div>
    <div><b>NIT/CI:</b><span>${esc(venta.clienteNit || '0')}</span></div>
    <div><b>Tipo de pago:</b><span>${esc(venta.tipoPago ?? '—')}</span></div>
    ${venta.clienteTelefono ? `<div><b>Teléfono:</b><span>${esc(venta.clienteTelefono)}</span></div>` : ''}
  </div>

  <table>
    <thead>
      <tr>
        <th>Código</th>
        <th>Cant.</th>
        <th>Descripción</th>
        <th>Lote / Venc.</th>
        <th>Precio unit.</th>
        <th>Descuento</th>
        <th>Subtotal</th>
      </tr>
    </thead>
    <tbody>${filas}</tbody>
  </table>

  <div class="pie">
    <div class="son">SON: ${numeroALetras(total)}</div>
    <table class="totales">
      <tr><td>SUBTOTAL Bs</td><td>${bs(venta.subtotal)}</td></tr>
      <tr><td>DESCUENTO Bs</td><td>${bs(venta.descuentoTotal)}</td></tr>
      <tr class="grande"><td>TOTAL A PAGAR Bs</td><td><b>${bs(venta.total)}</b></td></tr>
    </table>
  </div>

  ${observaciones ? `<div class="obs"><b>Observaciones:</b> ${esc(observaciones)}</div>` : ''}

  <div class="leyenda">
    Gracias por su compra. Conserve este recibo para cualquier reclamo o devolución.<br />
    Verifique su medicamento (lote y fecha de vencimiento) antes de retirarse del mostrador.<br />
    Este documento es un comprobante de venta interno y no genera derecho a crédito fiscal.
  </div>
</body>
</html>`;
}
// ════════════════════════════════════════════════════════════════════════════
//  PUPPETEER: HTML → PDF
// ════════════════════════════════════════════════════════════════════════════
// Abrir Chromium tarda 1-2 s. Lo abrimos una sola vez y reutilizamos la misma
// instancia; solo se abre/cierra una pestaña (page) por cada recibo.
let navegadorPromise = null;
function obtenerNavegador() {
    if (!navegadorPromise) {
        navegadorPromise = puppeteer_1.default
            .launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
            .then((b) => {
            // Si Chromium se cae, la próxima petición abrirá uno nuevo
            b.on('disconnected', () => { navegadorPromise = null; });
            return b;
        })
            .catch((err) => {
            navegadorPromise = null;
            throw err;
        });
    }
    return navegadorPromise;
}
async function generarReciboPdf(venta) {
    const navegador = await obtenerNavegador();
    const page = await navegador.newPage();
    try {
        await page.setContent(construirReciboHtml(venta), { waitUntil: 'load' });
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true, // necesario para ver los fondos lila
            preferCSSPageSize: true, // respeta el @page del CSS
        });
        return Buffer.from(pdf);
    }
    finally {
        await page.close();
    }
}
//# sourceMappingURL=ReciboPdf.js.map