import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ReenviarCodigo, VerificarCodigo } from "../Api/Auth";
import ErrorMessage from "../Components/Error/ErrorMessage";
import logo from "../assets/logoo.png";
import bg from "../assets/doc.png";

const LONGITUD_CODIGO = 6;
const VIGENCIA_SEGUNDOS = 300; // 5 minutos
const COOLDOWN_REENVIO_SEGUNDOS = 60;

const rutasPorRol: Record<string, string> = {
  Admin: "/Dashboard",
  Farmaceutico: "/Farmaceutico",
  Asesor: "/Asesor",
  Bodeguero: "/Bodeguero",
};

const formatoTiempo = (segundos: number) => {
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return `${min}:${String(seg).padStart(2, "0")}`;
};

export default function VerificarCodigoVista() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? "";

  const [digitos, setDigitos] = useState<string[]>(
    Array(LONGITUD_CODIGO).fill("")
  );
  const [error, setError] = useState("");
  const [segundosVigencia, setSegundosVigencia] = useState(VIGENCIA_SEGUNDOS);
  const [segundosReenvio, setSegundosReenvio] = useState(
    COOLDOWN_REENVIO_SEGUNDOS
  );
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // Sin email en el estado no hay codigo que verificar -> volver al login
  useEffect(() => {
    if (!email) {
      navigate("/", { replace: true });
    }
  }, [email, navigate]);

  // Contadores de vigencia (5 min) y cooldown de reenvio (60 s)
  useEffect(() => {
    const id = setInterval(() => {
      setSegundosVigencia((s) => (s > 0 ? s - 1 : 0));
      setSegundosReenvio((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const codigo = digitos.join("");
  const completo = codigo.length === LONGITUD_CODIGO;

  const { mutate, isPending } = useMutation({
    mutationFn: () => VerificarCodigo({ email, codigo }),
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : String(err));
      setDigitos(Array(LONGITUD_CODIGO).fill(""));
      inputsRef.current[0]?.focus();
    },
    onSuccess: (IDRol) => {
      const rutaDestino = rutasPorRol[IDRol ?? ""];
      if (rutaDestino) {
        navigate(rutaDestino, { replace: true });
      } else {
        navigate("/NoAutorizado", { replace: true });
      }
    },
  });

  const { mutate: reenviar, isPending: reenviando } = useMutation({
    mutationFn: () => ReenviarCodigo(email),
    onSuccess: () => {
      toast.info("Se envió un código nuevo a tu correo");
      setDigitos(Array(LONGITUD_CODIGO).fill(""));
      setSegundosVigencia(VIGENCIA_SEGUNDOS);
      setSegundosReenvio(COOLDOWN_REENVIO_SEGUNDOS);
      setError("");
      inputsRef.current[0]?.focus();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : String(err));
    },
  });

  const handleChange = (index: number, valor: string) => {
    const digito = valor.replace(/\D/g, "").slice(-1);
    const copia = [...digitos];
    copia[index] = digito;
    setDigitos(copia);
    setError("");
    if (digito && index < LONGITUD_CODIGO - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !digitos[index] && index > 0) {
      e.preventDefault();
      const copia = [...digitos];
      copia[index - 1] = "";
      setDigitos(copia);
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < LONGITUD_CODIGO - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const texto = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, LONGITUD_CODIGO);
    if (!texto) return;
    e.preventDefault();
    const copia = Array(LONGITUD_CODIGO).fill("");
    texto.split("").forEach((d, i) => (copia[i] = d));
    setDigitos(copia);
    setError("");
    inputsRef.current[Math.min(texto.length, LONGITUD_CODIGO - 1)]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completo) {
      setError("Ingresa los 6 dígitos del código");
      return;
    }
    if (segundosVigencia === 0) {
      setError("El código ha expirado, solicita uno nuevo");
      return;
    }
    mutate();
  };

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
            onSubmit={handleSubmit}
            noValidate
          >
            <h2 className="text-[#42137B] text-center text-2xl font-bold">
              Verificación de acceso
            </h2>
            <p className="text-sm text-gray-600 text-center -mt-3">
              Enviamos un código de 6 dígitos a{" "}
              <span className="font-semibold text-[#42137B] break-all">
                {email}
              </span>
            </p>

            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {digitos.map((digito, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputsRef.current[index] = el;
                  }}
                  id={`codigo-${index}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={digito}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={(e) => e.target.select()}
                  disabled={isPending}
                  className="w-11 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:border-[#42137B] focus:outline-none focus:ring-2 focus:ring-[#EEBA29]"
                />
              ))}
            </div>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <p className="text-center text-xs text-gray-500">
              El código caduca en{" "}
              <span className="font-semibold text-[#42137B]">
                {formatoTiempo(segundosVigencia)}
              </span>
            </p>

            <input
              type="submit"
              value={isPending ? "Verificando..." : "Verificar código"}
              disabled={isPending}
              className="bg-[#42137B] hover:bg-[#4b1f82] hover:scale-105 duration-300 w-full p-2 rounded-lg text-white font-semibold text-xl cursor-pointer disabled:opacity-60 disabled:hover:scale-100"
            />

            <button
              type="button"
              onClick={() => reenviar()}
              disabled={reenviando || segundosReenvio > 0}
              className="text-sm text-[#42137B] font-semibold underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
            >
              {reenviando
                ? "Reenviando..."
                : segundosReenvio > 0
                  ? `Reenviar código (${segundosReenvio}s)`
                  : "Reenviar código"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/", { replace: true })}
              className="text-sm text-gray-500 hover:text-[#42137B] duration-300 cursor-pointer"
            >
              ← Volver al inicio de sesión
            </button>
          </form>
        </article>
      </section>
    </main>
  );
}
