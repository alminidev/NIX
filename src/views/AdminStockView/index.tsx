import type { IStockProduct } from "@/types/admin-stock";
import StockList from "@/views/AdminStockView/components/StockList";
import Link from "next/link";

interface IAdminStockViewProps {
  products: IStockProduct[];
}

const unitsFormat = new Intl.NumberFormat("pt-BR");

export function AdminStockView({ products }: IAdminStockViewProps) {
  const units = products.reduce((total, product) => total + product.stock, 0);
  const withoutStock = products.filter((product) => product.stock === 0).length;

  return (
    <div className="flex w-full flex-1 flex-col gap-8">
      <div className="flex flex-col gap-4 min-[720px]:flex-row min-[720px]:items-end min-[720px]:justify-between">
        <header>
          <p className="mb-2 inline-block text-xs leading-[1.4] font-bold tracking-[0.08em] text-brand-blue-hover uppercase">
            Inventário
          </p>
          <h1 className="text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] text-ink-primary">
            Estoque
          </h1>
          <p className="mt-2 max-w-140 text-[0.9375rem] text-ink-secondary">
            {products.length === 0
              ? "Nenhum produto cadastrado para controlar estoque."
              : `${unitsFormat.format(units)} ${units === 1 ? "unidade" : "unidades"} em estoque${
                  withoutStock > 0
                    ? `. ${withoutStock} ${withoutStock === 1 ? "produto sem estoque" : "produtos sem estoque"}.`
                    : "."
                }`}
          </p>
        </header>

        <Link
          href="/admin/products"
          className="text-sm font-semibold text-brand-blue-hover"
        >
          Gerenciar produtos
        </Link>
      </div>

      <StockList products={products} />
    </div>
  );
}
