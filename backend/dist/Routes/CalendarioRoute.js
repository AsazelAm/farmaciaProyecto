"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../Middleware/auth");
const CalendarioControllers_1 = require("../controllers/CalendarioControllers");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/ViewAreas/:id', CalendarioControllers_1.CalendarioControllers.GetViewAreas);
router.get('/ViewPro/:id', CalendarioControllers_1.CalendarioControllers.GetViewPro);
router.put('/PutCalendar', CalendarioControllers_1.CalendarioControllers.UpCalendarControllers);
router.get('/ByCalendario/:id', CalendarioControllers_1.CalendarioControllers.GetCalendarioBy);
exports.default = router;
//# sourceMappingURL=CalendarioRoute.js.map