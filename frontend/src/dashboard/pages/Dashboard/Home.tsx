import { useState, useEffect } from "react";
import HealthcareMetrics from "../../components/widgets/HealthcareMetrics";
import RecentAppointments from "../../components/widgets/RecentAppointments";
import DemographicCard from "../../components/widgets/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import { apiService, Booking } from "../../services/apiService";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [servicesCount, setServicesCount] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError("");
        
        // Fetch services and bookings in parallel
        const [servicesData, bookingsData] = await Promise.all([
          apiService.getServices(),
          apiService.getBookings(),
        ]);

        setServicesCount(servicesData.length);
        setBookings(bookingsData);
        
        const pending = bookingsData.filter((b) => b.status === "Pending").length;
        setPendingBookingsCount(pending);
      } catch (err: any) {
        console.error("Dashboard error:", err);
        setError("Failed to load dashboard data. Please verify your connection.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="animate-spin text-teal-600 size-10" />
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Facility Admin Dashboard | Smart Healthcare"
        description="Manage services, medicines catalog, and bookings for your healthcare facility."
      />
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Top Full-width Metrics Card */}
        <div className="col-span-12">
          <HealthcareMetrics
            servicesCount={servicesCount}
            pendingBookingsCount={pendingBookingsCount}
          />
        </div>

        {/* Demographics & Bookings */}
        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentAppointments bookings={bookings} />
        </div>
      </div>
    </>
  );
}
