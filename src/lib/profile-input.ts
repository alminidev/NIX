import type {
  IPasswordFieldErrors,
  IPasswordInput,
  IProfileFieldErrors,
  IProfileInput,
} from "@/types/admin-profile";

export const profileFieldLimits = {
  name: 120,
  email: 254,
} as const;

/** O mesmo mínimo e máximo da better-auth (minPasswordLength e o padrão de 128). */
export const passwordLimits = {
  min: 8,
  max: 128,
} as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IParsedProfileForm {
  input: IProfileInput | null;
  fieldErrors: IProfileFieldErrors;
}

export interface IParsedPasswordForm {
  input: IPasswordInput | null;
  fieldErrors: IPasswordFieldErrors;
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readSecret(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function sameEmail(left: string, right: string) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

export function readProfileForm(
  formData: FormData,
  currentEmail: string,
): IParsedProfileForm {
  const fieldErrors: IProfileFieldErrors = {};
  const name = readString(formData, "name");
  const email = readString(formData, "email").toLowerCase();
  const emailChanged = !sameEmail(email, currentEmail);
  const currentPassword = readSecret(formData, "currentPassword");

  if (name.length < 2) {
    fieldErrors.name = "Informe o nome.";
  } else if (name.length > profileFieldLimits.name) {
    fieldErrors.name = `O nome pode ter no máximo ${profileFieldLimits.name} caracteres.`;
  }

  if (email.length > profileFieldLimits.email || !emailPattern.test(email)) {
    fieldErrors.email = "Informe um e-mail válido.";
  }

  if (emailChanged) {
    if (!currentPassword) {
      fieldErrors.currentPassword = "Informe a senha atual.";
    } else if (currentPassword.length > passwordLimits.max) {
      fieldErrors.currentPassword = `A senha atual pode ter no máximo ${passwordLimits.max} caracteres.`;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { input: null, fieldErrors };
  }

  return {
    input: {
      name,
      email,
      currentPassword: emailChanged ? currentPassword : null,
    },
    fieldErrors,
  };
}

export function readPasswordForm(formData: FormData): IParsedPasswordForm {
  const fieldErrors: IPasswordFieldErrors = {};
  const currentPassword = readSecret(formData, "currentPassword");
  const newPassword = readSecret(formData, "newPassword");
  const confirmPassword = readSecret(formData, "confirmPassword");

  if (!currentPassword) {
    fieldErrors.currentPassword = "Informe a senha atual.";
  } else if (currentPassword.length > passwordLimits.max) {
    fieldErrors.currentPassword = `A senha atual pode ter no máximo ${passwordLimits.max} caracteres.`;
  }

  if (newPassword.length < passwordLimits.min) {
    fieldErrors.newPassword = `A nova senha precisa ter pelo menos ${passwordLimits.min} caracteres.`;
  } else if (newPassword.length > passwordLimits.max) {
    fieldErrors.newPassword = `A nova senha pode ter no máximo ${passwordLimits.max} caracteres.`;
  } else if (currentPassword && newPassword === currentPassword) {
    fieldErrors.newPassword = "A nova senha precisa ser diferente da atual.";
  }

  if (newPassword !== confirmPassword) {
    fieldErrors.confirmPassword = "A confirmação não confere com a nova senha.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { input: null, fieldErrors };
  }

  return {
    input: { currentPassword, newPassword },
    fieldErrors,
  };
}
