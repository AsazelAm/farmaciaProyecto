import { Router } from "express";
import { PvControllers } from "../controllers/PvControllers";
import { authenticate } from "../Middleware/auth";
import { CalendarioControllers } from "../controllers/CalendarioControllers";

const router = Router()

router.get('/calendario-slider', CalendarioControllers.CalendarioSlider);
router.use(authenticate)

router.get('/ViewAreas/:id',
  CalendarioControllers.GetViewAreas
)

router.get('/ViewPro/:id',
  CalendarioControllers.GetViewPro
)
router.put('/PutCalendar',
  CalendarioControllers.UpCalendarControllers
)
router.get('/ByCalendario/:id',
  CalendarioControllers.GetCalendarioBy
)

export default router