import CTA from "@/views/HomeView/components/Cta";
import FAQ from "@/views/HomeView/components/FAQ";
import Features from "@/views/HomeView/components/Features";
import Footer from "@/views/HomeView/components/Footer";
import Header from "@/views/HomeView/components/Header";
import HeroStage from "@/views/HomeView/components/HeroStage";
import LogisticsBar from "@/views/HomeView/components/LogisticsBar";
import ProductSection from "@/views/HomeView/components/ProductSection";
import SkipLink from "@/views/HomeView/components/SkipLink";

export function HomeView() {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main-content">
        <HeroStage />
        <ProductSection />
        <LogisticsBar />
        <Features />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
