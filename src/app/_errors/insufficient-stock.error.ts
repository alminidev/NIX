import { AppError } from "./app.error";

export class InsufficientStockError extends AppError {
  constructor(productName: string, available: number) {
    super(
      available > 0
        ? `${productName}: só ${available === 1 ? "resta 1 unidade" : `restam ${available} unidades`} em estoque. Ajuste a quantidade no carrinho.`
        : `${productName} está sem estoque. Remova o produto do carrinho.`,
      409,
    );
  }
}
