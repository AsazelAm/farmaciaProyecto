import { data } from 'react-router-dom';
import { string, z } from 'zod'

export const LoginShcema = z.object({
    email: z.string().min(1, {message: 'El Email es Obligatorio'}).email({message: 'Email no valido'}),
    password: z.string().min(8,{message: "Minimo 8 Caracteres"})

});
//Schema de User 

export const UserSchema = z.object({
    id_user : z.number(),
    id_rol: z.number(),
    id_city: z.number().nullable(),
    id_country: z.number().nullable(),  
    name_rol: z.string(),
    nombre: z.string().nullable(),
    apellido: z.string().nullable(),
    Email : z.string().nullable(),
    telefono : z.string().nullable(),
    city : z.string().nullable(),
    pais : z.string().nullable(),
    Estado: z.number(),
})

export const GetUserSchema = z.array(UserSchema)

//Get Alumnos by id 
export const CiudadTypes = z.object({
    id_city: z.number(),
    city: z.string()
})

export const GetCiudadSchema = z.array(CiudadTypes);

//get Docente
export const UserDocente = z.object({
    id_user : z.number(),
    nombre: z.string().nullable(),
    apellido: z.string().nullable()
})

export const GetDocenteSchema = z.array(UserDocente)

//get alumnos
export const UserAlumnos = z.object({
    id_user : z.number(),
    nombre: z.string().nullable(),
    apellido: z.string().nullable(),
    ci:z.number().nullable(),
    Email:z.string().nullable(),
    telefono: z.string().nullable(),
    id_empresa:z.number().nullable(),
    id_city:z.number().nullable(),
    city: z.string().nullable(),
    id_country:z.number().nullable(),
    pais: z.string().nullable()
})

export const GetAlumnnosChema = z.array(UserAlumnos)

//Schema de User Admin
export const GetAdmmin = z.object({
    id_user: z.number(),
    nombre: z.string(),
    id_rol: z.number(),
    CI: z.string().nullable(),
    Email: z.string().nullable(),
    Confirmed: z.number(),
    Estado: z.number().nullable(),
    Passwd: z.string(),
    Passwd_Confirmation: z.string(),
});

export const GetAdminShema = z.array(GetAdmmin.omit({ Passwd: true, Passwd_Confirmation: true }));

const GetAdmmins = z.object({
  id_user: z.number(),
  nombre: z.string().nullable(),   
  id_rol: z.number(),
  apellido: z.string().nullable(), 
  ci: z.number().nullable(),
  telefono: z.string().nullable(), 
  id_city: z.number().nullable(),
  city: z.string().nullable(),  
  pais : z.string().nullable(), 
  Email: z.string().nullable(), 
  Estado: z.number(),
  Passwd: z.string(),
  Passwd_Confirmation: z.string(),
  id_empresa: z.number().nullable(),
  id_country:z.number().nullable()
});

type Admins = z.infer<typeof GetAdmmins>
export type CreateAdmins = Pick<Admins, 'id_rol' | 'telefono' | 'nombre' | 'apellido' | 'Email' | 'ci' | 'id_city'|'pais'|'id_country' | 'Passwd' | 'Passwd_Confirmation' >
export type deleteuser = Pick<Admins, 'id_user'>
export type updateuser = Pick<Admins, 'id_user'|'id_rol' | 'nombre' | 'apellido' | 'Email' | 'id_city'|'pais'|'id_country' | 'telefono'>
//Alumno 
export type CreateStudents = Pick<Admins, 'nombre' | 'apellido' | 'ci' | 'Email' | 'id_city' | 'pais' | 'telefono' | 'id_empresa'|'id_country'>
//alumno Update
export type UpdateStudents=Pick<Admins,'id_user' | 'nombre'| 'apellido' |'ci'| 'id_empresa'| 'Email'  | 'id_city' | 'pais'| 'telefono'  | 'id_country'| 'city'>
//obtener nombre y id de usuarios activos
export const GetUserActive  = z.object({
    id_user: z.number(),
    nombre:z.string(),
})

export const GetUserActiveSchema = z.array(GetUserActive);
//Auth get user 
export const GetAuthUsers  = z.object({
    id_user: z.number(),
    id_rol:z.number(),
    nombre:z.string(),
})

export const GetAuthUserSchema = z.array(GetAuthUsers);


