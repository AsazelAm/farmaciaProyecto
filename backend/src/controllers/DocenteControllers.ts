import { Request, Response } from "express";
import DataDocentes from "../Models/DocentesModels";
import { uploadImageGlobal } from "../Middleware/SaveImg";
import { GetDateToday } from "../lib/Time";
import { uploadPdfGlobal } from "../Middleware/SavePdf";
import { HashPassword } from "../Utils/auth";
import { generateToken } from "../lib/token";
import { AuthEmail } from "../lib/AuthEmail";

export class DocentesControllers {
    // GET - Obtener todos los docentes
    static readonly GetDocenteControllers = async(req:Request, res:Response):Promise<any> => {
        try {
            const data = await DataDocentes.GetDocentes();
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al obtener docentes:", error);
            res.status(500).json({ error: "Error al obtener docentes" });
        }
    }

    // GET - Obtener un docente por ID
    static readonly GetDocenteByIdControllers = async(req:Request, res:Response):Promise<any> => {
        try {
            const { id } = req.params;
            const data = await DataDocentes.GetDocenteById(id);
            
            if (!data) {
                return res.status(404).json({ error: "Docente no encontrado" });
            }
            
            res.status(200).json(data);
        } catch (error) {
            console.error("Error al obtener docente:", error);
            res.status(500).json({ error: "Error al obtener docente" });
        }
    }

    // POST - Crear docente
    static readonly AddDocentesControllers = async(req:Request, res:Response):Promise<any> => {
        try {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const imgFile = files['img'] ? files['img'][0] : null;
            const cvFile = files['cv'] ? files['cv'][0] : null;

            const fecha = GetDateToday();

            // Parsear los arrays que vienen como strings
            const array1 = JSON.parse(req.body.array1);
            const array2 = JSON.parse(req.body.array2);

            const {nombre, apellido, celular, url, formacion, descripcion, honorarios, Email} = array1[0]
            
            const data = await DataDocentes.Verificar(Email)
            if(data !== 0) {
                return res.status(400).json({ error: "El Email ya está registrado" });
            }

            const id = await DataDocentes.AddDocenteModels({
                nombre,
                apellido,
                celular,
                url,
                formacion,
                descripcion,
                honorarios,
                Email
            })

            if (array2 && array2.length > 0) {
                for (const detalle of array2) {
                    const { id_ha } = detalle;
                    await DataDocentes.addDochabi(id, id_ha);
                }
            }
            
            if(imgFile) {
                const rutaImg = await uploadImageGlobal(imgFile, String(id), fecha, 'Docente');
                await DataDocentes.UpdateRutaimg(rutaImg, id);
            }

            if(cvFile) {
                const rutaCv = await uploadPdfGlobal(cvFile, String(id), fecha, 'Docente');
                await DataDocentes.UpdateCvRuta(rutaCv, id);
            }

            res.status(201).json({ 
                message: 'Docente agregado exitosamente',
                id: id
            })

        } catch (error) {
            console.error("Error al guardar el docente:", error);
            res.status(500).json({ error: "Error al guardar el docente" }); 
        }
    }

