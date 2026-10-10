import express from 'express' 
import morgan from 'morgan'
import cors from 'cors';
import { corsConfig } from "./config/cors";

import UserRoute from "./Routes/UserRoutes";
import AuthRoute from "./Routes/AuthRoutes";

import LaboratorioRoutes from "./Routes/LaboratorioRoutes";
import TipoProdRoutes from "./Routes/TipoProdRoutes";
import PresentaRoutes from "./Routes/PresentaRoutes";
import ClienteRoutes from "./Routes/ClienteRoutes";
import TipoUsRoutes from "./Routes/TipoUsRoutes";
import SucursalRoutes from "./Routes/SucursalRoutes";
import ProveedoRoutes from "./Routes/ProveedoRoutes";
import ProductoRoutes from "./Routes/ProductoRoutes";
import PrincipioActivoRoutes from "./Routes/PrincipioActivoRoutes";

import CompraLoteRoutes from "./Routes/CompraLoteRoutes";
import LoteRoutes from "./Routes/LoteRoutes";

import VentaRoutes from "./Routes/VentaRoutes";
import DashboardRoutes from "./Routes/DashboardRoutes";
import ReporteRoutes from "./Routes/ReporteRoutes";

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

app.use('/api/Laboratorio',LaboratorioRoutes)
app.use('/api/TipoProd',TipoProdRoutes)
app.use('/api/Presentacion',PresentaRoutes);
app.use('/api/Cliente',ClienteRoutes);
app.use('/api/TipoUs',TipoUsRoutes);
app.use('/api/Sucursal',SucursalRoutes);
app.use('/api/Proveedor',ProveedoRoutes);
app.use('/api/Producto',ProductoRoutes);
app.use('/api/PrincipioActivo', PrincipioActivoRoutes);

app.use('/api/Compra', CompraLoteRoutes);
app.use('/api/Lote', LoteRoutes);

app.use('/api/Venta', VentaRoutes);

app.use('/api/Dashboard', DashboardRoutes);
app.use('/api/Reporte', ReporteRoutes);

export default app