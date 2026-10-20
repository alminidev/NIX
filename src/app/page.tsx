import SkipLink from '@/components/SkipLink';
import Header from '@/components/Header';
import HeroStage from '@/components/HeroStage';
import ProductGrid from '@/components/ProductGrid';
import LogisticsBar from '@/components/LogisticsBar';
import Diferenciais from '@/components/Diferenciais';
import FAQ from '@/components/FAQ';
import CtaFinal from '@/components/CtaFinal';
import Footer from '@/components/Footer';
import { getProducts } from '@/lib/products';

/**
 * Página Principal da NIX 3D (Single-page catalog).
 * Estrutura 1:1 idêntica ao HTML original (05-build/index.html).
 */
export default async function Home() {
  const products = await getProducts();

  return (
    <>
      <SkipLink />
      <Header />
      <main id="main-content">
        <HeroStage />
        <ProductGrid products={products} />
        <LogisticsBar />
        <Diferenciais />
        <FAQ />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}
