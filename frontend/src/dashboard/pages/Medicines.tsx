import { useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Badge from "../components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../components/ui/table";
import { Search, Plus, Trash2, Edit, CheckCircle } from "lucide-react";
import { Modal } from "../components/ui/modal";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";

interface MedicineItem {
  id: string;
  name: string;
  category: string;
  price: string;
  stockCount: number;
  availability: "In Stock" | "Low Stock" | "Out of Stock";
  description: string;
}

const initialMedicines: MedicineItem[] = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    category: "Analgesics / Pain Relief",
    price: "1,200 RWF",
    stockCount: 150,
    availability: "In Stock",
    description: "Used to treat mild to moderate pain and reduce fever.",
  },
  {
    id: "2",
    name: "Amoxicillin 250mg",
    category: "Antibiotics",
    price: "4,500 RWF",
    stockCount: 85,
    availability: "In Stock",
    description: "Antibiotic used to treat bacterial infections.",
  },
  {
    id: "3",
    name: "Ibuprofen 400mg",
    category: "Anti-inflammatory",
    price: "2,000 RWF",
    stockCount: 12,
    availability: "Low Stock",
    description: "Nonsteroidal anti-inflammatory drug used to reduce pain and swelling.",
  },
  {
    id: "4",
    name: "Metformin 850mg",
    category: "Antidiabetic",
    price: "8,000 RWF",
    stockCount: 200,
    availability: "In Stock",
    description: "First-line medication for the treatment of type 2 diabetes.",
  },
  {
    id: "5",
    name: "Atorvastatin 20mg",
    category: "Cardiovascular",
    price: "12,500 RWF",
    stockCount: 0,
    availability: "Out of Stock",
    description: "Statin medication used to prevent cardiovascular disease.",
  },
];

