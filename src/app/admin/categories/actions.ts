"use server";

import { prisma } from "@/lib/prisma";
import { readCategoryForm } from "@/lib/category-input";
import { getSession } from "@/lib/session";
import type { ICategoryFormState } from "@/types/admin-category";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

const deniedForm: ICategoryFormState = {
  status: "error",
  message: "Acesso negado.",
  fieldErrors: {},
};

async function assertAdmin() {
  const session = await getSession();
  return session?.user.role === "admin";
}

function prismaCode(error: unknown) {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = error.code;
    return typeof code === "string" ? code : null;
  }
  return null;
}

export async function saveCategory(
  _previous: ICategoryFormState,
  formData: FormData,
): Promise<ICategoryFormState> {
  if (!(await assertAdmin())) return deniedForm;

  const parsed = readCategoryForm(formData);
  if (parsed.id !== null && !Number.isInteger(parsed.id)) {
    return {
      status: "error",
      message: "Categoria inválida.",
      fieldErrors: {},
    };
  }

  if (!parsed.input) {
    return {
      status: "error",
      message: "Revise os campos destacados.",
      fieldErrors: parsed.fieldErrors,
    };
  }

  const input = parsed.input;
  const slugOwner = await prisma.category.findUnique({
    where: { slug: input.slug },
    select: { id: true },
  });

  if (slugOwner && slugOwner.id !== parsed.id) {
    return {
      status: "error",
      message: "Revise os campos destacados.",
      fieldErrors: { slug: "Já existe uma categoria com este identificador." },
    };
  }

  const data = {
    name: input.name,
    slug: input.slug,
    sortOrder: input.sortOrder,
  };

  try {
    if (parsed.id) {
      await prisma.category.update({ where: { id: parsed.id }, data });
    } else {
      await prisma.category.create({ data });
    }
  } catch (error) {
    const code = prismaCode(error);
    if (code === "P2002") {
      return {
        status: "error",
        message: "Revise os campos destacados.",
        fieldErrors: { slug: "Já existe uma categoria com este identificador." },
      };
    }
    if (code === "P2025") {
      return {
        status: "error",
        message: "Esta categoria não existe mais.",
        fieldErrors: {},
      };
    }
    throw error;
  }

  updateTag("products");
  redirect(
    parsed.id ? "/admin/categories?notice=updated" : "/admin/categories?notice=created",
  );
}
