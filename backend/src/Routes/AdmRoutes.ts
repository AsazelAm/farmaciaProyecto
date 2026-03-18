import { Router } from "express";
import { ADMControllers } from "../controllers/AdmControllers";
import { body } from "express-validator";
import { authenticate } from "../Middleware/auth";


const router = Router()

router.use(authenticate)

router.get('/Modalidad',
    ADMControllers.GetModalidades
)
router.post('/AddMod',
    body('modalidad').isEmpty().withMessage('La modalidad es obligatoria'),
    ADMControllers.AddModalidad
)
router.delete('/DeleteMod/:id',
    ADMControllers.DeleteModalidad
)
router.put('/UpdateMod/:id',
    ADMControllers.UpdateModControllers
)

// administracion

router.get('/GetAreas',
    ADMControllers.GetAreasControllers
)
router.delete('/DeleteAreas/:id',
    ADMControllers.DeleteAreasControllers
)
router.post('/addAreas',
    ADMControllers.addAreaControllers
)
router.post('/addAreas',
    ADMControllers.addAreaControllers
)
router.put('/UpdateAreas/:id',
    ADMControllers.UpdateAreasControllers
)

//modalidad Calenadrio 
router.get('/Modalidad/Calendario',
    ADMControllers.GetModalidadCalendario
)


//empresa

router.get('/Empresa',
    ADMControllers.GetEmpresaControllers
)

router.get('/Country',
    ADMControllers.GetCountryControllers
)
export default router