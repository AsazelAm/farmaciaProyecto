// Aside.tsx (Refactorizado)
import { useNavigate, Navigate, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useAuth } from "../Hook/UseAuth";
import Loading from "../Helpers/Loading";
import user from "../assets/group.png"
import rol from "../assets/gestion.png";
import 'react-toastify/dist/ReactToastify.css';
import NavItem from "./Admin/NavItem";
import SubMenu from "./Admin/SubMenu";
import ADM from "../assets/administracion.png";
import Moda from "../assets/lista-modal.png";
import docentes from "../assets/profesores.png";
import listDoce from "../assets/instructor.png";
import catalogo from "../assets/catalogar.png";
import pv from "../assets/categoria.png";
import cursos from "../assets/curso-online.png";
import certificacion from "../assets/certificacion-de-calidad.png";
import test from "../assets/opcion-multiple.png";
import calendario from "../assets/calendario.png";
import calendarioaprobado from "../assets/calendarioaprobar.png";
import cp from "../assets/cursos-presenciales.png";
import bl from "../assets/blogs.png"
import alumnos from "../assets/alumnos.png";


export default function   Aside() {
  const navigate = useNavigate();
  const { data, isError, isLoading } = useAuth();
  const Rol = data?.name_rol;

  

  const handleLogout = () => {
    localStorage.removeItem('AUTH_TOKEN');
    localStorage.removeItem('FTU');
    globalThis.location.href = globalThis.location.origin;
  }

  if (isLoading) return <Loading />;
  if (isError) return <Navigate to="/" />;

  if (Rol !== 'Admin') {
    navigate("/");
    return;
  }

  return (
    <div className="flex bg-[#DEEAFF]">
      <aside className="group w-[70px] hover:w-[254px] h-screen max-h-screen overflow-y-auto 
      overflow-x-hidden rounded-r-2xl border-r-2 border-gray clei bg-[#00155C] flex flex-col 
      justify-between transition-all duration-300">
        <nav className="py-10 flex flex-col gap-2">
          {/* <ul>
             <NavItem to="/Dashboard/Usuarios" icon={user} label="Usuarios" />
          </ul> */}
          <SubMenu icon={ADM} label="Administracion">
            <NavItem to="/Dashboard/Modalidad" icon={Moda} label="Modalidad" />
            <NavItem to="/Dashboard/AreasConocimiento" icon={user} label="Areas de Conocimientos" />
          </SubMenu>
          <SubMenu icon={user} label="Usuarios">
            <NavItem to="/Dashboard/Roles" icon={rol} label="Roles" />
            <NavItem to="/Dashboard/Usuarios" icon={user} label="Users" />
          </SubMenu>
          <SubMenu icon={docentes} label="Docentes">
            <NavItem to="/Dashboard/List/Docentes" icon={listDoce} label="Lista de Docentes" />
            <NavItem to="/Dashboard/Informe/Docentes" icon={user} label="Informe de Docentes" />
          </SubMenu>
          <SubMenu icon={catalogo} label="Catalogo de Cursos">
            <NavItem to="/Dashboard/PropuestaValor" icon={pv} label="Propuesta de valor" />
            <NavItem to="/Dashboard/Cursos" icon={cursos} label="Cursos" />
            <NavItem to="/Dashboard/Certificacion" icon={certificacion} label="Certificacion" />
            <NavItem to="/Dashboard/Examen" icon={test} label="Examen" />
          </SubMenu>

          <SubMenu icon={calendario} label="Calendario">
            <NavItem to="/Dashboard/Calendario" icon={calendarioaprobado} label="Calendario"/>
          </SubMenu>
          <SubMenu icon={cursos} label="COGNOS VIRTUAL">
            <NavItem to="/Dashboard/virtual/Alumnos" icon={alumnos} label="Alumnos" />
            <NavItem to="/Dashboard/virtual/CursosMoodle" icon={alumnos} label="Cursos MOODLE"/>
            <NavItem to ="/Dashboard/virtual/AlumnoMoodle" icon={alumnos} label="Alumnos Moodle"/>
          </SubMenu>
           <SubMenu icon={cp} label="Cursos Presenciales">
            <NavItem to="/Dashboard/Curso/Presencial" icon={alumnos} label="Alumnos"/>
          </SubMenu>
          <SubMenu icon={bl} label="Blogs">
            <NavItem to="/Dashboard/Blogs" icon={alumnos} label="Blogs"/>
          </SubMenu>

        </nav>

        <div className="flex justify-center lg:p-10">
          <button
            onClick={handleLogout}
            className="p-[6px] text-sm text-center bg-red-600 text-white rounded-xl hover:scale-105 duration-300"
          >
            Salir
          </button>
        </div>
      </aside>
      <div className="w-full bg-[#DEEAFF]">
       
        <Outlet />
      </div>
      <ToastContainer pauseOnHover={false} pauseOnFocusLoss={false} />
    </div>
  );
}
