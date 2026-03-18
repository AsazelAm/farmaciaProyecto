import {useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import ErrorMessage from '../Components/Error/ErrorMessage';
import logo from '../assets/logo.png';
import imgver from '../assets/ver.png';
import imgesconder from '../assets/esconder.png';
import bgdoc from '../assets/bg-regitredocen.jpg'; 
import type {AuthDocente} from '../types';
import { RegisterDocenteAPI } from '../Api/Docentes';
import Loading from '../Helpers/Loading';
// Componente para Ojo Visible
const EyeIcon = (props: any) => (
  <img 
    src={imgver} 
    alt="Mostrar contraseña" 
    className="w-5 h-5 object-contain"
    {...props} 
  />
);

// Componente para Ojo Tachado 
const EyeOffIcon = (props: any) => (
  <img 
    src={imgesconder} 
    alt="Ocultar contraseña" 
    className="w-5 h-5 object-contain" 
    {...props} 
  />
);

export default function RegisterDocente() {

  const navigate =useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);



  const {register,handleSubmit,watch,reset,formState:{errors}}=useForm<AuthDocente>({
    defaultValues:{
      nombre:'',
      apellido:'',
      telefono:'',
      correo:'',
      password:'',
      confirmPassword:''
    }
  });

  const passwordValue=watch("password");

  // Función para alternar la visibilidad de las contraseñas
  const togglePasswordVisibility = (field:any) => {
    if (field === 'password') {
      setShowPassword((prev) => !prev);
    } else if (field === 'confirmPassword') {
      setShowConfirmPassword((prev) => !prev);
    }
  };

  const { mutate, isPending } = useMutation({
      mutationFn: RegisterDocenteAPI,
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: (results) => {
        toast.success(results.message);
        reset();
        if(results.id){
          navigate(`/Codigo/Verificacion/${results.id}`);
        }
      }
  });
  
    const handleForm = (data: AuthDocente) => {
      mutate(data)
    };

  return (
    <main className="bg-[#00155C] w-full min-h-screen flex items-center justify-center p-4">
      {isPending && <Loading/>}
      <section className="w-full max-w-6xl flex flex-col lg:flex-row h-auto lg:h-[90vh] 
      shadow-2xl rounded-xl lg:rounded-[4rem] overflow-hidden">
        <article className="hidden lg:flex w-full lg:w-5/12 bg-[#00155C] p-8 xl:p-16 text-white flex-col justify-between">
          <div>
            <div className="w-full h-auto max-w-[350px] mb-8 relative">
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <p className="text-gray-300 text-sm">
              Estamos listos y comprometidos, para garantizar que esta sea una muy buena experiencia de
              aprendizaje para tu persona. Y con este objetivo, contarás con todo el apoyo de nuestro
              equipo tanto de soporte, académico, como docente.
            </p>
          </div>
          <div className="flex justify-center items-center mt-8">
            <img
              src={bgdoc}
              alt="Ilustración de docente"
              className="w-full h-auto object-cover rounded-xl opacity-80"
            />
          </div>
        </article>

        <article className="w-full lg:w-7/12 bg-white rounded-xl lg:rounded-l-[4rem] p-6 sm:p-10 md:p-12 lg:p-16 flex flex-col justify-center">
          
          {/* Encabezado del Formulario */}
          <div className="mb-8 lg:mb-10">
            <h1 className="text-2xl sm:text-3xl font-light text-gray-800">
              <span className="font-semibold">Registro Docente</span>   
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Bienvenido a Cognos, vamos ayudarte a empezar.
            </p>
          </div>
          
          {/* Grid del Formulario de Campos */}
          <form onSubmit={handleSubmit(handleForm)} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                type="text"
                placeholder="Nombre" 
                className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none
                 focus:ring-2 focus:ring-[#00155C]"
                 {...register("nombre",{required:"El nombre es importante"})}
              />
              {errors.nombre &&(
                <ErrorMessage>{errors.nombre.message}</ErrorMessage>
              )}
              </div>
              
              <div>
                <input
                type="text"
                placeholder="Apellido"
                className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none 
                focus:ring-2 focus:ring-[#00155C]"
                {...register("apellido",{required:"Ingrese el Apellido"})}
              />
              {errors.apellido &&(
                <ErrorMessage>{errors.apellido.message}</ErrorMessage>
              )}
              </div>
              
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                type="text" // Usar "tel" para mejor semántica en móviles
                placeholder="Teléfono"
                className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none 
                focus:ring-2 focus:ring-[#00155C]"
                  {...register("telefono",{required:"Ingrese su numero Telefonico"})}
                />
                {errors.telefono &&(
                  <ErrorMessage>{errors.telefono.message}</ErrorMessage>
                )}
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Correo Electrónico"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none 
                  focus:ring-2 focus:ring-[#00155C]"
                  {...register("correo",{required:"El correo es Obligatorio"})}
                />
                {errors.correo &&(
                  <ErrorMessage>{errors.correo.message}</ErrorMessage>
                )}
              </div>
            </div>
            
            {/* Campos de Contraseña con el icono de Ojo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Contraseña */}
              <div className="relative">
                 <div>
                  <input
                  // Cambiamos el tipo dinámicamente
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Contraseña"
                  className="border border-gray-300 p-3 rounded-lg w-full pr-12 
                  focus:outline-none focus:ring-2 focus:ring-[#00155C]"
                  {...register("password",{
                    required:"La contraseña es obligatorio",
                    minLength: {
                        value: 6,
                        message: "La contraseña debe tener al menos 6 caracteres"
                    }
                  })}
                  />
                  <button
                    type="button" 
                    onClick={() => togglePasswordVisibility('password')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-[#00155C]"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                  {errors.password &&(
                    <ErrorMessage>{errors.password.message}</ErrorMessage>
                  )}
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div className="relative">
                <div>
                  <input
                    // Cambiamos el tipo dinámicamente
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirmar Contraseña"
                    className="border border-gray-300 p-3 rounded-lg w-full pr-12 focus:outline-none focus:ring-2 focus:ring-[#00155C]"
                    {...register("confirmPassword", {
                        required: "Debe confirmar la contraseña",
                        // LÓGICA DE VALIDACIÓN CLAVE: Compara con el valor observado de 'password'
                        validate: value => 
                            value === passwordValue || "Las contraseñas no coinciden"
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-[#00155C]"
                    aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                  >
                    {showConfirmPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                  {errors.confirmPassword && (
                    <ErrorMessage>{errors.confirmPassword.message}</ErrorMessage>
                  )}
                </div>
              </div>
                

            </div>

            {/* Checkboxes */}
            <div className="pt-2 sm:pt-4 space-y-3 text-xs sm:text-sm">
              <label className="flex items-start text-gray-600">
                <input type="checkbox" className="mt-1 mr-3 text-[#00155C] focus:ring-[#00155C] rounded" />
                Acepto los{' '}
                <a href="#" className="text-[#00155C] font-medium hover:underline ml-1">
                  Términos & Políticas de Privacidad
                </a>
              </label>
            </div>

            {/* Botón de Registro */}
            <button
              type="submit"      
              className="w-full bg-blue-800
                hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition duration-200 shadow-md mt-6 sm:mt-8"
            >
              Registrarse
            </button>
          </form>

        </article>
      </section>
    </main>
  );
}