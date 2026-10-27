"use server";

import { prisma } from "@/lib/prisma";
import { readProductForm } from "@/lib/product-input";
import { getSession } from "@/lib/session";
import type {
  IDeleteProductState,
  IProductFormState,
} from "@/types/admin-product";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

const deniedForm: IProductFormState = {
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

export async function saveProduct(
  _previous: IProductFormState,
  formData: FormData,
): Promise<IProductFormState> {
  if (!(await assertAdmin())) return deniedForm;

  const parsed = readProductForm(formData);
  if (parsed.id !== null && !Number.isInteger(parsed.id)) {
    return {
      status: "error",
      message: "Produto inválido.",
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
  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
    select: { id: true },
  });

  if (!category) {
    return {
      status: "error",
      message: "Revise os campos destacados.",
      fieldErrors: { categoryId: "Selecione uma categoria válida." },
    };
  }

  const skuOwner = await prisma.product.findUnique({
    where: { sku: input.sku },
    select: { id: true },
  });

  if (skuOwner && skuOwner.id !== parsed.id) {
    return {
      status: "error",
      message: "Revise os campos destacados.",
      fieldErrors: { sku: "Já existe um produto com este SKU." },
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const data = {
        sku: input.sku,
        name: input.name,
        capacity: input.capacity,
        width: input.dimensions.width,
        height: input.dimensions.height,
        depth: input.dimensions.depth,
        price: input.price,
        installments: input.installments,
        description: input.description,
        featured: input.featured,
        active: input.active,
        sortOrder: input.sortOrder,
        categoryId: input.categoryId,
      };

      const saved = parsed.id
        ? await tx.product.update({ where: { id: parsed.id }, data })
        : await tx.product.create({ data });

      await tx.specification.deleteMany({ where: { productId: saved.id } });
      await tx.productImage.deleteMany({ where: { productId: saved.id } });

      if (input.specifications.length > 0) {
        await tx.specification.createMany({
          data: input.specifications.map((text, sortOrder) => ({
            text,
            sortOrder,
            productId: saved.id,
          })),
        });
      }

      await tx.productImage.createMany({
        data: input.images.map((image, sortOrder) => ({
          url: image.url,
          sortOrder,
          isPrimary: image.isPrimary,
          productId: saved.id,
        })),
      });
    });
  } catch (error) {
    const code = prismaCode(error);
    if (code === "P2002") {
      return {
        status: "error",
        message: "Revise os campos destacados.",
        fieldErrors: { sku: "Já existe um produto com este SKU." },
      };
    }
    if (code === "P2025") {
      return {
        status: "error",
        message: "Este produto não existe mais.",
        fieldErrors: {},
      };
    }
    throw error;
  }

  updateTag("products");
  redirect("/admin/products");
}

export async function deleteProduct(
  _previous: IDeleteProductState,
  formData: FormData,
): Promise<IDeleteProductState> {
  if (!(await assertAdmin())) {
    return { status: "error", message: "Acesso negado." };
  }

  const raw = formData.get("id");
  const id = typeof raw === "string" ? Number(raw) : Number.NaN;
  if (!Number.isInteger(id) || id <= 0) {
    return { status: "error", message: "Produto inválido." };
  }

  try {
    await prisma.product.delete({ where: { id } });
  } catch (error) {
    if (prismaCode(error) === "P2025") {
      return { status: "error", message: "Este produto não existe mais." };
    }
    if (prismaCode(error) === "P2003") {
      return {
        status: "error",
        message:
          "Este produto tem pedidos e não pode ser excluído. Desative-o para tirá-lo da vitrine.",
      };
    }
    throw error;
  }

  updateTag("products");
  redirect("/admin/products");
}