export default function Medicines() {
  const [medicines, setMedicines] = useState<MedicineItem[]>(initialMedicines);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<MedicineItem | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "Analgesics / Pain Relief",
    price: "",
    stockCount: 0,
    availability: "In Stock" as "In Stock" | "Low Stock" | "Out of Stock",
    description: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "stockCount" ? parseInt(value) || 0 : value
    }));
  };

  const openAddModal = () => {
    setEditingMedicine(null);
    setFormData({
      name: "",
      category: "Analgesics / Pain Relief",
      price: "",
      stockCount: 0,
      availability: "In Stock",
      description: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (medicine: MedicineItem) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      category: medicine.category,
      price: medicine.price,
      stockCount: medicine.stockCount,
      availability: medicine.availability,
      description: medicine.description,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this medicine from inventory?")) {
      setMedicines(prev => prev.filter(item => item.id !== id));
      triggerNotification("Medicine removed from catalog successfully!");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-calculate availability from stock count if count changed
    let calculatedAvailability: "In Stock" | "Low Stock" | "Out of Stock" = formData.availability;
    if (formData.stockCount === 0) {
      calculatedAvailability = "Out of Stock";
    } else if (formData.stockCount < 20) {
      calculatedAvailability = "Low Stock";
    } else {
      calculatedAvailability = "In Stock";
    }

    const payload = {
      ...formData,
      availability: calculatedAvailability,
    };

    if (editingMedicine) {
      // Update
      setMedicines(prev =>
        prev.map(item =>
          item.id === editingMedicine.id
            ? { ...item, ...payload }
            : item
        )
      );
      triggerNotification("Medicine catalog updated successfully!");
    } else {
      // Create
      const newMed: MedicineItem = {
        id: Date.now().toString(),
        ...payload,
      };
      setMedicines(prev => [...prev, newMed]);
      triggerNotification("New medicine registered in inventory successfully!");
    }
    setIsModalOpen(false);
  };

  const triggerNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const filteredMedicines = medicines.filter(
    item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <PageMeta
        title="Medicines Inventory Management | Smart Healthcare"
        description="Monitor pharmacy inventory, update retail prices, and log medicine stock status."
      />
      <PageBreadcrumb pageTitle="Medicines Inventory" />

      {successMessage && (
        <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-xl shadow-theme-sm transition animate-fade-in">
          <CheckCircle className="shrink-0 size-6" />
          <p className="font-semibold text-sm">{successMessage}</p>
        </div>
      )}

      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-theme-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <span className="absolute -translate-y-1/2 left-3.5 top-1/2 text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search medicines or categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-gray-800 dark:text-white"
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl px-5 py-2.5 font-medium text-sm transition"
          >
            <Plus size={18} />
            Add Medicine
          </button>
        </div>

        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.01]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs uppercase tracking-wider dark:text-gray-400">
                  Medicine Name & Description
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs uppercase tracking-wider dark:text-gray-400">
                  Category
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs uppercase tracking-wider dark:text-gray-400">
                  Retail Price
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs uppercase tracking-wider dark:text-gray-400">
                  Stock Count
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs uppercase tracking-wider dark:text-gray-400">
                  Availability
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-center text-theme-xs uppercase tracking-wider dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredMedicines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                    No medicines in stock registry.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMedicines.map(med => (
                  <TableRow key={med.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    <TableCell className="px-5 py-4 max-w-sm">
                      <div>
                        <span className="block font-medium text-gray-800 dark:text-white/90 text-sm">
                          {med.name}
                        </span>
                        <span className="block text-theme-xs text-gray-400 truncate mt-0.5" title={med.description}>
                          {med.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-300 text-sm">
                      {med.category}
                    </TableCell>
                    <TableCell className="px-5 py-4 font-semibold text-gray-800 dark:text-white/90 text-sm">
                      {med.price}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-300 text-sm">
                      {med.stockCount} units
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge
                        size="sm"
                        color={
                          med.availability === "In Stock"
                            ? "success"
                            : med.availability === "Low Stock"
                            ? "warning"
                            : "error"
                        }
                      >
                        {med.availability}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openEditModal(med)}
                          title="Edit Details"
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-teal-600 transition"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(med.id)}
                          title="Delete Medicine"
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-600 transition"
                        >
                          <Trash2 size={16} />
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

      {/* CRUD Modal Dialogue */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-[600px] m-4">
        <div className="relative w-full p-6 bg-white dark:bg-gray-900 rounded-3xl">
          <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
            {editingMedicine ? "Edit Medicine Details" : "Add Medicine to Catalog"}
          </h4>
          <p className="mb-6 text-xs text-gray-500 dark:text-gray-400">
            Input medicine specifications below to save directly to the inventory logs.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Medicine Name *</Label>
              <Input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Ibuprofen 400mg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-gray-800 dark:text-white"
                >
                  <option value="Analgesics / Pain Relief">Analgesics / Pain Relief</option>
                  <option value="Antibiotics">Antibiotics</option>
                  <option value="Anti-inflammatory">Anti-inflammatory</option>
                  <option value="Antidiabetic">Antidiabetic</option>
                  <option value="Cardiovascular">Cardiovascular</option>
                  <option value="Vitamins & Dietary Supplements">Vitamins & Supplements</option>
                </select>
              </div>

              <div>
                <Label>Retail Price *</Label>
                <Input
                  type="text"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="e.g., 2,500 RWF"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Stock Quantity *</Label>
                <Input
                  type="number"
                  name="stockCount"
                  required
                  value={formData.stockCount.toString()}
                  onChange={handleInputChange}
                  placeholder="e.g., 150"
                />
              </div>

              <div>
                <Label>Initial Availability *</Label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  disabled
                  className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none text-gray-400 cursor-not-allowed"
                >
                  <option value="In Stock">In Stock (Auto)</option>
                  <option value="Low Stock">Low Stock (Auto)</option>
                  <option value="Out of Stock">Out of Stock (Auto)</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Indications / Description</Label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Indicate active ingredients, side warnings, dosage limits..."
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-gray-800 dark:text-white resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <Button type="button" size="sm" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                {editingMedicine ? "Save Changes" : "Register Item"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
