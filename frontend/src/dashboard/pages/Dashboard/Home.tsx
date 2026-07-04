import HealthcareMetrics from "../../components/widgets/HealthcareMetrics";
// import MonthlyVisitsChart from "../../components/widgets/MonthlyVisitsChart";
// import ActivityTrendsChart from "../../components/widgets/ActivityTrendsChart";
// import AppointmentTarget from "../../components/widgets/AppointmentTarget";
import RecentAppointments from "../../components/widgets/RecentAppointments";
import DemographicCard from "../../components/widgets/DemographicCard";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Facility Admin Dashboard | Smart Healthcare"
        description="Manage services, medicines catalog, and bookings for your healthcare facility."
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Top Full-width Metrics Card */}
        <div className="col-span-12">
          <HealthcareMetrics />
        </div>

        {/* Charts & Fulfillment (Commented out for MVP) */}
        {/* <div className="col-span-12 xl:col-span-7">
          <MonthlyVisitsChart />
        </div> */}

        {/* <div className="col-span-12 xl:col-span-5">
          <AppointmentTarget />
        </div> */}

        {/* Activity Trends (Commented out for MVP) */}
        {/* <div className="col-span-12">
          <ActivityTrendsChart />
        </div> */}

        {/* Demographics & Bookings */}
        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentAppointments />
        </div>
      </div>
    </>
  );
}
