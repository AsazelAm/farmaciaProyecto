import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { GetAuthUsers, Login } from "../Api/Auth";
import type { AuthUser } from "../types/index";
import ErrorMessage from "../Components/Error/ErrorMessage";
import { useEffect } from "react";
import logo from "../assets/logoo.png";
import bg from "../assets/doc.png";

type LocationData = {
  city: string;
  country: string;
  loc: string;
  org: string;
};

type ExtendedAuthUser = AuthUser & {
  location?: LocationData;
  platform?: string;
  token?: string;
};

export default function Logins() {
  const navigate = useNavigate();

  const initialValues: AuthUser = {
    Email: "",
    Passwd: "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: initialValues });

  const rutasPorRol: Record<string, string> = {
    Admin: "/Dashboard",
    Docente: "/Docente",
    Asesor: "/Asesor",
    Academico: "/Academico",
  };

  const { mutate } = useMutation({
    mutationFn: Login,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message);
        console.log(error.message);
      } else {
        toast.error(String(error));
        console.log(error);
      }
    },
    onSuccess: (data) => {
      const rutaDestino = rutasPorRol[data];
      if (rutaDestino) {
        navigate(rutaDestino, { replace: true });
      } else {
        navigate("/NoAutorizado");
      }
    },
  });

  const handleLogin = (formData: AuthUser) => {
    const extendedData: ExtendedAuthUser = {
      ...formData,
    };

    mutate(extendedData);
  };

  const storedToken = localStorage.getItem("AUTH_TOKEN");

  const { data: pio } = useQuery({
    queryKey: ["AuthUsers"],
    queryFn: GetAuthUsers,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!storedToken, // solo se ejecuta si hay token
  });

  useEffect(() => {
    if (pio) {
      const Rol = pio.name_rol;
      const rutaDestino = rutasPorRol[Rol];
      if (rutaDestino) {
        navigate(rutaDestino, { replace: true });
      } else {
        navigate("/NoAutorizado");
      }
    }
  }, [pio, navigate]);

  return (
    <main className="bg-[#EEBA29] w-full">
      <section className="w-full m-auto flex h-screen justify-between relative">
        <article>
          <img src={bg} alt="" className="absolute inset-0 bg-cover h-screen" />
        </article>
        <div className="absolute inset-0 bg-[#EEBA29]/60"></div>
        <article className="self-center rounded-lg relative mx-auto w-full max-w-sm">
          <div className="w-[300px] h-20 m-auto object-contain">
            <img src={logo} alt="" className="h-20" />
          </div>
          <form
            className="flex flex-col gap-6 bg-[rgb(255,255,255,0.9)] p-10 m-auto mt-10 rounded-2xl shadow-lg"
            onSubmit={handleSubmit(handleLogin)}
            noValidate
          >
            <h2 className="text-[#42137B] text-center text-2xl font-bold">
              Iniciar Sesión
            </h2>
            <div className="flex flex-col gap-2">
              <label
                className="font-bold text-lg text-[#42137B]"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Correo Electronico"
                className="w-full border border-gray-300 p-2 rounded-lg"
                {...register("Email", {
                  required: "El Email es obligatorio",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "E-mail no válido",
                  },
                })}
              />
              {errors.Email && (
                <ErrorMessage>{errors.Email.message}</ErrorMessage>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="font-bold text-lg text-[#42137B]"
              >
                Contraseña
              </label>
              <input
                type="password"
                placeholder="Contraseña"
                className="w-full border border-gray-300 p-2 rounded-lg"
                {...register("Passwd", {
                  required: "El Password es obligatorio",
                })}
              />
              {errors.Passwd && (
                <ErrorMessage>{errors.Passwd.message}</ErrorMessage>
              )}
            </div>

            <input
              type="submit"
              value="Iniciar Sesión"
              className="bg-[#42137B] hover:bg-[#4b1f82] hover:scale-105 duration-300 w-full p-2 rounded-lg text-white font-semibold text-xl cursor-pointer"
            />
          </form>
        </article>
      </section>
    </main>
  );
}
