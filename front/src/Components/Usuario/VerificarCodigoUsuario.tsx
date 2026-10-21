import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ReenviarCodigoUsuario, VerificarCodigoUsuario } from "../../Api/UserApi";
import ErrorMessage from "../Error/ErrorMessage";

const LONGITUD_CODIGO = 6;
const VIGENCIA_SEGUNDOS = 300; // 5 minutos
const COOLDOWN_REENVIO_SEGUNDOS = 60;

const formatoTiempo = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min}:${String(seg).padStart(2, "0")}`;
};

type Props = Readonly<{
    email: string;
    correoEnviado?: boolean;
    onClose: () => void;
    onVerified: () => void;
}>;

export default function VerificarCodigoUsuarioModal({ email, correoEnviado = true, onClose, onVerified }: Props) {
    const [digitos, setDigitos] = useState<string[]>(Array(LONGITUD_CODIGO).fill(""));
    const [error, setError] = useState("");
    const [segundosVigencia, setSegundosVigencia] = useState(VIGENCIA_SEGUNDOS);
    const [segundosReenvio, setSegundosReenvio] = useState(
        correoEnviado ? COOLDOWN_REENVIO_SEGUNDOS : 0
    );
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    useEffect(() => {
        inputsRef.current[0]?.focus();
    }, []);

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
        mutationFn: () => VerificarCodigoUsuario({ email, codigo }),
        onError: (err) => {
            toast.error(err instanceof Error ? err.message : String(err));
            setDigitos(Array(LONGITUD_CODIGO).fill(""));
            inputsRef.current[0]?.focus();
        },
        onSuccess: () => {
            toast.success("Usuario verificado correctamente");
            onVerified();
        },
    });

    const { mutate: reenviar, isPending: reenviando } = useMutation({
        mutationFn: () => ReenviarCodigoUsuario(email),
        onSuccess: () => {
            toast.info("Se envió un código nuevo al correo");
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

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
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
        const texto = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LONGITUD_CODIGO);
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-[#D8B4F0]">
                <div
                    className="p-6 text-white flex justify-between items-center"
                    style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}
                >
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter">Verificar correo</h2>
                        <p className="text-purple-200 text-xs font-medium">Activa la cuenta del usuario</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-white/10 hover:bg-white/20 p-2 px-4 rounded-xl transition-colors"
                    >
                        Cerrar
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5" noValidate>
                    <p className="text-sm text-gray-600 text-center">
                        Enviamos un código de 6 dígitos a{" "}
                        <span className="font-semibold text-[#4A1A6E] break-all">{email}</span>
                    </p>

                    {!correoEnviado && (
                        <p className="text-center text-sm font-semibold text-amber-600">
                            No se pudo enviar el correo. Usa "Reenviar código" para intentarlo de nuevo.
                        </p>
                    )}

                    <div className="flex justify-center gap-2" onPaste={handlePaste}>
                        {digitos.map((digito, index) => (
                            <input
                                key={index}
                                ref={(el) => {
                                    inputsRef.current[index] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                autoComplete={index === 0 ? "one-time-code" : "off"}
                                maxLength={1}
                                value={digito}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onFocus={(e) => e.target.select()}
                                disabled={isPending}
                                className="w-11 h-12 text-center text-xl font-bold border-2 border-[#D8B4F0] rounded-xl focus:border-[#7B3FA0] focus:outline-none focus:ring-2 focus:ring-[#7B3FA0] text-[#2D0A47]"
                            />
                        ))}
                    </div>

                    {error && <ErrorMessage>{error}</ErrorMessage>}

                    <p className="text-center text-xs text-gray-500">
                        El código caduca en{" "}
                        <span className="font-semibold text-[#4A1A6E]">{formatoTiempo(segundosVigencia)}</span>
                    </p>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3 text-white rounded-2xl font-bold text-lg shadow-xl transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}
                    >
                        {isPending ? "Verificando..." : "Verificar código"}
                    </button>

                    <button
                        type="button"
                        onClick={() => reenviar()}
                        disabled={reenviando || segundosReenvio > 0}
                        className="w-full text-sm text-[#4A1A6E] font-semibold underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                    >
                        {reenviando
                            ? "Reenviando..."
                            : segundosReenvio > 0
                                ? `Reenviar código (${segundosReenvio}s)`
                                : "Reenviar código"}
                    </button>

                    <p className="text-center text-xs text-gray-400">
                        Si cierras esta ventana, el usuario quedará pendiente de verificación.
                    </p>
                </form>
            </div>
        </div>
    );
}
