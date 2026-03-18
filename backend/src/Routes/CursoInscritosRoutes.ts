import { Router } from "express";
import { authenticate } from "../Middleware/auth";
import { CursoInscritosDocControllers } from "../controllers/CursoInscritosDocControllers";

const router =Router()

router.use(authenticate)

router.get('/DocenteCurs/:id',
    CursoInscritosDocControllers.GetAllCursoDocControllers
)

router.get('/AlumnAsis/:id_cal',
    CursoInscritosDocControllers.GetAlumAsisControllers
)

router.post('/AddAsisAlum',
    CursoInscritosDocControllers.AddAsistenAlumControllers
)

router.put('/UpdateAsisAlum/:id',
    CursoInscritosDocControllers.UpdateAsisControllers
)

router.put('/UpdateFecha',
    CursoInscritosDocControllers.UpdateFechaControllers
)

router.get('/GetNotas/:id_user/:id_calendario',
    CursoInscritosDocControllers.GetNotaAluController
)
 
router.post('/AddNotas',
    CursoInscritosDocControllers.AddNotaAluController
)

router.put('/UpdateNota/:id_nota',
    CursoInscritosDocControllers.UpdateNotaAluController
)

export default router;