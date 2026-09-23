import { Footer } from "@/components/layout/Footer";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { Header } from "@/components/layout/Header";
import { OurSchoolPage } from "@/components/pages/OurSchoolPage";
import { MaternellePage } from "@/components/pages/MaternellePage";
import { PrimairePage } from "@/components/pages/PrimairePage";
import { SchoolLifePage } from "@/components/pages/SchoolLifePage";
import { GalleryPage } from "@/components/pages/GalleryPage";
import { NewsPage } from "@/components/pages/NewsPage";
import { ContactPage } from "@/components/pages/ContactPage";
import { AdmissionsPage } from "@/components/pages/AdmissionsPage";
import { Admissions } from "@/components/sections/Admissions";
import { Activities } from "@/components/sections/Activities";
import { Contact } from "@/components/sections/Contact";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { News } from "@/components/sections/News";
import { Programs } from "@/components/sections/Programs";
import { Stats } from "@/components/sections/Stats";
import { Testimonials } from "@/components/sections/Testimonials";
import { Welcome } from "@/components/sections/Welcome";
import { WhyUs } from "@/components/sections/WhyUs";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { SCHOOL } from "@/data/school";

function HomePage() {
  useEffect(() => {
    document.title = `${SCHOOL.name} | Bertoua, Cameroun`;
    const meta = document.querySelector('meta[name="description"]');
    meta?.setAttribute(
      "content",
      "Groupe Scolaire Privé Bilingue La Pépinière à Bertoua, Cameroun : maternelle, primaire francophone et primaire anglophone.",
    );
  }, []);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Welcome />
        <Programs />
        <WhyUs />
        <Stats />
        <Activities />
        <Gallery />
        <Testimonials />
        <News />
        <Admissions />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/notre-ecole" element={<OurSchoolPage />} />
        <Route path="/maternelle" element={<MaternellePage />} />
        <Route path="/primaire" element={<PrimairePage />} />
        <Route path="/vie-scolaire" element={<SchoolLifePage />} />
        <Route path="/galerie" element={<GalleryPage />} />
        <Route path="/actualites" element={<NewsPage />} />
        <Route path="/admissions" element={<AdmissionsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <FloatingActions />
    </BrowserRouter>
  );
}

export default App;
