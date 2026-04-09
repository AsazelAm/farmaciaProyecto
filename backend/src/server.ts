import express from 'express' 
import morgan from 'morgan'
import cors from 'cors';
import { corsConfig } from "./config/cors";

import UserRoute from "./Routes/UserRoutes";
import AuthRoute from "./Routes/AuthRoutes";

import LaboratorioRoutes from "./Routes/LaboratorioRoutes";
import TipoProdRoutes from "./Routes/TipoProdRoutes";


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



export default app