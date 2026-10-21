import { Request, Response } from "express";
import { randomInt } from "crypto";
import DataUser from "../Models/UserModels";
import DataCodigo, { CODIGO_MAX_INTENTOS } from "../Models/CodigoModels";
import { EnviarCodigoRegistro } from "../config/mailer";
import { uploadImageGlobal } from "../Middleware/SaveImg";
import { GetDateToday } from "../lib/Time";
import { HashPassword } from "../Utils/auth";

// Genera un codigo de 6 digitos, lo guarda y lo envia al correo indicado.
// Devuelve false si el envio falla (el usuario queda pendiente y puede
// solicitar un reenvio desde el modal).
const GenerarYEnviarCodigoRegistro = async (email: string, nombreCompleto: string): Promise<boolean> => {
    try {
        const codigo = String(randomInt(100000, 1000000));
        await DataCodigo.GuardarCodigo(codigo, email);
        await EnviarCodigoRegistro(email, nombreCompleto, codigo);
        return true;
    } catch (error) {
        console.error("Error al enviar el codigo de verificacion:", error);
        return false;
    }
};

export class UserControllers {
    static readonly  GetAllUser = async(req:Request,res:Response)=>{
        try {
            const data = await DataUser.UserAllModels();
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al obtener Usuario:", error);
            res.status(500).json({ error: "ERROR al obtener el Usuario:" });
        }
    }

    static readonly  GetAllUserId = async(req:Request,res:Response)=>{
        try {
            const {idUsuario}=req.params;
            const data = await DataUser.UserAllModelsId(idUsuario);
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al obtener Usuario:", error);
            res.status(500).json({ error: "ERROR al obtener el Usuario:" });
        }
    }

    static readonly CreateUserControllers = async(req:Request,res:Response):Promise<any>=>{
        try {
            const { ci,nombre,apellido, passwd,telefono,email, idTipoUs,idSucursal } = req.body;
            const files = req.file;
            const imgFile = files;
            const fecha=GetDateToday();
            const VE =  await DataUser.GetEmail(email);
            if(VE.exists){
                res.status(400).json({error:"El Email ya esta Registrado"});
                return;
            }
            const CEDU = await DataUser.GetCI(ci);
            if (CEDU.exists) { 
                res.status(400).json({error:"La Cedula de Identidad ya esta Registrado"});
                return; 
            }

            const NewPasswd = await HashPassword(passwd);

            const id_usuario = await DataUser.CreateUsuarioM({
                ci,
                nombre,
                apellido,
                passwd: NewPasswd,
                telefono,
                email,
                idTipoUs,
                idSucursal
            });
            if(imgFile){
                const rutaImg = await uploadImageGlobal(imgFile,String(id_usuario),fecha,'Usuario');
                await DataUser.UpdateRutaimg(rutaImg,id_usuario);
            }

            // La cuenta queda pendiente (confirmed = 0) hasta verificar el codigo.
            const nombreCompleto = `${nombre} ${apellido}`.trim();
            const correoEnviado = await GenerarYEnviarCodigoRegistro(email, nombreCompleto);

            res.status(201).json({
                message: correoEnviado
                    ? "Usuario creado con éxito. Verifica el correo para activar la cuenta."
                    : "Usuario creado, pero no se pudo enviar el correo de verificación.",
                id_usuario,
                requiresVerification: true,
                email,
                correoEnviado
            });
        } catch (error) {
            console.error("Error al crear usuario:", error);
            res.status(500).json({ error: "Error al crear usuario:" });
        }
    }

    static readonly DeleteUserControllers = async(req:Request,res:Response)=>{
        try {
            const {idUsuario} = req.params
            const data = await DataUser.DeleteUserId(idUsuario);
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al eliminar el usuario:", error);
            res.status(500).json({ error: "Error al eliminar el usuario:" });
        }
    }

