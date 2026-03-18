import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import ErrorMessage from "../Error/ErrorMessage";
import clear from "../../assets/clear.png";
import cerrar from "../../assets/cerrar.png";
import { UpdatePvApi } from "../../Api/PvApi";
import type { UpdateTypePv } from "../../types";

type Props = Readonly<{
  SetVer: React.Dispatch<React.SetStateAction<boolean>>;
  SendValor: UpdateTypePv | null;
}>;

type ImageType = 'logo' | 'imgbanner' | 'imglogoModal' | 'imgCuadro';

const IMAGE_LABELS: Record<ImageType, string> = {
  logo: 'Logo',
  imgbanner: 'Banner',
  imglogoModal: 'Modal',
  imgCuadro: 'Cuadro'
};

const BASE_URL = "http://localhost:8080";

export default function UpdatePvForm({ SendValor, SetVer }: Props) {
  const [previews, setPreviews] = useState<Record<ImageType, string | null>>({
    logo: null,
    imgbanner: null,
    imglogoModal: null,
    imgCuadro: null
  });

  const [dragging, setDragging] = useState<ImageType | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UpdateTypePv>({
    defaultValues: {
      nombre: SendValor?.nombre,
      identificador: SendValor?.identificador,
      logo: null,
      imglogoModal: null,
      imgbanner: null,
      imgCuadro: null,
    }
  });

  // Función para limpiar rutas de imágenes
  const buildImageUrl = (path: string): string => {
    const cleanPath = path.replace(/\\/g, "/").replace(/^\.\//, "");
    return `${BASE_URL}/${cleanPath}`;
  };

  // Cargar previews iniciales
  useEffect(() => {
    if (SendValor) {
      const imageFields: ImageType[] = ['logo', 'imgbanner', 'imgCuadro', 'imglogoModal'];
      const newPreviews: Record<ImageType, string | null> = { ...previews };

      imageFields.forEach((field) => {
        if (SendValor[field]) {
          newPreviews[field] = buildImageUrl(SendValor[field]);
        }
      });

      setPreviews(newPreviews);
    }
  }, [SendValor]);

  // Función para crear preview
  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  // Manejadores de drag & drop genéricos
  const handleDragOver = (type: ImageType) => (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(type);
  };

  const handleDragLeave = () => setDragging(null);

  const handleDrop = (type: ImageType) => async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(null);

    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await handleFileSelection(file, type);
    }
  };

  // Función para manejar selección de archivos
  const handleFileSelection = async (file: File, type: ImageType) => {
    setValue(type, file);
    const preview = await createImagePreview(file);
    setPreviews(prev => ({ ...prev, [type]: preview }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: ImageType) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileSelection(file, type);
    }
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: UpdatePvApi,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["GetPvAll"] });
      toast.success(results);
      reset();
      SetVer(false);
    }
  });

  const onSubmit = (data: UpdateTypePv) => {
    const formData = new FormData();
    
    const array1 = [{
      nombre: data.nombre,
      identificador: data.identificador,
    }];
    
    formData.append('array1', JSON.stringify(array1));
    formData.append('id_pv', String(SendValor?.id_pv));
    
    // Agregar archivos si existen
    const imageFields: ImageType[] = ['logo', 'imgbanner', 'imglogoModal', 'imgCuadro'];
    imageFields.forEach(field => {
      if (data[field]) {
        formData.append(field, data[field] as File);
      }
    });

    mutation.mutate(formData);
  };

  const handleClose = () => {
    SetVer(false);
  };

  const handleReset = () => {
    reset({
      nombre: '',
      identificador: '',
      logo: null,
      imglogoModal: null,
      imgbanner: null,
      imgCuadro: null,
    });
    
    setPreviews({
      logo: null,
      imgbanner: null,
      imglogoModal: null,
      imgCuadro: null
    });
  };

  // Componente de zona de carga de imagen
  const ImageUploadZone = ({ type }: { type: ImageType }) => {
    const isDragging = dragging === type;
    const preview = previews[type];

    return (
      <div className="w-1/2">
        <h2 className="text-[#00155C] text-sm font-semibold">{IMAGE_LABELS[type]}</h2>
        <label
          htmlFor={type}
          className={`border-2 border-dashed rounded-lg p-2 h-[150px] cursor-pointer flex flex-col justify-center items-center transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver(type)}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop(type)}
        >
          {preview ? (
            <img src={preview} alt={`Preview ${IMAGE_LABELS[type]}`} className="max-h-[100px] max-w-full object-contain" />
          ) : (
            <p className="text-[#00155C] text-xs text-center">
              Arrastra y suelta tu imagen aquí
            </p>
          )}
          <input
            id={type}
            type="file"
            accept="image/*"
            {...register(type)}
            onChange={(e) => handleFileChange(e, type)}
            className="text-[8px] border-[1px] p-[4px] rounded-xl border-gray-400 hover:cursor-pointer duration-300 hover:scale-105 mt-2"
          />
        </label>
      </div>
    );
  };

  return (
    <div>
      <button 
        className='overlay' 
        onClick={() => handleClose()}
        aria-label="Cerrar modal"
      />
      <article className="w-5/12 m-auto p-10 rounded-xl fixed z-[100] top-[10%] left-[28%] bg-[#FFFFFF] up max-h-[80vh] overflow-y-auto">
        <div className='flex justify-between'>
          <button 
            type="button" 
            onClick={handleReset}
            className="bg-green-500 p-2 rounded-lg text-white cursor-pointer self-center flex gap-2 hover:scale-105 duration-300"
          >
            <img className='w-4' src={clear} alt="" />
            <p className='text-xs self-center text-white font-semibold'>Limpiar Datos</p>
          </button>
          <button className='self-center cursor-pointer hover:scale-105 duration-300' onClick={handleClose}>
            <img className="w-6" src={cerrar} alt="Cerrar" />
          </button>
        </div>
        
        <h2 className="text-2xl font-semibold text-[#00155C]">Actualizar Propuesta de valor:</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <div>
            <div className="flex justify-between w-full gap-4">
              <div className="flex flex-col w-full self-center">
                <label className='text-[#00155C]' htmlFor="nombre">Nombre Propuesta de Valor:</label>
                <input
                  className="rounded-xl text-sm p-[6px] shadow-lg pl-2 bg-[#F3F3F3]"
                  type="text"
                  {...register("nombre", { required: "El nombre es obligatorio" })}
                />
                {errors.nombre && (
                  <ErrorMessage>{errors.nombre.message}</ErrorMessage>
                )}
              </div>
              
              <div className="flex flex-col w-full self-center">
                <label className='text-[#00155C]' htmlFor="identificador">Identificador:</label>
                <input
                  className="rounded-xl text-sm p-[6px] shadow-lg pl-2 bg-[#F3F3F3]"
                  type="text"
                  {...register("identificador", { required: "El identificador es obligatorio" })}
                />
                {errors.identificador && (
                  <ErrorMessage>{errors.identificador.message}</ErrorMessage>
                )}
              </div>
            </div>
            
            <br />
            
            <div className="flex gap-2 justify-around">
              <ImageUploadZone type="logo" />
              <ImageUploadZone type="imgbanner" />
              <ImageUploadZone type="imglogoModal" />
              <ImageUploadZone type="imgCuadro" />
            </div>
          </div>
          
          <input
            type="submit"
            value="Actualizar"
            className="bg-[#00155C] p-2 rounded-lg text-white cursor-pointer hover:bg-[#002080] transition-colors"
          />
        </form>
      </article>
    </div>
  );
}