import { useForm } from "react-hook-form";
import ErrorMessage from "../Error/ErrorMessage";
import React, { useState, type ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

type Cua = Readonly<{
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isOpen: boolean;
}>;

export default function LotDetalleForm({setIsOpen, isOpen }: Cua){
    return(
        <div>

        </div>
    )
}