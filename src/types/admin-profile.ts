/**
 * Contrato da tela Meu perfil.
 * A página lê nome e e-mail da sessão; as actions não recebem id de usuário.
 */

export interface IAdminProfile {
  name: string;
  email: string;
}

export interface IProfileFieldErrors {
  name?: string;
  email?: string;
  currentPassword?: string;
}

export interface IProfileFormState {
  status: "idle" | "error";
  message: string;
  fieldErrors: IProfileFieldErrors;
}

export const profileFormInitialState: IProfileFormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

export interface IProfileInput {
  name: string;
  email: string;
  /** Presente só quando o e-mail enviado é diferente do atual. */
  currentPassword: string | null;
}

export interface IPasswordFieldErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface IPasswordFormState {
  status: "idle" | "error";
  message: string;
  fieldErrors: IPasswordFieldErrors;
}

export const passwordFormInitialState: IPasswordFormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

export interface IPasswordInput {
  currentPassword: string;
  newPassword: string;
}

export type TProfileNotice = "profile" | "password";
