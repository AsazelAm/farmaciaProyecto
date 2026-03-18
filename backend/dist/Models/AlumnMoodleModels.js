"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MoodleDb_1 = __importDefault(require("../config/MoodleDb"));
const DataAlumnoMoodle = {
    async GetAlumnoMoodle() {
        const Conexion = await MoodleDb_1.default.getConnection();
        const Results = await Conexion.query(`
          select distinct c.id as courseid, c.fullname, u.username as username, u.id as userid, u.firstname as nombre, u.lastname as apellido, u.email as mail, u.phone1 
                from mdl_user u 
                join mdl_user_enrolments ue on ue.userid = u.id 
                join mdl_enrol e on e.id = ue.enrolid 
                join mdl_role_assignments ra on ra.userid = u.id 
                join mdl_context ct on ct.id = ra.contextid and ct.contextlevel = 50 
                join mdl_course c on c.id = ct.instanceid and e.courseid = c.id 
                join mdl_role r on r.id = ra.roleid and r.id = 5 
                where e.status = 0 and u.suspended = 0 and u.deleted = 0 and (ue.timeend = 0 or ue.timeend > now()) and ue.status = 0    
     `);
        Conexion.release();
        return Results;
    }
};
exports.default = DataAlumnoMoodle;
//# sourceMappingURL=AlumnMoodleModels.js.map