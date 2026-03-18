interface DataDocentes {
    nombre: string;
    apellido: string;
    celular: string;
    url: string;
    formacion: string;
    descripcion: string;
    honorarios: string;
    Email: string;
}
declare const DataDocentes: {
    GetDocentes(): Promise<any>;
    GetDocenteById(id: string): Promise<any>;
    Verificar(email: string): Promise<number>;
    VerificarEmailUpdate(email: string, id: string): Promise<number>;
    Gethabilidades(id: string): Promise<any>;
    AddDocenteModels(data: DataDocentes): Promise<number>;
    UpdateDocenteModels(id: string, data: DataDocentes): Promise<void>;
    addDochabi(idUser: number | string, idHabi: number | string): Promise<void>;
    DeleteDochabi(idUser: string): Promise<void>;
    UpdateRutaimg(ruta: string, id: number | string): Promise<void>;
    UpdateCvRuta(ruta: string, id: number | string): Promise<void>;
    DeleteDocentes(id: string): Promise<string>;
};
export default DataDocentes;
