import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Loading from "../../../../Helpers/Loading";
import { useState, useMemo } from "react";
import { GetAlumnosInscApi, AddAlumnAsistenApi, UpdateAlumnAsistenApi,UpdateFechaApi,GetNotasAlumApi,AddNotasAluApi,
UpdateNotasAlumApi} from "../../../../Api/CursoInscritosApi";
import { type CreateAsistencia, type UpdateAsisAlum,type CreateNotaAl,type UpdateNotaAl} from "../../../../types";
import Calendar from "../../../../assets/calendario.png";
import Presente from "../../../../assets/letra-p.png";
import Falta from "../../../../assets/letra-f.png";
import Lupa from "../../../../assets/lupa.png";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

export default function AlumnosCursoIns() {

  const params = useParams();
  const id_calendario = Number(params.id_calendario);

  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showDateModal, setShowDateModal] = useState(false);
  const [editingCell, setEditingCell] = useState<{ userId: number; fecha: string } | null>(null);

  // ESTADOS PARA EDITAR FECHA
  const [showEditDateModal, setShowEditDateModal] = useState(false);
  const [dateToEdit, setDateToEdit] = useState({ oldDate: '', newDate: '' });

  // 🆕 ESTADOS PARA NOTAS
  const [showNotaModal, setShowNotaModal] = useState(false);
  const [notaEditando, setNotaEditando] = useState<{
    id_user: number;
    nombre: string;
    nota: string;
    id_nota?: number;
  } | null>(null);

  // OBTENER DATOS DE LA API
  const { data, isLoading } = useQuery({
    queryKey: ['GetAlumAsist', id_calendario],
    queryFn: () => GetAlumnosInscApi(id_calendario),
    enabled: !!id_calendario
  });

  // Mutation para agregar asistencia
  const addAsistenciaMutation = useMutation({
    mutationFn: AddAlumnAsistenApi,
    onSuccess: () => {
      toast.success("Asistencia agregada correctamente");
      queryClient.invalidateQueries({ queryKey: ['GetAlumAsist', id_calendario] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al agregar asistencia");
    }
  });

  const updateAsistenciaMutation = useMutation({
    mutationFn: UpdateAlumnAsistenApi,
    onSuccess: () => {
      toast.success("Asistencia actualizada correctamente");
      queryClient.invalidateQueries({ queryKey: ['GetAlumAsist', id_calendario] });
      setEditingCell(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar asistencia");
    }
  });

  const updateDateMutation = useMutation({
    mutationFn: UpdateFechaApi,
    onSuccess: () => {
      toast.success("Fecha actualizada correctamente");
      queryClient.invalidateQueries({ queryKey: ['GetAlumAsist', id_calendario] });
      setShowEditDateModal(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar fecha");
    }
  });

  // MUTATIONS PARA NOTAS
  const addNotaMutation = useMutation({
    mutationFn: AddNotasAluApi,
    onSuccess: () => {
      toast.success("Nota agregada correctamente");
      queryClient.invalidateQueries({ queryKey: ['GetNotasAlumnos', id_calendario] });
      setShowNotaModal(false);
      setNotaEditando(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al agregar nota");
    }
  });

  const updateNotaMutation = useMutation({
    mutationFn: UpdateNotasAlumApi,
    onSuccess: () => {
      toast.success("Nota actualizada correctamente");
      queryClient.invalidateQueries({ queryKey: ['GetNotasAlumnos', id_calendario] });
      setShowNotaModal(false);
      setNotaEditando(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar nota");
    }
  });

  // OBTENER TODAS LAS NOTAS DE LOS ALUMNOS
  const { data: notasData } = useQuery({
    queryKey: ['GetNotasAlumnos', id_calendario],
    queryFn: async () => {
      if (!data) return new Map();
      
      // Obtener IDs únicos de alumnos
      const uniqueStudents = Array.from(new Set(data.map(d => d.id_user)));
      
      // Obtener notas de todos los alumnos con id_calendario
      const notasPromises = uniqueStudents.map(id_user => 
        GetNotasAlumApi(id_user, id_calendario)
      );
      
      const notasResults = await Promise.all(notasPromises);
      
      // Crear un mapa de notas por id_user
      const notasMap = new Map();
      uniqueStudents.forEach((id_user, index) => {
        const notas = notasResults[index];
        if (notas && notas.length > 0) {
          // Tomar la primera nota del array
          notasMap.set(id_user, notas[0]);
        }
      });
      
      console.log(" Mapa de notas creado:", notasMap);
      return notasMap;
    },
    enabled: !!data && data.length > 0
  });

  const processedData = useMemo(() => {
    if (!data) return { students: [], fechas: [] };
    
    const fechasSet = new Set<string>();
    data.forEach(record => {
      if(record.fecha_asistencia){
        fechasSet.add(record.fecha_asistencia);
      }
    });
    const fechas = Array.from(fechasSet).sort();

    const studentsMap = new Map();
    
    data.forEach(record => {
      const key = record.id_user;
      if (!studentsMap.has(key)) {
        studentsMap.set(key, {
          id_user: record.id_user,
          nombre: `${record.nombre || ''} ${record.apellido || ''}`.trim(),
          asistencias: {}
        });
      }
      
      if(record.fecha_asistencia){
        const student = studentsMap.get(key);
        student.asistencias[record.fecha_asistencia] = record.asistencia;
      }
    });

    const students = Array.from(studentsMap.values()).map((student, index) => {
      const asistenciasArray = fechas.map(fecha => student.asistencias[fecha] || '');
      const total = asistenciasArray.filter(a => a === 'Presente').length;
      const faltas = asistenciasArray.filter(a => a === 'Falta').length;
      const porcentaje = fechas.length > 0 ? Math.round((total / fechas.length) * 100) : 0;

      // Obtener nota del alumno
      const notaInfo = notasData?.get(student.id_user);

      return {
        nro: index + 1,
        id_user: student.id_user,
        nombre: student.nombre,
        asistencias: asistenciasArray,
        total,
        porcentaje,
        faltas,
        nota: notaInfo?.nota || '',
        id_nota: notaInfo?.id_nota
      };
    });

    return { students, fechas };
  }, [data, notasData]);

  const filteredStudents = useMemo(() => {
    return processedData.students.filter(student =>
      student.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [processedData.students, searchTerm]);

  const formatFecha = (fecha: string) => {
    if (!fecha) return '';
    
    const [year, month, day] = fecha.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    const dayNum = date.getDate();
    const monthName = date.toLocaleString('es-ES', { month: 'short' });
    return `${dayNum} ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`;
  };

  const handleAddDate = async () => {
    if (!selectedDate) return;

    try {
      const promises = processedData.students.map(student => {
        const asistenciaData: CreateAsistencia = {
          asistencia: 'Presente', 
          fecha_asistencia: selectedDate,
          id_user: student.id_user, 
          id_calendario: id_calendario
        };
        return addAsistenciaMutation.mutateAsync(asistenciaData);
      });

      await Promise.all(promises);
      setShowDateModal(false);
      setSelectedDate('');
      toast.success('Fecha agregada correctamente');
    } catch (error) {
      console.error('Error al agregar fecha:', error);
      toast.error('Error al agregar fecha');
    }
  };

  const handleToggleAsistencia = async (userId: number, fecha: string, currentValue: string) => {
    let newValue = 'Presente';
    if (currentValue === 'Presente') newValue = 'Falta';
    else if (currentValue === 'Falta') newValue = 'Presente';

    const record = data?.find(r => 
      r.id_user === userId && r.fecha_asistencia === fecha
    );

    if (record && record.id_asistencia) {
      const updateData: UpdateAsisAlum = {
        id_asistencia: record.id_asistencia,
        id_user: userId,
        asistencia: newValue,
        fecha_asistencia: fecha,
        id_calendario: id_calendario,
      };
      updateAsistenciaMutation.mutate(updateData);
    } else {
      const createData: CreateAsistencia = {
        asistencia: newValue,
        fecha_asistencia: fecha,
        id_user: userId, 
        id_calendario: id_calendario
      };
      addAsistenciaMutation.mutate(createData);
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage === 100) return 'text-emerald-600 bg-emerald-50';
    if (percentage >= 80) return 'text-blue-600 bg-blue-50';
    if (percentage >= 50) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const renderAttendanceIcon = (value: string, onClick?: () => void) => {
    const className = onClick ? "w-5 h-5 object-contain cursor-pointer hover:scale-110 transition-transform" : "w-5 h-5 object-contain";
    
    if (value === 'Presente') return <img src={Presente} alt="Presente" className={className} onClick={onClick} />;
    if (value === 'Falta') return <img src={Falta} alt="Falta" className={className} onClick={onClick} />;
    return <div className="w-5 h-5 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 transition-colors" onClick={onClick}></div>;
  };

  const handleUpdateDate = () => {
    if (!dateToEdit.newDate) return;
    
    updateDateMutation.mutate({
      fecha_antigua: dateToEdit.oldDate,
      fecha_nueva: dateToEdit.newDate,
      id_calendario: id_calendario
    });
  };

  // FUNCIÓN PARA ABRIR MODAL DE NOTA
  const handleOpenNotaModal = (student: any) => {
    setNotaEditando({
      id_user: student.id_user,
      nombre: student.nombre,
      nota: student.nota || '',
      id_nota: student.id_nota
    });
    setShowNotaModal(true);
  };

  // FUNCIÓN PARA GUARDAR NOTA
  const handleSaveNota = () => {
    if (!notaEditando) return;

    const notaValue = notaEditando.nota.trim();
    
    // Validar que sea un número válido
    if (notaValue && (isNaN(Number(notaValue)) || Number(notaValue) < 0 || Number(notaValue) > 100)) {
      toast.error('La nota debe ser un número entre 0 y 100');
      return;
    }

    if (notaEditando.id_nota) {
      // Actualizar nota existente
      const updateData: UpdateNotaAl = {
        id_nota: notaEditando.id_nota,
        nota: notaValue,
        id_user: notaEditando.id_user,
        id_calendario: id_calendario
      };
      updateNotaMutation.mutate(updateData);
    } else {
      // Crear nueva nota
      const createData: CreateNotaAl = {
        nota: notaValue,
        id_user: notaEditando.id_user,
        id_calendario: id_calendario
      };
      addNotaMutation.mutate(createData);
    }
  };

  // FUNCIÓN PARA OBTENER COLOR DE NOTA
  const getNotaColor = (nota: string) => {
    if (!nota) return 'text-slate-400 bg-slate-50';
    const notaNum = Number(nota);
    if (notaNum >= 70) return 'text-emerald-600 bg-emerald-50';
    if (notaNum >= 51) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  if (isLoading) return <Loading />;

  return (
   <div className="min-h-screen w-full bg-gradient-to-br p-4 md:p-8">
      <div className="mx-auto max-w-[1600px]"> 
        {/* Header */} 
        <header className="max-w-7xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-slate-200">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br rounded-xl">
                      <img src={Calendar} alt="Calendario" className="w-6 h-6 object-contain" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#0129ad] via-blue-700 to-indigo-600 bg-clip-text text-transparent">
                      Control de Asistencias
                    </h1>
                  </div>
                  
                </div>
                
                <button
                  onClick={() => setShowDateModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0129ad] via-blue-700 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
                >
                  + Agregar Fecha
                </button>
              </div>

              {/* Buscador */}
              <div className="relative">
                <img src={Lupa} alt="" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar estudiante por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl 
                  focus:border-indigo-500 focus:outline-none transition-colors text-slate-700 placeholder:text-slate-400"
                />
                {searchTerm && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-slate-500">
                    {filteredStudents.length} resultado{filteredStudents.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
         {/* Tabla */}
      <div className="">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 ">
          <div className="">
            <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-[#00155C] text-white">
                  <tr className="bg-gradient-to-r from-[#0129ad] via-blue-700 to-indigo-600 text-white">
                    <th className="px-4 py-4 text-left text-sm font-semibold bg-gradient-to-r from-[#0129ad] via-blue-700 ">
                      NRO
                    </th>
                    <th className="px-2 py-4 text-left text-sm font-semibold ">
                      NOMBRE Y APELLIDOS 
                    </th>
                    
                    {processedData.fechas.map((fecha, idx) => (
                      <th key={idx} className="px-3 py-4 text-center text-sm font-semibold max-w-[calc(100vh-220px)] overflow-x-auto">
                        <div 
                          className="cursor-pointer hover:bg-white/20 rounded p-1 transition-colors group relative"
                          onClick={() => {
                            setDateToEdit({ oldDate: fecha, newDate: fecha });
                            setShowEditDateModal(true);
                          }}
                          title="Click para editar fecha"
                        >
                          {formatFecha(fecha)}
                          <span className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 bg-white text-blue-600 rounded-full p-0.5 shadow-sm transition-opacity">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </span>
                        </div>
                      </th>
                    ))}
                    
                    <th className="px-4 py-4 text-center text-sm font-semibold">
                      CANT. ASIST.
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold">
                      % ASIST.
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold">
                      CANT. FALTAS
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold">
                      NOTAS
                    </th>
                  </tr>
                </thead>
                
                <tbody className="">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={processedData.fechas.length + 6} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <img src={Lupa} alt="" className="w-12 h-12 text-slate-300" />
                          <p className="text-slate-500 font-medium">
                            {searchTerm ? 'No se encontraron estudiantes' : 'No hay datos de asistencia'}
                          </p>
                          <p className="text-slate-400 text-sm">
                            {searchTerm ? 'Intenta con otro término de búsqueda' : 'Agrega una fecha para comenzar'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, idx) => (
                      <tr 
                        key={student.id_user}
                        className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                        }`}
                      >
                        <td className="px-4 py-4 text-sm font-medium text-slate-700 sticky left-0 bg-inherit">
                          {student.nro}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            {student.nombre}
                          </div>
                        </td>
                        
                        {processedData.fechas.map((fecha, idx) => (
                          <td key={idx} className="px-3 py-4 text-center max-w-[calc(100vh-220px)] overflow-x-auto">
                            <div className="flex justify-center">
                              {renderAttendanceIcon(
                                student.asistencias[idx], 
                                () => handleToggleAsistencia(student.id_user, fecha, student.asistencias[idx])
                              )}
                            </div>
                          </td>
                        ))}
                        
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-sm">
                            {student.total}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-lg font-bold text-sm ${getPercentageColor(student.porcentaje)}`}>
                            {student.porcentaje}%
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                            student.faltas === 0 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {student.faltas}
                          </span>
                        </td>
                        
                        {/* COLUMNA DE NOTAS */}
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => handleOpenNotaModal(student)}
                            className={`inline-flex items-center justify-center min-w-[60px] px-3 py-2 rounded-lg font-bold text-sm cursor-pointer hover:scale-105 transition-all ${
                              student.nota 
                                ? getNotaColor(student.nota) 
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                            title="Click para editar nota"
                          >
                            {student.nota || 'Sin nota'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
          </div>
        </div>
      </div>
      </div>
      

      {/* Modal para agregar fecha */}
      {showDateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Nueva Fecha de Asistencia</h3>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Seleccionar Fecha
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDateModal(false);
                  setSelectedDate('');
                }}
                className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddDate}
                disabled={!selectedDate || addAsistenciaMutation.isPending}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addAsistenciaMutation.isPending ? 'Agregando...' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar fecha */}
      {showEditDateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Editar Fecha</h3>
            
            <div className="mb-6">
              <p className="text-sm text-slate-500 mb-2">Fecha actual: <b>{formatFecha(dateToEdit.oldDate)}</b></p>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nueva Fecha
              </label>
              <input
                type="date"
                value={dateToEdit.newDate}
                onChange={(e) => setDateToEdit({ ...dateToEdit, newDate: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEditDateModal(false)}
                className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateDate}
                disabled={!dateToEdit.newDate || updateDateMutation.isPending}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                {updateDateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA NOTAS */}
      {showNotaModal && notaEditando && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              {notaEditando.id_nota ? 'Editar Nota' : 'Agregar Nota'}
            </h3>
            <p className="text-slate-600 mb-6">Estudiante: <b>{notaEditando.nombre}</b></p>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nota (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={notaEditando.nota}
                onChange={(e) => setNotaEditando({ ...notaEditando, nota: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-lg font-semibold text-center"
                placeholder="Ingrese la nota"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNotaModal(false);
                  setNotaEditando(null);
                }}
                className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNota}
                disabled={addNotaMutation.isPending || updateNotaMutation.isPending}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {(addNotaMutation.isPending || updateNotaMutation.isPending) ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

     
    </div>
  );
}