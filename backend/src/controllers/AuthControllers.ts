import { Request, Response } from "express";
import { randomInt } from "crypto";
import DataUsers from "../Models/UserModels";
import DataCodigo, { CODIGO_MAX_INTENTOS } from "../Models/CodigoModels";
import { EnviarCodigoLogin } from "../config/mailer";
import { CheckPassword, HashPassword } from "../Utils/auth";
import { GenerateJwt } from "../Utils/jwt";

// Codigo de 6 digitos (100000 - 999999) para la verificacion por correo.
const GenerarCodigoLogin = (): string => String(randomInt(100000, 1000000));

export class AuthControllers {

    // ── POST /login: valida credenciales y envia codigo OTP por correo ──────
    // Ya NO devuelve el JWT directamente: primero debe verificar el codigo
    // en POST /verificar-codigo.
    static readonly Login = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, passwd } = req.body;
        const data = await DataUsers.GetEmail(email);
        if (!data || !data.exists) {
            return res.status(400).json({ error: 'El Email no está registrado' });
        }
        const VeriCon = await DataUsers.VerifedConfirmed(email);
        if (!VeriCon.exists) {
            return res.status(400).json({ error: 'El usuario no está verificado' });
        }
        const Pass = await DataUsers.GetPasswd(email);
        const VerPass = Pass[0].passwd;
        const Correct = await CheckPassword(passwd, VerPass);
        if (!Correct) {
            return res.status(401).json({ error: 'El password es incorrecto' });
        }

        const codigo = GenerarCodigoLogin();
        await DataCodigo.GuardarCodigo(codigo, email);

        const fila = await DataCodigo.ObtenerCodigo(email);
        const nombreCompleto = `${fila[0]?.nombre || ''} ${fila[0]?.apellido || ''}`.trim();

        try {
            await EnviarCodigoLogin(email, nombreCompleto, codigo);
        } catch (errorEnvio) {
            await DataCodigo.LimpiarCodigo(email);
            console.error("Error al enviar el codigo de login:", errorEnvio);
            return res.status(500).json({ error: "No se pudo enviar el código de verificación" });
        }

        res.status(200).json({ requiresCode: true, email });

    } catch (error) {
        console.error("Error al loguearse:", error);
        return res.status(500).json({ error: "Error al loguearse" });
    }
};

    // ── POST /verificar-codigo: valida el codigo OTP y entrega el JWT ───────
    static readonly VerificarCodigo = async (req: Request, res: Response): Promise<any> => {
        try {
            const { email, codigo } = req.body;

            const fila = await DataCodigo.ObtenerCodigo(email);
            if (!fila || fila.length === 0) {
                return res.status(400).json({ error: 'El Email no está registrado' });
            }
            const usuario = fila[0];

            if (!usuario.codigoVerificacion) {
                return res.status(400).json({ error: 'No hay un código activo, solicita uno nuevo' });
            }

            if (Number(usuario.codigoIntentos) >= CODIGO_MAX_INTENTOS) {
                await DataCodigo.LimpiarCodigo(email);
                return res.status(400).json({ error: 'Se superó el máximo de intentos, solicita un código nuevo' });
            }

            if (!usuario.codigoVigente) {
                await DataCodigo.LimpiarCodigo(email);
                return res.status(400).json({ error: 'El código ha expirado, solicita uno nuevo' });
            }

            if (String(codigo) !== String(usuario.codigoVerificacion)) {
                const intentos = Number(usuario.codigoIntentos) + 1;
                await DataCodigo.IncrementarIntentos(email);

                if (intentos >= CODIGO_MAX_INTENTOS) {
                    await DataCodigo.LimpiarCodigo(email);
                    return res.status(400).json({ error: 'Se superó el máximo de intentos, solicita un código nuevo' });
                }

                const restantes = CODIGO_MAX_INTENTOS - intentos;
                return res.status(401).json({ error: `El código es incorrecto, te quedan ${restantes} intento(s)` });
            }

            await DataCodigo.LimpiarCodigo(email);

            const token2 = GenerateJwt(usuario.idUsuario);
            const IDRolArray = await DataUsers.GetIdRol(email);
            if (!IDRolArray || IDRolArray.length === 0) {
                throw new Error("Rol no encontrado");
            }
            const IDRol = IDRolArray[0].nameRol;

            res.status(200).json({ token2, IDRol });

        } catch (error) {
            console.error("Error al verificar el codigo:", error);
            return res.status(500).json({ error: "Error al verificar el código" });
        }
    };

    // ── POST /reenviar-codigo: genera otro codigo y lo reenvia ──────────────
    static readonly ReenviarCodigo = async (req: Request, res: Response): Promise<any> => {
        try {
            const { email } = req.body;

            const data = await DataUsers.GetEmail(email);
            if (!data || !data.exists) {
                return res.status(400).json({ error: 'El Email no está registrado' });
            }
            const VeriCon = await DataUsers.VerifedConfirmed(email);
            if (!VeriCon.exists) {
                return res.status(400).json({ error: 'El usuario no está verificado' });
            }

            const codigo = GenerarCodigoLogin();
            await DataCodigo.GuardarCodigo(codigo, email);

            const fila = await DataCodigo.ObtenerCodigo(email);
            const nombreCompleto = `${fila[0]?.nombre || ''} ${fila[0]?.apellido || ''}`.trim();

            try {
                await EnviarCodigoLogin(email, nombreCompleto, codigo);
            } catch (errorEnvio) {
                await DataCodigo.LimpiarCodigo(email);
                console.error("Error al reenviar el codigo de login:", errorEnvio);
                return res.status(500).json({ error: "No se pudo enviar el código de verificación" });
            }

            res.status(200).json({ ok: true, email });

        } catch (error) {
            console.error("Error al reenviar el codigo:", error);
            return res.status(500).json({ error: "Error al reenviar el código" });
        }
    };
    
    static readonly ResetPasswd = async(req:Request,res:Response):Promise<any>=>{
        try {
            const {idUsuario} = req.params
            const {passwd, adminPasswd} = req.body

            // Verificamos que quien cambia la contraseña sea el usuario logueado,
            // revalidando su propia contraseña actual.
            if (!adminPasswd) {
                return res.status(400).json({ error: "Debes ingresar tu contraseña actual" });
            }

            if (!req.user?.idUsuario) {
                return res.status(401).json({ error: "No autenticado" });
            }

            const AdminPass = await DataUsers.GetPasswdById(req.user.idUsuario);
            const AdminHash = AdminPass[0]?.passwd;

            if (!AdminHash) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            const Correct = await CheckPassword(adminPasswd, AdminHash);
            if (!Correct) {
                return res.status(401).json({ error: "Tu contraseña actual es incorrecta" });
            }

            const NewPasswd =  await HashPassword(passwd)
            const data = await DataUsers.ResetPasswd(NewPasswd,idUsuario);
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al restablecer la contrasenha:", error);
            res.status(500).json({ error: "Error al restablecer la contrasenha" }); 
        }
    }

    static readonly GetAuthUser = async(req:Request,res:Response):Promise<any>=>{
        try {
            return res.json(req.user)
        } catch (error) {
            console.error("Error al Obtener los Usuarios Auth:", error);
            res.status(500).json({ error: "Error al Obtener los Usuarios Auth" });  
        }
    }

    // ── GET: Datos completos del usuario actualmente logueado ─────────────────
    // A diferencia de GetAuthUser (que solo reenvía lo que el middleware
    // guardó en req.user: idUsuario, idTipoUs, nameRol), este método consulta
    // la fila completa del usuario -incluyendo nombre, apellido e idSucursal-
    // que es lo que necesita el frontend para mostrar "Atendido por" en el POS.
    static readonly GetMe = async (req: Request, res: Response): Promise<any> => {
        try {
            // idUsuario viene del token ya verificado por el middleware "authenticate",
            // nunca de req.params/body -> así nadie puede pedir datos de otro usuario.
            if (!req.user?.idUsuario) {
                return res.status(401).json({ error: 'No autenticado' });
            }

            // Reutilizamos la función que ya existía en UserModels.ts
            const rows = await DataUsers.UserAllModelsId(req.user.idUsuario);
            const usuario = Array.isArray(rows) ? rows[0] : rows;

            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            return res.json(usuario);
        } catch (error) {
            console.error("Error al obtener el usuario actual:", error);
            res.status(500).json({ error: "Error al obtener el usuario actual" });
        }
    }

}