const GetUserShcemass  = z.object({
    id_user: z.number(),
    nombre:z.string(),
    id_rol: z.number(),
    name_rol: z.string(),
    id_municipio: z.number(),
    municipio: z.string(),
    CI: z.string().nullable(),
    Sueldo: z.string().nullable(),
    TipoSueldo: z.string().nullable(),
    F_inicio: z.string().refine(date => !isNaN(Date.parse(date)), { message: "Fecha inválida" }) 
    .transform(date => date.split("T")[0]).nullable(),
    Email: z.string().nullable(),
    Estado:z.number().nullable(),
    Passwd:z.string(),
})

type Users = z.infer<typeof GetUserShcemass>
export type Userss = Pick<Users, 'id_user' | 'nombre' | 'name_rol'| 'municipio' | 'CI' | 'Sueldo' | 'TipoSueldo' | 'F_inicio' | 'Email'>

export type Createuserschema = Pick<Users, 'id_user' | 'nombre' | 'id_rol'| 'id_municipio' | 'CI' | 'Sueldo' | 'TipoSueldo' | 'F_inicio' | 'Email'>

export type CreateUserADM = Pick<Users,  'nombre' | 'id_rol'| 'id_municipio' | 'CI' | 'Sueldo' | 'TipoSueldo' | 'F_inicio' | 'Email'>


export type UpdateEstado = Pick<Users, 'id_user'|'Estado'>
export type AuthUser = Pick<Users, 'Email' | 'Passwd'>
export type AuthRol = Pick<Users, 'id_rol'>


export const GetDiaristas  = z.object({
    id_user: z.number(),
    nombre:z.string()
})

export const GetDiaristaSchema = z.array(GetDiaristas);

//Schema Rol 

export const GetRolSchema = z.object({
    id_rol: z.number(),
    name_rol: z.string()
})

export const GetRolSchemas = z.array(GetRolSchema);

const GetRolObjet = z.object({
    id_rol: z.number(),
    name_rol: z.string()
})

type Rol = z.infer<typeof GetRolObjet>
export type addRol = Pick<Rol, 'name_rol'>

const RolSchema = z.object({
    id_rol: z.number(),
    name_rol: z.string()
})
type Roles = z.infer<typeof RolSchema>
export type Rols = Pick<Roles, 'id_rol' | 'name_rol'>
export type AddRols = Pick<Roles, 'name_rol'>



//Auth Rol 
export const GetRolAuth = z.object({
    name_rol: z.string()
})

export const GetRolAuthShema = z.array(GetRolAuth);

//modalidad
export const Modalidad = z.object({
    id_mod: z.number(),
    modalidad: z.string(),
    Estado: z.number()
})

export const GetModalidadSchema = z.array(Modalidad);


//modalidad calendario 
export const ModalidadCalendario = z.object({
    id_mod: z.number(),
    modalidad: z.string(),
})

export const GetModalidadCalendarioSchema = z.array(ModalidadCalendario);

const ModalidadObject = z.object({
    id_mod: z.number(),
    modalidad: z.string(),
    Estado: z.number()
})

type Modalidades = z.infer<typeof ModalidadObject>
export type AddMod = Pick<Modalidades, 'modalidad'>
export type DeleteModType = Pick<Modalidades, 'id_mod'>
export type UpdateModType = Pick<Modalidades, 'id_mod' | 'modalidad' | 'Estado'>

//areas de conocimiento 
export const Areas = z.object({
    id_areas: z.number(),
    n_area: z.string()
})

export const AreasSchema = z.array(Areas);

const AreasObjetcs = z.object({
    id_areas: z.number(),
    n_area: z.string()
})
type AreasConocimiento = z.infer<typeof AreasObjetcs>
export type addAreas = Pick<AreasConocimiento, 'n_area'>
export type DeleteAreasType = Pick<AreasConocimiento, 'id_areas'>
export type UpdateAreasType = Pick<AreasConocimiento, 'id_areas' | 'n_area'>

//docentes
export const Docentes = z.object({
    id_user: z.number(),
    nombre: z.string().nullable(),
    apellido: z.string().nullable(),
    formacion: z.string().nullable(),
})

export const DocentesSchema = z.array(Docentes);

//Habilidades
export const Habilidades = z.object({
    id_habi: z.number(),
    n_habilidad: z.string(),
})

export const HabilidadesSchema = z.array(Habilidades);

//typeHabilidaRegistreDocente
const HabilidadesShemaObjt=z.object({
    id_habi:z.number(),
    n_habilidad:z.string()
})
type typeHabilidades=z.infer<typeof HabilidadesShemaObjt>
export type  CreateHabiDoce=Pick<typeHabilidades,'n_habilidad'>

