import { Router } from "express";
import { PvControllers } from "../controllers/PvControllers";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router()

router.get('/Getall',
    PvControllers.GetAllPvControllers
)

router.post('/AddPv',
     upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'imgbanner', maxCount: 1 },
    { name: 'imgCuadro', maxCount: 1 },
    { name: 'imglogoModal', maxCount: 1 },
  ]),
  PvControllers.AddPv
)

router.delete('/DeletePv/:id',
  PvControllers.deletePv
)

router.get('/PvCalendario',
  PvControllers.GetPvCalendario
)

router.put('/UpdatePv/:id',
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'imgbanner', maxCount: 1 },
    { name: 'imgCuadro', maxCount: 1 },
    { name: 'imglogoModal', maxCount: 1 },
  ]),
  PvControllers.UpdatePvControllers
)
router.put('/UpdateStatus/:id',
  PvControllers.UpdatePvEstaController
)


export default router