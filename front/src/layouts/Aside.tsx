import { useNavigate, Navigate, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useAuth } from "../Hook/UseAuth";
import Loading from "../Helpers/Loading";
import user from "../assets/group.png"
import rol from "../assets/gestion.png";
import 'react-toastify/dist/ReactToastify.css';
import NavItem from "./Admin/NavItem";
import SubMenu from "./Admin/SubMenu";

export default function Aside() {
  const navigate = useNavigate();
  const { data, isError, isLoading } = useAuth();
  const Rol = data?.nameRol;

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
    <div className="flex min-h-screen bg-[#DEEAFF] overflow-x-hidden" >
      {/* Contenedor del Aside con posicionamiento fijo/sticky */}
      <aside className="
        sticky top-0 left-0 z-50
        rounded-r-xl
        group w-[90px] hover:w-[260px] 
        h-screen 
        bg-[#42137B] 
        flex flex-col justify-between 
        transition-all duration-500 ease-in-out
        shadow-2xl border-r border-white/10
        overflow-y-auto overflow-x-hidden
      ">
        <nav className="py-8 flex flex-col gap-4">
          {/* Espaciado superior para el logo o icono principal */}
          <div className="flex justify-center mb-6">
             <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">A</span>
             </div>
          </div>

          <div className="px-2 space-y-1">
            <SubMenu icon={user} label="Usuarios">
              <NavItem to="/Dashboard/Usuarios" icon={user} label="Usuarios" />
              <NavItem to="/Dashboard/TipoUs" icon={rol} label="Roles" />
            </SubMenu>

            <SubMenu icon={user} label="Catálogo">
              <NavItem to="/Dashboard/Productos" icon={user} label="Productos" />
              <NavItem to="/Dashboard/Presentacion" icon={user} label="Presentación" />
              <NavItem to="/Dashboard/TipoProductos" icon={user} label="Tipos" />
              <NavItem to="/Dashboard/Laboratorios" icon={user} label="Laboratorios" />
            </SubMenu>
          </div>
        </nav>

        {/* Sección de Botón Salir - Mejorada visualmente */}
        <div className="p-4 border-t border-white/10 mb-4">
          <button
            onClick={handleLogout}
            className="
              w-full flex items-center justify-center gap-2
              py-3 px-2
              bg-red-590 hover:bg-red-600 
              text-white border-[1px] hover:text-white
              rounded-xl transition-all duration-300
              group-hover:px-4
            "
          > 
            <span className="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
               Cerrar Sesión 
            </span>
            
          </button>
        </div>
      </aside>

      {/* Contenedor Principal (Outlet) */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto bg-[#DEEAFF]">
        <div className="p-6">
           <Outlet />
        </div>
      </main>

      <ToastContainer pauseOnHover={false} pauseOnFocusLoss={false} />
    </div>
  );
}