//Habilidades
export const Habilidades2 = z.object({
    id_dochabi: z.number(),
    n_habilidad: z.string(),
})
export const HabilidadesSchema2 = z.array(Habilidades2);



//Propuesta de valor 
export const Pvtype = z.object({
    id_pv: z.number(),
    nombre: z.string(),
    identificador: z.string(),
    status: z.number(),
    logo: z.string().nullable(),
    imglogoModal: z.string().nullable(),
    imgbanner: z.string().nullable(),
    imgCuadro: z.string().nullable(),
})

export const pvSchema = z.array(Pvtype);

const Pvtypeoj = z.object({
    id_pv: z.number(),
    nombre: z.string(),
    identificador: z.string(),
    logo: z.any().nullable(),
    imglogoModal: z.any().nullable(),
    imgbanner: z.any().nullable(),
    imgCuadro: z.any().nullable(),
    status:z.number().nullable()
})

type typepv = z.infer<typeof Pvtypeoj>
export type UpdateTypePv = Pick<typepv, 'id_pv'|'nombre'|'identificador'|'logo'|'imglogoModal'|'imgbanner'|'imgCuadro'|'status'>
export type DeleteTypePv = Pick<typepv, 'id_pv'>
//propuesta calendario 
export const PvCalendario = z.object({
    id_pv: z.number(),
    nombre: z.string(),
})

export const PvCalendarioSchema = z.array(PvCalendario);


export const CertificacionShema = z.object({
    id_cert : z.number(),
    n_cert: z.string().nullable(),
    opcion: z.string().nullable(),
    nota : z.string().nullable(),
    tipo : z.string().nullable(),
})

export const GetSchemaCertificacion = z.array(CertificacionShema)

const CertificacionShemaObjt = z.object({
    id_cert : z.number(),
    n_cert: z.string().nullable(),
    opcion: z.string().nullable(),
    nota : z.string().nullable(),
    tipo : z.string().nullable(),
})

type typeCertificacion = z.infer<typeof CertificacionShemaObjt>
export type CreateCert = Pick<typeCertificacion, 'n_cert' | 'opcion' | 'nota' | 'tipo'>
export type DeleteCert = Pick<typeCertificacion, 'id_cert'>
export type UpdateCert = Pick<typeCertificacion, 'id_cert'| 'n_cert' | 'nota' | 'opcion'| 'tipo'>

//CURSO
const CursoBase = z.object({
  id_curso: z.number(),
  n_curso: z.string().nullable(),
  codigo: z.string().nullable(),
  duracion: z.number().nullable(),
  precio: z.number().nullable(),
  img: z.string().nullable(),
  descripcion: z.string().nullable(),
});

const Secciones = z.object({
  audiencia: z.string().nullable(),
  objetivos: z.string().nullable(),
  prerequisitos: z.string().nullable(),
  certificaciones: z.string().nullable(),
  contenido: z.string().nullable(),
  beneficios: z.string().nullable(),
  inversion: z.string().nullable(),
});

export const CursoDetailsOpcionA = z.object({
  curso: CursoBase,
  secciones: Secciones,
  areas: z.array(z.object({ id_areas: z.number(), n_area: z.string().nullable() })),
  propuestas: z.array(z.object({ id_pv: z.number(), nombre: z.string().nullable() })),
});
export type CursoDetailsA = z.infer<typeof CursoDetailsOpcionA>;

//type de examen
export const ExamenArrays=z.object({
    id_exa:z.number(),
    Examen:z.string().nullable(),
    codigo:z.string().nullable(),
    Curso:z.string().nullable(),
    Estado:z.number().nullable()
    
})
export const GetExamenArrays=z.array(ExamenArrays)


//type de examen
const ExamenObjet=z.object({
    id_exa:z.number(),
    Examen:z.string().nullable(),
    codigo:z.string().nullable(),
    Curso:z.string().nullable(),
    Estado:z.string().nullable()
})

type Typeexamen=z.infer<typeof ExamenObjet>
export type CreateExa=Pick<Typeexamen,'codigo' | 'Examen' | 'Curso'>
export type DeleteExa = Pick<Typeexamen,'id_exa'>
export type UpdateExame=Pick<Typeexamen, 'id_exa'|'Examen'|'codigo'|'Curso'>


