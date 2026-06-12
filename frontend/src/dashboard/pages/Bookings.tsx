import { useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Badge from "../components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../components/ui/table";
import { Search, Check, X, Calendar, Phone, CheckCircle2 } from "lucide-react";

interface BookingItem {
  id: string;
  patientName: string;
  serviceName: string;
  dateTime: string;
  phone: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  notes: string;
}

const initialBookings: BookingItem[] = [
  {
    id: "1",
    patientName: "Jean Bosco Niyonsenga",
    serviceName: "General Consultation",
    dateTime: "10 Jun 2026, 09:30 AM",
    phone: "+250 788 123 456",
    status: "Confirmed",
    notes: "Requires follow-up check on blood pressure prescription.",
  },
  {
    id: "2",
    patientName: "Marie Claire Uwase",
    serviceName: "Pediatric Checkup",
    dateTime: "10 Jun 2026, 11:00 AM",
    phone: "+250 785 987 654",
    status: "Pending",
    notes: "Immunization card review and height/weight tracker.",
  },
  {
    id: "3",
    patientName: "David Mugisha",
    serviceName: "Lab Blood Test",
    dateTime: "10 Jun 2026, 02:15 PM",
    phone: "+250 783 111 222",
    status: "Confirmed",
    notes: "Fasting lipid panel and glucose levels lab referral.",
  },
  {
    id: "4",
    patientName: "Sandrine Umutoni",
    serviceName: "Vaccine Administration",
    dateTime: "09 Jun 2026, 10:00 AM",
    phone: "+250 789 444 555",
    status: "Completed",
    notes: "Administered booster vaccine. Patient observed for 15m. Normal.",
  },
  {
    id: "5",
    patientName: "Emmanuel Hakizimana",
    serviceName: "Cardiology Screening",
    dateTime: "09 Jun 2026, 04:30 PM",
    phone: "+250 786 555 777",
    status: "Completed",
    notes: "ECG scan completed. Results forwarded to referral doctor.",
  },
  {
    id: "6",
    patientName: "Divine Mutesi",
    serviceName: "Dental Cleaning & Hygiene",
    dateTime: "11 Jun 2026, 08:30 AM",
    phone: "+250 787 333 444",
    status: "Pending",
    notes: "Complaining of toothache on lower-right quadrant.",
  },
  {
    id: "7",
    patientName: "Eric Ndahimana",
    serviceName: "COVID-19 PCR Testing",
    dateTime: "08 Jun 2026, 01:00 PM",
    phone: "+250 782 888 999",
    status: "Cancelled",
    notes: "Patient cancelled due to flight change.",
  },
];

export default function Bookings() {
  const [bookings, setBookings] = useState<BookingItem[]>(initialBookings);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | "Pending" | "Confirmed" | "Completed" | "Cancelled">("All");

  const updateStatus = (id: string, nextStatus: "Confirmed" | "Completed" | "Cancelled") => {
    setBookings(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: nextStatus } : item
      )
    );
  };

  const getFilteredBookings = () => {
    return bookings.filter(item => {
      const matchesSearch =
        item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === "All" || item.status === activeTab;
      return matchesSearch && matchesTab;
    });
  };

  const getStats = () => {
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === "Pending").length,
      confirmed: bookings.filter(b => b.status === "Confirmed").length,
      completed: bookings.filter(b => b.status === "Completed").length,
    };
  };

  const stats = getStats();
  const filteredBookings = getFilteredBookings();

  return (
    <>
      <PageMeta
        title="Bookings Management | Smart Healthcare"
        description="Review, confirm, cancel, and manage patient appointments booked at your facility."
      />
      <PageBreadcrumb pageTitle="Patient Bookings" />

      {/* Mini Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-theme-xs">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Total Bookings</p>
          <p className="text-2xl font-bold mt-1 text-gray-800 dark:text-white/90">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-theme-xs">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider text-amber-600">Pending Review</p>
          <p className="text-2xl font-bold mt-1 text-amber-600">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-theme-xs">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider text-teal-600">Confirmed</p>
          <p className="text-2xl font-bold mt-1 text-teal-600">{stats.confirmed}</p>
        </div>
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-theme-xs">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider text-green-600">Completed</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{stats.completed}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-theme-xs">
        {/* Tabs and Search */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
            {(["All", "Pending", "Confirmed", "Completed", "Cancelled"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition shrink-0 ${
                  activeTab === tab
                    ? "bg-brand-500 text-white shadow-theme-xs"
                    : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full xl:w-96">
            <span className="absolute -translate-y-1/2 left-3.5 top-1/2 text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search patients or services..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Bookings Table */}
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.01]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs uppercase tracking-wider dark:text-gray-400">
                  Patient & Phone
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs uppercase tracking-wider dark:text-gray-400">
                  Service Requested
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs uppercase tracking-wider dark:text-gray-400">
                  Appointment Time
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs uppercase tracking-wider dark:text-gray-400">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs uppercase tracking-wider dark:text-gray-400">
                  Notes
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-center text-theme-xs uppercase tracking-wider dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                    No matching booking logs found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map(booking => (
                  <TableRow key={booking.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    <TableCell className="px-5 py-4">
                      <div>
                        <span className="block font-semibold text-gray-800 dark:text-white/90 text-sm">
                          {booking.patientName}
                        </span>
                        <span className="flex items-center gap-1 text-theme-xs text-gray-500 dark:text-gray-400 mt-1">
                          <Phone size={12} className="text-gray-400" />
                          {booking.phone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-300 text-sm">
                      {booking.serviceName}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 text-sm">
                        <Calendar size={14} className="text-gray-400" />
                        {booking.dateTime}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge
                        size="sm"
                        color={
                          booking.status === "Completed"
                            ? "success"
                            : booking.status === "Confirmed"
                            ? "info"
                            : booking.status === "Pending"
                            ? "warning"
                            : "error"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-theme-xs max-w-xs truncate">
                      <span title={booking.notes}>{booking.notes}</span>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {booking.status === "Pending" && (
                          <>
                            <button
                              onClick={() => updateStatus(booking.id, "Confirmed")}
                              title="Confirm Appointment"
                              className="p-1.5 rounded-lg border border-teal-200 dark:border-teal-900 bg-teal-50 dark:bg-teal-950/20 text-teal-600 hover:bg-teal-100 transition"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => updateStatus(booking.id, "Cancelled")}
                              title="Cancel Appointment"
                              className="p-1.5 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 transition"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                        {booking.status === "Confirmed" && (
                          <>
                            <button
                              onClick={() => updateStatus(booking.id, "Completed")}
                              title="Mark as Completed"
                              className="p-1.5 rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20 text-green-600 hover:bg-green-100 transition flex items-center gap-1 px-2.5 py-1 text-xs font-semibold"
                            >
                              <CheckCircle2 size={12} />
                              Complete
                            </button>
                          </>
                        )}
                        {(booking.status === "Completed" || booking.status === "Cancelled") && (
                          <span className="text-gray-400 text-theme-xs font-semibold uppercase tracking-wider">Archived</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
