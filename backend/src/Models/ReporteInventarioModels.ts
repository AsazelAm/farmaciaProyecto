import conectar from '../config/db';
import { sqlNombreGenerico, sqlConcentracion } from './ProductoDerivado';

export interface IFiltrosInventario {
    idLaboratorio?: number | null;
    idTipoProducto?: number | null;
    busqueda?: string | null;
    soloConStock?: boolean;
}

function num(valor: any, porDefecto = 0): number {
    const n = Number(valor);
    return Number.isFinite(n) ? n : porDefecto;
}

function idValido(valor: any): number | null {
    if (valor === undefined || valor === null || valor === '') return null;
    const n = Number(valor);
    return Number.isInteger(n) && n > 0 ? n : null;
}

const SELECT_LOTES = `
    SELECT
        l.idLote,
        l.numeroLote,
        l.codigo,
        l.stock,
        l.precioCompra,
        DATE_FORMAT(l.fechaVencimiento, '%Y-%m-%d') AS fechaVencimiento,
        pr.idProducto,
        pr.nombreComercial,
        ${sqlNombreGenerico('pr')} AS nombreGenerico,
        ${sqlConcentracion('pr')} AS concentracion,
        lab.idLaboratorio,
        lab.nombre AS laboratorio,
        tp.idTipoProd,
        tp.nombre AS tipoProducto
    FROM lote l
    INNER JOIN producto pr ON pr.idProducto = l.idProducto
    INNER JOIN laboratorio lab ON lab.idLaboratorio = pr.idLaboratorio
    LEFT JOIN productotipoproducto ptp ON ptp.idProducto = pr.idProducto
    LEFT JOIN tipoproducto tp ON tp.idTipoProd = ptp.idTipoProd
`;

const DataReporteInventario = {
    async getParametros() {
        const conection = await conectar.getConnection();
        try {
            const [laboratorios, tipos] = await Promise.all([
                conection.query(`SELECT idLaboratorio, nombre FROM laboratorio WHERE estado = 1 ORDER BY nombre ASC`),
                conection.query(`SELECT idTipoProd, nombre FROM tipoproducto WHERE estado = 1 ORDER BY nombre ASC`),
            ]);
            return {
                laboratorios: (laboratorios as any[]).map((l) => ({ idLaboratorio: num(l.idLaboratorio), nombre: l.nombre })),
                tiposProducto: (tipos as any[]).map((t) => ({ idTipoProd: num(t.idTipoProd), nombre: t.nombre })),
            };
        } finally {
            conection.release();
        }
    },

    async getDatos(filtros: IFiltrosInventario) {
        const conection = await conectar.getConnection();
        const params: any[] = [];
        let where = '';
        if (filtros.soloConStock !== false) {
            where += ` AND l.stock > 0`;
        }
        const idLaboratorio = idValido(filtros.idLaboratorio);
        if (idLaboratorio !== null) {
            where += ` AND pr.idLaboratorio = ?`;
            params.push(idLaboratorio);
        }
        const idTipoProducto = idValido(filtros.idTipoProducto);
        if (idTipoProducto !== null) {
            where += ` AND tp.idTipoProd = ?`;
            params.push(idTipoProducto);
        }
        const busqueda = typeof filtros.busqueda === 'string' ? filtros.busqueda.trim() : '';
        if (busqueda !== '') {
            const like = `%${busqueda}%`;
            where += ` AND (l.codigo LIKE ? OR l.numeroLote LIKE ? OR pr.nombreComercial LIKE ? OR ${sqlNombreGenerico('pr')} LIKE ?)`;
            params.push(like, like, like, like);
        }
        const rows = await conection.query(`${SELECT_LOTES} WHERE 1=1 ${where} ORDER BY tp.nombre ASC, lab.nombre ASC, pr.nombreComercial ASC, l.idLote ASC`, params);
        conection.release();

        const lotes = (rows as any[]).map((r) => {
            const stock = num(r.stock);
            const costo = num(r.precioCompra);
            return {
                idLote: num(r.idLote),
                codigo: r.codigo,
                numeroLote: r.numeroLote,
                stock,
                costoUnitario: costo,
                subtotal: stock * costo,
                fechaVencimiento: r.fechaVencimiento,
                producto: {
                    idProducto: num(r.idProducto),
                    nombreComercial: r.nombreComercial,
                    nombreGenerico: r.nombreGenerico,
                    concentracion: r.concentracion,
                },
                idLaboratorio: num(r.idLaboratorio),
                laboratorio: r.laboratorio,
                idTipoProducto: num(r.idTipoProd),
                tipoProducto: r.tipoProducto,
            };
        });

        const porTipo = new Map<string, { tipoProducto: string; lotes: number; unidades: number; valor: number }>();
        const porLaboratorio = new Map<string, { laboratorio: string; lotes: number; unidades: number; valor: number }>();
        const porProducto = new Map<number, { idProducto: number; producto: string; lotes: number; unidades: number; valor: number }>();
        lotes.forEach((l) => {
            const t = porTipo.get(l.tipoProducto ?? 'Sin tipo') ?? { tipoProducto: l.tipoProducto ?? 'Sin tipo', lotes: 0, unidades: 0, valor: 0 };
            t.lotes += 1; t.unidades += l.stock; t.valor += l.subtotal; porTipo.set(l.tipoProducto ?? 'Sin tipo', t);
            const lb = porLaboratorio.get(l.laboratorio ?? 'Sin laboratorio') ?? { laboratorio: l.laboratorio ?? 'Sin laboratorio', lotes: 0, unidades: 0, valor: 0 };
            lb.lotes += 1; lb.unidades += l.stock; lb.valor += l.subtotal; porLaboratorio.set(l.laboratorio ?? 'Sin laboratorio', lb);
            const p = porProducto.get(l.producto.idProducto) ?? { idProducto: l.producto.idProducto, producto: l.producto.nombreComercial ?? l.producto.nombreGenerico ?? `Producto ${l.producto.idProducto}`, lotes: 0, unidades: 0, valor: 0 };
            p.lotes += 1; p.unidades += l.stock; p.valor += l.subtotal; porProducto.set(l.producto.idProducto, p);
        });

        return {
            parametros: { idLaboratorio, idTipoProducto, busqueda, soloConStock: filtros.soloConStock !== false },
            lotes,
            resumen: {
                totalLotes: lotes.length,
                totalUnidades: lotes.reduce((a, l) => a + l.stock, 0),
                valorTotal: lotes.reduce((a, l) => a + l.subtotal, 0),
                porTipoProducto: [...porTipo.values()].sort((a, b) => b.valor - a.valor),
                porLaboratorio: [...porLaboratorio.values()].sort((a, b) => b.valor - a.valor),
                porProducto: [...porProducto.values()].sort((a, b) => b.valor - a.valor),
            },
        };
    },
};

export default DataReporteInventario;
export { idValido };