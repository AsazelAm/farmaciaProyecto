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

const COLORS = {
  dark: "#1A3A6E",
  medium: "#3F6FA0",
  light: "#EBF1F9",
  border: "#B4CCF0",
  text: "#2D4A6E"
};

export default function User() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  
  // Estados de control de Modales (usando el valor como trigger)
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<updateuser | null>(null);
  const [isIdUsuario, setIsIdUsuario] = useState<number | null>(null);
  const [viewUser, setViewUser] = useState<updateuser | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["UsuariosAll"],
    queryFn: GetUserAllApi,
  });

  const { mutate: runDelete, isPending: deleting } = useMutation({
    mutationFn: DeleteuserApi,
    onError: (error) => toast.error(error.message),
    onSuccess: (res) => {
      toast.success(res);
      queryClient.invalidateQueries({ queryKey: ["UsuariosAll"] });
      setConfirmId(null);
    },
  });

  const filtered = useMemo(() => {
    const list = Array.isArray(rows) ? rows : [];
    const q = search.toLowerCase().trim();
    if (!q) return list;
    return list.filter((r) =>
      [r.nombre, r.apellido, r.ci, r.email].some(v => 
        String(v ?? "").toLowerCase().includes(q)
      )
    );
  }, [rows, search]);

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen w-full p-4 md:p-8" style={{ background: `linear-gradient(135deg, ${COLORS.light} 0%, #E4EDF5 50%, #D8E4F2 100%)` }}>
      <div className="mx-auto max-w-[1400px]">
        
        {/* HEADER */}
        <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-[#1A3A6E] to-[#3F6FA0]">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold" style={{ color: COLORS.dark }}>Usuarios</h1>
              <p className="text-sm" style={{ color: COLORS.medium }}>Administra los usuarios del sistema farmacéutico</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all bg-gradient-to-br from-[#1A3A6E] to-[#3F6FA0]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Nuevo Usuario
          </button>
        </header>

        {/* SEARCH BAR */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 mb-6" style={{ borderColor: COLORS.border }}>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: COLORS.medium }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, apellido, CI o email..."
                className="w-full pl-12 pr-10 py-3 rounded-xl border-2 outline-none text-sm transition-colors focus:border-[#1A3A6E]"
                style={{ borderColor: COLORS.border, color: COLORS.dark }}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-blue-100 transition-colors" style={{ color: COLORS.medium }}>✕</button>
              )}
            </div>
            <div className="px-4 py-2 rounded-lg font-semibold border text-sm" style={{ background: COLORS.light, color: COLORS.dark, borderColor: COLORS.border }}>
              {filtered.length} {filtered.length === 1 ? "usuario" : "usuarios"}
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-lg border overflow-hidden" style={{ borderColor: COLORS.border }}>
          <div className="overflow-x-auto max-h-[calc(100vh-320px)]">
            <table className="w-full">
              <thead className="sticky top-0 z-10 text-white bg-gradient-to-r from-[#1A3A6E] to-[#3F6FA0]">
                <tr>
                  <ThCell width="w-16">Nro</ThCell>
                  <ThCell>Usuario</ThCell>
                  <ThCell>CI</ThCell>
                  <ThCell>Email</ThCell>
                  <ThCell>Rol</ThCell>
                  <ThCell width="w-44 text-center">Opciones</ThCell>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: COLORS.light }}>
                          <svg className="w-10 h-10" style={{ color: COLORS.border }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <p className="font-medium" style={{ color: COLORS.dark }}>No se encontraron usuarios</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, index) => (
                    <tr key={item.id_usuario ?? index} className="hover:bg-blue-50/40 transition-colors">
                      <TdCell className="text-center font-semibold" style={{ color: COLORS.medium }}>{index + 1}</TdCell>
                      <TdCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br from-[#1A3A6E] to-[#3F6FA0]">
                            {String(item.nombre ?? "?")[0].toUpperCase()}
                          </div>
                          <p className="font-semibold text-[#0D2247]">{item.nombre} {item.apellido}</p>
                        </div>
                      </TdCell>
                      <TdCell style={{ color: COLORS.text }}>{item.ci}</TdCell>
                      <TdCell style={{ color: COLORS.text }}>{item.email}</TdCell>
                      <TdCell>
                        <span className="px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: COLORS.light, color: COLORS.dark }}>
                          {item.name_rol ?? "Sin rol"}
                        </span>
                      </TdCell>
                      <TdCell>
                        <div className="flex justify-center gap-1">
                          <ActionButton icon="eye" color={COLORS.dark} onClick={() => setViewUser(item)} title="Ver" />
                          <ActionButton icon="edit" color={COLORS.medium} onClick={() => setSelectedUser(item)} title="Editar" />
                          <ActionButton icon="key" color="#B45309" onClick={() => setIsIdUsuario(item.id_usuario)} title="Password" />
                          <ActionButton icon="trash" color="#ef4444" onClick={() => setConfirmId(item.id_usuario)} title="Eliminar" />
                        </div>
                      </TdCell>
                    </tr>
                  ))
                )}
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
        {confirmId && (
          <ConfirmDialog
            title="¿Eliminar Usuario?"
            message="Esta acción es permanente. Los datos no podrán recuperarse."
            confirmLabel={deleting ? "Eliminando..." : "Sí, eliminar"}
            onCancel={() => setConfirmId(null)}
            onConfirm={() => runDelete(confirmId)}
            disabled={deleting}
          />
        )}
      </Suspense>
    </div>
  );
}

/* ── COMPONENTES AUXILIARES OPTIMIZADOS ── */

const ThCell = ({ children, width = "" }: { children: React.ReactNode; width?: string }) => (
  <th className={`px-4 py-4 text-left ${width}`}>
    <span className="text-xs font-bold uppercase tracking-wider opacity-90">{children}</span>
  </th>
);

const TdCell = ({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <td className={`px-4 py-4 text-sm ${className}`} style={style}>{children}</td>
);

const ActionButton = ({ icon, color, onClick, title }: { icon: string; color: string; onClick: () => void; title: string }) => {
  const icons: Record<string, JSX.Element> = {
    eye: <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />,
    edit: <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    key: <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />,
    trash: <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  };
  return (
    <button onClick={onClick} title={title} className="p-2 rounded-lg transition-colors hover:bg-blue-100/50" style={{ color }}>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icons[icon]}</svg>
    </button>
  );
};

const ConfirmDialog = ({
   title, message, confirmLabel, onConfirm, onCancel, disabled }: any) => (
  <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border overflow-hidden" style={{ borderColor: COLORS.border }}>
      <div className="px-6 py-5 border-b flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${COLORS.light}, #E4EDF5)`, borderColor: COLORS.border }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 className="text-xl font-bold text-[#1A3A6E]">{title}</h3>
      </div>
      <div className="px-6 py-5 text-gray-600">{message}</div>
      <div className="px-6 py-4 flex justify-end gap-3 border-t bg-[#EBF1F9]" style={{ borderColor: COLORS.border }}>
        <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border-2 font-medium hover:bg-white transition-colors" style={{ borderColor: COLORS.border, color: COLORS.dark }}>Cancelar</button>
        <button onClick={onConfirm} disabled={disabled} className="px-5 py-2.5 rounded-xl text-white font-semibold shadow-lg disabled:opacity-50 bg-gradient-to-r from-red-600 to-red-700">{confirmLabel}</button>
      </div>
    </div>
  </div>
);