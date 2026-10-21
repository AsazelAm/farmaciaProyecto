export declare const CODIGO_VIGENCIA_MINUTOS = 5;
export declare const CODIGO_MAX_INTENTOS = 3;
declare const DataCodigo: {
    GuardarCodigo(codigo: string, email: string): Promise<boolean>;
    ObtenerCodigo(email: string): Promise<any>;
    IncrementarIntentos(email: string): Promise<boolean>;
    LimpiarCodigo(email: string): Promise<boolean>;
};
export default DataCodigo;
