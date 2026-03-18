import { Router } from "express";
import { CertificacionControllers } from "../controllers/CertificacionControllers";

const router = Router()

router.get('/Get',
    CertificacionControllers.GetCertificacionall
)

router.post('/AddCert',
    CertificacionControllers.addCertificacion
)

router.delete('/DeleteCert/:id',
    CertificacionControllers.DeleteCertControllers
)

router.put('/UpdateCerti/:id',
    CertificacionControllers.UpdateCertiControllers
)
export default router