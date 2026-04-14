import ErrorMessage from "../Error/ErrorMessage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import type { updateuser } from "../../types";

type Props = Readonly<{
  SetVer:    React.Dispatch<React.SetStateAction<boolean>>;
  SendValor: updateuser | null;
}>;
export default function GetUsuario({SetVer,SendValor}:Props){
    return(
        <div>
            
        </div>
    )
}