// Aside.tsx (Refactorizado)
import { useNavigate, Navigate, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useAuth } from "../Hook/UseAuth";
import Loading from "../Helpers/Loading";
import user from "../assets/group.png"
import 'react-toastify/dist/ReactToastify.css';
import NavItem from "./Admin/NavItem";
import SubMenu from "./Admin/SubMenu";
import ADM from "../assets/administracion.png";
import Moda from "../assets/lista-modal.png";


export default function AsideD() {
  const navigate = useNavigate();
  const { data, isError, isLoading } = useAuth();
  const Rol = data?.namQe_rol;

  

  const handleLogout = () => {
    localStorage.removeItem('AUTH_TOKEN');
    localStorage.removeItem('FTU');
    globalThis.location.href = globalThis.location.origin;
  }

  if (isLoading) return <Loading />;
  if (isError) return <Navigate to="/" />;

  if (Rol !== 'Docente') {
    navigate("/");
    return;
  }

  return (
    <div className="flex bg-[#DEEAFF]">
      <aside className="group w-[70px] hover:w-[254px] h-screen max-h-screen overflow-y-auto 
      overflow-x-hidden rounded-r-2xl border-r-2 border-gray clei bg-[#00155C] flex flex-col 
      justify-between transition-all duration-300">
        <nav className="py-10 flex flex-col gap-2">
          
          <SubMenu icon={ADM} label="Administracion">
            <NavItem to="/Dashboard/Modalidad" icon={Moda} label="Modalidad" />
            <NavItem to="/Dashboard/AreasConocimiento" icon={user} label="Areas de Conocimientos" />
          </SubMenu>

          <SubMenu icon={ADM}label="Cursos Inscritos">
            <NavItem to="/Docente/CursoInscritos" icon={Moda} label="Curso Inscritos"/>
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
