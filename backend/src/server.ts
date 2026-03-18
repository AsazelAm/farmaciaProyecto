import express from 'express' 
import morgan from 'morgan'
import cors from 'cors';
import { corsConfig } from "./config/cors";

import UserRoute from "./Routes/UserRoutes";
import AuthRoute from "./Routes/AuthRoutes";
import AdmRoute from "./Routes/AdmRoutes";
import DocenteRoute from "./Routes/DocenteRoute";
import HabilidadRoute from "./Routes/HabilidadesRoute";
import PvRoute from "./Routes/PvRoute";
import CertiRoute from "./Routes/CertificacionRoute";
import CursoRoute from "./Routes/CursoRoute";
import ExamenRoute from "./Routes/ExamenRoute";
import BlogRoute from "./Routes/BlogRoute"; //se creaa, no sabia
import CalendarioRoute from "./Routes/CalendarioRoute";
import CursosMoodleRoutes from "./Routes/CursosMoodleRoutes"
import AlumnosMoodleRoutes from "./Routes/AlumnoMoodleRoutes";

import CursoInscritosRoutes from "./Routes/CursoInscritosRoutes";

import path from "path";

const app = express()

app.use(morgan('dev'))

app.use(express.json())
app.use(express.json())
app.use(cors(corsConfig))
app.use(cors())
const backendDir = path.dirname(__dirname);
const uploadsPath = path.join(backendDir, "uploads");
app.use("/Uploads", express.static(uploadsPath));

app.use('/api/Auth', AuthRoute)
app.use('/api/user', UserRoute)
app.use('/api/Administracion', AdmRoute)
app.use('/api/Docente', DocenteRoute)
app.use('/api/Habilidad',HabilidadRoute)
app.use('/api/Pv',PvRoute)
app.use('/api/Certificacion', CertiRoute)
app.use('/api/Curso',CursoRoute)
app.use('/api/Examen', ExamenRoute)
app.use('/api/Blog',BlogRoute)
app.use('/api/Calendario',CalendarioRoute)
app.use('/api/CursoDocente',CursoInscritosRoutes)
app.use('/api/CursosMoodle',CursosMoodleRoutes)
app.use('/api/AlumnosMoodle',AlumnosMoodleRoutes);

export default app