// Components/BlogEditor/BlogEditor.tsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from '../../lib/Axios';
import Sidebar from './Sidebar/Sidebar';
import PreviewArea from './PreviewArea/PreviewArea';
import { type ComponentType } from './Sidebar/ComponentCard';
import { type BlogComponent } from './PreviewArea/ComponentRenderer';
import { 
  createBlogApi, 
  type CreateBlogPayload,
  updateBlogApi,
  getBlogFullApi 
} from '../../Api/Blogs';

import TitleMainModal, { type TitleMainComponent } from './Modals/TitleMainModal';
import TitleSecondaryModal, { type TitleSecondaryComponent } from './Modals/TitleSecondaryModal';
import ContentModal, { type ContentComponent } from './Modals/ContentModal';
import ListModal, { type ListComponent } from './Modals/ListModal';
import ImageModal, { type ImageComponent } from './Modals/ImageModal';
import ImageTextModal, { type ImageTextComponent } from './Modals/ImageTextModal';
import ImageTitleTextModal, { type ImageTitleTextComponent } from './Modals/ImageTitleTextModal';

interface EditingState {
  index: number;
  component: BlogComponent;
}

interface BlogData {
  slug: string;
  titulo: string;
  subtitulo?: string;
  pagina_slug: string;
  resumen?: string;
  estado: 'borrador' | 'publicado' | 'archivado';
  publicado_en?: string | null;
  id_media_portada?: number | null;
  creado_por?: number | null;
}

export default function BlogEditor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams(); // 1️⃣ RECUPERAR ID DE LA URL
  const blogId = id ? Number(id) : null;
  const isEditing = !!blogId;

  const [blogComponents, setBlogComponents] = useState<BlogComponent[]>([]);
  const [editingComponent, setEditingComponent] = useState<EditingState | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [blogData, setBlogData] = useState<BlogData | null>(null);

  const [showModal, setShowModal] = useState(false);

const [modalConfig, setModalConfig] = useState({
  title: '',
  message: '',
  type: 'warning' as 'success' | 'error' | 'warning' | 'info',
  onConfirm: () => {},
  showCancel: true,
});

const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  setModalConfig({
    title,
    message,
    type,
    onConfirm: () => setShowModal(false),
    showCancel: false,
  });
  setShowModal(true);
};  

const showConfirmDialog = (
  title: string, 
  message: string, 
  onConfirm: () => void,
  type: 'warning' | 'error' = 'warning'
) => {
  setModalConfig({
    title,
    message,
    type,
    onConfirm: () => {
      onConfirm();
      setShowModal(false);
    },
    showCancel: true,
  });
  setShowModal(true);
};
//  AGREGAR NUEVO ESTADO para distinguir entre crear y editar
const [isCreatingNew, setIsCreatingNew] = useState(false);
  //  RECUPERAR DATOS DEL BLOG CUANDO SE ABRE EN MODO EDICIÓN
  const { 
    data: fullBlogData, 
    isLoading: isLoadingBlog,
    isError: isErrorBlog
  } = useQuery({
    queryKey: ['blogDetail', blogId],
    queryFn: () => getBlogFullApi(blogId!),
    enabled: isEditing, //  IMPORTANTE: Solo ejecuta si hay ID
    staleTime: 0, // Siempre trae datos frescos
  });

  //  EFECTO: INICIALIZAR EL ESTADO CUANDO LLEGUEN LOS DATOS
  useEffect(() => {
    if (fullBlogData?.data) {
      const { blog, bloques } = fullBlogData.data;
      
      // Guardar datos del blog para edición posterior
      setBlogData({
        slug: blog.slug,
        titulo: blog.titulo,
        subtitulo: blog.subtitulo,
        pagina_slug: blog.pagina_slug,
        resumen: blog.resumen,
        estado: blog.estado,
        publicado_en: blog.publicado_en,
        id_media_portada: blog.id_media_portada,
        creado_por: blog.creado_por,
      });

      // Convertir bloques de base de datos a componentes de UI
      const componentes: BlogComponent[] = bloques.map(
        (bloque: any, index: number) => ({
          id: `component-${bloque.id}-${Date.now()}`,
          type: bloque.tipo_slug, // tipo_slug del backend
          content: bloque.contenido_json?.content || '',
          title: bloque.contenido_json?.title,
          alignment: bloque.contenido_json?.alignment || 'left',
          textAlignment: bloque.contenido_json?.textAlignment,
          imageAlignment: bloque.contenido_json?.imageAlignment,
          imageUrl: bloque.media_url, // URL del media si existe
          imageAlt: bloque.contenido_json?.imageAlt,
          order: index,
        })
      );

      setBlogComponents(componentes);
      console.log('✅ Blog cargado:', { blog, componentes });
    }
  }, [fullBlogData]);

  //  MUTACIÓN PARA GUARDAR EDICIÓN
