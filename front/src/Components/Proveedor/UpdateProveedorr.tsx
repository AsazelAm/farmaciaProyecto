import ErrorMessage from "../Error/ErrorMessage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import type {UpdateProveedor} from "../../types";
import {UpdateProveedorApi} from "../../Api/ProveedorApi";

type Props = Readonly<{
   SetVer:React.Dispatch<React.SetStateAction<boolean>>;
   SendValor:UpdateProveedor | null; 
}>;
export default function UpdateProveedorr({SetVer,SendValor}:Props){
    return(
        <div></div>
    )
}