    static readonly UpdateUserControllers = async(req:Request,res:Response):Promise<any>=>{
        try {
            const idUsuario=Number(req.params.idUsuario);
            const { ci,nombre,apellido,telefono,email, idTipoUs,idSucursal } = req.body;
            const files = req.file;
            const imgFile = files;
            const fecha=GetDateToday();

            const actuales = await DataUser.UserAllModelsId(idUsuario);
            const usuarioActual = Array.isArray(actuales) ? actuales[0] : actuales;
            if(!usuarioActual){
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            const emailCambio = String(usuarioActual.email ?? "").toLowerCase() !== String(email ?? "").toLowerCase();
            if(emailCambio){
                const VE = await DataUser.GetEmail(email);
                if(VE.exists){
                    return res.status(400).json({ error: "El Email ya esta Registrado" });
                }
            }

            const data = await DataUser.UpodateUserbyId({ci,nombre,apellido,telefono,email,idTipoUs,idSucursal,idUsuario});

            if(imgFile){
                const rutaImg= await uploadImageGlobal(imgFile,String(idUsuario),fecha,'Usuario');
                await DataUser.UpdateRutaimg(rutaImg,idUsuario)
            }

            // Si cambio el correo, la cuenta vuelve a quedar pendiente y se
            // envia un codigo al nuevo email para confirmarlo.
            if(emailCambio){
                await DataUser.SetConfirmed(email, 0);
                const nombreCompleto = `${nombre} ${apellido}`.trim();
                const correoEnviado = await GenerarYEnviarCodigoRegistro(email, nombreCompleto);

                return res.status(200).json({
                    message: correoEnviado
                        ? "Datos actualizados. Verifica el nuevo correo para activar la cuenta."
                        : "Datos actualizados, pero no se pudo enviar el correo de verificación.",
                    requiresVerification: true,
                    email,
                    correoEnviado
                });
            }

            res.status(200).json({ message: data, requiresVerification: false });
        } catch (error) {
            console.error("Error al actualizar usuarios:", error);
            res.status(500).json({ error: "Error al actualizar usuarios:" });
        }
    }

    // ── POST /verificar-codigo: confirma la cuenta tras crear/cambiar email ──
    static readonly VerificarCodigoRegistro = async(req:Request,res:Response):Promise<any>=>{
        try {
            const { email, codigo } = req.body;

            const fila = await DataCodigo.ObtenerCodigo(email);
            if(!fila || fila.length === 0){
                return res.status(400).json({ error: "El Email no está registrado" });
            }
            const usuario = fila[0];

            if(Number(usuario.confirmed) === 1){
                return res.status(200).json({ message: "El usuario ya está verificado", confirmed: true, email });
            }

            if(!usuario.codigoVerificacion){
                return res.status(400).json({ error: "No hay un código activo, solicita uno nuevo" });
            }

            if(Number(usuario.codigoIntentos) >= CODIGO_MAX_INTENTOS){
                await DataCodigo.LimpiarCodigo(email);
                return res.status(400).json({ error: "Se superó el máximo de intentos, solicita un código nuevo" });
            }

            if(!usuario.codigoVigente){
                await DataCodigo.LimpiarCodigo(email);
                return res.status(400).json({ error: "El código ha expirado, solicita uno nuevo" });
            }

            if(String(codigo) !== String(usuario.codigoVerificacion)){
                const intentos = Number(usuario.codigoIntentos) + 1;
                await DataCodigo.IncrementarIntentos(email);

                if(intentos >= CODIGO_MAX_INTENTOS){
                    await DataCodigo.LimpiarCodigo(email);
                    return res.status(400).json({ error: "Se superó el máximo de intentos, solicita un código nuevo" });
                }

                const restantes = CODIGO_MAX_INTENTOS - intentos;
                return res.status(401).json({ error: `El código es incorrecto, te quedan ${restantes} intento(s)` });
            }

            await DataUser.SetConfirmed(email, 1);
            await DataCodigo.LimpiarCodigo(email);

            res.status(200).json({ message: "Usuario verificado correctamente", confirmed: true, email });
        } catch (error) {
            console.error("Error al verificar el codigo de registro:", error);
            return res.status(500).json({ error: "Error al verificar el código" });
        }
    }

    // ── POST /reenviar-codigo: genera y reenvia el codigo de verificacion ────
    static readonly ReenviarCodigoRegistro = async(req:Request,res:Response):Promise<any>=>{
        try {
            const { email } = req.body;

            const data = await DataUser.GetEmail(email);
            if(!data || !data.exists){
                return res.status(400).json({ error: "El Email no está registrado" });
            }

            const fila = await DataCodigo.ObtenerCodigo(email);
            if(!fila || fila.length === 0){
                return res.status(400).json({ error: "El Email no está registrado" });
            }

            const nombreCompleto = `${fila[0]?.nombre || ''} ${fila[0]?.apellido || ''}`.trim();
            const correoEnviado = await GenerarYEnviarCodigoRegistro(email, nombreCompleto);

            if(!correoEnviado){
                return res.status(500).json({ error: "No se pudo enviar el correo de verificación" });
            }

            res.status(200).json({ ok: true, email });
        } catch (error) {
            console.error("Error al reenviar el codigo de registro:", error);
            return res.status(500).json({ error: "Error al reenviar el código" });
        }
    }

}