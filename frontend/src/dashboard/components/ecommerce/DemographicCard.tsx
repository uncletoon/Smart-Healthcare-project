import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreVertical } from "lucide-react";

interface DemographicData {
  name: string;
  count: number;
  percentage: number;
  colorClass: string;
}

const demographicsData: DemographicData[] = [
  {
    name: "Adults (Age 18 - 59)",
    count: 245,
    percentage: 54,
    colorClass: "bg-teal-600",
  },
  {
    name: "Seniors (Age 60+)",
    count: 90,
    percentage: 20,
    colorClass: "bg-blue-600",
  },
  {
    name: "Children & Teens (Age 0 - 17)",
    count: 72,
    percentage: 16,
    colorClass: "bg-amber-500",
  },
  {
    name: "Infants (Under 1 year)",
    count: 45,
    percentage: 10,
    colorClass: "bg-purple-600",
  },
];

export default function DemographicCard() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Patient Demographics
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Age distribution of patients receiving care this month
            </p>
          </div>
          <div className="relative inline-block">
            <button className="dropdown-toggle" onClick={toggleDropdown}>
              <MoreVertical className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Export PDF
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        <div className="my-6 space-y-6">
          {demographicsData.map((demo) => (
            <div key={demo.name} className="space-y-2">
              <div className="flex justify-between items-center text-theme-sm">
                <span className="font-semibold text-gray-800 dark:text-white/90">
                  {demo.name}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {demo.count} patients ({demo.percentage}%)
                </span>
              </div>
              <div className="relative block h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full ${demo.colorClass}`}
                  style={{ width: `${demo.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 pt-4 text-center">
        <p className="text-theme-xs text-gray-400">
          Last updated: Today at 12:00 PM
        </p>
      </div>
    </div>
  );
}
