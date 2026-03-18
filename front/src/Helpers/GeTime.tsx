export const obtenerFechaHoy = (): string => {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, "0");
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const anio = hoy.getFullYear();
    
    return `${anio}-${mes}-${dia}`;
  };

export  const calculateTimeDifference = (start: string, end: string) => {
    if (!start || !end) return "";

    const [startHours, startMinutes] = start.split(":").map(Number);
    const [endHours, endMinutes] = end.split(":").map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    if (endTotalMinutes < startTotalMinutes) return "Hora inválida";

    const diffMinutes = endTotalMinutes - startTotalMinutes;
    const diffHours = Math.floor(diffMinutes / 60);
    const diffMins = diffMinutes % 60;

    return `${diffHours.toString().padStart(2, "0")}:${diffMins.toString().padStart(2, "0")}`;
  };
  