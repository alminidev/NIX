"use server";

import { auth } from "@/lib/auth";
import { readPasswordForm, readProfileForm } from "@/lib/profile-input";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type {
  IPasswordFormState,
  IProfileFormState,
} from "@/types/admin-profile";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const deniedProfile: IProfileFormState = {
  status: "error",
  message: "Acesso negado.",
  fieldErrors: {},
};

const deniedPassword: IPasswordFormState = {
  status: "error",
  message: "Acesso negado.",
  fieldErrors: {},
};

const reviewProfile: IProfileFormState = {
  status: "error",
  message: "Revise os campos destacados.",
  fieldErrors: {},
};

const reviewPassword: IPasswordFormState = {
  status: "error",
  message: "Revise os campos destacados.",
  fieldErrors: {},
};

async function requireAdmin() {
  const session = await getSession();
  if (session?.user.role !== "admin") return null;
  return session;
}

function authCode(error: unknown) {
  if (typeof error !== "object" || error === null || !("body" in error)) {
    return null;
  }

  const body = error.body;
  if (typeof body !== "object" || body === null || !("code" in body)) {
    return null;
  }

  return typeof body.code === "string" ? body.code : null;
}

function prismaCode(error: unknown) {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = error.code;
    return typeof code === "string" ? code : null;
  }
  return null;
}

/** Confere a senha atual pela better-auth, sem comparar o hash aqui. */
async function confirmCurrentPassword(
  currentPassword: string | null,
): Promise<IProfileFormState | null> {
  if (!currentPassword) {
    return {
      ...reviewProfile,
      fieldErrors: { currentPassword: "Informe a senha atual." },
    };
  }

  try {
    const verified = await auth.api.verifyPassword({
      body: { password: currentPassword },
      headers: await headers(),
    });

    if (!verified.status) {
      return {
        ...reviewProfile,
        fieldErrors: { currentPassword: "A senha atual está incorreta." },
      };
    }

    return null;
  } catch (error) {
    const code = authCode(error);

    if (code === "INVALID_PASSWORD") {
      return {
        ...reviewProfile,
        fieldErrors: { currentPassword: "A senha atual está incorreta." },
      };
    }

    if (code === "UNAUTHORIZED") {
      return {
        status: "error",
        message: "Sua sessão expirou. Entre novamente.",
        fieldErrors: {},
      };
    }

    return {
      status: "error",
      message: "Não foi possível salvar o perfil.",
      fieldErrors: {},
    };
  }
}

export async function saveProfile(
  _previous: IProfileFormState,
  formData: FormData,
): Promise<IProfileFormState> {
  const session = await requireAdmin();
  if (!session) return deniedProfile;

  const parsed = readProfileForm(formData, session.user.email);
  if (!parsed.input) {
    return { ...reviewProfile, fieldErrors: parsed.fieldErrors };
  }

  const input = parsed.input;
  const emailChanged =
    input.email !== session.user.email.trim().toLowerCase();

  if (emailChanged) {
    const passwordError = await confirmCurrentPassword(input.currentPassword);
    if (passwordError) return passwordError;
  }

  try {
    if (emailChanged) {
      const owner = await prisma.user.findUnique({
        where: { email: input.email },
        select: { id: true },
      });

      if (owner && owner.id !== session.user.id) {
        return {
          ...reviewProfile,
          fieldErrors: { email: "Já existe uma conta com este e-mail." },
        };
      }
    }

    await auth.api.updateUser({
      body: {
        name: input.name,
      },
      headers: await headers(),
    });

    // changeEmail da better-auth só conclui com e-mail de verificação, que
    // este projeto não envia. O e-mail muda só na conta da sessão atual.
    if (emailChanged) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { email: input.email },
        select: { id: true },
      });
    }
  } catch (error) {
    const code = prismaCode(error) ?? authCode(error);

    if (code === "P2002") {
      return {
        ...reviewProfile,
        fieldErrors: { email: "Já existe uma conta com este e-mail." },
      };
    }

    if (code === "UNAUTHORIZED") {
      return {
        status: "error",
        message: "Sua sessão expirou. Entre novamente.",
        fieldErrors: {},
      };
    }

    return {
      status: "error",
      message: "Não foi possível salvar o perfil.",
      fieldErrors: {},
    };
  }

  redirect("/admin/profile?notice=profile");
}

export async function changeOwnPassword(
  _previous: IPasswordFormState,
  formData: FormData,
): Promise<IPasswordFormState> {
  const session = await requireAdmin();
  if (!session) return deniedPassword;

  const parsed = readPasswordForm(formData);
  if (!parsed.input) {
    return { ...reviewPassword, fieldErrors: parsed.fieldErrors };
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: parsed.input.currentPassword,
        newPassword: parsed.input.newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });
  } catch (error) {
    const code = authCode(error);

    if (code === "INVALID_PASSWORD") {
      return {
        ...reviewPassword,
        fieldErrors: { currentPassword: "A senha atual está incorreta." },
      };
    }

    if (code === "PASSWORD_TOO_SHORT") {
      return {
        ...reviewPassword,
        fieldErrors: {
          newPassword: "A nova senha precisa ter pelo menos 8 caracteres.",
        },
      };
    }

    if (code === "PASSWORD_TOO_LONG") {
      return {
        ...reviewPassword,
        fieldErrors: {
          newPassword: "A nova senha pode ter no máximo 128 caracteres.",
        },
      };
    }

    if (code === "UNAUTHORIZED") {
      return {
        status: "error",
        message: "Sua sessão expirou. Entre novamente.",
        fieldErrors: {},
      };
    }

    return {
      status: "error",
      message: "Não foi possível trocar a senha.",
      fieldErrors: {},
    };
  }

  redirect("/admin/profile?notice=password");
}
