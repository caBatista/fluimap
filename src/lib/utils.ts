import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const errorMessages: Record<string, string> = {
  form_password_incorrect: 'Senha incorreta. Tente novamente.',
  form_identifier_exists: 'Esse e-mail já está em uso.',
  form_identifier_not_found: 'Esse e-mail não está cadastrado.',
  form_password_length_too_short: 'A senha deve ter pelo menos 8 caracteres.',
  form_password_length_too_long: 'A senha deve ter no máximo 72 caracteres.',
  form_password_size_in_bytes_exceeded: 'A senha deve ter no máximo 72 caracteres.',
  form_code_incorrect: 'Código incorreto. Tente novamente.',
  default: 'Ocorreu um erro, tente novamente.',
};

export function getErrorMessage(code: string, fallbackMessage?: string): string {
  if (errorMessages[code]) {
    return errorMessages[code];
  }
  return fallbackMessage ?? `${errorMessages.default} (Código: ${code})`;
}
