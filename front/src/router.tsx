import {HashRouter, Routes, Route} from "react-router-dom"
import Logins from "./view/Login"
import Main from "./layouts/Main"
import Aside from "./layouts/Aside"
import Dashboard from "./view/Dashboard/Admin/Dashboard"
import User from "./view/Dashboard/Admin/User/User"


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
            </Route>



        </Routes>
    </HashRouter>
  )
}
