"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ESTADOS_LOTE = exports.ACCION_POR_NIVEL = exports.ETIQUETA_NIVEL = exports.NIVELES_VENCIMIENTO = exports.UMBRAL_ADVERTENCIA_DIAS = exports.UMBRAL_CRITICO_DIAS = void 0;
exports.clasificarNivel = clasificarNivel;
exports.numeroValido = numeroValido;
exports.idValido = idValido;
exports.listaEstados = listaEstados;
const db_1 = __importDefault(require("../config/db"));
const ProductoDerivado_1 = require("./ProductoDerivado");
// ═══════════════════════════════════════════════════════════════════════════
// REPORTE DE CONTROL DE VENCIMIENTOS Y ALERTA FEFO
// ---------------------------------------------------------------------------
// Regla de negocio:
//   · FEFO (First-Expired, First-Out): la salida de stock en el punto de venta
//     debe tomar siempre el lote con la fecha de vencimiento más próxima.
//   · Semáforo de vencimiento sobre los días restantes (DATEDIFF vs CURDATE):
//       vencido    → días < 0            (ya venció)
//       critico    → 0 ≤ días ≤ 30       (retiro preventivo del área de dispensación)
//       advertencia→ 31 ≤ días ≤ 90      (FEFO estricto + impulso de venta)
//       optimo     → días > 90           (stock regular en estantería)
//   · Valor económico en riesgo = stock actual del lote × costo de compra unitario.
//   · Ordenamiento cronológico estricto: los lotes que vencen primero van arriba.
// ═══════════════════════════════════════════════════════════════════════════
exports.UMBRAL_CRITICO_DIAS = 30;
exports.UMBRAL_ADVERTENCIA_DIAS = 90;
exports.NIVELES_VENCIMIENTO = ['vencido', 'critico', 'advertencia', 'optimo'];
exports.ETIQUETA_NIVEL = {
    vencido: 'Vencido',
    critico: 'Crítico',
    advertencia: 'Advertencia',
    optimo: 'Óptimo',
};
// Acción operativa recomendada por cada nivel del semáforo.
exports.ACCION_POR_NIVEL = {
    vencido: 'Retirar del área de dispensación, aislar físicamente y enviar a merma.',
    critico: 'Retiro preventivo del área de dispensación; revisar devolución a proveedor o envío a merma.',
    advertencia: 'Aplicar FEFO estricto en mostrador; impulso de venta o descuento por pronto vencimiento.',
    optimo: 'Stock regular en estantería; despacho normal por FEFO.',
};
exports.ESTADOS_LOTE = {
    pendiente: 'Pendiente',
    activo: 'Activo',
    vencido: 'Vencido',
    cancelado: 'Cancelado',
    cuarentena: 'Cuarentena',
    devuelto: 'Devuelto',
};
// Estados por defecto del reporte: se excluyen 'cancelado' y 'devuelto'
// porque no representan existencias en el área de dispensación.
const ESTADOS_POR_DEFECTO = ['activo', 'pendiente', 'cuarentena', 'vencido'];
// Normaliza DECIMAL / BIGINT que devuelve el driver de MariaDB.
function num(valor, porDefecto = 0) {
    const n = Number(valor);
    return Number.isFinite(n) ? n : porDefecto;
}
// Convierte un valor a número solo si es un entero válido (> 0).
function idValido(valor) {
    if (valor === undefined || valor === null || valor === '')
        return null;
    const n = Number(valor);
    return Number.isInteger(n) && n > 0 ? n : null;
}
// Convierte a número admitiendo negativos (rango de días puede ser negativo).
function numeroValido(valor) {
    if (valor === undefined || valor === null || valor === '')
        return null;
    const n = Number(valor);
    return Number.isFinite(n) ? Math.trunc(n) : null;
}
function listaEstados(valor) {
    if (typeof valor !== 'string' || valor.trim() === '')
        return [...ESTADOS_POR_DEFECTO];
    const validos = valor
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter((e) => Object.prototype.hasOwnProperty.call(exports.ESTADOS_LOTE, e));
    return validos.length > 0 ? validos : [...ESTADOS_POR_DEFECTO];
}
// Clasifica el lote según los días restantes a la fecha de vencimiento.
function clasificarNivel(diasRestantes) {
    if (diasRestantes < 0)
        return 'vencido';
    if (diasRestantes <= exports.UMBRAL_CRITICO_DIAS)
        return 'critico';
    if (diasRestantes <= exports.UMBRAL_ADVERTENCIA_DIAS)
        return 'advertencia';
    return 'optimo';
}
// ─── Consulta principal ─────────────────────────────────────────────────────
// Un producto puede tener varios tipos (productotipoproducto), por eso el
// tipo se resuelve con subconsultas escalares en lugar de JOIN para no
// duplicar las filas de `lote`.
const SELECT_LOTES = `
    SELECT
        l.idLote,
        l.codigo,
        l.numeroLote,
        l.stock,
        DATE_FORMAT(l.fechaVencimiento, '%Y-%m-%d') AS fechaVencimiento,
        l.precioCompra,
        DATE_FORMAT(l.fechaIngreso, '%Y-%m-%d') AS fechaIngreso,
        DATE_FORMAT(l.fechaFabricacion, '%Y-%m-%d') AS fechaFabricacion,
        l.estado AS estadoLote,
        pr.idProducto,
        pr.codigoBarra,
        pr.nombreComercial,
        pr.viaAdministracion,
        pr.requiereReceta,
        pr.precio AS precioVenta,
        ${(0, ProductoDerivado_1.sqlNombreGenerico)('pr')} AS nombreGenerico,
        ${(0, ProductoDerivado_1.sqlConcentracion)('pr')} AS concentracion,
        pres.nombre AS presentacion,
        lab.idLaboratorio,
        lab.nombre AS laboratorio,
        pv.idProveedor,
        pv.nombre AS proveedor,
        (SELECT tp.nombre
           FROM productotipoproducto ptp
           INNER JOIN tipoproducto tp ON tp.idTipoProd = ptp.idTipoProd
          WHERE ptp.idProducto = pr.idProducto
          ORDER BY tp.idTipoProd ASC LIMIT 1) AS tipoProducto,
        (SELECT tp.idTipoProd
           FROM productotipoproducto ptp
           INNER JOIN tipoproducto tp ON tp.idTipoProd = ptp.idTipoProd
          WHERE ptp.idProducto = pr.idProducto
          ORDER BY tp.idTipoProd ASC LIMIT 1) AS idTipoProd,
        DATEDIFF(l.fechaVencimiento, CURDATE()) AS diasRestantes,
        (l.stock * l.precioCompra) AS valorEnRiesgo,
        (SELECT l2.idLote
           FROM lote l2
          WHERE l2.idProducto = l.idProducto
            AND l2.estado = 'activo'
            AND l2.stock > 0
          ORDER BY l2.fechaVencimiento ASC, l2.idLote ASC LIMIT 1) AS idLoteFEFO
    FROM lote l
    INNER JOIN producto    pr   ON pr.idProducto     = l.idProducto
    INNER JOIN laboratorio lab  ON lab.idLaboratorio = pr.idLaboratorio
    INNER JOIN presentacion pres ON pres.idPresentacion = pr.idPresentacion
    INNER JOIN proveedor   pv   ON pv.idProveedor    = l.idProveedor
`;
const DataReporteVencimientos = {
    // ── GET: Parámetros de los filtros (laboratorios, tipos, proveedores) ─────
    async getParametros() {
        const conection = await db_1.default.getConnection();
        try {
            const [laboratorios, tiposProducto, proveedores] = await Promise.all([
                conection.query(`SELECT idLaboratorio, nombre FROM laboratorio WHERE estado = 1 ORDER BY nombre ASC`),
                conection.query(`SELECT idTipoProd, nombre FROM tipoproducto WHERE estado = 1 ORDER BY nombre ASC`),
                conection.query(`SELECT idProveedor, nombre FROM proveedor WHERE estado = 1 ORDER BY nombre ASC`),
            ]);
            return {
                umbrales: {
                    critico: exports.UMBRAL_CRITICO_DIAS,
                    advertencia: exports.UMBRAL_ADVERTENCIA_DIAS,
                },
                laboratorios: laboratorios.map((l) => ({
                    idLaboratorio: num(l.idLaboratorio),
                    nombre: l.nombre,
                })),
                tiposProducto: tiposProducto.map((t) => ({
                    idTipoProd: num(t.idTipoProd),
                    nombre: t.nombre,
                })),
                proveedores: proveedores.map((p) => ({
                    idProveedor: num(p.idProveedor),
                    nombre: p.nombre,
                })),
            };
        }
        finally {
            conection.release();
        }
    },
    // ── GET: Detalle de lotes con semáforo y orden cronológico estricto ──────
    async getDatos(filtros) {
        const conection = await db_1.default.getConnection();
        const params = [];
        let where = '';
        // Rango de días restantes (DATEDIFF fechaVencimiento - CURDATE)
        const diasMin = filtros.diasMin ?? null;
        const diasMax = filtros.diasMax ?? null;
        if (diasMin !== null) {
            where += ` AND DATEDIFF(l.fechaVencimiento, CURDATE()) >= ?`;
            params.push(diasMin);
        }
        if (diasMax !== null) {
            where += ` AND DATEDIFF(l.fechaVencimiento, CURDATE()) <= ?`;
            params.push(diasMax);
        }
        // Estado del lote
        const estados = filtros.estados && filtros.estados.length > 0
            ? filtros.estados
            : [...ESTADOS_POR_DEFECTO];
        where += ` AND l.estado IN (${estados.map(() => '?').join(', ')})`;
        estados.forEach((e) => params.push(e));
        // Existencias en almacén (por defecto sólo lotes con stock)
        if (filtros.soloConStock !== false) {
            where += ` AND l.stock > 0`;
        }
        // Filtros por catálogos
        const idLaboratorio = idValido(filtros.idLaboratorio);
        if (idLaboratorio !== null) {
            where += ` AND pr.idLaboratorio = ?`;
            params.push(idLaboratorio);
        }
        const idTipoProducto = idValido(filtros.idTipoProducto);
        if (idTipoProducto !== null) {
            where += ` AND EXISTS (
                SELECT 1 FROM productotipoproducto ptp
                 WHERE ptp.idProducto = pr.idProducto AND ptp.idTipoProd = ?
            )`;
            params.push(idTipoProducto);
        }
        const idProveedor = idValido(filtros.idProveedor);
        if (idProveedor !== null) {
            where += ` AND l.idProveedor = ?`;
            params.push(idProveedor);
        }
        // Búsqueda libre por código de lote, n° de lote, nombre comercial o genérico
        const busqueda = typeof filtros.busqueda === 'string' ? filtros.busqueda.trim() : '';
        if (busqueda !== '') {
            const like = `%${busqueda}%`;
            where += ` AND (l.codigo LIKE ? OR l.numeroLote LIKE ? OR pr.nombreComercial LIKE ? OR ${(0, ProductoDerivado_1.sqlNombreGenerico)('pr')} LIKE ?)`;
            params.push(like, like, like, like);
        }
        const limite = filtros.limite && filtros.limite > 0 ? filtros.limite : null;
        const rows = await conection.query(`${SELECT_LOTES}
             WHERE 1=1 ${where}
             ORDER BY l.fechaVencimiento ASC, l.idLote ASC
             ${limite ? 'LIMIT ?' : ''}`, limite ? [...params, limite] : params);
        conection.release();
        const lotes = rows.map((r) => {
            const diasRestantes = num(r.diasRestantes);
            const nivel = clasificarNivel(diasRestantes);
            const idLoteFEFO = num(r.idLoteFEFO);
            return {
                idLote: num(r.idLote),
                codigo: r.codigo,
                numeroLote: r.numeroLote,
                stock: num(r.stock),
                fechaVencimiento: r.fechaVencimiento,
                fechaIngreso: r.fechaIngreso,
                fechaFabricacion: r.fechaFabricacion,
                estadoLote: r.estadoLote,
                estadoLoteLabel: exports.ESTADOS_LOTE[r.estadoLote] ?? r.estadoLote,
                precioCompra: num(r.precioCompra),
                precioVenta: num(r.precioVenta),
                valorEnRiesgo: num(r.valorEnRiesgo),
                diasRestantes,
                nivel,
                nivelLabel: exports.ETIQUETA_NIVEL[nivel],
                accion: exports.ACCION_POR_NIVEL[nivel],
                esFEFO: idLoteFEFO !== 0 && idLoteFEFO === num(r.idLote),
                idLoteFEFO,
                requiereReceta: num(r.requiereReceta),
                viaAdministracion: r.viaAdministracion ?? null,
                producto: {
                    idProducto: num(r.idProducto),
                    codigoBarra: r.codigoBarra,
                    nombreComercial: r.nombreComercial,
                    nombreGenerico: r.nombreGenerico,
                    concentracion: r.concentracion,
                    presentacion: r.presentacion,
                    viaAdministracion: r.viaAdministracion ?? null,
                    requiereReceta: num(r.requiereReceta),
                },
                idLaboratorio: num(r.idLaboratorio),
                laboratorio: r.laboratorio,
                idTipoProd: num(r.idTipoProd),
                tipoProducto: r.tipoProducto,
                idProveedor: num(r.idProveedor),
                proveedor: r.proveedor,
            };
        });
        return {
            parametros: {
                diasMin,
                diasMax,
                idLaboratorio,
                idTipoProducto,
                idProveedor,
                estados,
                busqueda,
                soloConStock: filtros.soloConStock !== false,
                umbrales: {
                    critico: exports.UMBRAL_CRITICO_DIAS,
                    advertencia: exports.UMBRAL_ADVERTENCIA_DIAS,
                },
            },
            lotes,
            resumen: construirResumen(lotes),
        };
    },
};
// ─── Resumen / indicadores del reporte ─────────────────────────────────────
function construirResumen(lotes) {
    const porNivel = exports.NIVELES_VENCIMIENTO.map((nivel) => {
        const filas = lotes.filter((l) => l.nivel === nivel);
        return {
            nivel,
            etiqueta: exports.ETIQUETA_NIVEL[nivel],
            accion: exports.ACCION_POR_NIVEL[nivel],
            lotes: filas.length,
            unidades: filas.reduce((acc, l) => acc + l.stock, 0),
            valor: filas.reduce((acc, l) => acc + l.valorEnRiesgo, 0),
        };
    });
    const valorEnRiesgo = lotes
        .filter((l) => l.nivel === 'vencido' || l.nivel === 'critico' || l.nivel === 'advertencia')
        .reduce((acc, l) => acc + l.valorEnRiesgo, 0);
    const valorCritico = lotes
        .filter((l) => l.nivel === 'vencido' || l.nivel === 'critico')
        .reduce((acc, l) => acc + l.valorEnRiesgo, 0);
    // Consolidado por laboratorio (top 10 por valor en riesgo)
    const mapaLab = new Map();
    lotes.forEach((l) => {
        const clave = l.laboratorio ?? 'Sin laboratorio';
        const actual = mapaLab.get(clave) ?? { laboratorio: clave, lotes: 0, unidades: 0, valor: 0 };
        actual.lotes += 1;
        actual.unidades += l.stock;
        actual.valor += l.valorEnRiesgo;
        mapaLab.set(clave, actual);
    });
    const porLaboratorio = [...mapaLab.values()].sort((a, b) => b.valor - a.valor).slice(0, 10);
    // Control FEFO: por producto, cuál es el lote que debe salir primero
    // y cuánto stock hay en lotes con vencimiento posterior (potencial desvío).
    const mapaProd = new Map();
    lotes.forEach((l) => {
        const actual = mapaProd.get(l.producto.idProducto);
        if (actual) {
            actual.lotes += 1;
            actual.unidades += l.stock;
        }
        else {
            mapaProd.set(l.producto.idProducto, {
                idProducto: l.producto.idProducto,
                producto: l.producto.nombreComercial ?? l.producto.nombreGenerico ?? `Producto ${l.producto.idProducto}`,
                lotes: 1,
                unidades: l.stock,
            });
        }
    });
    const controlFEFO = lotes
        .filter((l) => l.esFEFO)
        .map((loteFEFO) => {
        const info = mapaProd.get(loteFEFO.producto.idProducto);
        const alternativas = lotes.filter((l) => l.producto.idProducto === loteFEFO.producto.idProducto && l.idLote !== loteFEFO.idLote);
        return {
            idProducto: loteFEFO.producto.idProducto,
            producto: info?.producto ?? loteFEFO.producto.nombreComercial,
            idLoteFEFO: loteFEFO.idLote,
            codigoFEFO: loteFEFO.codigo,
            numeroLoteFEFO: loteFEFO.numeroLote,
            fechaVencimientoFEFO: loteFEFO.fechaVencimiento,
            diasRestantesFEFO: loteFEFO.diasRestantes,
            nivelFEFO: loteFEFO.nivel,
            totalLotes: info?.lotes ?? 1,
            stockLotesPosteriores: alternativas.reduce((acc, l) => acc + l.stock, 0),
            valorLotesPosteriores: alternativas.reduce((acc, l) => acc + l.valorEnRiesgo, 0),
        };
    })
        .sort((a, b) => a.diasRestantesFEFO - b.diasRestantesFEFO);
    return {
        totalLotes: lotes.length,
        totalUnidades: lotes.reduce((acc, l) => acc + l.stock, 0),
        valorTotal: lotes.reduce((acc, l) => acc + l.valorEnRiesgo, 0),
        valorEnRiesgo,
        valorCritico,
        porNivel,
        porLaboratorio,
        controlFEFO,
    };
}
exports.default = DataReporteVencimientos;
//# sourceMappingURL=ReporteVencimientosModels.js.map