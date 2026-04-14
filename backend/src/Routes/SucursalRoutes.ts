import { Router } from "express";
import { authenticate } from "../Middleware/auth";
import { SucursalControllers } from "../controllers/SucursalControllers";

const router=Router();
router.use(authenticate);

router.get('/GetSucursal',
    SucursalControllers.GetSucursalC
)


export default router;