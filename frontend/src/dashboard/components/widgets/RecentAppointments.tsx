import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { Link } from "react-router-dom";

interface Booking {
  id: number;
  patientName: string;
  service: string;
  dateTime: string;
  status: "Confirmed" | "Pending" | "Completed";
  image: string;
}

const tableData: Booking[] = [
  {
    id: 1,
    patientName: "Jean Bosco Niyonsenga",
    service: "General Consultation",
    dateTime: "10 Jun 2026, 09:30 AM",
    status: "Confirmed",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: 2,
    patientName: "Marie Claire Uwase",
    service: "Pediatric Checkup",
    dateTime: "10 Jun 2026, 11:00 AM",
    status: "Pending",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: 3,
    patientName: "David Mugisha",
    service: "Lab Blood Test",
    dateTime: "10 Jun 2026, 02:15 PM",
    status: "Confirmed",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: 4,
    patientName: "Sandrine Umutoni",
    service: "Vaccine Administration",
    dateTime: "09 Jun 2026, 10:00 AM",
    status: "Completed",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: 5,
    patientName: "Emmanuel Hakizimana",
    service: "Cardiology Screening",
    dateTime: "09 Jun 2026, 04:30 PM",
    status: "Completed",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200",
  },
];

export const RecentAppointments = () => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Appointments
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/facility-dashboard/bookings" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            See all
          </Link>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Patient
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Service
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Date & Time
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {tableData.map((booking) => (
              <TableRow key={booking.id} className="">
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[44px] w-[44px] overflow-hidden rounded-lg bg-gray-100 shrink-0">
                      <img
                        src={booking.image}
                        className="h-[44px] w-[44px] object-cover"
                        alt={booking.patientName}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {booking.patientName}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {booking.service}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {booking.dateTime}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      booking.status === "Confirmed"
                        ? "success"
                        : booking.status === "Pending"
                        ? "warning"
                        : "error"
                    }
                  >
                    {booking.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
export default RecentAppointments;
