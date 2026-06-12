import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { Activity, Users, Clock, Pill } from "lucide-react";

export default function Analytics() {
  // Chart 1: Monthly Patient Traffic
  const trafficOptions: ApexOptions = {
    colors: ["#004d40"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "40%",
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    grid: {
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      y: { formatter: (val: number) => `${val} patients` },
    },
  };

  const trafficSeries = [
    {
      name: "Patients Seen",
      data: [120, 150, 140, 180, 210, 230, 290, 220, 250, 310, 280, 340],
    },
  ];

  // Chart 2: Service Distribution (Donut)
  const serviceOptions: ApexOptions = {
    colors: ["#004d40", "#26a69a", "#008080", "#b2dfdb", "#00332c"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
    },
    labels: ["General Consultation", "Lab Blood Tests", "COVID-19 Swabs", "Vaccinations", "Dental Checks"],
    legend: {
      position: "bottom",
      fontSize: "13px",
    },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Services",
              color: "#374151",
              fontSize: "14px",
              fontWeight: "600",
              formatter: () => "412",
            },
          },
        },
      },
    },
  };

  const serviceSeries = [185, 95, 62, 45, 25];

  // Chart 3: Avg Consultation Wait Time (Line)
  const waitTimeOptions: ApexOptions = {
    colors: ["#26a69a"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "line",
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    markers: {
      size: 4,
    },
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `${val}m`,
      },
    },
    tooltip: {
      y: { formatter: (val: number) => `${val} minutes` },
    },
  };

  const waitTimeSeries = [
    {
      name: "Avg Wait Time",
      data: [25, 22, 35, 28, 30, 15, 12],
    },
  ];

  return (
    <>
      <PageMeta
        title="Facility Operations Analytics | Smart Healthcare"
        description="Review detailed monthly report charts, patient demographic counts, and popular service demands."
      />
      <PageBreadcrumb pageTitle="Operations Analytics" />

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-theme-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950/20 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Monthly Patients</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white/90 mt-0.5">340</p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-theme-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Avg Wait Time</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white/90 mt-0.5">23 mins</p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-theme-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <Activity size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Service Fulfillment</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white/90 mt-0.5">92.5%</p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-theme-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-xl flex items-center justify-center shrink-0">
            <Pill size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Prescriptions Filled</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white/90 mt-0.5">186</p>
          </div>
        </div>
      </div>

      {/* Charts grids */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-theme-xs">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Monthly Patient Visits</h3>
          <p className="text-xs text-gray-400 mb-6">Patient intake trends mapped over the last 12 calendar months.</p>
          <div className="max-w-full overflow-hidden">
            <Chart options={trafficOptions} series={trafficSeries} type="bar" height={300} />
          </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-theme-xs">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Service Breakdown</h3>
          <p className="text-xs text-gray-400 mb-6">Distribution of services booked by patients.</p>
          <div className="max-w-full overflow-hidden flex justify-center">
            <Chart options={serviceOptions} series={serviceSeries} type="donut" width="100%" height={320} />
          </div>
        </div>

        <div className="lg:col-span-12 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-theme-xs">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Weekly Consultation Wait Times</h3>
          <p className="text-xs text-gray-400 mb-6">Average minutes spent waiting by patients before receiving care.</p>
          <div className="max-w-full overflow-hidden">
            <Chart options={waitTimeOptions} series={waitTimeSeries} type="line" height={260} />
          </div>
        </div>
      </div>
    </>
  );
}
