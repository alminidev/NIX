import FreshNavigation from "@/components/FreshNavigation";
import { CartView } from "@/views/CartView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carrinho — NIX 3D",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <FreshNavigation>
      <CartView />
    </FreshNavigation>
  );
}
