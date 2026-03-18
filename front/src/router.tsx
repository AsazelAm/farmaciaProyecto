import {HashRouter, Routes, Route} from "react-router-dom"
import Logins from "./view/Login"
import RegisterDocente from "./view/RegisterDocente";
import Main from "./layouts/Main"
import Aside from "./layouts/Aside"
import Dashboard from "./view/Dashboard/Admin/Dashboard"
import User from "./view/Dashboard/Admin/User/User"
import Rol from "./view/Dashboard/Admin/User/Rol"
import Modalidad from "./view/Dashboard/Admin/Administracion/Modalidad"
import Areas from "./view/Dashboard/Admin/Administracion/Areas"
import ViewDocentes from "./view/Dashboard/Admin/Docentes/ViewDocentes"
import Pv from "./view/Dashboard/Admin/PropuestaValor/Pv";
import Cursos from "./view/Dashboard/Admin/PropuestaValor/Cursos";
import Certificacion from "./view/Dashboard/Admin/PropuestaValor/Certificacion"
import Test from "./view/Dashboard/Admin/PropuestaValor/test"
import Calendario from "./view/Dashboard/Admin/Calendario/Calendario";
import Alumnos from "./view/Dashboard/Admin/Curso Presencial/Alumnos";
import Blogs from "./view/Dashboard/Admin/Blogs/Blogs";
import BlogEditor from "./Components/BlogEditor/BlogEditor";
import CognosVirtual from "./view/Dashboard/Admin/VIRTUAL/CognosVirtual"
import DocenteVeriCode from "./Components/DocenteRegistrar/DocenteCodVerificacion";
import PerfilDocente from "./Components/DocenteRegistrar/PerfilDocente";
import CursosMoodle from "./view/Dashboard/Admin/VIRTUAL/CursosMoodle";
import AlumnoMoodle from "./view/Dashboard/Admin/VIRTUAL/AlumnoMoodle";

//vistaCursoInscritos DOCENTE
import CursoInscritos from "./view/Dashboard/Admin/CursoInscritos/CursoInscritos";
import AlumnosCursoIns from "./view/Dashboard/Admin/CursoInscritos/AlumnosCursoIns";


//vistaAsesor
import CalendarioAsesor from "./view/Dashboard/Admin/Calendario/CalendarioAsesor";


//VistaAcademico
import CalendarioAcademico from "./view/Dashboard/Admin/Calendario/CalendarioAcademico";


import AsideD from "./layouts/AsideD";
import AsideA from "./layouts/AsideA";
import AsideC from "./layouts/AsideC";

export default function Router() {
  return (
    <HashRouter>
        <Routes>
            <Route element={<Main/>}>
              <Route path="/"  element={<Logins/>} index/>
              {/* registerDocente */}
              <Route path="/Register/Docente" element={<RegisterDocente/>}/>
              <Route path="/Codigo/Verificacion/:id" element={<DocenteVeriCode/>}/>
            </Route>
            <Route element={<Aside/>}>
              <Route path="/Dashboard"  element={<Dashboard/>} index/>
              <Route path="/Dashboard/Usuarios"  element={<User/>}/>
              <Route path="/Dashboard/Roles"  element={<Rol/>}/>
              <Route path="/Dashboard/Modalidad"  element={<Modalidad/>}/>
              <Route path="/Dashboard/AreasConocimiento"  element={<Areas/>}/>
              <Route path="/Dashboard/List/Docentes"  element={<ViewDocentes/>}/>
              <Route path="/Dashboard/PropuestaValor"  element={<Pv/>}/>
              <Route path="/Dashboard/Cursos"  element={<Cursos/>}/>
              <Route path="/Dashboard/Certificacion"  element={<Certificacion/>}/>
              <Route path="/Dashboard/Examen"  element={<Test/>}/>
              <Route path="/Dashboard/Calendario" element={<Calendario/>}/>
              <Route path="/Dashboard/Curso/Presencial" element={<Alumnos/>}/>
              <Route path="/Dashboard/Blogs" element={<Blogs/>}/>

              <Route path="/Dashboard/virtual/Alumnos" element={<CognosVirtual/>}/>
              <Route path="/Dashboard/virtual/CursosMoodle" element={<CursosMoodle/>}/>
              <Route path="/Dashboard/virtual/AlumnoMoodle" element={<AlumnoMoodle/>}/>
              <Route path="/Dashboard/BlogEditor" element={<BlogEditor/>}/>
              {/* RUTA PARA EDITAR BLOG EXISTENTE (con ID dinámico) */}
              <Route path="/Dashboard/BlogEditor/:id" element={<BlogEditor/>}/>
            </Route>


            {/* layout para docente */}
            <Route element={<AsideD/>}>
              <Route path="/Docente" element={<PerfilDocente/>} index/>
              <Route path="/Docente/CursoInscritos" element={<CursoInscritos/>}/>
              <Route path="/Docente/AlumnosInscritos/:id_calendario" element={<AlumnosCursoIns />}/>
            </Route>


            {/* layout para Academico */}
            <Route element={<AsideA/>}>
              <Route path="/Academico"element={<CalendarioAcademico/>}/>
            </Route>


            {/* layout para asesores comerciales]*/}
            <Route element={<AsideC/>}>
              <Route path="/Asesor" element={<CalendarioAsesor/>}/>
            </Route>



        </Routes>
    </HashRouter>
  )
}