export const CursoCalendarioSchema=z.object({
    id_curso:z.number(),
    n_curso:z.string().nullable(),
    
})
export const GetSchameCursoCalendario=z.array(CursoCalendarioSchema)
//modalidad
export const ModCalendario = z.object({
    id_mod: z.number(),
    modalidad: z.string(),
})

export const ModCalendarioSchema = z.array(ModCalendario);

//City
export const CityCalendario = z.object({
    id_city: z.number(),
    city: z.string(),
})

export const CityModalidadSchema = z.array(CityCalendario);

//empresa alumnos 

export const GetEmpresa = z.object({
    id_empresa: z.number(),
    n_emp:z.string()
})

export const GetEmpresaSchema = z.array(GetEmpresa);

//Pais Country
export const GetCountryP = z.object({
    id_country: z.number(),
    pais:z.string()
})
export const GetCountrySchema=z.array(GetCountryP);



//Registra docente
export const RegistrarDocente =z.object({
    id_docente:z.number(),
    nombre:z.string(),
    apellido:z.string(),
    correo:z.string(),
    password:z.string()
})
export const redocShema=z.array(RegistrarDocente);
//RegistrarDocente
const GetRegiDocente=z.object({
    id_docente:z.number(),
    nombre:z.string(),
    apellido:z.string(),
    telefono:z.string(),
    correo:z.string(),
    password:z.string(),
    confirmPassword:z.string()
})
type Docente =z.infer<typeof GetRegiDocente>
export type AuthDocente =Pick<Docente, 'nombre'|'apellido'|'correo'|'password'| 'telefono'|'confirmPassword'>

//CertificacionDocentePerfil
export const CertifiDocentShema=z.object({
    id_certidoc:z.number(),
    nombre:string(),
    institucion:z.string(),
    fechaFin: string(),
    fechaIni: string()
})
export const certiDoceShema=z.array(CertifiDocentShema);

const CertiDocenteObjt=z.object({
    id_certidoc:z.number(),
    nombre:string(),
    institucion:z.string(),
    fechaFin: string(),
    fechaIni: string()
})
type CertiDoce=z.infer<typeof CertiDocenteObjt>
export type CreateCertiDoc=Pick<CertiDoce,'nombre'|'institucion'|'fechaIni'|'fechaFin'>

//Referencia Docente
export const ReferenciaShema=z.object({
    id_referen:z.number(),
    nombre:z.string(),
    cargo: z.string(),
    telefono:z.string()
})
export const referenciaShema=z.array(ReferenciaShema);

const RerenciaObjet=z.object({
    id_referen:z.number(),
    nombre:z.string(),
    cargo: z.string(),
    telefono:z.string()
})
type Referencia=z.infer<typeof RerenciaObjet>
export type CreateReferencia=Pick<Referencia,'nombre'|'cargo'|'telefono'>

//Get CursoInscritos
export const DocenteCursoInsShema=z.object({
    id_curso:z.number(),
    id_calendario:z.number(),
    n_curso:z.string().nullable(),
    codigo:z.string().nullable(),
    id_user:z.number(),
    nombre:z.string().nullable(),
})
export const GetDocCursInsc=z.array(DocenteCursoInsShema);

//Get AlumnAsistencia
export const AlumnosAsisShema=z.object({
    id_asistencia: z.number().nullable().optional(),
    id_user:z.number(),
    nombre:z.string().nullable(),
    apellido:z.string().nullable(),
    fecha_asistencia:z.string().refine(date=>!Number.isNaN(Date.parse(date)),{message:"Fecha invalida"}).transform(date => date.split("T")[0]).nullable(),
    asistencia:z.string().nullable(),
    id_calendario:z.number(),

})
export const GetAlumAsis=z.array(AlumnosAsisShema);


const AlumnosAsistencia=z.object({
    id_asistencia:z.number().nullable(),
    id_user:z.number(),
    fecha_asistencia:z.string().nullable(),
    asistencia:z.string().nullable(),
    id_calendario:z.number(),

})
type AlumnAsistencia =z.infer<typeof AlumnosAsistencia>
export type CreateAsistencia=Pick<AlumnAsistencia, 'asistencia' | 'fecha_asistencia'|'id_user'|'id_calendario'>
export type UpdateAsisAlum=Pick<AlumnAsistencia,'id_asistencia'|'asistencia' | 'fecha_asistencia'| 'id_calendario' | 'id_user'>