    // PUT - Actualizar docente
    static readonly UpdateDocenteControllers = async(req:Request, res:Response):Promise<any> => {
        try {
            const { id } = req.params;
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const imgFile = files['img'] ? files['img'][0] : null;
            const cvFile = files['cv'] ? files['cv'][0] : null;

            const fecha = GetDateToday();

            // Verificar si el docente existe
            const docenteExiste = await DataDocentes.GetDocenteById(id);
            if (!docenteExiste) {
                return res.status(404).json({ error: "Docente no encontrado" });
            }

            // Parsear los arrays que vienen como strings
            const array1 = JSON.parse(req.body.array1);
            const array2 = JSON.parse(req.body.array2);

            const {nombre, apellido, celular, url, formacion, descripcion, honorarios, Email} = array1[0]
            
            // Verificar si el email ya existe (excluyendo el docente actual)
            const emailExiste = await DataDocentes.VerificarEmailUpdate(Email, id);
            if(emailExiste !== 0) {
                return res.status(400).json({ error: "El Email ya está registrado por otro docente" });
            }

            // Actualizar datos del docente
            await DataDocentes.UpdateDocenteModels(id, {
                nombre,
                apellido,
                celular,
                url,
                formacion,
                descripcion,
                honorarios,
                Email
            });

            // Actualizar habilidades
            if (array2) {
                // Eliminar habilidades anteriores
                await DataDocentes.DeleteDochabi(id);
                
                // Agregar nuevas habilidades
                if (array2.length > 0) {
                    for (const detalle of array2) {
                        const { id_ha } = detalle;
                        await DataDocentes.addDochabi(id, id_ha);
                    }
                }
            }
            
            // Actualizar imagen si se proporciona
            if(imgFile) {
                const rutaImg = await uploadImageGlobal(imgFile, String(id), fecha, 'Docente');
                await DataDocentes.UpdateRutaimg(rutaImg, id);
            }

            // Actualizar CV si se proporciona
            if(cvFile) {
                const rutaCv = await uploadPdfGlobal(cvFile, String(id), fecha, 'Docente');
                await DataDocentes.UpdateCvRuta(rutaCv, id);
            }

            res.status(200).json({ 
                message: 'Docente actualizado exitosamente'
            });

        } catch (error) {
            console.error("Error al actualizar el docente:", error);
            res.status(500).json({ error: "Error al actualizar el docente" }); 
        }
    }

    // DELETE - Eliminar docente (soft delete)
    static readonly DeleteDocenteControllers = async(req:Request, res:Response):Promise<any> => {
        try {
            const {id} = req.params;
            
            // Verificar si el docente existe
            const docenteExiste = await DataDocentes.GetDocenteById(id);
            if (!docenteExiste) {
                return res.status(404).json({ error: "Docente no encontrado" });
            }

            const data = await DataDocentes.DeleteDocentes(id);
            res.status(200).json({ message: data });
        } catch (error) {
            console.error("Error al eliminar docente:", error);
            res.status(500).json({ error: "Error al eliminar docente" }); 
        }
    }

    // GET - Obtener habilidades de un docente
    static readonly gethabilidadesDocentes = async(req:Request, res:Response):Promise<any> => {
        try {
            const {id} = req.params;
            const data = await DataDocentes.Gethabilidades(id);
            res.status(200).json(data);
        } catch (error) {
            console.error("Error al obtener habilidades de docentes:", error);
            res.status(500).json({ error: "Error al obtener habilidades de docentes" });  
        }
    }

    //Register Docentes
    static readonly RegisterDocenteControllers = async(req:Request, res:Response):Promise<any> => {
        try {
             const {nombre, apellido, telefono:celular, correo:Email, password} = req.body;
            
             const data = await DataDocentes.Verificar(Email)
             if(data !== 0) {
                 return res.status(400).json({ error: "El Email ya está registrado" });
            }

            const NewPasswd = await HashPassword(password);

            const id = await DataDocentes.AddRegisterDocenteModels(
                nombre,
                apellido,
                celular,
                Email,
                NewPasswd
            )

            const token = generateToken();
           const expiresAt = new Date(Date.now() + 60 * 1000);

            await DataDocentes.RegisterToken(id,token,expiresAt);

            const Datauser = await DataDocentes.GetDataUserEmail(id);

            AuthEmail.sendConfirmationEmail({
                email: Datauser.Email,
                name: Datauser.nombre,
                apellido:Datauser.apellido,
                token: token
            }) 

            res.status(201).json({ 
                message: 'Docente registrado',
                id: id
            })

        } catch (error) {
            console.error("Error al registrar el docente:", error);
            res.status(500).json({ error: "Error al registrar el docente" }); 
        }
    }

    static readonly ConfirmedDocenteControllers = async(req:Request,res:Response)=>{
        try {
            const {id} = req.params
            const {code} = req.body
            const data = await DataDocentes.ConfirmedDocente(id,code)
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al confirmar Docente:", error);
            res.status(500).json({ error: "Error al confirmar Docente" }); 
        }
    }
}