const { mutate: updateBlog } = useMutation({
  mutationFn: ({ id, payload }: { id: number; payload: CreateBlogPayload }) =>
    updateBlogApi(id, payload),
  onError: (error: any) => {
    console.error('❌ Error al actualizar:', error);
    showAlert('Error al actualizar', error.message || 'Ocurrió un error', 'error');
  },
  onSuccess: () => {
    console.log('✅ Blog actualizado exitosamente');
    queryClient.invalidateQueries({ queryKey: ['listBlogs'] });
    queryClient.invalidateQueries({ queryKey: ['blogDetail', blogId] });
    showAlert('¡Éxito!', 'El blog se actualizó correctamente', 'success');
    setTimeout(() => navigate('/Dashboard/Blogs'), 1500);
  },
});

  // FUNCIÓN: SUBIR IMAGEN AL SERVIDOR
  async function uploadImageToServer(
    base64Data: string,
    altText?: string
  ): Promise<number> {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Convertir base64 a blob
      const byteString = atob(base64Data.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const view = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        view[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: 'image/png' });

      const formData = new FormData();
      formData.append('file', blob, `image-${Date.now()}.png`);
      if (altText) {
        formData.append('texto_alternativo', altText);
      }

      setUploadProgress(50);

      const response = await api.post('/Blog/media/upload', formData);
      setUploadProgress(100);

      if (response.data.ok && response.data.data?.id) {
        console.log('✅ Imagen subida. ID:', response.data.data.id);
        return response.data.data.id;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error: any) {
      console.error('❌ Error en uploadImageToServer:', error);
      throw new Error(
        error.response?.data?.message || error.message || 'Error subiendo imagen'
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  // FUNCIÓN: GUARDAR O ACTUALIZAR BLOG - VERSIÓN FINAL
// 4️⃣ ACTUALIZAR handleSaveBlog
const handleSaveBlog = async () => {
  if (isEditing && blogId) {
    if (blogComponents.length === 0) {
      showAlert('Blog vacío', 'Agrega al menos un componente antes de guardar', 'warning');
      return;
    }

    try {
      console.log('📤 Procesando edición de blog...');
      
      const tiposResponse = await api.get('/Blog/tipos-componente');
      const tipos = tiposResponse.data?.data || [];
      const tipoSlugToIdMap = new Map(tipos.map((t: any) => [t.slug, t.id]));

      const bloquesActualizados = await Promise.all(
        blogComponents.map(async (comp, index) => {
          let id_media: number | null = null;

          if (comp.imageUrl && comp.imageUrl.startsWith('data:image')) {
            try {
              id_media = await uploadImageToServer(comp.imageUrl, comp.imageAlt);
            } catch (error: any) {
              throw new Error(`Error subiendo imagen ${index + 1}: ${error.message}`);
            }
          }

          const id_tipo_componente = tipoSlugToIdMap.get(comp.type);
          if (!id_tipo_componente) {
            throw new Error(`Tipo '${comp.type}' no válido`);
          }

          return {
            tipo_slug: comp.type,
            id_tipo_componente,
            posicion: index,
            contenido_json: {
              content: comp.content || '',
              title: comp.title || undefined,
              alignment: comp.alignment,
              textAlignment: comp.textAlignment || undefined,
              imageAlt: comp.imageAlt || undefined,
              imageAlignment: comp.imageAlignment || undefined,
            },
            id_media: id_media,
            activo: true,
          };
        })
      );

      const updatePayload: CreateBlogPayload = {
        blog: blogData || {
          slug: '',
          titulo: '',
          pagina_slug: '',
          estado: 'borrador',
        },
        bloques: bloquesActualizados,
      };

      updateBlog({ id: blogId, payload: updatePayload });
      
    } catch (error: any) {
      console.error('❌ Error:', error);
      showAlert('Error al guardar', error.message, 'error');
    }
  } else {
    // MODO CREACIÓN
    if (blogComponents.length === 0) {
      showAlert('Blog vacío', 'Agrega al menos un componente antes de guardar', 'warning');
      return;
    }

    const slug = prompt('Ingresa el slug del blog:');
    if (!slug) return;

    const titulo = prompt('Ingresa el título:');
    if (!titulo) return;

    const paginaSlug = prompt('Ingresa el slug de la página:');
    if (!paginaSlug) return;

    try {
      const tiposResponse = await api.get('/Blog/tipos-componente');
      const tipos = tiposResponse.data?.data || [];
      const tipoSlugToIdMap = new Map(tipos.map((t: any) => [t.slug, t.id]));

      const bloquesConImagenes = await Promise.all(
        blogComponents.map(async (comp, index) => {
          let id_media: number | null = null;
          let imageUrlFinal: string | undefined = comp.imageUrl;

          if (comp.imageUrl && comp.imageUrl.startsWith('data:image')) {
            try {
              id_media = await uploadImageToServer(comp.imageUrl, comp.imageAlt);
              imageUrlFinal = undefined;
            } catch (error: any) {
              throw new Error(`Error subiendo imagen ${index + 1}: ${error.message}`);
            }
          }

          const id_tipo_componente = tipoSlugToIdMap.get(comp.type);
          if (!id_tipo_componente) {
            throw new Error(`Tipo '${comp.type}' no válido`);
          }

          const contenido_json: any = {
            content: comp.content || '',
            title: comp.title || undefined,
            alignment: comp.alignment,
            textAlignment: comp.textAlignment || undefined,
            imageAlt: comp.imageAlt || undefined,
            imageAlignment: comp.imageAlignment || undefined,
          };

          if (imageUrlFinal && !imageUrlFinal.startsWith('data:image')) {
            contenido_json.imageUrl = imageUrlFinal;
          }

          return {
            tipo_slug: comp.type,
            id_tipo_componente,
            posicion: index,
            contenido_json,
            id_media,
            activo: true,
          };
        })
      );

      const newPayload: CreateBlogPayload = {
        blog: {
          slug: slug.toLowerCase().replace(/\s+/g, '-'),
          titulo,
          pagina_slug: paginaSlug.toLowerCase(),
          estado: 'borrador',
          creado_por: 1,
        },
        bloques: bloquesConImagenes,
      };

      const response = await createBlogApi(newPayload);
      showAlert('¡Blog creado!', `Se creó exitosamente con ID: ${response.id}`, 'success');
      setTimeout(() => navigate('/Dashboard/Blogs'), 2000);
      
    } catch (error: any) {
      showAlert('Error al crear', error.message, 'error');
    }
  }
};


  // RESTO DE HANDLERS (sin cambios)
  //  MODIFICAR handleAddComponent - NO AGREGAR INMEDIATAMENTE
const handleAddComponent = (type: ComponentType) => {
  // Crear componente temporal (no se agrega al estado aún)
  const newComponent: BlogComponent = {
    id: `component-${Date.now()}-${Math.random()}`,
    type: type,
    content: '',
    alignment: 'left',
    order: blogComponents.length, // El orden que tendría si se guarda
  };

  //  Marcar que estamos creando (no editando)
  setIsCreatingNew(true);
  
  //  Abrir modal con componente temporal (index -1 significa "nuevo")
  setEditingComponent({ 
    index: -1,  // 👈 -1 indica que es nuevo
    component: newComponent 
  });
  
  console.log('🆕 Preparando nuevo componente:', type);
};

  const handleEditComponent = (index: number, componentToEdit?: BlogComponent) => {
  // Este método ahora SOLO se usa para editar componentes existentes
  const component = componentToEdit || blogComponents[index];
  
  //  NO es creación, es edición
  setIsCreatingNew(false);
  
  setEditingComponent({ index, component });
  console.log('✏️ Editando componente existente:', component.type);
};

  // MODIFICAR handleSaveComponent - AGREGAR O ACTUALIZAR SEGÚN CASO
const handleSaveComponent = (updatedComponent: BlogComponent) => {
  if (editingComponent) {
    
    if (isCreatingNew) {
      //  CASO 1: Es un componente NUEVO → Agregarlo al array
      console.log('✅ Guardando nuevo componente');
      setBlogComponents((prev) => [...prev, updatedComponent]);
      setIsCreatingNew(false);
      
    } else {
      //  CASO 2: Es una EDICIÓN → Actualizar el existente
      console.log('✏️ Actualizando componente existente');
      setBlogComponents((prev) =>
        prev.map((comp, idx) =>
          idx === editingComponent.index ? updatedComponent : comp
        )
      );
    }
    
    setEditingComponent(null);
  }
};

  const handleCloseModal = () => {
  //  Si estaba creando y cierra, simplemente descartamos
  if (isCreatingNew) {
    console.log('❌ Usuario canceló la creación del componente');
    setIsCreatingNew(false);
  }
  setEditingComponent(null);
};

  const handleDeleteComponent = (index: number) => {
  showConfirmDialog(
    '¿Eliminar componente?',
    'Esta acción no se puede deshacer. ¿Deseas continuar?',
    () => {
      setBlogComponents((prev) =>
        prev.filter((_, idx) => idx !== index).map((comp, idx) => ({ ...comp, order: idx }))
      );
    },
    'error'
  );
};

  const handleReorderComponents = (fromIndex: number, toIndex: number) => {
    setBlogComponents((prev) => {
      const newComponents = [...prev];
      const [movedComponent] = newComponents.splice(fromIndex, 1);
      newComponents.splice(toIndex, 0, movedComponent);
      return newComponents.map((comp, idx) => ({ ...comp, order: idx }));
    });
  };

  const handleCancel = () => {
  if (blogComponents.length > 0) {
    showConfirmDialog(
      '¿Salir sin guardar?',
      'Tienes cambios sin guardar que se perderán. ¿Deseas continuar?',
      () => {
        navigate('/Dashboard/Blogs');
      },
      'warning'
    );
  } else {
    navigate('/Dashboard/Blogs');
  }
};

  // RENDERIZADO CONDICIONAL DEL MODAL
  const renderEditModal = () => {
    if (!editingComponent) return null;

    const { component } = editingComponent;
    const isModalOpen = !!editingComponent;
    const saveHandler = (comp: BlogComponent) => handleSaveComponent(comp);

    switch (component.type) {
      case 'TITLE_MAIN':
        return (
          <TitleMainModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={saveHandler as (comp: TitleMainComponent) => void}
            component={component as TitleMainComponent}
          />
        );
      case 'TITLE_SECONDARY':
        return (
          <TitleSecondaryModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={saveHandler as (comp: TitleSecondaryComponent) => void}
            component={component as TitleSecondaryComponent}
          />
        );
      case 'CONTENT':
        return (
          <ContentModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={saveHandler as (comp: ContentComponent) => void}
            component={component as ContentComponent}
          />
        );
      case 'LIST':
        return (
          <ListModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={saveHandler as (comp: ListComponent) => void}
            component={component as ListComponent}
          />
        );
      case 'IMAGE':
        return (
          <ImageModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={saveHandler as (comp: ImageComponent) => void}
            component={component as ImageComponent}
          />
        );
      case 'IMAGE_TEXT_RIGHT':
      case 'IMAGE_TEXT_LEFT':
        return (
          <ImageTextModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={saveHandler as (comp: ImageTextComponent) => void}
            component={component as ImageTextComponent}
          />
        );
      case 'IMAGE_TITLE_TEXT_RIGHT':
      case 'IMAGE_TITLE_TEXT_LEFT':
        return (
          <ImageTitleTextModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={saveHandler as (comp: ImageTitleTextComponent) => void}
            component={component as ImageTitleTextComponent}
          />
        );
      default:
        return null;
    }
  };

  // PANTALLA DE CARGA
  if (isLoadingBlog) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Cargando blog...</p>
        </div>
      </div>
    );
  }

  // ERROR AL CARGAR
  if (isErrorBlog && isEditing) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center bg-white p-6 rounded-lg shadow-lg">
          <p className="text-red-600 mb-4">Error al cargar el blog</p>
          <button
            onClick={() => navigate('/Dashboard/Blogs')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Volver a blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Indicador de carga durante subida */}
      {isUploading && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 text-center shadow-xl">
            <p className="mb-4 font-semibold text-gray-800">Subiendo imagen...</p>
            <div className="w-48 h-2 bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-600">{uploadProgress}%</p>
          </div>
        </div>
      )}

      {/* Botón de volver */}
      <button
        onClick={handleCancel}
        className="fixed top-4 right-4 z-40 px-4 py-2 bg-gray-700 text-white 
                   rounded-lg hover:bg-gray-800 transition-all shadow-lg
                   flex items-center gap-2"
        title="Volver a la lista"
      >
        <span>←</span>
        <span>Volver</span>
      </button>

      {/* Sidebar */}
      <Sidebar onComponentSelect={handleAddComponent} onSaveBlog={handleSaveBlog} />

      
    {/* Preview area */}
    <PreviewArea
      components={blogComponents}
      onEdit={(index) => handleEditComponent(index)}
      onDelete={handleDeleteComponent}
      onDrop={handleAddComponent}
      onReorder={handleReorderComponents}
    />

    {/* Modales de edición */}
    {renderEditModal()}

    {/* ⭐ AGREGAR ESTE MODAL SIMPLE */}
    {showModal && (
      <div 
        className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4"
        onClick={() => modalConfig.showCancel && setShowModal(false)}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header con icono */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start gap-4">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                ${modalConfig.type === 'success' && 'bg-green-100'}
                ${modalConfig.type === 'error' && 'bg-red-100'}
                ${modalConfig.type === 'warning' && 'bg-yellow-100'}
                ${modalConfig.type === 'info' && 'bg-blue-100'}
              `}>
                <span className="text-2xl">
                  {modalConfig.type === 'success' && '✅'}
                  {modalConfig.type === 'error' && '❌'}
                  {modalConfig.type === 'warning' && '⚠️'}
                  {modalConfig.type === 'info' && 'ℹ️'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {modalConfig.title}
                </h3>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed">
              {modalConfig.message}
            </p>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
            {modalConfig.showCancel && (
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 
                           bg-white border-2 border-gray-300 rounded-lg 
                           hover:bg-gray-100 transition-all"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={modalConfig.onConfirm}
              className={`
                px-5 py-2.5 text-sm font-semibold text-white rounded-lg
                transition-all shadow-lg
                ${modalConfig.type === 'success' && 'bg-green-600 hover:bg-green-700'}
                ${modalConfig.type === 'error' && 'bg-red-600 hover:bg-red-700'}
                ${modalConfig.type === 'warning' && 'bg-yellow-600 hover:bg-yellow-700'}
                ${modalConfig.type === 'info' && 'bg-blue-600 hover:bg-blue-700'}
              `}
            >
              {modalConfig.showCancel ? 'Confirmar' : 'Aceptar'}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}