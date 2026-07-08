import { useState, useEffect } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Badge from "../components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../components/ui/table";
import { Search, Eye, Calendar, Phone, Clock, User, FileText, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { apiService, Booking } from "../services/apiService";
import { Modal } from "../components/ui/modal";
import Button from "../components/ui/button/Button";

const formatDateTime = (isoString: string) => {
  try {
    const d = new Date(isoString);
    return d.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } catch {
    return isoString;
  }
};

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | "Pending" | "Confirmed" | "Completed" | "Cancelled">("All");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadBookings() {
    try {
      setLoading(true);
      setError("");
      const data = await apiService.getBookings();
      setBookings(data);
    } catch (err: any) {
      console.error("Bookings load error:", err);
      setError("Failed to load bookings. Please check your authentication.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  const handleUpdateStatus = async (id: number, nextStatus: Booking["status"]) => {
    try {
      const updated = await apiService.updateBookingStatus(id, nextStatus);
      setBookings(prev => prev.map(item => item.id === id ? updated : item));
      
      // Update selected booking inside modal view to reflect changes instantly
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking(updated);
      }
    } catch (err) {
      alert("Failed to update booking status.");
    }
  };

  const openDetailModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const getFilteredBookings = () => {
    return bookings.filter(item => {
      const matchesSearch =
        item.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.service_name.toLowerCase().includes(searchQuery.toLowerCase());
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
        title="Bookings Management | Smart Healthcare"
        description="Review, confirm, cancel, and manage patient appointments booked at your facility."
      />
      <PageBreadcrumb pageTitle="Patient Bookings" />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

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
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider text-blue-600">Confirmed</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">{stats.confirmed}</p>
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
                          {booking.patient_name}
                        </span>
                        <span className="flex items-center gap-1 text-theme-xs text-gray-500 dark:text-gray-400 mt-1">
                          <Phone size={12} className="text-gray-400" />
                          {booking.phone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-300 text-sm">
                      {booking.service_name}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 text-sm">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDateTime(booking.date_time)}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge
                        size="sm"
                        color={
                          booking.status === "Completed"
                            ? "success"
                            : booking.status === "Confirmed"
                            ? "primary"
                            : booking.status === "Pending"
                            ? "warning"
                            : "error"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-theme-xs max-w-xs truncate">
                      <span title={booking.notes}>{booking.notes || "N/A"}</span>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openDetailModal(booking)}
                          title="View Ticket Details"
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-teal-600 transition"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Ticket Details Modal */}
      {selectedBooking && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          className="max-w-md m-4"
        >
          <div className="relative w-full bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
            {/* Header Ticket Pattern */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 dark:from-teal-800 dark:to-teal-950 p-6 text-white text-center relative">
              <h4 className="text-lg font-bold uppercase tracking-wider">Appointment Ticket</h4>
              <p className="text-xs opacity-80 mt-1">Smart Healthcare Registry</p>
              
              <div className="absolute left-0 bottom-0 w-full overflow-hidden leading-none translate-y-px">
                <svg className="relative block w-full h-[8px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
                  <path d="M0,0V46.29c47.79-22.2,103.59-22.2,151.38,0c47.8,22.2,103.6,22.2,151.4,0c47.8-22.2,103.6-22.2,151.4,0c47.8,22.2,103.6,22.2,151.4,0c47.8-22.2,103.6-22.2,151.4,0c47.8,22.2,103.6,22.2,151.4,0c47.8-22.2,103.6-22.2,151.4,0c47.8,22.2,103.6,22.2,151.4,0V0H0Z" fill="currentColor" className="text-white dark:text-gray-900"></path>
                </svg>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Ticket Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-dashed border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-400 uppercase font-semibold">Booking ID</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white">#{selectedBooking.id}</span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-dashed border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-400 uppercase font-semibold">Status</span>
                  <Badge
                    size="sm"
                    color={
                      selectedBooking.status === "Completed"
                        ? "success"
                        : selectedBooking.status === "Confirmed"
                        ? "primary"
                        : selectedBooking.status === "Pending"
                        ? "warning"
                        : "error"
                    }
                  >
                    {selectedBooking.status}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-gray-400 uppercase font-semibold block">Patient Info</span>
                  <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-white">
                    <User size={14} className="text-teal-600" />
                    <span className="font-semibold">{selectedBooking.patient_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Phone size={12} />
                    <span>{selectedBooking.phone}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-gray-400 uppercase font-semibold block">Requested Service</span>
                  <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-white">
                    <Clock size={14} className="text-teal-600" />
                    <span>{selectedBooking.service_name}</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block">{selectedBooking.facility_name}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-gray-400 uppercase font-semibold block">Schedule Time</span>
                  <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-white">
                    <Calendar size={14} className="text-teal-600" />
                    <span>{formatDateTime(selectedBooking.date_time)}</span>
                  </div>
                </div>

                <div className="space-y-1 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-400 uppercase font-semibold block mb-1">Patient Notes</span>
                  <p className="text-xs text-gray-600 dark:text-gray-300 italic">
                    "{selectedBooking.notes || "No special instructions provided by the patient."}"
                  </p>
                </div>
              </div>

              {/* Action Operations */}
              <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                {selectedBooking.status === "Pending" && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleUpdateStatus(selectedBooking.id, "Cancelled")}
                      variant="outline"
                      className="flex-1 border-red-200 dark:border-red-900 bg-red-50/10 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <XCircle size={14} />
                      Cancel Booking
                    </Button>
                    <Button
                      onClick={() => handleUpdateStatus(selectedBooking.id, "Confirmed")}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={14} />
                      Confirm Booking
                    </Button>
                  </div>
                )}

                {selectedBooking.status === "Confirmed" && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleUpdateStatus(selectedBooking.id, "Cancelled")}
                      variant="outline"
                      className="flex-1 border-red-200 dark:border-red-900 bg-red-50/10 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <XCircle size={14} />
                      Cancel Booking
                    </Button>
                    <Button
                      onClick={() => handleUpdateStatus(selectedBooking.id, "Completed")}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={14} />
                      Complete Checkup
                    </Button>
                  </div>
                )}

                {(selectedBooking.status === "Completed" || selectedBooking.status === "Cancelled") && (
                  <div className="text-center py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-xl text-xs font-semibold uppercase tracking-wider border border-gray-100 dark:border-gray-800">
                    Processed / Archived
                  </div>
                )}

                <Button
                  onClick={() => setIsDetailModalOpen(false)}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-semibold py-2 rounded-xl mt-2"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
