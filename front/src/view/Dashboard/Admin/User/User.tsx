import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useMemo, useState } from "react";
import Loading from "../../../../Helpers/Loading";
import { toast } from "react-toastify";
import { GetUserAllApi, DeleteuserApi } from "../../../../Api/UserApi";
import type { updateuser } from "../../../../types";

const UsuarioForm = lazy(() => import("../../../../Components/Usuario/UsuarioForm"));
const UpdateUsuario = lazy(() => import("../../../../Components/Usuario/UpdateUsuario"));
const ResetPassword = lazy(() => import("../../../../Components/Usuario/ResetPassword"));
const GetUsuario = lazy(() => import("../../../../Components/Usuario/GetUsuario"));

// Paleta de colores lila (igual que Presentacion.tsx)
const COLORS = {
  dark: "#4A1A6E",
  medium: "#7B3FA0",
  light: "#F3EBF9",
  border: "#D8B4F0",
};

export default function User() {
  const queryClient = useQueryClient();

  // Estados de control de Modales
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<updateuser | null>(null);
  const [isIdUsuario, setIsIdUsuario] = useState<number | null>(null);
  const [viewUser, setViewUser] = useState<updateuser | null>(null);
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);

  // Obtención de datos
  const { data: rows, isLoading } = useQuery({
    queryKey: ["UsuariosAll"],
    queryFn: GetUserAllApi,
  });

  // Mutación para eliminar
  const { mutate: runDelete, isPending: deleting } = useMutation({
    mutationFn: DeleteuserApi,
    onError: (error) => toast.error(error.message),
    onSuccess: (res) => {
      toast.success(res);
      queryClient.invalidateQueries({ queryKey: ["UsuariosAll"] });
      setConfirmId(null);
    },
  });

  // Lógica del Buscador
  const filtered = useMemo(() => {
    const list = Array.isArray(rows) ? rows : [];
    const q = search.toLowerCase().trim();
    if (!q) return list;
    return list.filter((r) =>
      [r.nombre, r.apellido, r.ci, r.email].some((v) =>
        String(v ?? "").toLowerCase().includes(q)
      )
    );
  }, [rows, search]);

  if (isLoading) return <Loading />;

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-8 rounded-full" style={{ backgroundColor: COLORS.medium }}></span>
            Gestión de Usuarios
          </h1>
          <p className="text-gray-500 mt-1">Administra los usuarios del sistema farmacéutico</p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-6 py-3 text-white rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 font-bold"
          style={{ backgroundColor: COLORS.dark }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Usuario
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="bg-white rounded-2xl shadow-sm border p-4 mb-6" style={{ borderColor: COLORS.border }}>
        <div className="flex flex-col md:flex-row gap-4 items-center">

          <div className="relative flex-1 w-full">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: COLORS.medium }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, apellido, CI o email..."
              className="w-full pl-12 pr-10 py-3 rounded-xl border-2 outline-none text-sm transition-colors"
              style={{ borderColor: COLORS.border, color: COLORS.dark }}
            />

            {search && (
              <button
                aria-label="Limpiar búsqueda"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-purple-100 transition-colors text-sm"
                style={{ color: COLORS.medium }}
              >
                ✕
              </button>
            )}
          </div>

          <div
            className="px-4 py-2 rounded-lg font-semibold border text-sm flex-shrink-0"
            style={{ background: COLORS.light, color: COLORS.dark, borderColor: COLORS.border }}
          >
            {filtered.length} {filtered.length === 1 ? "usuario" : "usuarios"}
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-2xl shadow-lg border overflow-hidden" style={{ borderColor: COLORS.border }}>
        <div className="overflow-x-auto">
          <div className="max-h-[calc(116vh-320px)] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead
                className="sticky top-0 z-10 text-white"
                style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}
              >
                <tr>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider w-16 text-center">Nro</th>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">CI</th>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider w-44 text-center">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-purple-50">

                {/* ESTADO VACÍO */}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center"
                          style={{ background: COLORS.light }}
                        >
                          <svg className="w-10 h-10" style={{ color: COLORS.border }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <p className="font-medium" style={{ color: COLORS.dark }}>
                          No se encontraron usuarios
                        </p>
                        <p className="text-sm" style={{ color: COLORS.medium }}>
                          {search ? "Intenta con otros términos de búsqueda" : "Comienza creando el primer usuario"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* LISTADO DE DATOS */}
                {filtered.map((item, index) => (
                  <tr
                    key={item.id_usuario ?? index}
                    className="hover:bg-purple-50/40 transition-colors"
                  >
                    {/* NRO */}
                    <td className="px-6 py-4 text-center font-semibold text-sm" style={{ color: COLORS.medium }}>
                      {index + 1}
                    </td>

                    {/* USUARIO CON AVATAR LILA */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #4A1A6E, #7B3FA0)" }}
                        >
                          {String(item.nombre ?? "?")[0].toUpperCase()}
                        </div>
                        <span className="font-semibold" style={{ color: "#2D0A47" }}>
                          {item.nombre} {item.apellido}
                        </span>
                      </div>
                    </td>

                    {/* CI */}
                    <td className="px-6 py-4 text-sm font-medium" style={{ color: "#6B7280" }}>
                      {item.ci}
                    </td>

                    {/* EMAIL */}
                    <td className="px-6 py-4 text-sm font-medium" style={{ color: "#6B7280" }}>
                      {item.email}
                    </td>

                    {/* ROL */}
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1 rounded-lg text-xs font-semibold"
                        style={{ background: COLORS.light, color: COLORS.dark, border: `1px solid ${COLORS.border}` }}
                      >
                        {item.name_rol ?? "Sin rol"}
                      </span>
                    </td>

                    {/* ACCIONES */}
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center gap-1">

                        {/* VER */}
                        <button
                          onClick={() => setViewUser(item)}
                          title="Ver usuario"
                          className="p-2 rounded-lg transition-colors hover:bg-purple-100"
                          style={{ color: COLORS.dark }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* EDITAR */}
                        <button
                          onClick={() => setSelectedUser(item)}
                          title="Editar usuario"
                          className="p-2 rounded-lg transition-colors hover:bg-purple-100"
                          style={{ color: COLORS.medium }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        {/* RESET PASSWORD */}
                        <button
                          onClick={() => setIsIdUsuario(item.id_usuario)}
                          title="Resetear contraseña"
                          className="p-2 rounded-lg transition-colors hover:bg-amber-50"
                          style={{ color: "#B45309" }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </button>

                        {/* ELIMINAR */}
                        <button
                          onClick={() => setConfirmId(item.id_usuario)}
                          title="Eliminar usuario"
                          className="p-2 rounded-lg transition-colors text-red-500 hover:bg-red-50 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODALES CON SUSPENSE */}
      <Suspense fallback={<Loading />}>
        {isOpen && <UsuarioForm setIsOpen={setIsOpen} isOpen={isOpen} />}

        {selectedUser && <UpdateUsuario SendValor={selectedUser} SetVer={() => setSelectedUser(null)} />}

        {isIdUsuario && <ResetPassword SendValor={isIdUsuario} SetVer={() => setIsIdUsuario(null)} />}

        {viewUser && <GetUsuario SendValor={viewUser} SetVer={() => setViewUser(null)} />}
      </Suspense>

      {/* DIÁLOGO DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {confirmId !== null && (
        <ConfirmDialog
          title="¿Eliminar Usuario?"
          message="Esta acción es permanente. Los datos no podrán recuperarse."
          confirmLabel={deleting ? "Eliminando..." : "Sí, eliminar"}
          onConfirm={() => runDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}

// Sub-componente interno para confirmación
function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-100">
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 leading-relaxed">{message}</p>
        </div>
        <div className="p-4 bg-gray-50 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-white transition-all shadow-lg hover:brightness-110"
            style={{ backgroundColor: "#ef4444" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}