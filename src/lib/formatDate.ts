import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function formatDateTime(dateInput: string | Date | null | undefined) {
  if (!dateInput) return "";

  // Si ya es Date, úsalo directamente
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  // Validar que sea fecha válida
  if (isNaN(date.getTime())) {
    console.warn("Fecha inválida recibida en formatDateTime:", dateInput);
    return "";
  }

  return format(date, "dd/MM/yyyy HH:mm", { locale: es });
}
