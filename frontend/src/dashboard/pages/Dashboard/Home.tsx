import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
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
          <EcommerceMetrics />
        </div>

        {/* Charts & Fulfillment */}
        <div className="col-span-12 xl:col-span-7">
          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        {/* Activity Trends */}
        <div className="col-span-12">
          <StatisticsChart />
        </div>

        {/* Demographics & Bookings */}
        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}
