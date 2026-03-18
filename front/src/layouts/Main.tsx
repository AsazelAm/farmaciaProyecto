import { Outlet } from "react-router-dom"
import { ToastContainer } from "react-toastify"

export default function Main() {
  return (
    <div>
        <Outlet/>
         <ToastContainer pauseOnHover={false} pauseOnFocusLoss={false} />
    </div>
  )
}
