import ErrorMessage from "../Error/ErrorMessage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import type { UpdateProveedor } from "../../types";
import { UpdateProveedorApi } from "../../Api/ProveedorApi";

// ─── Paleta de colores (igual que Proveedor.tsx / UpdateTipoProducto.tsx) ─────
const C = {
  dark:   "#4A1A6E",
  medium: "#7B3FA0",
  light:  "#F3EBF9",
  border: "#D8B4F0",
};

type Props = Readonly<{
  SetVer:    React.Dispatch<React.SetStateAction<boolean>>;
  SendValor: UpdateProveedor | null;
}>;
export default function UpdateProveedorr({SetVer,SendValor}:Props){
    return(
        <div></div>
    )
}