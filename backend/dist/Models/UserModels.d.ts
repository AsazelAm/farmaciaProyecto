interface CreateAdmins {
    ci: string;
    nombre: string;
    apellido: string;
    passwd: string;
    telefono: string;
    email: string;
    idTipoUs: number;
    idSucursal: number;
}
interface UpdateAdmins {
    idUsuario: number;
    ci: string;
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
    idTipoUs: number;
    idSucursal: number;
}
declare const DataUser: {
    UserAllModels(): Promise<any>;
    UserAllModelsId(idUsuario: any): Promise<any>;
    GetEmail(email: string): Promise<{
        exists: boolean;
        message: string;
    } | {
        exists: boolean;
        message?: undefined;
    }>;
    VerifedConfirmed(email: any): Promise<{
        exists: boolean;
    }>;
    GetPasswd(email: string): Promise<any>;
    GetPasswdById(idUsuario: number): Promise<any>;
    ResetPasswd(Passwd: any, idUser: any): Promise<string>;
    GetIdRol(email: string): Promise<any>;
    GetCI(CI: string): Promise<{
        exists: boolean;
        message: string;
    } | {
        exists: boolean;
        message?: undefined;
    }>;
    CreateUsuarioM(Usuario: CreateAdmins): Promise<number>;
    UpdateRutaimg(ruta: string, idUsuario: number | string): Promise<string>;
    DeleteUserId(id: any): Promise<string>;
    UpodateUserbyId(data: UpdateAdmins): Promise<string>;
};
export default DataUser;
