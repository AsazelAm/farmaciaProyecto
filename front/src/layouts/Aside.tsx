import { useEffect } from "react";
import { useNavigate, Navigate, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useAuth } from "../Hook/UseAuth";
import Loading from "../Helpers/Loading";
import iconuser from "../assets/group.png";
import rol from "../assets/gestion.png";
//import icondoc from "../assets/doc.png";
import 'react-toastify/dist/ReactToastify.css';
import NavItem from "./Admin/NavItem";
import SubMenu from "./Admin/SubMenu";

export default function Aside() {
  const navigate = useNavigate();
 
  const { user, isError, isLoading } = useAuth();
  const Rol = user?.nameRol;

  
  useEffect(() => {
    if (!isLoading && !isError && user && Rol !== 'Admin') {
      navigate("/");
    }
  }, [isLoading, isError, user, Rol, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('AUTH_TOKEN');
    localStorage.removeItem('FTU');
    globalThis.location.href = globalThis.location.origin;
  }

  if (isLoading) return <Loading />;
  if (isError) return <Navigate to="/" />;

  if (Rol !== 'Admin') return null;

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
          {/* Foto, nombre y rol del usuario */}
          <div className="flex items-center gap-3 px-3 mb-6">
             <div className="w-10 h-10 shrink-0 bg-white/10 rounded-full flex items-center justify-center overflow-hidden">
                {user?.img
                   ? <img
                        src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/${user.img.replace(/\\/g, '/')}`}
                        alt={`${user.nombre} ${user.apellido}`}
                        className="w-full h-full object-cover"
                     />
                   : <span className="text-white font-bold">{user?.nombre?.charAt(0).toUpperCase()}</span>
                }
             </div>
             <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden whitespace-nowrap">
                <p className="text-white text-sm font-semibold leading-tight">{user?.nombre} {user?.apellido}</p>
                <p className="text-white/60 text-xs">{user?.nameRol}</p>
             </div>
          </div>

          <div className="px-2 space-y-1">
            <SubMenu icon={iconuser} label="Usuarios">
              <NavItem to="/Dashboard/Usuarios" icon={iconuser} label="Usuarios" />
              <NavItem to="/Dashboard/TipoUs" icon={rol} label="Roles" />
            </SubMenu>

            <SubMenu icon={iconuser} label="Catálogo">
              <NavItem to="/Dashboard/Productos" icon={iconuser} label="Productos" />
              <NavItem to="/Dashboard/Presentacion" icon={iconuser} label="Presentación" />
              <NavItem to="/Dashboard/TipoProductos" icon={iconuser} label="Tipos" />
              <NavItem to="/Dashboard/Laboratorios" icon={iconuser} label="Laboratorios" />
            </SubMenu>

            <SubMenu label="Contactos Comerciales" icon={iconuser}>
              <NavItem to="/Dashboard/Proveedor" icon={iconuser} label="Proveedores" />
              <NavItem to="/Dashboard/Cliente" icon={iconuser} label="Clientes" />
            </SubMenu>

            <SubMenu label="Compra de Lotes" icon={iconuser}>
              <NavItem to="/Dashboard/Compra" icon={iconuser} label="Compra" />
              <NavItem to="/Dashboard/NewCompra" icon={iconuser} label="Nueva Compra" />
              <NavItem to="/Dashboard/Lote" icon={iconuser} label="Lotes" />
            </SubMenu>

            <SubMenu label="Venta" icon={iconuser}>
              <NavItem to="/Dashboard/Venta" icon={iconuser} label="Venta"/>
              <NavItem to="/Dashboard/NewVenta" icon={iconuser} label="Nueva Venta" />
            </SubMenu>

            <SubMenu label="Devoluciones" icon={iconuser}>
              <NavItem to="/Dashboard/Devoluciones" icon={iconuser} label="Devoluciones" />
            </SubMenu>

            <SubMenu label="Reportes" icon={iconuser}>
              <NavItem to="/Dashboard/Reportes" icon={iconuser} label="Ventas" />
              <NavItem to="/Dashboard/ReportesCompras" icon={iconuser} label="Compras" />
              <NavItem to="/Dashboard/ReportesVencimientos" icon={iconuser} label="Control Vencimientos" />
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