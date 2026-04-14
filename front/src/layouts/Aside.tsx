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
      overflow-x-hidden rounded-r-2xl border-r-2 border-gray clei bg-[#42137B] flex flex-col 
      justify-between transition-all duration-300">
        <nav className="py-10 flex flex-col gap-2">
          {/* <ul>
             <NavItem to="/Dashboard/Usuarios" icon={user} label="Usuarios" />
          </ul> */}
          <SubMenu icon={user} label="Usuarios">
            <NavItem to="/Dashboard/Usuarios" icon={user} label="Usuarios" />
            <NavItem to="/Dashboard/TipoUs" icon={rol} label="Roles" />
          </SubMenu>
          <SubMenu icon={user} label ="Catalago">
            <NavItem to="/Dashboard/Productos" icon={user} label="Productos"/>
            <NavItem to="/Dashboard/Presentacion"icon={user} label="Presentacion"/>
            <NavItem to="/Dashboard/TipoProductos"icon={user} label="Tipo De Productos"/>
            <NavItem to="/Dashboard/Laboratorios" icon={user} label="Labotorios"/>

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
