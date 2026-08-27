import { BrowserRouter, Routes, Route, useLocation, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { Navbar, Footer } from "./client/components/Layout";
import ScrollToTop from "./client/components/ScrollToTop";
import { Home } from "./client/pages/Home";
import { About } from "./client/pages/About";
import { Medicines } from "./client/pages/Medicines";
import { Services } from "./client/pages/Services";
import { Facilities } from "./client/pages/Facilities";
import { FacilityDetail } from "./client/pages/FacilityDetail";
import ServiceDetail from "./client/pages/ServiceDetails";
import { OstrabacusProvider } from "./ai/OstrabacusContext";
import OstrabacusAssistant from "./ai/OstrabacusAssistant";

// Import Admin Dashboard components and pages
import AppLayout from "./dashboard/layout/AppLayout";
import DashboardHome from "./dashboard/pages/Dashboard/Home";
import AdminServices from "./dashboard/pages/Services";
import AdminMedicines from "./dashboard/pages/Medicines";
import Bookings from "./dashboard/pages/Bookings";
import Analytics from "./dashboard/pages/Analytics";
import UserProfile from "./dashboard/pages/UserProfile";
import AiSystem from "./dashboard/pages/AiSystem";

// Authentication context and guards
import { AuthProvider } from "./dashboard/context/AuthContext";
import ProtectedRoute from "./dashboard/components/auth/ProtectedRoute";
import GuestRoute from "./dashboard/components/auth/GuestRoute";
import Login from "./dashboard/pages/auth/Login";
import Register from "./dashboard/pages/auth/Register";

function RouteScroller() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />
      <main className="grow">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <OstrabacusProvider>
        <BrowserRouter>
          <RouteScroller />
          <ScrollToTop />
          <Routes>
            {/* Admin Dashboard Routes */}
            <Route path="/facility-dashboard" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardHome />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="medicines" element={<AdminMedicines />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="ai-system" element={<AiSystem />} />
            </Route>

            {/* Admin Auth Routes */}
            <Route element={<GuestRoute />}>
              <Route path="/facility-dashboard/login" element={<Login />} />
              <Route path="/facility-dashboard/register" element={<Register />} />
            </Route>

            {/* Public Website Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/medicines" element={<Medicines />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              <Route path="/facilities" element={<Facilities />} />
              <Route path="/facilities/:id" element={<FacilityDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/emergency" element={<Services />} />
            </Route>
          </Routes>
          <OstrabacusAssistant />
        </BrowserRouter>
      </OstrabacusProvider>
    </AuthProvider>
  );
}

