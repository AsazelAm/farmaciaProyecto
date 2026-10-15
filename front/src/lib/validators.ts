import type { KeyboardEvent, ClipboardEvent } from "react";

// ════════════════════════════════════════════════════════════════════════════
// VALIDADORES CENTRALIZADOS (letras / números / longitudes) PARA react-hook-form
// Uso:
//   <input {...register("nombre", soloLetras("Nombre", { required: true }))} {...tecladoSoloLetras} />
// ════════════════════════════════════════════════════════════════════════════

// ── Patrones ──────────────────────────────────────────────────────────────────
export const RX = {
  // Letras (con acentos/Ñ), espacios y . ' - (para nombres, razón social, etc.)
  letras:      /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.'-]+$/,
  digitos:     /^\d+$/,
  telefono:    /^[0-9+\-\s()]{6,20}$/,
  email:       /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  alfanum:     /^[A-Za-z0-9\-_/ ]+$/,
} as const;

// Reemplazos globales (para sanear valores de inputs controlados)
export const limpiarLetras   = (v: string) => v.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.'-]/g, "");
export const limpiarDigitos  = (v: string) => v.replace(/\D/g, "");
export const limpiarAlfanum  = (v: string) => v.replace(/[^A-Za-z0-9\-_/ ]/g, "");

// ── Bloqueo de teclado (no permitir escribir caracteres inválidos) ────────────
const soloPermite = (permitido: RegExp) => (e: KeyboardEvent<HTMLInputElement>) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return; // permite atajos (copiar/pegar/deshacer)
  if (e.key.length > 1) return;                   // teclas especiales (Backspace, Tab, flechas...)
  if (!permitido.test(e.key)) e.preventDefault();
};

const bloqueaPegado = (invalido: RegExp) => (e: ClipboardEvent<HTMLInputElement>) => {
  if (invalido.test(e.clipboardData.getData("text"))) e.preventDefault();
};

// Props listas para esparcir en el <input> (junto a register)
export const tecladoSoloLetras = {
  onKeyDown: soloPermite(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.'-]/),
  onPaste:   bloqueaPegado(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.'-]/),
};

export const tecladoSoloDigitos = {
  onKeyDown: soloPermite(/\d/),
  onPaste:   bloqueaPegado(/\D/),
};

export const tecladoAlfanumerico = {
  onKeyDown: soloPermite(/[A-Za-z0-9\-_/ ]/),
  onPaste:   bloqueaPegado(/[^A-Za-z0-9\-_/ ]/),
};

export const tecladoTelefono = {
  onKeyDown: soloPermite(/[0-9+\-\s()]/),
  onPaste:   bloqueaPegado(/[^0-9+\-\s()]/),
};

// ── Generadores de reglas para register() ────────────────────────────────────
type ReglaRequired = boolean | string;
interface OpcLetras { required?: ReglaRequired; min?: number; max?: number; }
interface OpcNum    { required?: ReglaRequired; min?: number; max?: number; }

const req = (label: string, required?: ReglaRequired) =>
  required === undefined ? {} : { required: required === true ? `${label} es obligatorio` : required };

/** Campos que SOLO admiten letras (nombres, razón social, contacto, etc.). */
export const soloLetras = (label: string, { required, min = 2, max = 100 }: OpcLetras = {}) => ({
  ...req(label, required),
  minLength: { value: min, message: `${label}: mínimo ${min} caracteres` },
  maxLength: { value: max, message: `${label}: máximo ${max} caracteres` },
  pattern:   { value: RX.letras, message: `${label}: solo se permiten letras` },
});

/** Campos que SOLO admiten dígitos con longitud fija (CI, NIT, código de barras). */
export const soloDigitos = (label: string, { required, min = 1, max = 15 }: OpcLetras = {}) => ({
  ...req(label, required),
  maxLength: { value: max, message: `${label}: máximo ${max} dígitos` },
  pattern:   { value: new RegExp(`^\\d{${min},${max}}$`), message: `${label}: debe tener entre ${min} y ${max} dígitos` },
});

/** Campos alfanuméricos (códigos, números de lote, factura). */
export const alfanumerico = (label: string, { required, min = 2, max = 30 }: OpcLetras = {}) => ({
  ...req(label, required),
  minLength: { value: min, message: `${label}: mínimo ${min} caracteres` },
  maxLength: { value: max, message: `${label}: máximo ${max} caracteres` },
  pattern:   { value: RX.alfanum, message: `${label}: solo letras, números, guion y guion bajo` },
});

/** Campos numéricos (input type="number"): rango mínimo/máximo. */
export const numero = (label: string, { required, min, max }: OpcNum = {}) => ({
  ...req(label, required),
  ...(min !== undefined ? { min: { value: min, message: `${label}: el mínimo es ${min}` } } : {}),
  ...(max !== undefined ? { max: { value: max, message: `${label}: el máximo es ${max}` } } : {}),
});

/** Teléfono (dígitos y símbolos + - ( ) y espacios). */
export const telefono = (label = "Teléfono", { required }: OpcLetras = {}) => ({
  ...req(label, required),
  maxLength: { value: 20, message: `${label}: máximo 20 caracteres` },
  pattern:   { value: RX.telefono, message: `${label}: número inválido (6 a 20 dígitos)` },
});

/** Email. */
export const email = (label = "Email", { required }: OpcLetras = {}) => ({
  ...req(label, required),
  maxLength: { value: 100, message: `${label}: máximo 100 caracteres` },
  pattern:   { value: RX.email, message: `${label}: formato inválido` },
});

/** Texto libre (descripciones, direcciones, observaciones): solo limita longitud. */
export const textoLibre = (label: string, { required, max = 500 }: OpcLetras = {}) => ({
  ...req(label, required),
  maxLength: { value: max, message: `${label}: máximo ${max} caracteres` },
});
