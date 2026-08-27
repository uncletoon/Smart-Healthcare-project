import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { apiService, Service } from "../services/apiService";
import { useAuth } from "../hooks/useAuth";
import {
  Sparkles,
  TrendingUp,
  Settings,
  AlertCircle,
  Ban,
  MessageSquare,
  CheckCircle2,
  Sliders,
  Database,
  Volume2
} from "lucide-react";

interface InteractionLog {
  id: string;
  query: string;
  intent: string;
  executionStrategy: string;
  timestamp: string;
}

export default function AiSystem() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "superAdmin";

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // AI Configuration States (synced with backend API)
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiBookingsAllowed, setAiBookingsAllowed] = useState(true);
  const [disabledServices, setDisabledServices] = useState<string[]>([]);

  // Analytics Logs States
  const [logs, setLogs] = useState<InteractionLog[]>([]);

  // Fetch logs from backend API on mount
  useEffect(() => {
    async function fetchLogs() {
      try {
        const token = localStorage.getItem("admin_token");
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Token ${token}`;
        
        const res = await fetch("/api/auth/ai-log/", { headers });
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (e) {
        console.error("Failed to fetch logs from server", e);
      }
    }
    fetchLogs();
  }, []);

  // Fetch Services from API
  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        setError("");
        const data = await apiService.getServices();
        setServices(data);
      } catch (err: any) {
        setError(err.message || "Failed to load services configuration.");
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  // Fetch config from backend API on mount
  useEffect(() => {
    async function fetchConfig() {
      try {
        const token = localStorage.getItem("admin_token");
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Token ${token}`;
        
        const res = await fetch("/api/auth/ai-config/", { headers });
        if (res.ok) {
          const data = await res.json();
          setAiEnabled(data.ostrabacus_ai_enabled);
          setAiBookingsAllowed(data.ostrabacus_ai_bookings_allowed);
          setDisabledServices(data.ostrabacus_disabled_services || []);
        }
      } catch (e) {
        console.error("Failed to fetch AI configuration from server", e);
      }
    }
    fetchConfig();
  }, []);

  // Save Configuration to Backend API
  const handleSaveConfig = async () => {
    try {
      setError("");
      const token = localStorage.getItem("admin_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Token ${token}`;

      const payload = {
        ostrabacus_ai_enabled: aiEnabled,
        ostrabacus_ai_bookings_allowed: aiBookingsAllowed,
        ostrabacus_disabled_services: disabledServices
      };

      const res = await fetch("/api/auth/ai-config/", {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setAiEnabled(data.ostrabacus_ai_enabled);
        setAiBookingsAllowed(data.ostrabacus_ai_bookings_allowed);
        setDisabledServices(data.ostrabacus_disabled_services || []);

        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          window.location.reload(); // Reload the entire page to reflect changes across profiles
        }, 1500);
      } else {
        const err = await res.json().catch(() => null);
        setError(err?.detail || "Failed to save configurations.");
      }
    } catch (e) {
      setError("Network error while saving configurations.");
    }
  };

  const toggleServiceAi = (serviceId: string) => {
    setDisabledServices((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  // Calculations for Insights (Clean live metrics, no static offsets)
  const totalInteractions = logs.length;
  const totalVoiceCommands = logs.filter(l => !l.query.toLowerCase().includes("typed")).length;
  const totalPrefills = logs.filter((l) => l.intent === "PREFILL_BOOKING").length;
  const totalBlocked = logs.filter((l) => l.executionStrategy === "BLOCKED").length;

  // Chart configuration: Daily interaction trends
  const getDailyLogCounts = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    logs.forEach(log => {
      const date = new Date(log.timestamp);
      const dayName = days[date.getDay()] as keyof typeof counts;
      if (counts[dayName] !== undefined) {
        counts[dayName]++;
      }
    });
    return [counts.Mon, counts.Tue, counts.Wed, counts.Thu, counts.Fri, counts.Sat, counts.Sun];
  };

  const trendOptions: ApexOptions = {
    colors: ["#26a69a"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "rgba(0, 0, 0, 0.05)",
      strokeDashArray: 3,
    },
  };

  const trendSeries = [
    {
      name: "AI Interactions",
      data: getDailyLogCounts(),
    },
  ];

  const mainColSpan = isSuperAdmin ? "lg:col-span-8" : "lg:col-span-12";

  return (
    <>
      <PageMeta
        title="Ostrabacus AI System | Smart Healthcare"
        description="Monitor how patients interact with Ostrabacus AI voice assistant and control AI booking permissions."
      />
      <PageBreadcrumb pageTitle="AI System Dashboard" />

      {/* Top Notification Toast */}
      {saveSuccess && (
        <div className="fixed top-6 right-6 z-[9999] bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in">
          <CheckCircle2 size={20} />
          <span className="font-semibold text-sm">AI Configurations Saved Successfully!</span>
        </div>
      )}

      {/* Metric Cards Row (Super Admin Only) */}
      {isSuperAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-theme-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Total Interactions</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white mt-0.5">{totalInteractions}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-theme-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
              <Volume2 size={22} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Voice Sessions</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white mt-0.5">{totalVoiceCommands}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-theme-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Booking Prefills</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white mt-0.5">{totalPrefills}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-theme-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center shrink-0">
              <Ban size={22} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Denied Requests</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white mt-0.5">{totalBlocked}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main dashboard content grids */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Analytics Left: Charts */}
        <div className={`${mainColSpan} space-y-8`}>
          
          {/* Interaction Trend Line Chart (Super Admin Only) */}
          {isSuperAdmin && (
            <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-theme-xs">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Interaction Frequency</h3>
                  <p className="text-xs text-gray-400">Total Ostrabacus AI usage trends monitored weekly.</p>
                </div>
              </div>
              <div className="max-w-full overflow-hidden">
                <Chart options={trendOptions} series={trendSeries} type="area" height={280} />
              </div>
            </div>
          )}

          {/* Service Settings Table */}
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-theme-xs">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                  <Sliders className="text-teal-500" size={18} />
                  Service AI Permissions
                </h3>
                <p className="text-xs text-gray-400">Restrict or allow patients to pre-fill specific medical services using Ostrabacus voice commands.</p>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-gray-400 mt-3">Loading services permissions…</span>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  <thead>
                    <tr className="text-left font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-3">
                      <th className="py-3 font-semibold">Service Name</th>
                      <th className="py-3 font-semibold">Base Price</th>
                      <th className="py-3 font-semibold">Voice Booking Status</th>
                      <th className="py-3 text-right font-semibold">Action Toggle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {services.map((service) => {
                      const isServiceAllowed = !disabledServices.includes(String(service.id));
                      return (
                        <tr key={service.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                          <td className="py-3.5 font-medium text-gray-800 dark:text-white/90">
                            {service.name}
                          </td>
                          <td className="py-3.5 text-gray-500 dark:text-gray-400">
                            {service.price} RWF
                          </td>
                          <td className="py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                              isServiceAllowed
                                ? "bg-green-500/10 text-green-500"
                                : "bg-red-500/10 text-red-500"
                            }`}>
                              {isServiceAllowed ? "AI Allowed" : "AI Blocked"}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => toggleServiceAi(String(service.id))}
                              className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-colors ${
                                isServiceAllowed
                                  ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
                                  : "bg-teal-500/10 border-teal-500/20 text-teal-500 hover:bg-teal-500/20"
                              }`}
                            >
                              {isServiceAllowed ? "Disable AI" : "Enable AI"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSaveConfig}
                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-5 py-2 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Database size={14} />
                    Save Service Permissions
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>        {/* Analytics Right: Global Config (Super Admin Only) */}
        {isSuperAdmin && (
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-theme-xs">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2 mb-4">
                <Settings className="text-teal-500" size={18} />
                Global Settings
              </h3>
              <p className="text-xs text-gray-400 mb-6">Manage global behavioral toggles for the Ostrabacus Accessibility Widget.</p>

              <div className="space-y-6 mb-8">
                {/* Toggle 1: Enable AI globally */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-800 dark:text-white/90">Enable Accessibility Widget</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Toggle whether Ostrabacus Floating Assistant (Alt+A) runs on pages.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={aiEnabled}
                      onChange={(e) => setAiEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 dark:bg-gray-800 rounded-full peer peer-focus:ring-2 peer-focus:ring-teal-500/20 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>

                {/* Toggle 2: Allow bookings */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-800 dark:text-white/90 font-medium">Allow AI Appointments</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Permit patients to complete form pre-filling and bookings entirely by voice commands.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={aiBookingsAllowed}
                      onChange={(e) => setAiBookingsAllowed(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 dark:bg-gray-800 rounded-full peer peer-focus:ring-2 peer-focus:ring-teal-500/20 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              </div>

              <button
                onClick={handleSaveConfig}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-2.5 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Database size={14} />
                Save Configurations
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Table: Recent Interaction Logs (Super Admin Only) */}
      {isSuperAdmin && (
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-theme-xs mb-8">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2 mb-4">
            <MessageSquare className="text-teal-500" size={18} />
            Recent Interaction Logs
          </h3>
          <p className="text-xs text-gray-400 mb-6">Real-time transcripts matched by Ostrabacus. Any interactions with the floating assistant are logged here live.</p>

          {logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                <thead>
                  <tr className="text-left font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-3">
                    <th className="py-3 font-semibold">User Command / Query</th>
                    <th className="py-3 font-semibold">Detected Intent</th>
                    <th className="py-3 font-semibold">Status</th>
                    <th className="py-3 text-right font-semibold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {logs.slice().reverse().map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                      <td className="py-3.5 font-medium text-gray-800 dark:text-white/90 max-w-xs truncate" title={log.query}>
                        "{log.query}"
                      </td>
                      <td className="py-3.5 font-semibold text-teal-600 dark:text-teal-400">
                        {log.intent}
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                          log.executionStrategy === "BLOCKED"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-green-500/10 text-green-500"
                        }`}>
                          {log.executionStrategy}
                        </span>
                      </td>
                      <td className="py-3.5 text-right text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare size={32} className="text-gray-300 dark:text-gray-700 mb-3" />
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">No interaction history</p>
              <p className="text-xs text-gray-400 mt-1">Interactions with the Ostrabacus assistant will appear here in real time.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
