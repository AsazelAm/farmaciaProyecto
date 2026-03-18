"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDateToday = void 0;
const GetDateToday = () => {
    const currentDate = new Date();
    // Extraer componentes de la fecha
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Mes 0-11, por eso sumamos 1
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    // Retornar la fecha y hora en el formato deseado 'YYYY-MM-DD HH-mm-ss'
    return `${year}-${month}-${day}${hours}-${minutes}-${seconds}`;
};
exports.GetDateToday = GetDateToday;
//# sourceMappingURL=Time.js.map