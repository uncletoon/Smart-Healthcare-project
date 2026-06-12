import { Pill, Activity, Calendar, Star, TrendingUp, TrendingDown } from "lucide-react";
import Badge from "../ui/badge/Badge";

export default function EcommerceMetrics() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
      {/* <!-- Offered Services Card --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs">
        <div className="flex items-center justify-center w-12 h-12 bg-teal-50 rounded-xl dark:bg-teal-950/20">
          <Activity className="text-teal-600 size-6" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Offered Services
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              8
            </h4>
          </div>
          <Badge color="success">
            Active
          </Badge>
        </div>
      </div>

      {/* <!-- Medicines Stock Card --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl dark:bg-blue-950/20">
          <Pill className="text-blue-600 size-6" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              In-Stock Medicines
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              45
            </h4>
          </div>

          <Badge color="success">
            <TrendingUp size={12} className="inline mr-1" />
            +12%
          </Badge>
        </div>
      </div>

      {/* <!-- Bookings Card --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs">
        <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-xl dark:bg-red-950/20">
          <Calendar className="text-red-600 size-6" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Pending Bookings
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              12
            </h4>
          </div>

          <Badge color="warning">
            Today
          </Badge>
        </div>
      </div>

      {/* <!-- Patient Rating Card --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs">
        <div className="flex items-center justify-center w-12 h-12 bg-amber-50 rounded-xl dark:bg-amber-950/20">
          <Star className="text-amber-600 fill-amber-500 size-6" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Patient Rating
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              4.8
            </h4>
          </div>

          <Badge color="success">
            Excellent
          </Badge>
        </div>
      </div>
    </div>
  );
}
