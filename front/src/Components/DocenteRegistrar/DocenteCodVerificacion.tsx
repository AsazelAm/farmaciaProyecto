import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { VerificarDocenteAPI } from "../../Api/Docentes";
import Loading from "../../Helpers/Loading";

export default function DocenteCodVerificacion() {

 const [secondsLeft, setSecondsLeft] = useState(60); 
  const { id } = useParams(); // 1️⃣ RECUPERAR ID DE LA URL
  const idDoc = id ? Number(id) : null;

  const navigate = useNavigate();

   useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  // Referencias a los inputs
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (value: string, index: number) => {
    // Solo números
    if (!/^\d?$/.test(value)) return;

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    // Si es el último input y tiene valor → submit automático
    if (value && index === 5) {
      handleSubmit();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

   const { mutate, isPending } = useMutation({
      mutationFn: VerificarDocenteAPI,
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: (results) => {
        toast.success(results);
        navigate("/");
      }
  });
  


  const handleSubmit = () => {
    const code = inputsRef.current.map(input => input?.value).join("");

    if (code.length !== 6) return;

   mutate({ 
    code, 
    idDoc: idDoc?.toString() ?? "" // convierte number a string, si es null usa ""
    });

    // 👉 Aquí llamarías a tu API de verificación
   
  };

  // Formatear los segundos a mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };



  return (
    <div className="flex items-center justify-center min-h-screen bg-[#00155C] p-4">
        {isPending && <Loading/>}
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Ingresa tu Código
        </h2>

        <p className="text-center text-gray-600 mb-6">
          Introduce el código de 6 dígitos enviado a tu correo/teléfono.
        </p>

        <div className="text-center text-xs font-normal text-red-600 mb-4">
          {secondsLeft > 0 ? `Tiempo restante: ${formatTime(secondsLeft)}` : "El código ha expirado"}
        </div>


        <div className="flex space-x-3 justify-between mb-6">
          {[...Array(6)].map((_, index) => (
            <input
              key={index}
              ref={(el) => { inputsRef.current[index] = el }} 
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="w-1/4 h-14 text-center text-2xl font-extrabold 
              text-gray-800 bg-gray-50 border border-gray-300 rounded-lg 
              focus:border-blue-500 focus:ring-blue-500 transition duration-200"
              onChange={e => handleChange(e.target.value, index)}
              onKeyDown={e => handleKeyDown(e, index)}
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 
          focus:ring-4 focus:ring-blue-300 font-medium text-lg transition duration-200"
        >
          Verificar
        </button>

        <div className="text-center mt-4">
          <button className="text-sm text-blue-600 hover:text-blue-700">
            Reenviar Código
          </button>
        </div>
      </div>
    </div>
  );
}
