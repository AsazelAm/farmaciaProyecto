import {HashRouter, Routes, Route} from "react-router-dom"
import Logins from "./view/Login"
import Main from "./layouts/Main"
import Aside from "./layouts/Aside"
import Dashboard from "./view/Dashboard/Admin/Dashboard"

import User from "./view/Dashboard/Admin/User/User"
import TipoUs from "./view/Dashboard/Admin/User/TipoUs";

import Productos from "./view/Dashboard/Admin/Catalogo/Productos";
import Presentacion from "./view/Dashboard/Admin/Catalogo/Presentacion";
import TipoProductos from "./view/Dashboard/Admin/Catalogo/TipoProducto";
import Laboratorios from "./view/Dashboard/Admin/Catalogo/Laboratorio";

import Proveedor from "./view/Dashboard/Admin/ContactosComerciales/Proveedor";

export default function Router() {
  return (
    <HashRouter>
        <Routes>
            <Route element={<Main/>}>
              <Route path="/"  element={<Logins/>} index/>
            </Route>
            <Route element={<Aside/>}>
              <Route path="/Dashboard"  element={<Dashboard/>} index/>
              <Route path="/Dashboard/Usuarios"  element={<User/>}/>
              <Route path="/Dashboard/TipoUs" element={<TipoUs/>}/>
              <Route path="/Dashboard/Productos" element={<Productos/>}/>
              <Route path="/Dashboard/Presentacion" element={<Presentacion/>}/>
              <Route path="/Dashboard/TipoProductos" element={<TipoProductos/>}/>
              <Route path="/Dashboard/Laboratorios" element={<Laboratorios/>}/>
              <Route path="/Dashboard/Proveedor" element={<Proveedor/>}/>
            </Route>



        </Routes>
    </HashRouter>
  )
}
