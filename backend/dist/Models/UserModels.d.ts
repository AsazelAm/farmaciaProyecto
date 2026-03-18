interface CreateAdmins {
    id_rol: number;
    nombre: string;
    apellido: string;
    ci: number;
    Email: string;
    Passwd: string;
    telefono: string;
    id_city: number;
    id_country: number;
}
interface UpdateAdmins {
    id_rol: number;
    nombre: string;
    apellido: string;
    Email: string;
    telefono: string;
    id_city: number;
    id: string;
}
interface CreateAlumnos {
    nombre: string;
    apellido: string;
    ci: number;
    Email: string;
    telefono: string;
    id_empresa: number;
    id_city: number;
    id_country: number;
}
interface UpdateEstudiantes {
    nombre: string;
    apellido: string;
    Email: string;
    telefono: string;
    ci: number;
    id_empresa: number;
    id_city: number;
    id: string;
}
declare const DataUser: {
    UserAllModels(): Promise<any>;
    GetEmail(Email: string): Promise<{
        exists: boolean;
        message: string;
    } | {
        exists: boolean;
        message?: undefined;
    }>;
    VerifedConfirmed(Email: any): Promise<{
        exists: boolean;
    }>;
    GetPasswd(Email: any): Promise<any>;
    ResetPasswd(Passwd: any, idUser: any): Promise<string>;
    GetIdRol(Email: any): Promise<any>;
    GetCI(CI: string): Promise<{
        exists: boolean;
        message: string;
    } | {
        exists: boolean;
        message?: undefined;
    }>;
    CreateAdmins(Admins: CreateAdmins): Promise<string>;
    DeleteUserId(id: any): Promise<string>;
    UpodateUserbyId(data: UpdateAdmins): Promise<string>;
    GetDocentesModels(): Promise<any>;
    RolAllModels(): Promise<any>;
    addRol(rol: any): Promise<string>;
    DeleteRol(id: any): Promise<string>;
    UpdateRolModels(id: any, rol: any): Promise<string>;
    GetAlumnosModels(): Promise<any>;
    GetCityCoun(idcontry: any): Promise<any>;
    createStudentsModels(data: CreateAlumnos): Promise<string>;
    UpdateStudentsModels(data: UpdateEstudiantes): Promise<string>;
};
export default DataUser;
