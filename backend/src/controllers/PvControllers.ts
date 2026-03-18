import { Request, Response } from "express";
import DataPv from "../Models/PvModels";
import { uploadImageGlobal } from "../Middleware/SaveImg";
import { GetDateToday } from "../lib/Time";


export class PvControllers {
    static readonly  GetAllPvControllers = async(req:Request,res:Response)=>{
        try {
            const data = await DataPv.PvAll();
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al obtener propuestas  de valor:", error);
            res.status(500).json({ error: "Error al obtener propuestas  de valor:" });
        }
    }

    static readonly AddPv = async(req: Request, res: Response) => {
        try {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const array1Data = JSON.parse(req.body.array1);
            const { nombre, identificador } = array1Data[0];

            // Extraemos los archivos
            const LogoFile = files['logo'] ? files['logo'][0] : null;
            const BannerFile = files['imgbanner'] ? files['imgbanner'][0] : null;
            const CuadroFile = files['imgCuadro'] ? files['imgCuadro'][0] : null;
            const ModalFile = files['imglogoModal'] ? files['imglogoModal'][0] : null;

            const now = GetDateToday();
            
            // Variables para guardar las rutas (Strings)
            let logoPath: string | null = null;
            let bannerPath: string | null = null;
            let modalPath: string | null = null;
            let cuadroPath: string | null = null;

            if (LogoFile) {
                logoPath = await uploadImageGlobal(LogoFile, identificador, now, 'logo');
            }
            if (BannerFile) {
                bannerPath = await uploadImageGlobal(BannerFile, identificador, now, 'imgbanner');
            }
            if (ModalFile) {
                modalPath = await uploadImageGlobal(ModalFile, identificador, now, 'imglogoModal');
            }
            if (CuadroFile) {
                cuadroPath = await uploadImageGlobal(CuadroFile, identificador, now, 'imgCuadro');
            }
            await DataPv.AddPv(nombre, identificador, logoPath, bannerPath, modalPath, cuadroPath);

            res.status(200).json('Propuesta de valor creada correctamente');

        } catch (error) {
            console.error("Error al agregar propuestas de valor:", error);
            res.status(500).json({ error: "Error al agregar propuestas de valor" });
        }
    }

    static readonly deletePv = async (req:Request,res:Response)=>{
        try {
            const {id} = req.params
            const data = await DataPv.DeletePv(id);
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al eliminar propuesta de valor:", error);
            res.status(500).json({ error: "Error al eliminar propuesta de valor:" });
        }
    }

    static readonly UpdatePvControllers = async(req:Request,res:Response)=>{
        try {
            const {id} = req.params;
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            
            const array1Data = JSON.parse(req.body.array1);
            const {nombre, identificador} = array1Data[0];
            
            const LogoFile = files['logo']?.[0] || null;
            const BannerFile = files['imgbanner']?.[0] || null;
            const CuadroFile = files['imgCuadro']?.[0] || null;
            const ModalFile = files['imglogoModal']?.[0] || null;
            
            await DataPv.UpdatePvModels(nombre, identificador, id);
            const now = GetDateToday();

            if(LogoFile){
                const ruta = await uploadImageGlobal(LogoFile, identificador, now, 'logo')
                await DataPv.UpdateImgAddpv(ruta, id);
            }
            if(BannerFile){
                const ruta = await uploadImageGlobal(BannerFile, identificador, now, 'imgbanner')
                await DataPv.UpdatebannerAddpv(ruta, id)
            }
            if(ModalFile){
                const ruta = await uploadImageGlobal(ModalFile, identificador, now, 'imglogoModal')
                await DataPv.UpdatemodalAddpv(ruta, id)
            }
            if(CuadroFile){
                const ruta = await uploadImageGlobal(CuadroFile, identificador, now, 'imgCuadro')
                await DataPv.UpdateCuadroAddpv(ruta, id)
            }
            
            res.status(200).json('Propuesta de valor actualizada correctamente')
        } catch (error) {
            console.error("Error al actualizar propuesta de valor:", error);
            res.status(500).json({ error: "Error al actualizar propuesta de valor:" });
        }
    }

     static readonly  GetPvCalendario = async(req:Request,res:Response)=>{
        try {
            const data = await DataPv.PvCalendario();
            res.status(200).json(data)
        } catch (error) {
            console.error("Error al obtener propuestas  de valor:", error);
            res.status(500).json({ error: "Error al obtener propuestas  de valor:" });
        }
    }

    static readonly UpdatePvEstaController=async(req:Request,res:Response)=>{
        try{
            const {id}=req.params;
            const{Status}=req.body;
            const data=await DataPv.UpdatePvEstaModels(Status,id);
            res.status(200).json(data);
        }catch(error){
            console.log("Erro actualizar Status,",error);
            res.status(500).json({error:"Erro actualizar Status de PV"});
        }
    }

}