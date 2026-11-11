import Footer from "@/views/HomeView/components/Footer";
import Header from "@/views/HomeView/components/Header";
import SkipLink from "@/views/HomeView/components/SkipLink";
import CartContent from "./CartContent";

export function CartView() {
  return (
    <>
      <SkipLink />
      <Header homePath="/" />
      <CartContent />
      <Footer />
    </>
  );
}
