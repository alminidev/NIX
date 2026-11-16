import type {
  IPasswordFieldErrors,
  IPasswordInput,
  IProfileFieldErrors,
  IProfileInput,
} from "@/types/admin-profile";

export const profileFieldLimits = {
  name: 120,
  email: 254,
  image: 500,
} as const;

/** O mesmo mínimo e máximo da better-auth (minPasswordLength e o padrão de 128). */
export const passwordLimits = {
  min: 8,
  max: 128,
} as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const siteImagePath = /^\/images\/[A-Za-z0-9._/-]+$/;

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

/** URL http(s) ou caminho de imagem do próprio site. */
export function isProfileImage(value: string) {
  if (siteImagePath.test(value)) return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function readProfileForm(formData: FormData): IParsedProfileForm {
  const fieldErrors: IProfileFieldErrors = {};
  const name = readString(formData, "name");
  const email = readString(formData, "email").toLowerCase();
  const imageRaw = readString(formData, "image");

  if (name.length < 2) {
    fieldErrors.name = "Informe o nome.";
  } else if (name.length > profileFieldLimits.name) {
    fieldErrors.name = `O nome pode ter no máximo ${profileFieldLimits.name} caracteres.`;
  }

  if (
    email.length > profileFieldLimits.email ||
    !emailPattern.test(email)
  ) {
    fieldErrors.email = "Informe um e-mail válido.";
  }

  let image: string | null = null;
  if (imageRaw) {
    if (
      imageRaw.length > profileFieldLimits.image ||
      !isProfileImage(imageRaw)
    ) {
      fieldErrors.image =
        "Informe um endereço http(s) ou um caminho do site (/images/...).";
    } else {
      image = imageRaw;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { input: null, fieldErrors };
  }

  return {
    input: { name, email, image },
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
