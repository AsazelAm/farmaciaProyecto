import { useQuery } from "@tanstack/react-query";
import { GetAuthUsers } from "../Api/Auth";

export const useAuth = () => {
    const {data, isError, isLoading} = useQuery({
        queryKey: ['AuthUsers'],
        queryFn: GetAuthUsers,
        retry: false,
        refetchOnWindowFocus: false
    })
    return {data, isError, isLoading}
}