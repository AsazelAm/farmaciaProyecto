import { useQuery } from "@tanstack/react-query";
import { GetMeApi } from "../Api/Auth";

export const useAuth = () => {
    // Antes: queryFn: GetAuthUsers traía la lista COMPLETA de usuarios y el
    // hook retornaba { data, isError, isLoading } -> no existía "user".
    // Ahora: queryFn: GetMeApi trae solo al usuario logueado (vía token), y
    // renombramos "data" a "user" en la propia desestructuración para que
    // coincida con lo que ya consume NewVenta.tsx: const { user } = useAuth()
    const { data: user, isError, isLoading } = useQuery({
        queryKey: ['usuarioActual'],
        queryFn: GetMeApi,
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 min: los datos del cajero casi no cambian durante su turno
    })
    return { user, isError, isLoading }
}