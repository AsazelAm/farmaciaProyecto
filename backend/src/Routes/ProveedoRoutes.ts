import { Router } from "express";
import { authenticate } from "../Middleware/auth";
import { ProveedorControllers } from "../controllers/ProveControllers";

const router = Router();
router.use(authenticate);

router.get('/GetProveedor',
    ProveedorControllers.GetProveedorC
)

router.post('/AddProveedor',
    ProveedorControllers.AddProveedorC
)

router.put('/UpdateProveedor/:idProveedor',
    ProveedorControllers.UpdateProveedorC
)

router.delete('/DeleteProveedor/:idProveedor',
    ProveedorControllers.DeleteProveedorC
)

export default router;