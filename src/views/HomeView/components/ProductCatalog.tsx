import { getProducts } from "@/lib/products";
import ProductGrid from "@/views/HomeView/components/ProductGrid";

export default async function ProductCatalog() {
  const products = await getProducts();

  return <ProductGrid products={products} />;
}
