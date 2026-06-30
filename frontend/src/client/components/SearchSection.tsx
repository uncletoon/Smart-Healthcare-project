import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, ChevronDown } from "lucide-react";

export interface SearchSectionProps {
  locations: Array<{ id: number; location_name: string }>;
  serviceCategories: Array<{ id: number; name: string }>;
  facilityCategories: Array<{ id: number; category_name: string }>;
  
  selectedLocation: string | number;
  selectedServiceCategory: string | number;
  selectedFacilityCategory: string | number;
  searchQuery: string;

  onLocationChange: (id: string | number) => void;
  onServiceCategoryChange: (id: string | number) => void;
  onFacilityCategoryChange: (id: string | number) => void;
  onSearchQueryChange: (query: string) => void;
}

interface DropdownProps {
  label: string;
  options: Array<{ id: string | number; name: string }>;
  selectedValue: string | number;
  onSelect: (value: string | number) => void;
  icon?: React.ReactNode;
}

function Dropdown({ label, options, selectedValue, onSelect, icon }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.id.toString() === selectedValue.toString());
  const displayLabel = selectedOption && selectedValue !== "all" ? selectedOption.name : label;
  const isSelected = selectedValue !== "all";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`text-xs md:text-sm px-4 py-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer font-bold ${
          isSelected
            ? "bg-secondary text-primary border-primary/20 shadow-sm"
            : "bg-surface text-text-muted border-black/5 hover:bg-black/5 hover:text-primary"
        }`}
      >
        {icon}
        <span>{displayLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 max-h-60 overflow-y-auto bg-white rounded-xl shadow-xl border border-black/5 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <button
            type="button"
            onClick={() => {
              onSelect("all");
              setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
              selectedValue === "all"
                ? "bg-secondary text-primary font-bold"
                : "text-text-main hover:bg-surface hover:text-primary"
            }`}
          >
            All {label}s
          </button>
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onSelect(option.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                selectedValue.toString() === option.id.toString()
                  ? "bg-secondary text-primary font-bold"
                  : "text-text-main hover:bg-surface hover:text-primary"
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchSection({
  locations,
  serviceCategories,
  facilityCategories,
  selectedLocation,
  selectedServiceCategory,
  selectedFacilityCategory,
  searchQuery,
  onLocationChange,
  onServiceCategoryChange,
  onFacilityCategoryChange,
  onSearchQueryChange,
}: SearchSectionProps) {
  return (
    <div className="w-full">
      {/* Dark Search Area with inline compact filters */}
      <div className="bg-primary py-10 px-6 mt-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-2 flex flex-col gap-2 relative">
            <div className="flex items-center gap-3 px-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Medical Services..."
                className="w-full py-3 outline-none text-text-main font-medium"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2 px-3 pt-3 border-t border-gray-100 justify-center">
              <Dropdown
                label="Facility Type"
                options={facilityCategories.map((f) => ({ id: f.id, name: f.category_name }))}
                selectedValue={selectedFacilityCategory}
                onSelect={onFacilityCategoryChange}
              />

              <Dropdown
                label="Location"
                options={locations.map((l) => ({ id: l.id, name: l.location_name }))}
                selectedValue={selectedLocation}
                onSelect={onLocationChange}
                icon={<MapPin className="w-3.5 h-3.5" />}
              />

              <Dropdown
                label="Service Type"
                options={serviceCategories.map((s) => ({ id: s.id, name: s.name }))}
                selectedValue={selectedServiceCategory}
                onSelect={onServiceCategoryChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