export const GetNotasAluShema=z.object({
    id_nota:z.number().nullable(),
    id_user:z.number(),
    id_calendario:z.number(),
    nota:z.string().nullable(),
})
export const GetNotasAlum=z.array(GetNotasAluShema);

const NotasAlums= z.object({
    id_nota :z.number(),
    nota:z.string().nullable(),
    id_user:z.number(),
    id_calendario:z.number()
})
type NotasAlum = z.infer<typeof NotasAlums>
export type CreateNotaAl=Pick<NotasAlum, 'nota'| 'id_calendario'| 'id_user'>
export type UpdateNotaAl=Pick<NotasAlum, 'nota'| 'id_nota'|'id_calendario'|'id_user'>
//calendario
export const GetCalendarioModels = z.object({
    id_calendario: z.number(),
    FechaIni:z.string().refine(date => !Number.isNaN(Date.parse(date)), { message: "Fecha inválida" }) 
    .transform(date => date.split("T")[0]),
    n_curso: z.string(),
    nombre: z.string(),
    modalidad: z.string(),
    id_pv: z.number(),
    docente: z.number(),
    id_mod: z.number(),
    id_country: z.number(),
    id_city: z.number(),
    Estado: z.string(),
    Horaini: z.string(),
    horaFin: z.string(),
    Dias: z.string().nullable(),
    id_curso: z.number(),
})
export const GetCalendarioSchema=z.array(GetCalendarioModels);

const CalendarioObjetc = z.object({
    id_calendario: z.number(),
    FechaIni:z.string().refine(date => !Number.isNaN(Date.parse(date)), { message: "Fecha inválida" }) 
    .transform(date => date.split("T")[0]),
    n_curso: z.string(),
    nombre: z.string(),
    modalidad: z.string(),
    id_pv: z.number(),
    docente: z.number(),
    id_mod: z.number(),
    id_country: z.number(),
    id_city: z.number(),
    Estado: z.string(),
    Horaini: z.string(),
    horaFin: z.string(),
    Dias: z.string().nullable(),
    id_curso: z.number(),
})

type AreaConocimientoItem = {
  id_areas: number;
};

type PropuestaValorItem = {
  id_pv: number;
};

type calendarioType = z.infer<typeof CalendarioObjetc>
export type UpdateCalendarioType  = Pick<calendarioType, 'id_calendario' | 'FechaIni' | 'modalidad' | 'n_curso' | 'nombre' | 'id_pv' | 'docente' | 'id_mod'| 'id_country'| 'id_city' | 'Estado'| 'Horaini' | 'horaFin'| 'Dias' | 'id_curso'>
export type UpdateCalendarioExtendedType = UpdateCalendarioType & {
  AreasConocimientos: AreaConocimientoItem[];
  ProPuestasDeValor: PropuestaValorItem[];
};

//calendario views
export const GetViewAreas = z.object({
    id_vca: z.number(),
    id_calendario: z.number(),
    id_areas: z.number(),
    id_curso:z.number(),
    n_area: z.string()
})
export const GetViewAreaSchema=z.array(GetViewAreas);

export const GetViewPro = z.object({
    id_vcp: z.number(),
    id_calendario: z.number(),
    id_pv: z.number(),
    id_curso:z.number(),
    nombre: z.string()
})
export const GetViewProSchema=z.array(GetViewPro);

export const GetCalendarioBy = z.object({
    id_calendario: z.number(),
    Horaini: z.string(),
    horaFin: z.string(),
    FechaIni: z.coerce.date().transform(date => date.toISOString().split("T")[0]),
    Dias: z.string(),
    modalidad: z.string(),
    propuesta: z.string(),
    n_curso: z.string(),
    nombre: z.string(),
    apellido: z.string(),
    city: z.string(),
    aprobado: z.string()
})
export const GetCalendarioBySchema =z.array(GetCalendarioBy);

//Antiguo Sistema consulta
export const GetCursoMoodle=z.object({
    id: z.string().transform((val) => BigInt(val)),
    fullname:z.string(),
    shortname:z.string()

})
export const GetCursoMoodleSchema = z.array(GetCursoMoodle);


//GET alumno MOODLE
export const GetAlumnoMoodle=z.object({
    courseid: z.string().transform((val) => BigInt(val)),
    fullname:z.string(),
    username:z.string(),
    userid:z.string().transform((val) => BigInt(val)),
    nombre:z.string(),
    apellido:z.string(),
    mail:z.string(),
    phone1:z.string()

})
export const GetAlumnoMoodleSchema = z.array(GetAlumnoMoodle);