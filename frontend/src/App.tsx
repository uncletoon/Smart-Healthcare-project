import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Navbar, Footer } from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import { Home } from "./pages/Home";
import { Medicines } from "./pages/Medicines";
import { Services } from "./pages/Services";
import { Facilities } from "./pages/Facilities";
import { FacilityDetail } from "./pages/FacilityDetail";
import ServiceDetail from "./pages/ServiceDetails";

function RouteScroller() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <BrowserRouter>
        <RouteScroller />
        <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/medicines" element={<Medicines />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              <Route path="/facilities" element={<Facilities />} />
              <Route path="/facilities/:id" element={<FacilityDetail />} />
              {/* Fallback for Emergency (could be a modal or separate page) */}
              <Route path="/emergency" element={<Services />} />
            </Routes>
          </main>
          <Footer />
          <ScrollToTop />
        </div>
      </BrowserRouter>
    </>
  );
}
