export type MotivoDevVenta = 'error_dispensacion' | 'reaccion_adversa' | 'producto_danado' | 'producto_vencido' | 'receta_invalida' | 'arrepentimiento' | 'otro';
export type DestinoDevVenta = 'reingreso_stock' | 'merma' | 'cuarentena';
export declare const MOTIVOS_DEVOLUCION: Record<MotivoDevVenta, string>;
export declare const DESTINOS_DEVOLUCION: Record<string, string>;
export declare const ESTADOS_DEVOLUCION: Record<string, string>;
export interface IFiltrosDevoluciones {
    fechaInicio?: string | null;
    fechaFin?: string | null;
    motivo?: string | null;
    estado?: string | null;
    idUsuario?: number | null;
    idCliente?: number | null;
    idLaboratorio?: number | null;
    idTipoProducto?: number | null;
    producto?: string | null;
    cliente?: string | null;
    busqueda?: string | null;
}
declare function num(valor: any, porDefecto?: number): number;
declare function idValido(valor: any): number | null;
declare const DataReporteDevoluciones: {
    getParametros(): Promise<{
        motivos: {
            value: string;
            label: string;
        }[];
        destinos: {
            value: string;
            label: string;
        }[];
        estados: {
            value: string;
            label: string;
        }[];
        usuarios: {
            idUsuario: number;
            nombre: any;
        }[];
        clientes: {
            idCliente: number;
            nombre: any;
        }[];
        laboratorios: {
            idLaboratorio: number;
            nombre: any;
        }[];
        tiposProducto: {
            idTipoProd: number;
            nombre: any;
        }[];
    }>;
    getDatos(filtros: IFiltrosDevoluciones): Promise<{
        parametros: {
            fechaInicio: string;
            fechaFin: string;
            motivo: string;
            estado: string;
            idUsuario: number;
            idCliente: number;
            idLaboratorio: number;
            idTipoProducto: number;
            producto: string;
            cliente: string;
            busqueda: string;
        };
        detalles: {
            idDevolucionVenta: number;
            numeroDevolucion: string;
            fechaCreacion: any;
            fechaResolucion: any;
            tipo: any;
            motivo: any;
            motivoLabel: string;
            estado: any;
            estadoLabel: any;
            montoReembolso: number;
            metodoReembolso: any;
            numeroNotaCredito: any;
            observaciones: any;
            idVenta: number;
            numeroFactura: any;
            fechaVenta: any;
            estadoVenta: any;
            idCliente: number;
            cliente: any;
            clienteCi: any;
            idUsuario: number;
            usuario: any;
            idCajero: number;
            cajero: any;
            idLote: number;
            codigoLote: any;
            numeroLote: any;
            fechaVencimiento: any;
            idProducto: number;
            codigoBarra: any;
            nombreComercial: any;
            nombreGenerico: any;
            concentracion: any;
            presentacion: any;
            cantidad: number;
            precioUnitario: number;
            montoDevuelto: number;
            destino: any;
            destinoLabel: string;
            idLaboratorio: number;
            laboratorio: any;
            idTipoProducto: number;
            tipoProducto: any;
        }[];
        resumen: {
            totalDevoluciones: number;
            totalLineas: number;
            totalUnidades: any;
            montoTotalDevuelto: any;
            montoPromedio: number;
            porMotivo: {
                motivo: string;
                etiqueta: string;
                devoluciones: number;
                lineas: number;
                unidades: number;
                monto: number;
            }[];
            porDestino: {
                destino: string;
                etiqueta: string;
                devoluciones: number;
                lineas: number;
                unidades: number;
                monto: number;
            }[];
            porLaboratorio: {
                idLaboratorio: number;
                laboratorio: string;
                unidades: number;
                monto: number;
            }[];
            topProductos: {
                idProducto: number;
                producto: string;
                unidades: number;
                monto: number;
            }[];
            topUsuarios: {
                idUsuario: number;
                usuario: string;
                devoluciones: number;
                unidades: number;
                monto: number;
            }[];
        };
    }>;
};
export default DataReporteDevoluciones;
export { idValido, num };
