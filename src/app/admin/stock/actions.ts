"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { IAdjustStockState } from "@/types/admin-stock";
import { refresh } from "next/cache";

const denied: IAdjustStockState = {
  status: "error",
  message: "Acesso negado.",
};

const maxStock = 999_999;
const maxAdjustment = 9_999;

async function assertAdmin() {
  const session = await getSession();
  return session?.user.role === "admin";
}

function readId(formData: FormData) {
  const raw = formData.get("id");
  if (typeof raw !== "string" || !/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function readQuantity(formData: FormData) {
  const raw = formData.get("quantity");
  if (typeof raw !== "string" || !/^\d+$/.test(raw)) return null;
  const quantity = Number(raw);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > maxAdjustment) {
    return null;
  }
  return quantity;
}

function readDirection(formData: FormData) {
  const raw = formData.get("direction");
  if (raw === "in" || raw === "out") return raw;
  return null;
}

export async function adjustStock(
  _previous: IAdjustStockState,
  formData: FormData,
): Promise<IAdjustStockState> {
  if (!(await assertAdmin())) return denied;

  const id = readId(formData);
  const quantity = readQuantity(formData);
  const direction = readDirection(formData);

  if (!id || !direction) {
    return { status: "error", message: "Não foi possível ajustar este produto." };
  }

  if (!quantity) {
    return {
      status: "error",
      message: `Informe uma quantidade de 1 a ${maxAdjustment.toLocaleString("pt-BR")}.`,
    };
  }

  const where =
    direction === "out"
      ? { id, stock: { gte: quantity } }
      : { id, stock: { lte: maxStock - quantity } };

  const changed = await prisma.product.updateMany({
    where,
    data: {
      stock:
        direction === "in" ? { increment: quantity } : { decrement: quantity },
    },
  });

  if (changed.count === 0) {
    const current = await prisma.product.findUnique({
      where: { id },
      select: { stock: true },
    });

    if (!current) {
      return { status: "error", message: "Este produto não existe mais." };
    }

    if (direction === "out") {
      return {
        status: "error",
        message: `O estoque atual é ${current.stock.toLocaleString("pt-BR")}. Não dá para retirar ${quantity.toLocaleString("pt-BR")}.`,
      };
    }

    return {
      status: "error",
      message: `O estoque não pode passar de ${maxStock.toLocaleString("pt-BR")} unidades.`,
    };
  }

  const updated = await prisma.product.findUnique({
    where: { id },
    select: { stock: true },
  });

  refresh();

  const stock = updated?.stock ?? 0;
  const units = quantity === 1 ? "unidade" : "unidades";
  const movement = direction === "in" ? "Entrada" : "Saída";

  return {
    status: "success",
    message: `${movement} de ${quantity.toLocaleString("pt-BR")} ${units}. Estoque atual: ${stock.toLocaleString("pt-BR")}.`,
  };
}
