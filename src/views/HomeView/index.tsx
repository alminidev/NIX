import { IProduct } from "@/types/product";
import CTA from "@/views/HomeView/components/Cta";
import FAQ from "@/views/HomeView/components/FAQ";
import Features from "@/views/HomeView/components/Features";
import Footer from "@/views/HomeView/components/Footer";
import Header from "@/views/HomeView/components/Header";
import HeroStage from "@/views/HomeView/components/HeroStage";
import LogisticsBar from "@/views/HomeView/components/LogisticsBar";
import ProductGrid from "@/views/HomeView/components/ProductGrid";
import SkipLink from "@/views/HomeView/components/SkipLink";

interface IHomeViewProps {
  products: IProduct[];
}

export function HomeView({ products }: IHomeViewProps) {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main-content">
        <HeroStage />
        <ProductGrid products={products} />
        <LogisticsBar />
        <Features />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
