import { Router } from "express";   
import { authenticate } from "../Middleware/auth";
import { ClienteControllers } from "../controllers/ClienteControllers";

const router=Router();
router.use(authenticate);

router.get('/GetCliente',
    ClienteControllers.GetClienteC
)

router.post('/AddCliente',
    ClienteControllers.AddClienteC
)

router.put('/UpdateCliente/:idCliente',
    ClienteControllers.UpdateClienteC
)

router.delete('/DeleteCliente/:idCliente',
    ClienteControllers.DeleteClienteC
)

export default router;