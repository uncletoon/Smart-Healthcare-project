import React, { useState, useEffect } from "react";
import { Search, Pill, ChevronDown, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { api } from "@/src/services/api";

interface Medicine {
  id: number | string;
  description?: string;
  medicine_name?: string;
  brand_name?: string;
  dosage?: string;
  generic_name?: string;
  category?: number | string | { id: number; name: string };
  price?: number;
  image?: string;
  [key: string]: any;
}

interface MedicineCategory {
  id: number;
  name: string;
  [key: string]: any;
}

export function Medicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<MedicineCategory[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);

  // Fetch medicines and categories on mount
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        setError(null);
        const [medicinesData, categoriesData] = await Promise.all([
          api.getMedicines(),
          api.getMedicineCategories(),
        ]);

        // Handle paginated or direct responses
        const medicinesList = Array.isArray(medicinesData)
          ? medicinesData
          : medicinesData.results || [];
        const categoriesList = Array.isArray(categoriesData)
          ? categoriesData
          : categoriesData.results || [];

        setMedicines(medicinesList);
        setCategories(categoriesList);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load medicines. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  // Filter medicines based on search input and selected category
  useEffect(() => {
    let result = medicines;

    // Filter by search input
    if (searchInput.trim()) {
      const searchLower = searchInput.toLowerCase().trim();
      result = result.filter((med) => {
        const searchFields = [
          med.medicine_name,
          med.description,
          med.dosage,
          med.generic_name,
        ];

        return searchFields.some(
          (field) => field && field.toLowerCase().includes(searchLower),
        );
      });
    }

    // Filter by selected category
    if (selectedCategory) {
      result = result.filter((med) => {
        const medCategory = med.category;
        if (typeof medCategory === "object") {
          return medCategory?.name === selectedCategory;
        }
        return (
          categories.find((c) => c.id === medCategory)?.name ===
          selectedCategory
        );
      });
    }

    setFilteredMedicines(result);
  }, [searchInput, selectedCategory, medicines, categories]);

  // Get unique category names for suggestions
  const suggestionCategories = categories.slice(0, 5);

  if (loading) {
    return (
      <div className="bg-surface min-h-screen py-8 flex items-center justify-center">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen py-8">
      <div className="container-custom">
        <h1 className="text-4xl font-display font-bold text-primary mb-6">
          Search Available Medicines
        </h1>

        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-start gap-3 border border-red-200 dark:border-red-800">
            <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
            <p className="text-red-600 dark:text-red-500">{error}</p>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-surface p-2 rounded-2xl shadow-lg border border-black/2 dark:border-primary/50 mb-8">
          <div className="flex items-center gap-4 px-4 py-2">
            <Search className="text-text-muted" size={24} />
            <input
              type="text"
              placeholder="Search for paracetamol, insulin, antibiotics..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-transparent outline-none text-lg text-primary placeholder:text-text-muted/50"
            />
          </div>
        </div>

        {/* Suggestions */}
        <div className="flex items-center gap-4 mb-6 overflow-x-auto no-scrollbar">
          <span className="text-sm font-medium text-text-muted whitespace-nowrap">
            Category :
          </span>
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCategory === null
                ? "bg-primary text-white"
                : "bg-black/5 dark:bg-white/10 text-primary hover:bg-gray-200 dark:hover:bg-white/20"
            }`}
          >
            All
          </button>
          {suggestionCategories.map((category) => (
            <button
              key={category.id}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === category.name ? null : category.name,
                )
              }
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === category.name
                  ? "bg-primary text-white"
                  : "bg-black/5 dark:bg-white/10 text-primary hover:bg-gray-200 dark:hover:bg-white/20"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Medicine List */}
        <div className="space-y-4">
          {filteredMedicines.length > 0 ? (
            filteredMedicines.map((med, idx) => (
              <motion.div
                key={med.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-surface p-4 rounded-[12px] shadow-sm border border-black/5 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
                    {med.image ? (
                      <img
                        src={med.image}
                        alt={med.medicine_name || "Medicine image"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : null}
                    <Pill className="text-primary" size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary">
                      {med.medicine_name || "Medicine"}
                    </h3>
                    {(med.brand_name || med.dosage || med.generic_name) && (
                      <p className="text-text-muted flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 bg-primary/30 rounded-full" />
                        {med.brand_name || med.dosage || med.generic_name}
                      </p>
                    )}
                    {typeof med.category === "object" && med.category?.name ? (
                      <p className="text-text-muted/70 text-xs mt-1">
                        Category: {med.category.name}
                      </p>
                    ) : typeof med.category === "string" ? (
                      <p className="text-text-muted/70 text-xs mt-1">
                        Category: {med.category}
                      </p>
                    ) : typeof med.category === "number" ? (
                      <p className="text-text-muted/70 text-xs mt-1">
                        Category:{" "}
                        {categories.find((c) => c.id === med.category)?.name ||
                          "Unknown"}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center justify-between w-full md:w-auto md:gap-16">
                  <div className="text-right">
                    <p className="text-2xl font-display font-bold text-primary">
                      {(med.price || 5000).toLocaleString()} RWF
                    </p>
                    <span className="text-[10px] font-bold text-green-600 tracking-widest uppercase">
                      Available
                    </span>
                  </div>
                  <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-light transition-colors">
                    Details
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No medicine found
              </h3>
              <p className="text-gray-500">
                We couldn't find any medicine matching your criteria.
              </p>
            </div>
          )}
        </div>

        {filteredMedicines.length > 10 && (
          <div className="mt-12 flex justify-center">
            <button className="flex items-center gap-2 px-8 py-4 bg-black/5 dark:bg-white/10 text-primary font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
              Load more medicines <ChevronDown size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
